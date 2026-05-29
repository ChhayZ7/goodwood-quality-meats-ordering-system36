'use client'

import { useState, useEffect, useCallback } from 'react'

const LOW_STOCK = 5

const CATEGORY_COLOURS = {
  Pork:    { bg: '#FEE2E2', color: '#991B1B' },
  Beef:    { bg: '#FEF3C7', color: '#92400E' },
  Lamb:    { bg: '#DCFCE7', color: '#166534' },
  Poultry: { bg: '#DBEAFE', color: '#1E40AF' },
  Seafood: { bg: '#F3E8FF', color: '#7C3AED' },
  Other:   { bg: '#F3F4F6', color: '#6B7280' },
}

export default function StaffInventoryPage() {

  const [inventory,   setInventory]   = useState([])
  const [loading,     setLoading]     = useState(true)
  const [fetchError,  setFetchError]  = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  const loadInventory = useCallback(async () => {
    setLoading(true)
    setFetchError(null)
    try {
      const res  = await fetch('/api/admin/inventory')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to load inventory')
      setInventory(data.inventory ?? [])
    } catch (err) {
      setFetchError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadInventory() }, [loadInventory])

  const lowCount = inventory.filter(i => i.stock_quantity <= LOW_STOCK).length

  const filteredInventory = inventory.filter(item =>
    item.product?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div style={{ padding: '32px', maxWidth: '1250px' }}>

      {/* Heading + gold divider */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontFamily: '"Lato",serif', fontSize: '36px', fontWeight: 700, color: '#7B1A1A', margin: '0 0 32px 0' }}>
          Inventory
        </h1>
        <div style={{ height: '2px', background: 'linear-gradient(90deg, #C9A84C, transparent)', borderRadius: '1px' }} />
      </div>

      {/* Search bar + low stock badge row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', width: '400px' }}>
          <svg
            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#9CA3AF' }}
            width="15" height="15" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && e.preventDefault()}
            style={{
              width: '100%',
              padding: '9px 12px 9px 36px',
              border: '1.5px solid #CCCCCC',
              borderRadius: '8px',
              fontSize: '13px',
              fontFamily: '"Lato",sans-serif',
              color: '#1A1A1A',
              background: '#fff',
              outline: 'none',
              boxSizing: 'border-box',
              transition: 'border-color 0.2s',
            }}
            onFocus={e => e.target.style.borderColor = '#7B1A1A'}
            onBlur={e => e.target.style.borderColor = '#CCCCCC'}
          />
        </div>

        {/* Clear Search */}
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            style={{
              padding: '9px 18px',
              background: 'transparent',
              color: '#6B7280',
              border: '1.5px solid #CCCCCC',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: '"Lato",sans-serif',
              whiteSpace: 'nowrap',
            }}
          >
            Clear Search
          </button>
        )}

        {/* Low stock badge */}
        {!loading && lowCount > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px', borderRadius: '8px', background: '#FEE2E2', border: '1px solid #FECACA', marginLeft: 'auto' }}>
            <span style={{ fontFamily: '"Lato",sans-serif', fontSize: '13px', fontWeight: 700, color: '#991B1B' }}>
              {lowCount} item{lowCount > 1 ? 's' : ''} low on stock
            </span>
          </div>
        )}
      </div>

      {/* Read-only notice */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderRadius: '8px', background: '#F0E8D0', border: '1px solid #E8D48A', marginBottom: '20px', width: 'fit-content' }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#7B1A1A" strokeWidth="2">
          <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
        </svg>
        <span style={{ fontFamily: '"Lato",sans-serif', fontSize: '12px', fontWeight: 600, color: '#7B1A1A' }}>
          Read only — contact an admin to update stock levels
        </span>
      </div>

      {/* Fetch error */}
      {fetchError && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '12px 16px', fontSize: '13px', color: '#B91C1C', marginBottom: '20px' }}>
          {fetchError} —{' '}
          <button onClick={loadInventory} style={{ background: 'none', border: 'none', color: '#7B1A1A', cursor: 'pointer', textDecoration: 'underline', fontSize: '13px', padding: 0 }}>
            retry
          </button>
        </div>
      )}

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px 160px 120px', padding: '12px 20px', background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
          {['Product Name', 'Category', 'Current Stock', 'Status'].map(h => (
            <span key={h} style={{ fontFamily: '"Lato",sans-serif', fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '.06em' }}>
              {h}
            </span>
          ))}
        </div>

        {/* Skeleton rows */}
        {loading && Array.from({ length: 7 }).map((_, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 140px 160px 120px', padding: '15px 20px', borderBottom: i < 6 ? '1px solid #F3F4F6' : 'none', alignItems: 'center' }}>
            <div style={{ width: '160px', height: '14px', background: '#F0E8D0', borderRadius: '4px' }} />
            <div style={{ width: '68px',  height: '22px', background: '#F3F4F6', borderRadius: '12px' }} />
            <div style={{ width: '40px',  height: '14px', background: '#F3F4F6', borderRadius: '4px' }} />
            <div style={{ width: '60px',  height: '14px', background: '#F3F4F6', borderRadius: '4px' }} />
          </div>
        ))}

        {/* No search results */}
        {!loading && filteredInventory.length === 0 && !fetchError && (
          <div style={{ padding: '60px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '72px', height: '72px', borderRadius: '50%',
              backgroundColor: '#7B1A1A', display: 'flex', alignItems: 'center',
              justifyContent: 'center', marginBottom: '4px',
              boxShadow: '0 4px 16px rgba(123,26,26,0.25)',
            }}>
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                <line x1="8" y1="11" x2="14" y2="11" />
              </svg>
            </div>
            <p style={{ fontFamily: '"Lato",sans-serif', fontSize: '18px', fontWeight: 700, color: '#7B1A1A', margin: 0 }}>
              No products found
            </p>
            <p style={{ fontFamily: '"Lato",sans-serif', fontSize: '13px', color: '#9CA3AF', margin: 0, maxWidth: '300px', lineHeight: 1.6 }}>
              We couldn't find anything matching "{searchQuery}". Try a different search term or browse by category.
            </p>
          </div>
        )}

        {/* Real data rows */}
        {!loading && filteredInventory.map((item, i) => {
          const isLow = item.stock_quantity > 0 && item.stock_quantity <= LOW_STOCK
          const isOut = item.stock_quantity === 0
          const cat   = CATEGORY_COLOURS[item.product?.category] ?? CATEGORY_COLOURS['Other']

          return (
            <div
              key={item.id}
              style={{
                display: 'grid', gridTemplateColumns: '1fr 140px 160px 120px',
                padding: '15px 20px',
                borderBottom: i < filteredInventory.length - 1 ? '1px solid #F3F4F6' : 'none',
                alignItems: 'center',
                background: isOut ? '#FFFBFB' : 'transparent',
              }}
            >
              <span style={{ fontFamily: '"Lato",sans-serif', fontSize: '14px', fontWeight: 600, color: '#1A1A1A' }}>
                {item.product?.name ?? '—'}
              </span>

              <span style={{
                display: 'inline-block', padding: '3px 10px', borderRadius: '12px',
                background: cat.bg, color: cat.color, fontSize: '12px', fontWeight: 700, width: 'fit-content',
              }}>
                {item.product?.category ?? '—'}
              </span>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  fontFamily: '"Lato",sans-serif', fontSize: '14px',
                  fontWeight: isLow ? 700 : 400,
                  color: isOut ? '#DC2626' : isLow ? '#D97706' : '#1A1A1A',
                }}>
                  {item.stock_quantity}
                </span>
                {isOut && (
                  <span style={{ fontFamily: '"Lato",sans-serif', fontSize: '11px', color: '#DC2626', fontWeight: 700, background: '#FEE2E2', padding: '2px 8px', borderRadius: '10px', whiteSpace: 'nowrap' }}>
                    Sold out
                  </span>
                )}
                {isLow && !isOut && (
                  <span style={{ fontFamily: '"Lato",sans-serif', fontSize: '11px', color: '#D97706', fontWeight: 700, background: '#FEF3C7', padding: '2px 8px', borderRadius: '10px', whiteSpace: 'nowrap' }}>
                    Low stock
                  </span>
                )}
              </div>

              <span style={{
                fontFamily: '"Lato",sans-serif', fontSize: '13px', fontWeight: 600,
                color: isOut ? '#DC2626' : isLow ? '#D97706' : '#16A34A',
              }}>
                {isOut ? 'Out of Stock' : isLow ? 'Low Stock' : 'In Stock'}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}