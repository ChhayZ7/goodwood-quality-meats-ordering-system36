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

export default function AdminInventoryPage() {
  const [inventory,   setInventory]   = useState([])
  const [loading,     setLoading]     = useState(true)
  const [fetchError,  setFetchError]  = useState(null)
  const [edits,       setEdits]       = useState({})
  const [saving,      setSaving]      = useState(false)
  const [saved,       setSaved]       = useState(false)
  const [saveError,   setSaveError]   = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  const loadInventory = useCallback(async () => {
    setLoading(true)
    setFetchError(null)
    try {
      const res = await fetch('/api/admin/inventory')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to load inventory')
      setInventory(data.inventory)
      setEdits({})
    } catch (err) {
      setFetchError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadInventory() }, [loadInventory])

  function handleEdit(inventoryId, raw) {
    setEdits(prev => ({
      ...prev,
      [inventoryId]: raw === '' ? '' : Math.max(0, parseInt(raw, 10) || 0),
    }))
  }

  const changedItems = inventory.filter(item => {
    const edited = edits[item.id]
    return edited !== undefined && edited !== '' && edited !== item.stock_quantity
  })

  const filteredInventory = inventory.filter(item =>
    item.product?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  async function handleSave() {
    if (changedItems.length === 0) return
    if (changedItems.length > 50) {
      setSaveError('Too many changes at once. Please save in smaller batches.')
      return
    }
    setSaving(true)
    setSaveError(null)

    const updates = changedItems.map(item => ({
      inventory_id:   item.id,
      stock_quantity: Number(edits[item.id]),
    }))

    try {
      const res = await fetch('/api/admin/inventory', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      const data = await res.json()

      if (!res.ok && res.status !== 207) throw new Error(data.error || 'Failed to save')

      if (data.failures?.length > 0) {
        setSaveError(`${data.failures.length} item(s) failed to update.`)
      }

      setInventory(prev =>
        prev.map(item => {
          const savedItem = data.updated?.find(u => u.id === item.id)
          return savedItem ? { ...item, stock_quantity: savedItem.stock_quantity } : item
        })
      )
      setEdits({})
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setSaveError(err.message)
    } finally {
      setSaving(false)
    }
  }

  function handleCancel() {
    setEdits({})
    setSaveError(null)
  }

  const showPlaceholders = loading || inventory.length === 0

  return (
    <div style={{ padding: '32px', maxWidth: '1250px' }}>

      {/* Heading + gold divider */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontFamily: '"Lato",serif', fontSize: '36px', fontWeight: 700, color: '#7B1A1A', margin: '0 0 32px 0' }}>
          Inventory Management
        </h1>
        <div style={{ height: '2px', background: 'linear-gradient(90deg, #C9A84C, transparent)', borderRadius: '1px' }} />
      </div>

      {/* Search bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
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

        {/* Clear Search button — only when there's a query */}
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
      </div>

      {/* Errors */}
      {fetchError && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '12px 16px', fontSize: '13px', color: '#B91C1C', marginBottom: '20px' }}>
          {fetchError} —{' '}
          <button onClick={loadInventory} style={{ background: 'none', border: 'none', color: '#7B1A1A', cursor: 'pointer', textDecoration: 'underline', fontSize: '13px', padding: 0 }}>
            retry
          </button>
        </div>
      )}
      {saveError && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '12px 16px', fontSize: '13px', color: '#B91C1C', marginBottom: '20px' }}>
          {saveError}
        </div>
      )}

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px 200px 120px', padding: '12px 20px', background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
          {['Product Name', 'Category', 'Stock Quantity', 'Status'].map(h => (
            <span key={h} style={{ fontFamily: '"Lato",sans-serif', fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '.06em' }}>
              {h}
            </span>
          ))}
        </div>

        {/* Skeleton rows while loading */}
        {showPlaceholders && Array.from({ length: 7 }).map((_, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 140px 200px 120px', padding: '15px 20px', borderBottom: i < 6 ? '1px solid #F3F4F6' : 'none', alignItems: 'center' }}>
            <div style={{ width: '160px', height: '14px', background: '#F0E8D0', borderRadius: '4px' }} />
            <div style={{ width: '68px', height: '22px', background: '#F3F4F6', borderRadius: '12px' }} />
            <input disabled placeholder="0" style={{ width: '80px', padding: '8px 10px', border: '1.5px solid #E5E7EB', borderRadius: '6px', fontSize: '14px', color: '#D1D5DB', background: '#F9FAFB', cursor: 'not-allowed' }} />
            <div style={{ width: '60px', height: '14px', background: '#F3F4F6', borderRadius: '4px' }} />
          </div>
        ))}

        {/* No search results */}
        {!showPlaceholders && filteredInventory.length === 0 && (
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
        {!showPlaceholders && filteredInventory.map((item, i) => {
          const current    = edits[item.id] !== undefined ? edits[item.id] : item.stock_quantity
          const isLow      = Number(current) > 0 && Number(current) <= LOW_STOCK
          const isOut      = Number(current) === 0
          const hasChanged = edits[item.id] !== undefined && edits[item.id] !== '' && edits[item.id] !== item.stock_quantity
          const cat        = CATEGORY_COLOURS[item.product?.category] ?? CATEGORY_COLOURS['Other']

          return (
            <div
              key={item.id}
              style={{
                display: 'grid', gridTemplateColumns: '1fr 140px 200px 120px',
                padding: '15px 20px',
                borderBottom: i < filteredInventory.length - 1 ? '1px solid #F3F4F6' : 'none',
                alignItems: 'center',
                background: hasChanged ? '#FFFDF5' : 'transparent',
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

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="number" min="0" value={current}
                  onChange={e => handleEdit(item.id, e.target.value)}
                  className="gw-input"
                  style={{
                    width: '80px', padding: '8px 10px', fontSize: '14px', fontWeight: 700,
                    color: isOut ? '#DC2626' : isLow ? '#D97706' : '#1A1A1A',
                    border: `1.5px solid ${hasChanged ? '#E8D48A' : '#CCCCCC'}`,
                    background: hasChanged ? '#FFFEF0' : '#fff',
                  }}
                />
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
                {hasChanged && (
                  <span style={{ fontFamily: '"Lato",sans-serif', fontSize: '11px', color: '#A07C2A', fontWeight: 600 }}>
                    edited
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

      {/* Floating save bar */}
      {!loading && changedItems.length > 0 && (
        <div style={{
          position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)',
          background: '#1A1A1A', borderRadius: '12px', padding: '12px 24px',
          display: 'flex', alignItems: 'center', gap: '16px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)', zIndex: 200,
        }}>
          <span style={{ fontFamily: '"Lato",sans-serif', fontSize: '13px', color: '#E5E5E5' }}>
            {changedItems.length} unsaved change{changedItems.length > 1 ? 's' : ''}
          </span>
          <button
            onClick={handleCancel}
            disabled={saving}
            style={{
              padding: '8px 20px', background: 'transparent', color: '#E5E5E5',
              border: '1px solid #555', borderRadius: '8px', fontSize: '13px',
              fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: '"Lato",sans-serif',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: '8px 20px', background: saving ? '#555' : '#E8D48A',
              color: '#1A1A1A', border: 'none', borderRadius: '8px', fontSize: '13px',
              fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: '"Lato",sans-serif',
            }}
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      )}
    </div>
  )
}