import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

// Session refresh + protect/dashboard routes
export async function proxy(request) {
  console.log('[proxy] fired for:', request.nextUrl.pathname)
  console.log('[proxy] cookies:', request.cookies.getAll().map(c => c.name))
  let response = NextResponse.next({ request })
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies: { getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => cookiesToSet.forEach(({ name, value, options }) =>
        response.cookies.set(name, value, options)) } }
  )
  await supabase.auth.getUser()
  return response
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/account/:path*',
    '/api/:path*'] }