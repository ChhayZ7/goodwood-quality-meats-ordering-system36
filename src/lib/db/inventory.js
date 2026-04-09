// Stock validation and adjustment.
// validateStock is called before every order creation to prevent overselling.

import { supabaseAdmin } from '@/lib/supabase-admin'  // ← was @/lib/supabase (file doesn't exist)


// Check all cart items can be fulfilled from current stock.
// items: [{ product_id: string, quantity: number }]
// returns { ok: boolean, failures: [{ product_id, product_name, requested, available }] }
export async function validateStock(items) {
  const productIds = items.map((i) => i.product_id)

  const { data: rows, error } = await supabaseAdmin
    .from('inventory')
    .select('product_id, stock_quantity, products(name)')
    .in('product_id', productIds)

  if (error) throw error

  const stockMap = Object.fromEntries(
    rows.map((r) => [
      r.product_id,
      { stock: r.stock_quantity, name: r.products?.name ?? r.product_id },
    ])
  )

  const failures = []

  for (const item of items) {
    const entry = stockMap[item.product_id]

    if (!entry) {
      failures.push({
        product_id:   item.product_id,
        product_name: 'Unknown product',
        requested:    item.quantity,
        available:    0,
      })
      continue
    }

    if (item.quantity > entry.stock) {
      failures.push({
        product_id:   item.product_id,
        product_name: entry.name,
        requested:    item.quantity,
        available:    entry.stock,
      })
    }
  }

  return { ok: failures.length === 0, failures }
}


// Decrement stock after a confirmed, paid order.
// Uses the decrement_stock Postgres function for safe concurrent updates (defined in Supabase).
// items: [{ product_id: string, quantity: number }]
// returns { ok: boolean, errors: [{ product_id, error }] }
export async function decrementStock(items) {
  const errors = []

  for (const item of items) {
    const { error } = await supabaseAdmin.rpc('decrement_stock', {
      p_product_id: item.product_id,
      p_quantity:   item.quantity,
    })
    if (error) errors.push({ product_id: item.product_id, error })
  }

  return { ok: errors.length === 0, errors }
}


// Fetch stock levels for a list of product IDs.
// Useful for showing low-stock badges on the product listing page.
export async function getStockLevels(productIds) {
  return supabaseAdmin
    .from('inventory')
    .select('product_id, stock_quantity, low_stock_threshold')
    .in('product_id', productIds)
}