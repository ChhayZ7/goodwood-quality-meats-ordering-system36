import { NextResponse } from 'next/server'
import { withHandler } from '@/lib/middleware/withHandler'
import { createClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase-admin'

// for admin to retrieve feedback from database
// admin only can view
export const GET = withHandler(async (request) => {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorised — please log in' }, { status: 401 })
  }

  const { data: profile } = await supabaseAdmin
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Access denied — admin only' }, { status: 403 })
  }

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