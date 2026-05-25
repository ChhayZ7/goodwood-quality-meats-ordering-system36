'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const statusColors = {
  'PENDING':          'bg-gray-400',
  'CONFIRMED':        'bg-yellow-500',
  'IN_PROGRESS':      'bg-blue-500',
  'READY_FOR_PICKUP': 'bg-green-500',
  'COMPLETED':        'bg-gray-500',
  'CANCELLED':        'bg-red-500',
}

function OrderCardSkeleton() {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border flex justify-between items-center animate-pulse">
      <div className="flex-1">
        {/* Order ID + status badge */}
        <div className="flex items-center gap-3 mb-3">
          <div className="h-5 w-36 bg-gray-200 rounded" />
          <div className="h-5 w-20 bg-gray-200 rounded-full" />
        </div>
        {/* Placed / Pickup / Total */}
        <div className="flex gap-6">
          <div className="h-4 w-24 bg-gray-200 rounded" />
          <div className="h-4 w-28 bg-gray-200 rounded" />
          <div className="h-4 w-20 bg-gray-200 rounded" />
        </div>
      </div>
      {/* Button placeholder */}
      <div className="h-9 w-28 bg-gray-200 rounded-lg ml-6" />
    </div>
  )
}

export default function OrdersPage() {
  const router = useRouter()
  const [orders, setOrders]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/orders')
      if (res.status === 401) { router.replace('/login'); return }
      const json = await res.json()
      if (!res.ok) { setError(json.error ?? 'Failed to load orders'); setLoading(false); return }
      setOrders(json.orders ?? [])
      setLoading(false)
    }
    load()
  }, [router])

  const grouped = orders.reduce((acc, order) => {
    const date = new Date(order.created_at)
    const key = date.toLocaleString('default', { month: 'long', year: 'numeric' })
    if (!acc[key]) acc[key] = []
    acc[key].push(order)
    return acc
  }, {})

  if (error) return <p className="text-red-600 p-8">{error}</p>

  return (
    <div className="max-w-5xl mx-auto">

      <h1 className="text-3xl font-semibold mb-8 text-red-900">My Orders</h1>

      {/* ── Skeleton while loading ── */}
      {loading && (
        <div>
          {/* Fake month label */}
          <div className="h-5 w-24 bg-gray-200 rounded animate-pulse mb-4" />
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <OrderCardSkeleton key={i} />
            ))}
          </div>
        </div>
      )}

      {/* ── Empty state ── */}
      {!loading && orders.length === 0 && (
        <p className="text-gray-500">You have no orders yet.</p>
      )}

      {/* ── Orders grouped by month ── */}
      {!loading && orders.length > 0 && (
        Object.entries(grouped).map(([month, monthOrders]) => (
          <div key={month} className="mb-8">
            <p className="text-lg font-semibold text-gray-700 mb-4">{month}</p>
            <div className="space-y-4">
              {monthOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white p-6 rounded-2xl shadow-sm border flex justify-between items-center"
                >
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="font-semibold text-lg">Order #{order.id.slice(0, 8).toUpperCase()}</h2>
                      <span className={`text-white text-xs px-3 py-1 rounded-full ${statusColors[order.status] ?? 'bg-gray-400'}`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 flex gap-6">
                      <p>Placed: {new Date(order.created_at).toLocaleDateString()}</p>
                      {order.pickup_date && (
                        <p>Pickup: {new Date(order.pickup_date).toLocaleDateString()}</p>
                      )}
                      {order.total_cents && (
                        <p>Total: ${(order.total_cents / 100).toFixed(2)}</p>
                      )}
                    </div>
                  </div>

                  <Link
                    href={`/account/orders/${order.id}`}
                    className="bg-red-800 text-white px-5 py-2 rounded-lg hover:bg-red-700 transition"
                  >
                    View Details
                  </Link>
                </div>
              ))}
            </div>
          </div>
        ))
      )}

    </div>
  )
}