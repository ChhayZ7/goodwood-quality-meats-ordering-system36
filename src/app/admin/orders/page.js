'use client'

import {useState} from 'react'
import Link from 'next/link'

const STATUS_CONFIG = {
  CONFIRMED:   { label: 'Confirmed',        bg: '#F59E0B', color: '#fff' },
  IN_PROGRESS: { label: 'In Progress',      bg: '#3B82F6', color: '#fff' },
  READY:       { label: 'Ready for Pickup', bg: '#22C55E', color: '#fff' },
  COMPLETED:   { label: 'Completed',        bg: '#6B7280', color: '#fff' },
  CANCELLED:   { label: 'Cancelled',        bg: '#EF4444', color: '#fff' },
}

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || { label: status, bg: '#6B7280', color: '#fff' }
  return <span style={{ display: 'inline-block', background: cfg.bg, color: cfg.color, fontSize: '12px', fontWeight: 700, padding: '4px 14px', borderRadius: '20px', whiteSpace: 'nowrap' }}>{cfg.label}</span>
}

// BACKEND TEAM: replace with useState([]) + useEffect fetching /api/admin/orders
const orders = []

export default function AdminOrdersPage() {
  const showPlaceholders = orders.length === 0

  // 7 columns — admin has extra "Updated By" vs staff's 6
  const COLS = '140px 1fr 150px 170px 110px 130px 80px'

  return (
    <div style={{ padding: '32px', maxWidth: '1200px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontFamily: '"Playfair Display",serif', fontSize: '26px', fontWeight: 700, color: '#1A1A1A', margin: '0 0 6px' }}>Order Management</h1>
        <p style={{ fontFamily: '"Lato",sans-serif', fontSize: '14px', color: '#888', margin: 0 }}>All orders with complete audit trail</p>
      </div>
            {/* Table */}
      <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: COLS, padding: '12px 20px', background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
          {['Order #','Customer','Pickup Date','Status','Updated','Updated By',''].map(h => <span key={h} style={{ fontFamily: '"Lato",sans-serif', fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '.06em' }}>{h}</span>)}
        </div>

        {/* PLACEHOLDER ROWS */}
        {showPlaceholders && Array.from({ length: 6 }).map((_, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: COLS, padding: '15px 20px', borderBottom: i < 5 ? '1px solid #F3F4F6' : 'none', alignItems: 'center' }}>
            <span style={{ fontFamily: 'monospace', fontSize: '13px', color: '#D1D5DB' }}>GW2025XXXX</span>
            <span style={{ fontSize: '13px', color: '#D1D5DB' }}>— —</span>
            <span style={{ fontSize: '13px', color: '#D1D5DB' }}>-- --- ----</span>
            <span style={{ display: 'inline-block', background: '#F3F4F6', color: '#D1D5DB', fontSize: '12px', fontWeight: 700, padding: '4px 14px', borderRadius: '20px' }}>Status</span>
            <span style={{ fontSize: '12px', color: '#D1D5DB' }}>— —</span>
            {/* Updated By — admin-only column */}
            <span style={{ fontSize: '12px', color: '#D1D5DB' }}>— —</span>
            <div style={{ padding: '5px 12px', borderRadius: '6px', background: '#F3F4F6', color: '#D1D5DB', fontSize: '12px', fontWeight: 700, textAlign: 'center' }}>View</div>
          </div>
        ))}
      </div>
    </div>
  )
}