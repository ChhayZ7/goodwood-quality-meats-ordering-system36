// This page lets the admin create a new staff account
// Admin can set the account type (Staff or Admin), name, email, phone, and a temporary password

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
// IoEyeOutline and IoEyeOffOutline are eye icons from react-icons used for the password show/hide toggle
import { IoEyeOutline, IoEyeOffOutline } from 'react-icons/io5'
import PageWrapper from '@/components/dashboard/PageWrapper'
import PageHeader from '@/components/dashboard/PageHeader'

const COLOR = {
  red: '#7B1A1A', redLight: '#FEF2F2', redBorder: '#FECACA',
  cream: '#FAF3E0', gold: '#C9A84C', text: '#1A1A1A',
  muted: '#6B7280', border: '#E5DCC8', white: '#FFFFFF', sidebar: '#F5EDD8',
}

// hideNativePasswordEye is a CSS string injected via a style tag
// it hides the browser's built-in password reveal button in Edge and Chrome
// so only our custom eye icon toggle is visible
const hideNativePasswordEye = `
  input[type="password"]::-ms-reveal,
  input[type="password"]::-ms-clear { display: none; }
  input[type="password"]::-webkit-credentials-auto-fill-button,
  input[type="password"]::-webkit-caps-lock-indicator { display: none !important; visibility: hidden; pointer-events: none; }
`

// labelSt is the shared style for all field labels on this page
// flexShrink 0 prevents the label from shrinking when the input is long
const labelSt = {
  fontFamily: '"Lato", sans-serif', fontSize: '12px', fontWeight: 700,
  color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '.06em', flexShrink: 0,
}

// inputSt is the shared style for all input fields on this page
const inputSt = {
  width: '100%', padding: '10px 12px', border: `1.5px solid ${COLOR.border}`,
  borderRadius: '8px', fontSize: '14px', fontFamily: '"Lato", sans-serif',
  color: COLOR.text, background: COLOR.white, outline: 'none', boxSizing: 'border-box',
}

// FieldError renders a small red error message below a field
// returns null if no message is passed so nothing renders when there is no error
function FieldError({ message }) {
  if (!message) return null
  return <p style={{ fontFamily: '"Lato", sans-serif', fontSize: '12px', color: '#B91C1C', margin: '4px 0 0' }}>{message}</p>
}

// backButton is a helper function that returns a styled back button
// defined as a function so it can be called directly in JSX
function backButton(onClick) {
  return (
    <button
      onClick={onClick}
      style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: '"Lato", sans-serif', fontSize: '14px', fontWeight: 700, color: COLOR.red, padding: 0, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '6px' }}
      onMouseEnter={e => e.currentTarget.style.color = '#5C1212'}
      onMouseLeave={e => e.currentTarget.style.color = COLOR.red}
    >
      Back to Staff List
    </button>
  )
}

