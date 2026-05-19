// All database queries for the admin reports page.
// Each function is a separate query so the route can run them in parallel.

import { supabaseAdmin } from '@/lib/supabase-admin'

//helpers
function getDateRange(period) {
  const now = new Date()
  const pad = n => String(n).padStart(2, '0')
  const toDate = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

  if (period === 'today') {
    const today = toDate(now)
    return { from: today, to: today }
  }

  // This month, first day to last day
  const from = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-01`
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  const to = toDate(lastDay)
  return { from, to }
}

//Queries

//Total orders grouped by status, optionally filtered by date range.
export async function getOrderCountsByStatus(period) {
  const validStatuses = ['PENDING', 'CONFIRMED', 'READY', 'COMPLETED', 'CANCELLED']
  const counts = Object.fromEntries(validStatuses.map(s => [s, 0]))

  let query = supabaseAdmin.from('orders').select('status')

  if (period) {
    const { from, to } = getDateRange(period)
    query = query.gte('created_at', from).lte('created_at', to + 'T23:59:59')
  }

  const { data, error } = await query
  if (error) throw error

  for (const row of data) {
    if (counts[row.status] !== undefined) counts[row.status]++
  }

  return counts
}


//Total revenue from COMPLETED orders only.
export async function getTotalRevenue(period) {
  let query = supabaseAdmin
    .from('orders')
    .select('total_cents')
    .eq('status', 'COMPLETED')

  if (period) {
    const { from, to } = getDateRange(period)
    query = query.gte('created_at', from).lte('created_at', to + 'T23:59:59')
  }

  const { data, error } = await query
  if (error) throw error

  const revenue_cents = data.reduce((sum, r) => sum + (r.total_cents ?? 0), 0)
  return { revenue_cents, order_count: data.length }
}


//Total deposits collected from PAID payment rows.
export async function getTotalDepositsCollected(period) {
  let query = supabaseAdmin
    .from('payments')
    .select('amount_cents')
    .eq('type', 'DEPOSIT')
    .eq('status', 'PAID')

  if (period) {
    const { from, to } = getDateRange(period)
    query = query.gte('created_at', from).lte('created_at', to + 'T23:59:59')
  }

  const { data, error } = await query
  if (error) throw error

  const deposits_collected_cents = data.reduce((sum, r) => sum + (r.amount_cents ?? 0), 0)
  return { deposits_collected_cents, payment_count: data.length }
}


//Orders grouped by pickup date (upcoming, non-cancelled).
export async function getOrdersByPickupDate() {
  const today = new Date().toISOString().split('T')[0]

  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('pickup_date')
    .gte('pickup_date', today)
    .not('status', 'eq', 'CANCELLED')
    .order('pickup_date', { ascending: true })

  if (error) throw error

  const grouped = {}
  for (const row of data) {
    grouped[row.pickup_date] = (grouped[row.pickup_date] ?? 0) + 1
  }

  return Object.entries(grouped).map(([pickup_date, order_count]) => ({
    pickup_date,
    order_count,
  }))
}

//Low stock products (stock_quantity <= low_stock_threshold).
export async function getLowStockProducts() {
  const { data, error } = await supabaseAdmin
    .from('inventory')
    .select('product_id, stock_quantity, low_stock_threshold, product:products(name, category, is_available)')

  if (error) throw error

  return data
    .filter(r => r.stock_quantity <= r.low_stock_threshold)
    .map(r => ({
      product_id:          r.product_id,
      name:                r.product?.name ?? 'Unknown',
      category:            r.product?.category ?? null,
      is_available:        r.product?.is_available ?? true,
      stock_quantity:      r.stock_quantity,
      low_stock_threshold: r.low_stock_threshold,
    }))
    .sort((a, b) => a.stock_quantity - b.stock_quantity)
}


//Top 3 most ordered products by quantity, optionally filtered by period.
export async function getTopProducts(period) {
  let query = supabaseAdmin
    .from('order_items')
    .select(`
      quantity,
      subtotal_cents,
      product:products ( name )
    `)

  // Join via orders to filter by created_at period
  if (period) {
    const { from, to } = getDateRange(period)

    // Fetch order IDs within the period first
    const { data: orders, error: ordersError } = await supabaseAdmin
      .from('orders')
      .select('id')
      .gte('created_at', from)
      .lte('created_at', to + 'T23:59:59')
      .not('status', 'eq', 'CANCELLED')

    if (ordersError) throw ordersError

    const orderIds = orders.map(o => o.id)
    if (orderIds.length === 0) return []

    query = query.in('order_id', orderIds)
  }

  const { data, error } = await query
  if (error) throw error

  // Aggregate by product name
  const map = {}
  for (const item of data) {
    const name = item.product?.name ?? 'Unknown'
    if (!map[name]) map[name] = { name, units: 0, revenue: 0 }
    map[name].units   += item.quantity ?? 0
    map[name].revenue += Math.round((item.subtotal_cents ?? 0) / 100)
  }

  return Object.values(map)
    .sort((a, b) => b.units - a.units)
    .slice(0, 3)
}