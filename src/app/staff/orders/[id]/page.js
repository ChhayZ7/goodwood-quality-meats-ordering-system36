'use client'


import { useState, useEffect, useCallback  } from 'react'
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

export default function StaffOrderDetailPage() {
  const { id } = useParams()

  // BACKEND TEAM: pre-fill these from real order data in your useEffect
  const [order,          setOrder]          = useState(null)
  const [loading,        setLoading]        = useState(true)
  const [selectedStatus, setSelectedStatus] = useState('CONFIRMED')
  const [weights,        setWeights]        = useState({})
  const [saving,         setSaving]         = useState(false)
  const [saved,          setSaved]          = useState(false)
  const [saveError,      setSaveError]      = useState(null)

  // Weights lock when order is Ready or Completed
  const isLocked = selectedStatus === 'READY' || selectedStatus === 'COMPLETED'

  const loadOrder = useCallback(async () => {
    setLoading(true)
    try {
      const res  = await fetch(`/api/admin/orders/${id}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to load order')
      setOrder(data.order)
      setSelectedStatus(data.order.status)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { loadOrder() }, [loadOrder])

  async function handleSave() {
    setSaving(true)
    setSaveError(null)
    try {
      const res  = await fetch(`/api/admin/orders/${id}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ status: selectedStatus }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to update status')
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
      await loadOrder()
    } catch (err) {
      setSaveError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const formatDate  = d => new Date(d).toLocaleDateString('en-AU', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })
  const formatCents = c => `$${(c / 100).toFixed(2)}`

    // ── PLACEHOLDER — shown when order = null ────────────────────
  if (loading || !order) {
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

  return (
    <div style={{ padding: '32px', maxWidth: '900px' }}>
      <Link href="/staff/orders" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontFamily: '"Lato",sans-serif', fontSize: '13px', color: '#888', textDecoration: 'none', marginBottom: '20px' }}>← Back to Orders</Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <h1 style={{ fontFamily: '"Playfair Display",serif', fontSize: '24px', fontWeight: 700, color: '#1A1A1A', margin: 0 }}>Order #{order.id.slice(0, 8).toUpperCase()}</h1>
        <StatusBadge status={order.status} />
      </div>

      {/* Locked warning */}
      {isLocked && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#FEF3C7', border: '1px solid #FCD34D', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', fontFamily: '"Lato",sans-serif', fontSize: '13px', color: '#92400E' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
          Weight fields are locked — order is <strong style={{ marginLeft: '4px' }}>{STATUS_CONFIG[order.status]?.label.toLowerCase()}</strong>.
        </div>
      )}

      {/* Summary */}
      <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '24px', marginBottom: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '24px' }}>
          {[['Order Number',`#${order.id.slice(0, 8).toUpperCase()}`],['Customer',`${order.customer?.first_name} ${order.customer?.last_name}`],['Pickup Date',formatDate(order.pickup_date)],['Deposit Paid',formatCents(order.deposit_paid_cents)]].map(([l,v]) => (
            <div key={l}>
              <p style={{ fontFamily: '"Lato",sans-serif', fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '.08em', margin: '0 0 6px' }}>{l}</p>
              <p style={{ fontFamily: '"Lato",sans-serif', fontSize: '14px', fontWeight: 600, color: '#1A1A1A', margin: 0 }}>{v}</p>
            </div>
          ))}
        </div>
      </div>
            {/* Items */}
      <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #E5E7EB', overflow: 'hidden', marginBottom: '20px' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #E5E7EB' }}><h2 style={{ fontFamily: '"Playfair Display",serif', fontSize: '17px', fontWeight: 700, color: '#1A1A1A', margin: 0 }}>Order Items</h2></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 60px 130px 170px', padding: '10px 20px', background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
          {['Product','Qty','Est. Price','Actual Weight (kg)'].map(h => <span key={h} style={{ fontFamily: '"Lato",sans-serif', fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '.05em' }}>{h}</span>)}
        </div>
        {order.order_items?.map((item, i) => (
          <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '1fr 60px 130px 170px', padding: '14px 20px', borderBottom: i < order.order_items.length-1 ? '1px solid #F3F4F6' : 'none', alignItems: 'center' }}>
            <div>
              <p style={{ fontFamily: '"Lato",sans-serif', fontSize: '13px', fontWeight: 600, color: '#1A1A1A', margin: 0 }}>{item.product?.name}</p>
              {item.weight_option && <p style={{ fontFamily: '"Lato",sans-serif', fontSize: '12px', color: '#9CA3AF', margin: '2px 0 0' }}>{item.weight_option.label}</p>}
            </div>
            <span style={{ fontFamily: '"Lato",sans-serif', fontSize: '13px', color: '#374151' }}>{item.quantity}</span>
            <span style={{ fontFamily: '"Lato",sans-serif', fontSize: '13px', color: '#374151' }}>{formatCents(item.subtotal_cents)}</span>
            {/* BACKEND TEAM: weight input only for WEIGHT_RANGE products */}
            {item.product?.product_type === 'WEIGHT_RANGE' ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input type="number" step="0.01" min="0" value={weights[item.id] ?? ''} onChange={e => setWeights(p => ({...p,[item.id]:e.target.value}))} disabled={isLocked} placeholder="0.00" className="gw-input" style={{ width: '90px', padding: '8px 10px', cursor: isLocked ? 'not-allowed' : 'text', background: isLocked ? '#F9FAFB' : '#fff' }} />
                <span style={{ fontFamily: '"Lato",sans-serif', fontSize: '12px', color: '#888' }}>kg</span>
              </div>
            ) : (
              <span style={{ fontFamily: '"Lato",sans-serif', fontSize: '12px', color: '#C0C0C0', fontStyle: 'italic' }}>Fixed price</span>
            )}
          </div>
        ))}
      </div>
            {/* Status update */}
      <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '24px' }}>
        <h2 style={{ fontFamily: '"Playfair Display",serif', fontSize: '17px', fontWeight: 700, color: '#1A1A1A', margin: '0 0 16px' }}>Update Status</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* BACKEND TEAM: selectedStatus is sent in body of PATCH /api/staff/orders/[id] */}
          <select value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)} className="gw-input" style={{ width: '240px', cursor: 'pointer' }}>
            {STAFF_STATUSES.map(s => <option key={s} value={s}>{STATUS_CONFIG[s]?.label}</option>)}
          </select>
          <button onClick={handleSave} disabled={saving} className="btn-primary" style={{ padding: '10px 24px', fontSize: '14px' }}>
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
          {saved && <span style={{ fontFamily: '"Lato",sans-serif', fontSize: '13px', color: '#16A34A', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>Saved</span>}
        </div>
        <p style={{ fontFamily: '"Lato",sans-serif', fontSize: '12px', color: '#9CA3AF', margin: '12px 0 0' }}>Note: Only admin can cancel an order.</p>
      </div>
    </div>
  )
}
