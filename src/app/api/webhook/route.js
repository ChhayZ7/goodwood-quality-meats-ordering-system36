import { stripe } from '@/lib/stripe'

// Stripe webhook - confirms payment, saves order
export async function POST(req) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  let event
  try {
    event = stripe.webhooks.constructEvent(
      body, sig, process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err) {
    return new Response('Webhook error', { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    // fulfil order, update DB, etc.
  }

  return new Response('ok')
}