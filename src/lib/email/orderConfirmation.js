// src/lib/email/orderConfirmation.js
// Order confirmation email — sent via the Stripe webhook after deposit is paid.
// Exports both the HTML template builder and the send function so the webhook
// route only needs to call sendOrderConfirmationEmail() rather than importing
// resend directly.

import { resend } from '@/lib/resend'

const FROM = 'Goodwood Quality Meats <orders@mail.goodwoodqualitymeats.com.au>'

// ─── HTML template ────────────────────────────────────────────────────────────

export function orderConfirmationHtml({ customer, order, invoiceNumber, pickupDate }) {
  const depositFormatted = `$${((order.deposit_paid_cents ?? 2000) / 100).toFixed(2)}`
  const totalFormatted   = `$${((order.total_cents ?? 0) / 100).toFixed(2)}`
  const balanceFormatted = `$${(((order.total_cents ?? 0) - (order.deposit_paid_cents ?? 2000)) / 100).toFixed(2)}`

  const itemLines = (order.order_items ?? []).map(item => {
    const product    = item.product ?? {}
    const isWeight   = product.product_type === 'WEIGHT_RANGE'
    const weightText = item.weight_option
      ? item.weight_option.label
      : item.weight_preference ?? ''

    return `<li>
      ${product.name ?? 'Product'} × ${item.quantity}
      ${isWeight ? `— ${weightText}` : ''}
      ${item.notes ? `<br/><small>Note: ${item.notes}</small>` : ''}
    </li>`
  }).join('')

  return `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; font-size: 14px; color: #1A1A1A; padding: 24px;">

      <h2>Order Confirmed — Goodwood Quality Meats</h2>

      <p>Hi ${customer.first_name}, your Christmas order is confirmed and your deposit is secured.</p>

      <hr />

      <p><strong>Invoice number:</strong> ${invoiceNumber}</p>
      <p><strong>Pickup date:</strong> ${pickupDate}</p>

      <h3>Your order</h3>
      <ul>${itemLines}</ul>

      <p><strong>Estimated total:</strong> ${totalFormatted}</p>
      <p><strong>Deposit paid:</strong> ${depositFormatted}</p>
      <p><strong>Balance due at pickup:</strong> ${balanceFormatted}</p>

      <hr />

      <p>Our team will weigh your order before your pickup date. Please pay the remaining
      balance in store via EFTPOS at collection.</p>

      <p>Questions? Call us on <strong>08 8271 4183</strong> or reply to this email.</p>

      <p>— Goodwood Quality Meats</p>

    </body>
    </html>
  `
}

// ─── Send function ────────────────────────────────────────────────────────────

/**
 * Sends the order confirmation email with an optional PDF invoice attachment.
 *
 * @param {object} params
 * @param {object} params.customer         - { email, first_name, last_name, ... }
 * @param {object} params.order            - Full order object with order_items
 * @param {string} params.invoiceNumber    - e.g. "GW-ABC12345"
 * @param {string} params.pickupDate       - Formatted date string e.g. "24 December 2025"
 * @param {Buffer} [params.pdfBuffer]      - Optional PDF to attach
 */
export async function sendOrderConfirmationEmail({
  customer,
  order,
  invoiceNumber,
  pickupDate,
  pdfBuffer,
}) {
  const payload = {
    from:    FROM,
    to:      customer.email,
    subject: `Order confirmed — ${invoiceNumber} — pickup ${pickupDate}`,
    html:    orderConfirmationHtml({ customer, order, invoiceNumber, pickupDate }),
  }

  // Attach the PDF invoice if the webhook was able to generate it
  if (pdfBuffer) {
    payload.attachments = [
      {
        filename:    `${invoiceNumber}.pdf`,
        content:     pdfBuffer.toString('base64'),
        contentType: 'application/pdf',
      },
    ]
  }

  return resend.emails.send(payload)
}