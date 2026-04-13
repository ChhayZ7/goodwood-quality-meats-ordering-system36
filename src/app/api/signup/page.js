'use client'

// US-S3-02 — Sign up page
// Pure UI. No mock data. Backend team wires up Supabase auth here.

import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import GoldDivider from '@/components/layout/GoldDivider'
import Footer from '@/components/layout/Footer'

const AUS_PHONE = /^(\+?61|0)[2-9]\d{8}$/

export default function SignUpPage() {
  const [form, setForm] = useState({ firstName:'', lastName:'', email:'', phone:'', password:'', confirmPassword:'' })
  const [showPass, setShowPass] = useState(false)
  const [errors,   setErrors]   = useState({})

  function update(field, val) {
    setForm(p => ({ ...p, [field]: val }))
    if (errors[field]) setErrors(p => ({ ...p, [field]: '' }))
  }

  function validate() {
    const e = {}
    if (!form.firstName.trim())        e.firstName       = 'This field is required.'
    if (!form.lastName.trim())         e.lastName        = 'This field is required.'
    if (!form.email.trim())            e.email           = 'This field is required.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
                                       e.email           = 'Please enter a valid email address.'
    if (!form.phone.trim())            e.phone           = 'This field is required.'
    else if (!AUS_PHONE.test(form.phone.replace(/\s/g,'')))
                                       e.phone           = 'Please enter a valid Australian phone number.'
    if (!form.password)                e.password        = 'This field is required.'
    else if (form.password.length < 8) e.password        = 'Password must be at least 8 characters.'
    if (!form.confirmPassword)         e.confirmPassword = 'This field is required.'
    else if (form.password !== form.confirmPassword)
                                       e.confirmPassword = 'Passwords do not match. Please try again.'
    return e
  }

  function handleSubmit(evt) {
    evt.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    // ── TODO: backend team connects Supabase auth here ──────────
    // const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { first_name, last_name, phone } } })
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#FAF3E0' }}>
      <Navbar />
      <GoldDivider />

      <main style={{ flex: 1, display: 'flex' }}>
        <div style={{ width: '100%', display: 'flex' }}>

          {/* ── LEFT — Food photo ──────────────────────────────── */}
          <div style={{ width: '50%', overflow: 'hidden' }}>
            <img src="https://images.unsplash.com/photo-1544025162-d76594e18c0e?w=900&q=80" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(.88)' }} />
          </div>

          {/* ── RIGHT — Form ───────────────────────────────────── */}
          <div style={{ width: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 40px', background: '#FAF3E0' }}>
            <div style={{ width: '100%', maxWidth: '380px' }}>
              <Link href="/" style={{ fontSize: '13px', color: '#555', textDecoration: 'none', display: 'block', marginBottom: '20px' }}>← Home</Link>

              <h1 style={{ fontFamily: '"Playfair Display",serif', fontSize: '22px', fontWeight: 700, margin: '0 0 6px' }}>Create an Account</h1>
              <p style={{ fontSize: '13px', color: '#555', margin: '0 0 24px' }}>
                Already have an account?{' '}
                <Link href="/login" style={{ color: '#7B1A1A', fontWeight: 700 }}>Log in</Link>
              </p>

              <form onSubmit={handleSubmit} noValidate>

                {/* First + Last name */}
                <div style={{ display: 'flex', gap: '12px', marginBottom: '14px' }}>
                  <div style={{ flex: 1 }}>
                    <input type="text" value={form.firstName} placeholder="First Name" onChange={e => update('firstName', e.target.value)} className={`gw-input${errors.firstName ? ' error' : ''}`} />
                    {errors.firstName && <p style={{ fontSize: '11px', color: '#DC2626', margin: '3px 0 0' }}>{errors.firstName}</p>}
                  </div>
                  <div style={{ flex: 1 }}>
                    <input type="text" value={form.lastName} placeholder="Last Name" onChange={e => update('lastName', e.target.value)} className={`gw-input${errors.lastName ? ' error' : ''}`} />
                    {errors.lastName && <p style={{ fontSize: '11px', color: '#DC2626', margin: '3px 0 0' }}>{errors.lastName}</p>}
                  </div>
                </div>

                {/* Email */}
                <div style={{ marginBottom: '14px' }}>
                  <input type="email" value={form.email} placeholder="customer@mail.com" onChange={e => update('email', e.target.value)} className={`gw-input${errors.email ? ' error' : ''}`} />
                  {errors.email && <p style={{ fontSize: '12px', color: '#DC2626', margin: '4px 0 0' }}>{errors.email}</p>}
                </div>

                {/* Phone */}
                <div style={{ marginBottom: '14px' }}>
                  <input type="tel" value={form.phone} placeholder="04xxxxxxxx" onChange={e => update('phone', e.target.value)} className={`gw-input${errors.phone ? ' error' : ''}`} />
                  {errors.phone && <p style={{ fontSize: '12px', color: '#DC2626', margin: '4px 0 0' }}>{errors.phone}</p>}
                </div>

                {/* Password */}
                <div style={{ marginBottom: '14px' }}>
                  <div style={{ position: 'relative' }}>
                    <input type={showPass ? 'text' : 'password'} value={form.password} placeholder="Password" onChange={e => update('password', e.target.value)} className={`gw-input${errors.password ? ' error' : ''}`} style={{ paddingRight: '40px' }} />
                    <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#888', padding: 0 }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    </button>
                  </div>
                  {errors.password && <p style={{ fontSize: '11px', color: '#DC2626', margin: '3px 0 0' }}>{errors.password}</p>}
                </div>

                {/* Confirm Password */}
                <div style={{ marginBottom: '24px' }}>
                  <input type="password" value={form.confirmPassword} placeholder="Confirm Password" onChange={e => update('confirmPassword', e.target.value)} className={`gw-input${errors.confirmPassword ? ' error' : ''}`} />
                  {errors.confirmPassword && <p style={{ fontSize: '11px', color: '#DC2626', margin: '3px 0 0' }}>{errors.confirmPassword}</p>}
                </div>

                {/* Submit — right aligned, matches Figma */}
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="submit" className="btn-primary" style={{ padding: '12px 28px', fontSize: '14px' }}>Sign up →</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
