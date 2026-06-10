// src/app/api/checkout/route.js
// POST /api/checkout — Step 1 of 2 in the checkout flow.
//
// Validates the cart, creates an order at PENDING status, and returns a
// Stripe clientSecret so the frontend can collect the $20 deposit without
// card data ever touching our server.
//
// Flow:
//   1. Validate stock         → 409 if any item exceeds available inventory
//   2. Enforce $20 minimum    → 400 if cart total is under $20
//   3. Create order (PENDING) → stock is NOT decremented yet
//   4. Get/create Stripe Customer
//   5. Create Stripe PaymentIntent for $20 deposit
//   6. Return { order_id, clientSecret, paymentIntentId }
//
// Next step: frontend calls POST /api/checkout/confirm after Stripe
// collects payment — that route moves the order from PENDING → CONFIRMED.
import { NextResponse } from 'next/server'
import { withHandler, schemas } from '@/lib/middleware/withHandler'
import { validateStock } from '@/lib/db/inventory'
import { createOrder } from '@/lib/db/orders'
import { createDepositPaymentIntent } from '@/lib/stripe'

export const POST = withHandler(
  async (request) => {
    const {
      customer_id,
      customer_email,
      pickup_date,
      notes,
      deposit_required_cents,
      items,
    } = request._body

    // ── 1. Stock validation ───────────────────────────────────────────────────
    // Reject before creating anything in the DB.
    // failures array tells the frontend exactly which items are the problem.
    const { ok, failures } = await validateStock(items)

    if (!ok) {
      return NextResponse.json(
        {
          error:    'Some items exceed available stock',
          failures, // [{ product_id, product_name, requested, available }]
          status:   409,
        },
        { status: 409 }
      )
    }
    
    // ── 2. Minimum order value ────────────────────────────────────────────────
    // $20 minimum ensures the deposit never equals or exceeds the whole order.
    const total = items.reduce((sum, item) => sum + item.subtotal_cents, 0)

    if (total < 2000) { // return error if under $20
      return NextResponse.json(
        {
          error: 'Minimum order value is $20.00',
          total_cents: total,
          status: 400,
        },
        { status: 400 }
      )
    }

    // ── 3. Create order ───────────────────────────────────────────────────────
    // Status starts at PENDING — not CONFIRMED — because payment hasn't happened yet.
    // Stock is intentionally NOT decremented here; /confirm does that after payment
    // succeeds, so an abandoned cart never eats into available inventory.
    const { data: orderData, error: orderError } = await createOrder(
      { customer_id, pickup_date, notes, deposit_required_cents },
      items
    )

    if (orderError) throw orderError

    // ── 4. Stripe Customer ────────────────────────────────────────────────────
    // Reuses an existing Stripe Customer if one was created for a previous order.
    // Cached in public.users.stripe_customer_id to avoid duplicate records in
    // the Stripe dashboard.
    const { getOrCreateStripeCustomer } = await import('@/lib/stripe')
    const stripeCustomerId = await getOrCreateStripeCustomer({
      userId: customer_id,
      email:  customer_email,
      name:   customer_email,
    })

    // ── 5. Create Stripe PaymentIntent ($20 deposit only) ─────────────────────
    // order_id is stored in PaymentIntent metadata so /confirm can verify
    // this payment actually belongs to this order — not a recycled one.
    const { clientSecret, paymentIntentId } = await createDepositPaymentIntent({
      orderId:          orderData.order_id,
      customerEmail:    customer_email,
      stripeCustomerId,
    })

    // ── 6. Return to frontend ─────────────────────────────────────────────────
    return NextResponse.json({
      order_id:        orderData.order_id,
      clientSecret, // Stripe Elements uses this to render the payment form
      paymentIntentId, // sent back in the /confirm request body
    })
  },
  { schema: schemas.createOrder }
)