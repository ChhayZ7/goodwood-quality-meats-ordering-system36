'use client'

import Link from 'next/link'
import { useState } from 'react'
import { createClient } from '@/lib/supabase-browser'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!email.trim()) {
      setError('Please enter your email address.')
      return
    }

    setLoading(true)

    const supabase = createClient()
    console.log('redirectTo:', `${window.location.origin}/resetPassword`)
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/resetPassword`,
    })

    setLoading(false)

    if (resetError) {
      setError(resetError.message)
      return
    }

    setSent(true)
  }

  return (
    <div className="h-screen flex bg-[#f4f1ec] overflow-hidden">

      {/* LEFT SIDE */}
      <div className="w-[45%] flex items-center justify-center px-20 -mt-20">
        <div className="w-full max-w-lg">

          {/* LOGO */}
          <div className="flex flex-col items-center mb-6">
            <div className="flex items-center gap-4">
              <div className="bg-red-800 text-white px-4 py-2 rounded-lg font-bold text-lg">G</div>
              <div>
                <h1 className="font-bold text-2xl tracking-wide" style={{ color: '#7b1e1e' }}>GOODWOOD</h1>
                <p className="text-sm text-gray-500 tracking-[3px]">QUALITY MEATS</p>
              </div>
            </div>
          </div>

          <div className="w-full h-[4px] bg-yellow-600 mb-10" />

          <h2 className="text-5xl font-bold mb-4 text-black">Forgot Password</h2>

          {sent ? (
            <div>
              <div className="bg-green-50 border border-green-200 rounded-xl p-5 mb-6">
                <p className="text-green-700 font-semibold mb-1">Reset link sent!</p>
                <p className="text-green-600 text-sm">
                  Check your email at <strong>{email}</strong> for a password reset link.
                  It may take a few minutes to arrive.
                </p>
              </div>
              <Link href="/login" className="text-red-700 font-semibold text-sm">
                ← Back to Login
              </Link>
            </div>
          ) : (
            <>
              <p className="mb-10 text-gray-600 text-lg leading-relaxed">
                Enter your email and we'll send you a reset link.
              </p>

              {error && (
                <p className="text-red-500 text-sm mb-4">{error}</p>
              )}

              <form onSubmit={handleSubmit}>
                <input
                  type="email"
                  placeholder="your.email@example.com"
                  className="w-full p-5 rounded-xl border border-gray-300 mb-6 bg-white text-black text-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-700"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError('') }}
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-red-800 text-white py-5 rounded-xl text-lg font-semibold hover:bg-red-900 transition shadow-md disabled:opacity-50"
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>

              <p className="mt-6 text-sm text-gray-600">
                Remember your password?{' '}
                <Link href="/login" className="text-red-700 font-semibold">Log in</Link>
              </p>
            </>
          )}
        </div>
      </div>

      {/* RIGHT SIDE IMAGE */}
      <div className="w-[55%] relative h-full">
        <img src="/meat.png" alt="meat" className="w-full h-full object-cover grayscale opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-[#f4f1ec]/40 to-[#f4f1ec]" />
      </div>
    </div>
  )
}