//This page letting the admin create their staff account, they can also modify the role of the staff as well, either admin or staff
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { IoEyeOutline, IoEyeOffOutline } from 'react-icons/io5'
import PageWrapper from '@/components/dashboard/PageWrapper'
import PageHeader from '@/components/dashboard/PageHeader'

const COLOR = {
  red: '#7B1A1A', redLight: '#FEF2F2', redBorder: '#FECACA',
  cream: '#FAF3E0', gold: '#C9A84C', text: '#1A1A1A',
  muted: '#6B7280', border: '#E5DCC8', white: '#FFFFFF', sidebar: '#F5EDD8',
}

const hideNativePasswordEye = `
  input[type="password"]::-ms-reveal,
  input[type="password"]::-ms-clear { display: none; }
  input[type="password"]::-webkit-credentials-auto-fill-button,
  input[type="password"]::-webkit-caps-lock-indicator { display: none !important; visibility: hidden; pointer-events: none; }
`

const labelSt = {
  fontFamily: '"Lato", sans-serif', fontSize: '12px', fontWeight: 700,
  color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '.06em', flexShrink: 0,
}

const inputSt = {
  width: '100%', padding: '10px 12px', border: `1.5px solid ${COLOR.border}`,
  borderRadius: '8px', fontSize: '14px', fontFamily: '"Lato", sans-serif',
  color: COLOR.text, background: COLOR.white, outline: 'none', boxSizing: 'border-box',
}

function FieldError({ message }) {
  if (!message) return null
  return <p style={{ fontFamily: '"Lato", sans-serif', fontSize: '12px', color: '#B91C1C', margin: '4px 0 0' }}>{message}</p>
}

const backButton = (onClick) => (
  <button
    onClick={onClick}
    style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: '"Lato", sans-serif', fontSize: '14px', fontWeight: 700, color: COLOR.red, padding: 0, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '6px' }}
    onMouseEnter={e => e.currentTarget.style.color = '#5C1212'}
    onMouseLeave={e => e.currentTarget.style.color = COLOR.red}
  >
    ← Back to Staff List
  </button>
)

