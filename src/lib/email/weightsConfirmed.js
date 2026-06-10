// src/lib/email/weightsConfirmed.js
// Sent to the customer once staff have saved actual weights and the
// confirmed balance due is known. Fires from saveActualWeights() in
// the admin orders PATCH route — only when at least one weight changed.
// Includes the Final Invoice PDF as an attachment so the customer has a
// record of the exact weights and confirmed total before pickup.

import { resend } from '@/lib/resend'

const FROM         = 'Goodwood Quality Meats <orders@mail.goodwoodqualitymeats.com.au>'
const GOOGLE_MAPS  = 'https://maps.app.goo.gl/gymYkT4abq6wnSPc7'
const STORE_PHONE  = '08 8271 4183'
const STORE_ADDR   = '121 Goodwood Road, Goodwood SA 5034'

function formatCents(cents) {
  return `$${((cents ?? 0) / 100).toFixed(2)}`
}

function html({ firstName, invoiceNumber, pickupDate, totalCents, depositPaidCents, orderId }) {
  const balanceDue   = Math.max(0, (totalCents ?? 0) - (depositPaidCents ?? 0))
  const invoiceUrl   = `https://goodwoodqualitymeats.com.au/account/orders/${orderId}`

  return `
    <!DOCTYPE html>
    <html>
    <body style="margin:0;padding:0;background:#F9F9F9;font-family:Arial,sans-serif;">

      <table width="100%" cellpadding="0" cellspacing="0"
        style="background:#F9F9F9;padding:32px 0;">
        <tr><td align="center">
          <table width="600" cellpadding="0" cellspacing="0"
            style="background:#ffffff;border-radius:8px;overflow:hidden;
                   box-shadow:0 2px 8px rgba(0,0,0,0.06);">

            <!-- Header -->
            <tr>
              <td style="background:#7B1A1A;padding:32px;text-align:center;">
                <h1 style="color:#ffffff;margin:0;font-size:22px;letter-spacing:1px;">
                  Goodwood Quality Meats
                </h1>
                <p style="color:#F0C4C4;margin:6px 0 0;font-size:13px;
                           letter-spacing:2px;text-transform:uppercase;">
                  Your order has been weighed ✓
                </p>
              </td>
            </tr>

            <!-- Gold divider -->
            <tr><td style="height:3px;background:#C9A84C;"></td></tr>

            <!-- Body -->
            <tr>
              <td style="padding:40px 40px 32px;">

                <p style="font-size:18px;font-weight:bold;color:#1A1A1A;margin:0 0 16px;">
                  Hi ${firstName}, your order is ready to go! 🥩
                </p>

                <p style="font-size:14px;color:#555;line-height:1.8;margin:0 0 24px;">
                  Great news — our team has weighed and prepared your Christmas order
                  <strong style="color:#7B1A1A;">${invoiceNumber}</strong>.
                  Your confirmed balance is now available below, and your
                  <strong>Final Invoice is attached</strong> to this email.
                </p>

                <!-- Order summary box -->
                <table width="100%" cellpadding="0" cellspacing="0"
                  style="background:#FDF8F0;border-radius:8px;border:1px solid #E8D48A;
                         margin-bottom:28px;">
                  <tr>
                    <td style="padding:20px 24px;">
                      <p style="font-size:11px;font-weight:bold;color:#7B1A1A;
                                 text-transform:uppercase;letter-spacing:1px;margin:0 0 14px;">
                        Order Summary
                      </p>

                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="font-size:13px;color:#717182;padding-bottom:8px;">
                            Order number
                          </td>
                          <td style="font-size:13px;color:#1A1A1A;font-weight:bold;
                                     text-align:right;padding-bottom:8px;">
                            ${invoiceNumber}
                          </td>
                        </tr>
                        <tr>
                          <td style="font-size:13px;color:#717182;padding-bottom:8px;">
                            Pickup date
                          </td>
                          <td style="font-size:13px;color:#1A1A1A;font-weight:bold;
                                     text-align:right;padding-bottom:8px;">
                            ${pickupDate}
                          </td>
                        </tr>
                        <tr>
                          <td style="font-size:13px;color:#717182;
                                     border-top:1px solid #E8D48A;padding-top:10px;">
                            Deposit already paid
                          </td>
                          <td style="font-size:13px;color:#2D6A2D;font-weight:bold;
                                     text-align:right;border-top:1px solid #E8D48A;
                                     padding-top:10px;">
                            ${formatCents(depositPaidCents)}
                          </td>
                        </tr>
                        <tr>
                          <td style="font-size:13px;color:#717182;padding-top:6px;">
                            Confirmed total
                          </td>
                          <td style="font-size:13px;color:#1A1A1A;font-weight:bold;
                                     text-align:right;padding-top:6px;">
                            ${formatCents(totalCents)}
                          </td>
                        </tr>
                        <tr>
                          <td style="font-size:16px;font-weight:bold;color:#1A1A1A;
                                     padding-top:10px;border-top:1px solid #E8D48A;">
                            Balance due at pickup
                          </td>
                          <td style="font-size:18px;font-weight:bold;color:#7B1A1A;
                                     text-align:right;padding-top:10px;
                                     border-top:1px solid #E8D48A;">
                            ${formatCents(balanceDue)}
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>

                <!-- What to bring box -->
                <table width="100%" cellpadding="0" cellspacing="0"
                  style="background:#FEF9E7;border-radius:8px;border:1px solid #FAC775;
                         margin-bottom:28px;">
                  <tr>
                    <td style="padding:18px 24px;">
                      <p style="font-size:13px;font-weight:bold;color:#854F0B;margin:0 0 8px;">
                        What to bring on pickup day
                      </p>
                      <p style="font-size:13px;color:#854F0B;line-height:1.8;margin:0;">
                        💳 &nbsp;EFTPOS payment for your balance of
                        <strong>${formatCents(balanceDue)}</strong><br/>
                        📋 &nbsp;Your order number <strong>${invoiceNumber}</strong><br/>
                        🛍️ &nbsp;Bags or an esky to take your order home
                      </p>
                    </td>
                  </tr>
                </table>

                <!-- CTA — view final invoice in portal -->
                <table width="100%" cellpadding="0" cellspacing="0"
                  style="margin-bottom:28px;">
                  <tr>
                    <td align="center">
                      <a href="${invoiceUrl}"
                        style="display:inline-block;background:#7B1A1A;color:#ffffff;
                               text-decoration:none;padding:14px 32px;border-radius:8px;
                               font-size:14px;font-weight:bold;">
                        View Final Invoice →
                      </a>
                    </td>
                  </tr>
                </table>

                <!-- Store hours -->
                <table width="100%" cellpadding="0" cellspacing="0"
                  style="background:#F9F9F9;border-radius:8px;border:1px solid #E5E5E5;
                         margin-bottom:28px;">
                  <tr>
                    <td style="padding:18px 24px;">
                      <p style="font-size:13px;font-weight:bold;color:#1A1A1A;margin:0 0 8px;">
                        Store Hours
                      </p>
                      <p style="font-size:13px;color:#555;line-height:1.8;margin:0;">
                        Monday – Friday: <strong>7:00am – 5:30pm</strong><br/>
                        Saturday: <strong>7:00am – 12:00pm</strong><br/>
                        Sunday: <strong>Closed</strong>
                      </p>
                    </td>
                  </tr>
                </table>

                <!-- Directions -->
                <table width="100%" cellpadding="0" cellspacing="0"
                  style="margin-bottom:24px;">
                  <tr>
                    <td align="center">
                      <a href="${GOOGLE_MAPS}" target="_blank"
                        style="display:inline-block;background:#7B1A1A;color:#ffffff;
                               text-decoration:none;padding:12px 28px;border-radius:8px;
                               font-size:13px;font-weight:bold;">
                        📍 Get Directions
                      </a>
                      <p style="font-size:12px;color:#717182;margin:8px 0 0;">
                        ${STORE_ADDR}
                      </p>
                    </td>
                  </tr>
                </table>

                <p style="font-size:14px;color:#555;line-height:1.7;margin:0;">
                  Questions? Call us on <strong>${STORE_PHONE}</strong> or reply to
                  this email. We look forward to seeing you!
                </p>

              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background:#F9FAFB;padding:20px 40px;
                         border-top:1px solid #E5E5E5;">
                <p style="font-size:12px;color:#9CA3AF;margin:0;text-align:center;">
                  © Goodwood Quality Meats · ${STORE_ADDR}
                </p>
              </td>
            </tr>

          </table>
        </td></tr>
      </table>

    </body>
    </html>
  `
}

