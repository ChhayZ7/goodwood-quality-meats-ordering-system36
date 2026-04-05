// All database operations for orders (retrieval, order creation etc)
// ROUTE FILES MUST IMPORT THIS to query database

import { supabase } from '@/lib/supabase'


const ORDER_ITEMS_SELECT = `
  id,
  quantity,
  weight_preference,
  unit_price_cents,
  subtotal_cents,
  notes,
  product:products (
    id,
    name,
    description,
    product_type,
    price_cents,
    price_per_kg_cents,
    is_price_estimate,
    image_url
  ),
  weight_option:product_weight_options (
    id,
    label,
    min_weight_kg,
    max_weight_kg
  )
`


// DATABASE QUERIES

/**
 * All orders for a customer, newest first.
 * Includes line items and product details.
 */
export async function getOrdersByCustomer(customerId) {
  return supabase
    .from('orders')
    .select(`
      id,
      status,
      pickup_date,
      notes,
      total_cents,
      deposit_required_cents,
      deposit_paid_cents,
      created_at,
      order_items (${ORDER_ITEMS_SELECT})
    `)
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false })
}

/**
 * Single order by ID with full detail:
 * customer info, line items, products, weight options, payments.
 */
export async function getOrderById(orderId) {
  return supabase
    .from('orders')
    .select(`
      id,
      status,
      pickup_date,
      notes,
      total_cents,
      deposit_required_cents,
      deposit_paid_cents,
      created_at,
      updated_at,
      customer:users (
        id,
        first_name,
        last_name,
        email,
        phone
      ),
      order_items (${ORDER_ITEMS_SELECT}),
      payments (
        id,
        amount_cents,
        type,
        status,
        provider,
        stripe_payment_intent_id,
        created_at
      )
    `)
    .eq('id', orderId)
    .single()
}


/**
 * Insert a new order and its line items (after successful payment)
 *
 * @param {{ customer_id, pickup_date, notes, deposit_required_cents }} orderData
 * @param {{ product_id, quantity, weight_option_id, weight_preference,
 *            unit_price_cents, subtotal_cents, notes }[]} items
 * @returns {{ data: { order_id: string } | null, error }}
 */
export async function createOrder(orderData, items) {
  const total_cents = items.reduce((sum, item) => sum + (item.subtotal_cents ?? 0), 0)

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      customer_id:            orderData.customer_id,
      pickup_date:            orderData.pickup_date,
      notes:                  orderData.notes ?? null,
      total_cents,
      deposit_required_cents: orderData.deposit_required_cents ?? 2000,
      deposit_paid_cents:     0,
      status:                 'PENDING',
    })
    .select('id')
    .single()

  if (orderError) return { data: null, error: orderError }

  const lineItems = items.map((item) => ({
    order_id:          order.id,
    product_id:        item.product_id,
    quantity:          item.quantity,
    weight_option_id:  item.weight_option_id ?? null,
    weight_preference: item.weight_preference ?? null,
    unit_price_cents:  item.unit_price_cents,
    subtotal_cents:    item.subtotal_cents,
    notes:             item.notes ?? null,
  }))

  const { error: itemsError } = await supabase.from('order_items').insert(lineItems)

  if (itemsError) {
    // Attempt to rollback if item insertion fails
    await supabase.from('orders').delete().eq('id', order.id)
    return { data: null, error: itemsError }
  }

  return { data: { order_id: order.id }, error: null }
}

/**
 * Update allowed fields on an order.
 * Only updates fields that are explicitly passed in.
 */
export async function updateOrder(orderId, fields) {
  const allowed = ['status', 'notes', 'pickup_date', 'deposit_paid_cents']
  const updates = Object.fromEntries(
    Object.entries(fields).filter(([k]) => allowed.includes(k))
  )

  return supabase
    .from('orders')
    .update(updates)
    .eq('id', orderId)
    .select('id, status, updated_at')
    .single()
}

/**
 * Record a payment row against an order.
 * Called after Stripe confirms payment server-side.
 */
export async function recordPayment({
  order_id,
  stripe_payment_intent_id,
  amount_cents,
  type,
  status,
}) {
  return supabase
    .from('payments')
    .insert({
      order_id,
      stripe_payment_intent_id,
      provider: 'stripe',
      amount_cents,
      type,
      status,
    })
    .select('id')
    .single()
}