// Checkout page, reads cart from CartContext and query params

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { useCart } from '@/context/CartContext'
import { createClient } from '@/lib/supabase-client'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)

// Stripe payment form 
// Rendered inside <Elements> so it has access to the Stripe context

function PaymentForm({ orderId, items, onSuccess }) {
  const stripe = useStripe()
  const elements = useElements()
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState(null)

  async function handlePay(e) {
    e.preventDefault()
    if (!stripe || !elements) return

    setPaying(true)
    setError(null)

    // Confirm the payment with Stripe client-side
    const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    })

    if (stripeError) {
      setError(stripeError.message)
      setPaying(false)
      return
    }

    // Verify server-side and confirm the order
    const confirmRes = await fetch('/api/checkout/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        order_id:          orderId,
        payment_intent_id: paymentIntent.id,
        items: items.map(i => ({
          product_id: i.product_id,
          quantity:   i.quantity,
        })),
      }),
    })

    const confirmData = await confirmRes.json()

    if (!confirmRes.ok) {
      setError(confirmData.error ?? 'Payment confirmation failed. Please contact us.')
      setPaying(false)
      return
    }

    // Success, let parent handle cart clear + redirect
    onSuccess()
  }

  return (
    <form onSubmit={handlePay}>
      {/* Stripe's prebuilt card input UI */}
      <PaymentElement
        options={{
          layout: 'tabs',
        }}
      />

      {error && (
        <p className="text-sm mt-3" style={{ color: '#DC2626' }}>
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={!stripe || paying}
        className="w-full mt-6 py-4 rounded-lg text-white font-semibold transition-opacity"
        style={{
          backgroundColor: paying ? '#9ca3af' : '#8B1A1A',
          cursor: paying ? 'not-allowed' : 'pointer',
        }}
      >
        {paying ? 'Processing...' : 'Pay $20.00 Deposit'}
      </button>

      <p className="text-xs text-center mt-3" style={{ color: '#717182' }}>
        Secured by Stripe. Your card details are never stored on our servers.
      </p>
    </form>
  )
}

// Main checkout page

export default function CheckoutPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { items, clearCart } = useCart()

  const pickupDate = searchParams.get('date') ?? ''
  const notes      = searchParams.get('notes') ?? ''

  const [clientSecret, setClientSecret] = useState(null)
  const [orderId, setOrderId]           = useState(null)
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState(null)

  // Redirect to cart if no items
  useEffect(() => {
    if (items.length === 0) {
      router.replace('/cart')
    }
  }, [items, router])

  // Create order + payment intent on mount
  useEffect(() => {
    if (items.length === 0 || !pickupDate) return

    async function initCheckout() {
      try {
        // Get the logged-in user's ID and email
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          router.replace(`/login?redirectTo=/checkout?date=${pickupDate}&notes=${encodeURIComponent(notes)}`)
          return
        }

        // Build items payload from cart
        const orderItems = items.map(item => ({
          product_id:        item.product_id,
          quantity:          item.quantity,
          weight_option_id:  item.weight_option?.id ?? null,
          weight_preference: item.weight_option?.label ?? null,
          unit_price_cents:  item.product_type === 'FIXED'
                               ? item.price_cents
                               : item.price_per_kg_cents,
          subtotal_cents:    item.product_type === 'FIXED'
                               ? item.price_cents * item.quantity
                               : Math.round(item.price_per_kg_cents * item.weight_option?.min_weight_kg * item.quantity),
          notes: item.notes ?? null,
        }))

        const res = await fetch('/api/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customer_id:            user.id,
            customer_email:         user.email,
            pickup_date:            pickupDate,
            notes:                  notes || null,
            deposit_required_cents: 2000,
            items:                  orderItems,
          }),
        })

        const data = await res.json()

        if (!res.ok) {
          setError(data.error ?? 'Could not initialise checkout. Please try again.')
          return
        }

        setClientSecret(data.clientSecret)
        setOrderId(data.order_id)
      } catch (err) {
        console.error('[checkout] init error:', err)
        setError('Something went wrong. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    initCheckout()
  }, []) // run once on mount

  function handlePaymentSuccess() {
    clearCart()
    router.replace(`/orderConfirmation?order_id=${orderId}`)
  }

  // Render states

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FDF8F0' }}>
        <p style={{ color: '#717182' }}>Preparing your order...</p>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ backgroundColor: '#FDF8F0' }}>
        <p style={{ color: '#DC2626' }}>{error}</p>
        <button
          onClick={() => router.replace('/cart')}
          className="px-6 py-3 rounded-lg text-white"
          style={{ backgroundColor: '#8B1A1A' }}
        >
          Back to Cart
        </button>
      </main>
    )
  }

  return (
    <main className="min-h-screen py-12" style={{ backgroundColor: '#FDF8F0' }}>
      <div className="max-w-lg mx-auto px-6">
        <h1 className="text-4xl font-bold mb-2" style={{ color: '#8B1A1A' }}>
          Checkout
        </h1>
        <p className="mb-8 text-sm" style={{ color: '#717182' }}>
          Pay your $20.00 deposit to confirm your order.
        </p>

        {/* Order summary */}
        <div className="bg-white rounded-lg p-5 mb-6" style={{ border: '1px solid #e5e5e5' }}>
          <h2 className="text-sm font-semibold mb-3" style={{ color: '#2C2C2A' }}>
            Order Summary
          </h2>
          {items.map(item => (
            <div key={item.cartId} className="flex justify-between text-sm mb-2">
              <span style={{ color: '#717182' }}>
                {item.name} × {item.quantity}
                {item.weight_option && ` (${item.weight_option.label})`}
              </span>
            </div>
          ))}
          <div
            className="flex justify-between items-center pt-3 mt-3"
            style={{ borderTop: '1px solid #e5e5e5' }}
          >
            <span className="text-sm font-semibold" style={{ color: '#2C2C2A' }}>
              Pickup Date
            </span>
            <span className="text-sm" style={{ color: '#2C2C2A' }}>
              {new Date(pickupDate).toLocaleDateString('en-AU', {
                day: 'numeric', month: 'long', year: 'numeric',
              })}
            </span>
          </div>
          <div
            className="flex justify-between items-center pt-3 mt-3"
            style={{ borderTop: '1px solid #e5e5e5' }}
          >
            <span className="text-sm font-semibold" style={{ color: '#2C2C2A' }}>
              Deposit Due Today
            </span>
            <span className="text-lg font-bold" style={{ color: '#8B1A1A' }}>
              $20.00
            </span>
          </div>
        </div>

        {/* Stripe payment form */}
        <div className="bg-white rounded-lg p-5" style={{ border: '1px solid #e5e5e5' }}>
          <h2 className="text-sm font-semibold mb-4" style={{ color: '#2C2C2A' }}>
            Card Details
          </h2>
          {clientSecret && (
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance: {
                  theme: 'stripe',
                  variables: { colorPrimary: '#8B1A1A' },
                },
              }}
            >
              <PaymentForm
                orderId={orderId}
                items={items}
                onSuccess={handlePaymentSuccess}
              />
            </Elements>
          )}
        </div>
      </div>
    </main>
  )
}