// src/app/api/emailUnsubscribe/route.js
// Handles one-click unsubscribe links from marketing emails.
// The token in the URL uniquely identifies the user without
// requiring them to be logged in.

import { NextResponse }  from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')

  if (!token) {
    return NextResponse.json({ error: 'Missing token' }, { status: 400 })
  }

  // Find the user by their unsubscribe token
  const { data: user, error: findError } = await supabaseAdmin
    .from('users')
    .select('id, email_unsubscribed')
    .eq('unsubscribe_token', token)
    .single()

  if (findError || !user) {
    // Redirect to a generic page — don't leak whether the token exists
    return NextResponse.redirect(new URL('/unsubscribe?status=invalid', request.url))
  }

  if (user.email_unsubscribed) {
    // Already unsubscribed — redirect to success so the page still looks right
    return NextResponse.redirect(new URL('/unsubscribe?status=already', request.url))
  }

  // Mark the user as unsubscribed
  const { error: updateError } = await supabaseAdmin
    .from('users')
    .update({ email_unsubscribed: true })
    .eq('id', user.id)

  if (updateError) {
    console.error('[unsubscribe] Failed to update user:', updateError)
    return NextResponse.redirect(new URL('/emailUnsubscribe?status=error', request.url))
  }

  return NextResponse.redirect(new URL('/emailUnsubscribe?status=success', request.url))
}