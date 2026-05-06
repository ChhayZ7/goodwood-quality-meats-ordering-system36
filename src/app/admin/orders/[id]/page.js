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

// Admin can set ALL statuses including CANCELLED
const ADMIN_STATUSES = ['CONFIRMED', 'IN_PROGRESS', 'READY', 'COMPLETED', 'CANCELLED']

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || { label: status, bg: '#6B7280', color: '#fff' }
  return <span style={{ display: 'inline-block', background: cfg.bg, color: cfg.color, fontSize: '12px', fontWeight: 700, padding: '4px 14px', borderRadius: '20px' }}>{cfg.label}</span>
}

// BACKEND TEAM: replace with useState(null) + useEffect fetch (see notes above)
const order = null

export default function AdminOrderDetailPage() {
    const { id } = useParams()

    // BACKEND TEAM: pre-fill these from real order data in your useEffect
    const [selectedStatus, setSelectedStatus] = useState('CONFIRMED')
    const [weights, setWeights]               = useState({})
    const [saving, setSaving]                 = useState(false)
    const [saved, setSaved]                   = useState(false)
    const [showCancel, setShowCancel]         = useState(false)
    const [cancelling, setCancelling]         = useState(false)

    const isLocked = selectedStatus === 'READY' || selectedStatus === 'COMPLETED'

    async function handleSave() {
      setSaving(true)
      await new Promise(r => setTimeout(r, 700))
      setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 3000)
    }

    async function handleCancel() {
      setCancelling(true)
      await new Promise(r => setTimeout(r, 700))
      setCancelling(false); setShowCancel(false); setSelectedStatus('CANCELLED')
    }

    const formatDate   = d => new Date(d).toLocaleDateString('en-AU', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })
    const formatSmall  = d => new Date(d).toLocaleString('en-AU', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    const formatCents  = c => `$${(c / 100).toFixed(2)}`

    if (!order) {
    return (
      <div style={{ padding: '32px', maxWidth: '920px' }}>
        <Link href="/admin/orders" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontFamily: '"Lato",sans-serif', fontSize: '13px', color: '#888', textDecoration: 'none', marginBottom: '20px' }}>← Back to Orders</Link>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h1 style={{ fontFamily: '"Playfair Display",serif', fontSize: '24px', fontWeight: 700, color: '#D1D5DB', margin: 0 }}>Order #GW2025XXXX</h1>
            <span style={{ display: 'inline-block', background: '#F3F4F6', color: '#D1D5DB', fontSize: '12px', fontWeight: 700, padding: '4px 14px', borderRadius: '20px' }}>Status</span>
          </div>
          {/* Greyed Cancel Order button */}
          <div style={{ padding: '8px 18px', borderRadius: '8px', border: '1.5px solid #E5E7EB', fontSize: '13px', fontWeight: 700, color: '#D1D5DB', cursor: 'default' }}>Cancel Order</div>
        </div>

        {/* Audit trail placeholder */}
        <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '24px', marginBottom: '20px' }}>
          <h2 style={{ fontFamily: '"Playfair Display",serif', fontSize: '17px', fontWeight: 700, color: '#1A1A1A', margin: '0 0 16px' }}>Audit Trail</h2>
          {[0,1,2].map(i => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: i<2?'12px':0, marginBottom: i<2?'12px':0, borderBottom: i<2?'1px solid #F3F4F6':'none' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#E5E7EB', flexShrink: 0 }} />
              <div style={{ flex: 1, height: '12px', background: '#F0E8D0', borderRadius: '4px' }} />
              <div style={{ width: '80px', height: '12px', background: '#F3F4F6', borderRadius: '4px' }} />
            </div>
          ))}
        </div>

        {/* Summary placeholder */}
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

        {/* Status section placeholder */}
        <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '24px' }}>
          <h2 style={{ fontFamily: '"Playfair Display",serif', fontSize: '17px', fontWeight: 700, color: '#1A1A1A', margin: '0 0 16px' }}>Update Status</h2>
          <div style={{ display: 'flex', gap: '12px' }}>
            <select disabled style={{ width: '240px', padding: '10px 14px', border: '1.5px solid #E5E7EB', borderRadius: '8px', fontSize: '14px', color: '#D1D5DB', background: '#F9FAFB', cursor: 'not-allowed' }}><option>— not connected —</option></select>
            <div style={{ padding: '10px 24px', background: '#F0E8D0', borderRadius: '8px', fontSize: '14px', fontWeight: 700, color: '#C0C0C0', cursor: 'default' }}>Save Changes</div>
          </div>
        </div>
      </div>
    )
  }

    // ── REAL DATA LAYOUT ──────────────────────────────────────────
  const isCancelled = order.status === 'CANCELLED'

  return (
    <div style={{ padding: '32px', maxWidth: '920px' }}>
      <Link href="/admin/orders" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontFamily: '"Lato",sans-serif', fontSize: '13px', color: '#888', textDecoration: 'none', marginBottom: '20px' }}>← Back to Orders</Link>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h1 style={{ fontFamily: '"Playfair Display",serif', fontSize: '24px', fontWeight: 700, color: '#1A1A1A', margin: 0 }}>Order #{order.order_number}</h1>
          <StatusBadge status={order.status} />
        </div>
        {/* BACKEND TEAM: Cancel button hidden once order is already cancelled */}
        {!isCancelled && (
          <button onClick={() => setShowCancel(true)} style={{ padding: '8px 18px', borderRadius: '8px', border: '1.5px solid #DC2626', background: 'transparent', fontSize: '13px', fontWeight: 700, color: '#DC2626', cursor: 'pointer', fontFamily: '"Lato",sans-serif' }}>
            Cancel Order
          </button>
        )}
      </div>

            {/* Confirm cancel dialog */}
      {showCancel && (
        <div style={{ position: 'fixed', top:0,left:0,right:0,bottom:0, background:'rgba(0,0,0,0.4)', zIndex:999, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div style={{ background:'#fff', borderRadius:'12px', padding:'28px 32px', maxWidth:'400px', width:'90%', boxShadow:'0 16px 48px rgba(0,0,0,0.15)' }}>
            <h3 style={{ fontFamily:'"Playfair Display",serif', fontSize:'18px', fontWeight:700, color:'#1A1A1A', margin:'0 0 10px' }}>Cancel this order?</h3>
            <p style={{ fontFamily:'"Lato",sans-serif', fontSize:'14px', color:'#555', lineHeight:1.6, margin:'0 0 24px' }}>This cannot be undone. The order status will be set to Cancelled.</p>
            <div style={{ display:'flex', gap:'10px' }}>
              <button onClick={handleCancel} disabled={cancelling} className="btn-primary" style={{ flex:1, padding:'10px', fontSize:'14px', background: cancelling ? '#9CA3AF' : '#DC2626' }}>
                {cancelling ? 'Cancelling…' : 'Yes, Cancel'}
              </button>
              <button onClick={() => setShowCancel(false)} style={{ flex:1, padding:'10px', background:'#F3F4F6', color:'#555', border:'none', borderRadius:'8px', fontSize:'14px', fontWeight:700, cursor:'pointer', fontFamily:'"Lato",sans-serif' }}>Keep Order</button>
            </div>
          </div>
        </div>
      )}
      {/* Audit trail — admin-only section */}
      <div style={{ background:'#fff', borderRadius:'12px', border:'1px solid #E5E7EB', padding:'24px', marginBottom:'20px' }}>
        <h2 style={{ fontFamily:'"Playfair Display",serif', fontSize:'17px', fontWeight:700, color:'#1A1A1A', margin:'0 0 16px' }}>Audit Trail</h2>
        {/* BACKEND TEAM: audit_trail array comes from GET /api/admin/orders/[id] */}
        {order.audit_trail?.length > 0 ? order.audit_trail.map((entry, i) => (
          <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:'12px', paddingBottom:i<order.audit_trail.length-1?'12px':0, marginBottom:i<order.audit_trail.length-1?'12px':0, borderBottom:i<order.audit_trail.length-1?'1px solid #F3F4F6':'none' }}>
            <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:'#7B1A1A', flexShrink:0, marginTop:'5px' }} />
            <div>
              <p style={{ fontFamily:'"Lato",sans-serif', fontSize:'13px', fontWeight:600, color:'#1A1A1A', margin:0 }}>{entry.action}</p>
              <p style={{ fontFamily:'"Lato",sans-serif', fontSize:'12px', color:'#9CA3AF', margin:'2px 0 0' }}>by {entry.performed_by} · {formatSmall(entry.timestamp)}</p>
            </div>
          </div>
        )) : <p style={{ fontFamily:'"Lato",sans-serif', fontSize:'13px', color:'#9CA3AF', margin:0 }}>No audit history yet.</p>}
      </div>

      {/* Order summary */}
      <div style={{ background:'#fff', borderRadius:'12px', border:'1px solid #E5E7EB', padding:'24px', marginBottom:'20px' }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'24px' }}>
          {[['Order Number',`#${order.order_number}`],['Customer',`${order.customer?.first_name} ${order.customer?.last_name}`],['Pickup Date',formatDate(order.pickup_date)],['Deposit Paid',formatCents(order.deposit_paid_cents)]].map(([l,v]) => (
            <div key={l}>
              <p style={{ fontFamily:'"Lato",sans-serif', fontSize:'11px', fontWeight:700, color:'#9CA3AF', textTransform:'uppercase', letterSpacing:'.08em', margin:'0 0 6px' }}>{l}</p>
              <p style={{ fontFamily:'"Lato",sans-serif', fontSize:'14px', fontWeight:600, color:'#1A1A1A', margin:0 }}>{v}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Status update — hidden if order is already cancelled */}
      {!isCancelled && (
        <div style={{ background:'#fff', borderRadius:'12px', border:'1px solid #E5E7EB', padding:'24px' }}>
          <h2 style={{ fontFamily:'"Playfair Display",serif', fontSize:'17px', fontWeight:700, color:'#1A1A1A', margin:'0 0 16px' }}>Update Status</h2>
          <div style={{ display:'flex', alignItems:'center', gap:'12px', flexWrap:'wrap' }}>
            {/* BACKEND TEAM: selectedStatus sent in body of PATCH /api/admin/orders/[id] */}
            <select value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)} className="gw-input" style={{ width:'240px', cursor:'pointer' }}>
              {ADMIN_STATUSES.map(s => <option key={s} value={s}>{STATUS_CONFIG[s]?.label}</option>)}
            </select>
            <button onClick={handleSave} disabled={saving} className="btn-primary" style={{ padding:'10px 24px', fontSize:'14px' }}>{saving ? 'Saving…' : 'Save Changes'}</button>
            {saved && <span style={{ fontFamily:'"Lato",sans-serif', fontSize:'13px', color:'#16A34A', fontWeight:600, display:'flex', alignItems:'center', gap:'5px' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>Saved</span>}
          </div>
        </div>
      )}
    </div>
  )

}