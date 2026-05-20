'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'

const COLOR = {
  red: '#7B1A1A',
  redLight: '#FEF2F2',
  redBorder: '#FECACA',
  cream: '#FAF3E0',
  gold: '#C9A84C',
  text: '#1A1A1A',
  muted: '#6B7280',
  border: '#E5DCC8',
  white: '#FFFFFF',
  sidebar: '#F5EDD8',
}

const labelSt = {
  fontFamily: '"Lato", sans-serif',
  fontSize: '12px',
  fontWeight: 700,
  color: '#9CA3AF',
  textTransform: 'uppercase',
  letterSpacing: '.06em',
  width: '120px',
  flexShrink: 0,
}

// Displays a single label-value pair in the account details section
function InfoRow({ label, value }) {
  return (
    <div style={{ padding: '14px 0', borderBottom: `1px solid ${COLOR.border}`, display: 'flex', alignItems: 'center' }}>
      <span style={labelSt}>{label}</span>
      <span style={{ fontFamily: '"Lato", sans-serif', fontSize: '15px', color: COLOR.text }}>
        {value || <span style={{ color: '#D1D5DB' }}>—</span>}
      </span>
    </div>
  )
}
// Wrapper card for each section on the page (Account Details, Status, Danger props)
function SectionCard({ children, danger = false }) {
  return (
    <div style={{
      background: COLOR.white,
      borderRadius: '12px',
      padding: '28px',
      marginBottom: '20px',
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      border: danger ? `1.5px solid ${COLOR.redBorder}` : 'none',
    }}>
      {children}
    </div>
  )
}

