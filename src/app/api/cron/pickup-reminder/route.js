// src/app/api/cron/pickup-reminder/route.js
// POST /api/cron/pickup-reminder — daily pickup reminder to customers.
//
// Scheduled via pg_cron to fire once per day.
// Finds all CONFIRMED and READY orders with a pickup_date of tomorrow
// (in Adelaide local time) and sends each customer a reminder email.
//
// Flow:
//   1. Verify CRON_SECRET — reject anything that isn't our pg_cron job
//   2. Resolve tomorrow's date in Adelaide time (handles daylight saving)
//   3. Fetch all eligible orders — CONFIRMED or READY, pickup tomorrow, not yet reminded
//   4. For each order: send reminder email, then mark reminder_sent = true
//   5. On email failure: log and skip — reminder_sent stays false so it retries tomorrow
//
// Returns: { sent: number, skipped: number }

import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { sendPickupReminderEmail } from '@/lib/email/pickupReminder'

// ─── Adelaide timezone helper ─────────────────────────────────────────────────
// Adelaide runs at UTC+9:30 (standard) and UTC+10:30 (daylight saving, Oct–Apr).
// Hardcoding either offset would break twice a year, so we derive the date using
// the IANA timezone name instead — the JS runtime handles DST automatically.
function getTomorrowAdelaide() {
  const now = new Date()

  // en-CA locale gives consistent YYYY-MM-DD format — other locales vary
  const adelaideDateStr = now.toLocaleDateString('en-CA', {
    timeZone: 'Australia/Adelaide',
  })

  // Parse as midnight local time, then add one day
  const adelaideDate = new Date(adelaideDateStr + 'T00:00:00')
  adelaideDate.setDate(adelaideDate.getDate() + 1)

  const pad = n => String(n).padStart(2, '0')
  return `${adelaideDate.getFullYear()}-${pad(adelaideDate.getMonth() + 1)}-${pad(adelaideDate.getDate())}`
}

export async function POST(request) {
  // ── 1. Authenticate the cron caller ──────────────────────────────────────
  // CRON_SECRET is set in both Vercel env and the pg_cron job HTTP header.
  // Any other caller gets a 401 — this endpoint must never be publicly triggerable.
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  // ── 2. Resolve tomorrow in Adelaide time ──────────────────────────────────
  const tomorrow = getTomorrowAdelaide()
  console.log(`[pickup-reminder] Running for pickup date: ${tomorrow}`)

  // ── 3. Fetch eligible orders ──────────────────────────────────────────────
  // Three filters narrow this to exactly the orders that need a reminder today:
  //   status IN (CONFIRMED, READY) — excludes PENDING, COMPLETED, CANCELLED
  //   pickup_date = tomorrow       — only orders being collected tomorrow
  //   reminder_sent = false        — prevents sending the same reminder twice
  const { data: orders, error: fetchError } = await supabaseAdmin
    .from('orders')
    .select(`
      id,
      status,
      pickup_date,
      total_cents,
      deposit_paid_cents,
      customer:users ( id, first_name, last_name, email ),
      order_items (
        id,
        quantity,
        weight_preference,
        product:products ( id, name, product_type, price_per_kg_cents ),
        weight_option:product_weight_options ( id, label, min_weight_kg, max_weight_kg )
      )
    `)
    .in('status', ['CONFIRMED', 'READY'])
    .eq('pickup_date', tomorrow)
    .eq('reminder_sent', false) // idempotency guard — never remind twice

  if (fetchError) {
    console.error('[pickup-reminder] Failed to fetch orders:', fetchError)
    return NextResponse.json({ error: fetchError.message }, { status: 500 })
  }

  if (!orders || orders.length === 0) {
    // console.log('[pickup-reminder] No orders to remind today.')
    return NextResponse.json({ sent: 0, skipped: 0 })
  }

  // console.log(`[pickup-reminder] Found ${orders.length} order(s) to remind.`)

  // Format the date once outside the loop — same string for every email
  const pickupDate = new Date(tomorrow + 'T00:00:00').toLocaleDateString('en-AU', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  // ── 4 & 5. Send reminders ─────────────────────────────────────────────────
  let sent    = 0
  let skipped = 0

  for (const order of orders) {
    const customer = order.customer

    // Guard — should never happen, but log clearly if it does
    if (!customer?.email) {
      console.warn(`[pickup-reminder] Order ${order.id} has no customer email — skipping.`)
      skipped++
      continue
    }

    const invoiceNumber = `GW-${order.id.slice(0, 8).toUpperCase()}`

    try {
      await sendPickupReminderEmail({ customer, order, invoiceNumber, pickupDate })

      // Mark as sent AFTER the email succeeds — never before.
      // If this update fails, the email still went out; the worst case is a
      // duplicate reminder tomorrow, which is acceptable.
      await supabaseAdmin
        .from('orders')
        .update({ reminder_sent: true })
        .eq('id', order.id)

      // console.log(`[pickup-reminder] Sent reminder for ${invoiceNumber} to ${customer.email}`)
      sent++
    } catch (emailErr) {
      // Do NOT mark reminder_sent — leaving it false means the job will
      // retry on the next daily run, giving the customer another chance to receive it.
      console.error(`[pickup-reminder] Failed for ${invoiceNumber}:`, emailErr)
      skipped++
    }
  }

  // console.log(`[pickup-reminder] Done. Sent: ${sent}, Skipped: ${skipped}`)
  return NextResponse.json({ sent, skipped })
}