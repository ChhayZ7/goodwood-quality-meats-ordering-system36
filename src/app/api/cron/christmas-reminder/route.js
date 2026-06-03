// src/app/api/cron/christmas-reminder/route.js
// Fires once a year on November 1st (scheduled via pg_cron).
// Emails all customers who had a COMPLETED order in December of the
// previous year, and have not unsubscribed from marketing emails.

import { NextResponse }           from 'next/server'
import { supabaseAdmin }          from '@/lib/supabase-admin'
import { resend }                 from '@/lib/resend'
import { christmasReminderHtml }  from '@/lib/email/christmasReminder'

export async function POST(request) {
  // Verify the request came from our Supabase cron job
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  // Build the December date range for last year
  // e.g. if today is Nov 1 2026, we want Dec 1 2025 – Dec 31 2025
  const thisYear  = new Date().getFullYear()
  const lastYear  = thisYear - 1
  const dateFrom  = `${lastYear}-12-01`
  const dateTo    = `${lastYear}-12-31`
  const appUrl    = process.env.NEXT_PUBLIC_URL ?? 'https://goodwoodqualitymeats.com.au'

  console.log(`[christmas-reminder] Querying COMPLETED orders from ${dateFrom} to ${dateTo}`)

  // Fetch all customers who completed an order last December
  // and have not unsubscribed from marketing emails.
  // We use a Set to deduplicate — a customer may have placed
  // multiple orders last December but should only get one email.
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
    console.log('[christmas-reminder] No eligible customers found.')
    return NextResponse.json({ sent: 0, skipped: 0 })
  }

  // Deduplicate by customer ID — one email per customer
  const seenIds  = new Set()
  const customers = []

  for (const order of orders) {
    const customer = order.customer
    if (!customer?.email || !customer?.id) continue
    if (customer.email_unsubscribed) continue
    if (seenIds.has(customer.id)) continue
    seenIds.add(customer.id)
    customers.push(customer)
  }

  console.log(`[christmas-reminder] Sending to ${customers.length} unique customer(s)`)

  let sent    = 0
  let skipped = 0

  for (const customer of customers) {
    const unsubscribeUrl = `${appUrl}/api/emailUnsubscribe?token=${customer.unsubscribe_token}`

    try {
      await resend.emails.send({
        from:    'Goodwood Quality Meats <orders@mail.goodwoodqualitymeats.com.au>',
        to:      customer.email,
        subject: `🎄 Christmas orders are open — order early to avoid missing out!`,
        html:    christmasReminderHtml({
          firstName:      customer.first_name ?? 'there',
          unsubscribeUrl,
        }),
      })

      console.log(`[christmas-reminder] Sent to ${customer.email}`)
      sent++

    } catch (emailErr) {
      console.error(`[christmas-reminder] Failed for ${customer.email}:`, emailErr)
      skipped++
    }
  }

  console.log(`[christmas-reminder] Done. Sent: ${sent}, Skipped: ${skipped}`)
  return NextResponse.json({ sent, skipped })
}