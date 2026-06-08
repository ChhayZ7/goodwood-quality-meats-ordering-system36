// src/app/api/products/route.js
// GET /api/products — public product listing for the storefront.
//
// No authentication required — this endpoint is called by the products page
// before the customer logs in. Auth is only required at checkout.
//
// Query params (all optional):
//   ?type=FIXED|WEIGHT_RANGE — filter to one product type only
//   ?available=false         — include unavailable products (omit for available-only)
//
// Default behaviour with no params: returns all available products, both types,
// ordered alphabetically by name.
//
// Contrast with GET /api/admin/products — that endpoint returns ALL products
// including unavailable ones, and requires ADMIN or STAFF role.

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