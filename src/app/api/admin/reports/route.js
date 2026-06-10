// src/app/api/admin/reports/route.js
// GET /api/admin/reports

// Query params: ?month=12&year=2026


import { NextResponse } from 'next/server'
import { withHandler } from '@/lib/middleware/withHandler'
import { createClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import {
  getOrderCountsByStatus,
  getOrderSummary,
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
  
  // if the user's role is not ADMIN, return 403 Access Denied
  if (profile?.role !== 'ADMIN') {
    return NextResponse.json(
      { error: 'Access denied — admin only', status: 403 },
      { status: 403 }
    )
  }

  // parse period params, month year
  // Valid months: 11 (November), 12 (December), 1 (January)
  // Valid years: 2025, 2026, 2027
  // like /api/admin/reports?month=12&year=2026
  // If invalid values are passed, default to December of the current year

  const { searchParams } = new URL(request.url)

  const VALID_MONTHS = [11, 12, 1]            // November, December, January, valid for now
  const VALID_YEARS = [2025, 2026, 2027]     // supported season years, valid for now, can be expanded

  //get the month parameter from the URL and convert it from a string to a number
  // e.g. "12" → 12
  const parsedMonth = parseInt(searchParams.get('month'))
  // Same as rhe above
  const parsedYear = parseInt(searchParams.get('year'))

  // if the parsed month is in the valid list, use it, otherwise default to December
  const month = VALID_MONTHS.includes(parsedMonth) ? parsedMonth : 12
  // if the parsed year is in the valid list, use it, otherwise default to current year
  const year = VALID_YEARS.includes(parsedYear) ? parsedYear : new Date().getFullYear()

  // Run all report queries in parallel using Promise.all
  // Promise.all runs all queries in parallel instead of one after another (AI suggested to use Promise.all to run 3 queries)
  //so the total wait time is the slowest query, not the sum of all queries

  const [
    orders_by_status, // count of orders per status (CONFIRMED, IN_PROGRESS, etc.)
    order_summary,// income figures: totals, deposits, avg order value
    top_products, // top 3 products by units ordered
  ] = await Promise.all([
    getOrderCountsByStatus(month, year),
    getOrderSummary(month, year),
    getTopProducts(month, year),
  ])

  // Return the full report as a JSON response
  return NextResponse.json({
    generated_at: new Date().toISOString(), // timestamp so admin knows when data was fetched
    month, // echo back which month was queried
    year, // echo back which year was queried
    orders_by_status,
    order_summary,
    top_products,
  })

})