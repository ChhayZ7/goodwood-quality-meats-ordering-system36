'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

const statusColors = {
  'PENDING':          'bg-gray-400',
  'CONFIRMED':        'bg-yellow-500',
  'IN_PROGRESS':      'bg-blue-500',
  'READY_FOR_PICKUP': 'bg-green-500',
  'COMPLETED':        'bg-gray-500',
  'CANCELLED':        'bg-red-500',
}

export default function OrderDetailPage() {
  const router = useRouter()
  const { id } = useParams()

  const [order, setOrder]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/orders/${id}`)
      if (res.status === 401) { router.replace('/login'); return }
      const json = await res.json()
      if (!res.ok) { setError(json.error ?? 'Failed to load order'); setLoading(false); return }
      setOrder(json.order)
      setLoading(false)
    }
    load()
  }, [id, router])

  if (loading) return (
    <div className="max-w-5xl mx-auto animate-pulse">

      {/* Header skeleton */}
      <div className="flex items-start justify-between mb-8">
        <div className="mt-2">
          <h1 className="text-3xl font-bold text-[#8B1A1A] mb-3">
            Order #{id.slice(0, 8).toUpperCase()}
          </h1>
          <div className="flex gap-4">
            <div className="h-4 w-28 bg-gray-200 rounded" />
            <div className="h-4 w-28 bg-gray-200 rounded" />
          </div>
        </div>
        <div className="h-9 w-28 bg-gray-200 rounded-full" />
      </div>

      {/* Order Items card skeleton */}
      <div className="bg-white rounded-xl border border-gray-200 p-8 mb-6">
        <div className="h-6 w-32 bg-gray-200 rounded mb-6" />
        {/* Table header */}
        <div className="flex gap-4 pb-3 border-b border-gray-200 mb-2">
          <div className="h-4 w-24 bg-gray-200 rounded" />
          <div className="h-4 w-36 bg-gray-200 rounded ml-auto" />
          <div className="h-4 w-16 bg-gray-200 rounded" />
          <div className="h-4 w-20 bg-gray-200 rounded" />
        </div>
        {/* Table rows */}
        {[1, 2].map(i => (
          <div key={i} className="flex gap-4 py-4 border-b border-gray-100 last:border-0">
            <div className="h-4 w-40 bg-gray-200 rounded" />
            <div className="h-4 w-20 bg-gray-200 rounded ml-auto" />
            <div className="h-4 w-8 bg-gray-200 rounded" />
            <div className="h-4 w-16 bg-gray-200 rounded" />
          </div>
        ))}
      </div>

      {/* Payment Summary card skeleton */}
      <div className="bg-white rounded-xl border border-gray-200 p-8 mb-8">
        <div className="h-6 w-44 bg-gray-200 rounded mb-6" />
        <div className="space-y-4">
          <div className="flex justify-between">
            <div className="h-4 w-28 bg-gray-200 rounded" />
            <div className="h-4 w-16 bg-gray-200 rounded" />
          </div>
          <div className="flex justify-between">
            <div className="h-4 w-36 bg-gray-200 rounded" />
            <div className="h-4 w-16 bg-gray-200 rounded" />
          </div>
          <div className="border-t border-gray-200 pt-4 space-y-4">
            <div className="flex justify-between">
              <div className="h-4 w-24 bg-gray-200 rounded" />
              <div className="h-4 w-16 bg-gray-200 rounded" />
            </div>
            <div className="flex justify-between">
              <div className="h-5 w-28 bg-gray-200 rounded" />
              <div className="h-5 w-20 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      </div>

      {/* Buttons skeleton */}
      <div className="flex gap-4">
        <div className="h-11 w-56 bg-gray-200 rounded-lg" />
        <div className="h-11 w-36 bg-gray-200 rounded-lg" />
        <div className="h-11 w-36 bg-gray-200 rounded-lg" />
      </div>

    </div>
  )

  if (error)  return <p className="text-red-600 p-8">{error}</p>
  if (!order) return <p className="text-gray-500 p-8">Order not found.</p>

  const payment = order.payments?.[0] ?? order.payment ?? {}

  return (
    <div className="max-w-5xl mx-auto">

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#8B1A1A] mt-2 mb-1">
            Order #{order.id.slice(0, 8).toUpperCase()}
          </h1>
          <div className="text-sm text-gray-500 flex gap-4">
            {order.created_at && (
              <span>Placed: {new Date(order.created_at).toLocaleDateString()}</span>
            )}
            {order.pickup_date && (
              <span>Pickup: {new Date(order.pickup_date).toLocaleDateString()}</span>
            )}
          </div>
        </div>
        <span className={`text-white text-sm px-4 py-2 rounded-full ${statusColors[order.status] ?? 'bg-gray-400'}`}>
          {order.status}
        </span>
      </div>

      {/* Order Items Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-8 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Order Items</h2>

        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-600 border-b border-gray-200">
              <th className="text-left pb-3 font-semibold">Product</th>
              <th className="text-left pb-3 font-semibold">Weight Preference</th>
              <th className="text-center pb-3 font-semibold">Quantity</th>
              <th className="text-right pb-3 font-semibold">Unit Price</th>
            </tr>
          </thead>
          <tbody>
            {(order.order_items ?? []).map((item, i) => (
              <tr key={i} className="border-b border-gray-100 last:border-0">
                <td className="py-4 text-gray-800">{item.product?.name ?? '—'}</td>
                <td className="py-4 text-gray-600">{item.weight_preference ?? '—'}</td>
                <td className="py-4 text-center text-gray-800">{item.quantity}</td>
                <td className="py-4 text-right text-gray-800">
                  {item.unit_price_cents ? `$${(item.unit_price_cents / 100).toFixed(2)}` : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {order.notes && (
          <div className="mt-6 pt-4 border-t border-gray-100">
            <p className="text-sm font-semibold text-gray-700 mb-1">Order Notes</p>
            <p className="text-sm text-gray-500 italic mt-2">{order.notes}</p>
          </div>
        )}
      </div>

      {/* Payment Summary Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-8 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Payment Summary</h2>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>Deposit Paid:</span>
            <span>{order.deposit_paid_cents != null ? `$${(order.deposit_paid_cents / 100).toFixed(2)}` : '—'}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Estimated Total:</span>
            <span>{order.total_cents != null ? `$${(order.total_cents / 100).toFixed(2)}` : '—'}</span>
          </div>

          <div className="border-t border-gray-200 pt-3 mt-3 space-y-3">
            
            <div className="flex justify-between font-semibold">
              <span>Balance Due:</span>
              <span className="text-[#8B1A1A]">
                {order.total_cents != null && order.deposit_paid_cents != null
                  ? `$${((order.total_cents - order.deposit_paid_cents) / 100).toFixed(2)}`
                  : '—'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Buttons */}
      <div className="flex gap-4">
        <button
          onClick={() => window.open(`/api/orders/${id}/invoice/confirmation`, '_blank')}
          className="flex items-center gap-2 bg-[#8B1A1A] text-white px-6 py-3 rounded-lg text-sm font-semibold hover:opacity-90 transition"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Download Confirmation Invoice
        </button>

        <Link
          href={`/account/orders/${id}/feedback`}
          className="flex items-center gap-2 border border-[#8B1A1A] text-[#8B1A1A] px-6 py-3 rounded-lg text-sm font-semibold hover:bg-[#8B1A1A] hover:text-white transition"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
          Leave a Review
        </Link>

        <Link
          href="/account/orders"
          className="flex items-center gap-2 border border-[#8B1A1A] text-[#8B1A1A] px-6 py-3 rounded-lg text-sm font-semibold hover:bg-[#8B1A1A] hover:text-white transition"
        >
          ← Back to Orders
        </Link>
      </div>

    </div>
  )
}