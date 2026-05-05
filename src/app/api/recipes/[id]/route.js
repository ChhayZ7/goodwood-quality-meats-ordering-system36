// GET /api/recipes/[id]
// Returns a single recipe with all fields

import { NextResponse } from 'next/server'
import { withHandler } from '@/lib/middleware/withHandler'
import { getRecipeById } from '@/lib/db/recipes'

export const GET = withHandler(async (request, { params }) => {
  const { id } = await params

  const { data, error } = await getRecipeById(id)

  if (error) throw error
  if (!data) {
    return NextResponse.json({ error: 'Recipe not found' }, { status: 404 })
  }

  return NextResponse.json({ recipe: data })
})