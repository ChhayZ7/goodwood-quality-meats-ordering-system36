import { stripe } from '@/lib/stripe'
import { recordPayment, updateOrder } from '@/lib/db/orders'
import { decrementStock } from '@/lib/db/inventory'

// POST /api/webhook
//
// Stripe webhook — alternative confirmation path to /api/checkout/confirm.


export async function POST(req) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  let event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err) {
    console.error('[webhook] Signature verification failed:', err.message)
    return new Response('Webhook signature invalid', { status: 400 })
  }

  // Fired when a PaymentIntent is successfully confirmed.
  if (event.type === 'payment_intent.succeeded') {
    const intent = event.data.object
    const orderId = intent.metadata?.order_id

    if (!orderId) {
      console.error('[webhook] payment_intent.succeeded missing order_id in metadata')
      return new Response('ok') // Acknowledge so Stripe doesn't retry
    }

    // Record payment (idempotent — safe to call even if /confirm already ran)
    const { error: paymentError } = await recordPayment({
      order_id:                 orderId,
      stripe_payment_intent_id: intent.id,
      amount_cents:             intent.amount,
      type:                     'DEPOSIT',
      status:                   'PAID',
    })

    if (paymentError) {
      // If it's a unique constraint error the payment was already recorded by /confirm — safe to ignore
      if (paymentError.code !== '23505') {
        console.error('[webhook] recordPayment error:', paymentError)
      }
    }

    // Confirm order status
    const { error: updateError } = await updateOrder(orderId, {
      status:             'CONFIRMED',
      deposit_paid_cents: intent.amount,
    })

    if (updateError) {
      console.error('[webhook] updateOrder error:', updateError)
    }
  }

  return new Response('ok')
}