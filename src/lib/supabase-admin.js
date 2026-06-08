// src/lib/supabase-admin.js
// Supabase client with SERVICE ROLE KEY - bypasses Row Level Security (RLS).
// Server-side only. Never import this in client components or pages.

import { createClient } from '@supabase/supabase-js'

// SUPABASE_SERVICE_ROLE_KEY has no NEXT_PUBLIC_ prefix - never sent to the browser
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // full DB access - used in API routes, webhooks, cron hobs
)