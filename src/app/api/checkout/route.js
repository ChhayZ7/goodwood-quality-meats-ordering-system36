import { NextResponse } from 'next/server'
import { withHandler, schemas } from '@/lib/middleware/withHandler'
import { validateStock } from '@/lib/db/inventory'
import { createOrder } from '@/lib/db/orders'
import { createDepositPaymentIntent } from '@/lib/stripe'

// POST /api/checkout

// Returns a clientSecret the frontend passes to Stripe Elements.
// The customer enters their card entirely client-side

// After Stripe confirms payment on the client, call POST /api/checkout/confirm


export const POST = withHandler(
  async (request) => {
    const {
      customer_id,
      customer_email,
      pickup_date,
      notes,
      deposit_required_cents,
      items,
    } = request._body

    // Stock validation
    const { ok, failures } = await validateStock(items)

    if (!ok) {
      return NextResponse.json(
        {
          error:    'Some items exceed available stock',
          failures, // [{ product_id, product_name, requested, available }]
          status:   409,
        },
        { status: 409 }
      )
    }
    
    // Check if total cost of order is $20 or above
    const total = items.reduce((sum, item) => sum + item.subtotal_cents, 0)

    if (total < 2000) { // return error if under $20
      return NextResponse.json(
        {
          error: 'Minimum order value is $20.00',
          total_cents: total,
          status: 400,
        },
        { status: 400 }
      )
    }

    // Create order
    const { data: orderData, error: orderError } = await createOrder(
      { customer_id, pickup_date, notes, deposit_required_cents },
      items
    )

    if (orderError) throw orderError

    // Create Stripe PaymentIntent
    const { clientSecret, paymentIntentId } = await createDepositPaymentIntent({
      orderId:       orderData.order_id,
      customerEmail: customer_email,
    })

    return NextResponse.json({
      order_id:        orderData.order_id,
      clientSecret,       // pass to Stripe Elements
      paymentIntentId,    // send back in /confirm
    })
  },
  { schema: schemas.createOrder }
)