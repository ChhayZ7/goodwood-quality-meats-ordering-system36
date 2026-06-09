'use client'
// This page needs to be a Client Component because it uses React state,
// useEffect, useCallback, date input changes, category filter clicks, and fetches data from the browser.
// Reference - https://nextjs.org/docs/app/api-reference/directives/use-client

import { useState, useEffect, useCallback } from 'react'
// useState stores values that change on the page, like selected date,
// category, loading, error, and prep data.
// useEffect reloads the prep data when date/category changes.
// useCallback keeps fetchPrep stable so it can be safely used in useEffect.
// References used:
// https://react.dev/reference/react/useState
// https://react.dev/reference/react/useEffect
// https://react.dev/reference/react/useCallback

import PageWrapper from '@/components/dashboard/PageWrapper'
import PageHeader from '@/components/dashboard/PageHeader'
import FilterTabs from '@/components/dashboard/FilterTabs'
import StatusBadge from '@/components/dashboard/StatusBadge'

// These are the product category filters shown on the Daily Prep page.
// "All" is used so staff can view every product type for the selected day
const CATEGORIES = ['All', 'Pork', 'Beef', 'Lamb', 'Poultry', 'Seafood', 'Other']

// These colours are used for category badges.
// Keeping them in one object makes the badge styling easier to reuse and update
const CATEGORY_COLOURS = {
  Pork: { bg: '#FEE2E2', color: '#991B1B' },
  Beef: { bg: '#FEF3C7', color: '#92400E' },
  Lamb: { bg: '#DCFCE7', color: '#166534' },
  Poultry: { bg: '#DBEAFE', color: '#1E40AF' },
  Seafood: { bg: '#F3E8FF', color: '#7C3AED' },
  Other: { bg: '#F3F4F6', color: '#6B7280' },
}

// Small reusable badge for showing product categories.
// If the category is missing or unknown, it falls back to "Other"
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

// Formats the selected date into a nicer display format.
// Example: 2026-06-09 becomes Tue, 09 Jun 2026.
// AI was used to help keep the date display format clear
// Reference - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleDateString
function formatDateDisplay(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-AU', {
    weekday: 'short', day: '2-digit', month: 'short', year: 'numeric',
  })
}

// Returns today's date in YYYY-MM-DD format for the date input.
// The date input expects this format, so this function prepares it correctly.
// AI was used here to help with the zero-padding logic
// Reference - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/padStart
function todayString() {
  const d = new Date()
  const pad = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export default function DailyPrepPage() {
  const [selectedDate, setSelectedDate] = useState(todayString) // selectedDate stores the current pickup date selected by staff
  const [category, setCategory] = useState('All') // category stores the selected product type filter
  const [data, setData] = useState(null) // data stores the API response, including orders and summary
  const [loading, setLoading] = useState(false) // loading is true while the prep data is being fetched
  const [error, setError] = useState(null) // error stores the error message if the API request fails

  // Fetches daily prep data from the API using the selected date and category.
  // AI was used to help build the query string using URLSearchParams
  // References used:
  // https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams
  // https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
  const fetchPrep = useCallback(async (date, cat) => {
    if (!date) return
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ date })

      // Only add category to the query string when a specific category is selected
      if (cat && cat !== 'All') params.set('category', cat)
      const res = await fetch(`/api/staff/daily-prep?${params}`)
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Failed to load prep data')
      setData(json)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  // Reload the prep list whenever the date or category changes
  useEffect(() => {
    fetchPrep(selectedDate, category)
  }, [selectedDate, category, fetchPrep])

  // Safely read orders and summary from the API response. If data has not loaded yet, use empty arrays so the page does not crash
  const orders = data?.orders ?? []
  const summary = data?.summary ?? []

  // Only show order cards that actually have items to prepare.
  // AI was used to help keep this filtering logic simple
  // Reference - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter
  const ordersWithItems = orders.filter(o => o.order_items.length > 0)

  return (
    <PageWrapper>
      <PageHeader title="Daily Prep" />

      {/* Date picker */}
      <div style={{ marginBottom: '12px' }}>
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

          // When the date changes, reset category back to All. This makes sure the new day starts with the full prep list
          onChange={e => { setSelectedDate(e.target.value); setCategory('All') }}
          className="gw-input"
          style={{ width: '180px' }}
        />
      </div>

      {/* Category filter */}
      <div style={{ marginBottom: '8px' }}>
        <label style={{
          display: 'block', fontFamily: '"Lato", sans-serif',
          fontSize: '11px', fontWeight: 700, color: '#9CA3AF',
          textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '6px',
        }}>
          Product Type
        </label>
        <FilterTabs
          tabs={CATEGORIES}
          labels={{}}
          active={category}
          onChange={setCategory}
        />
      </div>

      {/* Date sub-heading & order count */}
      {selectedDate && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <h2 style={{ fontFamily: '"Lato", sans-serif', fontSize: '20px', fontWeight: 700, color: '#1A1A1A', margin: 0 }}>
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

      {/* Error Message*/}
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
      {/* This gives staff a visual placeholder while the API request is running */}
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
      {/* This is shown when there are no prep items for the selected date/category. */}
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
      {/* Each card shows one order and the items that need to be prepared. */}
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
              {/* Reference - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map */}
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
      {/* This section totals the quantity needed for each product on the selected day. */}
      {!loading && !error && selectedDate && (
        <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>

          <div style={{ padding: '14px 20px', background: '#7B1A1A', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
              <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" />
              <line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" />
              <line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
            <h3 style={{ fontFamily: '"Lato", sans-serif', fontSize: '15px', fontWeight: 700, color: '#fff', margin: 0 }}>
              Day Summary — {formatDateDisplay(selectedDate)}
              {category !== 'All' && ` (${category} only)`}
            </h3>
          </div>

          {/* Summary table header appears only when there are summary rows */}
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
    </PageWrapper>
  )
}
