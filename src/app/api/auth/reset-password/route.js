import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export const POST = async (request) => {
  const { password } = await request.json()

  if (!password || password.length < 8) {
    return NextResponse.json(
      { error: 'Password must be at least 8 characters.' },
      { status: 400 }
    )
  }

  const supabase = await createClient()
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  console.log('[reset-password] session:', session)
  console.log('[reset-password] user:', user)
  console.log('[reset-password] sessionError:', sessionError)
  console.log('[reset-password] userError:', userError)

  if (userError || !user) {
    return NextResponse.json(
      { error: 'Auth session missing!' },
      { status: 401 }
    )
  }

  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}