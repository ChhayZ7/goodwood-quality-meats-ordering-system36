// Stock validation and adjustment.
// validateStock is called before every order creation to prevent overselling.
// decrementStock is called after payment is confirmed to reduce available stock.

import { supabaseAdmin } from '@/lib/supabase-admin'

// Check that all items in the cart can be fulfilled from current stock.
// Called during checkout before the order is created, so if any item exceeds
// available stock, the whole checkout is blocked and the failures are returned
// so the frontend can tell the customer which items are unavailable.
//
// items: [{ product_id: string, quantity: number }]
// returns { ok: boolean, failures: [{ product_id, product_name, requested, available }] }
export async function validateStock(items) {
  const productIds = items.map((i) => i.product_id)

  // Fetch current stock for all products in the cart in a single query
  const { data: rows, error } = await supabaseAdmin
    .from('inventory')
    .select('product_id, stock_quantity, products(name)')
    .in('product_id', productIds)

  if (error) throw error

  // Map for faster lookup of items
  const stockMap = Object.fromEntries(
    rows.map((r) => [
      r.product_id,
      { stock: r.stock_quantity, name: r.products?.name ?? r.product_id },
    ])
  )

  const failures = []
  for (const item of items) {
    const entry = stockMap[item.product_id]

    // Product not found in inventory at all
    if (!entry) {
      failures.push({
        product_id: item.product_id,
        product_name: 'Unknown product',
        requested: item.quantity,
        available: 0,
      })
      continue
    }

    // Requested quantity exceeds stock
    if (item.quantity > entry.stock) {
      failures.push({
        product_id: item.product_id,
        product_name: entry.name,
        requested: item.quantity,
        available: entry.stock,
      })
    }
  }

  return { ok: failures.length === 0, failures }
}

// Reduce stock levels after a confirmed, paid order.
// Called once payment is verified in /api/checkout/confirm and the webhook.
//
// Uses the decrement_stock Postgres RPC function
// the function uses a row-level lock, prevents simultaneous product decrement errors
//
// items: [{ product_id: string, quantity: number }]
// returns { ok: boolean, errors: [{ product_id, error }] }
export async function decrementStock(items) {
  const errors = []

  for (const item of items) {
    const { error } = await supabaseAdmin.rpc('decrement_stock', {
      p_product_id: item.product_id,
      p_quantity: item.quantity,
    })

    if (error) errors.push({ product_id: item.product_id, error })
  }

  return { ok: errors.length === 0, errors }
}

// Fetch current stock levels for a list of product IDs.
// Used to show low-stock or sold-out badges on the product listing page.
export async function getStockLevels(productIds) {
  return supabaseAdmin
    .from('inventory')
    .select('product_id, stock_quantity, low_stock_threshold')
    .in('product_id', productIds)
}