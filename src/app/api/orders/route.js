// src/app/api/orders/route.js
// GET /api/orders — returns all orders belonging to the logged-in customer.
//
// Customer-facing only — no admin or staff use case here.
// The customer_id filter is derived from the session cookie, not from a query
// param, so a customer can never request another customer's orders.
//
// Flow:
//   1. Verify session — 401 if no valid cookie
//   2. Query orders WHERE customer_id = session user's id
//   3. Return ordered list, newest first

import { NextResponse } from 'next/server'
import { withHandler } from '@/lib/middleware/withHandler'
import { createClient } from '@/lib/supabase-server'
import { getOrdersByCustomer } from '@/lib/db/orders'

export const GET = withHandler(async (request) => {
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

  // user.id from the session is the authoritative customer_id —
  // the query function filters on this, not on anything the client sends
  const { data, error } = await getOrdersByCustomer(user.id)

  if (error) throw error

  return NextResponse.json({ orders: data })
})