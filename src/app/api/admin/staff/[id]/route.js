// PATCH /api/admin/staff/[id] — activate or deactivate a staff account

import { NextResponse } from 'next/server'
import { withHandler } from '@/lib/middleware/withHandler'
import { createClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase-admin'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return { user: null, error: 'unauthenticated' }
  if (user.app_metadata?.role !== 'ADMIN') return { user: null, error: 'forbidden' }
  return { user, error: null }
}

export const PATCH = withHandler(async (request, { params }) => {
  const { id } = await params

  const { user: adminUser, error: authErr } = await requireAdmin()
  if (authErr === 'unauthenticated') {
    return NextResponse.json({ error: 'Unauthorised — please log in' }, { status: 401 })
  }
  if (authErr === 'forbidden') {
    return NextResponse.json({ error: 'Access denied — admin only' }, { status: 403 })
  }

  // Prevent admin from deactivating themselves
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

  // Make sure target is a STAFF account
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

  // Step 1: Update Supabase Auth FIRST
  // Must update auth before DB — if this fails we don't want DB out of sync
  // ban_duration 'none' = unban (reactivate), '876600h' ≈ 100 years = ban
  const { error: authUpdateError } = await supabaseAdmin.auth.admin.updateUserById(id, {
    ban_duration: is_active ? 'none' : '876600h',
  })

  if (authUpdateError) {
    return NextResponse.json({ error: authUpdateError.message }, { status: 500 })
  }

  // Step 2: Sync public.users AFTER auth succeeds
  const { error: updateError } = await supabaseAdmin
    .from('users')
    .update({ is_active })
    .eq('id', id)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  // Return updated staff member
  const { data: updated } = await supabaseAdmin
    .from('users')
    .select('id, first_name, last_name, email, phone, role, is_active, created_at')
    .eq('id', id)
    .single()

  return NextResponse.json({ staff: updated })
})

export async function DELETE(request, { params }) {
  const { id } = await params

  const { user: adminUser, error: authErr } = await requireAdmin()
  if (authErr === 'unauthenticated') {
    return NextResponse.json({ error: 'Unauthorised — please log in' }, { status: 401 })
  }
  if (authErr === 'forbidden') {
    return NextResponse.json({ error: 'Access denied — admin only' }, { status: 403 })
  }

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

  const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(id)
  if (authDeleteError) {
    return NextResponse.json({ error: authDeleteError.message }, { status: 500 })
  }

  const { error: dbError } = await supabaseAdmin
    .from('users')
    .delete()
    .eq('id', id)

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}