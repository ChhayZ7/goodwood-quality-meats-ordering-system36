// GET /api/admin/reports

// Admin-only route, returns a summary of total orders by status, revenue,
// deposits collected, orders by pickup date, low stock products


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
} from '@/lib/db/reports'

export const GET = withHandler(async (request) => {
  // Auth check
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json(
      { error: 'Unauthorised — please log in', status: 401 },
      { status: 401 }
    )
  }

  // Role check, admin only allowed
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

  // Run all report queries
  const [
    orders_by_status,
    revenue,
    deposits,
    orders_by_pickup_date,
    low_stock_products,
  ] = await Promise.all([ // run at same time
    getOrderCountsByStatus(),
    getTotalRevenue(),
    getTotalDepositsCollected(),
    getOrdersByPickupDate(),
    getLowStockProducts(),
  ])

  return NextResponse.json({
    generated_at:         new Date().toISOString(),
    orders_by_status,
    revenue,
    deposits,
    orders_by_pickup_date,
    low_stock_products,
  })
})