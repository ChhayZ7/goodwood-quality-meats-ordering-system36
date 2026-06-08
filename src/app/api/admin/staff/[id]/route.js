// src/app/api/admin/staff/[id]/route.js
//
// PATCH  /api/admin/staff/:id  — activate or deactivate a staff account
// DELETE /api/admin/staff/:id  — permanently delete a staff account
//
// Both endpoints are admin-only. An admin cannot target their own account.
//
// Deactivation strategy:
//   Supabase Auth is updated FIRST (ban_duration) before the public.users row
//   is updated. This order matters — if the DB update fails we can retry,
//   but if Auth were updated last and the DB update failed the user would
//   still be able to log in despite appearing inactive in the dashboard.

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

// ─── PATCH ────────────────────────────────────────────────────────────────────
export const PATCH = withHandler(async (request, { params }) => {
  const { id } = await params

  const { user: adminUser, error: authErr } = await requireAdmin()
  if (authErr === 'unauthenticated') {
    return NextResponse.json({ error: 'Unauthorised — please log in' }, { status: 401 })
  }
  if (authErr === 'forbidden') {
    return NextResponse.json({ error: 'Access denied — admin only' }, { status: 403 })
  }

  // Prevent an admin from locking themselves out
  if (id === adminUser.id) {
    return NextResponse.json(
      { error: 'You cannot deactivate your own account' },
      { status: 400 }
    )
  }

  const body = await request.json()
  const { is_active } = body

  if (typeof is_active !== 'boolean') {
    return NextResponse.json(
      { error: 'is_active must be a boolean' },
      { status: 400 }
    )
  }

  // Confirm the target is a STAFF account — admins cannot toggle other admins
  const { data: target } = await supabaseAdmin
    .from('users')
    .select('id, role')
    .eq('id', id)
    .single()

  if (!target) {
    return NextResponse.json({ error: 'Staff member not found' }, { status: 404 })
  }

  if (target.role !== 'STAFF') {
    return NextResponse.json(
      { error: 'Can only activate/deactivate STAFF accounts' },
      { status: 400 }
    )
  }

  // Step 1: Update Supabase Auth FIRST.
  // ban_duration 'none' = unban (reactivate).
  // ban_duration '876600h' ≈ 100 years — effectively a permanent ban.
  // Updating Auth before the DB ensures the login block is enforced even if
  // the subsequent DB write fails.
  const { error: authUpdateError } = await supabaseAdmin.auth.admin.updateUserById(id, {
    ban_duration: is_active ? 'none' : '876600h',
  })

  if (authUpdateError) {
    return NextResponse.json({ error: authUpdateError.message }, { status: 500 })
  }

  // Step 2: Sync the is_active flag in the public.users table
  const { error: updateError } = await supabaseAdmin
    .from('users')
    .update({ is_active })
    .eq('id', id)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  // Return the full updated staff member so the UI can refresh without a
  // second round-trip
  const { data: updated } = await supabaseAdmin
    .from('users')
    .select('id, first_name, last_name, email, phone, role, is_active, created_at')
    .eq('id', id)
    .single()

  return NextResponse.json({ staff: updated })
})

// ─── DELETE ───────────────────────────────────────────────────────────────────
export async function DELETE(request, { params }) {
  const { id } = await params

  const { user: adminUser, error: authErr } = await requireAdmin()
  if (authErr === 'unauthenticated') {
    return NextResponse.json({ error: 'Unauthorised — please log in' }, { status: 401 })
  }
  if (authErr === 'forbidden') {
    return NextResponse.json({ error: 'Access denied — admin only' }, { status: 403 })
  }
  // Prevent self-deletion
  if (id === adminUser.id) {
    return NextResponse.json({ error: 'You cannot delete your own account' }, { status: 400 })
  }

  const { data: target } = await supabaseAdmin
    .from('users')
    .select('id, role')
    .eq('id', id)
    .single()

  if (!target) {
    return NextResponse.json({ error: 'Staff member not found' }, { status: 404 })
  }

  // Delete from Supabase Auth first — this cascades the session invalidation
  // and removes the user from the auth.users table
  const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(id)
  if (authDeleteError) {
    return NextResponse.json({ error: authDeleteError.message }, { status: 500 })
  }

  // Then remove the corresponding row from public.users
  // (the on_auth_user_created trigger created this row, but deletion is not
  // cascaded automatically — it must be done explicitly)
  const { error: dbError } = await supabaseAdmin
    .from('users')
    .delete()
    .eq('id', id)

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}