// Barebone account page (to be styled later)
'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'

export default function AccountPage(){
  const router = useRouter()

  const [user, setUser]       = useState(null)
  const [form, setForm]       = useState({ first_name: '', last_name: '', phone: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState(null)
  const [success, setSuccess] = useState(false)

  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  })
  const [passwordError, setPasswordError] = useState(null)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/users/me')

      if (res.status === 401) {
        router.replace('/login')
        return
      }

      const json = await res.json()

      if (!json.user){
        console.error("No user in response:", json)
        setError(json.error ??  'Failed to load profile')
        setLoading(false)
        return
      }

      setUser(json.user)
      setForm({
        first_name: json.user.first_name ?? '',
        last_name:  json.user.last_name  ?? '',
        phone:      json.user.phone      ?? '',
      })
      setLoading(false)
    }

    load()
  }, [router])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(false)

    const res = await fetch('/api/users/me', {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(form),
    })

    const json = await res.json()

    if (!res.ok) {
      setError(json.error ?? 'Failed to save.')
      setSaving(false)
      return
    }

    setUser(json.user)
    setSuccess(true)
    setSaving(false)
  }

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.replace('/login')
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    setPasswordError(null)
    setPasswordSuccess(false)

    // Client-side check before hitting the API
    if (passwordForm.new_password !== passwordForm.confirm_password){
      setPasswordError('New passwords do not match')
      return
    }

    if (passwordForm.new_password.length < 8) {
      setPasswordError('New password must be at least 8 characters')
      return
    }

    setChangingPassword(true)

    const res = await fetch('/api/users/me/password', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json'},
      body: JSON.stringify({
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
      }),
    })

    const json = await res.json()

    if (!res.ok){
      if (json.details){
        const message = Object.values(json.details).join(', ')
        setPasswordError(message)
      } else {
        setPasswordError(json.error ?? 'Failed to update password')
      }
      setChangingPassword(false)
      return
    }

    setPasswordSuccess(true)
    setPasswordForm( { current_password: '', new_password: '', confirm_password: ''})
    setChangingPassword(false)
  }

  if (loading) return <p>Loading...</p>

  return (
    <main>
      <h1>My Account</h1>

      <p>Email: {user.email}</p>
      <p>Role: {user.role}</p>
      <p>Member since: {new Date(user.created_at).getFullYear()}</p>

      <hr />

      <h2>Edit Profile</h2>

      {error   && <p>{error}</p>}
      {success && <p>Profile updated.</p>}

      <form onSubmit={handleSave}>
        <div>
          <label>First name: </label>
          <input
            type="text"
            value={form.first_name}
            onChange={e => setForm(p => ({ ...p, first_name: e.target.value }))}
          />
        </div>

        <div>
          <label>Last name: </label>
          <input
            type="text"
            value={form.last_name}
            onChange={e => setForm(p => ({ ...p, last_name: e.target.value }))}
          />
        </div>

        <div>
          <label>Phone: </label>
          <input
            type="tel"
            value={form.phone}
            onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
          />
        </div>

        <button type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save'}
        </button>
      </form>

      <hr />
      <hr />

        <h2>Change Password</h2>

        {passwordError   && <p style={{ color: 'red' }}>{passwordError}</p>}
        {passwordSuccess && <p style={{ color: 'green' }}>Password updated successfully.</p>}

        <form onSubmit={handlePasswordChange}>
          <div>
            <label>Current password</label>
            <input
              type="password"
              value={passwordForm.current_password}
              onChange={e => setPasswordForm(p => ({ ...p, current_password: e.target.value }))}
              required
            />
          </div>

          <div>
            <label>New password</label>
            <input
              type="password"
              value={passwordForm.new_password}
              onChange={e => setPasswordForm(p => ({ ...p, new_password: e.target.value }))}
              required
            />
          </div>

          <div>
            <label>Confirm new password</label>
            <input
              type="password"
              value={passwordForm.confirm_password}
              onChange={e => setPasswordForm(p => ({ ...p, confirm_password: e.target.value }))}
              required
            />
          </div>

          <button type="submit" disabled={changingPassword}>
            {changingPassword ? 'Updating...' : 'Update password'}
          </button>
        </form>

        <hr />
      <button onClick={handleSignOut}>Sign out</button>
    </main>
  )
}