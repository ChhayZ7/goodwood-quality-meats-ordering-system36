'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

const statusColors = {
  'Ready for Pickup': 'bg-green-500',
  'In Progress':      'bg-blue-500',
  'Confirmed':        'bg-yellow-500',
  'Cancelled':        'bg-red-500',
  'Completed':        'bg-gray-500',
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

  if (loading) return null
  if (error)   return <p className="text-red-600 p-8">{error}</p>
  if (!order)  return <p className="text-gray-500 p-8">Order not found.</p>

  return (
    <div className="max-w-5xl mx-auto">

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#8B1A1A] mt-2 mb-1">
            Order #{order.order_number}
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
              <th className="text-left pb-3 font-semibold">Weight Range</th>
              <th className="text-center pb-3 font-semibold">Quantity</th>
              <th className="text-right pb-3 font-semibold">Estimated Price</th>
            </tr>
          </thead>
          <tbody>
            {(order.items ?? []).map((item, i) => (
              <tr key={i} className="border-b border-gray-100 last:border-0">
                <td className="py-4 text-gray-800">{item.product_name}</td>
                <td className="py-4 text-gray-600">{item.weight_range ?? '—'}</td>
                <td className="py-4 text-center text-gray-800">{item.quantity}</td>
                <td className="py-4 text-right text-gray-800">
                  ${Number(item.estimated_price).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Payment Summary Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-8 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Payment Summary</h2>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>Deposit Paid:</span>
            <span>${Number(order.deposit_amount ?? 0).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Estimated Total:</span>
            <span>${Number(order.estimated_total ?? 0).toFixed(2)}</span>
          </div>

          <div className="border-t border-gray-200 pt-3 mt-3 space-y-3">
            <div className="flex justify-between text-gray-700">
              <span>Final Total:</span>
              <span>${Number(order.final_total ?? 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Balance Due:</span>
              <span className="text-[#8B1A1A]">
                ${Number(order.balance_due ?? 0).toFixed(2)}
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
          href="/account/orders"
          className="flex items-center gap-2 border border-[#8B1A1A] text-[#8B1A1A] px-6 py-3 rounded-lg text-sm font-semibold hover:bg-[#8B1A1A] hover:text-white transition"
        >
          ← Back to Orders
        </Link>
      </div>

    </div>
  )
}