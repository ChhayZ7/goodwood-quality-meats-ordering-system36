// GET   /api/orders/:id which has full order detail (customer, items, products, payments)
// PATCH /api/orders/:id which has status, notes, pickup_date, deposit_paid_cents

import { NextResponse } from 'next/server'
import { withHandler, schemas } from '@/lib/middleware/withHandler'
import { getOrderById, updateOrder } from '@/lib/db/orders'

// GET
export const GET = withHandler(async (request, { params }) => {
  const { id } = await params 

  const { data, error } = await getOrderById(id)

  if (error) throw error

  if (!data) {
    return NextResponse.json({ error: 'Order not found', status: 404 }, { status: 404 })
  }

  return NextResponse.json({ order: data })
})


// PATCH
export const PATCH = withHandler(
  async (request, { params }) => {
    const { id } = await params
    const body = request._body

    if (!Object.keys(body).length) {
      return NextResponse.json(
        { error: 'No valid fields provided to update', status: 400 },
        { status: 400 }
      )
    }

    const { data, error } = await updateOrder(id, body)

    if (error) throw error

    return NextResponse.json({ order: data })
  },
  { schema: schemas.updateOrder }
)