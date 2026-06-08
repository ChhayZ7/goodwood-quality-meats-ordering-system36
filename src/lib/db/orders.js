// All database operations for orders. fetching, creating, updating, and recording payments.
// Route files import from here rather than querying Supabase directly.

import { supabaseAdmin } from '@/lib/supabase-admin'

// Reusable select fragment for order line items.
// Included in both getOrdersByCustomer and getOrderById so both return
// the same shape, keeping the customer dashboard and confirmation page consistent.
// actual_weight_kg is included so the invoice PDF and order detail pages
// reflect the real weights once staff have entered them at pickup.
const ORDER_ITEMS_SELECT = `
  id,
  quantity,
  weight_preference,
  unit_price_cents,
  subtotal_cents,
  actual_weight_kg,
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

// ─── Queries ──────────────────────────────────────────────────────────────────

// Fetch all orders for a specific customer, newest first.
// Used by the customer order history dashboard.
export async function getOrdersByCustomer(customerId) {
  return supabaseAdmin
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

// Fetch a single order by ID with full detail.
// customer info, line items, and payment records. Used by the order confirmation page, invoice PDF,
// and the customer order detail view.
export async function getOrderById(orderId) {
  return supabaseAdmin
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

// Create a new order and its line items in a single operation.
// The order starts as PENDING — it only becomes CONFIRMED after payment succeeds.
// If inserting the line items fails, the order row is deleted to avoid abandoned orders.
//
// orderData: { customer_id, pickup_date, notes, deposit_required_cents }
// items: [{ product_id, quantity, weight_option_id, weight_preference, unit_price_cents, subtotal_cents, notes }]
// returns { data: { order_id: string } | null, error }
export async function createOrder(orderData, items) {

  // Calculate the estimated total from the line items
  const total_cents = items.reduce((sum, item) => sum + (item.subtotal_cents ?? 0), 0)

  const { data: order, error: orderError } = await supabaseAdmin
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

  // Map cart items to DB rows, attaching the new order ID to each
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

  const { error: itemsError } = await supabaseAdmin
    .from('order_items')
    .insert(lineItems)

  if (itemsError) {
    // Roll back the order row if line items fail to insert
    await supabaseAdmin.from('orders').delete().eq('id', order.id)
    return { data: null, error: itemsError }
  }

  return { data: { order_id: order.id }, error: null }
}

// Update allowed fields on an order.
// Whitelisted to prevent arbitrary column writes from route handlers.
export async function updateOrder(orderId, fields) {
  const allowed = ['status', 'notes', 'pickup_date', 'deposit_paid_cents', 'reminder_sent']
  const updates = Object.fromEntries(
    Object.entries(fields).filter(([k]) => allowed.includes(k))
  )

  return supabaseAdmin
    .from('orders')
    .update(updates)
    .eq('id', orderId)
    .select('id, status, updated_at')
    .single()
}

// Record a payment row against an order.
// Called after Stripe confirms payment server-side in /api/checkout/confirm
// and from the Stripe webhook as a safety net.
export async function recordPayment({
  order_id,
  stripe_payment_intent_id,
  amount_cents,
  type,
  status,
}) {
  return supabaseAdmin
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