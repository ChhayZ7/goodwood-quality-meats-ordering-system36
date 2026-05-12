'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'

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
  
}
// Wrapper card for each section on the page (Account Details, Status, Danger props)
function SectionCard({ children, danger = false }) {
  
}

//main edit staff page components
export default function EditStaffPage() {
  const router = useRouter()
  const { id } = useParams()

//the staff member object loaded from the API — null until data is fetched
  const [member,        setMember]        = useState(null)
//true while the page is fetching the staff member data on first load
  const [loading,       setLoading]       = useState(true)
  //store any error message from fetch
  const [fetchError,    setFetchError]    = useState(null)
  //true while the activate/deactivate PATCH request is in progress
  const [toggling,      setToggling]      = useState(false)
  //stre any error message from the activate and deactivate request
  const [toggleError,   setToggleError]   = useState(null)
  //control whether the delete confirmation input is shown
  const [showDelete,    setShowDelete]    = useState(false)
  
//tracks what the admin has typed in the delete confirmation input
  //the delete button only enables when this matches the staff member's full name
  const [deleteConfirm, setDeleteConfirm] = useState('')
  
  //true while the delete request is in progress
  const [deleting,      setDeleting]      = useState(false)
  const [deleteError,   setDeleteError]   = useState(null) //store delete error message

  //load the specific staff from the API to the page by fetch all staff then finds the one that has matching ID
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
  }



}