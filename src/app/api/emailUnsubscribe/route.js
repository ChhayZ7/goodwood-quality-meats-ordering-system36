// src/app/api/emailUnsubscribe/route.js
// GET /api/emailUnsubscribe?token=<unsubscribe_token>
//
// One-click unsubscribe handler linked from the footer of every marketing email.
// No login is required — the token in the URL is the sole proof of identity.
//
// Flow:
//   1. Read ?token from the query string — 400 if missing
//   2. Look up the user by their unsubscribe_token — redirect to /invalid if not found
//   3. If already unsubscribed — redirect to /already (idempotent, no DB write)
//   4. Set email_unsubscribed = true — redirect to /success
//
// All outcomes redirect to /emailUnsubscribe?status=<outcome> rather than
// returning JSON, because this URL is opened directly in the browser from an
// email client, not called programmatically.
//
// Security note:
//   The token is a random UUID stored in public.users.unsubscribe_token.
//   We never confirm whether a token exists to an unauthenticated caller —
//   all negative outcomes redirect to the same generic pages so the endpoint
//   cannot be used to enumerate valid email addresses.

import { NextResponse }  from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')

  // ── 1. Token presence check ───────────────────────────────────────────────
  // A missing token means the link was malformed or manually typed — reject early.
  if (!token) {
    return NextResponse.json({ error: 'Missing token' }, { status: 400 })
  }

  // ── 2. Look up user by token ──────────────────────────────────────────────
  // unsubscribe_token is a unique column — .single() returns exactly one row or null.
  // We only select what we need; we deliberately avoid returning the user's email
  // or any other PII in the response.
  const { data: user, error: findError } = await supabaseAdmin
    .from('users')
    .select('id, email_unsubscribed')
    .eq('unsubscribe_token', token)
    .single()

  // Redirect to /invalid rather than returning a 404 — avoids leaking whether
  // a given token (and therefore email address) exists in our database
  if (findError || !user) {
    return NextResponse.redirect(new URL('/unsubscribe?status=invalid', request.url))
  }

  // ── 3. Already unsubscribed — idempotent redirect ─────────────────────────
  // Return success-equivalent so re-clicking the link from an old email
  // doesn't confuse the customer with an error page.
  if (user.email_unsubscribed) {
    return NextResponse.redirect(new URL('/unsubscribe?status=already', request.url))
  }

  // ── 4. Set email_unsubscribed = true ──────────────────────────────────────
  // Transactional emails (order confirmation, pickup reminder, weights confirmed)
  // are sent regardless of this flag — only marketing emails are suppressed.
  // The cron jobs check this flag before building their send list.
  const { error: updateError } = await supabaseAdmin
    .from('users')
    .update({ email_unsubscribed: true })
    .eq('id', user.id)

  if (updateError) {
    console.error('[unsubscribe] Failed to update user:', updateError)
    return NextResponse.redirect(new URL('/emailUnsubscribe?status=error', request.url))
  }

  // Redirect to a confirmation page — the UI shows a friendly message based on ?status=
  return NextResponse.redirect(new URL('/emailUnsubscribe?status=success', request.url))
}