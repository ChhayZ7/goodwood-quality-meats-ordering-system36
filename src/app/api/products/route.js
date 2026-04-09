// GET /api/products
//   Returns all available products with weight options.

import { NextResponse } from 'next/server'
import { withHandler } from '@/lib/middleware/withHandler'
import { getProducts } from '@/lib/db/products'

export const GET = withHandler(async (request) => {
  const { searchParams } = new URL(request.url)
  const type          = searchParams.get('type') ?? undefined // type is either 'FIXED' or 'WEIGHT_RANGE'
  const availableOnly = searchParams.get('available') !== 'false' // true or false

  const { data, error } = await getProducts({ type, availableOnly })

  if (error) throw error

  return NextResponse.json({ products: data })
})