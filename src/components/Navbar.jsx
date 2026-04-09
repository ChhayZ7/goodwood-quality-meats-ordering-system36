// Top navigation bar - logo, links, cart icon, auth state
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

// Pages where we want a simpler header
const AUTH_PAGES = ['/login', '/signup', '/forgot-password', '/verify-email']

function Logo() {
  return <Link href="/">Goodwood Quality Meats</Link>
}

export default function Navbar({ cartCount = 0, user = null }) {
  const pathname = usePathname()
  const isAuthPage = AUTH_PAGES.includes(pathname)

  // Simple header for authentication pages
  if (isAuthPage) {
    return (
      <header>
        <nav>
          <Logo />
        </nav>
      </header>
    )
  }

  // Full header for normal pages
  return (
    <header>
      <nav>
        <div>
          <Logo />
        </div>

        <div>
          <Link href="/products">Products</Link>
          <Link href="/contact">Contact Us</Link>
        </div>

        <div>
          <Link href="/cart">Cart ({cartCount})</Link>

          {user ? (
            <Link href="/dashboard/orders">Hi, {user.firstName}</Link>
          ) : (
            <Link href="/login">Login</Link>
          )}
        </div>
      </nav>
    </header>
  )
}