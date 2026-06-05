// src/lib/email/orderStatus.js
// Handles all order status change emails.
// Single entry point — call sendOrderStatusEmail() from the API route.

import { resend } from '@/lib/resend'

const FROM = 'Goodwood Quality Meats <orders@mail.goodwoodqualitymeats.com.au>'
const STORE_ADDRESS = '121 Goodwood Road, Goodwood SA 5034'
const STORE_PHONE   = '08 8271 4183'
const GOOGLE_MAPS   = 'https://maps.app.goo.gl/gymYkT4abq6wnSPc7'

// ─── Shared helpers ───────────────────────────────────────────────────────────

function header(tagline) {
  return `
    <table width="100%" cellpadding="0" cellspacing="0"
      style="background: #7B1A1A; padding: 32px; text-align: center;">
      <tr>
        <td>
          <h1 style="color: #ffffff; margin: 0; font-size: 22px; letter-spacing: 1px;">
            Goodwood Quality Meats
          </h1>
          <p style="color: #F0C4C4; margin: 6px 0 0; font-size: 13px;
                     letter-spacing: 2px; text-transform: uppercase;">
            ${tagline}
          </p>
        </td>
      </tr>
    </table>
    <tr><td style="height: 3px; background: #C9A84C;"></td></tr>
  `
}

function footer() {
  return `
    <tr>
      <td style="background: #F9FAFB; padding: 20px 40px; border-top: 1px solid #E5E5E5;">
        <p style="font-size: 12px; color: #9CA3AF; margin: 0; text-align: center;">
          © Goodwood Quality Meats · ${STORE_ADDRESS}
        </p>
      </td>
    </tr>
  `
}

function wrapper(rows) {
  return `
    <!DOCTYPE html>
    <html>
    <body style="margin: 0; padding: 0; background: #F9F9F9; font-family: Arial, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0"
        style="background: #F9F9F9; padding: 32px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0"
              style="background: #ffffff; border-radius: 8px; overflow: hidden;
                     box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
              ${rows}
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `
}

function infoBox(items) {
  return `
    <table width="100%" cellpadding="0" cellspacing="0"
      style="background: #FDF8F0; border-radius: 8px; border: 1px solid #E8D48A;
             margin-bottom: 24px;">
      <tr>
        <td style="padding: 18px 24px;">
          ${items.map(item => `
            <p style="font-size: 13px; color: #555; line-height: 1.8; margin: 0;">
              ${item}
            </p>
          `).join('')}
        </td>
      </tr>
    </table>
  `
}

// ─── IN_PROGRESS template ─────────────────────────────────────────────────────

function inProgressHtml({ firstName, invoiceNumber, pickupDate }) {
  return wrapper(`
    ${header("We're Preparing Your Order 🔪")}
    <tr>
      <td style="padding: 40px 40px 32px;">
        <p style="font-size: 18px; font-weight: bold; color: #1A1A1A; margin: 0 0 16px;">
          Good news, ${firstName}!
        </p>
        <p style="font-size: 14px; color: #555; line-height: 1.8; margin: 0 0 24px;">
          Our team has started preparing your Christmas order
          <strong style="color: #7B1A1A;">${invoiceNumber}</strong>.
          We're carefully selecting and preparing your meats to make sure
          everything is perfect for your Christmas table.
        </p>

        ${infoBox([
          `📋 &nbsp;Order: <strong>${invoiceNumber}</strong>`,
          `📅 &nbsp;Pickup date: <strong>${pickupDate}</strong>`,
        ])}

        <p style="font-size: 14px; color: #555; line-height: 1.7; margin: 0;">
          We'll send you another email as soon as your order is ready for pickup.
          <br/><br/>
          Questions? Call us on <strong>${STORE_PHONE}</strong>.
        </p>
      </td>
    </tr>
    ${footer()}
  `)
}

// ─── READY template ───────────────────────────────────────────────────────────

