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
  const [edits,       setEdits]       = useState({})   // { [inventory_id]: number }
  const [saving,      setSaving]      = useState(false)
  const [saved,       setSaved]       = useState(false)
  const [saveError,   setSaveError]   = useState(null)

  // Load inventory from API
  const loadInventory = useCallback(async () => {
    setLoading(true)
    setFetchError(null)
    try {
      const res = await fetch('/api/admin/inventory')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to load inventory')
      setInventory(data.inventory)
      setEdits({}) // reset edits on fresh load
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

  // Items that have been changed from their original value
  const changedItems = inventory.filter(item => {
    const edited = edits[item.id]
    return edited !== undefined && edited !== '' && edited !== item.stock_quantity
  })

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

      if (!res.ok && res.status !== 207) {
        throw new Error(data.error || 'Failed to save')
      }

      if (data.failures?.length > 0) {
        setSaveError(`${data.failures.length} item(s) failed to update.`)
      }

      // Apply saved values back to inventory state
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

      {/* Heading + Save button */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontFamily: '"Playfair Display",serif', fontSize: '26px', fontWeight: 700, color: '#1A1A1A', margin: '0 0 6px' }}>
            Inventory Management
          </h1>
          <p style={{ fontFamily: '"Lato",sans-serif', fontSize: '14px', color: '#888', margin: 0 }}>
            Update stock levels — changes reflect on the products page immediately
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {changedItems.length > 0 && (
            <span style={{ fontFamily: '"Lato",sans-serif', fontSize: '13px', color: '#D97706', fontWeight: 600 }}>
              {changedItems.length} unsaved change{changedItems.length > 1 ? 's' : ''}
            </span>
          )}
          {changedItems.length > 0 && (
            <button
              onClick={handleCancel}
              disabled={saving}
              style={{
                padding: '10px 22px',
                fontSize: '14px',
                fontFamily: '"Lato",sans-serif',
                fontWeight: 700,
                background: 'transparent',
                border: '1.5px solid #CCCCCC',
                borderRadius: '8px',
                color: '#6B7280',
                cursor: saving ? 'not-allowed' : 'pointer',
              }}
            >
              Cancel
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={saving || loading || changedItems.length === 0}
            className="btn-primary"
            style={{ padding: '10px 22px', fontSize: '14px' }}
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
          {saved && (
            <span style={{ fontFamily: '"Lato",sans-serif', fontSize: '13px', color: '#16A34A', fontWeight: 600 }}>
              ✓ Saved
            </span>
          )}
        </div>
      </div>

      {/* Fetch error */}
      {fetchError && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '12px 16px', fontSize: '13px', color: '#B91C1C', marginBottom: '20px' }}>
          {fetchError} —{' '}
          <button
            onClick={loadInventory}
            style={{ background: 'none', border: 'none', color: '#7B1A1A', cursor: 'pointer', textDecoration: 'underline', fontSize: '13px', padding: 0 }}
          >
            retry
          </button>
        </div>
      )}

      {/* Save error */}
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

        {/* Placeholder rows while loading */}
        {showPlaceholders && Array.from({ length: 7 }).map((_, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 140px 200px 120px', padding: '15px 20px', borderBottom: i < 6 ? '1px solid #F3F4F6' : 'none', alignItems: 'center' }}>
            <div style={{ width: '160px', height: '14px', background: '#F0E8D0', borderRadius: '4px' }} />
            <div style={{ width: '68px', height: '22px', background: '#F3F4F6', borderRadius: '12px' }} />
            <input disabled placeholder="0" style={{ width: '80px', padding: '8px 10px', border: '1.5px solid #E5E7EB', borderRadius: '6px', fontSize: '14px', color: '#D1D5DB', background: '#F9FAFB', cursor: 'not-allowed' }} />
            <div style={{ width: '60px', height: '14px', background: '#F3F4F6', borderRadius: '4px' }} />
          </div>
        ))}

        {/* Real data rows */}
        {!showPlaceholders && inventory.map((item, i) => {
          const current    = edits[item.id] !== undefined ? edits[item.id] : item.stock_quantity
          const isLow      = Number(current) > 0 && Number(current) <= LOW_STOCK
          const isOut      = Number(current) === 0
          const hasChanged = edits[item.id] !== undefined && edits[item.id] !== '' && edits[item.id] !== item.stock_quantity
          const cat        = CATEGORY_COLOURS[item.product?.category] ?? CATEGORY_COLOURS['Other']

          return (
            <div
              key={item.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 140px 200px 120px',
                padding: '15px 20px',
                borderBottom: i < inventory.length - 1 ? '1px solid #F3F4F6' : 'none',
                alignItems: 'center',
                background: hasChanged ? '#FFFDF5' : 'transparent',
              }}
            >
              {/* Name */}
              <span style={{ fontFamily: '"Lato",sans-serif', fontSize: '14px', fontWeight: 600, color: '#1A1A1A' }}>
                {item.product?.name ?? '—'}
              </span>

              {/* Category badge */}
              <span style={{
                display: 'inline-block',
                padding: '3px 10px',
                borderRadius: '12px',
                background: cat.bg,
                color: cat.color,
                fontSize: '12px',
                fontWeight: 700,
                width: 'fit-content',
              }}>
                {item.product?.category ?? '—'}
              </span>

              {/* Editable stock input */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="number"
                  min="0"
                  value={current}
                  onChange={e => handleEdit(item.id, e.target.value)}
                  className="gw-input"
                  style={{
                    width: '80px',
                    padding: '8px 10px',
                    fontSize: '14px',
                    fontWeight: 700,
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

              {/* Status */}
              <span style={{
                fontFamily: '"Lato",sans-serif',
                fontSize: '13px',
                fontWeight: 600,
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
            padding: '8px 20px',
            background: 'transparent',
            color: '#E5E5E5',
            border: '1px solid #555',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 700,
            cursor: saving ? 'not-allowed' : 'pointer',
            fontFamily: '"Lato",sans-serif',
          }}
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
      padding: '8px 20px',
      background: saving ? '#555' : '#E8D48A',
      color: '#1A1A1A',
      border: 'none',
      borderRadius: '8px',
      fontSize: '13px',
      fontWeight: 700,
      cursor: saving ? 'not-allowed' : 'pointer',
      fontFamily: '"Lato",sans-serif',
    }}
        >
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
        </div>
      )}
    </div>
  )
}