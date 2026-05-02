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

// Admin can set ALL statuses including CANCELLED
const ADMIN_STATUSES = ['CONFIRMED', 'IN_PROGRESS', 'READY', 'COMPLETED', 'CANCELLED']

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || { label: status, bg: '#6B7280', color: '#fff' }
  return <span style={{ display: 'inline-block', background: cfg.bg, color: cfg.color, fontSize: '12px', fontWeight: 700, padding: '4px 14px', borderRadius: '20px' }}>{cfg.label}</span>
}

// BACKEND TEAM: replace with useState(null) + useEffect fetch (see notes above)
const order = null

export default function AdminOrderDetailPage() {
  const { id } = useParams()

  // BACKEND TEAM: pre-fill these from real order data in your useEffect
  const [selectedStatus, setSelectedStatus] = useState('CONFIRMED')
  const [weights, setWeights]               = useState({})
  const [saving, setSaving]                 = useState(false)
  const [saved, setSaved]                   = useState(false)
  const [showCancel, setShowCancel]         = useState(false)
  const [cancelling, setCancelling]         = useState(false)

  const isLocked = selectedStatus === 'READY' || selectedStatus === 'COMPLETED'

  async function handleSave() {
    setSaving(true)
    await new Promise(r => setTimeout(r, 700))
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 3000)
  }

  async function handleCancel() {
    setCancelling(true)
    await new Promise(r => setTimeout(r, 700))
    setCancelling(false); setShowCancel(false); setSelectedStatus('CANCELLED')
  }

  const formatDate   = d => new Date(d).toLocaleDateString('en-AU', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })
  const formatSmall  = d => new Date(d).toLocaleString('en-AU', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  const formatCents  = c => `$${(c / 100).toFixed(2)}`