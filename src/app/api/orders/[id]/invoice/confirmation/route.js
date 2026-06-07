// src/app/api/orders/[id]/invoice/confirmation/route.js
// Streams a PDF invoice to the browser.
//
// The PDF template automatically switches between two modes:
//   - Confirmation Invoice  (estimated totals) — for CONFIRMED / IN_PROGRESS orders
//   - Final Invoice         (actual weights)   — for READY / COMPLETED orders where
//                                                all weight-based items have been weighed
//
// The filename returned to the browser also reflects the mode so it's clear
// which document the customer or staff member downloaded.

import { NextResponse }         from 'next/server'
import { createClient }         from '@/lib/supabase-server'
import { supabaseAdmin }        from '@/lib/supabase-admin'
import { generateInvoicePDF }   from '@/lib/pdf/invoice'

export async function GET(request, { params }) {
  const { id } = await params

  // ── Auth ──────────────────────────────────────────────────────────────────
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorised — please log in' }, { status: 401 })
  }

  // ── Fetch order — include actual_weight_kg on items ───────────────────────
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

  // ── Authorisation — owner or staff/admin ──────────────────────────────────
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

  // ── Fetch customer profile for the PDF ───────────────────────────────────
  const { data: customer } = await supabaseAdmin
    .from('users')
    .select('id, first_name, last_name, email, phone')
    .eq('id', order.customer.id)
    .single()

  if (!customer) {
    return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
  }

  // ── Determine whether this is a final invoice ─────────────────────────────
  // Mirrors the same logic inside the PDF template so the filename matches.
  const finalStatuses  = ['READY', 'COMPLETED']
  const weightItems    = (order.order_items ?? []).filter(
    item => item.product?.product_type === 'WEIGHT_RANGE'
  )
  const allWeighed     = weightItems.every(item => item.actual_weight_kg != null)
  const isFinal        = finalStatuses.includes(order.status) && (weightItems.length === 0 || allWeighed)

  // ── Generate PDF ──────────────────────────────────────────────────────────
  const pdfBuffer     = await generateInvoicePDF(order, customer)
  const invoiceNumber = `GW-${id.slice(0, 8).toUpperCase()}`

  // Use a clear filename so the customer knows what they downloaded
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