//main edit staff page components
export default function EditStaffPage() {
  const router = useRouter()
  const { id } = useParams()

  //the staff member object loaded from the API — null until data is fetched
  const [member, setMember] = useState(null)
  //true while the page is fetching the staff member data on first load
  const [loading, setLoading] = useState(true)
  //store any error message from fetch
  const [fetchError, setFetchError] = useState(null)
  //true while the activate/deactivate PATCH request is in progress
  const [toggling, setToggling] = useState(false)
  //stre any error message from the activate and deactivate request
  const [toggleError, setToggleError] = useState(null)
  //control whether the delete confirmation input is shown
  const [showDelete, setShowDelete] = useState(false)

  //tracks what the admin has typed in the delete confirmation input
  //the delete button only enables when this matches the staff member's full name
  const [deleteConfirm, setDeleteConfirm] = useState('')

  //true while the delete request is in progress
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState(null) //store delete error message

  //load the specific staff from the API to the page by fetch all staff then finds the one that has matching ID
  useEffect(() => {
    async function load() {
      setLoading(true)
      setFetchError(null)
      try {
        const res = await fetch('/api/admin/staff')
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

  //handle activating and deactivating, moved from main staff list before
  async function handleToggle() {
    setToggling(true)
    setToggleError(null)
    try {
      const res = await fetch(`/api/admin/staff/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
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

  //handle delete a staff function 
  //send a DELETE request to permanently remove the staff account
  //if success, redirectto staff list, 
  //only work after the admin types the staff member's full name to confirm
  async function handleDelete() {
    setDeleting(true)
    setDeleteError(null)
    try {
      const res = await fetch(`/api/admin/staff/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to delete account')
      router.push('/admin/staff')
    } catch (err) {
      setDeleteError(err.message)
      setDeleting(false)
    }
  }

 //if the fetching process still happening, display the skeleton, if loading false, not loading anymore, show real page
  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: COLOR.cream }}>
        <main style={{ flex: 1, padding: '40px 48px' }}>
          <div style={{ maxWidth: '600px' }}>
            <div style={{ height: '16px', width: '120px', background: '#E5DCC8', borderRadius: '4px', marginBottom: '24px' }} />
            <div style={{ height: '40px', width: '260px', background: '#E5DCC8', borderRadius: '6px', marginBottom: '32px' }} />
            <div style={{ background: COLOR.white, borderRadius: '12px', padding: '28px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} style={{ height: '14px', background: '#F3F4F6', borderRadius: '4px', marginBottom: '20px', width: `${55 + i * 10}%` }} />
              ))}
            </div>
          </div>
        </main>
      </div>
    )
  }

  //if API call failed and sent an erro message, return a simple erro screen with a back button instead of real page
  if (fetchError) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: COLOR.cream }}>
        <main style={{ flex: 1, padding: '40px 48px' }}>
          <button onClick={() => router.push('/admin/staff')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: '"Lato", sans-serif', fontSize: '14px', color: COLOR.muted, padding: 0, marginBottom: '20px' }}>
            ← Back to Staff List
          </button>
          <div style={{ background: COLOR.redLight, border: `1px solid ${COLOR.redBorder}`, borderRadius: '10px', padding: '16px 20px', color: '#B91C1C', fontSize: '14px', fontFamily: '"Lato", sans-serif' }}>
            {fetchError}
          </div>
        </main>
      </div>
    )
  }

  const isAdmin = member.role === 'ADMIN'
  const fullName = `${member.first_name} ${member.last_name}`
  const deleteMatch = deleteConfirm.trim().toLowerCase() === fullName.toLowerCase()

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: COLOR.cream, fontFamily: '"Lato", sans-serif' }}>
      <main style={{ flex: 1, padding: '40px 48px', overflowY: 'auto' }}>
        <div style={{ maxWidth: '600px' }}>

          {/* Back to the staff list link */}
          <button
            onClick={() => router.push('/admin/staff')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: '"Lato", sans-serif', fontSize: '14px', color: COLOR.muted, padding: 0, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '6px' }}
            onMouseEnter={e => e.currentTarget.style.color = COLOR.red}
            onMouseLeave={e => e.currentTarget.style.color = COLOR.muted}
          >
            ← Back to Staff List
          </button>

          {/* Heading */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '32px', flexWrap: 'wrap' }}>
            <h1 style={{ fontFamily: '"Lato", serif', fontSize: '36px', fontWeight: 700, color: COLOR.red, margin: 0 }}>
              {fullName}
            </h1>

            {/* Role badge */}
            <span style={{
              padding: '4px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 700,
              fontFamily: '"Lato", sans-serif',
              background: isAdmin ? COLOR.red : COLOR.gold, color: COLOR.white,
            }}>
              {isAdmin ? 'Admin' : 'Staff'}
            </span>
            {/* Status badge */}
            <span style={{
              padding: '3px 10px', borderRadius: '99px', fontSize: '11px', fontWeight: 700,
              fontFamily: '"Lato", sans-serif', textTransform: 'uppercase', letterSpacing: '.04em',
              background: member.is_active ? '#DCFCE7' : '#F3F4F6',
              color: member.is_active ? '#166534' : COLOR.muted,
            }}>
              {member.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
          {/* Gold divider */}
          <div style={{ height: '2px', background: `linear-gradient(90deg, ${COLOR.gold}, transparent)`, marginBottom: '28px', borderRadius: '1px' }} />

          {/* Account details */}
          <SectionCard>
            <h2 style={{ fontFamily: '"Lato", sans-serif', fontSize: '16px', fontWeight: 700, color: COLOR.text, margin: '0 0 4px' }}>
              Account Details
            </h2>
            <div style={{ marginTop: '8px' }}>
              <InfoRow label="Email" value={member.email} />
              <InfoRow label="Phone" value={member.phone} />
              <InfoRow label="Role" value={member.role === 'ADMIN' ? 'Admin' : 'Staff'} />
              <InfoRow label="Joined" value={new Date(member.created_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })} />
            </div>
          </SectionCard>

          {/*Activate and Deactivate status */}
            <SectionCard>
              <h2 style={{ fontFamily: '"Lato", sans-serif', fontSize: '16px', fontWeight: 700, color: COLOR.text, margin: '0 0 6px' }}>
                Account Status
              </h2>
              <p style={{ fontFamily: '"Lato", sans-serif', fontSize: '14px', color: COLOR.muted, margin: '0 0 18px' }}>
                {member.is_active
                  ? 'Deactivating this account will prevent the staff member from logging in. You can reactivate it any time.'
                  : 'This account is currently inactive. Reactivating it will restore the staff member\'s access.'}
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
                  padding: '10px 24px', borderRadius: '8px', border: 'none',
                  fontSize: '14px', fontWeight: 700, fontFamily: '"Lato", sans-serif',
                  cursor: toggling ? 'not-allowed' : 'pointer',
                  background: toggling
                    ? '#E5DCC8'
                    : member.is_active ? COLOR.redLight : '#DCFCE7',
                  color: toggling
                    ? COLOR.muted
                    : member.is_active ? '#991B1B' : '#166534',
                  border: `1.5px solid ${member.is_active ? COLOR.redBorder : '#BBF7D0'}`,
                  transition: 'all .15s',
                }}
              >
                {toggling
                  ? (member.is_active ? 'Deactivating…' : 'Reactivating…')
                  : (member.is_active ? 'Deactivate Account' : 'Reactivate Account')}
              </button>
            </SectionCard>
          

          {/*Prop to warn if admin want to delete an account */}

          <SectionCard danger>
            <h2 style={{ fontFamily: '"Lato", sans-serif', fontSize: '16px', fontWeight: 700, color: '#B91C1C', margin: '0 0 6px' }}>
              Delete Account
            </h2>
            <p style={{ fontFamily: '"Lato", sans-serif', fontSize: '14px', color: COLOR.muted, margin: '0 0 18px' }}>
              Permanently removes this account. This cannot be undone as the staff member will lose access immediately.
              Use deactivation instead if this is temporary for a short period of time.
            </p>
 
            {!showDelete ? (
              <button
                onClick={() => { setShowDelete(true); setDeleteConfirm(''); setDeleteError(null) }}
                style={{
                  padding: '10px 24px', borderRadius: '8px',
                  border: `1.5px solid ${COLOR.redBorder}`,
                  background: COLOR.redLight, color: '#B91C1C',
                  fontSize: '14px', fontWeight: 700, fontFamily: '"Lato", sans-serif',
                  cursor: 'pointer',
                }}
              >
                Delete Account
              </button>
            ) : (
              <div>
                <p style={{ fontFamily: '"Lato", sans-serif', fontSize: '13px', color: COLOR.text, marginBottom: '10px' }}>
                  To confirm, type <strong>{fullName}</strong> below:
                </p>
                <input
                  type="text"
                  value={deleteConfirm}
                  onChange={e => setDeleteConfirm(e.target.value)}
                  placeholder={fullName}
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: '8px',
                    border: `1.5px solid ${COLOR.border}`, fontSize: '14px',
                    fontFamily: '"Lato", sans-serif', color: COLOR.text,
                    background: COLOR.white, boxSizing: 'border-box',
                    outline: 'none', marginBottom: '14px',
                  }}
                />
 
                {deleteError && (
                  <div style={{ background: COLOR.redLight, border: `1px solid ${COLOR.redBorder}`, borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: '#B91C1C', fontFamily: '"Lato", sans-serif', marginBottom: '14px' }}>
                    {deleteError}
                  </div>
                )}
 
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={handleDelete}
                    disabled={!deleteMatch || deleting}
                    style={{
                      padding: '10px 24px', borderRadius: '8px', border: 'none',
                      fontSize: '14px', fontWeight: 700, fontFamily: '"Lato", sans-serif',
                      background: !deleteMatch || deleting ? '#E5DCC8' : '#DC2626',
                      color: !deleteMatch || deleting ? COLOR.muted : COLOR.white,
                      cursor: !deleteMatch || deleting ? 'not-allowed' : 'pointer',
                      transition: 'background .15s',
                    }}
                  >
                    {deleting ? 'Deleting…' : 'Permanently Delete'}
                  </button>
                  <button
                    onClick={() => { setShowDelete(false); setDeleteConfirm('') }}
                    disabled={deleting}
                    style={{
                      padding: '10px 20px', borderRadius: '8px',
                      border: `1.5px solid ${COLOR.border}`,
                      background: COLOR.sidebar, color: COLOR.text,
                      fontSize: '14px', fontWeight: 700, fontFamily: '"Lato", sans-serif',
                      cursor: deleting ? 'not-allowed' : 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </SectionCard>
 
        </div>
      </main>
    </div>
  )
}