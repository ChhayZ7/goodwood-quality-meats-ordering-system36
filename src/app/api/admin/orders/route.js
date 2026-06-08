// src/app/api/admin/orders/route.js
// GET /api/admin/orders
// Returns all non-PENDING orders with optional filters.
// Admin and staff only.
//
// Query params (all optional):
//   status   — filter by a single order status
//   dateFrom — filter pickup_date >= this date (YYYY-MM-DD)
//   dateTo   — filter pickup_date <= this date (YYYY-MM-DD)
//   search   — filter by customer full name (case-insensitive, applied in JS)
//   limit    — max rows to return (default 50)
//   offset   — pagination offset (default 0)

import { NextResponse } from 'next/server'
import { withHandler } from '@/lib/middleware/withHandler'
import { createClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getAllOrders } from '@/lib/db/admin'

export const GET = withHandler(async (request) => {
  // Verify the session cookie is valid
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json(
      { error: 'Unauthorised — please log in', status: 401 },
      { status: 401 }
    )
  }

  // Both ADMIN and STAFF can list orders
  const { data: profile } = await supabaseAdmin
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!['ADMIN', 'STAFF'].includes(profile?.role)) {
    return NextResponse.json(
      { error: 'Access denied — staff or admin only', status: 403 },
      { status: 403 }
    )
  }

  // Parse all supported filter params from the URL
  const { searchParams } = new URL(request.url)

  const filters = {
    status: searchParams.get('status') ?? undefined,
    dateFrom: searchParams.get('dateFrom') ?? undefined,
    dateTo: searchParams.get('dateTo') ?? undefined,
    search: searchParams.get('search') ?? undefined,
    limit: parseInt(searchParams.get('limit') ?? '50'),
    offset: parseInt(searchParams.get('offset') ?? '0'),
  }

  const { data, error } = await getAllOrders(filters)

  if (error) throw error

  return NextResponse.json({ orders: data })
})