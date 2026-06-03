// src/app/api/cron/pickup-reminder/route.js
// Called daily by the Supabase pg_cron job.
// Finds all CONFIRMED and READY_FOR_PICKUP orders with a pickup_date
// of tomorrow (Adelaide time), and sends each customer a reminder email.

import { NextResponse } from 'next/server'
import { supabaseAdmin }  from '@/lib/supabase-admin'
import { resend }         from '@/lib/resend'
import { pickupReminderHtml } from '@/lib/email/pickupReminder'

// Adelaide is UTC+9:30, UTC+10:30 during daylight saving (October–April).
// We derive "tomorrow in Adelaide" from the current UTC time rather than
// hardcoding the offset, so it stays correct across daylight saving changes.
function getTomorrowAdelaide() {
  // AEST offset: +9:30 standard, +10:30 daylight saving
  // A reliable way is to use Intl to get the current Adelaide date,
  // then add one day.
  const now = new Date()

  // Get today's date string in Adelaide time (e.g. "2025-12-24")
  const adelaideDateStr = now.toLocaleDateString('en-CA', {
    timeZone: 'Australia/Adelaide',
  }) // en-CA gives YYYY-MM-DD format

  // Add one day
  const adelaideDate = new Date(adelaideDateStr + 'T00:00:00')
  adelaideDate.setDate(adelaideDate.getDate() + 1)

  const pad = n => String(n).padStart(2, '0')
  return `${adelaideDate.getFullYear()}-${pad(adelaideDate.getMonth() + 1)}-${pad(adelaideDate.getDate())}`
}

export async function POST(request) {
  // Verify the request is from our Supabase cron job using the shared secret
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const tomorrow = getTomorrowAdelaide()
  console.log(`[pickup-reminder] Running for pickup date: ${tomorrow}`)

  // Fetch all eligible orders — CONFIRMED or READY_FOR_PICKUP,
  // picking up tomorrow, and not already sent a reminder
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
    .eq('reminder_sent', false)

  if (fetchError) {
    console.error('[pickup-reminder] Failed to fetch orders:', fetchError)
    return NextResponse.json({ error: fetchError.message }, { status: 500 })
  }

  if (!orders || orders.length === 0) {
    console.log('[pickup-reminder] No orders to remind today.')
    return NextResponse.json({ sent: 0, skipped: 0 })
  }

  console.log(`[pickup-reminder] Found ${orders.length} order(s) to remind.`)

  const pickupDate = new Date(tomorrow + 'T00:00:00').toLocaleDateString('en-AU', {
    weekday: 'long',
    day:     'numeric',
    month:   'long',
    year:    'numeric',
  })

  let sent    = 0
  let skipped = 0

  for (const order of orders) {
    const customer = order.customer

    if (!customer?.email) {
      console.warn(`[pickup-reminder] Order ${order.id} has no customer email — skipping.`)
      skipped++
      continue
    }

    const invoiceNumber = `GW-${order.id.slice(0, 8).toUpperCase()}`

    try {
      await resend.emails.send({
        from:    'Goodwood Quality Meats <orders@mail.goodwoodqualitymeats.com.au>',
        to:      customer.email,
        subject: `Reminder: your order ${invoiceNumber} is ready for pickup tomorrow`,
        html:    pickupReminderHtml({ customer, order, invoiceNumber, pickupDate }),
      })

      // Mark reminder as sent so we never send it twice
      await supabaseAdmin
        .from('orders')
        .update({ reminder_sent: true })
        .eq('id', order.id)

      console.log(`[pickup-reminder] Sent reminder for order ${invoiceNumber} to ${customer.email}`)
      sent++

    } catch (emailErr) {
      // Log the failure but continue processing other orders —
      // we don't mark reminder_sent so it will retry on the next cron run
      console.error(`[pickup-reminder] Failed to send for order ${invoiceNumber}:`, emailErr)
      skipped++
    }
  }

  console.log(`[pickup-reminder] Done. Sent: ${sent}, Skipped: ${skipped}`)
  return NextResponse.json({ sent, skipped })
}