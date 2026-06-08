'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

function StarRating({ value, onChange }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="text-3xl transition-transform hover:scale-110 focus:outline-none"
          aria-label={`${star} star`}
        >
          <span className={star <= (hovered || value) ? 'text-yellow-400' : 'text-gray-300'}>
            ★
          </span>
        </button>
      ))}
    </div>
  )
}

export default function FeedbackPage() {
  const router = useRouter()
  const { id } = useParams()

  const [score, setScore] = useState(0)
  const [feedbackText, setFeedbackText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    if (score === 0) { setError('Please select a star rating.'); return }
    setError(null)
    setSubmitting(true)
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: id,
          score,
          feedback_text: feedbackText || undefined,
        }),
      })
      if (res.status === 401) { router.replace('/login'); return }
      const json = await res.json()
      if (res.status === 409) { setError('You have already submitted feedback for this order.'); setSubmitting(false); return }
      if (!res.ok) { setError(json.error ?? 'Failed to submit feedback'); setSubmitting(false); return }
      setSubmitted(true)
    } catch {
      setError('Something went wrong. Please try again.')
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="max-w-5xl mx-auto text-center py-24">
        <div className="text-6xl mb-6">🎉</div>
        <h2 className="text-3xl font-bold text-[#8B1A1A] mb-3">Thank you for your feedback!</h2>
        <p className="text-gray-500 mb-8">Your review helps us improve our products and service.</p>
        <Link
          href={`/account/orders/${id}`}
          className="inline-flex items-center gap-2 bg-[#8B1A1A] text-white px-8 py-3 rounded-lg text-sm font-semibold hover:opacity-90 transition"
        >
          ← Back to Order
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto">

      {/* ── Header (matches Inventory Management style) ── */}
      <div style={{ marginBottom: '32px' }}>
        <Link
          href={`/account/orders/${id}`}
          className="text-sm text-[#8B1A1A] hover:underline flex items-center gap-1 mb-4"
        >
          ← Back to Order
        </Link>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '32px' }}>
          <h1 style={{ fontFamily: '"Lato",serif', fontSize: '36px', fontWeight: 700, color: '#7B1A1A', margin: 0 }}>
            Leave a Review
          </h1>
          <span style={{ fontFamily: '"Lato",sans-serif', fontSize: '14px', color: '#9CA3AF' }}>
            Order #{typeof id === 'string' ? id.slice(0, 8).toUpperCase() : ''}
          </span>
        </div>
        <div style={{ height: '2px', background: 'linear-gradient(90deg, #C9A84C, transparent)', borderRadius: '1px' }} />
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        <div className="bg-white rounded-xl border border-gray-200 p-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Overall Rating</h2>
          <p className="text-sm text-gray-500 mb-6">How would you rate your overall experience?</p>
          <div className="flex items-center gap-6">
            <StarRating value={score} onChange={setScore} />
            {score > 0 && (
              <span className="text-sm text-gray-500">
                {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][score]}
              </span>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Additional Comments{' '}
            <span className="text-gray-400 font-normal">(optional)</span>
          </h2>
          <textarea
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            rows={5}
            maxLength={1000}
            placeholder="Tell us about your experience — product freshness, packaging, anything you'd like us to know…"
            className="w-full text-sm text-gray-700 border border-gray-200 rounded-lg p-4 resize-none focus:outline-none focus:ring-2 focus:ring-[#8B1A1A]/30 focus:border-[#8B1A1A] placeholder-gray-400 transition"
          />
          <p className="text-xs text-gray-400 mt-2 text-right">{feedbackText.length} / 1000</p>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            {error}
          </p>
        )}

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 bg-[#8B1A1A] text-white px-8 py-3 rounded-lg text-sm font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Submitting…' : 'Submit Review'}
          </button>
          <Link
            href={`/account/orders/${id}`}
            className="flex items-center gap-2 border border-gray-300 text-gray-600 px-6 py-3 rounded-lg text-sm font-semibold hover:bg-gray-50 transition"
          >
            Cancel
          </Link>
        </div>

      </form>
    </div>
  )
}