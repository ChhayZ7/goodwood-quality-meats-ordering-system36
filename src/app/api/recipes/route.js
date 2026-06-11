// GET /api/recipes
// Returns all recipes (summary fields only for the listing page)

import { NextResponse } from 'next/server'
// withHandler is a middleware wrapper that handles errors and wraps the route in a try/catch
import { withHandler } from '@/lib/middleware/withHandler'
import { getRecipes } from '@/lib/db/recipes'

export const GET = withHandler(async () => {
  const { data, error } = await getRecipes()

  // if DB error, throw it so withHandler catches and returns a 500
  if (error) throw error

  return NextResponse.json({ recipes: data })
})