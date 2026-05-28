'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'

export default function ResetPasswordPage(){
    const router = useRouter()
    const [password, setPassword] = useState('')
    const [confirm, setConfirm] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [ready, setReady] = useState('')

    useEffect(() => {
        // Supabase puts the session from the email link into the URL hash
        // onAuthStateChange picks it up automatically
        const supabase = createClient()
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
            if (event === 'PASSWORD_RECOVERY'){
                setReady(true)
            }
        })
        return () => subscription.unsubscribe()
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        if (password.length < 8){
            setError('Password must be at least 8 characters.')
            return
        }

        if (password !== confirm){
            setError('Passwords do not match.')
            return
        }

        setLoading(true)
        const supabase = createClient()
        const { error: updateError } = await supabase.auth.updateUser({ password })
        setLoading(false)

        if (updateError){
            setError(updateError.message)
            return
        }

        router.replace('/login')
    }

    return (
    <div className="h-screen flex bg-[#f4f1ec] overflow-hidden">
      <div className="w-[45%] flex items-center justify-center px-20 -mt-20">
        <div className="w-full max-w-lg">

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
            <p className="text-gray-500">Verifying your reset link...</p>
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

      <div className="w-[55%] relative h-full">
        <img src="/meat.png" alt="meat" className="w-full h-full object-cover grayscale opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-[#f4f1ec]/40 to-[#f4f1ec]" />
      </div>
    </div>
  )
}