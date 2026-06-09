// This file is the customer order detail page.
// It shows one specific order based on the order id from the URL.
// Example URL: /account/orders/123
// It also allows the customer to download an invoice, leave feedback, and go back to the orders list.

"use client";

// useState is used to store changing data such as order, loading, and error.
// useEffect is used to run code when the page loads.

import { useState, useEffect } from "react"; // In this page, useEffect is used to fetch order details from the API.

// useRouter is used for navigation, such as redirecting the user to login.
// useParams is used to read the dynamic URL parameter [id].
import { useRouter, useParams } from "next/navigation";

import Link from "next/link";

// This object stores Tailwind background colours for each possible order status.
const statusColors = {
  PENDING: "bg-gray-400",
  CONFIRMED: "bg-yellow-500",
  IN_PROGRESS: "bg-blue-500",
  READY_FOR_PICKUP: "bg-green-500",
  COMPLETED: "bg-gray-500",
  CANCELLED: "bg-red-500",
};

// These are the statuses where the invoice should be treated as final.
// If the order status is inside this array, the page shows final invoice wording.
const FINAL_STATUSES = ["READY", "COMPLETED"];

export default function OrderDetailPage() {
  const router = useRouter(); // router allows us to redirect the user to another page.
  const { id } = useParams(); // useParams gets the dynamic route value from the URL.
  const [order, setOrder] = useState(null); // order stores the order data returned from the API.
  const [loading, setLoading] = useState(true); // loading controls whether the skeleton loading screen should be shown.
  const [error, setError] = useState(null); // error stores any error message if the order fails to load.

  // It calls the API to load the order details.
  useEffect(() => {
    async function load() {
      // This async function fetches the order data from the backend API.

      const res = await fetch(`/api/orders/${id}`); // Fetch the order details using the order id from the URL.

      // If the API returns 401, the user is redirected to the login page.
      if (res.status === 401) {
        router.replace("/login");
        return;
      }

      const json = await res.json(); // Convert the API response into JSON format.

      // If the response is not successful, show an error message.
      if (!res.ok) {
        setError(json.error ?? "Failed to load order");
        setLoading(false);
        return;
      }

      setOrder(json.order); // If the API request is successful, save the order data in state.
      setLoading(false); // Stop showing the loading skeleton because the order has loaded.
    }

    load();
  }, [id, router]);

  // While the order is still loading, show a skeleton UI.
  if (loading)
    return (
      <div className="max-w-5xl mx-auto animate-pulse">
        {/* Header skeleton */}
        <div style={{ marginBottom: "32px" }}>
          {/* Fake loading block for the page title */}
          <div
            style={{
              height: "40px",
              width: "320px",
              background: "#F0E8D0",
              borderRadius: "6px",
              marginBottom: "32px",
            }}
          />

          {/* Fake loading divider line */}
          <div
            style={{
              height: "2px",
              background: "linear-gradient(90deg, #C9A84C, transparent)",
              borderRadius: "1px",
            }}
          />
        </div>

        {/* Status badge skeleton */}
        <div className="flex justify-between items-center mb-8">
          {/* Fake loading date fields */}
          <div className="flex gap-4">
            <div className="h-4 w-28 bg-gray-200 rounded" />
            <div className="h-4 w-28 bg-gray-200 rounded" />
          </div>

          {/* Fake loading status badge */}
          <div className="h-9 w-28 bg-gray-200 rounded-full" />
        </div>

        {/* Order Items card skeleton */}
        <div className="bg-white rounded-xl border border-gray-200 p-8 mb-6">
          {/* Fake loading heading */}
          <div className="h-6 w-32 bg-gray-200 rounded mb-6" />

          {/* Fake loading table header */}
          <div className="flex gap-4 pb-3 border-b border-gray-200 mb-2">
            <div className="h-4 w-24 bg-gray-200 rounded" />
            <div className="h-4 w-36 bg-gray-200 rounded ml-auto" />
            <div className="h-4 w-16 bg-gray-200 rounded" />
            <div className="h-4 w-20 bg-gray-200 rounded" />
          </div>

          {/* Fake loading table rows */}
          {[1, 2].map((i) => (
            <div
              key={i}
              className="flex gap-4 py-4 border-b border-gray-100 last:border-0"
            >
              <div className="h-4 w-40 bg-gray-200 rounded" />
              <div className="h-4 w-20 bg-gray-200 rounded ml-auto" />
              <div className="h-4 w-8 bg-gray-200 rounded" />
              <div className="h-4 w-16 bg-gray-200 rounded" />
            </div>
          ))}
        </div>

        {/* Payment Summary card skeleton */}
        <div className="bg-white rounded-xl border border-gray-200 p-8 mb-8">
          {/* Fake loading heading */}
          <div className="h-6 w-44 bg-gray-200 rounded mb-6" />

          {/* Fake loading payment lines */}
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
    );

  // If there is an error, show the error message in red.
  if (error) return <p className="text-red-600 p-8">{error}</p>;

  // If there is no order data, show an order not found message.
  if (!order) return <p className="text-gray-500 p-8">Order not found.</p>;

  const isFinal = FINAL_STATUSES.includes(order.status); // Check whether this order is in a final status.

  // This changes the invoice button text depending on whether the order is final.
  const invoiceLabel = isFinal
    ? "Download Final Invoice"
    : "Download Confirmation Invoice";

  return (
    <div className="max-w-5xl mx-auto">
      {/* ── Header ── */}
      <div style={{ marginBottom: "32px" }}>
        {/* Header row with order number on the left and status badge on the right */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "32px",
          }}
        >
          <h1
            style={{
              fontFamily: '"Lato",serif',
              fontSize: "36px",
              fontWeight: 700,
              color: "#7B1A1A",
              margin: 0,
            }}
          >
            {/* Page heading showing the first 8 characters of the order id */}
            Order #{order.id.slice(0, 8).toUpperCase()}{" "}
            
          </h1>

          {/* Status badge */}
          <span
            className={`text-white text-sm px-4 py-2 rounded-full ${statusColors[order.status] ?? "bg-gray-400"}`}
          >
            {order.status}
          </span>
        </div>

        {/* Decorative gold divider*/}
        <div
          style={{
            height: "2px",
            background: "linear-gradient(90deg, #C9A84C, transparent)",
            borderRadius: "1px",
          }}
        />
      </div>

      {/* Dates section showing when the order was placed and pickup date if available */}
      <div className="text-sm text-gray-500 flex gap-4 mb-8">
        {/* Show placed date only if created_at exists */}
        {order.created_at && (
          <span>Placed: {new Date(order.created_at).toLocaleDateString()}</span>
        )}

        {/* Show pickup date only if pickup_date exists */}
        {order.pickup_date && (
          <span>
            Pickup: {new Date(order.pickup_date).toLocaleDateString()}
          </span>
        )}
      </div>

      {/* ── Final invoice banner ── */}
      {isFinal && (
        <div
          className="mb-6 rounded-xl border p-4 flex items-start gap-3"
          style={{ background: "#F0FDF4", borderColor: "#86EFAC" }}
        >
          {/* Green tick icon */}
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#16A34A"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ flexShrink: 0, marginTop: "1px" }}
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>

          {/* Banner message explaining that final weights have been confirmed */}
          <div>
            <p
              className="text-sm font-semibold"
              style={{ color: "#166534", margin: "0 0 2px" }}
            >
              Your order has been weighed and confirmed
            </p>
            <p className="text-sm" style={{ color: "#166534", margin: 0 }}>
              The figures below reflect the actual weights. Please pay the
              balance due at pickup via EFTPOS.
            </p>
          </div>
        </div>
      )}

      {/* ── Order Items Card ── */}
      <div className="bg-white rounded-xl border border-gray-200 p-8 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">
          Order Items
        </h2>

        {/* Table showing product, weight preference, actual weight, quantity, and price */}
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-600 border-b border-gray-200">
              <th className="text-left pb-3 font-semibold">Product</th>
              <th className="text-left pb-3 font-semibold">
                Weight Preference
              </th>

              {/* Show actual weight column once the order has been weighed */}
              {isFinal && (
                <th className="text-center pb-3 font-semibold">
                  Actual Weight
                </th>
              )}

              <th className="text-center pb-3 font-semibold">Quantity</th>
              <th className="text-right pb-3 font-semibold">Unit Price</th>
            </tr>
          </thead>

          <tbody>
            {/* Loop through order_items */}
            {(order.order_items ?? []).map((item, i) => (
              <tr key={i} className="border-b border-gray-100 last:border-0">
                {/* Product name. */}
                <td className="py-4 text-gray-800">
                  {item.product?.name ?? "—"}
                </td>

                {/* Customer's selected weight preference */}
                <td className="py-4 text-gray-600">
                  {item.weight_preference ?? "—"}
                </td>

                {/* Actual weight is only shown for final orders */}
                {isFinal && (
                  <td className="py-4 text-center text-gray-800">
                    {item.actual_weight_kg != null
                      ? `${item.actual_weight_kg} kg`
                      : "—"}
                  </td>
                )}

                {/* Quantity ordered */}
                <td className="py-4 text-center text-gray-800">
                  {item.quantity}
                </td>

                {/* Unit price converted from cents to dollars */}
                <td className="py-4 text-right text-gray-800">
                  {item.unit_price_cents
                    ? `$${(item.unit_price_cents / 100).toFixed(2)}`
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Show order notes only if notes exist */}
        {order.notes && (
          <div className="mt-6 pt-4 border-t border-gray-100">
            <p className="text-sm font-semibold text-gray-700 mb-1">
              Order Notes
            </p>
            <p className="text-sm text-gray-500 italic mt-2">{order.notes}</p>
          </div>
        )}
      </div>

      {/* ── Payment Summary Card ── */}
      <div className="bg-white rounded-xl border border-gray-200 p-8 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">
          Payment Summary
        </h2>

        <div className="space-y-3 text-sm">
          {/* Deposit paid amount.*/}
          <div className="flex justify-between text-gray-600">
            <span>Deposit Paid:</span>
            <span>
              {order.deposit_paid_cents != null
                ? `$${(order.deposit_paid_cents / 100).toFixed(2)}`
                : "—"}
            </span>
          </div>

          {/* Total amount. If the order is final, it says Confirmed Total. Otherwise, it says Estimated Total. */}
          <div className="flex justify-between text-gray-600">
            <span>{isFinal ? "Confirmed Total:" : "Estimated Total:"}</span>
            <span>
              {order.total_cents != null
                ? `$${(order.total_cents / 100).toFixed(2)}`
                : "—"}
            </span>
          </div>

          {/* Balance due section */}
          <div className="border-t border-gray-200 pt-3 mt-3 space-y-3">
            <div className="flex justify-between font-semibold">
              <span>Balance Due:</span>

              {/* Balance due is calculated as total minus deposit paid */}
              <span className="text-[#8B1A1A]">
                {order.total_cents != null && order.deposit_paid_cents != null
                  ? `$${((order.total_cents - order.deposit_paid_cents) / 100).toFixed(2)}`
                  : "—"}
              </span>
            </div>

            {/* Only show the estimate disclaimer while figures are still estimated */}
            {!isFinal && (
              <p className="text-xs text-gray-400 mt-1">
                Final amount will be confirmed once your order has been weighed.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Bottom Buttons ── */}
      <div className="flex gap-4 flex-wrap">
        {/* Invoice download button. It opens the invoice API route in a new browser tab. */}
        <button
          onClick={() =>
            window.open(`/api/orders/${id}/invoice/confirmation`, "_blank")
          }
          className="flex items-center gap-2 bg-[#8B1A1A] text-white px-6 py-3 rounded-lg text-sm font-semibold hover:opacity-90 transition"
        >
          {/* Download icon */}
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>

          {/* Dynamic invoice button label */}
          {invoiceLabel}
        </button>

        {/* Link to the feedback/review page for this order */}
        <Link
          href={`/account/orders/${id}/feedback`}
          className="flex items-center gap-2 border border-[#8B1A1A] text-[#8B1A1A] px-6 py-3 rounded-lg text-sm font-semibold hover:bg-[#8B1A1A] hover:text-white transition"
        >
          {/* Star icon */}
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          Leave a Review
        </Link>

        {/* Link back to the customer's full orders list */}
        <Link
          href="/account/orders"
          className="flex items-center gap-2 border border-[#8B1A1A] text-[#8B1A1A] px-6 py-3 rounded-lg text-sm font-semibold hover:bg-[#8B1A1A] hover:text-white transition"
        >
          ← Back to Orders
        </Link>
      </div>
    </div>
  );
}
