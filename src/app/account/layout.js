"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"

export default function AccountLayout({ children }) {
  const pathname = usePathname()
  const [firstName, setFirstName] = useState('')

    useEffect(() => {
      async function loadUser() {
        const res = await fetch('/api/users/me')
        const json = await res.json()
        if (json.user) setFirstName(json.user.first_name ?? '')
      }
      loadUser()
    }, [])

  return (
    <div className="flex" style={{ minHeight: 'calc(100vh - 89px)' }}>

      {/* SIDEBAR */}
      <aside className="w-56 bg-white border-r border-gray-200 px-6 py-8 flex flex-col flex-shrink-0">

        <p className="text-gray-400 text-sm mb-8">Hi, {firstName} </p>

        <nav className="space-y-1">
          
          <Link
            href="/account/orders"
            className={`block px-4 py-3 mb-1 rounded-md text-sm ${
              pathname.startsWith("/account/orders")
                ? "bg-[#8B1A1A] text-white"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            My Orders
          </Link>

          <Link
            href="/account/profile"
            className={`block px-4 py-3 mt-2  rounded-md text-sm ${
              pathname.startsWith("/account/profile")
                ? "bg-[#8B1A1A] text-white"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            My Account
          </Link>

         <button
          onClick={async () => {
            const { createClient } = await import('@/lib/supabase-browser')
            const supabase = createClient()
            await supabase.auth.signOut()
            window.location.href = '/login'
          }}
          className="flex items-center gap-2 text-gray-600 text-sm px-4 py-2.5 hover:bg-gray-100 rounded-md w-full"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Log Out
        </button>

        </nav>

      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1" style={{ backgroundColor: '#F5F0E8' }}>
        <div className="px-16 py-8">
          {children}
        </div>
      </main>

    </div>
  )
}