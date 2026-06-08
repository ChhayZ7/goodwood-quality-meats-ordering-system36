// src/app/api/checkout/confirm/route.js
// POST /api/checkout/confirm — Step 2 of 2 in the checkout flow.
//
// Called by the frontend immediately after Stripe confirms payment client-side.
// Even though the client already has a "succeeded" result from Stripe, we
// re-verify server-side — a malicious client could send a fake payment_intent_id
// to confirm an order without actually paying.
//
// Flow:
//   1. Fetch PaymentIntent from Stripe → verify status === 'succeeded'
//   2. Verify PaymentIntent metadata.order_id matches submitted order_id
//   3. Record payment in DB (idempotent — safe if webhook already ran)
//   4. Decrement stock (non-fatal — logged if it fails)
//   5. Move order PENDING → CONFIRMED, store deposit amount
//
// Overlap with /api/webhook:
//   The Stripe webhook also handles payment_intent.succeeded and runs steps 3–5.
//   This is intentional — the webhook is the safety net for cases where the
//   browser closes before /confirm finishes. Both paths guard against duplicates
//   via the unique constraint on payments.stripe_payment_intent_id.

import { NextResponse } from 'next/server'
import { withHandler, schemas } from '@/lib/middleware/withHandler'
import { getPaymentIntent } from '@/lib/stripe'
import { recordPayment, updateOrder } from '@/lib/db/orders'
import { decrementStock } from '@/lib/db/inventory'

export const POST = withHandler(
  async (request) => {
    const { order_id, payment_intent_id, items } = request._body

    // ── 1. Verify payment with Stripe ─────────────────────────────────────────
    // Always fetch directly from Stripe — never trust the client's claimed status.
    const paymentIntent = await getPaymentIntent(payment_intent_id)

    // 402 Payment Required — Stripe says money hasn't cleared yet
    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json(
        {
          error: 'Payment has not been completed',
          stripe_status: paymentIntent.status,
          status: 402,
        },
        { status: 402 }
      )
    }

    // ── 2. Verify PaymentIntent belongs to this order ──────────────────────────
    // Prevents reusing a PaymentIntent from a different (possibly cheaper) order
    // to fraudulently confirm this one.
    if (paymentIntent.metadata?.order_id !== order_id) {
      return NextResponse.json(
        { error: 'Payment does not match this order', status: 400 },
        { status: 400 }
      )
    }

    // ── 3. Record payment ─────────────────────────────────────────────────────
    // Inserts into the payments table. The unique constraint on
    // stripe_payment_intent_id makes this idempotent — if the webhook already
    // ran first, the insert fails silently on the duplicate key (Postgres 23505).
    const { error: paymentError } = await recordPayment({
      order_id,
      stripe_payment_intent_id: payment_intent_id,
      amount_cents: paymentIntent.amount,
      type: 'DEPOSIT',
      status: 'PAID',
    })

    if (paymentError) throw paymentError

    // ── 4. Decrement stock ────────────────────────────────────────────────────
    // Non-fatal — payment is already confirmed so we never block the response
    // on a stock error. Discrepancies are logged for manual correction.
    const { ok: stockOk, errors: stockErrors } = await decrementStock(items)

    if (!stockOk) {
      console.error('[checkout/confirm] Stock decrement errors:', stockErrors)
    }

    // ── 5. Confirm order ──────────────────────────────────────────────────────
    // Moves order from PENDING → CONFIRMED and records how much the deposit was.
    // Confirmation email is handled by the Stripe webhook, not here.
    const { error: updateError } = await updateOrder(order_id, {
      status: 'CONFIRMED',
      deposit_paid_cents: paymentIntent.amount,
    })

    if (updateError) throw updateError

    return NextResponse.json({ order_id, status: 'CONFIRMED' })
  },
  { schema: schemas.confirmPayment }
)