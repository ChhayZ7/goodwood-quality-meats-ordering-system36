// GET /api/orders
// Returns all orders for the currently logged-in customer using Supabase authentication session cookie

import { NextResponse } from 'next/server'
import { withHandler } from '@/lib/middleware/withHandler'
import { createClient } from '@/lib/supabase-server'
import { getOrdersByCustomer } from '@/lib/db/orders'

export const GET = withHandler(async (request) => {
  // Verify session
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json(
      { error: 'Unauthorised — please log in', status: 401 },
      { status: 401 }
    )
  }

  const { data, error } = await getOrdersByCustomer(user.id)

  if (error) throw error

  return NextResponse.json({ orders: data })
})