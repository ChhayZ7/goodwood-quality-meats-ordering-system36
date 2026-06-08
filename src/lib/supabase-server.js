// src/lib/supabase-server.js
// Supabase client for SERVER COMPONENTS and API ROUTE HANDLERS.
// Reads/Writes the session via Next.js cookies() instead of localStorage

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// async because Next.js 15 made cookies() return a Promise
export async function createClient() {
  const cookieStore = await cookies()
  const allCookies = cookieStore.getAll()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, // anon key - RLS applies here
    {
      cookies: {
        getAll: () => cookieStore.getAll(), // read session from incoming request cookies

        // Write refreshed tokens back to the response
        // try/catch needed - Erver Componenets have read-only cookies, API routes do not
        setAll: (cookiesToSet) => {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch (error) {
            console.error('[supabase-server] error setting cookies:', error)
          }
        }
      }
    }
  )
}