'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

const STATUS_CONFIG = {
  CONFIRMED:   { label: 'Confirmed',        bg: '#FEF3C7', color: '#92400E' },
  IN_PROGRESS: { label: 'In Progress',      bg: '#3B82F6', color: '#fff'    },
  READY:       { label: 'Ready for Pickup', bg: '#DBEAFE', color: '#1E40AF' },
  COMPLETED:   { label: 'Completed',        bg: '#DCFCE7', color: '#166534' },
  CANCELLED:   { label: 'Cancelled',        bg: '#FEE2E2', color: '#991B1B' },
}

// CANCELLED intentionally excluded — staff cannot cancel orders
const STAFF_STATUSES = ['CONFIRMED', 'IN_PROGRESS', 'READY', 'COMPLETED']

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || { label: status, bg: '#6B7280', color: '#fff' }
  return (
    <span style={{
      display: 'inline-block', background: cfg.bg, color: cfg.color,
      fontSize: '14px', fontWeight: 700, padding: '8px 20px',
      borderRadius: '8px', fontFamily: '"Lato", sans-serif',
    }}>
      {cfg.label}
    </span>
  )
}

function SkeletonBlock({ width, height, radius = '4px', style = {} }) {
  return (
    <div style={{ width, height, background: '#F0E8D0', borderRadius: radius, ...style }} />
  )
}

const formatDate  = d => new Date(d).toLocaleDateString('en-AU', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })
const formatCents = c => c != null ? `$${(c / 100).toFixed(2)}` : '—'

