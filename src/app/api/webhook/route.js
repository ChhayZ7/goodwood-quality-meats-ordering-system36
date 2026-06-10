// POST /api/webhook
// Stripe sends a POST request here when a payment event occurs.
// Handles payment_intent.succeeded, confirming the order,
// recording the payment, and sending the customer a confirmation email with invoice.
//
// Safety net: if the customer closes their browser after paying but
// before /api/checkout/confirm runs, this webhook still confirms the order automatically.
// File assisted with AI, console logging commented out.

import { stripe } from '@/lib/stripe'
import { recordPayment, updateOrder, getOrderById } from '@/lib/db/orders'
import { resend } from '@/lib/resend'
import { generateInvoicePDF } from '@/lib/pdf/invoice'
import { sendOrderConfirmationEmail } from '@/lib/email/orderConfirmation'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(req) {

  // Stripe sends the raw request body and a signature header.
  // Signature is verified using the webhook secret to confirm the request is genuine from Stripe.
  const body = await req.text()
  const sig  = req.headers.get('stripe-signature')

  let event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err) {
    return new Response('Webhook signature invalid', { status: 400 })
  }

  // Ignore all other Stripe event types except successful payments
  if (event.type === 'payment_intent.succeeded') {
    const intent  = event.data.object
    const orderId = intent.metadata?.order_id

    // Every PaymentIntent includes order_id in its metadata.
    // If it's missing, something went wrong during checkout setup.
    if (!orderId) {
      return new Response('ok')
    }

    // 1. Record the payment row in our database.
    // If /api/checkout/confirm already ran and recorded the payment,
    // the duplicate insert will be rejected by the unique constraint and ignored.
    const { error: paymentError } = await recordPayment({
      order_id:                 orderId,
      stripe_payment_intent_id: intent.id,
      amount_cents:             intent.amount,
      type:                     'DEPOSIT',
      status:                   'PAID',
    })

    // 2. Mark the order as CONFIRMED and record how much deposit was paid.
    // Safe to run even if /confirm already did this — updating to the same status is harmless.
    const { error: updateError } = await updateOrder(orderId, {
      status:             'CONFIRMED',
      deposit_paid_cents: intent.amount,
    })

    // 3. Fetch the full order including items and product details.
    // Needed to generate the invoice PDF and populate the email.
    const { data: order, error: orderFetchError } = await getOrderById(orderId)

    if (orderFetchError || !order) {
      // Order is already confirmed above — return ok so Stripe doesn't retry
      return new Response('ok')
    }

    // 4. Fetch the customer's profile for the email and invoice
    const { data: customer } = await supabaseAdmin
      .from('users')
      .select('id, first_name, last_name, email, phone')
      .eq('id', order.customer.id)
      .single()

    if (!customer?.email) {
      return new Response('ok')
    }

    // 5. Generate a PDF invoice to attach to the confirmation email.
    // If PDF generation fails we still send the email but without the attachment.
    const invoiceNumber = `GW-${orderId.slice(0, 8).toUpperCase()}`
    const pickupDate = order.pickup_date
      ? new Date(order.pickup_date).toLocaleDateString('en-AU', {
          day:   '2-digit',
          month: 'long',
          year:  'numeric',
        })
      : 'To be confirmed'

    let pdfBuffer
    try {
      pdfBuffer = await generateInvoicePDF(order, customer)
    } catch (pdfErr) {
      // PDF failed — email will still send without the attachment
    }

    // 6. Send the order confirmation email via Resend.
    // Email failures are logged but never block the response —
    // Stripe must receive a 200 ok or it will keep retrying the webhook.
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
      // console.error('[webhook] Email send failed:', emailErr.message)
    }
  }

  // Always return ok — Stripe will retry the webhook if it receives anything else
  return new Response('ok')
}