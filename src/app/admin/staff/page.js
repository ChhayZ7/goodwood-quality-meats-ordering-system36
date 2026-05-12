'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

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

export default function AdminStaffPage() {
  const router = useRouter()
  const [staff,      setStaff]      = useState([])
  const [loading,    setLoading]    = useState(true)
  const [fetchError, setFetchError] = useState(null)

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

  const COLS = '1fr 1fr 120px 110px 100px'

  return (
    <div style={{ padding: '32px', maxWidth: '1050px' }}>

      {/* Heading */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontFamily: '"Playfair Display", serif', fontSize: '26px', fontWeight: 700, color: '#1A1A1A', margin: '0 0 6px' }}>
            Staff Management
          </h1>
          <p style={{ fontFamily: '"Lato", sans-serif', fontSize: '14px', color: '#888', margin: 0 }}>
            Create and manage staff and admin accounts
          </p>
        </div>
        <button
          onClick={() => router.push('/admin/staff/new')}
          className="btn-primary"
          style={{ padding: '10px 22px', fontSize: '14px' }}
        >
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
              textAlign: i >= 4 ? 'center' : 'left',
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
            <div style={{ height: '28px', width: '60px', background: '#F3F4F6', borderRadius: '6px', margin: '0 auto' }} />
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
            <div style={{ textAlign: 'left' }}>
              <StatusBadge isActive={member.is_active} />
            </div>
            <div style={{ textAlign: 'center' }}>
              {/* Admins can still be edited (to view details), but the edit page guards deactivation */}
              <button
                onClick={() => router.push(`/admin/staff/${member.id}`)}
                style={{
                  padding: '6px 14px', borderRadius: '6px',
                  border: '1.5px solid #E5E7EB',
                  fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                  fontFamily: '"Lato", sans-serif',
                  background: '#fff', color: '#374151',
                  transition: 'border-color .15s, color .15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#C9A84C'; e.currentTarget.style.color = '#7B1A1A' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.color = '#374151' }}
              >
                Edit
              </button>
            </div>
          </div>
        ))}

        {!loading && staff.length === 0 && !fetchError && (
          <div style={{ padding: '48px', textAlign: 'center', fontFamily: '"Lato", sans-serif', fontSize: '14px', color: '#9CA3AF' }}>
            No staff accounts yet. Click "+ Create Account" to get started.
          </div>
        )}
      </div>
    </div>
  )
}