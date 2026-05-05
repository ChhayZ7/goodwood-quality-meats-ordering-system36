"use client"

import Link from "next/link"

const orders = [
  {
    id: "GW20251203",
    status: "Ready for Pickup",
    placed: "11/20/2025",
    pickup: "12/18/2025",
    deposit: "$20.00",
  },
  {
    id: "GW20251209",
    status: "In Progress",
    placed: "11/21/2025",
    pickup: "12/18/2025",
    deposit: "$20.00",
  },
  {
    id: "GW20251201",
    status: "Confirmed",
    placed: "11/15/2025",
    pickup: "12/20/2025",
    deposit: "$20.00",
  },
]

const statusColors = {
  "Ready for Pickup": "bg-green-500",
  "In Progress": "bg-blue-500",
  "Confirmed": "bg-yellow-500",
}

export default function OrdersPage() {
  return (
    <div className="max-w-5xl mx-auto">

      <h1 className="text-3xl font-semibold mb-8 text-red-900">
        My Orders
      </h1>

      <p className="text-lg text-gray-600 mb-6">November 2025</p>

      <div className="space-y-4">

        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-white p-6 rounded-2xl shadow-sm border flex justify-between items-center"
          >
            {/* LEFT */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="font-semibold text-lg">
                  Order #{order.id}
                </h2>

                <span
                  className={`text-white text-xs px-3 py-1 rounded-full ${statusColors[order.status]}`}
                >
                  {order.status}
                </span>
              </div>

              <div className="text-sm text-gray-600 flex gap-6">
                <p>Placed: {order.placed}</p>
                <p>Pickup: {order.pickup}</p>
                <p>Deposit: {order.deposit}</p>
              </div>
            </div>

            {/* RIGHT */}
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
  )
}