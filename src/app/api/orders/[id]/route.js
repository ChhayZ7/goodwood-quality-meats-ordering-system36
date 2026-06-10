// src/app/api/orders/[id]/route.js
//
// GET   /api/orders/:id — fetch a single order with items and payments
// PATCH /api/orders/:id — update order fields (staff and admin only)
//
// Access rules:
//   GET  — customer who owns the order OR any staff/admin
//   PATCH — staff and admin only; customers cannot modify their own orders
//
// Flow (GET):
//   1. Verify session — 401 if no valid cookie
//   2. Fetch order by id
//   3. Check caller is the owner OR staff/admin — 403 otherwise
//   4. Return order
//
// Flow (PATCH):
//   1. Verify session — 401 if no valid cookie
//   2. Confirm caller is staff or admin — 403 otherwise
//   3. Apply allowed field updates
//   4. Return updated order

import { NextResponse } from 'next/server'
import { withHandler, schemas } from '@/lib/middleware/withHandler'
import { createClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getOrderById, updateOrder } from '@/lib/db/orders'

// ─── GET ──────────────────────────────────────────────────────────────────────
export const GET = withHandler(async (request, { params }) => {
  const { id } = await params

  // Verify session
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  // 401 — no valid session cookie
  if (authError || !user) { 
    return NextResponse.json(
      { error: 'Unauthorised — please log in', status: 401 },
      { status: 401 }
    )
  }

  const { data, error } = await getOrderById(id)

  if (error) throw error
  if (!data) {
    return NextResponse.json(
      { error: 'Order not found', status: 404 },
      { status: 404 }
    )
  }

  // ── Ownership check ───────────────────────────────────────────────────────
  // Look up the caller's role so we can decide whether to grant access.
  // Both conditions must be checked — a customer can only see their own order,
  // but staff and admin can see any order.
  const { data: profile } = await supabaseAdmin
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  const isStaffOrAdmin = ['STAFF', 'ADMIN'].includes(profile?.role)
  const isOwner = data.customer?.id === user.id

  // 403 — authenticated but neither the owner nor staff/admin
  if (!isOwner && !isStaffOrAdmin) {
    return NextResponse.json(
      { error: 'You do not have permission to view this order', status: 403 },
      { status: 403 }
    )
  }

  return NextResponse.json({ order: data })
})


// ─── PATCH ────────────────────────────────────────────────────────────────────

export const PATCH = withHandler(
  async (request, { params }) => {
    const { id } = await params

    // Verify session
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    // 401 — no valid session cookie
    if (authError || !user) { // Supabase authentication
      return NextResponse.json(
        { error: 'Unauthorised — please log in', status: 401 },
        { status: 401 }
      )
    }

    // Staff and admin only — customers cannot patch their own orders.
    // For staff-level weight entry and status changes, use /api/admin/orders/:id instead.
    const { data: profile } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!['STAFF', 'ADMIN'].includes(profile?.role)) {
      return NextResponse.json(
        { error: 'Access denied — staff or admin only', status: 403 },
        { status: 403 }
      )
    }

    const body = request._body

    // Guard against an empty body slipping past schema validation
    if (!Object.keys(body).length) {
      return NextResponse.json(
        { error: 'No valid fields provided to update', status: 400 },
        { status: 400 }
      )
    }

    // updateOrder internally allowlists which fields can be written —
    // unknown fields in the body are silently ignored
    const { data, error } = await updateOrder(id, body)

    if (error) throw error

    return NextResponse.json({ order: data })
  },
  { schema: schemas.updateOrder }
)