import { NextResponse } from 'next/server'
import { withHandler } from '@/lib/middleware/withHandler'
import { createClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export const GET = withHandler(async (request) => {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  // check user is logged in via supabase auth
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorised — please log in' }, { status: 401 })
  }

  const { data: profile } = await supabaseAdmin
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  // check user role is staff or admin only
  if (!['STAFF', 'ADMIN'].includes(profile?.role)) {
    return NextResponse.json({ error: 'Access denied — staff or admin only' }, { status: 403 })
  }

  // Parse query params from the URL
  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date')
  const category = searchParams.get('category')

  // if date not provided in param
  if (!date) {
    return NextResponse.json({ error: 'date query param is required (YYYY-MM-DD)' }, { status: 400 })
  }

  // Fetch all non-cancelled and non-pending orders for this pickup date
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
  // Format orders — apply optional category filter to items
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
  // Build day summary — total quantity per product across all orders
  const summaryMap = {}
  for (const order of formattedOrders) {
    for (const item of order.order_items) {
      const key = item.product_name
      if (!summaryMap[key]) {
        summaryMap[key] = { product_name: item.product_name, category: item.category, total_quantity: 0 }
      }
      summaryMap[key].total_quantity += item.quantity
    }
  }
  const summary = Object.values(summaryMap).sort((a, b) => a.product_name.localeCompare(b.product_name))
  return NextResponse.json({
    date,
    category: category ?? 'All',
    orders: formattedOrders,
    summary,
  })


})