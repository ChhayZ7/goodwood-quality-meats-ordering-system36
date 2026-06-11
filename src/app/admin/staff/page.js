'use client'

import { useState, useEffect, useCallback } from 'react'
// useRouter lets us navigate to the new staff page or the edit page
import { useRouter } from 'next/navigation'
// PageWrapper wraps the page content with consistent padding and layout
// PageHeader renders the page title and optional action slot (used here for the Create Account button)
import PageWrapper from '@/components/dashboard/PageWrapper'
import PageHeader from '@/components/dashboard/PageHeader'

// COLOR stores all brand colours used on this page in one place
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
}

// RoleBadge renders a coloured pill showing whether the staff member is Admin or Staff
// props: role -- either 'ADMIN' or 'STAFF'
// isAdmin is true if role is 'ADMIN', false otherwise
// Admin gets dark red background, Staff gets gold background
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

// StatusBadge renders a pill showing whether the account is Active or Inactive
// props: isActive -- true or false from the database
// Active gets a green background, Inactive gets a grey background
// borderRadius 99px makes it a fully rounded pill shape
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

// SkeletonBox renders a single shimmer placeholder block shown while data is loading
// the staffPulse animation slides the gradient left to right to create the shimmer effect
function SkeletonBox({ height = 18, width = '100%', radius = 8 }) {
  return (
    <div style={{
      height, width, borderRadius: radius,
      background: 'linear-gradient(90deg, #EFE6D1 25%, #F7EFD9 50%, #EFE6D1 75%)',
      backgroundSize: '200% 100%',
      animation: 'staffPulse 1.4s ease-in-out infinite',
    }} />
  )
}

// COLS defines the grid column widths for both the header row and each data row
// 2fr 2fr gives equal wide columns for name and email
// 120px, 110px, 100px are fixed widths for role, status, and actions
const COLS = '2fr 2fr 120px 110px 100px'

