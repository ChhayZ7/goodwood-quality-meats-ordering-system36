// Refreshes the Supabase session on every matched request for Supabase SSR auth functionality
// Redirects unauthenticated users in PROTECTED_ROUTES so they return after logging in

import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

// Routes that require the user to be logged in
const PROTECTED_ROUTES = ['/checkout']

export async function middleware(request) {
  const { pathname } = request.nextUrl

  console.log('[middleware] fired for:', pathname)
  console.log('[middleware] cookies:', request.cookies.getAll().map(c => c.name))

  let response = NextResponse.next({ request })

  // Create Supabase client that reads/writes session cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) =>
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          ),
      },
    }
  )

  // Refresh the session
  const { data: { user } } = await supabase.auth.getUser()

  // Check if this route requires authentication
  const isProtected = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  )

  if (isProtected && !user) {
    // Redirect to login and save original destination
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(loginUrl)
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