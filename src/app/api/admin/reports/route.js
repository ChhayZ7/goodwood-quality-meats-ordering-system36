// src/app/api/admin/reports/route.js
// GET /api/admin/reports
// Returns a business summary report for a given time period.
// Admin only — staff cannot access financial reports.
//
// Query params:
//   period — "today" or "month" (defaults to "month")
//
// Response shape:
//   generated_at          — ISO timestamp of when the report was computed
//   orders_by_status      — count of orders per status in the period
//   revenue               — total revenue from COMPLETED orders
//   deposits              — total deposits collected from PAID payment rows
//   orders_by_pickup_date — upcoming non-cancelled orders grouped by pickup date
//   low_stock_products    — products at or below their low_stock_threshold
//   top_products          — top 3 products by units ordered in the period

import { NextResponse } from 'next/server'
import { withHandler } from '@/lib/middleware/withHandler'
import { createClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import {
  getOrderCountsByStatus,
  getTotalRevenue,
  getTotalDepositsCollected,
  getOrdersByPickupDate,
  getLowStockProducts,
  getTopProducts,
} from '@/lib/db/reports'

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

  // Reports contain revenue data — restricted to ADMIN only
  const { data: profile } = await supabaseAdmin
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'ADMIN') {
    return NextResponse.json(
      { error: 'Access denied — admin only', status: 403 },
      { status: 403 }
    )
  }

  // Validate the period param — silently fall back to "month" if invalid
  const { searchParams } = new URL(request.url)
  const period = ['today', 'month'].includes(searchParams.get('period'))
    ? searchParams.get('period')
    : 'month'

  // Run all report queries in parallel — none depend on each other so there
  // is no reason to await them sequentially
  const [
    orders_by_status,
    revenue,
    deposits,
    orders_by_pickup_date,
    low_stock_products,
    top_products,
  ] = await Promise.all([ // run at same time
    getOrderCountsByStatus(period),
    getTotalRevenue(period),
    getTotalDepositsCollected(period),
    getOrdersByPickupDate(), // always shows upcoming dates regardless of period
    getLowStockProducts(), // always shows current stock regardless of period
    getTopProducts(period),
  ])

  return NextResponse.json({
    generated_at:         new Date().toISOString(),
    orders_by_status,
    revenue,
    deposits,
    orders_by_pickup_date,
    low_stock_products,
    top_products,
  })
})