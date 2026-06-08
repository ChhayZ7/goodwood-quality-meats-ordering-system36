// Stripe helpers for the checkout routes.

import Stripe from 'stripe'
import { supabaseAdmin } from '@/lib/supabase-admin'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing env var: STRIPE_SECRET_KEY')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
})

const DEPOSIT_CENTS = 2000 // $20 AUD

/**
 * Gets or creates a Stripe Customer for a user.
 * Stores the Stripe customer ID in the users table so it's reused
 * on future orders rather than creating duplicates.
 */
export async function getOrCreateStripeCustomer({ userId, email, name }) {
  // Check if user already has a Stripe customer ID stored
  const { data: profile } = await supabaseAdmin
    .from('users')
    .select('stripe_customer_id')
    .eq('id', userId)
    .single()

  if (profile?.stripe_customer_id) {
    return profile.stripe_customer_id
  }

  // Create a new Stripe Customer
  const customer = await stripe.customers.create({
    email,
    name,
    metadata: { supabase_user_id: userId },
  })

  // Save the Stripe customer ID back to your users table
  await supabaseAdmin
    .from('users')
    .update({ stripe_customer_id: customer.id })
    .eq('id', userId)

  return customer.id
}

/**
 * Create a Stripe PaymentIntent for the $20 deposit.
 * Frontend passes clientSecret to Stripe Elements for secure payment.
 */
export async function createDepositPaymentIntent({ orderId, customerEmail, stripeCustomerId }) {
  const intent = await stripe.paymentIntents.create({
    amount: DEPOSIT_CENTS,
    currency: 'aud',
    description: `$20 deposit — order ${orderId}`,
    customer: stripeCustomerId ?? undefined,
    receipt_email: customerEmail ?? undefined,
    metadata: {
      order_id: orderId,
      type: 'DEPOSIT',
    },
  })

  return {
    clientSecret: intent.client_secret,
    paymentIntentId: intent.id,
  }
}


// Retrieve a PaymentIntent from Stripe to verify its status server-side.
export async function getPaymentIntent(paymentIntentId) {
  return stripe.paymentIntents.retrieve(paymentIntentId)
}