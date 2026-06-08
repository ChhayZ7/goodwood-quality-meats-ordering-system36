// src/lib/supabase-browser.js
// Supabase client for CLIENT COMPONENTS (browser-side React).
// Uses anon key - all queries are subject to RLS policies.

import { createBrowserClient } from "@supabase/ssr";

// Factory function (not singleton) - @supabase/ssr requires a fresh instance per render
export function createClient(){
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY // safe to expose - RLS enforces access control
    )
}