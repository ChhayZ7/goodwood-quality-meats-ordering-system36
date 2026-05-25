'use client'

import { useState, useEffect, useCallback } from 'react'
// Product categories matching the database values
const CATEGORIES = ['All', 'Pork', 'Beef', 'Lamb', 'Poultry', 'Seafood', 'Other']

// Status badge colours — same as used throughout the staff portal
const STATUS_CONFIG = {
  CONFIRMED:   { label: 'Confirmed',        bg: '#F59E0B', color: '#fff' },
  IN_PROGRESS: { label: 'In Progress',      bg: '#3B82F6', color: '#fff' },
  READY:       { label: 'Ready for Pickup', bg: '#22C55E', color: '#fff' },
  COMPLETED:   { label: 'Completed',        bg: '#6B7280', color: '#fff' },
}

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || { label: status, bg: '#6B7280', color: '#fff' }
  return (
    <span style={{
      display: 'inline-block', background: cfg.bg, color: cfg.color,
      fontSize: '11px', fontWeight: 700, padding: '3px 10px',
      borderRadius: '20px', whiteSpace: 'nowrap',
    }}>
      {cfg.label}
    </span>
  )
}
// Category badge — same colour scheme as inventory page
const CATEGORY_COLOURS = {
  Pork:    { bg: '#FEE2E2', color: '#991B1B' },
  Beef:    { bg: '#FEF3C7', color: '#92400E' },
  Lamb:    { bg: '#DCFCE7', color: '#166534' },
  Poultry: { bg: '#DBEAFE', color: '#1E40AF' },
  Seafood: { bg: '#F3E8FF', color: '#7C3AED' },
  Other:   { bg: '#F3F4F6', color: '#6B7280' },
}

function CategoryBadge({ category }) {
  const cfg = CATEGORY_COLOURS[category] || CATEGORY_COLOURS['Other']
  return (
    <span style={{
      display: 'inline-block', background: cfg.bg, color: cfg.color,
      fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '10px',
    }}>
      {category}
    </span>
  )
}

// Format YYYY-MM-DD → "Mon 25 Dec 2025"
function formatDateDisplay(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-AU', {
    weekday: 'short', day: '2-digit', month: 'short', year: 'numeric',
  })
}

// Returns today's date as YYYY-MM-DD string (local time, not UTC)
function todayString() {
  const d   = new Date()
  const pad = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export default function DailyPrepPage() {
  // Default to today
  const [selectedDate, setSelectedDate] = useState(todayString)
  const [category,     setCategory]     = useState('All')
  const [data,         setData]         = useState(null)   // { orders, summary }
  const [loading,      setLoading]      = useState(false)
  const [error,        setError]        = useState(null)

  // Fetch orders whenever date or category changes
  const fetchPrep = useCallback(async (date, cat) => {
    if (!date) return
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ date })
      if (cat && cat !== 'All') params.set('category', cat)

      const res  = await fetch(`/api/staff/daily-prep?${params}`)
      const json = await res.json()

      if (!res.ok) throw new Error(json.error ?? 'Failed to load prep data')
      setData(json)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPrep(selectedDate, category)
  }, [selectedDate, category, fetchPrep])

  const orders  = data?.orders  ?? []
  const summary = data?.summary ?? []

  // Orders that have items after filtering (some orders may have no items of the selected category)
  const ordersWithItems = orders.filter(o => o.order_items.length > 0)
}