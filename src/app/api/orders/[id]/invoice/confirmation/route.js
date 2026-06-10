// src/app/api/orders/[id]/invoice/confirmation/route.js
// GET /api/orders/:id/invoice/confirmation — streams a PDF invoice to the browser.
//
// Single endpoint, two PDF modes — the template decides which to render:
//
//   Confirmation Invoice — order is CONFIRMED or IN_PROGRESS, or weights are
//                          not yet entered. Shows estimated totals and a disclaimer.
//
//   Final Invoice        — order is READY or COMPLETED AND every weight-based
//                          item has actual_weight_kg recorded. Shows confirmed
//                          totals and actual weights per item.
//
// The filename returned in Content-Disposition also reflects the mode:
//   GW-XXXXXXXX-confirmation.pdf  (estimated)
//   GW-XXXXXXXX-final-invoice.pdf (confirmed)
//
// This isFinal logic is intentionally mirrored in three places:
//   - This route        (sets the filename)
//   - invoice.jsx       (switches the PDF template)
//   - OrderDetailsPage  (switches the button label in the dashboard)
// All three must stay in sync if the definition of "final" ever changes.
//
// Access: order owner (customer) OR any staff/admin

import { NextResponse }         from 'next/server'
import { createClient }         from '@/lib/supabase-server'
import { supabaseAdmin }        from '@/lib/supabase-admin'
import { generateInvoicePDF }   from '@/lib/pdf/invoice'

export async function GET(request, { params }) {
  const { id } = await params

  // ── 1. Verify session ─────────────────────────────────────────────────────
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorised — please log in' }, { status: 401 })
  }

  // ── 2. Fetch order ────────────────────────────────────────────────────────
  // actual_weight_kg must be included on order_items — the PDF template reads
  // it to decide which mode to render and to populate the Actual kg column.
  const { data: order, error: orderError } = await supabaseAdmin
    .from('orders')
    .select(`
      id,
      status,
      pickup_date,
      notes,
      total_cents,
      deposit_paid_cents,
      deposit_required_cents,
      customer:users (
        id,
        first_name,
        last_name,
        email,
        phone
      ),
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
      payments (
        id,
        amount_cents,
        type,
        status
      )
    `)
    .eq('id', id)
    .single()

  if (orderError || !order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  // ── 3. Ownership / role check ─────────────────────────────────────────────
  // Customer can only download their own invoice.
  // Staff and admin can download any order's invoice (e.g. to print for the counter).
  const { data: profile } = await supabaseAdmin
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  const isStaffOrAdmin = ['STAFF', 'ADMIN'].includes(profile?.role)
  const isOwner        = order.customer?.id === user.id

  if (!isOwner && !isStaffOrAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // ── 4. Fetch full customer profile for the PDF ────────────────────────────
  // order.customer only contains what was selected above — a second query
  // ensures we always have a complete profile even if the join shape changes
  const { data: customer } = await supabaseAdmin
    .from('users')
    .select('id, first_name, last_name, email, phone')
    .eq('id', order.customer.id)
    .single()

  if (!customer) {
    return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
  }

  // ── 5. Determine invoice mode (Confirmation vs Final) ─────────────────────
  // Final requires: status is READY or COMPLETED AND every weight-based item
  // has actual_weight_kg set. Fixed-price-only orders are always final once READY.
  const finalStatuses  = ['READY', 'COMPLETED']
  const weightItems    = (order.order_items ?? []).filter(
    item => item.product?.product_type === 'WEIGHT_RANGE'
  )
  const allWeighed     = weightItems.every(item => item.actual_weight_kg != null)
  const isFinal        = finalStatuses.includes(order.status) && (weightItems.length === 0 || allWeighed)

  // ── 6. Generate PDF and stream to browser ─────────────────────────────────
  const pdfBuffer     = await generateInvoicePDF(order, customer)
  const invoiceNumber = `GW-${id.slice(0, 8).toUpperCase()}`

  // Filename makes it obvious which document was downloaded, without opening it
  const filename = isFinal
    ? `${invoiceNumber}-final-invoice.pdf`
    : `${invoiceNumber}-confirmation.pdf`

  return new Response(pdfBuffer, {
    status: 200,
    headers: {
      'Content-Type':        'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}