'use client'
// Shown after a successful checkout. Reads ?order_id= from the URL,
// fetches the real order from /api/orders/:id, and displays it.

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-AU', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

function formatCents(cents) {
  return `$${(cents / 100).toFixed(2)}`
}

// Generate a short human-readable order number from the UUID
function shortOrderNumber(id) {
  return id ? `GW-${id.slice(0, 8).toUpperCase()}` : '—'
}

function getItemPriceDisplay(item) {
  if (item.product?.product_type === 'FIXED') {
    return formatCents(item.subtotal_cents)
  }
  // WEIGHT_RANGE, show estimated range
  const opt = item.weight_option
  if (opt && item.product?.price_per_kg_cents) {
    const min = (item.product.price_per_kg_cents * opt.min_weight_kg * item.quantity) / 100
    const max = opt.max_weight_kg
      ? (item.product.price_per_kg_cents * opt.max_weight_kg * item.quantity) / 100
      : null
    return max ? `$${min.toFixed(2)} — $${max.toFixed(2)}` : `$${min.toFixed(2)}+`
  }
  return formatCents(item.subtotal_cents)
}

function getItemDetail(item) {
  if (item.weight_option) {
    return `${item.weight_option.label} × ${item.quantity}`
  }
  return `× ${item.quantity}`
}

export default function OrderConfirmationPage() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('order_id')

  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!orderId) {
      setError('No order ID provided.')
      setLoading(false)
      return
    }

    async function fetchOrder() {
      try {
        const res = await fetch(`/api/orders/${orderId}`)
        if (!res.ok) throw new Error('Could not load order details.')
        const data = await res.json()
        setOrder(data.order)
      } catch (err) {
        console.error('[orderConfirmation] fetch error:', err)
        setError('Could not load your order details. Your order was placed successfully — check My Orders.')
      } finally {
        setLoading(false)
      }
    }


    fetchOrder()
  }, [orderId])

  // Loading

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FDF8F0' }}>
        <p style={{ color: '#717182' }}>Loading your order...</p>
      </main>
    )
  }

  // Error but order was placed

  if (error || !order) {
    return (
      <main className="min-h-screen py-12" style={{ backgroundColor: '#FDF8F0' }}>
        <div className="max-w-2xl mx-auto px-6 text-center">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl"
            style={{ backgroundColor: '#D4EDDA', color: '#2D6A2D' }}
          >
            ✓
          </div>
          <h1 className="text-4xl font-bold mb-3" style={{ color: '#8B1A1A' }}>
            Order Placed!
          </h1>
          <p className="text-lg mb-6" style={{ color: '#717182' }}>
            {error ?? 'Your deposit has been secured.'}
          </p>
          <Link
            href="/dashboard"
            className="inline-block px-6 py-3 rounded-lg text-white font-semibold"
            style={{ backgroundColor: '#8B1A1A' }}
          >
            View My Orders
          </Link>
        </div>
      </main>
    )
  }

  // Success with real order data

  const depositPaid = order.payments?.find(p => p.type === 'DEPOSIT' && p.status === 'PAID')

  return (
    <main className="min-h-screen py-12" style={{ backgroundColor: '#FDF8F0' }}>
      <div className="max-w-2xl mx-auto px-6">

        {/* Success heading */}
        <div className="text-center mb-10">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl"
            style={{ backgroundColor: '#D4EDDA', color: '#2D6A2D' }}
          >
            ✓
          </div>
          <h1 className="text-4xl font-bold mb-3" style={{ color: '#8B1A1A' }}>
            Order Placed!
          </h1>
          <p className="text-lg" style={{ color: '#717182' }}>
            Thank you for your order. We have received your request and your deposit has been secured.
          </p>
        </div>

        {/* Order details card */}
        <div className="bg-white rounded-lg p-6 mb-6" style={{ border: '1px solid #e5e5e5' }}>
          <h2 className="text-lg font-semibold mb-4" style={{ color: '#2C2C2A' }}>
            Order Summary
          </h2>

          {/* Order number */}
          <div
            className="flex justify-between items-center py-3"
            style={{ borderBottom: '1px solid #e5e5e5' }}
          >
            <span className="text-sm" style={{ color: '#717182' }}>Order Number</span>
            <span className="text-sm font-semibold" style={{ color: '#2C2C2A' }}>
              {shortOrderNumber(order.id)}
            </span>
          </div>

          {/* Pickup date */}
          <div
            className="flex justify-between items-center py-3"
            style={{ borderBottom: '1px solid #e5e5e5' }}
          >
            <span className="text-sm" style={{ color: '#717182' }}>Pickup Date</span>
            <span className="text-sm font-semibold" style={{ color: '#2C2C2A' }}>
              {formatDate(order.pickup_date)}
            </span>
          </div>

          {/* Items */}
          <div className="py-3" style={{ borderBottom: '1px solid #e5e5e5' }}>
            <span className="text-sm mb-3 block" style={{ color: '#717182' }}>Items Ordered</span>
            <div className="flex flex-col gap-2">
              {order.order_items?.map(item => (
                <div key={item.id} className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium" style={{ color: '#2C2C2A' }}>
                      {item.product?.name ?? 'Unknown product'}
                    </p>
                    <p className="text-xs" style={{ color: '#717182' }}>
                      {getItemDetail(item)}
                    </p>
                  </div>
                  <p className="text-sm font-medium" style={{ color: '#2C2C2A' }}>
                    {getItemPriceDisplay(item)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Deposit paid */}
          <div
            className="flex justify-between items-center py-3"
            style={{ borderBottom: '1px solid #e5e5e5' }}
          >
            <span className="text-sm" style={{ color: '#717182' }}>Deposit Paid</span>
            <span className="text-sm font-semibold" style={{ color: '#2D6A2D' }}>
              {depositPaid ? formatCents(depositPaid.amount_cents) : '$20.00'}
            </span>
          </div>

          {/* Balance due */}
          <div className="flex justify-between items-center pt-3">
            <span className="text-sm font-semibold" style={{ color: '#2C2C2A' }}>
              Estimated Minimum Balance Due at Pickup
            </span>
            <span className="text-lg font-bold" style={{ color: '#8B1A1A' }}>
              {order.total_cents > 0
                ? formatCents(order.total_cents - (depositPaid?.amount_cents ?? 2000))
                : 'To be confirmed'}
            </span>
          </div>
        </div>

        {/* Info box */}
        <div
          className="rounded-lg p-5 mb-8 text-sm"
          style={{ backgroundColor: '#FEF9E7', border: '1px solid #FAC775', color: '#854F0B' }}
        >
          <p className="font-semibold mb-2">What happens next?</p>
          <ul className="flex flex-col gap-1">
            <li>A confirmation invoice has been sent to your email.</li>
            <li>Our team will weigh your order and send a final invoice before pickup.</li>
            <li>Pay the remaining balance in store via EFTPOS on collection.</li>
          </ul>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3">
          <Link
            href="/dashboard"
            className="block w-full text-center py-4 rounded-lg text-white font-semibold transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#8B1A1A' }}
          >
            View My Orders
          </Link>
          <Link
            href="/products"
            className="block w-full text-center py-4 rounded-lg font-semibold transition-opacity hover:opacity-70"
            style={{ border: '1px solid #8B1A1A', color: '#8B1A1A', backgroundColor: 'transparent' }}
          >
            Continue Shopping
          </Link>
        </div>

      </div>
    </main>
  )
}