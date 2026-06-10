// src/app/api/admin/products/route.js
//
// GET  /api/admin/products  — list all products (including unavailable ones)
// POST /api/admin/products  — create a new product with optional weight options
//
// Both endpoints are accessible to ADMIN and STAFF.
// Unlike the public /api/products endpoint, this returns all products
// regardless of is_available, so staff can see and manage out-of-season items.

import { createClient } from '@/lib/supabase-server'
import { withHandler } from '@/lib/middleware/withHandler'

// ─── GET ──────────────────────────────────────────────────────────────────────
export const GET = withHandler(async (request) => {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user){
        return Response.json({ error: 'Unauthorised' }, { status: 401 })
    }
    const role = user.app_metadata?.role
    if (role !== 'ADMIN' && role != 'STAFF'){
        return Response.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Order by created_at ascending so newer products appear at the bottom
    // of the product management table (consistent with data entry order)
    const { data: products, error } = await supabase
        .from('products')
        .select('*, product_weight_options(*)')
        .order('created_at', { ascending: true })

    if (error) return Response.json({ error: error.message }, { status: 500})

    return Response.json({ products })
})

// ─── POST ─────────────────────────────────────────────────────────────────────
export const POST = withHandler(async (request) => {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user){
        return Response.json({ error: 'Unauthorised' }, { status: 401 })
    }
    const role = user.app_metadata?.role
    if (role !== 'ADMIN' && role != 'STAFF'){
        return Response.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const {
        name, 
        description,
        category,
        product_type,
        price_cents,
        price_per_kg_cents,
        is_available,
        image_url,
        weight_options = [], // optional - pnly relevant for WEIGHT_RANGE [products]
    } = body

    // Validate
    if (!name || !category || !product_type){
        return Response.json({ error: 'name, category, and product_type are required' }, {
            status: 400
        })
    }

    // Insert the product row first so we have an id to attach weight options to
    const { data: product, error: productError } = await supabase
        .from('products')
        .insert({
            name,
            description: description ?? '',
            category, 
            product_type,
            // Only one price field is relevant depending on product type;
            // set the other to 0 so neither column is ever NULL
            price_cents: product_type === 'FIXED' ? price_cents: 0,
            price_per_kg_cents: product_type === 'WEIGHT_RANGE' ? price_per_kg_cents : 0,
            is_available: is_available ?? true,
            image_url: image_url ?? null,
        })
        .select()
        .single()

    if (productError) return Response.json({ error: productError.message }, { status: 500})

    // Insert weight options for WEIGHT_RANGE products.
    // Fixed-price products don't have weight options so this block is skipped.
    if (product_type === 'WEIGHT_RANGE' && weight_options.length > 0) {
        const rows = weight_options.map(o => ({
            product_id: product.id,
            label: o.label,
            min_weight_kg: o.min_weight_kg,
            max_weight_kg: o.max_weight_kg,
        }))

        const { error: woError } = await supabase
            .from('product_weight_options')
            .insert(rows)

        if (woError) return Response.json({ error: woError.message }, { status: 500 })
    }

    // Re-fetch the product with its weight options to return a complete object
    const { data: full } = await supabase
        .from('products')
        .select('*, product_weight_options(*)')
        .eq('id', product.id)
        .single()
    // 201 Created
    return Response.json({ product: full}, { status: 201})
})