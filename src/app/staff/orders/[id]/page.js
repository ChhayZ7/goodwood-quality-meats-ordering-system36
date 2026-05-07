'use client'


import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

const STATUS_CONFIG = {
  CONFIRMED:   { label: 'Confirmed',        bg: '#F59E0B', color: '#fff' },
  IN_PROGRESS: { label: 'In Progress',      bg: '#3B82F6', color: '#fff' },
  READY:       { label: 'Ready for Pickup', bg: '#22C55E', color: '#fff' },
  COMPLETED:   { label: 'Completed',        bg: '#6B7280', color: '#fff' },
  CANCELLED:   { label: 'Cancelled',        bg: '#EF4444', color: '#fff' },
}

// CANCELLED intentionally excluded — staff cannot cancel orders
const STAFF_STATUSES = ['CONFIRMED', 'IN_PROGRESS', 'READY', 'COMPLETED']

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || { label: status, bg: '#6B7280', color: '#fff' }
  return <span style={{ display: 'inline-block', background: cfg.bg, color: cfg.color, fontSize: '12px', fontWeight: 700, padding: '4px 14px', borderRadius: '20px' }}>{cfg.label}</span>
}

const order = null

export default function StaffOrderDetailPage() {
  const { id } = useParams()

  // BACKEND TEAM: pre-fill these from real order data in your useEffect
  const [selectedStatus, setSelectedStatus] = useState('CONFIRMED')
  const [weights, setWeights]               = useState({})
  const [saving, setSaving]                 = useState(false)
  const [saved, setSaved]                   = useState(false)

  // Weights lock when order is Ready or Completed
  const isLocked = selectedStatus === 'READY' || selectedStatus === 'COMPLETED'

  async function handleSave() {
    setSaving(true)
    // BACKEND TEAM: replace setTimeout with real fetch:
    // await fetch(`/api/staff/orders/${id}`, {
    //   method: 'PATCH',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ status: selectedStatus, weights }),
    // })
    await new Promise(r => setTimeout(r, 700))
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const formatDate  = d => new Date(d).toLocaleDateString('en-AU', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })
  const formatCents = c => `$${(c / 100).toFixed(2)}`