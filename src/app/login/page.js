'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [errors, setErrors] = useState({})
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [authError, setAuthError] = useState('')

  useEffect(() => {
    async function checkSession() {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        router.replace('/')
      }
    }
    checkSession()
  }, [router])

  const handleLogin = async (e) => {
    e.preventDefault()
    setErrors(null)

    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setErrors({})

    const supabase = createClient()

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setAuthError(error.message)
      console.error(error)
      return
    }

    router.push('/')
  }

  function validate() {
    const errors = {}
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (email.trim() === '') {
      errors.email = 'This field is required.'
    } else if (!emailPattern.test(email)) {
      errors.email = 'Please enter a valid email address.'
    }

    if (password === '') {
      errors.password = 'This field is required.'
    }

    return errors
  }

  return (
    <div className="h-screen flex bg-[#f4f1ec] overflow-hidden">

      {/* LEFT FORM */}
      <div className="w-[45%] flex items-center justify-center px-20">
        <div className="w-full max-w-lg">

          {/* LOGO */}
          <div className="flex flex-col items-center mb-6">
            <div className="flex items-center gap-4">
              <div className="bg-red-800 text-white px-4 py-2 rounded-lg font-bold text-lg">
                G
              </div>
              <div>
                <h1 className="font-bold text-2xl tracking-wide text-[#7b1e1e]">
                  GOODWOOD
                </h1>
                <p className="text-sm text-gray-500 tracking-[3px]">
                  QUALITY MEATS
                </p>
              </div>
            </div>
          </div>

          <div className="w-full h-[4px] bg-yellow-600 mb-10"></div>

          <h2 className="text-5xl font-bold mb-2 text-black">
            Welcome Back
          </h2>

          <p className="mb-8 text-gray-600 text-lg">
            Don’t have an account?{" "}
            <Link href="/signup" className="text-red-700 font-semibold">
              Sign up
            </Link>
          </p>

          {/* AUTH ERROR */}
          {authError && (
            <p className="text-red-500 text-sm mb-4">{authError}</p>
          )}

          <form onSubmit={handleLogin}>

            {/* EMAIL */}
            <input
              type="email"
              value={email}
              placeholder="Email Address"
              onChange={(e) => {
                setEmail(e.target.value)
                setErrors((p) => ({ ...p, email: '' }))
                setAuthError('')
              }}
              className={`w-full p-4 mb-3 rounded-xl border ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              } bg-white text-black text-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-700`}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mb-2">{errors.email}</p>
            )}

            {/* PASSWORD */}
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                placeholder="Password"
                onChange={(e) => {
                  setPassword(e.target.value)
                  setErrors((p) => ({ ...p, password: '' }))
                  setAuthError('')
                }}
                className={`w-full p-4 mb-3 rounded-xl border ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                } bg-white text-black text-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-700`}
              />

              {/* SHOW PASSWORD */}
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-4 top-5 text-gray-500"
              >
                👁
              </button>
            </div>

            {errors.password && (
              <p className="text-red-500 text-sm mb-2">{errors.password}</p>
            )}

            {/* FORGOT PASSWORD */}
            <div className="text-right mb-6">
              <Link href="/forgetPassword" className="text-sm text-gray-500">
                Forgot password?
              </Link>
            </div>

            {/* BUTTON */}
            <button
              type="submit"
              className="w-full bg-red-800 text-white py-5 rounded-xl text-lg font-semibold hover:bg-red-900 transition shadow-md"
            >
              Log In
            </button>
          </form>
        </div>
      </div>

      {/* RIGHT IMAGE */}
      <div className="w-[55%] relative h-full">
        <img
          src="/loginImage.jpg"
          alt="meat"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-[#f4f1ec]/40 to-[#f4f1ec]"></div>
      </div>
    </div>
  )
}