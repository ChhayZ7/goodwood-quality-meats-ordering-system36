// // GET all products from Supabase (to be adjusted)
// export async function GET() {
//   const { data, error } = await supabase
//     .from('products')
//     .select('*')

//   if (error) return Response.json({ error }, { status: 500 })
//   return Response.json(data)
// }


// GET /api/products
//   Returns all available products with weight options.
//
//   Query params:
//     ?type=FIXED          — only fixed products
//     ?type=WEIGHT_RANGE   — only weighable products
//     ?available=false     — include unavailable products (admin use)

import { NextResponse } from 'next/server'
import { withHandler } from '@/lib/middleware/withHandler'
import { getProducts } from '@/lib/db/products'

export const GET = withHandler(async (request) => {
  const { searchParams } = new URL(request.url)
  const type          = searchParams.get('type') ?? undefined
  const availableOnly = searchParams.get('available') !== 'false'

  const { data, error } = await getProducts({ type, availableOnly })

  if (error) throw error

  return NextResponse.json({ products: data })
})