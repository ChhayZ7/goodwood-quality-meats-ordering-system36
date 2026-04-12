'use client'

import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import GoldDivider from '@/components/GoldDivider'
import Footer from '@/components/Footer'

export default function LoginPage() {
    
    const [email,    setEmail]    = useState('')
    const [password, setPassword] = useState('')
    const [showPass, setShowPass] = useState(false)
    const [errors,   setErrors]   = useState({})
    const [authError, setAuthError] = useState('')

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

    function handleSubmit(evt) {
        evt.preventDefault()

        setAuthError('')

        const errors = validate()

        if (Object.keys(errors).length > 0) {
            setErrors(errors)
            return
        }

        setErrors({})
    }

    return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#FAF3E0' }}>
      

      <main style={{ flex: 1, display: 'flex' }}>
        <div style={{ width: '100%', display: 'flex' }}>

          {/* LEFT — Form */}
          <div style={{ width: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 40px', background: '#FAF3E0' }}>
            <div style={{ width: '100%', maxWidth: '360px' }}>

              <Link href="/products" style={{ fontSize: '13px', color: '#555', textDecoration: 'none', display: 'block', marginBottom: '24px' }}>
                ← Back to Products
              </Link>

              {/* Account icon */}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: '1.5px solid #888', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="1.5">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
              </div>

              <h1 style={{ fontFamily: '"Playfair Display",serif', fontSize: '22px', fontStyle: 'italic', fontWeight: 400, textAlign: 'center', margin: '0 0 6px' }}>
                Welcome Back,
              </h1>
              <p style={{ fontSize: '13px', color: '#555', textAlign: 'center', margin: '0 0 24px' }}>
                Don't have an account?{' '}
                <Link href="/signup" style={{ color: '#7B1A1A', fontWeight: 700 }}>Sign up</Link>
              </p>

              {/* Auth error */}
              {authError && (
                <div style={{ background: '#FEE2E2', border: '1px solid #FECACA', borderRadius: '8px', padding: '12px 14px', fontSize: '13px', color: '#991B1B', marginBottom: '16px' }}>
                  {authError}
                </div>
              )}

              {/* Form card */}
              <div style={{ background: '#fff', borderRadius: '12px', padding: '32px', boxShadow: '0 2px 16px rgba(0,0,0,0.08)' }}>
                <form onSubmit={handleSubmit} noValidate>

                  {/* Email */}
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.8">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                        <polyline points="22,6 12,13 2,6"/>
                      </svg>
                      <label style={{ fontSize: '13px', fontWeight: 700, color: '#555' }}>Email Address</label>
                    </div>
                    <input type="email" value={email} placeholder="your.email@example.com"
                      onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: '' })); setAuthError('') }}
                      className={'gw-input' + (errors.email ? ' error' : '')} />
                    {errors.email && <p style={{ fontSize: '12px', color: '#DC2626', margin: '4px 0 0' }}>{errors.email}</p>}
                  </div>

                  {/* Password */}
                  <div style={{ marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.8">
                        <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
                      </svg>
                      <label style={{ fontSize: '13px', fontWeight: 700, color: '#555' }}>Password</label>
                    </div>
                    <div style={{ position: 'relative' }}>
                      <input type={showPass ? 'text' : 'password'} value={password} placeholder="••••••••"
                        onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: '' })); setAuthError('') }}
                        className={'gw-input' + (errors.password ? ' error' : '')}
                        style={{ paddingRight: '40px' }} />
                      <button type="button" onClick={() => setShowPass(!showPass)}
                        style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#888', padding: 0 }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                        </svg>
                      </button>
                    </div>
                    {errors.password && <p style={{ fontSize: '12px', color: '#DC2626', margin: '4px 0 0' }}>{errors.password}</p>}
                  </div>

                  {/* Forgot password */}
                  <div style={{ textAlign: 'right', marginBottom: '24px', marginTop: '6px' }}>
                    <Link href="/forgetPassword" style={{ fontSize: '12px', color: '#888', textDecoration: 'none' }}>
                      Forgot password?
                    </Link>
                  </div>

                  <button type="submit" className="btn-primary" style={{ width: '100%', padding: '12px', fontSize: '14px' }}>
                    Log In
                  </button>
                </form>
              </div>


            </div>
          </div>

          {/* RIGHT — Food photo */}
          <div style={{ width: '50%', overflow: 'hidden' }}>
            <img src="https://images.unsplash.com/photo-1544025162-d76594e18c0e?w=900&q=80" alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>

        </div>
      </main>
    </div>
  )




}
