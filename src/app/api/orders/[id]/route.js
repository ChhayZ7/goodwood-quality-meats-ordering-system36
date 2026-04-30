// GET /api/orders/:id
// Customers can only fetch their own orders, Staff and Admin can fetch any order
//
// PATCH /api/orders/:id
// Staff and Admin only, to update status, notes, pickup_date, deposit_paid_cents

import { NextResponse } from 'next/server'
import { withHandler, schemas } from '@/lib/middleware/withHandler'
import { createClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getOrderById, updateOrder } from '@/lib/db/orders'

// GET
export const GET = withHandler(async (request, { params }) => {
  const { id } = await params

  // Verify session
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) { // Supabase authentication 
    return NextResponse.json(
      { error: 'Unauthorised — please log in', status: 401 },
      { status: 401 }
    )
  }

  const { data, error } = await getOrderById(id)

  if (error) throw error
  if (!data) {
    return NextResponse.json(
      { error: 'Order not found', status: 404 },
      { status: 404 }
    )
  }

  // Look up the requesting user's role
  const { data: profile } = await supabaseAdmin
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  const isStaffOrAdmin = ['STAFF', 'ADMIN'].includes(profile?.role)
  const isOwner = data.customer?.id === user.id

  if (!isOwner && !isStaffOrAdmin) {
    return NextResponse.json(
      { error: 'You do not have permission to view this order', status: 403 },
      { status: 403 }
    )
  }

  return NextResponse.json({ order: data })
})

// PATCH

export const PATCH = withHandler(
  async (request, { params }) => {
    const { id } = await params

    // Verify session
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) { // Supabase authentication
      return NextResponse.json(
        { error: 'Unauthorised — please log in', status: 401 },
        { status: 401 }
      )
    }

    // Only staff and admin can make patch requests, check role
    const { data: profile } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!['STAFF', 'ADMIN'].includes(profile?.role)) {
      return NextResponse.json(
        { error: 'Access denied — staff or admin only', status: 403 },
        { status: 403 }
      )
    }

    const body = request._body

    if (!Object.keys(body).length) {
      return NextResponse.json(
        { error: 'No valid fields provided to update', status: 400 },
        { status: 400 }
      )
    }

    const { data, error } = await updateOrder(id, body)

    if (error) throw error

    return NextResponse.json({ order: data })
  },
  { schema: schemas.updateOrder }
)