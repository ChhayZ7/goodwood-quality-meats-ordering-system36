// GET /api/admin/orders
// Admin-only, returns all orders with optional filters.

import { NextResponse } from 'next/server'
import { withHandler } from '@/lib/middleware/withHandler'
import { createClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getAllOrders } from '@/lib/db/admin'

export const GET = withHandler(async (request) => {
  // Auth check
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json(
      { error: 'Unauthorised — please log in', status: 401 },
      { status: 401 }
    )
  }

  // Role check, admin only
  const { data: profile } = await supabaseAdmin
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'ADMIN') {
    return NextResponse.json(
      { error: 'Access denied — admin only', status: 403 },
      { status: 403 }
    )
  }

  // Parse query params
  const { searchParams } = new URL(request.url)

  const filters = {
    status:   searchParams.get('status')   ?? undefined,
    dateFrom: searchParams.get('dateFrom') ?? undefined,
    dateTo:   searchParams.get('dateTo')   ?? undefined,
    search:   searchParams.get('search')   ?? undefined,
    limit:    parseInt(searchParams.get('limit')  ?? '50'),
    offset:   parseInt(searchParams.get('offset') ?? '0'),
  }

  const { data, error } = await getAllOrders(filters)

  if (error) throw error

  return NextResponse.json({ orders: data })
})