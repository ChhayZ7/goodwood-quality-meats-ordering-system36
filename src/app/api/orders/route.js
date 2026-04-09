
// GET /api/orders?customer_id=<uuid>
//   Returns all orders for a customer with items and product details.
//   Newest first.
//   Assumes customer_id is given as query parameter, ONCE CHHAY SETS UP LOGIN/SUPABASE AUTHENTICATION THEN
//   WE DERIVE CUSTOMER_ID FROM SESSION TOKEN INSTEAD

//   const { data: { user } } = await supabase.auth.getUser(token)
//   const customerId = user.id

import { NextResponse } from 'next/server'
import { withHandler } from '@/lib/middleware/withHandler'
import { getOrdersByCustomer } from '@/lib/db/orders'

export const GET = withHandler(async (request) => {
  const { searchParams } = new URL(request.url)
  const customerId = searchParams.get('customer_id')

  if (!customerId) {
    return NextResponse.json(
      { error: 'customer_id query param is required', status: 400 },
      { status: 400 }
    )
  }

  const { data, error } = await getOrdersByCustomer(customerId)

  if (error) throw error

  return NextResponse.json({ orders: data })
})