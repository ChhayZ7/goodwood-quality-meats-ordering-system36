// GET /api/recipes/[id]
// Returns a single recipe with all fields for the recipe detail page

import { NextResponse } from 'next/server'
// withHandler is a middleware wrapper that handles errors and wraps the route in a try/catch
import { withHandler } from '@/lib/middleware/withHandler'
import { getRecipeById } from '@/lib/db/recipes'

// params contains the dynamic route segment — [id] from the URL
export const GET = withHandler(async (request, { params }) => {
  const { id } = await params

  // retrieve single recipe to be displayed in recipe detail
  const { data, error } = await getRecipeById(id)

  // if DB error, throw it so withHandler catches and returns a 500
  if (error) throw error

  // if no recipe found for the given id, return 404
  if (!data) {
    return NextResponse.json({ error: 'Recipe not found' }, { status: 404 })
  }

  return NextResponse.json({ recipe: data })
})