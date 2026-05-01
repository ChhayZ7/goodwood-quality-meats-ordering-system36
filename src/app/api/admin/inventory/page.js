'use client'

import { useState, useEffect } from 'react'

const LOW_STOCK = 5

// BACKEND TEAM: replace with useState([]) + useEffect fetch (see notes above)
const inventory = []

const CATEGORY_COLOURS = {
  Pork:    { bg: '#FEE2E2', color: '#991B1B' },
  Beef:    { bg: '#FEF3C7', color: '#92400E' },
  Lamb:    { bg: '#DCFCE7', color: '#166534' },
  Poultry: { bg: '#DBEAFE', color: '#1E40AF' },
  Seafood: { bg: '#F3E8FF', color: '#7C3AED' },
  Other:   { bg: '#F3F4F6', color: '#6B7280' },
}


export default function AdminInventoryPage() {
  const showPlaceholders = inventory.length === 0

  const [edits, setEdits]   = useState({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved]   = useState(false)

  const changedItems = inventory.filter(i => edits[i.id] !== i.stock_quantity)

  function handleEdit(id, raw) {
    setEdits(p => ({ ...p, [id]: raw === '' ? '' : Math.max(0, parseInt(raw, 10) || 0) }))
  }

  async function handleSave() {
    setSaving(true)
    // BACKEND TEAM: replace setTimeout with:
    // const updates = Object.entries(edits).map(([id, qty]) => ({ inventory_id: id, stock_quantity: Number(qty) }))
    // await fetch('/api/admin/inventory', {
    //   method: 'PATCH',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(updates),
    // })
    await new Promise(r => setTimeout(r, 700))
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div style={{ padding: '32px', maxWidth: '860px' }}>

      {/* Heading + Save button */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontFamily: '"Playfair Display",serif', fontSize: '26px', fontWeight: 700, color: '#1A1A1A', margin: '0 0 6px' }}>Inventory Management</h1>
          <p style={{ fontFamily: '"Lato",sans-serif', fontSize: '14px', color: '#888', margin: 0 }}>Update stock levels — changes reflect on the products page immediately</p>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px 200px', padding: '12px 20px', background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
          {['Product Name','Category','Stock Quantity'].map(h => <span key={h} style={{ fontFamily: '"Lato",sans-serif', fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '.06em' }}>{h}</span>)}
        </div>

        {/* PLACEHOLDER ROWS — disabled inputs shown when inventory = [] */}
        {showPlaceholders && Array.from({ length: 7 }).map((_, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 140px 200px', padding: '15px 20px', borderBottom: i < 6 ? '1px solid #F3F4F6' : 'none', alignItems: 'center' }}>
            <div style={{ width: '160px', height: '14px', background: '#F0E8D0', borderRadius: '4px' }} />
            <div style={{ width: '68px', height: '22px', background: '#F3F4F6', borderRadius: '12px' }} />
            <input disabled placeholder="0" style={{ width: '80px', padding: '8px 10px', border: '1.5px solid #E5E7EB', borderRadius: '6px', fontSize: '14px', color: '#D1D5DB', background: '#F9FAFB', cursor: 'not-allowed' }} />
          </div>
        ))}

        {/* REAL DATA ROWS — editable inputs */}
        {!showPlaceholders && inventory.map((item, i) => {
          const current    = edits[item.id] ?? item.stock_quantity
          const isLow      = Number(current) <= LOW_STOCK
          const isOut      = Number(current) === 0
          const hasChanged = current !== item.stock_quantity
          const cat        = CATEGORY_COLOURS[item.product?.category] || CATEGORY_COLOURS['Other']
          return (
            <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '1fr 140px 200px', padding: '15px 20px', borderBottom: i < inventory.length-1 ? '1px solid #F3F4F6' : 'none', alignItems: 'center', background: hasChanged ? '#FFFDF5' : 'transparent' }}>
              <span style={{ fontFamily: '"Lato",sans-serif', fontSize: '14px', fontWeight: 600, color: '#1A1A1A' }}>{item.product?.name}</span>
              <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '12px', background: cat.bg, color: cat.color, fontSize: '12px', fontWeight: 700, width: 'fit-content' }}>{item.product?.category}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {/* BACKEND TEAM: this edits[item.id] value is sent to PATCH /api/admin/inventory on save */}
                <input type="number" min="0" value={current} onChange={e => handleEdit(item.id, e.target.value)} className="gw-input"
                  style={{ width: '80px', padding: '8px 10px', fontSize: '14px', fontWeight: 700, color: isOut ? '#DC2626' : isLow ? '#D97706' : '#1A1A1A', border: `1.5px solid ${hasChanged ? '#E8D48A' : '#CCCCCC'}`, background: hasChanged ? '#FFFEF0' : '#fff' }} />
                {isOut  && <span style={{ fontFamily: '"Lato",sans-serif', fontSize: '11px', color: '#DC2626', fontWeight: 700, background: '#FEE2E2', padding: '2px 8px', borderRadius: '10px', whiteSpace: 'nowrap' }}>Sold out</span>}
                {isLow && !isOut && <span style={{ fontFamily: '"Lato",sans-serif', fontSize: '11px', color: '#D97706', fontWeight: 700, background: '#FEF3C7', padding: '2px 8px', borderRadius: '10px', whiteSpace: 'nowrap' }}>Low stock</span>}
                {hasChanged && <span style={{ fontFamily: '"Lato",sans-serif', fontSize: '11px', color: '#A07C2A', fontWeight: 600 }}>edited</span>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}