'use client'


import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

const STATUS_CONFIG = {
  CONFIRMED:   { label: 'Confirmed',        bg: '#F59E0B', color: '#fff' },
  IN_PROGRESS: { label: 'In Progress',      bg: '#3B82F6', color: '#fff' },
  READY:       { label: 'Ready for Pickup', bg: '#22C55E', color: '#fff' },
  COMPLETED:   { label: 'Completed',        bg: '#6B7280', color: '#fff' },
  CANCELLED:   { label: 'Cancelled',        bg: '#EF4444', color: '#fff' },
}

// CANCELLED intentionally excluded — staff cannot cancel orders
const STAFF_STATUSES = ['CONFIRMED', 'IN_PROGRESS', 'READY', 'COMPLETED']

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || { label: status, bg: '#6B7280', color: '#fff' }
  return <span style={{ display: 'inline-block', background: cfg.bg, color: cfg.color, fontSize: '12px', fontWeight: 700, padding: '4px 14px', borderRadius: '20px' }}>{cfg.label}</span>
}

const order = null

export default function StaffOrderDetailPage() {
  const { id } = useParams()

  // BACKEND TEAM: pre-fill these from real order data in your useEffect
  const [selectedStatus, setSelectedStatus] = useState('CONFIRMED')
  const [weights, setWeights]               = useState({})
  const [saving, setSaving]                 = useState(false)
  const [saved, setSaved]                   = useState(false)

  // Weights lock when order is Ready or Completed
  const isLocked = selectedStatus === 'READY' || selectedStatus === 'COMPLETED'

  async function handleSave() {
    setSaving(true)
    await new Promise(r => setTimeout(r, 700))
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const formatDate  = d => new Date(d).toLocaleDateString('en-AU', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })
  const formatCents = c => `$${(c / 100).toFixed(2)}`

    // ── PLACEHOLDER — shown when order = null ────────────────────
  if (!order) {
    return (
      <div style={{ padding: '32px', maxWidth: '900px' }}>
        <Link href="/staff/orders" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontFamily: '"Lato",sans-serif', fontSize: '13px', color: '#888', textDecoration: 'none', marginBottom: '20px' }}>← Back to Orders</Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <h1 style={{ fontFamily: '"Playfair Display",serif', fontSize: '24px', fontWeight: 700, color: '#D1D5DB', margin: 0 }}>Order #GW2025XXXX</h1>
          <span style={{ display: 'inline-block', background: '#F3F4F6', color: '#D1D5DB', fontSize: '12px', fontWeight: 700, padding: '4px 14px', borderRadius: '20px' }}>Status</span>
        </div>

        {/* Summary card */}
        <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '24px', marginBottom: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '24px' }}>
            {['Order Number','Customer','Pickup Date','Deposit Paid'].map(l => (
              <div key={l}>
                <p style={{ fontFamily: '"Lato",sans-serif', fontSize: '11px', fontWeight: 700, color: '#C0C0C0', textTransform: 'uppercase', letterSpacing: '.08em', margin: '0 0 6px' }}>{l}</p>
                <p style={{ fontFamily: '"Lato",sans-serif', fontSize: '14px', color: '#D1D5DB', margin: 0 }}>— —</p>
              </div>
            ))}
          </div>
        </div>
                {/* Items table */}
        <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #E5E7EB', overflow: 'hidden', marginBottom: '20px' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #E5E7EB' }}>
            <h2 style={{ fontFamily: '"Playfair Display",serif', fontSize: '17px', fontWeight: 700, color: '#1A1A1A', margin: 0 }}>Order Items</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 60px 130px 170px', padding: '10px 20px', background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
            {['Product','Qty','Est. Price','Actual Weight (kg)'].map(h => <span key={h} style={{ fontFamily: '"Lato",sans-serif', fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '.05em' }}>{h}</span>)}
          </div>
          {[0,1,2].map(i => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 60px 130px 170px', padding: '14px 20px', borderBottom: i < 2 ? '1px solid #F3F4F6' : 'none', alignItems: 'center' }}>
              <div style={{ width: '140px', height: '13px', background: '#F0E8D0', borderRadius: '4px' }} />
              <span style={{ color: '#D1D5DB' }}>—</span>
              <span style={{ color: '#D1D5DB' }}>$0.00</span>
              <input disabled placeholder="0.00" style={{ width: '90px', padding: '8px 10px', border: '1.5px solid #E5E7EB', borderRadius: '6px', fontSize: '13px', color: '#D1D5DB', background: '#F9FAFB', cursor: 'not-allowed' }} />
            </div>
          ))}
        </div>
                {/* Status section */}
        <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '24px' }}>
          <h2 style={{ fontFamily: '"Playfair Display",serif', fontSize: '17px', fontWeight: 700, color: '#1A1A1A', margin: '0 0 16px' }}>Update Status</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <select disabled style={{ width: '240px', padding: '10px 14px', border: '1.5px solid #E5E7EB', borderRadius: '8px', fontSize: '14px', color: '#D1D5DB', background: '#F9FAFB', cursor: 'not-allowed' }}><option>— not connected —</option></select>
            <div style={{ padding: '10px 24px', background: '#F0E8D0', borderRadius: '8px', fontSize: '14px', fontWeight: 700, color: '#C0C0C0', cursor: 'default' }}>Save Changes</div>
          </div>
          <p style={{ fontFamily: '"Lato",sans-serif', fontSize: '12px', color: '#C0C0C0', margin: '12px 0 0' }}>Note: Only admin can cancel an order.</p>
        </div>
      </div>
    )
  }