// StaffTableSkeleton renders the full table skeleton shown while staff data is loading
// it mimics the shape of the real table so there is no layout shift when data arrives
function StaffTableSkeleton() {
  return (
    <>
      {/* staffPulse keyframe -- slides the gradient from right to left repeatedly */}
      <style>{`
        @keyframes staffPulse {
          0%   { background-position:  200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      {/* overflowX auto allows horizontal scrolling on small screens
          minWidth 580px prevents the table from getting too squished */}
      <div style={{ overflowX: 'auto', borderRadius: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        <div style={{ background: COLOR.white, borderRadius: '12px', overflow: 'hidden', minWidth: '580px' }}>

          {/* Skeleton header row -- 5 placeholder bars matching the 5 column headings */}
          <div style={{ display: 'grid', gridTemplateColumns: COLS, padding: '14px 28px', borderBottom: `2px solid ${COLOR.border}` }}>
            {[1, 2, 3, 4, 5].map(item => (
              <SkeletonBox key={item} height={14} width={item === 5 ? '70%' : '60%'} />
            ))}
          </div>

          {/* 5 skeleton data rows -- each row has placeholder blocks for name, email, role badge, status badge, and edit button */}
          {[1, 2, 3, 4, 5].map((row, idx) => (
            <div key={row} style={{ display: 'grid', gridTemplateColumns: COLS, padding: '16px 28px', borderBottom: idx < 4 ? `1px solid ${COLOR.border}` : 'none', alignItems: 'center' }}>
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
      </div>
    </>
  )
}

export default function AdminStaffPage() {
  const router = useRouter()

  // staff stores the list of staff members fetched from the API
  const [staff, setStaff] = useState([])

  // loading is true while the API call is in progress
  const [loading, setLoading] = useState(true)

  // fetchError stores any error message if the API call fails
  const [fetchError, setFetchError] = useState(null)

  // loadStaff fetches all staff from GET /api/admin/staff
  // wrapped in useCallback so it is not recreated on every render
  // empty dependency array [] means it is only created once
  // this lets it be safely passed to useEffect without causing infinite loops
  const loadStaff = useCallback(async () => {
    setLoading(true)
    setFetchError(null)
    try {
      const res  = await fetch('/api/admin/staff')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to load staff')
      // ?? [] means if data.staff is null or undefined, use an empty array instead
      setStaff(data.staff ?? [])
    } catch (err) {
      setFetchError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  // useEffect calls loadStaff once on mount
  // loadStaff is listed as a dependency because it is defined outside the effect
  useEffect(() => { loadStaff() }, [loadStaff])

  return (
    <PageWrapper>
      {/* PageHeader renders the title and the Create Account button as the action slot
          button only shows after loading is done and there is no fetch error */}
      <PageHeader
        title="Staff Management"
        action={
          !loading && !fetchError && (
            <button
              onClick={() => router.push('/admin/staff/new')}
              style={{ padding: '12px 28px', background: COLOR.red, border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 700, fontFamily: '"Lato", sans-serif', color: COLOR.white, cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.background = '#5C1212'}
              onMouseLeave={e => e.currentTarget.style.background = COLOR.red}
            >
              + Create Account
            </button>
          )
        }
      />

      {/* Skeleton -- shown while loading is true */}
      {loading && <StaffTableSkeleton />}

      {/* Error banner -- shown if loadStaff failed
          includes a retry button that calls loadStaff again */}
      {fetchError && (
        <div style={{ background: COLOR.redLight, border: `1px solid ${COLOR.redBorder}`, borderRadius: '10px', padding: '16px 20px', color: '#B91C1C', fontSize: '14px', marginBottom: '24px' }}>
          {fetchError}{' '}
          <button onClick={loadStaff} style={{ background: 'none', border: 'none', color: COLOR.red, cursor: 'pointer', textDecoration: 'underline', fontSize: '14px', padding: 0 }}>
            retry
          </button>
        </div>
      )}

      {/* Table -- only renders when loading is done and there is no fetch error */}
      {!loading && !fetchError && (
        <div style={{ overflowX: 'auto', borderRadius: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <div style={{ background: COLOR.white, borderRadius: '12px', overflow: 'hidden', minWidth: '580px' }}>

            {/* Table header row -- maps over column names to render each heading
                last column (Actions) is centre aligned, all others are left aligned
                i === 4 checks if it is the 5th column (index 4) to apply centre alignment */}
            <div style={{ display: 'grid', gridTemplateColumns: COLS, padding: '14px 28px', borderBottom: `2px solid ${COLOR.border}` }}>
              {['Name', 'Email', 'Role', 'Status', 'Actions'].map((h, i) => (
                <span key={h} style={{ fontSize: '13px', fontWeight: 700, color: COLOR.muted, textTransform: 'uppercase', letterSpacing: '.06em', textAlign: i === 4 ? 'center' : 'left' }}>
                  {h}
                </span>
              ))}
            </div>

            {/* Empty state -- shown if the API returned no staff members yet */}
            {staff.length === 0 && (
              <div style={{ padding: '48px', textAlign: 'center', color: COLOR.muted, fontSize: '14px' }}>
                No staff accounts yet. Click &ldquo;+ Create Account&rdquo; to get started.
              </div>
            )}

            {/* Staff rows -- one row per staff member
                key uses member.id as the unique identifier
                opacity 0.6 on inactive accounts makes them visually dimmed
                borderBottom is skipped on the last row (idx < staff.length - 1)
                onMouseEnter and onMouseLeave give a subtle cream hover effect */}
            {staff.map((member, idx) => (
              <div
                key={member.id}
                style={{ display: 'grid', gridTemplateColumns: COLS, padding: '16px 28px', borderBottom: idx < staff.length - 1 ? `1px solid ${COLOR.border}` : 'none', alignItems: 'center', opacity: member.is_active ? 1 : 0.6, transition: 'background .1s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#FDFAF3'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                {/* Full name from first_name and last_name fields */}
                <span style={{ fontSize: '15px', fontWeight: 600, color: COLOR.text }}>
                  {member.first_name} {member.last_name}
                </span>

                <span style={{ fontSize: '14px', color: COLOR.muted }}>{member.email}</span>

                {/* RoleBadge shows Admin or Staff in a coloured pill */}
                <RoleBadge role={member.role} />

                {/* StatusBadge shows Active or Inactive based on is_active from the database */}
                <StatusBadge isActive={member.is_active} />

                {/* Edit button -- navigates to /admin/staff/[id] */}
                <div style={{ textAlign: 'center' }}>
                  <button
                    onClick={() => router.push(`/admin/staff/${member.id}`)}
                    style={{ padding: '7px 20px', border: `1.5px solid ${COLOR.red}`, borderRadius: '8px', background: 'transparent', color: COLOR.red, fontSize: '13px', fontWeight: 700, fontFamily: '"Lato", sans-serif', cursor: 'pointer', transition: 'all .12s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = COLOR.red; e.currentTarget.style.color = COLOR.white }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = COLOR.red }}
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </PageWrapper>
  )
}