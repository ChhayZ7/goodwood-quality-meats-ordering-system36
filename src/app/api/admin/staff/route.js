// src/app/api/admin/staff/route.js
//
// GET  /api/admin/staff  — list all STAFF and ADMIN accounts
// POST /api/admin/staff  — create a new STAFF or ADMIN account
//
// Both endpoints are admin-only.
//
// Account creation notes:
//   - The account is created via the Supabase Admin API (not the browser
//     signUp flow) so it bypasses email confirmation and can set app_metadata.
//   - The on_auth_user_created database trigger fires and inserts a row into
//     public.users with role = CUSTOMER. We immediately overwrite that with
//     the correct role and is_active = true.
//   - The admin sets a temporary password which the new staff member should
//     change after their first login.

import { NextResponse } from 'next/server'
import { withHandler } from '@/lib/middleware/withHandler'
import { createClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase-admin'

// ─── Shared auth helper ───────────────────────────────────────────────────────
async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return { user: null, error: 'unauthenticated' }
  if (user.app_metadata?.role !== 'ADMIN') return { user: null, error: 'forbidden' }
  return { user, error: null }
}

// ─── GET ──────────────────────────────────────────────────────────────────────
export const GET = withHandler(async () => {
  const { error: authErr } = await requireAdmin()
  if (authErr === 'unauthenticated') {
    return NextResponse.json({ error: 'Unauthorised — please log in' }, { status: 401 })
  }
  if (authErr === 'forbidden') {
    return NextResponse.json({ error: 'Access denied — admin only' }, { status: 403 })
  }

  // Return both STAFF and ADMIN rows so the admin can manage their entire team
  // from one table (including promoting/demoting and seeing other admins)
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('id, first_name, last_name, email, phone, role, is_active, created_at')
    .in('role', ['STAFF', 'ADMIN'])   // ← show both roles
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ staff: data })
})

// ─── POST ─────────────────────────────────────────────────────────────────────
export const POST = withHandler(async (request) => {
  const { error: authErr } = await requireAdmin()
  if (authErr === 'unauthenticated') {
    return NextResponse.json({ error: 'Unauthorised — please log in' }, { status: 401 })
  }
  if (authErr === 'forbidden') {
    return NextResponse.json({ error: 'Access denied — admin only' }, { status: 403 })
  }

  const body = await request.json()
  const { first_name, last_name, email, phone, password, role = 'STAFF' } = body

  // Validate required fields before touching Supabase Auth
  if (!first_name || !last_name || !email || !password) {
    return NextResponse.json(
      { error: 'first_name, last_name, email and password are required' },
      { status: 400 }
    )
  }

  if (password.length < 8) {
    return NextResponse.json(
      { error: 'Password must be at least 8 characters' },
      { status: 400 }
    )
  }

  // Validate role
  if (!['STAFF', 'ADMIN'].includes(role)) {
    return NextResponse.json(
      { error: 'role must be either STAFF or ADMIN' },
      { status: 400 }
    )
  }

  // Check for duplicate email before creating the auth user — a clearer error
  // than the one Supabase would return from createUser
  const { data: existing } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('email', email)
    .single()

  if (existing) {
    return NextResponse.json(
      { error: 'An account with this email already exists' },
      { status: 409 }
    )
  }

  // Create the Supabase Auth user via the Admin API.
  // email_confirm: true — skips the email verification step since the admin
  // is setting up the account directly.
  // app_metadata.role — stored server-side only, so it can't be spoofed by
  // the user modifying their own JWT claims.
  const { data: authData, error: authCreateError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      first_name,
      last_name,
      phone: phone ?? '',
    },
    app_metadata: {
      role, 
    },
  })

  if (authCreateError) {
    return NextResponse.json({ error: authCreateError.message }, { status: 500 })
  }

  // The on_auth_user_created trigger inserts a row into public.users with
  // role = CUSTOMER. Overwrite it with the correct role from the request body.
  const { error: roleError } = await supabaseAdmin
    .from('users')
    .update({ role, is_active: true }) // ← use the role from request body
    .eq('id', authData.user.id)

  if (roleError) {
    return NextResponse.json({ error: roleError.message }, { status: 500 })
  }

  // Fetch and return the created member so the UI can add the row immediately
  const { data: staffMember } = await supabaseAdmin
    .from('users')
    .select('id, first_name, last_name, email, phone, role, is_active, created_at')
    .eq('id', authData.user.id)
    .single()
  // 201 Created
  return NextResponse.json({ staff: staffMember }, { status: 201 })
})