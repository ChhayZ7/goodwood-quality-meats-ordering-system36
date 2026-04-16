import { stripe } from '@/lib/stripe'
import { recordPayment, updateOrder, getOrderById } from '@/lib/db/orders'
import { decrementStock } from '@/lib/db/inventory'
import { resend } from '@/lib/resend'
import { generateInvoicePDF } from '@/lib/pdf/invoice'
import { orderConfirmationHtml } from '@/lib/email/orderConfirmation'
import { supabaseAdmin } from '@/lib/supabase-admin'

// POST /api/webhook
// Stripe webhook — confirms payment, generates PDF invoice, emails customer

export async function POST(req) {
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
    console.error('[webhook] Signature verification failed:', err.message)
    return new Response('Webhook signature invalid', { status: 400 })
  }

  if (event.type === 'payment_intent.succeeded') {
    const intent  = event.data.object
    const orderId = intent.metadata?.order_id

    if (!orderId) {
      console.error('[webhook] Missing order_id in metadata')
      return new Response('ok')
    }

    // 1. Record payment (idempotent — safe if /confirm already ran)
    const { error: paymentError } = await recordPayment({
      order_id:                 orderId,
      stripe_payment_intent_id: intent.id,
      amount_cents:             intent.amount,
      type:                     'DEPOSIT',
      status:                   'PAID',
    })

    if (paymentError && paymentError.code !== '23505') {
      console.error('[webhook] recordPayment error:', paymentError)
    }

    // 2. Update order status to CONFIRMED
    const { error: updateError } = await updateOrder(orderId, {
      status:             'CONFIRMED',
      deposit_paid_cents: intent.amount,
    })

    if (updateError) {
      console.error('[webhook] updateOrder error:', updateError)
    }

    // 3. Fetch full order with items and products for the invoice
    const { data: order, error: orderFetchError } = await getOrderById(orderId)

    if (orderFetchError || !order) {
      console.error('[webhook] Could not fetch order for invoice:', orderFetchError)
      return new Response('ok') // Already confirmed — don't block Stripe
    }

    // 4. Fetch customer profile
    const { data: customer } = await supabaseAdmin
      .from('users')
      .select('id, first_name, last_name, email, phone')
      .eq('id', order.customer.id)
      .single()

    if (!customer?.email) {
      console.error('[webhook] No customer email found for order:', orderId)
      return new Response('ok')
    }

    // 5. Generate PDF invoice
const invoiceNumber = `GW-${orderId.slice(0, 8).toUpperCase()}`
const pickupDate = order.pickup_date
  ? new Date(order.pickup_date).toLocaleDateString('en-AU', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  : 'To be confirmed'

console.log('[webhook] Generating PDF...')
let pdfBuffer
try {
  pdfBuffer = await generateInvoicePDF(order, customer)
  console.log('[webhook] PDF generated, buffer size:', pdfBuffer?.length)
} catch (pdfErr) {
  console.error('[webhook] PDF generation failed:', pdfErr.message)
  console.error('[webhook] PDF error stack:', pdfErr.stack)
}

// 6. Send confirmation email
console.log('[webhook] Attempting to send email to:', customer.email)
console.log('[webhook] PDF attached:', !!pdfBuffer)
try {
  const emailPayload = {
    from:    'Goodwood Quality Meats <onboarding@resend.dev>',
    to:      customer.email,
    subject: `Order confirmed — ${invoiceNumber} — pickup ${pickupDate}`,
    html:    orderConfirmationHtml({
      customer,
      order,
      invoiceNumber,
      pickupDate,
    }),
  }

  if (pdfBuffer) {
    emailPayload.attachments = [
      {
        filename:    `${invoiceNumber}.pdf`,
        content:     pdfBuffer.toString('base64'),
        contentType: 'application/pdf',
      },
    ]
  }

  const result = await resend.emails.send(emailPayload)
  console.log('[webhook] Resend result:', JSON.stringify(result))

    } catch (emailErr) {
      console.error('[webhook] Email send failed:', emailErr.message)
      console.error('[webhook] Email error details:', JSON.stringify(emailErr))
    }
  }

  return new Response('ok')
}