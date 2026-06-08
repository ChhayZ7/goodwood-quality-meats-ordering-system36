// src/app/api/webhook/route.js
// Stripe webhook — confirms payment and emails the customer a confirmation
// invoice. Falls back gracefully if PDF generation fails; the order is already
// confirmed so we never block Stripe with a non-200 on email/PDF failures.

import { stripe } from '@/lib/stripe'
import {
  recordPayment, updateOrder,
  getOrderById
} from '@/lib/db/orders'
import { decrementStock } from '@/lib/db/inventory'
import { generateInvoicePDF } from '@/lib/pdf/invoice'
import { sendOrderConfirmationEmail } from '@/lib/email/orderConfirmation'
import { supabaseAdmin } from '@/lib/supabase-admin'

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

  if (event.type === 'payment_intent.succeeded') {
    const intent = event.data.object
    const orderId = intent.metadata?.order_id

    if (!orderId) {
      console.error('[webhook] Missing order_id in metadata')
      return new Response('ok')
    }

    // 1. Record payment (idempotent — safe if /confirm already ran)
    const { error: paymentError } = await recordPayment({
      order_id: orderId,
      stripe_payment_intent_id: intent.id,
      amount_cents: intent.amount,
      type: 'DEPOSIT',
      status: 'PAID',
    })

    if (paymentError && paymentError.code !== '23505') {
      console.error('[webhook] recordPayment error:', paymentError)
    }

    // 2. Update order status to CONFIRMED
    const { error: updateError } = await updateOrder(orderId, {
      status: 'CONFIRMED',
      deposit_paid_cents: intent.amount,
    })

    if (updateError) {
      console.error('[webhook] updateOrder error:', updateError)
    }

    // 3. Fetch full order and customer for the email + invoice
    const { data: order, error: orderFetchError } = await getOrderById(orderId)

    if (orderFetchError || !order) {
      console.error('[webhook] Could not fetch order for invoice:', orderFetchError)
      return new Response('ok') // Already confirmed — don't block Stripe
    }

    const { data: customer } = await supabaseAdmin
      .from('users')
      .select('id, first_name, last_name, email, phone')
      .eq('id', order.customer.id)
      .single()

    if (!customer?.email) {
      console.error('[webhook] No customer email found for order:', orderId)
      return new Response('ok')
    }

    // 4. Generate PDF invoice (non-fatal if it fails)
    const invoiceNumber = `GW-${orderId.slice(0, 8).toUpperCase()}`
    const pickupDate = order.pickup_date
      ? new Date(order.pickup_date).toLocaleDateString('en-AU', {
        day: '2-digit', month: 'long', year: 'numeric',
      })
      : 'To be confirmed'

    let pdfBuffer
    try {
      pdfBuffer = await generateInvoicePDF(order, customer)
      console.log('[webhook] PDF generated, size:', pdfBuffer?.length)
    } catch (pdfErr) {
      console.error('[webhook] PDF generation failed:', pdfErr.message)
    }

    // 5. Send confirmation email (with optional PDF attachment)
    try {
      const result = await sendOrderConfirmationEmail({
        customer,
        order,
        invoiceNumber,
        pickupDate,
        pdfBuffer, // undefined if PDF failed — sendOrderConfirmationEmail handles this
      })
      console.log('[webhook] Email sent:', JSON.stringify(result))
    } catch (emailErr) {
      console.error('[webhook] Email send failed:', emailErr.message)
    }
  }

  return new Response('ok')
}