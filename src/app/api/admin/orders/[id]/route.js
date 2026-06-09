// src/app/api/admin/orders/[id]/route.js
//
// GET   /api/admin/orders/:id  — full order detail including complete audit log
// PATCH /api/admin/orders/:id  — two distinct update modes:
//
//   Mode A — standard field updates (status, notes, pickup_date, deposit_paid_cents)
//     Writes one audit log row per changed field.
//     Sends a status change email (IN_PROGRESS, READY, CANCELLED).
//     Sends a feedback request email + Final Invoice PDF when status moves to COMPLETED.
//
//   Mode B — actual weight submission ({ actual_weights: [...] })
//     Updates actual_weight_kg + recalculates subtotal_cents per weight-based item.
//     Recalculates orders.total_cents from the sum of all item subtotals.
//     Writes audit log rows only for values that actually changed.
//     Generates the Final Invoice PDF and emails it to the customer as an attachment.
//     Rejects if the order is already READY or COMPLETED — weights are locked.
//
// The two modes are mutually exclusive within a single request: if actual_weights
// is present in the body, Mode B runs; otherwise Mode A runs.

import { NextResponse }              from 'next/server'
import { withHandler }               from '@/lib/middleware/withHandler'
import { createClient }              from '@/lib/supabase-server'
import { supabaseAdmin }             from '@/lib/supabase-admin'
import { getAdminOrderById,
         adminUpdateOrder }          from '@/lib/db/admin'
import { sendFeedbackRequestEmail }  from '@/lib/email/feedbackRequest'
import { sendOrderStatusEmail }      from '@/lib/email/orderStatus'
import { sendWeightsConfirmedEmail } from '@/lib/email/weightsConfirmed'
import { generateInvoicePDF }        from '@/lib/pdf/invoice'

// ─── Auth helper ──────────────────────────────────────────────────────────────
// Reads the session cookie and confirms the user is ADMIN or STAFF.
// Returns { user, error } — error is 'unauthenticated' or 'forbidden'.

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

