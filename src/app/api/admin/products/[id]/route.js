import { createClient } from '@/lib/supabase-server'
import { withHandler } from '@/lib/middleware/withHandler'


// GET /api/admin/products/[id] - fetch a single product
export const GET = withHandler(async (request, { params }) => {
    console.log('[/api/admin/products/[id]] GET called') //to test if GET is being called
    const supabase = await createClient()
    const { id } = await params


    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
        return Response.json({ error: 'Unauthorised' }, { status: 401 })
    }
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


// PATCH /api/admin/products/[id] - update product + sync weight options
export const PATCH = withHandler(async (request, { params }) => {
    const supabase = await createClient()
    const { id } = await params
    
    // Check admin role
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
        weight_options, // array of { id?, label, min_weight_kg, max_weight_kg }
    } = body

    // Update product row
    const updates = {}
    if (name !== undefined) updates.name = name
    if (description !== undefined) updates.description = description
    if (category !== undefined) updates.category = category
    if (product_type !== undefined) updates.product_type = product_type
    if (price_cents !== undefined) updates.price_cents = price_cents
    if (price_per_kg_cents !== undefined) updates.price_per_kg_cents = price_per_kg_cents
    if (is_available !== undefined) updates.is_available = is_available

    const { error: updateError } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)

    if (updateError) return Response.json({ error: updateError.message }, { status: 500 })

    // Sync weight options if provided
    if (weight_options !== undefined && product_type === 'WEIGHT_RANGE') {
        // Split into existing (has id) and new (no id)
        const existing = weight_options.filter(o => o.id)
        const newOpts = weight_options.filter(o => !o.id)

        // IDs that should remain
        const keepIds = existing.map(o => o.id)

        // Delete removed options
        const { error: deleteError } = await supabase
            .from('product_weight_options')
            .delete()
            .eq('product_id', id)
            .not('id', 'in', keepIds.length > 0 ? `(${keepIds.join(',')})` : '(null)')

        if (deleteError) return Response.json({ error: deleteError.message }, { status: 500})

        // Upsert existing options
        for (const opt of existing){
            await supabase
            .from ('product_weight_options')
            .update({ label: opt.label, min_weight_kg: opt.min_weight_kg, max_weight_kg: opt.max_weight_kg})
            .eq('id', opt.id)
        }

        // Insert new options
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

    // If swithcing to FIXED, delete all weight options
    if (product_type === 'FIXED') {
        await supabase.from('product_weight_options').delete().eq('product_id', id)
    }

    // Return updated product with weight options
    const { data: full, error: fetchError } = await supabase
        .from('products')
        .select('*, product_weight_options(*)')
        .eq('id', id)
        .single()

    if (fetchError) return Response.json({ error: fetchError.message }, { status: 500})

    return Response.json({ product: full })
})

// DELETE /api/admin/products/[id] - delete a product and its weight options
export const DELETE = withHandler(async (request, { params }) => {
  const supabase = await createClient()
  const { id } = await params

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return Response.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const role = user.app_metadata?.role
  if (role !== 'ADMIN') {
    return Response.json({ error: 'Forbidden — admin only' }, { status: 403 })
  }

  // Delete weight options first (foreign key constraint)
  const { error: woError } = await supabase
    .from('product_weight_options')
    .delete()
    .eq('product_id', id)

  if (woError) return Response.json({ error: woError.message }, { status: 500 })

  // Delete the product
  const { error: productError } = await supabase
    .from('products')
    .delete()
    .eq('id', id)

  if (productError) return Response.json({ error: productError.message }, { status: 500 })

  return new Response(null, { status: 204 })
})