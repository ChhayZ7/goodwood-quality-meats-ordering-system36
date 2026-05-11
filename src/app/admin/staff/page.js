'use client'

import { useState, useEffect, useCallback } from 'react'

function RoleBadge({ role }) {
  const isAdmin = role === 'ADMIN'
  return (
    <span style={{
      display: 'inline-block', padding: '5px 14px', borderRadius: '6px',
      fontSize: '13px', fontWeight: 700, fontFamily: '"Lato", sans-serif',
      background: isAdmin ? '#7B1A1A' : '#C9A84C', color: '#fff',
    }}>
      {isAdmin ? 'Admin' : 'Staff'}
    </span>
  )
}

function StatusBadge({ isActive }) {
  return (
    <span style={{
      display: 'inline-block', padding: '4px 12px', borderRadius: '20px',
      fontSize: '12px', fontWeight: 700, fontFamily: '"Lato", sans-serif',
      background: isActive ? '#DCFCE7' : '#FEE2E2',
      color: isActive ? '#166534' : '#991B1B',
    }}>
      {isActive ? 'Active' : 'Inactive'}
    </span>
  )
}

// ── Add Staff Modal ─────────────────────────────────────────────
function AddStaffModal({ onClose, onCreated }) {
  const [role,      setRole]      = useState('STAFF')
  const [firstName, setFirstName] = useState('')
  const [lastName,  setLastName]  = useState('')
  const [email,     setEmail]     = useState('')
  const [password,  setPassword]  = useState('')
  const [showPass,  setShowPass]  = useState(false)
  const [saving,    setSaving]    = useState(false)
  const [error,     setError]     = useState(null)

  const isAdmin     = role === 'ADMIN'
  const accentColor = isAdmin ? '#7B1A1A' : '#C9A84C'

  async function handleSubmit() {
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password.trim()) {
      setError('All fields are required.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: firstName.trim(),
          last_name:  lastName.trim(),
          email:      email.trim(),
          password,
          role,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to create account')
      onCreated()
      onClose()
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  const labelSt = {
    display: 'block', fontFamily: '"Lato", sans-serif', fontSize: '12px',
    fontWeight: 700, color: '#6B7280', textTransform: 'uppercase',
    letterSpacing: '.06em', marginBottom: '6px',
  }

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 100 }} />
      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%,-50%)',
        background: '#fff', borderRadius: '14px',
        padding: '32px', width: '480px', maxWidth: '95vw',
        zIndex: 101, boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontFamily: '"Playfair Display", serif', fontSize: '22px', fontWeight: 700, color: '#1A1A1A', margin: 0 }}>
            Add New Account
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#6B7280', lineHeight: 1 }}>×</button>
        </div>

        {/* Role toggle */}
        <div style={{ marginBottom: '20px' }}>
          <label style={labelSt}>Account Type</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            {['STAFF', 'ADMIN'].map(r => {
              const active = role === r
              const color  = r === 'ADMIN' ? '#7B1A1A' : '#C9A84C'
              return (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  style={{
                    flex: 1, padding: '10px', borderRadius: '8px',
                    border: `1.5px solid ${active ? color : '#E5E7EB'}`,
                    background: active ? color : '#fff',
                    color: active ? '#fff' : '#6B7280',
                    fontSize: '14px', fontWeight: 700,
                    fontFamily: '"Lato", sans-serif',
                    cursor: 'pointer', transition: 'all .15s',
                  }}
                >
                  {r === 'STAFF' ? 'Staff' : 'Admin'}
                </button>
              )
            })}
          </div>
        </div>

        {/* Name row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
          <div>
            <label style={labelSt}>First Name *</label>
            <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Jane" className="gw-input" />
          </div>
          <div>
            <label style={labelSt}>Last Name *</label>
            <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Smith" className="gw-input" />
          </div>
        </div>

        {/* Email */}
        <div style={{ marginBottom: '16px' }}>
          <label style={labelSt}>Email *</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="jane@goodwoodmeats.com.au" className="gw-input" />
        </div>

        {/* Password */}
        <div style={{ marginBottom: '24px' }}>
          <label style={labelSt}>Temporary Password *</label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPass ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Min. 8 characters"
              className="gw-input"
              style={{ paddingRight: '44px' }}
            />
            <button
              type="button"
              onClick={() => setShowPass(p => !p)}
              style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', fontSize: '16px', padding: 0 }}
            >
              {showPass ? '🙈' : '👁'}
            </button>
          </div>
          <p style={{ fontFamily: '"Lato", sans-serif', fontSize: '12px', color: '#9CA3AF', margin: '6px 0 0' }}>
            Share this with the {isAdmin ? 'admin' : 'staff member'} so they can log in and update it.
          </p>
        </div>

        {error && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: '#B91C1C', fontFamily: '"Lato", sans-serif', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={handleSubmit}
            disabled={saving}
            style={{
              flex: 1, padding: '12px',
              background: saving ? '#9CA3AF' : accentColor,
              color: '#fff', border: 'none', borderRadius: '8px',
              fontSize: '14px', fontWeight: 700, fontFamily: '"Lato", sans-serif',
              cursor: saving ? 'not-allowed' : 'pointer',
            }}
          >
            {saving ? 'Creating…' : `Create ${isAdmin ? 'Admin' : 'Staff'} Account`}
          </button>
          <button
            onClick={onClose}
            style={{
              padding: '12px 20px', background: 'none',
              border: '1.5px solid #E5E7EB', borderRadius: '8px',
              fontSize: '14px', fontWeight: 700, color: '#6B7280',
              cursor: 'pointer', fontFamily: '"Lato", sans-serif',
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </>
  )
}

// ── Toggle confirm dialog ────────────────────────────────────────
function ToggleDialog({ member, onConfirm, onCancel, loading, error }) {
  const deactivating = member.is_active

  return (
    <>
      <div onClick={onCancel} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 100 }} />
      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%,-50%)',
        background: '#fff', borderRadius: '12px',
        padding: '28px 32px', maxWidth: '400px', width: '90%',
        zIndex: 101, boxShadow: '0 16px 48px rgba(0,0,0,0.15)',
      }}>
        <h3 style={{ fontFamily: '"Playfair Display", serif', fontSize: '18px', fontWeight: 700, color: '#1A1A1A', margin: '0 0 10px' }}>
          {deactivating ? 'Deactivate this account?' : 'Reactivate this account?'}
        </h3>
        <p style={{ fontFamily: '"Lato", sans-serif', fontSize: '14px', color: '#555', lineHeight: 1.6, margin: '0 0 4px' }}>
          <strong>{member.first_name} {member.last_name}</strong>{' '}
          {deactivating
            ? 'will no longer be able to log in.'
            : 'will be able to log in again.'}
        </p>
        <p style={{ fontFamily: '"Lato", sans-serif', fontSize: '13px', color: '#9CA3AF', margin: '0 0 20px' }}>
          {deactivating ? 'You can reactivate them later.' : 'Their role and access will be restored.'}
        </p>
        {error && (
          <p style={{ fontFamily: '"Lato", sans-serif', fontSize: '13px', color: '#DC2626', marginBottom: '12px' }}>{error}</p>
        )}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={onConfirm}
            disabled={loading}
            style={{
              flex: 1, padding: '10px',
              background: loading ? '#9CA3AF' : deactivating ? '#DC2626' : '#16A34A',
              color: '#fff', border: 'none', borderRadius: '8px',
              fontSize: '14px', fontWeight: 700, fontFamily: '"Lato", sans-serif',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading
              ? (deactivating ? 'Deactivating…' : 'Reactivating…')
              : (deactivating ? 'Yes, Deactivate' : 'Yes, Reactivate')}
          </button>
          <button
            onClick={onCancel}
            style={{
              flex: 1, padding: '10px', background: '#F3F4F6', color: '#555',
              border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 700,
              fontFamily: '"Lato", sans-serif', cursor: 'pointer',
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </>
  )
}

// ── Main page ────────────────────────────────────────────────────
export default function AdminStaffPage() {
  const [staff,         setStaff]         = useState([])
  const [loading,       setLoading]       = useState(true)
  const [fetchError,    setFetchError]    = useState(null)
  const [showAdd,       setShowAdd]       = useState(false)
  const [toggling,      setToggling]      = useState(null)  // member being toggled
  const [toggleLoading, setToggleLoading] = useState(false)
  const [toggleError,   setToggleError]   = useState(null)

  const loadStaff = useCallback(async () => {
    setLoading(true)
    setFetchError(null)
    try {
      const res  = await fetch('/api/admin/staff')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to load staff')
      setStaff(data.staff ?? [])
    } catch (err) {
      setFetchError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadStaff() }, [loadStaff])

  async function handleToggle() {
    setToggleLoading(true)
    setToggleError(null)
    try {
      const res = await fetch(`/api/admin/staff/${toggling.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !toggling.is_active }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to update account')
      setToggling(null)
      await loadStaff()
    } catch (err) {
      setToggleError(err.message)
    } finally {
      setToggleLoading(false)
    }
  }

  const COLS = '1fr 1fr 120px 110px 130px'

  return (
    <div style={{ padding: '32px', maxWidth: '1050px' }}>

      {/* Heading */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontFamily: '"Playfair Display", serif', fontSize: '26px', fontWeight: 700, color: '#1A1A1A', margin: '0 0 6px' }}>
            Staff Management
          </h1>
          <p style={{ fontFamily: '"Lato", sans-serif', fontSize: '14px', color: '#888', margin: 0 }}>
            Add staff logins and deactivate existing accounts
          </p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary" style={{ padding: '10px 22px', fontSize: '14px' }}>
          + Create Account
        </button>
      </div>

      {fetchError && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '12px 16px', fontSize: '13px', color: '#B91C1C', marginBottom: '20px', fontFamily: '"Lato", sans-serif' }}>
          {fetchError} —{' '}
          <button onClick={loadStaff} style={{ background: 'none', border: 'none', color: '#7B1A1A', cursor: 'pointer', textDecoration: 'underline', fontSize: '13px', padding: 0 }}>retry</button>
        </div>
      )}

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>

        <div style={{ padding: '20px 28px', borderBottom: '1px solid #E5E7EB' }}>
          <h2 style={{ fontFamily: '"Playfair Display", serif', fontSize: '20px', fontWeight: 700, color: '#1A1A1A', margin: 0 }}>
            Current Staff &amp; Admins
          </h2>
        </div>

        {/* Column headers */}
        <div style={{ display: 'grid', gridTemplateColumns: COLS, padding: '10px 28px', background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
          {['Name', 'Email', 'Role', 'Status', 'Actions'].map((h, i) => (
            <span key={h} style={{
              fontFamily: '"Lato", sans-serif', fontSize: '13px', fontWeight: 700, color: '#6B7280',
              textAlign: i >= 3 ? 'center' : 'left',
            }}>
              {h}
            </span>
          ))}
        </div>

        {/* Skeleton */}
        {loading && Array.from({ length: 3 }).map((_, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: COLS, padding: '18px 28px', borderBottom: '1px solid #F3F4F6', alignItems: 'center' }}>
            <div style={{ height: '14px', width: '130px', background: '#F0E8D0', borderRadius: '4px' }} />
            <div style={{ height: '14px', width: '170px', background: '#F0E8D0', borderRadius: '4px' }} />
            <div style={{ height: '26px', width: '72px', background: '#F3F4F6', borderRadius: '6px' }} />
            <div style={{ height: '22px', width: '60px', background: '#F3F4F6', borderRadius: '20px', margin: '0 auto' }} />
            <div style={{ height: '28px', width: '90px', background: '#F3F4F6', borderRadius: '6px', margin: '0 auto' }} />
          </div>
        ))}

        {/* Rows */}
        {!loading && staff.map((member, i) => (
          <div key={member.id} style={{
            display: 'grid', gridTemplateColumns: COLS,
            padding: '18px 28px',
            borderBottom: i < staff.length - 1 ? '1px solid #F3F4F6' : 'none',
            alignItems: 'center',
            opacity: member.is_active ? 1 : 0.6,
          }}>
            <span style={{ fontFamily: '"Lato", sans-serif', fontSize: '15px', color: '#1A1A1A' }}>
              {member.first_name} {member.last_name}
            </span>
            <span style={{ fontFamily: '"Lato", sans-serif', fontSize: '14px', color: '#6B7280' }}>
              {member.email}
            </span>
            <RoleBadge role={member.role} />
            <div style={{ textAlign: 'center' }}>
              <StatusBadge isActive={member.is_active} />
            </div>
            <div style={{ textAlign: 'center' }}>
              {member.role !== 'ADMIN' ? (
                <button
                  onClick={() => { setToggling(member); setToggleError(null) }}
                  style={{
                    padding: '6px 14px', borderRadius: '6px', border: 'none',
                    fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                    fontFamily: '"Lato", sans-serif', transition: 'opacity .15s',
                    background: member.is_active ? '#FEE2E2' : '#DCFCE7',
                    color: member.is_active ? '#991B1B' : '#166534',
                  }}
                >
                  {member.is_active ? 'Deactivate' : 'Reactivate'}
                </button>
              ) : (
                <span style={{ fontFamily: '"Lato", sans-serif', fontSize: '12px', color: '#D1D5DB' }}>—</span>
              )}
            </div>
          </div>
        ))}

        {!loading && staff.length === 0 && !fetchError && (
          <div style={{ padding: '48px', textAlign: 'center', fontFamily: '"Lato", sans-serif', fontSize: '14px', color: '#9CA3AF' }}>
            No staff accounts yet. Click "+ Create Account" to create one.
          </div>
        )}
      </div>

      {showAdd && <AddStaffModal onClose={() => setShowAdd(false)} onCreated={loadStaff} />}

      {toggling && (
        <ToggleDialog
          member={toggling}
          onConfirm={handleToggle}
          onCancel={() => setToggling(null)}
          loading={toggleLoading}
          error={toggleError}
        />
      )}
    </div>
  )
}