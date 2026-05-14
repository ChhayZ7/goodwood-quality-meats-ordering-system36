// GET  /api/admin/staff — list all staff and admin accounts
// POST /api/admin/staff — create a new staff or admin account

import { NextResponse } from 'next/server'
import { withHandler } from '@/lib/middleware/withHandler'
import { createClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase-admin'

// Shared admin auth helper
async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return { user: null, error: 'unauthenticated' }
  if (user.app_metadata?.role !== 'ADMIN') return { user: null, error: 'forbidden' }
  return { user, error: null }
}

// GET /api/admin/staff — returns both STAFF and ADMIN accounts
export const GET = withHandler(async () => {
  const { error: authErr } = await requireAdmin()
  if (authErr === 'unauthenticated') {
    return NextResponse.json({ error: 'Unauthorised — please log in' }, { status: 401 })
  }
  if (authErr === 'forbidden') {
    return NextResponse.json({ error: 'Access denied — admin only' }, { status: 403 })
  }

  const { data, error } = await supabaseAdmin
    .from('users')
    .select('id, first_name, last_name, email, phone, role, is_active, created_at')
    .in('role', ['STAFF', 'ADMIN'])   // ← show both roles
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ staff: data })
})

// POST /api/admin/staff — create a new staff or admin account
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

  // Validate required fields
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

  // Check if email already exists
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

  // Create the auth user via Supabase Admin API
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

  // The on_auth_user_created trigger inserts into public.users with role CUSTOMER
  // Update it to the correct role
  const { error: roleError } = await supabaseAdmin
    .from('users')
    .update({ role, is_active: true }) // ← use the role from request body
    .eq('id', authData.user.id)

  if (roleError) {
    return NextResponse.json({ error: roleError.message }, { status: 500 })
  }

  // Fetch and return the created member
  const { data: staffMember } = await supabaseAdmin
    .from('users')
    .select('id, first_name, last_name, email, phone, role, is_active, created_at')
    .eq('id', authData.user.id)
    .single()

  return NextResponse.json({ staff: staffMember }, { status: 201 })
})