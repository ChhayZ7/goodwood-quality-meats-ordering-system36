'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import PageWrapper from '@/components/dashboard/PageWrapper'
import PageHeader from '@/components/dashboard/PageHeader'

const COLOR = {
  red: '#7B1A1A', redLight: '#FEF2F2', redBorder: '#FECACA',
  cream: '#FAF3E0', gold: '#C9A84C', text: '#1A1A1A',
  muted: '#6B7280', border: '#E5DCC8', white: '#FFFFFF', sidebar: '#F5EDD8',
}

const labelSt = {
  fontFamily: '"Lato", sans-serif', fontSize: '12px', fontWeight: 700,
  color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '.06em',
  width: '150px', flexShrink: 0,
}

function InfoRow({ label, value }) {
  return (
    <div style={{ padding: '16px 0', borderBottom: `1px solid ${COLOR.border}`, display: 'flex', alignItems: 'center' }}>
      <span style={labelSt}>{label}</span>
      <span style={{ fontFamily: '"Lato", sans-serif', fontSize: '15px', color: COLOR.text }}>
        {value || <span style={{ color: '#D1D5DB' }}>—</span>}
      </span>
    </div>
  )
}

function SectionCard({ children, danger = false }) {
  return (
    <div style={{
      background: COLOR.white, borderRadius: '12px', padding: '28px',
      marginBottom: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      border: danger ? `1.5px solid ${COLOR.redBorder}` : `1px solid ${COLOR.border}`,
      width: '100%', boxSizing: 'border-box',
    }}>
      {children}
    </div>
  )
}

function SkeletonBox({ height = 18, width = '100%', radius = 8 }) {
  return (
    <div style={{
      height, width, borderRadius: radius,
      background: 'linear-gradient(90deg, #EFE6D1 25%, #F7EFD9 50%, #EFE6D1 75%)',
      backgroundSize: '200% 100%', animation: 'staffDetailPulse 1.4s ease-in-out infinite',
    }} />
  )
}

const backButton = (onClick) => (
  <button
    onClick={onClick}
    style={{
      background: 'none', border: 'none', cursor: 'pointer',
      fontFamily: '"Lato", sans-serif', fontSize: '14px', fontWeight: 700,
      color: COLOR.red, padding: 0, marginBottom: '20px',
      display: 'flex', alignItems: 'center', gap: '6px',
    }}
    onMouseEnter={e => e.currentTarget.style.color = '#5C1212'}
    onMouseLeave={e => e.currentTarget.style.color = COLOR.red}
  >
    ← Back to Staff List
  </button>
)

