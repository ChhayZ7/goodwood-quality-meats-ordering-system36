// All database reads related to recipes
// Uses supabaseAdmin (service role) to bypass row-level security for server-side reads
import { supabaseAdmin } from '@/lib/supabase-admin'

// Summary fields only 
// used for the recipe listing page
// Excludes heavy fields like ingredients and method to keep the response light
const RECIPE_SELECT_SUMMARY = `
  id,
  name,
  category,
  image_url,
  description
`

// Full fields used for the recipe detail page where everything needs to be displayed
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
// Orders by created_at descending so the newest recipes appear first
export async function getRecipes() {
  return supabaseAdmin
    .from('recipes')
    .select(RECIPE_SELECT_SUMMARY)
    .order('created_at', { ascending: false })
}

// Fetch a single recipe by ID with all fields
// .eq filters by matching id, .single() returns one object instead of an array
export async function getRecipeById(recipeId) {
  return supabaseAdmin
    .from('recipes')
    .select(RECIPE_SELECT_FULL)
    .eq('id', recipeId)
    .single()
}