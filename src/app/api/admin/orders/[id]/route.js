// src/app/api/admin/orders/[id]/route.js
//
// GET   /api/admin/orders/:id
// Returns full order detail including the complete audit log for staff and admin only.
//
// PATCH /api/admin/orders/:id
// Two responsibilities handled in one route:
//   1. Standard field updates (status, notes, pickup_date, deposit_paid_cents)
//      — writes one audit log row per changed field.
//   2. Actual weight submission (actual_weights array)
//      — updates actual_weight_kg + subtotal_cents on each order_item,
//        recalculates orders.total_cents, and writes audit log rows.
// When status is changed to COMPLETED, sends a feedback request email to the customer.

import { NextResponse }              from 'next/server'
import { withHandler }               from '@/lib/middleware/withHandler'
import { createClient }              from '@/lib/supabase-server'
import { supabaseAdmin }             from '@/lib/supabase-admin'
import { getAdminOrderById, adminUpdateOrder } from '@/lib/db/admin'
import { sendFeedbackRequestEmail }  from '@/lib/email/feedbackRequest'
import { sendOrderStatusEmail }      from '@/lib/email/orderStatus'

// ─── Auth helper ──────────────────────────────────────────────────────────────

async function getAdminUser() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) return { user: null, error: 'unauthenticated' }

  const { data: profile } = await supabaseAdmin
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!['ADMIN', 'STAFF'].includes(profile?.role)) return { user: null, error: 'forbidden' }

  return { user, error: null }
}

// ─── GET ──────────────────────────────────────────────────────────────────────

export const GET = withHandler(async (request, { params }) => {
  const { id } = await params

  const { user, error: authErr } = await getAdminUser()
  if (authErr === 'unauthenticated') {
    return NextResponse.json({ error: 'Unauthorised — please log in' }, { status: 401 })
  }
  if (authErr === 'forbidden') {
    return NextResponse.json({ error: 'Access denied — staff and admin only' }, { status: 403 })
  }

  const { data, error } = await getAdminOrderById(id)

  if (error) throw error
  if (!data) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  return NextResponse.json({ order: data })
})

// ─── PATCH ────────────────────────────────────────────────────────────────────

