// PATCH /api/admin/inventory
// Updates stock quantities for one or more products.
// Admin and Staff can update inventory.
//
// Body: [{ inventory_id: string, stock_quantity: number }]

import { NextResponse } from 'next/server'
import { withHandler } from '@/lib/middleware/withHandler'
import { createClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase-admin'

// GET /api/admin/inventory — fetch all inventory with product details
export const GET = withHandler(async (request) => {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const role = user.app_metadata?.role
  if (role !== 'ADMIN' && role !== 'STAFF') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data, error } = await supabaseAdmin
    .from('inventory')
    .select(`
      id,
      product_id,
      stock_quantity,
      low_stock_threshold,
      product:products (
        id,
        name,
        category,
        is_available
      )
    `)
    .order('product_id')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ inventory: data })
})

// PATCH /api/admin/inventory — bulk update stock quantities
export const PATCH = withHandler(async (request) => {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const role = user.app_metadata?.role
  if (role !== 'ADMIN' && role !== 'STAFF') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()

  // Expect array of { inventory_id, stock_quantity }
  if (!Array.isArray(body) || body.length === 0) {
    return NextResponse.json(
      { error: 'Body must be a non-empty array of { inventory_id, stock_quantity }' },
      { status: 400 }
    )
  }

  const MAX_UPDATES = 50
  if (body.length > MAX_UPDATES) {
    return NextResponse.json(
        { error: `Cannot update more than ${MAX_UPDATES} items at once. Received ${body.length}.` },
        { status: 400 }
    )
}

  // Validate each entry
  for (const entry of body) {
    if (!entry.inventory_id) {
      return NextResponse.json({ error: 'Each entry must have inventory_id' }, { status: 400 })
    }
    if (typeof entry.stock_quantity !== 'number' || entry.stock_quantity < 0) {
      return NextResponse.json(
        { error: `stock_quantity must be a non-negative number (got ${entry.stock_quantity})` },
        { status: 400 }
      )
    }
  }

  // Update each inventory row individually
  // Supabase doesn't support bulk upsert with different values per row without RPC
  const errors = []
  const updated = []

  for (const entry of body) {
    const { data, error } = await supabaseAdmin
      .from('inventory')
      .update({ stock_quantity: entry.stock_quantity })
      .eq('id', entry.inventory_id)
      .select('id, product_id, stock_quantity, low_stock_threshold')
      .single()

    if (error) {
      errors.push({ inventory_id: entry.inventory_id, error: error.message })
    } else {
      updated.push(data)
    }
  }

  if (errors.length > 0) {
    return NextResponse.json(
      { error: 'Some updates failed', failures: errors, updated },
      { status: 207 } // 207 Multi-Status — partial success
    )
  }

  return NextResponse.json({ updated, count: updated.length })
})