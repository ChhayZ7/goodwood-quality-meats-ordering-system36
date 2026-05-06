// GET /api/recipes
// Returns all recipes (summary fields for listing page)

import { NextResponse } from 'next/server'
import { withHandler } from '@/lib/middleware/withHandler'
import { getRecipes } from '@/lib/db/recipes'

export const GET = withHandler(async () => {
  const { data, error } = await getRecipes()

  if (error) throw error

  return NextResponse.json({ recipes: data })
})