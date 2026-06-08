// src/app/api/admin/products/[id]/route.js
//
// GET    /api/admin/products/:id  — fetch a single product with its weight options
// PATCH  /api/admin/products/:id  — update product fields and sync weight options
// DELETE /api/admin/products/:id  — delete product and its weight options (admin only)
//
// GET and PATCH are accessible to both ADMIN and STAFF.
// DELETE is restricted to ADMIN only.

import { createClient } from '@/lib/supabase-server'
import { withHandler } from '@/lib/middleware/withHandler'


// ─── GET ──────────────────────────────────────────────────────────────────────
export const GET = withHandler(async (request, { params }) => {
    console.log('[/api/admin/products/[id]] GET called') //to test if GET is being called
    const supabase = await createClient()
    const { id } = await params


    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
        return Response.json({ error: 'Unauthorised' }, { status: 401 })
    }

    // Both admin and staff can read product details
    const role = user.app_metadata?.role
    if (role !== 'ADMIN' && role !== 'STAFF') {
        return Response.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { data: product, error } = await supabase
        .from('products')
        .select('*, product_weight_options(*)')
        .eq('id', id)
        .single()

    if (error) return Response.json({ error: error.message }, { status: 500 })
    if (!product) return Response.json({ error: 'Product not found' }, { status: 404 })

    return Response.json({ product })
})


// ─── PATCH ────────────────────────────────────────────────────────────────────
export const PATCH = withHandler(async (request, { params }) => {
    const supabase = await createClient()
    const { id } = await params

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
        return Response.json({ error: 'Unauthorised' }, { status: 401 })
    }
    const role = user.app_metadata?.role
    if (role !== 'ADMIN' && role != 'STAFF') {
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
        // weight_options is synced separately below - not a plain DB column
        weight_options,
    } = body

    // Build the update object from only the fields that were sent
    const updates = {}
    if (name !== undefined) updates.name = name
    if (description !== undefined) updates.description = description
    if (category !== undefined) updates.category = category
    if (product_type !== undefined) updates.product_type = product_type
    if (price_cents !== undefined) updates.price_cents = price_cents
    if (price_per_kg_cents !== undefined) updates.price_per_kg_cents = price_per_kg_cents
    if (is_available !== undefined) updates.is_available = is_available
    if (image_url !== undefined) updates.image_url = image_url

    const { error: updateError } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)

    if (updateError) return Response.json({ error: updateError.message }, { status: 500 })

    // ── Sync weight options ────────────────────────────────────────────────────
    // Only runs when the product type is WEIGHT_RANGE and weight_options was sent.
    // Split into existing rows (have an id) and new rows (no id yet).
    if (weight_options !== undefined && product_type === 'WEIGHT_RANGE') {
        const existing = weight_options.filter(o => o.id)
        const newOpts = weight_options.filter(o => !o.id)

        // Delete any weight options that are no longer in the list
        const keepIds = existing.map(o => o.id)
        const { error: deleteError } = await supabase
            .from('product_weight_options')
            .delete()
            .eq('product_id', id)
            .not('id', 'in', keepIds.length > 0 ? `(${keepIds.join(',')})` : '(null)')

        if (deleteError) return Response.json({ error: deleteError.message }, { status: 500 })

        // Update labels and weight ranges for existing options
        for (const opt of existing) {
            await supabase
                .from('product_weight_options')
                .update({ label: opt.label, min_weight_kg: opt.min_weight_kg, max_weight_kg: opt.max_weight_kg })
                .eq('id', opt.id)
        }

        // Insert any brand-new options
        if (newOpts.length > 0) {
            const rows = newOpts.map(o => ({
                product_id: id,
                label: o.label,
                min_weight_kg: o.min_weight_kg,
                max_weight_kg: o.max_weight_kg,
            }))
            const { error: insertError } = await supabase
                .from('product_weight_options')
                .insert(rows)
            if (insertError) return Response.json({ error: insertError.message }, { status: 500 })
        }
    }

    // If the product type is being switched to FIXED, remove all weight options —
    // they're meaningless for fixed-price products
    if (product_type === 'FIXED') {
        await supabase.from('product_weight_options').delete().eq('product_id', id)
    }

    // Return the full updated product (including synced weight options)
    const { data: full, error: fetchError } = await supabase
        .from('products')
        .select('*, product_weight_options(*)')
        .eq('id', id)
        .single()

    if (fetchError) return Response.json({ error: fetchError.message }, { status: 500 })

    return Response.json({ product: full })
})

// ─── DELETE ───────────────────────────────────────────────────────────────────
export const DELETE = withHandler(async (request, { params }) => {
    const supabase = await createClient()
    const { id } = await params

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
        return Response.json({ error: 'Unauthorised' }, { status: 401 })
    }

    // DELETE is admin-only — staff should not be able to remove products
    const role = user.app_metadata?.role
    if (role !== 'ADMIN') {
        return Response.json({ error: 'Forbidden — admin only' }, { status: 403 })
    }

    // Delete weight options first to satisfy the foreign key constraint on
    // product_weight_options.product_id before removing the product itself
    const { error: woError } = await supabase
        .from('product_weight_options')
        .delete()
        .eq('product_id', id)

    if (woError) return Response.json({ error: woError.message }, { status: 500 })

    const { error: productError } = await supabase
        .from('products')
        .delete()
        .eq('id', id)

    if (productError) return Response.json({ error: productError.message }, { status: 500 })

    // 204 No Content — deletion succeeded, nothing to return
    return new Response(null, { status: 204 })
})