// Validation schema for Mode A (standard field updates).
// actual_weights uses a separate validator because it's an array of objects.
const adminUpdateSchema = {
  types: {
    status:             'string',
    notes:              'string',
    pickup_date:        'string',
    deposit_paid_cents: 'number',
    reason:             'string',
    actual_weights:     'array',
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

    // reason and actual_weights are pulled out before passing fields to
    // adminUpdateOrder, which only accepts standard DB columns.
    const { reason, actual_weights, ...fields } = request._body

    // ── Mode B: actual weight submission ──────────────────────────────────────
    if (actual_weights && actual_weights.length > 0) {
      const result = await saveActualWeights({
        orderId:       id,
        actualWeights: actual_weights,
        changedBy:     user.id,
      })

      if (result.error) {
        return NextResponse.json({ error: result.error }, { status: 400 })
      }

      // Re-fetch the full order so the frontend gets fresh totals and
      // pre-populated weight inputs
      const { data: refreshed } = await getAdminOrderById(id)
      return NextResponse.json({ order: refreshed })
    }

    // ── Mode A: standard field updates ────────────────────────────────────────
    if (!Object.keys(fields).length) {
      return NextResponse.json(
        { error: 'No valid fields provided to update' },
        { status: 400 }
      )
    }

    const { data, error } = await adminUpdateOrder(id, fields, user.id, reason ?? null)
    if (error) throw error

    // ── Status change emails ───────────────────────────────────────────────────
    // Only send emails for statuses that have customer-facing meaning.
    // The sendOrderStatusEmail function handles its own internal filtering.
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
                weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
              })
            : 'To be confirmed'

          await sendOrderStatusEmail({
            newStatus:         fields.status,
            customerEmail:     orderDetail.customer.email,
            customerFirstName: orderDetail.customer.first_name,
            orderId:           id,
            pickupDate,
            totalCents:        orderDetail.total_cents        ?? 0,
            depositPaidCents:  orderDetail.deposit_paid_cents ?? 0,
            reason:            reason ?? null,
          })
        }
      } catch (emailErr) {
        // Non-fatal — the order is already updated; log and continue
        console.error('[order-status-email] Failed to send:', emailErr)
      }

      // Send feedback request + Final Invoice PDF when order is marked COMPLETED.
      // COMPLETED means the customer has collected and fully paid — this is the
      // correct moment to send the paid receipt.
      if (fields.status === 'COMPLETED') {
        try {
          // Fetch full order shape — needed by generateInvoicePDF to render
          // the Final Invoice with confirmed weights and zero balance due
          const { data: orderDetail } = await supabaseAdmin
            .from('orders')
            .select(`
              id,
              status,
              pickup_date,
              total_cents,
              deposit_paid_cents,
              deposit_required_cents,
              customer:users ( id, first_name, last_name, email, phone ),
              order_items (
                id,
                quantity,
                weight_preference,
                unit_price_cents,
                subtotal_cents,
                actual_weight_kg,
                notes,
                product:products (
                  id,
                  name,
                  product_type,
                  price_cents,
                  price_per_kg_cents
                ),
                weight_option:product_weight_options (
                  id,
                  label,
                  min_weight_kg,
                  max_weight_kg
                )
              ),
              payments ( id, amount_cents, type, status )
            `)
            .eq('id', id)
            .single()

          if (orderDetail?.customer?.email) {
            // forceFinal = true — order is COMPLETED so all weights are confirmed.
            // The status check inside isFinalInvoice() would pass on its own here,
            // but forceFinal makes the intent explicit and guards against edge cases
            // where weights were not entered before COMPLETED was set.
            let pdfBuffer
            try {
              pdfBuffer = await generateInvoicePDF(orderDetail, orderDetail.customer, true)
            } catch (pdfErr) {
              console.error('[feedback-email] PDF generation failed:', pdfErr.message)
            }

            await sendFeedbackRequestEmail({
              customerEmail:     orderDetail.customer.email,
              customerFirstName: orderDetail.customer.first_name ?? 'there',
              orderId:           id,
              pdfBuffer, // undefined if generation failed — email sends without attachment
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

// ─── saveActualWeights ────────────────────────────────────────────────────────
// Called only from Mode B above. Isolated as a helper to keep the PATCH
// handler readable.
//
// Steps:
//   1. Reject if the order is READY or COMPLETED (weights are locked)
//   2. Fetch all order_items for this order
//   3. Validate that every submitted order_item_id belongs to this order
//   4. For each weight-based item in the payload: update actual_weight_kg and
//      recalculate subtotal_cents = actual_kg × price_per_kg × quantity
//   5. Recalculate orders.total_cents as the sum of all item subtotals
//   6. Write audit log rows for values that actually changed
//   7. Generate the Final Invoice PDF and email it to the customer as an
//      attachment (non-fatal — email sends without PDF if generation fails)

async function saveActualWeights({ orderId, actualWeights, changedBy }) {
  // Weights are locked once an order reaches READY or COMPLETED because the
  // customer has already been notified of the balance due — changing weights
  // at that point would cause a discrepancy.
  const LOCKED_STATUSES = ['READY', 'COMPLETED']

  const { data: orderStatus, error: statusError } = await supabaseAdmin
    .from('orders')
    .select('status')
    .eq('id', orderId)
    .single()

  if (statusError) return { error: statusError.message }

  if (LOCKED_STATUSES.includes(orderStatus.status)) {
    return {
      error: `Weights cannot be edited — order is ${orderStatus.status}. Contact an administrator if a correction is needed.`,
    }
  }

  // Fetch all items for this order so we can validate ownership and
  // recalculate the order total correctly across ALL items, not just
  // the ones included in this particular submission.
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

  // Index by id for O(1) lookup during validation
  const itemMap = Object.fromEntries(orderItems.map(i => [i.id, i]))

  // Reject the entire request if any submitted id doesn't belong to this order
  for (const entry of actualWeights) {
    if (!itemMap[entry.order_item_id]) {
      return { error: `Order item ${entry.order_item_id} does not belong to this order` }
    }
  }

  // Build a quick lookup: order_item_id → actual_weight_kg from the payload
  const weightMap = Object.fromEntries(
    actualWeights.map(e => [e.order_item_id, e.actual_weight_kg])
  )

  const auditRows    = []
  const updatedItems = []

  for (const item of orderItems) {
    const isWeightBased = item.product?.product_type === 'WEIGHT_RANGE'
    const newWeightKg   = weightMap[item.id]

    if (isWeightBased && newWeightKg !== undefined) {
      // subtotal = actual_kg × price_per_kg × quantity
      const pricePerKg  = item.product.price_per_kg_cents ?? 0
      const newSubtotal = Math.round(newWeightKg * pricePerKg * item.quantity)

      const { error: updateErr } = await supabaseAdmin
        .from('order_items')
        .update({ actual_weight_kg: newWeightKg, subtotal_cents: newSubtotal })
        .eq('id', item.id)

      if (updateErr) return { error: updateErr.message }

      // Only write an audit row if the value genuinely changed — avoids
      // noise when staff re-save without modifying a weight
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
      // Item not in this submission — carry its existing subtotal forward
      // so the order total is still correct
      updatedItems.push(item)
    }
  }

  // Recalculate the order total from all item subtotals (not just the changed ones)
  const newTotal = updatedItems.reduce((sum, i) => sum + (i.subtotal_cents ?? 0), 0)

  const { error: orderUpdateErr } = await supabaseAdmin
    .from('orders')
    .update({ total_cents: newTotal })
    .eq('id', orderId)

  if (orderUpdateErr) return { error: orderUpdateErr.message }

  // Write audit rows (only if weights actually changed)
  if (auditRows.length > 0) {
    const { error: auditErr } = await supabaseAdmin
      .from('order_audit_logs')
      .insert(auditRows)

    // Non-fatal — the data is saved; log the failure but don't block the response
    if (auditErr) {
      console.error('[saveActualWeights] audit log insert failed:', auditErr)
    }

    // Send "weights confirmed" email with Final Invoice PDF attached.
    // Only fires when at least one weight changed (auditRows.length > 0)
    // so re-saving without changes doesn't spam the customer.
    try {
      // Fetch full order and customer — needed for both the PDF and the email
      const { data: orderDetail } = await supabaseAdmin
        .from('orders')
        .select(`
          id,
          status,
          pickup_date,
          total_cents,
          deposit_paid_cents,
          deposit_required_cents,
          customer:users ( id, first_name, last_name, email, phone ),
          order_items (
            id,
            quantity,
            weight_preference,
            unit_price_cents,
            subtotal_cents,
            actual_weight_kg,
            notes,
            product:products (
              id,
              name,
              product_type,
              price_cents,
              price_per_kg_cents
            ),
            weight_option:product_weight_options (
              id,
              label,
              min_weight_kg,
              max_weight_kg
            )
          ),
          payments ( id, amount_cents, type, status )
        `)
        .eq('id', orderId)
        .single()

      if (orderDetail?.customer?.email) {
        const pickupDate = orderDetail.pickup_date
          ? new Date(orderDetail.pickup_date).toLocaleDateString('en-AU', {
              weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
            })
          : 'To be confirmed'

        // Generate the Final Invoice PDF.
        // forceFinal = true bypasses the status check inside isFinalInvoice() —
        // the order is still IN_PROGRESS here but all weights are now saved,
        // so the PDF content should be final, not estimated.
        // Non-fatal: if generation fails, the email still sends without the
        // attachment and the customer can download it from the portal.
        let pdfBuffer
        try {
          pdfBuffer = await generateInvoicePDF(orderDetail, orderDetail.customer, true)
        } catch (pdfErr) {
          console.error('[weights-confirmed-email] PDF generation failed:', pdfErr.message)
        }

        await sendWeightsConfirmedEmail({
          customerEmail:     orderDetail.customer.email,
          customerFirstName: orderDetail.customer.first_name ?? 'there',
          orderId,
          pickupDate,
          totalCents:        newTotal,
          depositPaidCents:  orderDetail.deposit_paid_cents ?? 0,
          pdfBuffer, // undefined if generation failed — email sends without attachment
        })
      }
    } catch (emailErr) {
      console.error('[weights-confirmed-email] Failed to send:', emailErr)
    }
  }

  return { error: null }
}