// GET   /api/admin/orders/:id
// Returns full order detail including the complete audit log for staff and admin only.
//
// PATCH /api/admin/orders/:id
// Updates an order and writes an audit log entry for every changed field for staff and admin only.
// When status is changed to COMPLETED, sends a feedback request email to the customer.

import { NextResponse }              from 'next/server'
import { withHandler }               from '@/lib/middleware/withHandler'
import { createClient }              from '@/lib/supabase-server'
import { supabaseAdmin }             from '@/lib/supabase-admin'
import { getAdminOrderById, adminUpdateOrder } from '@/lib/db/admin'
import { sendFeedbackRequestEmail }  from '@/lib/email/feedbackRequest'
import { sendOrderStatusEmail }      from '@/lib/email/orderStatus'

// Shared staff/admin auth helper
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
  },
  validators: {
    status: (val) => {
      const valid = ['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'READY', 'COMPLETED', 'CANCELLED']
      return valid.includes(val) ? null : `Must be one of: ${valid.join(', ')}`
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

    const { reason, ...fields } = request._body

    if (!Object.keys(fields).length) {
      return NextResponse.json(
        { error: 'No valid fields provided to update' },
        { status: 400 }
      )
    }

    const { data, error } = await adminUpdateOrder(id, fields, user.id, reason ?? null)
    if (error) throw error

    // ── Send status change emails ──────────────────────────────────────────────
    // Runs after the DB update succeeds.
    // Failures are logged but never block the response —
    // the order update is the critical operation, email is secondary.

    if (fields.status) {
      try {
        // Fetch the full order to get customer details and financials
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

      // ── Feedback request email (COMPLETED only) ──────────────────────────────
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



