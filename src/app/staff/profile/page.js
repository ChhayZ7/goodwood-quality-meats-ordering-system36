'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'

export default function ProfilePage() {
  const router = useRouter()

  const [user, setUser]       = useState(null)
  const [form, setForm]       = useState({ first_name: '', last_name: '', phone: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState(null)
  const [success, setSuccess] = useState(false)
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    current_password: '', new_password: '', confirm_password: ''
  })
  const [passwordError, setPasswordError]       = useState(null)
  const [passwordSuccess, setPasswordSuccess]   = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/users/me')
      if (res.status === 401) { router.replace('/login'); return }
      const json = await res.json()
      if (!json.user) { setError(json.error ?? 'Failed to load profile'); setLoading(false); return }
      setUser(json.user)
      setForm({ first_name: json.user.first_name ?? '', last_name: json.user.last_name ?? '', phone: json.user.phone ?? '' })
      setLoading(false)
    }
    load()
  }, [router])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true); setError(null); setSuccess(false)
    const res = await fetch('/api/users/me', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
    })
    const json = await res.json()
    if (!res.ok) { setError(json.error ?? 'Failed to save.'); setSaving(false); return }
    setUser(json.user); setSuccess(true); setSaving(false)
  }

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.replace('/login')
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    setPasswordError(null); setPasswordSuccess(false)
    if (passwordForm.new_password !== passwordForm.confirm_password) { setPasswordError('New passwords do not match'); return }
    if (passwordForm.new_password.length < 8) { setPasswordError('New password must be at least 8 characters'); return }
    setChangingPassword(true)
    const res = await fetch('/api/users/me/password', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ current_password: passwordForm.current_password, new_password: passwordForm.new_password }),
    })
    const json = await res.json()
    if (!res.ok) {
      setPasswordError(json.details ? Object.values(json.details).join(', ') : json.error ?? 'Failed to update password')
      setChangingPassword(false); return
    }
    setPasswordSuccess(true)
    setPasswordForm({ current_password: '', new_password: '', confirm_password: '' })
    setChangingPassword(false)
    setShowPasswordForm(false)
  }

  if (loading) return (
    <div className="max-w-4xl mx-auto animate-pulse">
        <div className="h-10 w-48 bg-gray-200 rounded-lg mb-8 mt-4" />
        <div className="bg-white rounded-xl border border-gray-200 p-8 mb-6">
        <div className="h-6 w-36 bg-gray-200 rounded mb-6" />
        <div className="flex gap-4 mb-5">
            <div className="flex-1 h-12 bg-gray-200 rounded-lg" />
            <div className="flex-1 h-12 bg-gray-200 rounded-lg" />
        </div>
        <div className="h-12 bg-gray-200 rounded-lg mb-5" />
        <div className="h-12 bg-gray-200 rounded-lg mb-5" />
        <div className="h-10 w-32 bg-gray-200 rounded-lg" />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-8">
        <div className="h-6 w-24 bg-gray-200 rounded mb-4" />
        <div className="h-4 w-20 bg-gray-200 rounded mb-2" />
        <div className="h-4 w-52 bg-gray-200 rounded mb-4" />
        <div className="h-10 w-36 bg-gray-200 rounded-lg" />
        </div>
    </div>
    )

  return (
    <div className="max-w-4xl mx-auto">

      <h1 className="text-3xl font-bold text-[#8B1A1A] mt-4 mb-8">My Account</h1>

      {/* Personal Details Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-8 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Personal Details</h2>

        {error   && <p className="text-red-600 text-sm mb-4">{error}</p>}
        {success && <p className="text-green-600 text-sm mb-4">Details updated successfully.</p>}

        <form onSubmit={handleSave} className="space-y-5">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input
                type="text"
                value={form.first_name}
                onChange={e => setForm(p => ({ ...p, first_name: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1A1A]"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input
                type="text"
                value={form.last_name}
                onChange={e => setForm(p => ({ ...p, last_name: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1A1A]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              value={user.email}
              disabled
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              type="tel"
              value={form.phone}
              onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1A1A]"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="bg-[#8B1A1A] text-white px-6 py-3 rounded-lg text-sm font-semibold hover:opacity-90 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Update Details'}
          </button>
        </form>
      </div>

      {/* Password Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-8 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Password</h2>
        <p className="text-gray-400 text-2xl tracking-widest mb-1">••••••••</p>
        <p className="text-sm text-gray-500 mb-4">You can update your password at any time</p>

        {!showPasswordForm ? (
          <button
            onClick={() => setShowPasswordForm(true)}
            className="border border-[#8B1A1A] text-[#8B1A1A] px-6 py-3 rounded-lg text-sm font-semibold hover:bg-[#8B1A1A] hover:text-white transition-colors"
          >
            Change Password
          </button>
        ) : (
          <form onSubmit={handlePasswordChange} className="space-y-4 mt-4">
            {passwordError   && <p className="text-red-600 text-sm">{passwordError}</p>}
            {passwordSuccess && <p className="text-green-600 text-sm">Password updated successfully.</p>}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
              <input
                type="password"
                value={passwordForm.current_password}
                onChange={e => setPasswordForm(p => ({ ...p, current_password: e.target.value }))}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1A1A]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input
                type="password"
                value={passwordForm.new_password}
                onChange={e => setPasswordForm(p => ({ ...p, new_password: e.target.value }))}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1A1A]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
              <input
                type="password"
                value={passwordForm.confirm_password}
                onChange={e => setPasswordForm(p => ({ ...p, confirm_password: e.target.value }))}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1A1A]"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={changingPassword}
                className="bg-[#8B1A1A] text-white px-6 py-3 rounded-lg text-sm font-semibold hover:opacity-90 disabled:opacity-50"
              >
                {changingPassword ? 'Updating...' : 'Update Password'}
              </button>
              <button
                type="button"
                onClick={() => { setShowPasswordForm(false); setPasswordError(null) }}
                className="border border-gray-300 text-gray-600 px-6 py-3 rounded-lg text-sm font-semibold hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>


    </div>
  )
}