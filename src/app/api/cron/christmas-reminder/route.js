// src/app/api/cron/christmas-reminder/route.js
// POST /api/cron/christmas-reminder — annual marketing email to returning customers.
//
// Scheduled via pg_cron to fire once on November 1st each year.
// Targets customers who had a COMPLETED order in December of the previous year
// and have not unsubscribed from marketing emails.
//
// Flow:
//   1. Verify CRON_SECRET — reject anything that isn't our pg_cron job
//   2. Build last December's date range (e.g. 2025-12-01 → 2025-12-31)
//   3. Fetch all COMPLETED orders in that window with customer details
//   4. Deduplicate — one email per customer regardless of order count
//   5. Filter out unsubscribed customers
//   6. Send email to each eligible customer; count sent vs skipped
//
// Returns: { sent: number, skipped: number }

import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { sendChristmasReminderEmail }  from '@/lib/email/christmasReminder'

export async function POST(request) {
  // ── 1. Authenticate the cron caller ──────────────────────────────────────
  // CRON_SECRET is a shared secret set in both Vercel env and the pg_cron job.
  // Any other caller — including a logged-in admin — gets a 401.
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  // ── 2. Build last December's date range ───────────────────────────────────
  // This job runs on Nov 1st, so "last year" is always the correct Christmas season.
  // e.g. running on 2026-11-01 → queries 2025-12-01 to 2025-12-31
  const thisYear = new Date().getFullYear()
  const lastYear = thisYear - 1
  const dateFrom = `${lastYear}-12-01`
  const dateTo   = `${lastYear}-12-31`
  const appUrl   = process.env.NEXT_PUBLIC_URL ?? 'https://goodwoodqualitymeats.com.au'

  // console.log(`[christmas-reminder] Querying COMPLETED orders from ${dateFrom} to ${dateTo}`)

  // ── 3. Fetch eligible orders ──────────────────────────────────────────────
  // We only select customer fields — order line items aren't needed for this email.
  // unsubscribe_token is fetched here so the one-click unsubscribe URL can be
  // built per-customer without a second query.
  const { data: orders, error: fetchError } = await supabaseAdmin
    .from('orders')
    .select(`
      customer:users (
        id,
        first_name,
        email,
        email_unsubscribed,
        unsubscribe_token
      )
    `)
    .eq('status', 'COMPLETED')
    .gte('pickup_date', dateFrom)
    .lte('pickup_date', dateTo)

  if (fetchError) {
    console.error('[christmas-reminder] Failed to fetch orders:', fetchError)
    return NextResponse.json({ error: fetchError.message }, { status: 500 })
  }

  if (!orders || orders.length === 0) {
    // console.log('[christmas-reminder] No eligible customers found.')
    return NextResponse.json({ sent: 0, skipped: 0 })
  }

  // ── 4 & 5. Deduplicate and filter unsubscribed customers ──────────────────
  // A customer who placed 3 orders last December should still only get 1 email.
  // Unsubscribed customers are skipped here rather than in the query so we keep
  // the fetch simple and honour preference changes made after the query runs.
  const seenIds  = new Set()
  const customers = []

  for (const order of orders) {
    const customer = order.customer
    if (!customer?.email || !customer?.id) continue // skip malformed rows
    if (customer.email_unsubscribed) continue // respect opt-out
    if (seenIds.has(customer.id)) continue // already in the send list
    seenIds.add(customer.id)
    customers.push(customer)
  }

  // console.log(`[christmas-reminder] Sending to ${customers.length} unique customer(s)`)

  // ── 6. Send emails ────────────────────────────────────────────────────────
  // Each failure is caught individually so one bad address doesn't abort
  // the rest of the batch. skipped count is returned to the cron job log.
  let sent    = 0
  let skipped = 0

  for (const customer of customers) {
    // Build a unique unsubscribe URL using the customer's token — no login required
    const unsubscribeUrl = `${appUrl}/api/emailUnsubscribe?token=${customer.unsubscribe_token}`
    try {
      await sendChristmasReminderEmail({
        customerEmail:  customer.email,
        firstName:      customer.first_name ?? 'there',
        unsubscribeUrl,
      })
      // Non-fatal — log and move on to the next customer
      // console.log(`[christmas-reminder] Sent to ${customer.email}`)
      sent++
    } catch (emailErr) {
      // console.error(`[christmas-reminder] Failed for ${customer.email}:`, emailErr)
      skipped++
    }
  }

  // console.log(`[christmas-reminder] Done. Sent: ${sent}, Skipped: ${skipped}`)
  return NextResponse.json({ sent, skipped })
}