function readyHtml({ firstName, invoiceNumber, pickupDate, balanceDue }) {
  return wrapper(`
    ${header('Your Order Is Ready for Pickup! 🥩')}
    <tr>
      <td style="padding: 40px 40px 32px;">
        <p style="font-size: 18px; font-weight: bold; color: #1A1A1A; margin: 0 0 16px;">
          Your order is ready, ${firstName}!
        </p>
        <p style="font-size: 14px; color: #555; line-height: 1.8; margin: 0 0 24px;">
          Your Christmas order <strong style="color: #7B1A1A;">${invoiceNumber}</strong>
          has been prepared and is ready for collection. We look forward to seeing you!
        </p>

        ${infoBox([
          `📋 &nbsp;Order: <strong>${invoiceNumber}</strong>`,
          `📅 &nbsp;Pickup date: <strong>${pickupDate}</strong>`,
          `💳 &nbsp;Balance due at pickup: <strong style="color: #7B1A1A;">${balanceDue}</strong>`,
        ])}

        <!-- What to bring -->
        <table width="100%" cellpadding="0" cellspacing="0"
          style="background: #FEF9E7; border-radius: 8px; border: 1px solid #FAC775;
                 margin-bottom: 24px;">
          <tr>
            <td style="padding: 18px 24px;">
              <p style="font-size: 13px; font-weight: bold; color: #854F0B; margin: 0 0 8px;">
                What to bring
              </p>
              <p style="font-size: 13px; color: #555; line-height: 1.8; margin: 0;">
                💳 &nbsp;EFTPOS payment for your balance of <strong>${balanceDue}</strong><br/>
                📋 &nbsp;Your order number <strong>${invoiceNumber}</strong><br/>
                🛍️ &nbsp;Bags or an esky for your order
              </p>
            </td>
          </tr>
        </table>

        <!-- Store hours -->
        <table width="100%" cellpadding="0" cellspacing="0"
          style="background: #F9F9F9; border-radius: 8px; border: 1px solid #E5E5E5;
                 margin-bottom: 24px;">
          <tr>
            <td style="padding: 18px 24px;">
              <p style="font-size: 13px; font-weight: bold; color: #1A1A1A; margin: 0 0 8px;">
                Store Hours
              </p>
              <p style="font-size: 13px; color: #555; line-height: 1.8; margin: 0;">
                Monday – Friday: <strong>7:00am – 5:30pm</strong><br/>
                Saturday: <strong>7:00am – 12:00pm</strong><br/>
                Sunday: <strong>Closed</strong>
              </p>
            </td>
          </tr>
        </table>

        <!-- Directions button -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
          <tr>
            <td align="center">
              <a href="${GOOGLE_MAPS}" target="_blank"
                style="display: inline-block; background: #7B1A1A; color: #ffffff;
                       text-decoration: none; padding: 14px 32px; border-radius: 8px;
                       font-size: 14px; font-weight: bold;">
                📍 Get Directions
              </a>
              <p style="font-size: 12px; color: #717182; margin: 8px 0 0;">
                ${STORE_ADDRESS}
              </p>
            </td>
          </tr>
        </table>

        <p style="font-size: 14px; color: #555; line-height: 1.7; margin: 0;">
          Questions? Call us on <strong>${STORE_PHONE}</strong>.
        </p>
      </td>
    </tr>
    ${footer()}
  `)
}

// ─── CANCELLED template ───────────────────────────────────────────────────────

