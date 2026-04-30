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
      </div>
    </div>
  )
}