// src/app/emailUnsubscribe/page.js
// Landing page after a customer clicks the unsubscribe link in a marketing email.

'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

const MESSAGES = {
  success: {
    emoji: '✅',
    title: "You've been unsubscribed",
    body:  "You'll no longer receive marketing emails from us. You'll still receive transactional emails about your orders.",
  },
  already: {
    emoji: '✅',
    title: 'Already unsubscribed',
    body:  "You're already unsubscribed from our marketing emails. No further action is needed.",
  },
  error: {
    emoji: '❌',
    title: 'Something went wrong',
    body:  'We were unable to process your request. Please try again or contact us on 08 8271 4183.',
  },
  invalid: {
    emoji: '❌',
    title: 'Invalid link',
    body:  'This unsubscribe link is invalid or has expired. Please contact us on 08 8271 4183 if you need help.',
  },
}

export default function UnsubscribePage() {
  const searchParams = useSearchParams()
  const status = searchParams.get('status') ?? 'invalid'
  const msg = MESSAGES[status] ?? MESSAGES.invalid

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-6"
      style={{ backgroundColor: '#FAF3E0' }}>
      <div className="bg-white rounded-xl border border-gray-200 p-12 max-w-lg w-full text-center"
        style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>

        <div className="text-5xl mb-6">{msg.emoji}</div>

        <h1 className="text-2xl font-bold mb-4" style={{ color: '#7B1A1A' }}>
          {msg.title}
        </h1>

        <p className="text-sm text-gray-500 leading-relaxed mb-8">
          {msg.body}
        </p>

        {/* Gold divider */}
        <div style={{ height: '2px', background: 'linear-gradient(90deg, #C9A84C, transparent)',
          borderRadius: '1px', marginBottom: '32px' }} />

        <div className="flex flex-col gap-3">
          <Link
            href="/products"
            className="inline-block px-6 py-3 rounded-lg text-white text-sm font-semibold
              hover:opacity-90 transition"
            style={{ backgroundColor: '#7B1A1A' }}
          >
            Browse Our Products
          </Link>
          <Link
            href="/"
            className="text-sm font-semibold hover:underline"
            style={{ color: '#7B1A1A' }}
          >
            ← Back to Home
          </Link>
        </div>

        <p className="text-xs text-gray-400 mt-8">
          Changed your mind? You can manage your email preferences in{' '}
          <Link href="/account/profile" className="underline" style={{ color: '#7B1A1A' }}>
            My Account
          </Link>.
        </p>

      </div>
    </div>
  )
}