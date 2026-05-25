import { NextResponse }  from 'next/server'
import { withHandler }   from '@/lib/middleware/withHandler'
import { createClient }  from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export const GET = withHandler(async (request) => {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorised — please log in' }, { status: 401 })
  }

  const { data: profile } = await supabaseAdmin
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!['STAFF', 'ADMIN'].includes(profile?.role)) {
    return NextResponse.json({ error: 'Access denied — staff or admin only' }, { status: 403 })
  }

    // Fetch all non-cancelled orders for this pickup date
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
    .order('created_at', { ascending: true })

  if (ordersError) throw ordersError

})