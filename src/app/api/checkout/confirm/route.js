import { NextResponse } from 'next/server'
import { withHandler, schemas } from '@/lib/middleware/withHandler'
import { getPaymentIntent } from '@/lib/stripe'
import { recordPayment, updateOrder } from '@/lib/db/orders'
import { decrementStock } from '@/lib/db/inventory'

// POST /api/checkout/confirm

// Called after Stripe Elements confirms the payment client-side.
// Verify server-side NOT client-side

export const POST = withHandler(
  async (request) => {
    const { order_id, payment_intent_id, items } = request._body

    // Verify with Stripe
    const paymentIntent = await getPaymentIntent(payment_intent_id)

    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json(
        {
          error:         'Payment has not been completed',
          stripe_status: paymentIntent.status,
          status:        402,
        },
        { status: 402 }
      )
    }

    // ensure this PaymentIntent belongs to this order
    if (paymentIntent.metadata?.order_id !== order_id) {
      return NextResponse.json(
        { error: 'Payment does not match this order', status: 400 },
        { status: 400 }
      )
    }

    // Record payment
    const { error: paymentError } = await recordPayment({
      order_id,
      stripe_payment_intent_id: payment_intent_id,
      amount_cents:             paymentIntent.amount,
      type:                     'DEPOSIT',
      status:                   'PAID',
    })

    if (paymentError) throw paymentError

    // Decrement stock
    const { ok: stockOk, errors: stockErrors } = await decrementStock(items)

    if (!stockOk) {
      // Order is paid, log the error but don't block
      // Fix stock manually
      console.error('[checkout/confirm] Stock decrement errors:', stockErrors)
    }

    // Confirm order
    const { error: updateError } = await updateOrder(order_id, {
      status:             'CONFIRMED',
      deposit_paid_cents: paymentIntent.amount,
    })

    if (updateError) throw updateError

    return NextResponse.json({ order_id, status: 'CONFIRMED' })
  },
  { schema: schemas.confirmPayment }
)