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
    return (
    <div style={{ padding: '32px', maxWidth: '1000px' }}>

      <div style={{ marginBottom: '28px' }}>
        <h1 style={{
          fontFamily: '"Playfair Display", serif',
          fontSize:   '26px',
          fontWeight: 700,
          color:      '#1A1A1A',
          margin:     '0 0 6px',
        }}>
          Daily Prep
        </h1>
        <p style={{ fontFamily: '"Lato", sans-serif', fontSize: '14px', color: '#888', margin: 0 }}>
          Select a date to see all orders and their items for that day
        </p>
      </div>

      
      <div style={{
        display:      'flex',
        alignItems:   'flex-end',
        gap:          '16px',
        marginBottom: '24px',
        flexWrap:     'wrap',
      }}>

        {/* Date picker */}
        <div>
          <label style={{
            display:      'block',
            fontFamily:   '"Lato", sans-serif',
            fontSize:     '11px',
            fontWeight:   700,
            color:        '#9CA3AF',
            textTransform:'uppercase',
            letterSpacing:'.06em',
            marginBottom: '6px',
          }}>
            Pickup Date
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={e => {
              setSelectedDate(e.target.value)
              setCategory('All') // reset category filter when date changes
            }}
            className="gw-input"
            style={{ width: '180px' }}
          />
        </div>

        {/* Product type filter */}
        <div>
          <label style={{
            display:      'block',
            fontFamily:   '"Lato", sans-serif',
            fontSize:     '11px',
            fontWeight:   700,
            color:        '#9CA3AF',
            textTransform:'uppercase',
            letterSpacing:'.06em',
            marginBottom: '6px',
          }}>
            Product Type
          </label>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {CATEGORIES.map(cat => {
              const isActive = cat === category
              return (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  style={{
                    padding:      '7px 14px',
                    borderRadius: '20px',
                    border:       `1.5px solid ${isActive ? '#7B1A1A' : '#E5E7EB'}`,
                    background:   isActive ? '#7B1A1A' : '#fff',
                    color:        isActive ? '#fff' : '#555',
                    fontSize:     '12px',
                    fontWeight:   isActive ? 700 : 400,
                    cursor:       'pointer',
                    fontFamily:   '"Lato", sans-serif',
                    transition:   'all .15s',
                  }}
                >
                  {cat}
                </button>
              )
            })}
          </div>
        </div>
      </div>
      
      {/* Date display heading  */}
      {selectedDate && (
        <div style={{
          display:      'flex',
          alignItems:   'center',
          gap:          '12px',
          marginBottom: '20px',
        }}>
          <h2 style={{
            fontFamily: '"Playfair Display", serif',
            fontSize:   '18px',
            fontWeight: 700,
            color:      '#1A1A1A',
            margin:     0,
          }}>
            {formatDateDisplay(selectedDate)}
          </h2>
          {!loading && (
            <span style={{
              fontFamily:  '"Lato", sans-serif',
              fontSize:    '13px',
              color:       '#9CA3AF',
            }}>
              {ordersWithItems.length} {ordersWithItems.length === 1 ? 'order' : 'orders'}
              {category !== 'All' ? ` with ${category} items` : ''}
            </span>
          )}
        </div>
      )}
            {/* Error state */}
      {error && (
        <div style={{
          padding: '12px 16px', borderRadius: '8px',
          background: '#FEE2E2', border: '1px solid #FECACA',
          fontFamily: '"Lato", sans-serif', fontSize: '13px', color: '#991B1B',
          marginBottom: '20px',
        }}>
          {error}
        </div>
      )}
            {/* Loading skeleton */}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[1,2,3].map(i => (
            <div key={i} style={{
              background: '#fff', borderRadius: '12px',
              border: '1px solid #E5E7EB', padding: '20px',
            }}>
              <div style={{ width: '160px', height: '14px', background: '#F0E8D0', borderRadius: '4px', marginBottom: '10px' }} />
              <div style={{ width: '100%', height: '10px', background: '#F3F4F6', borderRadius: '4px' }} />
            </div>
          ))}
        </div>
      )}
            {/* Empty state  */}
      {!loading && !error && ordersWithItems.length === 0 && selectedDate && (
        <div style={{
          padding:    '48px',
          textAlign:  'center',
          background: '#fff',
          borderRadius: '12px',
          border:     '1px solid #E5E7EB',
          fontFamily: '"Lato", sans-serif',
          fontSize:   '14px',
          color:      '#9CA3AF',
          marginBottom: '24px',
        }}>
          {category !== 'All'
            ? `No ${category} items found for ${formatDateDisplay(selectedDate)}`
            : `No orders found for ${formatDateDisplay(selectedDate)}`
          }
        </div>
      )}

}