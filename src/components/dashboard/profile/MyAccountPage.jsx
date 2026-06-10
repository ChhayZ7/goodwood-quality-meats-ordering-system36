'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const COLOR = {
  red: '#7B1A1A',
  redDark: '#5C1212',
  cream: '#FAF3E0',
  gold: '#C9A84C',
  text: '#1A1A1A',
  muted: '#6B7280',
  border: '#E5DCC8',
  white: '#FFFFFF',
  sidebar: '#F5EDD8',
  redLight: '#FEF2F2',
  redBorder: '#FECACA',
}

const hideNativePasswordEye = `
  input[type="password"]::-ms-reveal,
  input[type="password"]::-ms-clear {
    display: none;
  }

  input[type="password"]::-webkit-credentials-auto-fill-button,
  input[type="password"]::-webkit-caps-lock-indicator {
    display: none !important;
    visibility: hidden;
    pointer-events: none;
  }
`

function EyeButton({ visible, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#8B1A1A]"
      aria-label={visible ? 'Hide password' : 'Show password'}
    >
      {visible ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-6.5 0-10-7-10-7a18.45 18.45 0 0 1 5.06-5.94" />
          <path d="M9.9 4.24A10.94 10.94 0 0 1 12 4c6.5 0 10 7 10 7a18.5 18.5 0 0 1-2.16 3.19" />
          <path d="M14.12 14.12A3 3 0 0 1 9.88 9.88" />
          <path d="M1 1l22 22" />
        </svg>
      )}
    </button>
  )
}

