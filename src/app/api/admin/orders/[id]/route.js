// GET   /api/admin/orders/:id
// Returns full order detail including the complete audit log for staff and admin only.
//
// PATCH /api/admin/orders/:id
// Updates an order and writes an audit log entry for every changed field for staff and admin only.

import { NextResponse } from 'next/server'
import { withHandler } from '@/lib/middleware/withHandler'
import { createClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getAdminOrderById, adminUpdateOrder } from '@/lib/db/admin'


// Shared admin auth helper
async function getAdminUser() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) return { user: null, error: 'unauthenticated' }

  const { data: profile } = await supabaseAdmin
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!['ADMIN', 'STAFF'].includes(profile?.role)) return { user: null, error: 'forbidden' }

  return { user, error: null }
}

// GET

export const GET = withHandler(async (request, { params }) => {
  const { id } = await params

  const { user, error: authErr } = await getAdminUser()
  if (authErr === 'unauthenticated') {
    return NextResponse.json({ error: 'Unauthorised — please log in', status: 401 }, { status: 401 })
  }
  if (authErr === 'forbidden') {
    return NextResponse.json({ error: 'Access denied — admin and staff only', status: 403 }, { status: 403 })
  }

  const { data, error } = await getAdminOrderById(id)

  if (error) throw error
  if (!data) {
    return NextResponse.json({ error: 'Order not found', status: 404 }, { status: 404 })
  }

  return NextResponse.json({ order: data })
})

// PATCH

const adminUpdateSchema = {
  types: {
    status:             'string',
    notes:              'string',
    pickup_date:        'string',
    deposit_paid_cents: 'number',
    reason:             'string',
  },
  validators: {
    status: (val) => {
      const valid = ['PENDING', 'CONFIRMED', 'READY', 'COMPLETED', 'CANCELLED']
      return valid.includes(val) ? null : `Must be one of: ${valid.join(', ')}`
    },
  },
}

export const PATCH = withHandler(
  async (request, { params }) => {
    const { id } = await params

    const { user, error: authErr } = await getAdminUser()
    if (authErr === 'unauthenticated') {
      return NextResponse.json({ error: 'Unauthorised — please log in', status: 401 }, { status: 401 })
    }
    if (authErr === 'forbidden') {
      return NextResponse.json({ error: 'Access denied — admin only', status: 403 }, { status: 403 })
    }

    const { reason, ...fields } = request._body

    if (!Object.keys(fields).length) {
      return NextResponse.json(
        { error: 'No valid fields provided to update', status: 400 },
        { status: 400 }
      )
    }

    const { data, error } = await adminUpdateOrder(id, fields, user.id, reason ?? null)

    if (error) throw error

    return NextResponse.json({ order: data })
  },
  { schema: adminUpdateSchema }
)