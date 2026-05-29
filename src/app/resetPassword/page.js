'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import PasswordInput from '@/components/PasswordInput'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [ready, setReady]       = useState(false)

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true)
      if (event === 'SIGNED_IN' && session) setReady(true)
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
    const supabase = createClient()
    const { error: updateError } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (updateError) {
      setError(updateError.message)
      return
    }

    await supabase.auth.signOut()
    router.replace('/login')
  }

  return (
    <>
      <style>{`
        input[type="password"]::-ms-reveal,
        input[type="password"]::-ms-clear {
          display: none;
        }
        input[type="password"]::-webkit-credentials-auto-fill-button,
        input[type="password"]::-webkit-caps-lock-indicator {
          display: none !important;
          visibility: hidden;
          pointer-events: none;
        }
      `}</style>

      <div className="h-screen flex bg-[#f4f1ec] overflow-hidden">

        {/* Left — form */}
        <div className="w-[45%] flex items-center justify-center px-20 -mt-20">
          <div className="w-full max-w-lg">

            {/* Logo */}
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
              <div className="text-center py-8">
                <p className="text-gray-500 mb-2">Verifying your reset link…</p>
                <p className="text-sm text-gray-400">
                  If nothing happens,{' '}
                  <a href="/forgetPassword" className="text-red-700 underline">
                    request a new link
                  </a>.
                </p>
              </div>
            ) : (
              <>
                <p className="mb-8 text-gray-600 text-lg">Enter your new password below.</p>

                {error && (
                  <p className="text-red-500 text-sm mb-4 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                    {error}
                  </p>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">

                  <div>
                    <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-1">
                      New Password
                    </label>
                    <PasswordInput
                      id="new-password"
                      value={password}
                      onChange={e => { setPassword(e.target.value); setError('') }}
                      placeholder="At least 8 characters"
                    />
                  </div>

                  <div>
                    <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm New Password
                    </label>
                    <PasswordInput
                      id="confirm-password"
                      value={confirm}
                      onChange={e => { setConfirm(e.target.value); setError('') }}
                      placeholder="Repeat your new password"
                    />
                  </div>

                  {/* Match indicator — only shown once the user starts typing the confirm field */}
                  {confirm.length > 0 && (
                    <p className={`text-sm ${password === confirm ? 'text-green-600' : 'text-red-500'}`}>
                      {password === confirm ? '✓ Passwords match' : '✗ Passwords do not match'}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-red-800 text-white py-5 rounded-xl text-lg font-semibold hover:bg-red-900 transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Updating…' : 'Update Password'}
                  </button>

                </form>
              </>
            )}
          </div>
        </div>

        {/* Right — image */}
        <div className="w-[55%] relative h-full">
          <img src="/meat.png" alt="meat" className="w-full h-full object-cover grayscale opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-[#f4f1ec]/40 to-[#f4f1ec]" />
        </div>

      </div>
    </>
  )
}
