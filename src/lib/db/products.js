// All database reads related to products

import { supabaseAdmin } from '@/lib/supabase-admin'

const PRODUCT_SELECT = `
  id,
  name,
  description,
  product_type,
  category,
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

//Admin function 
//Fetch all products including unavailable one

export async function getAllProductsAdmin(){
  return supabaseAdmin
  .from('products')
  .select(PRODUCT_SELECT)
  .order('name')
}

//This is to let the admin create new product and select weight options

export async function createProduct(payload) {
  const { weight_options, ...productData } = payload
 
  // Insert the product
  const { data: product, error } = await supabaseAdmin
    .from('products')
    .insert(productData)
    .select(PRODUCT_SELECT)
    .single()
 
  if (error) return { data: null, error }
 
  // Insert weight options if provided
  if (weight_options?.length > 0) {
    const rows = weight_options.map(o => ({
      product_id:    product.id,
      label:         o.label,
      min_weight_kg: o.min_weight_kg,
      max_weight_kg: o.max_weight_kg,
    }))
    const { error: woError } = await supabaseAdmin
      .from('product_weight_options')
      .insert(rows)
 
    if (woError) return { data: null, error: woError }
  }
 
  // Re-fetch with weight options included
  return getProductById(product.id)
}
 
// Update an existing product and sync its weight options
export async function updateProduct(productId, payload) {
  const { weight_options, ...productData } = payload
 
  // Update the product fields
  const { error } = await supabaseAdmin
    .from('products')
    .update(productData)
    .eq('id', productId)
 
  if (error) return { data: null, error }
 
  // Sync weight options if provided
  if (weight_options !== undefined) {
    const existing = weight_options.filter(o => o.id)
    const newOpts  = weight_options.filter(o => !o.id)
 
    // Update existing rows
    for (const opt of existing) {
      const { id, ...fields } = opt
      await supabaseAdmin
        .from('product_weight_options')
        .update(fields)
        .eq('id', id)
    }
 
    // Insert new rows
    if (newOpts.length > 0) {
      await supabaseAdmin
        .from('product_weight_options')
        .insert(newOpts.map(o => ({ ...o, product_id: productId })))
    }
 
    // Delete removed rows — any existing id not in the updated list
    const keptIds = existing.map(o => o.id)
    if (keptIds.length > 0) {
      await supabaseAdmin
        .from('product_weight_options')
        .delete()
        .eq('product_id', productId)
        .not('id', 'in', `(${keptIds.join(',')})`)
    } else {
      // All weight options removed
      await supabaseAdmin
        .from('product_weight_options')
        .delete()
        .eq('product_id', productId)
    }
  }
 
  // Re-fetch with updated data
  return getProductById(productId)
}