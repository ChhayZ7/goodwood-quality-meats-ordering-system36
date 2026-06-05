// src/lib/email/pickupReminder.js

export function pickupReminderHtml({ customer, order, invoiceNumber, pickupDate }) {
    const itemLines = (order.order_items ?? []).map(item => {
      const product  = item.product ?? {}
      const isWeight = product.product_type === 'WEIGHT_RANGE'
      const weightText = item.weight_option
        ? `${item.weight_option.label}`
        : item.weight_preference ?? ''
      return `
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #F0EAD8; font-size: 14px; color: #1A1A1A;">
            ${product.name ?? 'Product'} × ${item.quantity}
            ${isWeight ? `<span style="color: #717182;"> — ${weightText}</span>` : ''}
          </td>
        </tr>`
    }).join('')
  
    const balanceDue = ((order.total_cents ?? 0) - (order.deposit_paid_cents ?? 0)) / 100
    const balanceFormatted = `$${balanceDue.toFixed(2)}`
    const googleMapsUrl = 'https://maps.app.goo.gl/gymYkT4abq6wnSPc7'
  
    return `
      <!DOCTYPE html>
      <html>
      <body style="margin: 0; padding: 0; background: #F9F9F9; font-family: Arial, sans-serif;">
  
        <table width="100%" cellpadding="0" cellspacing="0" style="background: #F9F9F9; padding: 32px 0;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
  
                <!-- Header -->
                <tr>
                  <td style="background: #7B1A1A; padding: 32px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 22px; letter-spacing: 1px;">
                      Goodwood Quality Meats
                    </h1>
                    <p style="color: #F0C4C4; margin: 6px 0 0; font-size: 13px; letter-spacing: 2px; text-transform: uppercase;">
                      Pickup Reminder
                    </p>
                  </td>
                </tr>
  
                <!-- Gold divider -->
                <tr>
                  <td style="height: 3px; background: #C9A84C;"></td>
                </tr>
  
                <!-- Body -->
                <tr>
                  <td style="padding: 40px 40px 24px;">
  
                    <p style="font-size: 18px; font-weight: bold; color: #1A1A1A; margin: 0 0 8px;">
                      Hi ${customer.first_name}, your order is ready tomorrow! 🥩
                    </p>
                    <p style="font-size: 14px; color: #555; line-height: 1.7; margin: 0 0 28px;">
                      Just a friendly reminder that your Christmas order is scheduled for pickup
                      <strong style="color: #7B1A1A;"> tomorrow, ${pickupDate}</strong>.
                      We're looking forward to seeing you!
                    </p>
  
                    <!-- Order details box -->
                    <table width="100%" cellpadding="0" cellspacing="0"
                      style="background: #FDF8F0; border-radius: 8px; border: 1px solid #E8D48A; margin-bottom: 28px;">
                      <tr>
                        <td style="padding: 20px 24px;">
  
                          <p style="font-size: 11px; font-weight: bold; color: #7B1A1A; text-transform: uppercase;
                            letter-spacing: 1px; margin: 0 0 12px;">
                            Order Summary
                          </p>
  
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="font-size: 13px; color: #717182; padding-bottom: 6px;">Order number</td>
                              <td style="font-size: 13px; color: #1A1A1A; font-weight: bold; text-align: right; padding-bottom: 6px;">
                                ${invoiceNumber}
                              </td>
                            </tr>
                            <tr>
                              <td style="font-size: 13px; color: #717182; padding-bottom: 6px;">Pickup date</td>
                              <td style="font-size: 13px; color: #1A1A1A; font-weight: bold; text-align: right; padding-bottom: 6px;">
                                ${pickupDate}
                              </td>
                            </tr>
                            <tr>
                              <td style="font-size: 13px; color: #717182;">Balance due at pickup</td>
                              <td style="font-size: 14px; color: #7B1A1A; font-weight: bold; text-align: right;">
                                ${balanceFormatted}
                              </td>
                            </tr>
                          </table>
  
                          <!-- Divider -->
                          <div style="height: 1px; background: #E8D48A; margin: 16px 0;"></div>
  
                          <!-- Items -->
                          <p style="font-size: 11px; font-weight: bold; color: #7B1A1A; text-transform: uppercase;
                            letter-spacing: 1px; margin: 0 0 8px;">
                            Your Items
                          </p>
                          <table width="100%" cellpadding="0" cellspacing="0">
                            ${itemLines}
                          </table>
  
                        </td>
                      </tr>
                    </table>
  
                    <!-- What to bring box -->
                    <table width="100%" cellpadding="0" cellspacing="0"
                      style="background: #FEF9E7; border-radius: 8px; border: 1px solid #FAC775; margin-bottom: 28px;">
                      <tr>
                        <td style="padding: 18px 24px;">
                          <p style="font-size: 13px; font-weight: bold; color: #854F0B; margin: 0 0 8px;">
                            What to bring
                          </p>
                          <p style="font-size: 13px; color: '#854F0B'; line-height: 1.7; margin: 0;">
                            💳 &nbsp;EFTPOS payment for your balance of <strong>${balanceFormatted}</strong><br/>
                            📋 &nbsp;Your order number <strong>${invoiceNumber}</strong><br/>
                            🛍️ &nbsp;Bags or an esky for your order
                          </p>
                        </td>
                      </tr>
                    </table>
  
                    <!-- Opening hours -->
                    <table width="100%" cellpadding="0" cellspacing="0"
                      style="background: #F9F9F9; border-radius: 8px; border: 1px solid #E5E5E5; margin-bottom: 28px;">
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
  
                    <!-- Google Maps CTA -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 28px;">
                      <tr>
                        <td align="center">
                          <a href="${googleMapsUrl}" target="_blank"
                            style="display: inline-block; background: #7B1A1A; color: #ffffff;
                            text-decoration: none; padding: 14px 32px; border-radius: 8px;
                            font-size: 14px; font-weight: bold;">
                            📍 Get Directions
                          </a>
                          <p style="font-size: 12px; color: #717182; margin: 8px 0 0;">
                            121 Goodwood Road, Goodwood SA 5034
                          </p>
                        </td>
                      </tr>
                    </table>
  
                    <p style="font-size: 14px; color: #555; line-height: 1.7; margin: 0;">
                      Questions? Call us on <strong>08 8271 4183</strong> or reply to this email.
                      <br/>We can't wait to see you tomorrow!
                    </p>
  
                  </td>
                </tr>
  
                <!-- Footer -->
                <tr>
                  <td style="background: #F9FAFB; padding: 20px 40px; border-top: 1px solid #E5E5E5;">
                    <p style="font-size: 12px; color: #9CA3AF; margin: 0; text-align: center;">
                      © Goodwood Quality Meats · 121 Goodwood Road, Goodwood SA 5034
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