// src/app/api/admin/feedback/route.js
// Get /api/admin/feedback
// Retuns all customer feedback submission, paginated.
// Admin only - staff cannot acces feedback.

import { NextResponse } from 'next/server'
import { withHandler } from '@/lib/middleware/withHandler'
import { createClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export const GET = withHandler(async (request) => {
  // Verify the session cookie is valid
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorised — please log in' }, { status: 401 })
  }

  // Only ADMIN can view feedback - STAFF cannot
  const { data: profile } = await supabaseAdmin
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Access denied — admin only' }, { status: 403 })
  }


  // Support optional pagination via ?limit= and ?offset= query params.
  // Defaults to the 50 most recent submissions.
  const { searchParams } = new URL(request.url)
  const limit  = parseInt(searchParams.get('limit')  ?? '50')
  const offset = parseInt(searchParams.get('offset') ?? '0')

  const { data, error } = await supabaseAdmin
    .from('feedback')
    .select(`
      id,
      created_at,
      score,
      feedback_text,
      customer:users ( id, first_name, last_name, email ),
      order:orders ( id, pickup_date )
    `)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) throw error

  return NextResponse.json({ feedback: data })
})