// ─── Main export ──────────────────────────────────────────────────────────────

/**
 * Sends the weights confirmed email with the Final Invoice PDF attached.
 *
 * @param {object} params
 * @param {string}  params.customerEmail
 * @param {string}  params.customerFirstName
 * @param {string}  params.orderId
 * @param {string}  params.pickupDate       - Formatted date string
 * @param {number}  params.totalCents       - Confirmed order total after weighing
 * @param {number}  params.depositPaidCents
 * @param {Buffer} [params.pdfBuffer]       - Final Invoice PDF; attached if provided.
 *                                            Email still sends without it if PDF
 *                                            generation failed.
 */
export async function sendWeightsConfirmedEmail({
  customerEmail,
  customerFirstName,
  orderId,
  pickupDate,
  totalCents,
  depositPaidCents,
  pdfBuffer,
}) {
  const invoiceNumber = `GW-${orderId.slice(0, 8).toUpperCase()}`
  const firstName     = customerFirstName ?? 'there'
  const balanceDue    = Math.max(0, (totalCents ?? 0) - (depositPaidCents ?? 0))

  const payload = {
    from:    FROM,
    to:      customerEmail,
    subject: `Your order ${invoiceNumber} has been weighed — balance due $${(balanceDue / 100).toFixed(2)}`,
    html:    html({ firstName, invoiceNumber, pickupDate, totalCents, depositPaidCents, orderId }),
  }

  // Attach the Final Invoice PDF if the caller was able to generate it.
  // If pdfBuffer is undefined (generation failed), the email still sends
  // without the attachment — the customer can still download it from the portal.
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