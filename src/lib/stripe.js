// Stripe helpers for the checkout routes.

import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing env var: STRIPE_SECRET_KEY')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
})


const DEPOSIT_CENTS = 2000 // $20 AUD in cents, set deposit value


// Create a Stripe PaymentIntent for the $20 deposit.
//Frontend passes clientSecret to Stripe for secure payment

// orderId and customerEmail are strings
// returns clientSecret: string, paymentIntentId: string
export async function createDepositPaymentIntent({ orderId, customerEmail }) {
  const intent = await stripe.paymentIntents.create({
    amount:        DEPOSIT_CENTS,
    currency:      'aud',
    description:   `$20 deposit — order ${orderId}`,
    receipt_email: customerEmail ?? undefined,
    metadata: {
      order_id: orderId,
      type:     'DEPOSIT',
    },
  })

  return {
    clientSecret:    intent.client_secret,
    paymentIntentId: intent.id,
  }
}

// Retrieve a PaymentIntent from Stripe to verify its status server-side.
export async function getPaymentIntent(paymentIntentId) {
  return stripe.paymentIntents.retrieve(paymentIntentId)
}