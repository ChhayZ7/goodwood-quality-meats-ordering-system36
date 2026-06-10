// src/proxy.js
// Next.js middleware - runs on the Edge before every matches request.
// Three responsibilities: session refresh, auth guard, role-based direc.

import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

// Routes that require a logged-in user - unauthenticated requests are redirected to /login
const PROTECTED_ROUTES = ['/checkout']

// Routes that are customer-only - staff/admin are redirected to their dasboard instead
const CUSTOMER_ONLY_ROUTES = ['/account']

export async function proxy(request) {
  const { pathname } = request.nextUrl

  // Start with a pass-through response - may be replaced by a redirect below
  let response = NextResponse.next({ request })

  // Middleware cannot use supabase-server.js (no cookies() API on the Edge)
  // so we construct the client inline with the raw request/response cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        // Must return all cookies
        getAll() {
          return request.cookies.getAll()
        },
        // Write refreshed tokens to both the request and the outgoing response
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response = NextResponse.next({ request }) // rebuild reponse with updated cookies
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // Always call getUser() - this is what triggers the token refresh on every request
  // Required by Supabase SSR to keep the session alive between page navigation
  const { data: { user } } = await supabase.auth.getUser()

  // ── Auth guard ────────────────────────────────────────────────────────────
  const isProtected = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  )

  if (isProtected && !user) {
    // Preserve the full URL (including query params like ?date=) so the user
    // lands back on the right page after logging in
    const fullPath = request.nextUrl.pathname + request.nextUrl.search
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirectTo', fullPath)
    return NextResponse.redirect(loginUrl)
  }

  // ── Role-based redirect ───────────────────────────────────────────────────
  // Prevents staff/admin from accessing the customer/account portal
  const isCustomerRoute = CUSTOMER_ONLY_ROUTES.some((route) =>
    pathname.startsWith(route)
  )

  if (isCustomerRoute && user) {
    const role = user.app_metadata?.role // role is stored in app_metadata, not user_metadata
    if (role === 'ADMIN') {
      const homeUrl = new URL('/admin/orders', request.url)
      return NextResponse.redirect(homeUrl)
    } else if (role === 'STAFF'){
      const homeUrl = new URL('/staff/orders', request.url)
      return NextResponse.redirect(homeUrl)
    }
  }

  return response
}

// Middleware only runs on these paths - excluded: static files, _next intervals, images
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/account/:path*',
    '/api/:path*',
    '/checkout',
  ],
}