export default function NewStaffPage() {
  const router = useRouter()

  const [role,         setRole]         = useState('STAFF')
  const [firstName,    setFirstName]    = useState('')
  const [lastName,     setLastName]     = useState('')
  const [email,        setEmail]        = useState('')
  const [phone,        setPhone]        = useState('')
  const [password,     setPassword]     = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [saving,       setSaving]       = useState(false)
  const [errors,       setErrors]       = useState({})
  const [success,      setSuccess]      = useState(false)

  const isAdmin = role === 'ADMIN'

  async function handleSubmit() {
    setErrors({})
    const newErrors = {}
    if (!firstName.trim()) newErrors.firstName = 'First name is required'
    if (!lastName.trim())  newErrors.lastName  = 'Last name is required'
    if (!email.trim())     newErrors.email     = 'Email is required'
    if (!password.trim())  newErrors.password  = 'Password is required'
    else if (password.length < 8) newErrors.password = 'Password must be at least 8 characters'
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return }
    setSaving(true)
    try {
      const res  = await fetch('/api/admin/staff', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ first_name: firstName.trim(), last_name: lastName.trim(), email: email.trim(), phone: phone.trim(), password, role }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to create account')
      setSuccess(true)
    } catch (err) {
      setErrors({ general: err.message })
      setSaving(false)
    }
  }

  if (success) {
    return (
      <PageWrapper>
        <style>{hideNativePasswordEye}</style>
        {backButton(() => router.push('/admin/staff'))}
        <PageHeader title="Create Account" />

        <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '12px', padding: '36px', textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', maxWidth: '820px', margin: '0 auto', boxSizing: 'border-box' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>✅</div>
          <h2 style={{ fontFamily: '"Lato", sans-serif', fontSize: '20px', fontWeight: 700, color: '#166534', margin: '0 0 8px' }}>Account Created</h2>
          <p style={{ fontFamily: '"Lato", sans-serif', fontSize: '14px', color: '#166534', margin: '0 0 28px' }}>
            The {isAdmin ? 'admin' : 'staff'} account for <strong>{firstName} {lastName}</strong> has been created. Share the temporary password with them so they can log in.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
              onClick={() => router.push('/admin/staff')}
              style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', background: COLOR.red, color: COLOR.white, fontFamily: '"Lato", sans-serif', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.background = '#5C1212'}
              onMouseLeave={e => e.currentTarget.style.background = COLOR.red}
            >
              Back to Staff List
            </button>
            <button
              onClick={() => { setSuccess(false); setSaving(false); setFirstName(''); setLastName(''); setEmail(''); setPhone(''); setPassword(''); setShowPassword(false); setErrors({}); setRole('STAFF') }}
              style={{ padding: '10px 24px', borderRadius: '8px', border: `1.5px solid ${COLOR.border}`, background: COLOR.white, color: COLOR.text, fontFamily: '"Lato", sans-serif', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}
            >
              Create Another
            </button>
          </div>
        </div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper>
      <style>{hideNativePasswordEye}</style>
      {backButton(() => router.push('/admin/staff'))}
      <PageHeader title="Create Account" />

      <div style={{ background: COLOR.white, borderRadius: '12px', padding: '32px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: `1px solid ${COLOR.border}`, width: '100%', maxWidth: '820px', margin: '0 auto', boxSizing: 'border-box' }}>

        {/* Account type toggle */}
        <div style={{ marginBottom: '16px', marginTop: '3px' }}>
          <label style={labelSt}>Account Type</label>
          <div style={{ display: 'flex', gap: '8px', marginTop: '5px' }}>
            {['STAFF', 'ADMIN'].map(r => {
              const active = role === r
              return (
                <button key={r} onClick={() => setRole(r)} style={{ flex: 1, padding: '11px', borderRadius: '8px', border: `1.5px solid ${active ? COLOR.red : COLOR.border}`, background: active ? COLOR.red : COLOR.white, color: active ? COLOR.white : COLOR.muted, fontSize: '14px', fontWeight: 700, fontFamily: '"Lato", sans-serif', cursor: 'pointer', transition: 'all .15s' }}>
                  {r === 'STAFF' ? 'Staff' : 'Admin'}
                </button>
              )
            })}
          </div>
          {isAdmin && (
            <p style={{ fontFamily: '"Lato", sans-serif', fontSize: '12px', color: '#023506', margin: '8px 0 0', background: '#dfffe6', border: '1px solid #1b831f', borderRadius: '6px', padding: '8px 12px' }}>
              Admin accounts have full access to all settings, staff management, and reports
            </p>
          )}
        </div>

        {/* Name row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label style={labelSt}>First Name *</label>
            <input type="text" value={firstName} onChange={e => { setFirstName(e.target.value); setErrors(p => ({ ...p, firstName: null })) }} placeholder="Jane" style={{ ...inputSt, borderColor: errors.firstName ? '#B91C1C' : COLOR.border }} />
            <FieldError message={errors.firstName} />
          </div>
          <div>
            <label style={labelSt}>Last Name *</label>
            <input type="text" value={lastName} onChange={e => { setLastName(e.target.value); setErrors(p => ({ ...p, lastName: null })) }} placeholder="Smith" style={{ ...inputSt, borderColor: errors.lastName ? '#B91C1C' : COLOR.border }} />
            <FieldError message={errors.lastName} />
          </div>
        </div>

        {/* Email */}
        <div style={{ marginBottom: '16px' }}>
          <label style={labelSt}>Email *</label>
          <input type="email" value={email} onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: null })) }} placeholder="jane@goodwoodmeats.com.au" style={{ ...inputSt, borderColor: errors.email ? '#B91C1C' : COLOR.border }} />
          <FieldError message={errors.email} />
        </div>

        {/* Phone */}
        <div style={{ marginBottom: '16px' }}>
          <label style={labelSt}>Phone (optional)</label>
          <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="04xx xxx xxx" style={inputSt} />
        </div>

        {/* Password */}
        <div style={{ marginBottom: '8px' }}>
          <label style={labelSt}>Temporary Password *</label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'} value={password}
              onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: null })) }}
              placeholder="Min. 8 characters"
              style={{ ...inputSt, paddingRight: '44px', borderColor: errors.password ? '#B91C1C' : COLOR.border }}
            />
            <button type="button" onClick={() => setShowPassword(p => !p)} aria-label={showPassword ? 'Hide password' : 'Show password'}
              style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: COLOR.muted, fontSize: '20px', padding: 0, display: 'flex', alignItems: 'center' }}
            >
              {showPassword ? <IoEyeOutline /> : <IoEyeOffOutline />}
            </button>
          </div>
          <FieldError message={errors.password} />
          <p style={{ fontFamily: '"Lato", sans-serif', fontSize: '12px', color: '#9CA3AF', margin: '6px 0 0' }}>
            Share this with the {isAdmin ? 'admin' : 'staff member'} — they can update it after logging in
          </p>
        </div>

        {errors.general && (
          <div style={{ background: COLOR.redLight, border: `1px solid ${COLOR.redBorder}`, borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: '#B91C1C', fontFamily: '"Lato", sans-serif', marginTop: '16px' }}>
            {errors.general}
          </div>
        )}

        {/* Submit row */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px', marginTop: '28px' }}>
          <button
            onClick={handleSubmit} disabled={saving}
            style={{ padding: '12px 26px', minWidth: '210px', background: saving ? COLOR.muted : COLOR.red, color: COLOR.white, border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 700, fontFamily: '"Lato", sans-serif', cursor: saving ? 'not-allowed' : 'pointer', transition: 'background .12s' }}
            onMouseEnter={e => { if (!saving) e.currentTarget.style.background = '#5C1212' }}
            onMouseLeave={e => { if (!saving) e.currentTarget.style.background = COLOR.red }}
          >
            {saving ? 'Creating…' : `Create ${isAdmin ? 'Admin' : 'Staff'} Account`}
          </button>
          <button
            onClick={() => router.push('/admin/staff')} disabled={saving}
            style={{ padding: '12px 24px', background: COLOR.sidebar, color: COLOR.text, border: `1.5px solid ${COLOR.border}`, borderRadius: '8px', fontSize: '14px', fontWeight: 700, fontFamily: '"Lato", sans-serif', cursor: saving ? 'not-allowed' : 'pointer' }}
          >
            Cancel
          </button>
        </div>
      </div>
    </PageWrapper>
  )
}
