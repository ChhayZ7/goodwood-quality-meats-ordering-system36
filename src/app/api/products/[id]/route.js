// src/app/api/products/[id]/route.js
// GET /api/products/:id — single product detail with weight options.
//
// Public endpoint — no authentication required.
// Called by the product detail page when a customer clicks through from the listing.
// Weight options are always included so the page can render the weight selector
// without a second request.

import { NextResponse } from 'next/server'
import { withHandler } from '@/lib/middleware/withHandler'
import { getProductById } from '@/lib/db/products'

export const GET = withHandler(async (request, { params }) => {
  const { id } = await params 

  const { data, error } = await getProductById(id)

  // withHandler catches unexpected DB errors — only surface a clean 404 here
  if (error) throw error
  if (!data) {
    return NextResponse.json({ error: 'Product not found', status: 404 }, { status: 404 })
  }

  return NextResponse.json({ product: data })
})