// Returns all orders and a product summary for a given pickup date.
// Used by staff and admin to see what needs to be prepared on a specific day.

import { NextResponse } from 'next/server'
import { withHandler } from '@/lib/middleware/withHandler'
import { createClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export const GET = withHandler(async (request) => {

  // Verify the user is logged in
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorised — please log in' }, { status: 401 })
  }

  // Verify the user is staff or admin. customers cannot access this route
  const { data: profile } = await supabaseAdmin
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!['STAFF', 'ADMIN'].includes(profile?.role)) {
    return NextResponse.json({ error: 'Access denied — staff or admin only' }, { status: 403 })
  }

  // Pull date and optional category filter from the URL query string
  // e.g. /api/staff/daily-prep?date=2025-12-23&category=Pork
  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date')
  const category = searchParams.get('category')

  if (!date) {
    return NextResponse.json({ error: 'date query param is required (YYYY-MM-DD)' }, { status: 400 })
  }

  // Fetch all confirmed/active orders for the selected pickup date.
  // PENDING and CANCELLED orders are excluded, only real orders that need preparing.
  const { data: orders, error: ordersError } = await supabaseAdmin
    .from('orders')
    .select(`
      id,
      status,
      pickup_date,
      customer:users ( id, first_name, last_name ),
      order_items (
        id,
        quantity,
        product:products ( id, name, category, product_type )
      )
    `)
    .eq('pickup_date', date)
    .not('status', 'eq', 'CANCELLED')
    .not('status', 'eq', 'PENDING')
    .order('created_at', { ascending: true })

  if (ordersError) throw ordersError

  // Format each order for the frontend.
  // If a category filter is active, only keep items matching that category.
  // Orders with no matching items are still included here — the frontend
  // filters them out via ordersWithItems.
  const formattedOrders = (orders ?? []).map(order => {
    let items = order.order_items ?? []

    if (category && category !== 'All') {
      items = items.filter(item => item.product?.category === category)
    }

    return {
      id: order.id,
      order_number: `GW${order.id.slice(0, 8).toUpperCase()}`,
      customer_name: `${order.customer?.first_name ?? ''} ${order.customer?.last_name ?? ''}`.trim(),
      status: order.status,
      order_items: items.map(item => ({
        id: item.id,
        product_name: item.product?.name ?? 'Unknown',
        category: item.product?.category ?? 'Other',
        quantity: item.quantity ?? 0,
      })),
    }
  })

  // Daily prep (total quantity needed per product across all orders)
  // Gives staff a single list of what to prepare rather than manually checking individual orders
  //
  // Uses a map keyed by product name to accumulate quantities, then converts
  // to a sorted array. Assisted by AI.
  const summaryMap = {}
  for (const order of formattedOrders) {
    for (const item of order.order_items) {
      const key = item.product_name
      if (!summaryMap[key]) {
        summaryMap[key] = {
          product_name: item.product_name,
          category: item.category,
          total_quantity: 0,
        }
      }
      summaryMap[key].total_quantity += item.quantity
    }
  }

  // Sort alphabetically by product name so the summary is easy to scan
  const summary = Object.values(summaryMap).sort((a, b) =>
    a.product_name.localeCompare(b.product_name)
  )

  return NextResponse.json({
    date,
    category: category ?? 'All',
    orders: formattedOrders,
    summary,
  })
})