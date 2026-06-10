'use client'

import { useState, useEffect } from 'react'
// useRouter for navigation, useParams reads the dynamic [id] from the URL
import { useRouter, useParams } from 'next/navigation'
import PageWrapper from '@/components/dashboard/PageWrapper'
import PageHeader from '@/components/dashboard/PageHeader'

const COLOR = {
  red: '#7B1A1A', redLight: '#FEF2F2', redBorder: '#FECACA',
  cream: '#FAF3E0', gold: '#C9A84C', text: '#1A1A1A',
  muted: '#6B7280', border: '#E5DCC8', white: '#FFFFFF', sidebar: '#F5EDD8',
}

// labelSt is the shared style for the small uppercase grey labels in each InfoRow
// width 150px and flexShrink 0 keeps the label column a fixed width so values line up
const labelSt = {
  fontFamily: '"Lato", sans-serif', fontSize: '12px', fontWeight: 700,
  color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '.06em',
  width: '150px', flexShrink: 0,
}

// InfoRow renders a single label and value pair in the Account Details card
// props: label -- the field name, value -- the field value from the database
// if value is empty, shows a grey dash placeholder instead
function InfoRow({ label, value }) {
  return (
    <div style={{ padding: '16px 0', borderBottom: `1px solid ${COLOR.border}`, display: 'flex', alignItems: 'center' }}>
      <span style={labelSt}>{label}</span>
      <span style={{ fontFamily: '"Lato", sans-serif', fontSize: '15px', color: COLOR.text }}>
        {/* if value is falsy (empty or null), show a grey dash instead */}
        {value || <span style={{ color: '#D1D5DB' }}>--</span>}
      </span>
    </div>
  )
}

// SectionCard is a white rounded card used to group related content
// props: children -- content inside the card, danger -- if true adds a red border (used for Delete section)
function SectionCard({ children, danger = false }) {
  return (
    <div style={{
      background: COLOR.white, borderRadius: '12px', padding: '28px',
      marginBottom: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      // danger true gets a red border to signal a destructive action section
      border: danger ? `1.5px solid ${COLOR.redBorder}` : `1px solid ${COLOR.border}`,
      width: '100%', boxSizing: 'border-box',
    }}>
      {children}
    </div>
  )
}

// SkeletonBox renders a shimmer placeholder block shown while data is loading
function SkeletonBox({ height = 18, width = '100%', radius = 8 }) {
  return (
    <div style={{
      height, width, borderRadius: radius,
      background: 'linear-gradient(90deg, #EFE6D1 25%, #F7EFD9 50%, #EFE6D1 75%)',
      backgroundSize: '200% 100%', animation: 'staffDetailPulse 1.4s ease-in-out infinite',
    }} />
  )
}

// backButton is a helper function that returns a styled back button
// defined as a function (not a component) so it can be called directly in JSX
// props: onClick -- the function to call when clicked
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

