'use client'

import { useState, useEffect, useCallback } from 'react'

const CATEGORIES = ['All', 'Pork', 'Beef', 'Lamb', 'Poultry', 'Seafood', 'Other']

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

function formatDateDisplay(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-AU', {
    weekday: 'short', day: '2-digit', month: 'short', year: 'numeric',
  })
}

function todayString() {
  const d   = new Date()
  const pad = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export default function DailyPrepPage() {
  const [selectedDate, setSelectedDate] = useState(todayString)
  const [category,     setCategory]     = useState('All')
  const [data,         setData]         = useState(null)
  const [loading,      setLoading]      = useState(false)
  const [error,        setError]        = useState(null)

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

  const orders          = data?.orders  ?? []
  const summary         = data?.summary ?? []
  const ordersWithItems = orders.filter(o => o.order_items.length > 0)

  return (
    <div style={{ padding: '32px', maxWidth: '1200px', fontFamily: '"Lato", sans-serif' }}>

      {/* Heading + gold divider */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontFamily: '"Lato", serif', fontSize: '36px', fontWeight: 700, color: '#7B1A1A', margin: '0 0 32px 0' }}>
          Daily Prep
        </h1>
        <div style={{ height: '2px', background: 'linear-gradient(90deg, #C9A84C, transparent)', borderRadius: '1px' }} />
      </div>

      {/* Filters row */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '24px', marginBottom: '24px', flexWrap: 'wrap' }}>

        {/* Date picker */}
        <div>
          <label style={{
            display: 'block', fontFamily: '"Lato", sans-serif',
            fontSize: '11px', fontWeight: 700, color: '#9CA3AF',
            textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '6px',
          }}>
            Pickup Date
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={e => { setSelectedDate(e.target.value); setCategory('All') }}
            className="gw-input"
            style={{ width: '180px' }}
          />
        </div>

        {/* Category filter */}
        <div>
          <label style={{
            display: 'block', fontFamily: '"Lato", sans-serif',
            fontSize: '11px', fontWeight: 700, color: '#9CA3AF',
            textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '6px',
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
                    padding: '7px 16px', borderRadius: '20px',
                    border: `1.5px solid ${isActive ? '#7B1A1A' : '#E5E7EB'}`,
                    background: isActive ? '#7B1A1A' : '#fff',
                    color: isActive ? '#fff' : '#555',
                    fontSize: '13px', fontWeight: isActive ? 700 : 400,
                    cursor: 'pointer', fontFamily: '"Lato", sans-serif',
                    transition: 'all .15s',
                  }}
                >
                  {cat}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Date sub-heading + order count */}
      {selectedDate && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <h2 style={{ fontFamily: '"Lato", serif', fontSize: '20px', fontWeight: 700, color: '#1A1A1A', margin: 0 }}>
            {formatDateDisplay(selectedDate)}
          </h2>
          {!loading && (
            <span style={{ fontFamily: '"Lato", sans-serif', fontSize: '13px', color: '#9CA3AF' }}>
              {ordersWithItems.length} {ordersWithItems.length === 1 ? 'order' : 'orders'}
              {category !== 'All' ? ` with ${category} items` : ''}
            </span>
          )}
        </div>
      )}

      {/* Error */}
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
          {[1, 2, 3].map(i => (
            <div key={i} style={{ background: '#fff', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '20px' }}>
              <div style={{ width: '160px', height: '14px', background: '#F0E8D0', borderRadius: '4px', marginBottom: '10px' }} />
              <div style={{ width: '100%', height: '10px', background: '#F3F4F6', borderRadius: '4px' }} />
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && ordersWithItems.length === 0 && selectedDate && (
        <div style={{
          padding: '48px', textAlign: 'center',
          background: '#fff', borderRadius: '12px', border: '1px solid #E5E7EB',
          fontFamily: '"Lato", sans-serif', fontSize: '14px', color: '#9CA3AF',
          marginBottom: '24px',
        }}>
          {category !== 'All'
            ? `No ${category} items found for ${formatDateDisplay(selectedDate)}`
            : `No orders found for ${formatDateDisplay(selectedDate)}`}
        </div>
      )}

      {/* Order cards */}
      {!loading && ordersWithItems.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
          {ordersWithItems.map(order => (
            <div key={order.id} style={{ background: '#fff', borderRadius: '12px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>

              {/* Order header */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '14px 20px', background: '#FAFAF8', borderBottom: '1px solid #F3F4F6',
              }}>
                <span style={{ fontFamily: 'monospace', fontSize: '14px', fontWeight: 700, color: '#1A1A1A' }}>
                  #{order.order_number}
                </span>
                <span style={{ fontFamily: '"Lato", sans-serif', fontSize: '13px', color: '#374151', flex: 1 }}>
                  {order.customer_name}
                </span>
                <StatusBadge status={order.status} />
              </div>

              {/* Column headers */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px 80px', padding: '8px 20px', borderBottom: '1px solid #F3F4F6' }}>
                {['Product', 'Category', 'Qty'].map(h => (
                  <span key={h} style={{
                    fontFamily: '"Lato", sans-serif', fontSize: '11px', fontWeight: 700,
                    color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '.06em',
                  }}>
                    {h}
                  </span>
                ))}
              </div>

              {/* Item rows */}
              {order.order_items.map((item, i) => (
                <div key={item.id} style={{
                  display: 'grid', gridTemplateColumns: '1fr 120px 80px',
                  padding: '10px 20px',
                  borderBottom: i < order.order_items.length - 1 ? '1px solid #F9F6EF' : 'none',
                  alignItems: 'center',
                }}>
                  <span style={{ fontFamily: '"Lato", sans-serif', fontSize: '13px', fontWeight: 600, color: '#1A1A1A' }}>
                    {item.product_name}
                  </span>
                  <CategoryBadge category={item.category} />
                  <span style={{ fontFamily: '"Lato", sans-serif', fontSize: '14px', fontWeight: 700, color: '#1A1A1A' }}>
                    x{item.quantity}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Day Summary */}
      {!loading && !error && selectedDate && (
        <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>

          {/* Summary heading bar */}
          <div style={{ padding: '14px 20px', background: '#7B1A1A', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
              <line x1="8"  y1="6"  x2="21" y2="6"/>
              <line x1="8"  y1="12" x2="21" y2="12"/>
              <line x1="8"  y1="18" x2="21" y2="18"/>
              <line x1="3"  y1="6"  x2="3.01" y2="6"/>
              <line x1="3"  y1="12" x2="3.01" y2="12"/>
              <line x1="3"  y1="18" x2="3.01" y2="18"/>
            </svg>
            <h3 style={{ fontFamily: '"Lato", serif', fontSize: '15px', fontWeight: 700, color: '#fff', margin: 0 }}>
              Day Summary — {formatDateDisplay(selectedDate)}
              {category !== 'All' && ` (${category} only)`}
            </h3>
          </div>

          {/* Summary table header */}
          {summary.length > 0 && (
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 120px 100px',
              padding: '10px 20px', background: '#F9FAFB', borderBottom: '1px solid #E5E7EB',
            }}>
              {['Product', 'Category', 'Total Qty'].map(h => (
                <span key={h} style={{
                  fontFamily: '"Lato", sans-serif', fontSize: '11px', fontWeight: 700,
                  color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '.06em',
                }}>
                  {h}
                </span>
              ))}
            </div>
          )}

          {/* Summary rows */}
          {summary.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', fontFamily: '"Lato", sans-serif', fontSize: '13px', color: '#9CA3AF' }}>
              No items to prepare for this day
            </div>
          ) : (
            summary.map((item, i) => (
              <div key={item.product_name} style={{
                display: 'grid', gridTemplateColumns: '1fr 120px 100px',
                padding: '12px 20px',
                borderBottom: i < summary.length - 1 ? '1px solid #F9F6EF' : 'none',
                alignItems: 'center',
                background: i % 2 === 0 ? '#FAFAF8' : '#fff',
              }}>
                <span style={{ fontFamily: '"Lato", sans-serif', fontSize: '13px', fontWeight: 600, color: '#1A1A1A' }}>
                  {item.product_name}
                </span>
                <CategoryBadge category={item.category} />
                <span style={{ fontFamily: '"Lato", sans-serif', fontSize: '16px', fontWeight: 700, color: '#7B1A1A' }}>
                  ×{item.total_quantity}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}