// All database reads related to products

import { supabaseAdmin } from '@/lib/supabase-admin'  // ← was @/lib/supabase (file doesn't exist)

const PRODUCT_SELECT = `
  id,
  name,
  description,
  product_type,
  price_cents,
  price_per_kg_cents,
  is_price_estimate,
  is_available,
  image_url,
  product_weight_options (
    id,
    label,
    min_weight_kg,
    max_weight_kg
  )
`


// Fetch all products with optional filters.
// type is either 'FIXED' or 'WEIGHT_RANGE'
// availableOnly is a boolean
export async function getProducts({ type, availableOnly = true } = {}) {
  let q = supabaseAdmin.from('products').select(PRODUCT_SELECT).order('name')
  if (type) q = q.eq('product_type', type)
  if (availableOnly) q = q.eq('is_available', true)
  return q
}


// Fetch a single product by ID with its weight options.
export async function getProductById(productId) {
  return supabaseAdmin
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('id', productId)
    .single()
}