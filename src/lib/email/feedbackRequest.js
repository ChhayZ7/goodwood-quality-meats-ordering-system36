import { resend } from '@/lib/resend'

export async function sendFeedbackRequestEmail({ customerEmail, customerFirstName, orderId }) {
  const orderShort = `GW${orderId.slice(0, 8).toUpperCase()}`
  const feedbackUrl = `https://goodwoodqualitymeats.com.au/account/orders/${orderId}/feedback`

  await resend.emails.send({
    from:    'Goodwood Quality Meats <no-reply@mail.goodwoodqualitymeats.com.au>',
    to:      customerEmail,
    subject: `How was your order, ${customerFirstName}?`,
    html: `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; color: #1A1A1A;">
        <div style="background: #7B1A1A; padding: 32px; text-align: center;">
          <h1 style="color: #fff; margin: 0; font-size: 24px;">Goodwood Quality Meats</h1>
        </div>
        <div style="padding: 40px 32px;">
          <h2 style="font-size: 22px; color: #7B1A1A; margin: 0 0 16px;">Thanks for your order, ${customerFirstName}!</h2>
          <p style="color: #555; line-height: 1.6;">We hope you enjoyed your order <strong>${orderShort}</strong>. We'd love to hear about your experience — it only takes a minute.</p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${feedbackUrl}" style="background: #7B1A1A; color: #fff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 15px;">
              Leave a Review
            </a>
          </div>
          <p style="color: #999; font-size: 13px; text-align: center;">If the button doesn't work, copy this link:<br/>${feedbackUrl}</p>
        </div>
        <div style="background: #F9FAFB; padding: 20px 32px; text-align: center;">
          <p style="color: #9CA3AF; font-size: 12px; margin: 0;">© Goodwood Quality Meats · Goodwood, SA</p>
        </div>
      </div>
    `,
  })
}