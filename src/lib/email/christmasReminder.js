// src/lib/email/christmasReminder.js
// Christmas marketing email — sent annually on November 1st via pg_cron.
// Targets customers who completed an order in December of the previous year
// and have not unsubscribed from marketing emails.

import { resend } from '@/lib/resend'

const FROM           = 'Goodwood Quality Meats <orders@mail.goodwoodqualitymeats.com.au>'
const GOOGLE_MAPS    = 'https://maps.app.goo.gl/gymYkT4abq6wnSPc7'
const PRODUCTS_URL   = 'https://goodwoodqualitymeats.com.au/products'

// ─── HTML template ────────────────────────────────────────────────────────────

export function christmasReminderHtml({ firstName, unsubscribeUrl }) {
  return `
    <!DOCTYPE html>
    <html>
    <body style="margin: 0; padding: 0; background: #F9F9F9; font-family: Arial, sans-serif;">

      <table width="100%" cellpadding="0" cellspacing="0" style="background: #F9F9F9; padding: 32px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0"
              style="background: #ffffff; border-radius: 8px; overflow: hidden;
                     box-shadow: 0 2px 8px rgba(0,0,0,0.06);">

              <!-- Header -->
              <tr>
                <td style="background: #7B1A1A; padding: 32px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 22px; letter-spacing: 1px;">
                    Goodwood Quality Meats
                  </h1>
                  <p style="color: #F0C4C4; margin: 6px 0 0; font-size: 13px;
                             letter-spacing: 2px; text-transform: uppercase;">
                    Christmas Orders Are Open 🎄
                  </p>
                </td>
              </tr>

              <!-- Gold divider -->
              <tr>
                <td style="height: 3px; background: #C9A84C;"></td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="padding: 40px 40px 32px;">

                  <p style="font-size: 18px; font-weight: bold; color: #1A1A1A; margin: 0 0 16px;">
                    Hi ${firstName}, Christmas is just around the corner! 🎅
                  </p>

                  <p style="font-size: 14px; color: #555; line-height: 1.8; margin: 0 0 16px;">
                    You ordered with us last Christmas and we'd love to have you back this year.
                    Our premium Christmas meats are now available to pre-order — and with limited
                    stock, we recommend getting in early to avoid missing out.
                  </p>

                  <p style="font-size: 14px; color: #555; line-height: 1.8; margin: 0 0 28px;">
                    Secure your order today with just a <strong style="color: #7B1A1A;">$20 deposit</strong>,
                    with the balance payable at collection.
                  </p>

                  <!-- Why order early box -->
                  <table width="100%" cellpadding="0" cellspacing="0"
                    style="background: #FDF8F0; border-radius: 8px; border: 1px solid #E8D48A;
                           margin-bottom: 28px;">
                    <tr>
                      <td style="padding: 20px 24px;">
                        <p style="font-size: 11px; font-weight: bold; color: #7B1A1A;
                                  text-transform: uppercase; letter-spacing: 1px; margin: 0 0 12px;">
                          Why order early?
                        </p>
                        <p style="font-size: 13px; color: #555; line-height: 1.8; margin: 0;">
                          🥩 &nbsp;Premium cuts prepared fresh by our expert butchers<br/>
                          📦 &nbsp;Guaranteed stock — no Christmas Eve disappointment<br/>
                          💳 &nbsp;Only $20 deposit to secure your order today<br/>
                          📅 &nbsp;Choose your own pickup date
                        </p>
                      </td>
                    </tr>
                  </table>

                  <!-- CTA Button -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 32px;">
                    <tr>
                      <td align="center">
                        <a href="${PRODUCTS_URL}"
                          style="display: inline-block; background: #7B1A1A; color: #ffffff;
                                 text-decoration: none; padding: 16px 40px; border-radius: 8px;
                                 font-size: 15px; font-weight: bold; letter-spacing: 0.5px;">
                          Browse &amp; Order Now →
                        </a>
                      </td>
                    </tr>
                  </table>

                  <!-- Store info -->
                  <table width="100%" cellpadding="0" cellspacing="0"
                    style="background: #F9F9F9; border-radius: 8px; border: 1px solid #E5E5E5;
                           margin-bottom: 28px;">
                    <tr>
                      <td style="padding: 18px 24px;">
                        <p style="font-size: 13px; font-weight: bold; color: #1A1A1A; margin: 0 0 8px;">
                          Visit us in store
                        </p>
                        <p style="font-size: 13px; color: #555; line-height: 1.8; margin: 0;">
                          <a href="${GOOGLE_MAPS}" target="_blank">📍 &nbsp;121 Goodwood Road, Goodwood SA 5034</a><br/>
                          📞 &nbsp;08 8271 4183<br/>
                          🕐 &nbsp;Mon–Fri: 7am–5:30pm &nbsp;|&nbsp; Sat: 7am–12pm
                        </p>
                      </td>
                    </tr>
                  </table>

                  <p style="font-size: 14px; color: #555; line-height: 1.7; margin: 0;">
                    Questions? Call us on <strong>08 8271 4183</strong> or reply to this email.
                    <br/>We look forward to helping you have a wonderful Christmas!
                  </p>

                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background: #F9FAFB; padding: 20px 40px; border-top: 1px solid #E5E5E5;">
                  <p style="font-size: 12px; color: #9CA3AF; margin: 0; text-align: center;">
                    © Goodwood Quality Meats · 121 Goodwood Road, Goodwood SA 5034
                    <br/><br/>
                    You're receiving this because you ordered with us last Christmas.
                    <br/>
                    <a href="${unsubscribeUrl}"
                      style="color: #9CA3AF; text-decoration: underline; font-size: 12px;">
                      Unsubscribe from marketing emails
                    </a>
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>

    </body>
    </html>
  `
}

// ─── Send function ────────────────────────────────────────────────────────────

/**
 * Sends the Christmas marketing email to a single customer.
 * The cron route handles deduplication and unsubscribe filtering before calling this.
 *
 * @param {object} params
 * @param {string} params.customerEmail
 * @param {string} params.firstName
 * @param {string} params.unsubscribeUrl  - One-click unsubscribe URL with token
 */
export async function sendChristmasReminderEmail({
  customerEmail,
  firstName,
  unsubscribeUrl,
}) {
  return resend.emails.send({
    from:    FROM,
    to:      customerEmail,
    subject: '🎄 Christmas orders are open — order early to avoid missing out!',
    html:    christmasReminderHtml({ firstName, unsubscribeUrl }),
  })
}