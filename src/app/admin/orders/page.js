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

const ALL_TABS   = ['All', 'CONFIRMED', 'IN_PROGRESS', 'READY', 'COMPLETED', 'CANCELLED']
const TAB_LABELS = { All: 'All', CONFIRMED: 'Confirmed', IN_PROGRESS: 'In Progress', READY: 'Ready for Pickup', COMPLETED: 'Completed', CANCELLED: 'Cancelled' }
// BACKEND TEAM: replace with useState([]) + useEffect fetching /api/admin/orders
const orders = []

export default function AdminOrdersPage() {
  const showPlaceholders = orders.length === 0
  const [activeTab, setActiveTab] = useState('All')
  const [search, setSearch]       = useState('')

    const filtered = orders.filter(o => {
    const tabMatch    = activeTab === 'All' || o.status === activeTab
    const q           = search.toLowerCase()
    const searchMatch = !q || o.order_number.toLowerCase().includes(q) || o.customer_name.toLowerCase().includes(q)
    return tabMatch && searchMatch
  })

  // 7 columns — admin has extra "Updated By" vs staff's 6
  const COLS = '140px 1fr 150px 170px 110px 130px 80px'

  return (
    <div style={{ padding: '32px', maxWidth: '1200px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontFamily: '"Playfair Display",serif', fontSize: '26px', fontWeight: 700, color: '#1A1A1A', margin: '0 0 6px' }}>Order Management</h1>
        <p style={{ fontFamily: '"Lato",sans-serif', fontSize: '14px', color: '#888', margin: 0 }}>All orders with complete audit trail</p>
      </div>

      {/* Search */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ position: 'relative', display: 'inline-block', width: '340px' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#AAAAAA" strokeWidth="2" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input className="gw-input" type="text" placeholder="Search order # or customer…" value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: '38px', width: '340px' }} />
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {ALL_TABS.map(tab => {
          const isActive = tab === activeTab
          return <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '7px 16px', borderRadius: '20px', border: `1.5px solid ${isActive ? '#7B1A1A' : '#E5E7EB'}`, background: isActive ? '#7B1A1A' : '#fff', color: isActive ? '#fff' : '#555', fontSize: '13px', fontWeight: isActive ? 700 : 400, cursor: 'pointer', fontFamily: '"Lato",sans-serif', transition: 'all .15s' }}>{TAB_LABELS[tab]}</button>
        })}
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