export default function EditStaffPage() {
  const router = useRouter()
  const { id } = useParams()

  const [member,        setMember]        = useState(null)
  const [loading,       setLoading]       = useState(true)
  const [fetchError,    setFetchError]    = useState(null)
  const [toggling,      setToggling]      = useState(false)
  const [toggleError,   setToggleError]   = useState(null)
  const [showDelete,    setShowDelete]    = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [deleting,      setDeleting]      = useState(false)
  const [deleteError,   setDeleteError]   = useState(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      setFetchError(null)
      try {
        const res  = await fetch('/api/admin/staff')
        const data = await res.json()
        if (!res.ok) throw new Error(data.error ?? 'Failed to load staff')
        const found = (data.staff ?? []).find(s => s.id === id)
        if (!found) throw new Error('Staff member not found.')
        setMember(found)
      } catch (err) {
        setFetchError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  async function handleToggle() {
    setToggling(true)
    setToggleError(null)
    try {
      const res  = await fetch(`/api/admin/staff/${id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !member.is_active }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to update account')
      setMember(data.staff)
    } catch (err) {
      setToggleError(err.message)
    } finally {
      setToggling(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    setDeleteError(null)
    try {
      const res  = await fetch(`/api/admin/staff/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to delete account')
      router.push('/admin/staff')
    } catch (err) {
      setDeleteError(err.message)
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <PageWrapper>
        <style>{`
          @keyframes staffDetailPulse {
            0%   { background-position:  200% 0; }
            100% { background-position: -200% 0; }
          }
        `}</style>
        <SkeletonBox width="150px" height={18} />
        <div style={{ height: 28 }} />
        <SkeletonBox width="260px" height={42} />
        <div style={{ height: 32 }} />
        <SectionCard>
          <SkeletonBox width="170px" height={24} />
          <div style={{ height: 24 }} />
          {[1, 2, 3, 4].map(item => (
            <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '32px', borderBottom: `1px solid ${COLOR.border}`, padding: '16px 0' }}>
              <SkeletonBox width="120px" height={14} />
              <SkeletonBox width={`${220 + item * 40}px`} height={18} />
            </div>
          ))}
        </SectionCard>
        <SectionCard>
          <SkeletonBox width="160px" height={24} />
          <div style={{ height: 14 }} />
          <SkeletonBox width="75%" height={16} />
          <div style={{ height: 20 }} />
          <SkeletonBox width="170px" height={42} />
        </SectionCard>
      </PageWrapper>
    )
  }

  if (fetchError) {
    return (
      <PageWrapper>
        {backButton(() => router.push('/admin/staff'))}
        <div style={{ background: COLOR.redLight, border: `1px solid ${COLOR.redBorder}`, borderRadius: '10px', padding: '16px 20px', color: '#B91C1C', fontSize: '14px', fontFamily: '"Lato", sans-serif' }}>
          {fetchError}
        </div>
      </PageWrapper>
    )
  }

  const isAdmin     = member.role === 'ADMIN'
  const fullName    = `${member.first_name} ${member.last_name}`
  const deleteMatch = deleteConfirm.trim().toLowerCase() === fullName.toLowerCase()

  return (
    <PageWrapper>
      {backButton(() => router.push('/admin/staff'))}

      <PageHeader
        title={fullName}
        action={
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{ padding: '4px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, fontFamily: '"Lato", sans-serif', background: isAdmin ? COLOR.red : COLOR.gold, color: COLOR.white }}>
              {isAdmin ? 'Admin' : 'Staff'}
            </span>
            <span style={{ padding: '3px 12px', borderRadius: '99px', fontSize: '11px', fontWeight: 700, fontFamily: '"Lato", sans-serif', textTransform: 'uppercase', letterSpacing: '.04em', background: member.is_active ? '#DCFCE7' : '#F3F4F6', color: member.is_active ? '#166534' : COLOR.muted }}>
              {member.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
        }
      />

      <SectionCard>
        <h2 style={{ fontFamily: '"Lato", sans-serif', fontSize: '16px', fontWeight: 700, color: COLOR.text, margin: '0 0 4px' }}>Account Details</h2>
        <div style={{ marginTop: '8px' }}>
          <InfoRow label="Email"  value={member.email} />
          <InfoRow label="Phone"  value={member.phone} />
          <InfoRow label="Role"   value={member.role === 'ADMIN' ? 'Admin' : 'Staff'} />
          <InfoRow label="Joined" value={new Date(member.created_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })} />
        </div>
      </SectionCard>

      <SectionCard>
        <h2 style={{ fontFamily: '"Lato", sans-serif', fontSize: '16px', fontWeight: 700, color: COLOR.text, margin: '0 0 6px' }}>Account Status</h2>
        <p style={{ fontFamily: '"Lato", sans-serif', fontSize: '14px', color: COLOR.muted, margin: '0 0 18px' }}>
          {member.is_active
            ? 'Deactivating this account will prevent the staff member from logging in. You can reactivate it any time.'
            : "This account is currently inactive. Reactivating it will restore the staff member's access."}
        </p>
        {toggleError && (
          <div style={{ background: COLOR.redLight, border: `1px solid ${COLOR.redBorder}`, borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: '#B91C1C', fontFamily: '"Lato", sans-serif', marginBottom: '14px' }}>
            {toggleError}
          </div>
        )}
        <button
          onClick={handleToggle}
          disabled={toggling}
          style={{
            padding: '10px 24px', borderRadius: '8px', fontSize: '14px', fontWeight: 700,
            fontFamily: '"Lato", sans-serif', cursor: toggling ? 'not-allowed' : 'pointer',
            background: toggling ? '#E5DCC8' : member.is_active ? COLOR.redLight : '#DCFCE7',
            color: toggling ? COLOR.muted : member.is_active ? '#991B1B' : '#166534',
            border: `1.5px solid ${member.is_active ? COLOR.redBorder : '#BBF7D0'}`,
            transition: 'all .15s',
          }}
        >
          {toggling
            ? member.is_active ? 'Deactivating…' : 'Reactivating…'
            : member.is_active ? 'Deactivate Account' : 'Reactivate Account'}
        </button>
      </SectionCard>

      <SectionCard danger>
        <h2 style={{ fontFamily: '"Lato", sans-serif', fontSize: '16px', fontWeight: 700, color: '#B91C1C', margin: '0 0 6px' }}>Delete Account</h2>
        <p style={{ fontFamily: '"Lato", sans-serif', fontSize: '14px', color: COLOR.muted, margin: '0 0 18px' }}>
          Permanently removes this account. This cannot be undone as the staff member will lose access immediately. Use deactivation instead if this is temporary.
        </p>
        {!showDelete ? (
          <button
            onClick={() => { setShowDelete(true); setDeleteConfirm(''); setDeleteError(null) }}
            style={{ padding: '10px 24px', borderRadius: '8px', border: `1.5px solid ${COLOR.redBorder}`, background: COLOR.redLight, color: '#B91C1C', fontSize: '14px', fontWeight: 700, fontFamily: '"Lato", sans-serif', cursor: 'pointer' }}
          >
            Delete Account
          </button>
        ) : (
          <div>
            <p style={{ fontFamily: '"Lato", sans-serif', fontSize: '13px', color: COLOR.text, marginBottom: '10px' }}>
              To confirm, type <strong>{fullName}</strong> below:
            </p>
            <input
              type="text" value={deleteConfirm} onChange={e => setDeleteConfirm(e.target.value)} placeholder={fullName}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: `1.5px solid ${COLOR.border}`, fontSize: '14px', fontFamily: '"Lato", sans-serif', color: COLOR.text, background: COLOR.white, boxSizing: 'border-box', outline: 'none', marginBottom: '14px' }}
            />
            {deleteError && (
              <div style={{ background: COLOR.redLight, border: `1px solid ${COLOR.redBorder}`, borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: '#B91C1C', fontFamily: '"Lato", sans-serif', marginBottom: '14px' }}>
                {deleteError}
              </div>
            )}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleDelete} disabled={!deleteMatch || deleting}
                style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', fontSize: '14px', fontWeight: 700, fontFamily: '"Lato", sans-serif', background: !deleteMatch || deleting ? '#E5DCC8' : '#DC2626', color: !deleteMatch || deleting ? COLOR.muted : COLOR.white, cursor: !deleteMatch || deleting ? 'not-allowed' : 'pointer', transition: 'background .15s' }}
              >
                {deleting ? 'Deleting…' : 'Permanently Delete'}
              </button>
              <button
                onClick={() => { setShowDelete(false); setDeleteConfirm('') }} disabled={deleting}
                style={{ padding: '10px 20px', borderRadius: '8px', border: `1.5px solid ${COLOR.border}`, background: COLOR.sidebar, color: COLOR.text, fontSize: '14px', fontWeight: 700, fontFamily: '"Lato", sans-serif', cursor: deleting ? 'not-allowed' : 'pointer' }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </SectionCard>
    </PageWrapper>
  )
}
