'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase-client'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('code')

    if (code) {
      // Strip code from URL — PKCE codes are single-use
      window.history.replaceState({}, '', '/resetPassword')

      supabase.auth.exchangeCodeForSession(code).then(({ data, error }) => {
        if (error) {
          setError('Reset link is invalid or has expired. Please request a new one.')
        } else if (data?.session) {
          setReady(true)
        } else {
          setError('Could not verify reset link. Please try again.')
        }
      })
      return
    }

    // Fallback: session already exists in localStorage (e.g. page refreshed)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    const { error: updateError } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (updateError) {
      setError(updateError.message)
      return
    }

    await supabase.auth.signOut()
    setLoading(false)

    router.replace('/login')
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

          <h2 className="text-5xl font-bold mb-4 text-black">Set New Password</h2>

          {!ready ? (
            <div>
              <p className="text-gray-500 mb-4">Verifying your reset link...</p>
              {error && (
                <div>
                  <p className="text-red-500 text-sm mb-4">{error}</p>
                  <a
                    href="/forgotPassword"
                    className="text-red-700 font-semibold text-sm underline"
                  >
                    Request a new reset link
                  </a>
                </div>
              )}
            </div>
          ) : (
            <>
              <p className="mb-8 text-gray-600 text-lg">Enter your new password below.</p>

              {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

              <form onSubmit={handleSubmit}>
                <input
                  type="password"
                  placeholder="New password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError('') }}
                  className="w-full p-5 rounded-xl border border-gray-300 mb-4 bg-white text-black text-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-700"
                />
                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={confirm}
                  onChange={e => { setConfirm(e.target.value); setError('') }}
                  className="w-full p-5 rounded-xl border border-gray-300 mb-6 bg-white text-black text-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-700"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-red-800 text-white py-5 rounded-xl text-lg font-semibold hover:bg-red-900 transition shadow-md disabled:opacity-50"
                >
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </form>
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