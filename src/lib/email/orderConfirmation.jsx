// Order confirmation email template — barebone version
// Returns a plain HTML string for the Resend email body

export function orderConfirmationHtml({ customer, order, invoiceNumber, pickupDate }) {
  const depositFormatted = `$${((order.deposit_paid_cents ?? 2000) / 100).toFixed(2)}`
  const totalFormatted   = `$${((order.total_cents ?? 0) / 100).toFixed(2)}`
  const balanceFormatted = `$${(((order.total_cents ?? 0) - (order.deposit_paid_cents ?? 2000)) / 100).toFixed(2)}`

  const itemLines = (order.order_items ?? []).map(item => {
    const product    = item.product ?? {}
    const isWeight   = product.product_type === 'WEIGHT_RANGE'
    const weightText = item.weight_option
      ? `${item.weight_option.min_weight_kg}–${item.weight_option.max_weight_kg} kg`
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
        <ul>
            ${itemLines}
        </ul>

        <p><strong>Estimated total:</strong> ${totalFormatted}</p>
        <p><strong>Deposit paid:</strong> ${depositFormatted}</p>
        <p><strong>Balance due at pickup:</strong> ${balanceFormatted}</p>

        <hr />

        <p>Our team will weigh your order before your pickup date. Please pay the remaining balance in store via EFTPOS at collection.</p>

        <p>Questions? Call us on <strong>08 8271 4183</strong> or reply to this email.</p>

        <p>— Goodwood Quality Meats</p>

        </body>
        </html>
  `
}