function cancelledHtml({ firstName, invoiceNumber, reason }) {
  return wrapper(`
    ${header('Order Cancelled')}
    <tr>
      <td style="padding: 40px 40px 32px;">
        <p style="font-size: 18px; font-weight: bold; color: #1A1A1A; margin: 0 0 16px;">
          Hi ${firstName}, we're sorry to let you know
        </p>
        <p style="font-size: 14px; color: #555; line-height: 1.8; margin: 0 0 24px;">
          Your order <strong style="color: #7B1A1A;">${invoiceNumber}</strong> has been
          cancelled. We sincerely apologise for any inconvenience this may cause.
        </p>

        ${reason ? `
          <table width="100%" cellpadding="0" cellspacing="0"
            style="background: #FEF2F2; border-radius: 8px; border: 1px solid #FECACA;
                   margin-bottom: 24px;">
            <tr>
              <td style="padding: 18px 24px;">
                <p style="font-size: 13px; font-weight: bold; color: #991B1B;
                           margin: 0 0 6px;">
                  Reason for cancellation
                </p>
                <p style="font-size: 13px; color: #555; line-height: 1.7; margin: 0;">
                  ${reason}
                </p>
              </td>
            </tr>
          </table>
        ` : ''}

        <p style="font-size: 14px; color: #555; line-height: 1.8; margin: 0 0 24px;">
          If you have already paid a deposit, please contact us and we will arrange
          a full refund as soon as possible.
        </p>

        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
          <tr>
            <td align="center">
              <a href="tel:+61882714183"
                style="display: inline-block; background: #7B1A1A; color: #ffffff;
                       text-decoration: none; padding: 14px 32px; border-radius: 8px;
                       font-size: 14px; font-weight: bold;">
                📞 Call Us — ${STORE_PHONE}
              </a>
            </td>
          </tr>
        </table>

        <p style="font-size: 14px; color: #555; line-height: 1.7; margin: 0;">
          We hope to be able to help you again soon.
        </p>
      </td>
    </tr>
    ${footer()}
  `)
}

// ─── Email subjects ───────────────────────────────────────────────────────────

const SUBJECTS = {
  IN_PROGRESS: (invoiceNumber) =>
    `We're preparing your order ${invoiceNumber}`,
  READY: (invoiceNumber) =>
    `Your order ${invoiceNumber} is ready for pickup! 🥩`,
  CANCELLED: (invoiceNumber) =>
    `Your order ${invoiceNumber} has been cancelled`,
}

// ─── Main export ──────────────────────────────────────────────────────────────

/**
 * Sends an order status change email to the customer.
 * Call this from the admin order PATCH route after a status update.
 *
 * @param {object} params
 * @param {string} params.newStatus     - The new order status (IN_PROGRESS, READY, CANCELLED)
 * @param {string} params.customerEmail
 * @param {string} params.customerFirstName
 * @param {string} params.orderId
 * @param {string} params.pickupDate    - Formatted date string e.g. "Wednesday, 24 December 2025"
 * @param {number} params.totalCents
 * @param {number} params.depositPaidCents
 * @param {string} [params.reason]      - Cancellation reason (CANCELLED only)
 */
export async function sendOrderStatusEmail({
  newStatus,
  customerEmail,
  customerFirstName,
  orderId,
  pickupDate,
  totalCents,
  depositPaidCents,
  reason,
}) {
  const invoiceNumber = `GW-${orderId.slice(0, 8).toUpperCase()}`
  const balanceDue    = `$${((totalCents - depositPaidCents) / 100).toFixed(2)}`
  const firstName     = customerFirstName ?? 'there'

  const STATUSES_TO_EMAIL = ['IN_PROGRESS', 'READY', 'CANCELLED']
  if (!STATUSES_TO_EMAIL.includes(newStatus)) return

  let html
  switch (newStatus) {
    case 'IN_PROGRESS':
      html = inProgressHtml({ firstName, invoiceNumber, pickupDate })
      break
    case 'READY':
      html = readyHtml({ firstName, invoiceNumber, pickupDate, balanceDue })
      break
    case 'CANCELLED':
      html = cancelledHtml({ firstName, invoiceNumber, reason })
      break
  }

  await resend.emails.send({
    from:    FROM,
    to:      customerEmail,
    subject: SUBJECTS[newStatus](invoiceNumber),
    html,
  })
}