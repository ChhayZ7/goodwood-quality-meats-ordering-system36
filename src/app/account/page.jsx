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

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/users/me')

      if (res.status === 401) {
        router.replace('/login')
        return
      }

      const { user } = await res.json()
      setUser(user)
      setForm({
        first_name: user.first_name ?? '',
        last_name:  user.last_name  ?? '',
        phone:      user.phone      ?? '',
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

      <button onClick={handleSignOut}>Sign out</button>
    </main>
  )
}