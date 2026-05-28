'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
 
const COLOR = {
  red:       '#7B1A1A',
  redLight:  '#FEF2F2',
  redBorder: '#FECACA',
  cream:     '#FAF3E0',
  gold:      '#C9A84C',
  text:      '#1A1A1A',
  muted:     '#6B7280',
  border:    '#E5DCC8',
  white:     '#FFFFFF',
  sidebar:   '#F5EDD8',
}
 
function RoleBadge({ role }) {
  const isAdmin = role === 'ADMIN'
  return (
    <span style={{
      display: 'inline-block', padding: '4px 12px', borderRadius: '6px',
      fontSize: '12px', fontWeight: 700, fontFamily: '"Lato", sans-serif',
      background: isAdmin ? COLOR.red : COLOR.gold, color: COLOR.white,
    }}>
      {isAdmin ? 'Admin' : 'Staff'}
    </span>
  )
}
 
function StatusBadge({ isActive }) {
  return (
    <span style={{
      display: 'inline-block', padding: '3px 10px', borderRadius: '99px',
      fontSize: '11px', fontWeight: 700, fontFamily: '"Lato", sans-serif',
      textTransform: 'uppercase', letterSpacing: '.04em',
      background: isActive ? '#DCFCE7' : '#F3F4F6',
      color: isActive ? '#166534' : COLOR.muted,
    }}>
      {isActive ? 'Active' : 'Inactive'}
    </span>
  )
}

function SkeletonBox({ height = 18, width = '100%', radius = 8 }) {
  return (
    <div
      style={{
        height,
        width,
        borderRadius: radius,
        background:
          'linear-gradient(90deg, #EFE6D1 25%, #F7EFD9 50%, #EFE6D1 75%)',
        backgroundSize: '200% 100%',
        animation: 'staffPulse 1.4s ease-in-out infinite',
      }}
    />
  )
}

function StaffTableSkeleton() {
  return (
    <>
      <style>
        {`
          @keyframes staffPulse {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
        `}
      </style>

      <div
        style={{
          background: COLOR.white,
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        }}
      >
        {/* Skeleton table header */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: COLS,
            padding: '14px 28px',
            borderBottom: `2px solid ${COLOR.border}`,
          }}
        >
          {[1, 2, 3, 4, 5].map(item => (
            <SkeletonBox
              key={`header-skeleton-${item}`}
              height={14}
              width={item === 5 ? '70%' : '60%'}
            />
          ))}
        </div>

        {/* Skeleton rows */}
        {[1, 2, 3, 4, 5].map((row, idx) => (
          <div
            key={`staff-skeleton-row-${row}`}
            style={{
              display: 'grid',
              gridTemplateColumns: COLS,
              padding: '16px 28px',
              borderBottom: idx < 4 ? `1px solid ${COLOR.border}` : 'none',
              alignItems: 'center',
            }}
          >
            <SkeletonBox height={18} width="70%" />
            <SkeletonBox height={16} width="85%" />
            <SkeletonBox height={24} width="70px" radius={6} />
            <SkeletonBox height={22} width="78px" radius={99} />
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <SkeletonBox height={34} width="72px" radius={8} />
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
 
const COLS = '2fr 2fr 120px 110px 100px'
 
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
 
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: COLOR.cream, fontFamily: '"Lato", sans-serif' }}>
      <main style={{ flex: 1, padding: '40px 48px', overflowY: 'auto' }}>
 
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
          <h1 style={{ fontFamily: '"Lato", serif', fontSize: '36px', fontWeight: 700, color: COLOR.red, margin: 0 }}>
            Staff Management
          </h1>
          {!loading && !fetchError && (
            <button
              onClick={() => router.push('/admin/staff/new')}
              style={{
                padding: '12px 28px',
                background: COLOR.red,
                border: 'none',
                borderRadius: '10px',
                fontSize: '15px',
                fontWeight: 700,
                fontFamily: '"Lato", sans-serif',
                color: COLOR.white,
                cursor: 'pointer',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#5C1212'}
              onMouseLeave={e => e.currentTarget.style.background = COLOR.red}
            >
              + Create Account
            </button>
          )}
        </div>
 
        {/* Gold divider */}
        <div style={{ height: '2px', background: `linear-gradient(90deg, ${COLOR.gold}, transparent)`, marginBottom: '40px', borderRadius: '1px' }} />
 
        {/* Loading skeleton */}
        {loading && <StaffTableSkeleton />}
 
        {/* Error */}
        {fetchError && (
          <div style={{ background: COLOR.redLight, border: `1px solid ${COLOR.redBorder}`, borderRadius: '10px', padding: '16px 20px', color: '#B91C1C', fontSize: '14px', marginBottom: '24px' }}>
            {fetchError} —{' '}
            <button
              onClick={loadStaff}
              style={{ background: 'none', border: 'none', color: COLOR.red, cursor: 'pointer', textDecoration: 'underline', fontSize: '14px', padding: 0 }}
            >
              retry
            </button>
          </div>
        )}
 
        {/* Table */}
        {!loading && !fetchError && (
          <div style={{ background: COLOR.white, borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
 
            {/* Table header */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: COLS,
              padding: '14px 28px',
              borderBottom: `2px solid ${COLOR.border}`,
            }}>
              {['Name', 'Email', 'Role', 'Status', 'Actions'].map((h, i) => (
                <span key={h} style={{
                  fontSize: '13px', fontWeight: 700, color: COLOR.muted,
                  textTransform: 'uppercase', letterSpacing: '.06em',
                  textAlign: i === 4 ? 'center' : 'left',
                }}>
                  {h}
                </span>
              ))}
            </div>
 
            {/* Empty state */}
            {staff.length === 0 && (
              <div style={{ padding: '48px', textAlign: 'center', color: COLOR.muted, fontSize: '14px' }}>
                No staff accounts yet. Click &ldquo;+ Create Account&rdquo; to get started.
              </div>
            )}
 
            {/* Rows */}
            {staff.map((member, idx) => (
              <div
                key={member.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: COLS,
                  padding: '16px 28px',
                  borderBottom: idx < staff.length - 1 ? `1px solid ${COLOR.border}` : 'none',
                  alignItems: 'center',
                  opacity: member.is_active ? 1 : 0.6,
                  transition: 'background .1s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#FDFAF3'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                {/* Name */}
                <span style={{ fontSize: '15px', fontWeight: 600, color: COLOR.text }}>
                  {member.first_name} {member.last_name}
                </span>
 
                {/* Email */}
                <span style={{ fontSize: '14px', color: COLOR.muted }}>{member.email}</span>
 
                {/* Role */}
                <RoleBadge role={member.role} />
 
                {/* Status */}
                <StatusBadge isActive={member.is_active} />
 
                {/* Edit button */}
                <div style={{ textAlign: 'center' }}>
                  <button
                    onClick={() => router.push(`/admin/staff/${member.id}`)}
                    style={{
                      padding: '7px 20px',
                      border: `1.5px solid ${COLOR.red}`,
                      borderRadius: '8px',
                      background: 'transparent',
                      color: COLOR.red,
                      fontSize: '13px',
                      fontWeight: 700,
                      fontFamily: '"Lato", sans-serif',
                      cursor: 'pointer',
                      transition: 'all .12s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = COLOR.red; e.currentTarget.style.color = COLOR.white }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = COLOR.red }}
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}