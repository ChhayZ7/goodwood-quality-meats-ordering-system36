"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function AccountLayout({ children }) {
  const pathname = usePathname()

  return (
    <div className="flex min-h-screen">

      {/* SIDEBAR */}
      <div className="w-64 bg-[#f9f9f9] border-r px-6 py-8">

        <p className="text-sm text-gray-500 mb-6">Hi, John</p>

        <div className="space-y-3">

          {/* My Orders */}
          <Link
            href="/account/orders"
            className={`block px-4 py-2 rounded-lg ${
              pathname === "/account/orders"
                ? "bg-red-800 text-white"
                : "text-gray-700 hover:bg-gray-200"
            }`}
          >
            My Orders
          </Link>

          {/* My Account */}
          <Link
            href="/account/profile"
            className={`block px-4 py-2 rounded-lg ${
              pathname === "/account/profile"
                ? "bg-red-800 text-white"
                : "text-gray-700 hover:bg-gray-200"
            }`}
          >
            My Account
          </Link>

          {/* Logout */}
          <Link
            href="/login"
            className="flex items-center gap-2 text-gray-700 mt-6 hover:text-red-700"
          >
            <span>↩</span> Log Out
          </Link>

        </div>
      </div>

      {/* RIGHT CONTENT */}
      <div className="flex-1 bg-[#f4f1ec]">

        {/* TOP SPACING (important for your UI) */}
        <div className="px-12 py-10">

          {/* Back to home */}
          <Link
            href="/products"
            className="text-sm text-red-700 mb-6 inline-block"
          >
            ← Back to Home
          </Link>

          {children}
        </div>

      </div>
    </div>
  )
}