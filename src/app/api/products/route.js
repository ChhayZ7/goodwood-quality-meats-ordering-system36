// GET /api/products
// Returns single product based on product ID with weight options

import { NextResponse } from 'next/server'
import { withHandler } from '@/lib/middleware/withHandler'
import { getProductById} from '@/lib/db/products'

export const GET = withHandler(async (request, { params }) => {
  const { id } = await params
  const { data, error } = await getProductById(id)

  if (error) throw error
  if (!data) {
    return NextResponse.json({error: 'Product not found', status: 404}, {status: 404})
  }

  return NextResponse.json({ product: data })
})