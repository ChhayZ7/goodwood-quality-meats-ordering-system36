'use client'
import { useState, useEffect } from 'react'
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

  const [inventory, setInventory] = useState([])
  useEffect(() => {
    fetch('/api/admin/inventory')
      .then(r => r.json())
      .then(d => setInventory(d.inventory ?? []))
  }, [])
  const showPlaceholders = inventory.length === 0
  const lowCount = inventory.filter(i => i.stock_quantity <= LOW_STOCK).length

  return (
    <div style={{ padding: '32px', maxWidth: '800px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontFamily: '"Playfair Display",serif', fontSize: '26px', fontWeight: 700, color: '#1A1A1A', margin: '0 0 6px' }}>Inventory</h1>
          <p style={{ fontFamily: '"Lato",sans-serif', fontSize: '14px', color: '#888', margin: 0 }}>Current stock levels — read only</p>
        </div>
        {/* Low stock badge — only appears when real data is loaded */}
        {!showPlaceholders && lowCount > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px', borderRadius: '8px', background: '#FEE2E2', border: '1px solid #FECACA' }}>
            <span style={{ fontFamily: '"Lato",sans-serif', fontSize: '13px', fontWeight: 700, color: '#991B1B' }}>{lowCount} item{lowCount > 1 ? 's' : ''} low on stock</span>
          </div>
        )}
      </div>

      {/* Read-only notice */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderRadius: '8px', background: '#F0E8D0', border: '1px solid #E8D48A', marginBottom: '20px', width: 'fit-content' }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#7B1A1A" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
        <span style={{ fontFamily: '"Lato",sans-serif', fontSize: '12px', fontWeight: 600, color: '#7B1A1A' }}>Read only — contact an admin to update stock levels</span>
      </div>
      
            {/* Table */}
      <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px 160px', padding: '12px 20px', background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
          {['Product Name','Category','Current Stock'].map(h => <span key={h} style={{ fontFamily: '"Lato",sans-serif', fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '.06em' }}>{h}</span>)}
        </div>

        {/* PLACEHOLDER ROWS — shown when inventory = [] */}
        {showPlaceholders && Array.from({ length: 7 }).map((_, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 140px 160px', padding: '15px 20px', borderBottom: i < 6 ? '1px solid #F3F4F6' : 'none', alignItems: 'center' }}>
            <div style={{ width: '160px', height: '14px', background: '#F0E8D0', borderRadius: '4px' }} />
            <div style={{ width: '68px', height: '22px', background: '#F3F4F6', borderRadius: '12px' }} />
            <span style={{ fontFamily: '"Lato",sans-serif', fontSize: '13px', color: '#D1D5DB' }}>—</span>
          </div>
        ))}

        {/* REAL DATA ROWS */}
        {!showPlaceholders && inventory.map((item, i) => {
          const isLow = item.stock_quantity <= LOW_STOCK
          const isOut = item.stock_quantity === 0
          const cat   = CATEGORY_COLOURS[item.product?.category] || CATEGORY_COLOURS['Other']
          return (
            <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '1fr 140px 160px', padding: '15px 20px', borderBottom: i < inventory.length-1 ? '1px solid #F3F4F6' : 'none', alignItems: 'center', background: isOut ? '#FFFBFB' : 'transparent' }}>
              <span style={{ fontFamily: '"Lato",sans-serif', fontSize: '14px', fontWeight: 600, color: '#1A1A1A' }}>{item.product?.name}</span>
              <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '12px', background: cat.bg, color: cat.color, fontSize: '12px', fontWeight: 700, width: 'fit-content' }}>{item.product?.category}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontFamily: '"Lato",sans-serif', fontSize: '14px', fontWeight: isLow ? 700 : 400, color: isOut ? '#DC2626' : isLow ? '#D97706' : '#1A1A1A' }}>{item.stock_quantity}</span>
                {isOut  && <span style={{ fontFamily: '"Lato",sans-serif', fontSize: '11px', color: '#DC2626', fontWeight: 700, background: '#FEE2E2', padding: '2px 8px', borderRadius: '10px' }}>Sold out</span>}
                {isLow && !isOut && <span style={{ fontFamily: '"Lato",sans-serif', fontSize: '11px', color: '#D97706', fontWeight: 700, background: '#FEF3C7', padding: '2px 8px', borderRadius: '10px' }}>Low stock</span>}
              </div>
            </div>
          )
        })}
      </div>
    

      </div>
  )
}