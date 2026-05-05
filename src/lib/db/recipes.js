// All database reads related to recipes

import { supabaseAdmin } from '@/lib/supabase-admin'

const RECIPE_SELECT_SUMMARY = `
  id,
  name,
  category,
  image_url,
  description
`

const RECIPE_SELECT_FULL = `
  id,
  name,
  category,
  created_at,
  created_by,
  image_url,
  description,
  servings,
  prep_time,
  cooking_time,
  total_time,
  equipment,
  ingredients,
  method,
  recipe_source
`

// Fetch all recipes (summary fields only for listing page)
export async function getRecipes() {
  return supabaseAdmin
    .from('recipes')
    .select(RECIPE_SELECT_SUMMARY)
    .order('created_at', { ascending: false })
}

// Fetch a single recipe by ID with all fields
export async function getRecipeById(recipeId) {
  return supabaseAdmin
    .from('recipes')
    .select(RECIPE_SELECT_FULL)
    .eq('id', recipeId)
    .single()
}