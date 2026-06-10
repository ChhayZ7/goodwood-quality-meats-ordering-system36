'use client'

// This login page is a Client Component because it uses useState, useEffect,
// form input changes, password visibility toggle, router navigation, and Supabase login.
// Reference - https://nextjs.org/docs/app/api-reference/directives/use-client

import { useState, useEffect } from 'react'
// useState is used for form fields, errors, and password visibility.
// useEffect is used to check if the user is already logged in when the page loads.
// References used:
// https://react.dev/reference/react/useState
// https://react.dev/reference/react/useEffect

import { createClient } from '@/lib/supabase-browser'
// This creates the browser Supabase client used for checking the session and logging in.
// Reference used for Supabase JavaScript auth:
// https://supabase.com/docs/reference/javascript/auth-signinwithpassword

import { useRouter } from 'next/navigation'
// useRouter is used to redirect the user after login or if they are already logged in
// Reference - https://nextjs.org/docs/app/api-reference/functions/use-router

import Link from 'next/link'
// Link is used for moving to signup and forgot password pages without a full page reload.
// Reference - https://nextjs.org/docs/app/api-reference/components/link

import logo from '@/assets/logoWithoutBrand.png'
// This imports the logo image so it can be displayed on the login page


function EyeIcon() {
  // This icon is shown when the password is visible. It is used for the password show/hide button.
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function EyeOffIcon() {
  // This icon is shown when the password is hidden. AI was used to help organise the password visibility icon behaviour
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  )
}

export default function LoginPage() {
  const router = useRouter()
  const [errors, setErrors] = useState({}) // errors stores validation errors for email and password.

  // email and password store the values typed by the user.
  const [email, setEmail] = useState('') 
  const [password, setPassword] = useState('') 

  const [showPass, setShowPass] = useState(false) // showPass controls whether the password input is text or password
  const [authError, setAuthError] = useState('') // authError stores login errors returned by Supabase

  // This checks if the user already has an active Supabase session.
  // If they are already logged in, they are redirected away from the login page.
  // AI was used to help structure this session-checking logic
  // Reference - https://supabase.com/docs/reference/javascript/auth-getsession
  useEffect(() => {
    async function checkSession() {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (session) router.replace('/')
    }
    checkSession()
  }, [router])

  const handleLogin = async (e) => {
    e.preventDefault() // Prevents the browser from refreshing the page when the form submits
    setErrors(null) // Prevents the browser from refreshing the page when the form submits

    // If there are validation errors, stop the login attempt
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setErrors({})

    const supabase = createClient()

    // This sends the email and password to Supabase Auth
    // Reference - https://supabase.com/docs/reference/javascript/auth-signinwithpassword
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      // This custom message is used if the account has been banned/deactivated.
      // It gives the user a clearer message than the default Supabase error.
      if (error.message === 'User is banned') {
        setAuthError('Your account has been deactivated. Please contact your manager.')
      } else {
        setAuthError(error.message)
      }
      return
    }

    // If the user was redirected to login from another protected page, this sends them back to that original page after successful login.
    // AI was used here to help make the redirect safer
    // Reference - https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams
    const redirectTo = new URLSearchParams(window.location.search).get('redirectTo')

    // This stops unsafe redirects like external URLs or protocol-relative URLs
    const isSafe = redirectTo?.startsWith('/') && !redirectTo?.startsWith('//')
    router.replace(isSafe ? redirectTo : '/')
  }

  function validate() {
    const errors = {}

    // Basic email pattern to check the email format before sending to Supabase.
    // AI was used to help with the simple email validation pattern
    // Reference - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (email.trim() === '') {
      errors.email = 'This field is required.'
    } else if (!emailPattern.test(email)) {
      errors.email = 'Please enter a valid email address.'
    }
    if (password === '') errors.password = 'This field is required.'
    return errors
  }

  return (
    <div className="min-h-screen flex bg-[#f4f1ec]">

      {/* LEFT FORM */}
      <div className="w-full md:w-[45%] flex items-center justify-center px-6 md:px-20 py-10">
        <div className="w-full max-w-lg">

          {/* LOGO */}
          <div className="flex justify-left mb-6">
            <img
              src={logo.src}
              alt="Goodwood Quality Meats"
              style={{ height: '90px', width: 'auto' }}
            />
            <div className="flex flex-col justify-center">
              <h1 style={{ fontFamily: '"Lato", sans-serif', fontWeight: 700, fontSize: '22px', color: '#7B1A1A', letterSpacing: '2px', margin: 0 }}>GOODWOOD</h1>
              <p style={{ fontFamily: '"Lato", sans-serif', fontSize: '12px', color: '#888', letterSpacing: '3px', margin: 0 }}>QUALITY MEATS</p>
            </div>
          </div>

          {/* Small gold divider under the logo area. */}
          <div style={{ height: '2px', background: 'linear-gradient(90deg, #D4AF37, transparent)', borderRadius: '1px', marginBottom: '40px' }} />
          <h2 className="text-3xl md:text-5xl font-bold mb-2 text-black">Welcome Back</h2>

          <p className="mb-8 text-gray-600 text-lg italic">
            Don't have an account?{" "}
            <Link href="/signup" className="text-red-700 underline italic">Sign up</Link>
          </p>
          
          {/* Shows Supabase login error messages, such as wrong password or banned user */}
          {authError && <p className="text-red-500 text-sm mb-4">{authError}</p>}

          <form onSubmit={handleLogin}>

            {/* EMAIL */}
            <input
              type="email"
              value={email}
              placeholder="Email Address"
              onChange={(e) => { setEmail(e.target.value); 
                setErrors((p) => ({ ...p, email: '' })); // Clear only the email error while the user edits the email field
                setAuthError('') }} // Clear auth error because the user is trying again.
              className={`w-full p-4 mb-3 rounded-xl border ${errors.email ? 'border-red-500' : 'border-gray-300'} bg-white text-black text-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-700`}
            />
            {errors.email && <p className="text-red-500 text-sm mb-2">{errors.email}</p>}

            {/* PASSWORD */}
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                placeholder="Password"
                onChange={(e) => { setPassword(e.target.value); 
                  setErrors((p) => ({ ...p, password: '' })); // Clear only the password error while the user edits the password field
                  setAuthError('') }} // Clear old login error when the user starts typing again
                className={`w-full p-4 mb-3 rounded-xl border ${errors.password ? 'border-red-500' : 'border-gray-300'} bg-white text-black text-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-700 pr-14 [&::-ms-reveal]:hidden`}
              />
              {/* eye open = visible, eye closed = hidden */}
              {/* AI was used in this part to organise the show/hide password behaviour. */}
              <button
                type="button"
                onClick={() => setShowPass(v => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
              >
                {showPass ? <EyeIcon /> : <EyeOffIcon />}
              </button>
            </div>

            {errors.password && <p className="text-red-500 text-sm mb-2">{errors.password}</p>}

            {/* FORGOT PASSWORD */}
            <div className="text-right mb-6">
              <Link href="/forgetPassword" className="text-sm text-gray-500">Forgot password?</Link>
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

      {/* RIGHT IMAGE — hidden on mobile */}
      <div className="hidden md:block md:w-[55%] relative">
        <img src="/loginImage.jpg" alt="meat" className="w-full h-full object-cover" />
        
        {/* Gradient helps blend the photo into the form background */}
        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-[#f4f1ec]/40 to-[#f4f1ec]"></div>
      </div>
    </div>
  )
}