export default function StaffOrderDetailPage() {
  const { id } = useParams()

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

  // ── Skeleton ─────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ padding: '32px', maxWidth: '1200px', width: '100%', margin: '0 auto', fontFamily: '"Lato", sans-serif' }}>

        {/* Back link skeleton */}
        <SkeletonBlock width="120px" height="14px" style={{ marginBottom: '28px' }} />

        {/* Header skeleton */}
        <div style={{ marginBottom: '32px' }}>
          <SkeletonBlock width="320px" height="36px" style={{ marginBottom: '32px' }} />
          <div style={{ height: '2px', background: 'linear-gradient(90deg, #C9A84C, transparent)', borderRadius: '1px' }} />
        </div>

        {/* Card skeletons */}
        {[{ rows: 2 }, { rows: 4 }, { rows: 1 }].map((card, ci) => (
          <div key={ci} style={{ background: '#fff', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '24px', marginBottom: '20px' }}>
            <SkeletonBlock width="180px" height="20px" style={{ marginBottom: '20px' }} />
            {Array.from({ length: card.rows }).map((_, ri) => (
              <div key={ri} style={{ display: 'flex', gap: '16px', marginBottom: ri < card.rows - 1 ? '14px' : 0, alignItems: 'center' }}>
                <SkeletonBlock width="160px" height="13px" />
                <SkeletonBlock width="220px" height="13px" style={{ background: '#F3F4F6' }} />
              </div>
            ))}
          </div>
        ))}
      </div>
    )
  }

  // ── No order ──────────────────────────────────────────────────────────────
  if (!order) {
    return (
      <div style={{ padding: '32px', maxWidth: '1200px', width: '100%', margin: '0 auto' }}>
        <Link href="/staff/orders" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontFamily: '"Lato",sans-serif', fontSize: '14px', color: '#7B1A1A', textDecoration: 'none', marginBottom: '24px', fontWeight: 600 }}>
          ← Back to Orders
        </Link>
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '16px', color: '#B91C1C', fontFamily: '"Lato",sans-serif', fontSize: '14px' }}>
          Order not found.
        </div>
      </div>
    )
  }

  // ── Real data ─────────────────────────────────────────────────────────────
  return (
    <div style={{ padding: '32px', maxWidth: '1200px', width: '100%', margin: '0 auto', fontFamily: '"Lato", sans-serif' }}>

      {/* Back */}
      <Link href="/staff/orders" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: '#7B1A1A', textDecoration: 'none', marginBottom: '24px', fontWeight: 600 }}>
        ← Back to Orders
      </Link>

      {/* Header + gold divider */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontFamily: '"Lato", serif', fontSize: '36px', fontWeight: 700, color: '#7B1A1A', margin: '0 0 8px' }}>
              Order #{order.id.slice(0, 8).toUpperCase()}
            </h1>
            <div style={{ display: 'flex', gap: '24px', fontSize: '14px', color: '#6B7280' }}>
              <span>Customer: <strong style={{ color: '#1A1A1A' }}>{order.customer?.first_name} {order.customer?.last_name}</strong></span>
              {order.pickup_date && (
                <span>Pickup: <strong style={{ color: '#1A1A1A' }}>{formatDate(order.pickup_date)}</strong></span>
              )}
            </div>
          </div>
          <StatusBadge status={order.status} />
        </div>
        <div style={{ height: '2px', background: 'linear-gradient(90deg, #C9A84C, transparent)', borderRadius: '1px' }} />
      </div>

      {/* Locked warning */}
      {isLocked && (
        <div style={{ background: '#FFFBEB', border: '1px solid #FCD34D', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', fontSize: '14px', color: '#92400E', fontFamily: '"Lato", sans-serif' }}>
          Weights are locked and cannot be edited for orders marked as{' '}
          <strong>{STATUS_CONFIG[order.status]?.label}</strong>.
        </div>
      )}

      {/* Order Items */}
      <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '24px', marginBottom: '20px' }}>
        <h2 style={{ fontFamily: '"Lato", serif', fontSize: '20px', fontWeight: 700, color: '#1A1A1A', margin: '0 0 16px' }}>
          Order Items
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 60px 130px 170px', padding: '10px 0', borderBottom: '1px solid #E5E7EB', marginBottom: '4px' }}>
          {['Product', 'Qty', 'Est. Price', 'Actual Weight (kg)'].map(h => (
            <span key={h} style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '.06em' }}>{h}</span>
          ))}
        </div>

        {order.order_items?.map((item, i) => (
          <div key={item.id} style={{
            display: 'grid', gridTemplateColumns: '1fr 60px 130px 170px',
            padding: '14px 0',
            borderBottom: i < order.order_items.length - 1 ? '1px solid #F3F4F6' : 'none',
            alignItems: 'center',
          }}>
            <div>
              <p style={{ fontFamily: '"Lato",sans-serif', fontSize: '14px', fontWeight: 500, color: '#1A1A1A', margin: 0 }}>{item.product?.name}</p>
              {item.weight_option && (
                <p style={{ fontFamily: '"Lato",sans-serif', fontSize: '12px', color: '#9CA3AF', margin: '2px 0 0' }}>{item.weight_option.label}</p>
              )}
            </div>
            <span style={{ fontFamily: '"Lato",sans-serif', fontSize: '13px', color: '#1A1A1A' }}>{item.quantity}</span>
            <span style={{ fontFamily: '"Lato",sans-serif', fontSize: '13px', color: '#374151' }}>{formatCents(item.subtotal_cents)}</span>
            {item.product?.product_type === 'WEIGHT_RANGE' ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input
                  type="number" step="0.01" min="0"
                  value={weights[item.id] ?? ''}
                  onChange={e => setWeights(p => ({ ...p, [item.id]: e.target.value }))}
                  disabled={isLocked}
                  placeholder={isLocked ? '—' : '0.00'}
                  className="gw-input"
                  style={{
                    width: '90px', padding: '8px 10px', fontSize: '13px',
                    background: isLocked ? '#F9FAFB' : '#fff',
                    cursor: isLocked ? 'not-allowed' : 'text',
                    color: isLocked ? '#9CA3AF' : '#1A1A1A',
                  }}
                />
                <span style={{ fontFamily: '"Lato",sans-serif', fontSize: '12px', color: '#888' }}>kg</span>
              </div>
            ) : (
              <span style={{ fontFamily: '"Lato",sans-serif', fontSize: '13px', color: '#9CA3AF', fontStyle: 'italic' }}>Fixed price</span>
            )}
          </div>
        ))}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #E5E7EB' }}>
          <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '13px', color: '#6B7280' }}>
              Estimated Total: <strong style={{ color: '#1A1A1A' }}>{formatCents(order.total_cents)}</strong>
            </span>
            <span style={{ fontSize: '13px', color: '#6B7280' }}>
              Deposit Paid: <strong style={{ color: '#16A34A' }}>{formatCents(order.deposit_paid_cents)}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Update Status */}
      <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '24px' }}>
        <h2 style={{ fontFamily: '"Lato", serif', fontSize: '20px', fontWeight: 700, color: '#1A1A1A', margin: '0 0 16px' }}>
          Update Status
        </h2>
        {saveError && <p style={{ fontSize: '13px', color: '#DC2626', marginBottom: '12px' }}>{saveError}</p>}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="gw-input"
            style={{ width: '220px', cursor: 'pointer' }}
          >
            {STAFF_STATUSES.map(s => (
              <option key={s} value={s}>{STATUS_CONFIG[s]?.label}</option>
            ))}
          </select>
          <button
            onClick={handleSave}
            disabled={saving || selectedStatus === order.status}
            className="btn-primary"
            style={{ padding: '10px 28px', fontSize: '14px', opacity: selectedStatus === order.status ? 0.5 : 1 }}
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
          {saved && (
            <span style={{ fontSize: '13px', color: '#16A34A', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              Saved
            </span>
          )}
        </div>
        <p style={{ fontFamily: '"Lato",sans-serif', fontSize: '12px', color: '#9CA3AF', margin: '12px 0 0' }}>
          Note: Only admin can cancel an order.
        </p>
      </div>

    </div>
  )
}