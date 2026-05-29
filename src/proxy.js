// Refreshes the Supabase session on every matched request for Supabase SSR auth functionality
// Redirects unauthenticated users in PROTECTED_ROUTES so they return after logging in
// Redirects staff/admin away from /account to /admin (they manage, not shop)
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

const PROTECTED_ROUTES = ['/checkout']
const CUSTOMER_ONLY_ROUTES = ['/account']

export async function proxy(request) {
  const { pathname } = request.nextUrl

  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        // Must return all cookies
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response = NextResponse.next({ request })
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // Refresh session, required for Supabase SSR to work correctly
  const { data: { user } } = await supabase.auth.getUser()

  const isProtected = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  )

  if (isProtected && !user) {
    // Encode the FULL URL including query params as redirectTo
    const fullPath = request.nextUrl.pathname + request.nextUrl.search
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirectTo', fullPath)
    return NextResponse.redirect(loginUrl)
  }

  const isCustomerRoute = CUSTOMER_ONLY_ROUTES.some((route) =>
    pathname.startsWith(route)
  )

  if (isCustomerRoute && user) {
    const role = user.app_metadata?.role
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

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/account/:path*',
    '/api/:path*',
    '/checkout',
  ],
}