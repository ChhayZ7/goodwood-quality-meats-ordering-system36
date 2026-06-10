"use client"; // This tells Next.js that this page must run in the browser because we are using hooks like useState and useEffect

import { useState, useEffect } from "react"; // Import React hooks
import { useRouter } from "next/navigation"; // Import Next.js router so we can redirect the user if needed
import Link from "next/link"; // Import Link for navigating to order details page without full page reload

// This object stores Tailwind background colour classes for each order status
const statusColors = {
  PENDING: "bg-gray-400",
  CONFIRMED: "bg-yellow-500",
  IN_PROGRESS: "bg-blue-500",
  READY_FOR_PICKUP: "bg-green-500",
  COMPLETED: "bg-gray-500",
  CANCELLED: "bg-red-500",
};

// This component shows a loading placeholder while real order data is being fetched
function OrderCardSkeleton() {
  return (
    // Skeleton card container with pulse animation
    <div className="bg-white p-6 rounded-2xl shadow-sm border flex justify-between items-center animate-pulse">
      {/* Left side placeholder content */}
      <div className="flex-1">
        {/* Placeholder for Order ID and status badge */}
        <div className="flex items-center gap-3 mb-3">
          <div className="h-5 w-36 bg-gray-200 rounded" />
          <div className="h-5 w-20 bg-gray-200 rounded-full" />
        </div>

        {/* Placeholder for placed date, pickup date, and total */}
        <div className="flex gap-6">
          <div className="h-4 w-24 bg-gray-200 rounded" />
          <div className="h-4 w-28 bg-gray-200 rounded" />
          <div className="h-4 w-20 bg-gray-200 rounded" />
        </div>
      </div>

      {/* Right side placeholder for View Details button */}
      <div className="h-9 w-28 bg-gray-200 rounded-lg ml-6" />
    </div>
  );
}

export default function OrdersPage() {
  const router = useRouter(); // Creates router object so we can redirect users programmatically
  const [orders, setOrders] = useState([]); // Stores the list of orders returned from the API
  const [loading, setLoading] = useState(true); // Tracks whether the orders are still loading
  const [error, setError] = useState(null); // Stores an error message if the API request fails

  // Runs once when the page loads to fetch the user's orders
  useEffect(() => {
    async function load() {
      // Async function to load orders from the backend API

      const res = await fetch("/api/orders"); // Sends GET request to the orders API route

      // If user is not logged in, redirect them to login page
      if (res.status === 401) {
        router.replace("/login");
        return;
      }

      const json = await res.json(); // Convert API response into JSON

      // If API response is not successful, show an error message
      if (!res.ok) {
        setError(json.error ?? "Failed to load orders");
        setLoading(false);
        return;
      }

      setOrders(json.orders ?? []); // Save orders from API into state
      setLoading(false); // Stop loading because data has been fetched successfully
    }

    load();
  }, [router]); // Dependency array: effect depends on router

  const grouped = orders.reduce((acc, order) => {
    // Groups orders by month and year based on created_at date

    const date = new Date(order.created_at); // Convert order created_at value into a JavaScript Date object

    // Create a key like "June 2026"
    const key = date.toLocaleString("default", {
      month: "long",
      year: "numeric",
    });

    // If this month does not exist in accumulator yet, create an empty array
    if (!acc[key]) acc[key] = [];

    acc[key].push(order); // Add current order into the correct month group

    return acc; // Return updated accumulator for next loop
  }, {}); // Initial value is an empty object

  // If there is an error, display it and stop rendering the rest of the page
  if (error) return <p className="text-red-600 p-8">{error}</p>;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header section */}
      <div style={{ marginBottom: "32px" }}>
        {/* Page title */}
        <h1
          style={{
            fontFamily: '"Lato",serif',
            fontSize: "36px",
            fontWeight: 700,
            color: "#7B1A1A",
            margin: "0 0 32px 0",
          }}
        >
          My Orders
        </h1>

        {/* Gold divider line */}
        <div
          style={{
            height: "2px",
            background: "linear-gradient(90deg, #C9A84C, transparent)",
            borderRadius: "1px",
          }}
        />
      </div>

      {/* Show skeleton loading UI while orders are being fetched */}
      {loading && (
        <div>
          {/* Fake month label placeholder */}
          <div className="h-5 w-24 bg-gray-200 rounded animate-pulse mb-4" />

          {/* Fake order cards */}
          <div className="space-y-4">
            {/* Create 4 skeleton cards */}
            {Array.from({ length: 4 }).map((_, i) => (
              <OrderCardSkeleton key={i} />
            ))}
          </div>
        </div>
      )}

      {/* Show empty message if loading is finished and there are no orders */}
      {!loading && orders.length === 0 && (
        <p className="text-gray-500">You have no orders yet.</p>
      )}

      {/* Show orders grouped by month when loading is finished and orders exist */}
      {!loading &&
        orders.length > 0 &&
        Object.entries(grouped).map(([month, monthOrders]) => (
          // Container for each month group
          <div key={month} className="mb-8">
            {/* Month heading, for example "June 2026" */}
            <p className="text-lg font-semibold text-gray-700 mb-4">{month}</p>

            {/* List of orders for this month */}
            <div className="space-y-4">
              {/* Loop through each order in the current month */}
              {monthOrders.map((order) => (
                // Single order card
                <div
                  key={order.id}
                  className="bg-white p-6 rounded-2xl shadow-sm border flex justify-between items-center"
                >
                  {/* Left side order information */}
                  <div>
                    {/* Order number and status badge row */}
                    <div className="flex items-center gap-3 mb-2">
                      {/* Display shortened order ID */}
                      <h2 className="font-semibold text-lg">
                        Order #{order.id.slice(0, 8).toUpperCase()}{" "}
                      </h2>

                      {/* Status badge with colour based on order.status */}
                      <span
                        className={`text-white text-xs px-3 py-1 rounded-full ${
                          statusColors[order.status] ?? "bg-gray-400"
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>

                    {/* Row for placed date, pickup date, and total */}
                    <div className="text-sm text-gray-600 flex gap-6">
                      {/* Show order placed date */}
                      <p>
                        Placed:{" "}
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>

                      {/* Show pickup date only if pickup_date exists */}
                      {order.pickup_date && (
                        <p>
                          Pickup:{" "}
                          {new Date(order.pickup_date).toLocaleDateString()}
                        </p>
                      )}

                      {/* Show total only if total_cents exists */}
                      {order.total_cents && (
                        <p>Total: ${(order.total_cents / 100).toFixed(2)}</p>
                      )}
                    </div>
                  </div>

                  {/* Button/link to open full order details page */}
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
        ))}
    </div>
  );
}
