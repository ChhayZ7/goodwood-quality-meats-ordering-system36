// All database queries for the admin reports page.
// Each function is a separate query so the route can run them in parallel.
 
import { supabaseAdmin } from '@/lib/supabase-admin'
 
// Retrieve total orders grouped by status
// Returns array of { status: 'PENDING', count: 12 } for each status
export async function getOrderCountsByStatus() {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('status')
 
  if (error) throw error
 
  // Count occurrences of each status
  const counts = {}
  const validStatuses = ['PENDING', 'CONFIRMED', 'READY', 'COMPLETED', 'CANCELLED']
 
  // Initialise all status counts as 0
  for (const status of validStatuses) counts[status] = 0
  for (const row of data) {
    if (counts[row.status] !== undefined) counts[row.status]++
  }
 
  return Object.entries(counts).map(([status, count]) => ({ status, count }))
}

// Calculating total revenue
// Sums total_cents across COMPLETED orders.
// Returns { revenue_cents: number, order_count: number }
export async function getTotalRevenue() {
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select('total_cents')
      .eq('status', 'COMPLETED')
   
    if (error) throw error
   
    const revenue_cents = data.reduce((sum, row) => sum + (row.total_cents ?? 0), 0)
   
    return {
      revenue_cents,
      order_count: data.length,
    }
  }
   
// Total deposits collected
// Sums amount_cents across all PAID payment rows of type DEPOSIT
// Returns { deposits_collected_cents: number, payment_count: number }
export async function getTotalDepositsCollected() {
    const { data, error } = await supabaseAdmin
      .from('payments')
      .select('amount_cents')
      .eq('type', 'DEPOSIT')
      .eq('status', 'PAID')
   
    if (error) throw error
   
    const deposits_collected_cents = data.reduce((sum, row) => sum + (row.amount_cents ?? 0), 0)
   
    return {
      deposits_collected_cents,
      payment_count: data.length,
    }
  }
  