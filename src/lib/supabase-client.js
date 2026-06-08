// src/lib/supabase-client.js
// Legacy singleton client - predates the @supabase/ssr setup.
// Only used in admin product pages for Supabase Storage (image uploads).
// For auth and data queries, use supabase-browser.js or supabase-server.js instead.
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY // anon key - RLS still applies
)