export default function NewStaffPage() {
  const router = useRouter()

  // role tracks whether this account is 'STAFF' or 'ADMIN', defaults to STAFF
  const [role, setRole] = useState('STAFF')

  // form field states
  const [firstName, setFirstName] = useState('')
  const [lastName,  setLastName]  = useState('')
  const [email,     setEmail]     = useState('')
  const [phone,     setPhone]     = useState('')
  const [password,  setPassword]  = useState('')

  // showPassword controls whether the password field shows plain text or dots
  const [showPassword, setShowPassword] = useState(false)

  // saving is true while the API call is in progress
  const [saving, setSaving] = useState(false)

  // errors stores validation and API error messages keyed by field name
  // e.g. { firstName: 'First name is required', general: 'Email already in use' }
  const [errors, setErrors] = useState({})

  // success is set to true after the API call succeeds, switches the page to a success screen
  const [success, setSuccess] = useState(false)

  // isAdmin is true when role is 'ADMIN', used to change labels and messages throughout the form
  const isAdmin = role === 'ADMIN'

  // handleSubmit validates all fields then sends a POST request to /api/admin/staff
  // Object.keys(newErrors).length > 0 checks if any validation errors were found before calling the API
  async function handleSubmit() {
    setErrors({})
    const newErrors = {}

    // validate each required field and add an error message if empty
    if (!firstName.trim()) newErrors.firstName = 'First name is required'
    if (!lastName.trim())  newErrors.lastName  = 'Last name is required'
    if (!email.trim())     newErrors.email     = 'Email is required'
    if (!password.trim())  newErrors.password  = 'Password is required'
    // extra check -- password must be at least 8 characters
    else if (password.length < 8) newErrors.password = 'Password must be at least 8 characters'

    // if any errors exist, update state and stop -- do not call the API
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return }

    setSaving(true)
    try {
      // POST to /api/admin/staff with the form data as JSON
      // .trim() removes any leading or trailing spaces before sending
      const res  = await fetch('/api/admin/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: firstName.trim(),
          last_name:  lastName.trim(),
          email:      email.trim(),
          phone:      phone.trim(),
          password,
          role,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to create account')
      // success -- switch to the success screen
      setSuccess(true)
    } catch (err) {
      // store the error in errors.general so it shows below the form
      setErrors({ general: err.message })
      setSaving(false)
    }
  }

  // Success screen -- shown after the account is created successfully
  // gives the admin two options: go back to the staff list, or create another account
  // Create Another resets all form fields back to their defaults
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
            {/* Create Another resets all form states back to defaults so the admin can create again */}
            <button
              onClick={() => {
                setSuccess(false); setSaving(false)
                setFirstName(''); setLastName(''); setEmail('')
                setPhone(''); setPassword(''); setShowPassword(false)
                setErrors({}); setRole('STAFF')
              }}
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
      {/* hideNativePasswordEye removes the browser built-in password reveal button */}
      <style>{hideNativePasswordEye}</style>
      {backButton(() => router.push('/admin/staff'))}
      <PageHeader title="Create Account" />

      <div style={{ background: COLOR.white, borderRadius: '12px', padding: '32px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: `1px solid ${COLOR.border}`, width: '100%', maxWidth: '820px', margin: '0 auto', boxSizing: 'border-box' }}>

        {/* ACCOUNT TYPE TOGGLE
            renders two buttons (Staff and Admin) from an array using .map()
            active button gets red background and white text, inactive gets white background
            clicking a button sets role state to that value
            admin warning note only shows when isAdmin is true */}
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
          {/* Warning note -- only shown when Admin is selected */}
          {isAdmin && (
            <p style={{ fontFamily: '"Lato", sans-serif', fontSize: '12px', color: '#023506', margin: '8px 0 0', background: '#dfffe6', border: '1px solid #1b831f', borderRadius: '6px', padding: '8px 12px' }}>
              Admin accounts have full access to all settings, staff management, and reports
            </p>
          )}
        </div>

        {/* NAME ROW -- first and last name in a 1fr 1fr two column grid
            onChange clears the relevant error as the admin types using the spread pattern
            p => ({ ...p, firstName: null }) copies all existing errors and sets firstName to null
            borderColor changes to red if that field has an error */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label style={labelSt}>First Name *</label>
            <input
              type="text" value={firstName}
              onChange={e => { setFirstName(e.target.value); setErrors(p => ({ ...p, firstName: null })) }}
              placeholder="Jane"
              style={{ ...inputSt, borderColor: errors.firstName ? '#B91C1C' : COLOR.border }}
            />
            <FieldError message={errors.firstName} />
          </div>
          <div>
            <label style={labelSt}>Last Name *</label>
            <input
              type="text" value={lastName}
              onChange={e => { setLastName(e.target.value); setErrors(p => ({ ...p, lastName: null })) }}
              placeholder="Smith"
              style={{ ...inputSt, borderColor: errors.lastName ? '#B91C1C' : COLOR.border }}
            />
            <FieldError message={errors.lastName} />
          </div>
        </div>

        {/* EMAIL -- type="email" enables browser email validation */}
        <div style={{ marginBottom: '16px' }}>
          <label style={labelSt}>Email *</label>
          <input
            type="email" value={email}
            onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: null })) }}
            placeholder="jane@goodwoodmeats.com.au"
            style={{ ...inputSt, borderColor: errors.email ? '#B91C1C' : COLOR.border }}
          />
          <FieldError message={errors.email} />
        </div>

        {/* PHONE -- optional, type="tel" enables the phone keyboard on mobile */}
        <div style={{ marginBottom: '16px' }}>
          <label style={labelSt}>Phone (optional)</label>
          <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="04xx xxx xxx" style={inputSt} />
        </div>

        {/* PASSWORD -- show/hide toggle using a custom eye icon button
            type changes between "password" (dots) and "text" (plain) based on showPassword state
            paddingRight 44px on the input creates space so the text doesn't overlap the eye icon
            position absolute on the button and translateY(-50%) centres it vertically inside the input
            aria-label makes the toggle button accessible to screen readers */}
        <div style={{ marginBottom: '8px' }}>
          <label style={labelSt}>Temporary Password *</label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: null })) }}
              placeholder="Min. 8 characters"
              style={{ ...inputSt, paddingRight: '44px', borderColor: errors.password ? '#B91C1C' : COLOR.border }}
            />
            {/* Eye icon button -- clicking toggles showPassword between true and false
                p => !p is shorthand for the previous state flipped */}
            <button
              type="button"
              onClick={() => setShowPassword(p => !p)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: COLOR.muted, fontSize: '20px', padding: 0, display: 'flex', alignItems: 'center' }}
            >
              {/* shows the open eye when password is visible, closed eye when hidden */}
              {showPassword ? <IoEyeOutline /> : <IoEyeOffOutline />}
            </button>
          </div>
          <FieldError message={errors.password} />
          <p style={{ fontFamily: '"Lato", sans-serif', fontSize: '12px', color: '#9CA3AF', margin: '6px 0 0' }}>
            Share this with the {isAdmin ? 'admin' : 'staff member'} -- they can update it after logging in
          </p>
        </div>

        {/* General error banner -- shown for API errors that are not tied to a specific field */}
        {errors.general && (
          <div style={{ background: COLOR.redLight, border: `1px solid ${COLOR.redBorder}`, borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: '#B91C1C', fontFamily: '"Lato", sans-serif', marginTop: '16px' }}>
            {errors.general}
          </div>
        )}

        {/* SUBMIT ROW -- Create Account button and Cancel button
            button label changes based on role e.g. "Create Admin Account" or "Create Staff Account"
            button turns grey and shows Creating while saving is true
            onMouseEnter and onMouseLeave hover effects only fire when not saving */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px', marginTop: '28px' }}>
          <button
            onClick={handleSubmit}
            disabled={saving}
            style={{ padding: '12px 26px', minWidth: '210px', background: saving ? COLOR.muted : COLOR.red, color: COLOR.white, border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 700, fontFamily: '"Lato", sans-serif', cursor: saving ? 'not-allowed' : 'pointer', transition: 'background .12s' }}
            onMouseEnter={e => { if (!saving) e.currentTarget.style.background = '#5C1212' }}
            onMouseLeave={e => { if (!saving) e.currentTarget.style.background = COLOR.red }}
          >
            {saving ? 'Creating...' : `Create ${isAdmin ? 'Admin' : 'Staff'} Account`}
          </button>
          <button
            onClick={() => router.push('/admin/staff')}
            disabled={saving}
            style={{ padding: '12px 24px', background: COLOR.sidebar, color: COLOR.text, border: `1.5px solid ${COLOR.border}`, borderRadius: '8px', fontSize: '14px', fontWeight: 700, fontFamily: '"Lato", sans-serif', cursor: saving ? 'not-allowed' : 'pointer' }}
          >
            Cancel
          </button>
        </div>
      </div>
    </PageWrapper>
  )
}