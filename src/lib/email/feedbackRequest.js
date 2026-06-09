// src/lib/email/feedbackRequest.js
// Sent when an order is marked COMPLETED.
// Includes the Final Invoice PDF as an attachment — this is the fully paid
// receipt showing confirmed weights, confirmed total, and zero balance due.
// The feedback link is the primary CTA; the PDF gives the customer a
// permanent record of their completed order in the same email.

import { resend } from '@/lib/resend'

const FROM = 'Goodwood Quality Meats <no-reply@mail.goodwoodqualitymeats.com.au>'

/**
 * Sends the post-completion feedback request with the Final Invoice attached.
 *
 * @param {object}  params
 * @param {string}  params.customerEmail
 * @param {string}  params.customerFirstName
 * @param {string}  params.orderId
 * @param {Buffer} [params.pdfBuffer] - Final Invoice PDF; attached if provided.
 *                                      Email still sends without it if PDF
 *                                      generation failed.
 */
export async function sendFeedbackRequestEmail({
  customerEmail,
  customerFirstName,
  orderId,
  pdfBuffer,
}) {
  const invoiceNumber = `GW-${orderId.slice(0, 8).toUpperCase()}`
  const feedbackUrl   = `https://goodwoodqualitymeats.com.au/account/orders/${orderId}/feedback`

  const payload = {
    from:    FROM,
    to:      customerEmail,
    subject: `Thank you for your order, ${customerFirstName} — your receipt is attached`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1A1A1A;">

        <div style="background: #7B1A1A; padding: 32px; text-align: center;">
          <h1 style="color: #fff; margin: 0; font-size: 22px; letter-spacing: 1px;">
            Goodwood Quality Meats
          </h1>
          <p style="color: #F0C4C4; margin: 6px 0 0; font-size: 13px;
                    letter-spacing: 2px; text-transform: uppercase;">
            Order Complete ✓
          </p>
        </div>

        <div style="height: 3px; background: #C9A84C;"></div>

        <div style="padding: 40px 32px;">

          <h2 style="font-size: 22px; color: #7B1A1A; margin: 0 0 16px;">
            Thank you, ${customerFirstName}!
          </h2>

          <p style="color: #555; line-height: 1.7; margin: 0 0 16px;">
            Your order <strong>${invoiceNumber}</strong> is now complete.
            Your <strong>Final Invoice</strong> is attached to this email as a PDF —
            it shows your confirmed weights and the total amount paid.
          </p>

          <p style="color: #555; line-height: 1.7; margin: 0 0 28px;">
            We hope you enjoy your order. We'd love to hear how everything was —
            it only takes a moment.
          </p>

          <!-- Feedback CTA -->
          <div style="text-align: center; margin: 32px 0;">
            <a href="${feedbackUrl}"
              style="display: inline-block; background: #7B1A1A; color: #fff;
                     text-decoration: none; padding: 14px 32px; border-radius: 8px;
                     font-size: 15px; font-weight: bold;">
              Leave a Review ★
            </a>
          </div>

          <p style="color: #9CA3AF; font-size: 12px; text-align: center; margin: 0;">
            If the button doesn't work, copy this link:<br/>
            <a href="${feedbackUrl}" style="color: #7B1A1A;">${feedbackUrl}</a>
          </p>

        </div>

        <div style="background: #F9FAFB; padding: 20px 32px; text-align: center;
                    border-top: 1px solid #E5E5E5;">
          <p style="color: #9CA3AF; font-size: 12px; margin: 0;">
            © Goodwood Quality Meats · 121 Goodwood Road, Goodwood SA 5034
          </p>
        </div>

      </div>
    `,
  }

  // Attach the Final Invoice PDF so the customer has a permanent paid receipt.
  // If pdfBuffer is undefined (generation failed upstream), the email still
  // sends without it — the customer can download it from the portal.
  if (pdfBuffer) {
    payload.attachments = [
      {
        filename:    `${invoiceNumber}-final-invoice.pdf`,
        content:     pdfBuffer.toString('base64'),
        contentType: 'application/pdf',
      },
    ]
  }

  await resend.emails.send(payload)
}