export default function EditStaffPage() {
  const router = useRouter()
  // id comes from the URL e.g. /admin/staff/123 gives id = '123'
  const { id } = useParams()

  // member stores the staff member object fetched from the API
  const [member, setMember] = useState(null)

  // loading is true while the initial fetch is in progress
  const [loading, setLoading] = useState(true)

  // fetchError stores any error from the initial fetch
  const [fetchError, setFetchError] = useState(null)

  // toggling is true while the activate/deactivate API call is in progress
  const [toggling, setToggling] = useState(false)

  // toggleError stores any error from the activate/deactivate call
  const [toggleError, setToggleError] = useState(null)

  // showDelete controls whether the delete confirmation section is visible
  const [showDelete, setShowDelete] = useState(false)

  // deleteConfirm stores what the admin has typed in the confirmation input
  const [deleteConfirm, setDeleteConfirm] = useState('')

  // deleting is true while the delete API call is in progress
  const [deleting, setDeleting] = useState(false)

  // deleteError stores any error from the delete call
  const [deleteError, setDeleteError] = useState(null)

  // useEffect runs on mount and when id changes
  // fetches all staff from GET /api/admin/staff then finds the one matching the current id
  // we fetch all staff and filter client-side because there is no dedicated single-staff endpoint
  useEffect(() => {
    async function load() {
      setLoading(true)
      setFetchError(null)
      try {
        const res  = await fetch('/api/admin/staff')
        const data = await res.json()
        if (!res.ok) throw new Error(data.error ?? 'Failed to load staff')
        // .find() searches the array for the staff member whose id matches the URL id
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

  // handleToggle sends a PATCH request to /api/admin/staff/[id] to flip the is_active value
  // !member.is_active flips the current value -- if active, send false to deactivate, and vice versa
  // on success, updates the member state with the new data returned from the API
  async function handleToggle() {
    setToggling(true)
    setToggleError(null)
    try {
      const res  = await fetch(`/api/admin/staff/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !member.is_active }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to update account')
      // update member state with the fresh data returned from the API
      setMember(data.staff)
    } catch (err) {
      setToggleError(err.message)
    } finally {
      setToggling(false)
    }
  }

  // handleDelete sends a DELETE request to /api/admin/staff/[id] to permanently remove the account
  // on success, navigates back to the staff list
  // on failure, shows the error and stops the deleting spinner
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

  // Loading state -- shows skeleton while fetching staff data
  if (loading) {
    return (
      <PageWrapper>
        {/* staffDetailPulse keyframe for the shimmer animation */}
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
        {/* Account Details card skeleton -- 4 rows matching email, phone, role, joined */}
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
        {/* Account Status card skeleton */}
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

  // Error state -- shown if the initial fetch failed
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

  // isAdmin is true if this staff member has the ADMIN role
  const isAdmin = member.role === 'ADMIN'

  // fullName combines first and last name for display and delete confirmation
  const fullName = `${member.first_name} ${member.last_name}`

  // deleteMatch is true when what the admin typed matches the full name (case insensitive)
  // .trim() removes leading/trailing spaces, .toLowerCase() makes it case insensitive
  // the Delete button stays disabled until deleteMatch is true
  const deleteMatch = deleteConfirm.trim().toLowerCase() === fullName.toLowerCase()

  return (
    <PageWrapper>
      {backButton(() => router.push('/admin/staff'))}

      {/* PageHeader shows the staff member's full name as the title
          action slot shows role badge and status badge side by side */}
      <PageHeader
        title={fullName}
        action={
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* Role badge -- red for Admin, gold for Staff */}
            <span style={{ padding: '4px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, fontFamily: '"Lato", sans-serif', background: isAdmin ? COLOR.red : COLOR.gold, color: COLOR.white }}>
              {isAdmin ? 'Admin' : 'Staff'}
            </span>
            {/* Status badge -- green for Active, grey for Inactive */}
            <span style={{ padding: '3px 12px', borderRadius: '99px', fontSize: '11px', fontWeight: 700, fontFamily: '"Lato", sans-serif', textTransform: 'uppercase', letterSpacing: '.04em', background: member.is_active ? '#DCFCE7' : '#F3F4F6', color: member.is_active ? '#166534' : COLOR.muted }}>
              {member.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
        }
      />

      {/* ACCOUNT DETAILS CARD
          shows email, phone, role, and the date the account was created
          toLocaleDateString formats the date as a readable Australian date e.g. "1 January 2025" */}
      <SectionCard>
        <h2 style={{ fontFamily: '"Lato", sans-serif', fontSize: '16px', fontWeight: 700, color: COLOR.text, margin: '0 0 4px' }}>Account Details</h2>
        <div style={{ marginTop: '8px' }}>
          <InfoRow label="Email"  value={member.email} />
          <InfoRow label="Phone"  value={member.phone} />
          <InfoRow label="Role"   value={member.role === 'ADMIN' ? 'Admin' : 'Staff'} />
          <InfoRow label="Joined" value={new Date(member.created_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })} />
        </div>
      </SectionCard>

      {/* ACCOUNT STATUS CARD
          description text changes depending on whether the account is currently active
          toggle button calls handleToggle which sends PATCH to /api/admin/staff/[id]
          button text and colour change based on current status and toggling state
          cursor not-allowed shows while toggling is in progress */}
      <SectionCard>
        <h2 style={{ fontFamily: '"Lato", sans-serif', fontSize: '16px', fontWeight: 700, color: COLOR.text, margin: '0 0 6px' }}>Account Status</h2>
        <p style={{ fontFamily: '"Lato", sans-serif', fontSize: '14px', color: COLOR.muted, margin: '0 0 18px' }}>
          {member.is_active
            ? 'Deactivating this account will prevent the staff member from logging in. You can reactivate it any time.'
            : "This account is currently inactive. Reactivating it will restore the staff member's access."}
        </p>
        {/* Error banner -- shown if the toggle API call failed */}
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
            // background and text colour change based on active status and toggling state
            background: toggling ? '#E5DCC8' : member.is_active ? COLOR.redLight : '#DCFCE7',
            color: toggling ? COLOR.muted : member.is_active ? '#991B1B' : '#166534',
            border: `1.5px solid ${member.is_active ? COLOR.redBorder : '#BBF7D0'}`,
            transition: 'all .15s',
          }}
        >
          {/* button text has 4 possible states -- toggling active, toggling inactive, deactivate, reactivate */}
          {toggling
            ? member.is_active ? 'Deactivating...' : 'Reactivating...'
            : member.is_active ? 'Deactivate Account' : 'Reactivate Account'}
        </button>
      </SectionCard>

      {/* DELETE ACCOUNT CARD
          danger prop adds a red border to the SectionCard to signal this is destructive
          two states: before confirmation (shows Delete Account button) and after (shows confirmation input)
          admin must type the staff member's full name exactly before the delete button becomes active
          deleteMatch checks the typed input against fullName (case insensitive)
          Permanently Delete button is disabled until deleteMatch is true and deleting is false */}
      <SectionCard danger>
        <h2 style={{ fontFamily: '"Lato", sans-serif', fontSize: '16px', fontWeight: 700, color: '#B91C1C', margin: '0 0 6px' }}>Delete Account</h2>
        <p style={{ fontFamily: '"Lato", sans-serif', fontSize: '14px', color: COLOR.muted, margin: '0 0 18px' }}>
          Permanently removes this account. This cannot be undone as the staff member will lose access immediately. Use deactivation instead if this is temporary.
        </p>

        {/* Before confirmation -- shows a single Delete Account button
            clicking it sets showDelete to true and resets the input and error */}
        {!showDelete ? (
          <button
            onClick={() => { setShowDelete(true); setDeleteConfirm(''); setDeleteError(null) }}
            style={{ padding: '10px 24px', borderRadius: '8px', border: `1.5px solid ${COLOR.redBorder}`, background: COLOR.redLight, color: '#B91C1C', fontSize: '14px', fontWeight: 700, fontFamily: '"Lato", sans-serif', cursor: 'pointer' }}
          >
            Delete Account
          </button>
        ) : (
          // After clicking Delete Account -- shows the name confirmation input and action buttons
          <div>
            <p style={{ fontFamily: '"Lato", sans-serif', fontSize: '13px', color: COLOR.text, marginBottom: '10px' }}>
              To confirm, type <strong>{fullName}</strong> below:
            </p>

            {/* Confirmation input -- admin must type the full name exactly to unlock the delete button
                setErrors uses the spread pattern p => ({ ...p, ... }) to only clear the relevant field */}
            <input
              type="text"
              value={deleteConfirm}
              onChange={e => setDeleteConfirm(e.target.value)}
              placeholder={fullName}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: `1.5px solid ${COLOR.border}`, fontSize: '14px', fontFamily: '"Lato", sans-serif', color: COLOR.text, background: COLOR.white, boxSizing: 'border-box', outline: 'none', marginBottom: '14px' }}
            />

            {/* Delete error banner -- shown if the delete API call failed */}
            {deleteError && (
              <div style={{ background: COLOR.redLight, border: `1px solid ${COLOR.redBorder}`, borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: '#B91C1C', fontFamily: '"Lato", sans-serif', marginBottom: '14px' }}>
                {deleteError}
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px' }}>
              {/* Permanently Delete button -- disabled until deleteMatch is true
                  background and text colour are grey when disabled, red when enabled */}
              <button
                onClick={handleDelete}
                disabled={!deleteMatch || deleting}
                style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', fontSize: '14px', fontWeight: 700, fontFamily: '"Lato", sans-serif', background: !deleteMatch || deleting ? '#E5DCC8' : '#DC2626', color: !deleteMatch || deleting ? COLOR.muted : COLOR.white, cursor: !deleteMatch || deleting ? 'not-allowed' : 'pointer', transition: 'background .15s' }}
              >
                {deleting ? 'Deleting...' : 'Permanently Delete'}
              </button>

              {/* Cancel button -- hides the confirmation section and resets the input
                  disabled while deleting is true to prevent state changes mid-request */}
              <button
                onClick={() => { setShowDelete(false); setDeleteConfirm('') }}
                disabled={deleting}
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