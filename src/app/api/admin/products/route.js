import { createClient } from '@/lib/supabase-server'
import { withHandler } from '@/lib/middleware/withHandler'

// GET /api/admin/products - list all products with weight options
export const GET = withHandler(async (request) => {
    const supabase = await createClient()

    // Check admin role
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user){
        return Response.json({ error: 'Unauthorised' }, { status: 401 })
    }
    const role = user.app_metadata?.role
    console.log('User role:', role)
    if (role !== 'ADMIN' && role != 'STAFF'){
        return Response.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { data: products, error } = await supabase
        .from('products')
        .select('*, product_weight_options(*)')
        .order('created_at', { ascending: true })

    if (error) return Response.json({ error: error.message }, { status: 500})

    return Response.json({ products })
})

// POST /api/admin/products - create a new product
export const POST = withHandler(async (request) => {
    const supabase = await createClient()

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
        weight_options = []
    } = body

    // Validate
    if (!name || !category || !product_type){
        return Response.json({ error: 'name, category, and product_type are required' }, {
            status: 400
        })
    }

    // Insert product
    const { data: product, error: productError } = await supabase
        .from('products')
        .insert({
            name,
            description: description ?? '',
            category, 
            product_type,
            price_cents: product_type === 'FIXED' ? price_cents: 0,
            price_per_kg_cents: product_type === 'WEIGHT_RANGE' ? price_per_kg_cents : 0,
            is_available: is_available ?? true,
        })
        .select()
        .single()

    if (productError) return Response.json({ error: productError.message }, { status: 500})

    // Insert weight options if WEIGHT_RANGE
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

    // Fetch full product with weight options to return
    const { data: full } = await supabase
        .from('products')
        .select('*, product_weight_options(*)')
        .eq('id', product.id)
        .single()

    return Response.json({ product: full}, { status: 201})
})