export default function ProfilePage() {
  const router = useRouter()

  const [user, setUser] = useState(null)

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    phone: '',
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const [showPasswordForm, setShowPasswordForm] = useState(false)

  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  })

  const [passwordError, setPasswordError] = useState(null)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)

  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/users/me')

      if (res.status === 401) {
        router.replace('/login')
        return
      }

      const json = await res.json()

      if (!json.user) {
        setError(json.error ?? 'Failed to load profile')
        setLoading(false)
        return
      }

      setUser(json.user)

      setForm({
        first_name: json.user.first_name ?? '',
        last_name: json.user.last_name ?? '',
        phone: json.user.phone ?? '',
      })

      setLoading(false)
    }

    load()
  }, [router])

  const handleSave = async e => {
    e.preventDefault()

    setSaving(true)
    setError(null)
    setSuccess(false)

    const res = await fetch('/api/users/me', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
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

  const handlePasswordChange = async e => {
    e.preventDefault()

    setPasswordError(null)
    setPasswordSuccess(false)

    if (passwordForm.new_password !== passwordForm.confirm_password) {
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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
      }),
    })

    const json = await res.json()

    if (!res.ok) {
      setPasswordError(
        json.details
          ? Object.values(json.details).join(', ')
          : json.error ?? 'Failed to update password'
      )

      setChangingPassword(false)
      return
    }

    setPasswordSuccess(true)

    setPasswordForm({
      current_password: '',
      new_password: '',
      confirm_password: '',
    })

    setChangingPassword(false)
    setShowPasswordForm(false)

    setShowCurrentPassword(false)
    setShowNewPassword(false)
    setShowConfirmPassword(false)
  }

  if (loading) {
    return (
      <div
        style={{
          maxWidth: '1180px',
          margin: '0 auto',
          fontFamily: '"Lato", sans-serif',
        }}
        className="px-4 pt-6 pb-10 sm:px-10 sm:pt-12 sm:pb-20"
      >
        <style>{hideNativePasswordEye}</style>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '18px',
            marginBottom: '28px',
          }}
        >
          <h1
            style={{
              fontFamily: '"Lato", serif',
              fontSize: '36px',
              fontWeight: 700,
              color: COLOR.red,
              margin: 0,
            }}
          >
            My Account
          </h1>
        </div>

        <div
          style={{
            height: '2px',
            background: `linear-gradient(90deg, ${COLOR.gold}, transparent)`,
            borderRadius: '1px',
            marginBottom: '32px',
          }}
        />

        <div className="animate-pulse">
          <div className="bg-white rounded-xl border border-[#E5DCC8] p-8 mb-6">
            <div className="h-6 w-40 bg-[#EFE6D1] rounded mb-6" />

            <div className="flex flex-col sm:flex-row gap-4 mb-5">
              <div className="flex-1 h-12 bg-[#EFE6D1] rounded-lg" />
              <div className="flex-1 h-12 bg-[#EFE6D1] rounded-lg" />
            </div>

            <div className="h-12 bg-[#EFE6D1] rounded-lg mb-5" />
            <div className="h-12 bg-[#EFE6D1] rounded-lg mb-5" />
            <div className="h-11 w-36 bg-[#EFE6D1] rounded-lg" />
          </div>

          <div className="bg-white rounded-xl border border-[#E5DCC8] p-8">
            <div className="h-6 w-28 bg-[#EFE6D1] rounded mb-4" />
            <div className="h-4 w-24 bg-[#EFE6D1] rounded mb-2" />
            <div className="h-4 w-60 bg-[#EFE6D1] rounded mb-4" />
            <div className="h-11 w-40 bg-[#EFE6D1] rounded-lg" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        maxWidth: '1180px',
        margin: '0 auto',
        fontFamily: '"Lato", sans-serif',
      }}
      className="px-4 pt-6 pb-10 sm:px-10 sm:pt-12 sm:pb-20"
    >
      <style>{hideNativePasswordEye}</style>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '18px',
          marginBottom: '28px',
        }}
      >
        <h1
          style={{
            fontFamily: '"Lato", serif',
            fontSize: '36px',
            fontWeight: 700,
            color: COLOR.red,
            margin: 0,
          }}
        >
          My Account
        </h1>
      </div>

      <div
        style={{
          height: '2px',
          background: `linear-gradient(90deg, ${COLOR.gold}, transparent)`,
          borderRadius: '1px',
          marginBottom: '32px',
        }}
      />

      <div className="bg-white rounded-xl border border-[#E5DCC8] p-8 mb-6 shadow-[0_4px_12px_rgba(0,0,0,0.035)]">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">
          Personal Details
        </h2>

        {error && (
          <p className="text-red-600 text-sm mb-4 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            {error}
          </p>
        )}

        {success && (
          <p className="text-green-700 text-sm mb-4 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
            Details updated successfully.
          </p>
        )}

        <form onSubmit={handleSave} className="space-y-5">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>

              <input
                type="text"
                value={form.first_name}
                onChange={e =>
                  setForm(p => ({
                    ...p,
                    first_name: e.target.value,
                  }))
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1A1A]"
              />
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>

              <input
                type="text"
                value={form.last_name}
                onChange={e =>
                  setForm(p => ({
                    ...p,
                    last_name: e.target.value,
                  }))
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1A1A]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>

            <input
              type="email"
              value={user.email}
              disabled
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>

            <input
              type="tel"
              value={form.phone}
              onChange={e =>
                setForm(p => ({
                  ...p,
                  phone: e.target.value,
                }))
              }
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

      <div className="bg-white rounded-xl border border-[#E5DCC8] p-8 mb-6 shadow-[0_4px_12px_rgba(0,0,0,0.035)]">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Password</h2>

        <p className="text-gray-400 text-2xl tracking-widest mb-1">••••••••</p>

        <p className="text-sm text-gray-500 mb-4">
          You can update your password at any time
        </p>

        {!showPasswordForm ? (
          <button
            type="button"
            onClick={() => setShowPasswordForm(true)}
            className="border border-[#8B1A1A] text-[#8B1A1A] px-6 py-3 rounded-lg text-sm font-semibold hover:bg-[#8B1A1A] hover:text-white transition-colors"
          >
            Change Password
          </button>
        ) : (
          <form onSubmit={handlePasswordChange} className="space-y-4 mt-4">
            {passwordError && (
              <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                {passwordError}
              </p>
            )}

            {passwordSuccess && (
              <p className="text-green-700 text-sm bg-green-50 border border-green-200 rounded-lg px-4 py-3">
                Password updated successfully.
              </p>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Password
              </label>

              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={passwordForm.current_password}
                  onChange={e =>
                    setPasswordForm(p => ({
                      ...p,
                      current_password: e.target.value,
                    }))
                  }
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1A1A]"
                />

                <EyeButton
                  visible={showCurrentPassword}
                  onClick={() => setShowCurrentPassword(v => !v)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>

              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={passwordForm.new_password}
                  onChange={e =>
                    setPasswordForm(p => ({
                      ...p,
                      new_password: e.target.value,
                    }))
                  }
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1A1A]"
                />

                <EyeButton
                  visible={showNewPassword}
                  onClick={() => setShowNewPassword(v => !v)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password
              </label>

              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={passwordForm.confirm_password}
                  onChange={e =>
                    setPasswordForm(p => ({
                      ...p,
                      confirm_password: e.target.value,
                    }))
                  }
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1A1A]"
                />

                <EyeButton
                  visible={showConfirmPassword}
                  onClick={() => setShowConfirmPassword(v => !v)}
                />
              </div>
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
                onClick={() => {
                  setShowPasswordForm(false)
                  setPasswordError(null)
                  setShowCurrentPassword(false)
                  setShowNewPassword(false)
                  setShowConfirmPassword(false)
                }}
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