const adminUpdateSchema = {
  types: {
    status:             'string',
    notes:              'string',
    pickup_date:        'string',
    deposit_paid_cents: 'number',
    reason:             'string',
    actual_weights:     'array',   // [{ order_item_id, actual_weight_kg }]
  },
  validators: {
    status: (val) => {
      const valid = ['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'READY', 'COMPLETED', 'CANCELLED']
      return valid.includes(val) ? null : `Must be one of: ${valid.join(', ')}`
    },
    actual_weights: (val) => {
      for (const entry of val) {
        if (!entry.order_item_id) return 'Each entry must have order_item_id'
        if (typeof entry.actual_weight_kg !== 'number' || entry.actual_weight_kg < 0) {
          return 'actual_weight_kg must be a non-negative number'
        }
      }
      return null
    },
  },
}

export const PATCH = withHandler(
  async (request, { params }) => {
    const { id } = await params

    const { user, error: authErr } = await getAdminUser()
    if (authErr === 'unauthenticated') {
      return NextResponse.json({ error: 'Unauthorised — please log in' }, { status: 401 })
    }
    if (authErr === 'forbidden') {
      return NextResponse.json({ error: 'Access denied — staff and admin only' }, { status: 403 })
    }

    const { reason, actual_weights, ...fields } = request._body

    // ── Branch A: actual weight submission ────────────────────────────────────
    if (actual_weights && actual_weights.length > 0) {
      const result = await saveActualWeights({
        orderId: id,
        actualWeights: actual_weights,
        changedBy: user.id,
      })

      if (result.error) {
        return NextResponse.json({ error: result.error }, { status: 400 })
      }

      // Re-fetch the full order so the frontend gets fresh data
      const { data: refreshed } = await getAdminOrderById(id)
      return NextResponse.json({ order: refreshed })
    }

    // ── Branch B: standard field updates (status, notes, etc.) ────────────────
    if (!Object.keys(fields).length) {
      return NextResponse.json(
        { error: 'No valid fields provided to update' },
        { status: 400 }
      )
    }

    const { data, error } = await adminUpdateOrder(id, fields, user.id, reason ?? null)
    if (error) throw error

    // ── Status change emails ───────────────────────────────────────────────────
    if (fields.status) {
      try {
        const { data: orderDetail } = await supabaseAdmin
          .from('orders')
          .select(`
            total_cents,
            deposit_paid_cents,
            pickup_date,
            customer:users ( email, first_name )
          `)
          .eq('id', id)
          .single()

        if (orderDetail?.customer?.email) {
          const pickupDate = orderDetail.pickup_date
            ? new Date(orderDetail.pickup_date).toLocaleDateString('en-AU', {
                weekday: 'long',
                day:     'numeric',
                month:   'long',
                year:    'numeric',
              })
            : 'To be confirmed'

          await sendOrderStatusEmail({
            newStatus:          fields.status,
            customerEmail:      orderDetail.customer.email,
            customerFirstName:  orderDetail.customer.first_name,
            orderId:            id,
            pickupDate,
            totalCents:         orderDetail.total_cents        ?? 0,
            depositPaidCents:   orderDetail.deposit_paid_cents ?? 0,
            reason:             reason ?? null,
          })
        }
      } catch (emailErr) {
        console.error('[order-status-email] Failed to send:', emailErr)
      }

      // Feedback request email on COMPLETED
      if (fields.status === 'COMPLETED') {
        try {
          const { data: orderDetail } = await supabaseAdmin
            .from('orders')
            .select('customer:users ( email, first_name )')
            .eq('id', id)
            .single()

          if (orderDetail?.customer?.email) {
            await sendFeedbackRequestEmail({
              customerEmail:     orderDetail.customer.email,
              customerFirstName: orderDetail.customer.first_name ?? 'there',
              orderId:           id,
            })
          }
        } catch (emailErr) {
          console.error('[feedback-email] Failed to send:', emailErr)
        }
      }
    }

    return NextResponse.json({ order: data })
  },
  { schema: adminUpdateSchema }
)

// ─── saveActualWeights helper ─────────────────────────────────────────────────
//
// 1. Validates every order_item_id belongs to this order
// 2. Updates actual_weight_kg + recalculates subtotal_cents per item
// 3. Sums all item subtotals → updates orders.total_cents
// 4. Writes one audit log row per changed weight

async function saveActualWeights({ orderId, actualWeights, changedBy }) {
  // Hard lock - weights cannot be changed once an order is READY or COMPLETED.
  // The fontend also enforces this but the API must be the source of truth.
  const LOCKED_STATUSES = ['READY', 'COMPLETED']
  const { data: orderStatus, error: statusError } = await supabaseAdmin
    .from('orders')
    .select('status')
    .eq('id', orderId)
    .single()

  if (statusError) return { error: statusError.message }
  if (LOCKED_STATUSES.includes(orderStatus.status)){
    return {
      error: `Weights cannot be edited - order is ${orderStatus.status}. Contact an administrator if a correction is needed.`
    }
  }
  // Fetch all order items for this order (we need product type + price)
  const { data: orderItems, error: fetchError } = await supabaseAdmin
    .from('order_items')
    .select(`
      id,
      quantity,
      unit_price_cents,
      subtotal_cents,
      actual_weight_kg,
      product:products ( product_type, price_per_kg_cents )
    `)
    .eq('order_id', orderId)

  if (fetchError) return { error: fetchError.message }
  if (!orderItems?.length) return { error: 'No order items found for this order' }

  // Index by id for quick lookup
  const itemMap = Object.fromEntries(orderItems.map(i => [i.id, i]))

  // Validate: every submitted id must belong to this order
  for (const entry of actualWeights) {
    if (!itemMap[entry.order_item_id]) {
      return { error: `Order item ${entry.order_item_id} does not belong to this order` }
    }
  }

  // Build updates and audit rows
  const auditRows = []
  const weightMap = Object.fromEntries(
    actualWeights.map(e => [e.order_item_id, e.actual_weight_kg])
  )

  // Process every item in the order (not just the ones submitted)
  // so we can correctly sum all subtotals
  const updatedItems = []

  for (const item of orderItems) {
    const isWeightBased = item.product?.product_type === 'WEIGHT_RANGE'
    const newWeightKg   = weightMap[item.id]

    if (isWeightBased && newWeightKg !== undefined) {
      // Recalculate subtotal: actual_kg × price_per_kg × quantity
      const pricePerKg  = item.product.price_per_kg_cents ?? 0
      const newSubtotal = Math.round(newWeightKg * pricePerKg * item.quantity)

      // Write to DB
      const { error: updateErr } = await supabaseAdmin
        .from('order_items')
        .update({
          actual_weight_kg: newWeightKg,
          subtotal_cents:   newSubtotal,
        })
        .eq('id', item.id)

      if (updateErr) return { error: updateErr.message }

      // Audit row — only if the value actually changed
      const oldWeight = item.actual_weight_kg
      if (String(oldWeight) !== String(newWeightKg)) {
        auditRows.push({
          order_id:   orderId,
          changed_by: changedBy,
          field:      'actual_weight',
          old_value:  oldWeight != null ? String(oldWeight) : null,
          new_value:  String(newWeightKg),
          reason:     null,
        })
      }

      updatedItems.push({ ...item, subtotal_cents: newSubtotal })
    } else {
      // Item not in the submitted weights — keep its existing subtotal
      updatedItems.push(item)
    }
  }

  // Recalculate order total from all item subtotals
  const newTotal = updatedItems.reduce((sum, i) => sum + (i.subtotal_cents ?? 0), 0)

  const { error: orderUpdateErr } = await supabaseAdmin
    .from('orders')
    .update({ total_cents: newTotal })
    .eq('id', orderId)

  if (orderUpdateErr) return { error: orderUpdateErr.message }

  // Write audit rows (if any weights actually changed)
  if (auditRows.length > 0) {
    const { error: auditErr } = await supabaseAdmin
      .from('order_audit_logs')
      .insert(auditRows)

    if (auditErr) {
      // Non-fatal — the data is saved, just log the failure
      console.error('[saveActualWeights] audit log insert failed:', auditErr)
    }
  }

  return { error: null }
}