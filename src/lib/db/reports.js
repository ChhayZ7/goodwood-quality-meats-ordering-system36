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
 
}