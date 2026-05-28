'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

const STATUS_CONFIG = {
  CONFIRMED: { label: 'Confirmed', bg: '#FEF3C7', color: '#92400E' },
  IN_PROGRESS: { label: 'In Progress', bg: '#3B82F6', color: '#fff' },
  READY: { label: 'Ready for Pickup', bg: '#DBEAFE', color: '#1E40AF' },
  COMPLETED: { label: 'Completed', bg: '#DCFCE7', color: '#166534' },
  CANCELLED: { label: 'Cancelled', bg: '#FEE2E2', color: '#991B1B' },
}

const ORDER_STATUSES = ['CONFIRMED', 'IN_PROGRESS', 'READY', 'COMPLETED']

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

const formatDate = d => new Date(d).toLocaleDateString('en-AU', { day: '2-digit', month: '2-digit', year: 'numeric' })
const formatSmall = d => new Date(d).toLocaleString('en-AU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
const formatCents = c => c != null ? `$${(c / 100).toFixed(2)}` : '—'
const shortNum = id => id ? `GW${id.slice(0, 8).toUpperCase()}` : '—'

function SkeletonBlock({ width, height, radius = '4px', style = {} }) {
  return (
    <div style={{ width, height, background: '#F0E8D0', borderRadius: radius, ...style }} />
  )
}

export default function AdminOrderDetailPage() {
  const { id } = useParams()
  const router = useRouter()

  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(null)
  const [selectedStatus, setSelectedStatus] = useState('')
  const [weights, setWeights] = useState({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState(null)
  const [showCancelForm, setShowCancelForm] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [cancelReasonErr, setCancelReasonErr] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [cancelError, setCancelError] = useState(null)

  const loadOrder = useCallback(async () => {
    setLoading(true)
    setFetchError(null)
    try {
      const res = await fetch(`/api/admin/orders/${id}`)
      if (res.status === 401) { router.replace('/login'); return }
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to load order')
      setOrder(data.order)
      setSelectedStatus(data.order.status)
    } catch (err) {
      setFetchError(err.message)
    } finally {
      setLoading(false)
    }
  }, [id, router])

  useEffect(() => { loadOrder() }, [loadOrder])

  async function handleUpdateStatus() {
    if (!order || selectedStatus === order.status) return
    setSaving(true)
    setSaveError(null)
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: selectedStatus }),
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

  async function handleCancel() {
    if (!cancelReason.trim()) { setCancelReasonErr(true); return }
    setCancelReasonErr(false)
    setCancelling(true)
    setCancelError(null)
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELLED', reason: cancelReason.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to cancel order')
      setShowCancelForm(false)
      setCancelReason('')
      await loadOrder()
    } catch (err) {
      setCancelError(err.message)
    } finally {
      setCancelling(false)
    }
  }

  // Loading skeleton
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
        {[
          { rows: 2 },
          { rows: 4 },
          { rows: 1 },
          { rows: 1 },
        ].map((card, ci) => (
          <div key={ci} style={{ background: '#fff', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '24px', marginBottom: '20px' }}>
            {/* Card title */}
            <SkeletonBlock width="180px" height="20px" style={{ marginBottom: '20px' }} />
            {/* Card rows */}
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

  // Error
  if (fetchError || !order) {
    return (
      <div style={{ padding: '32px', maxWidth: '1200px', width: '100%', margin: '0 auto' }}>
        <Link href="/admin/orders" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontFamily: '"Lato",sans-serif', fontSize: '14px', color: '#7B1A1A', textDecoration: 'none', marginBottom: '24px', fontWeight: 600 }}>
          ← Back to Orders
        </Link>
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '16px', color: '#B91C1C', fontFamily: '"Lato",sans-serif', fontSize: '14px' }}>
          {fetchError ?? 'Order not found.'}
        </div>
      </div>
    )
  }

  const isCancelled = order.status === 'CANCELLED'
  const isLocked = ['READY', 'COMPLETED'].includes(order.status)
  const auditLog = order.audit_log ?? []

  const lastStatusEntry = auditLog.find(e => e.field === 'status')
  const lastWeightEntry = auditLog.find(e => e.field === 'actual_weight')

  return (
    <div style={{ padding: '32px', maxWidth: '1200px', width: '100%', margin: '0 auto', fontFamily: '"Lato", sans-serif' }}>

      {/* Back */}
      <Link href="/admin/orders" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: '#7B1A1A', textDecoration: 'none', marginBottom: '24px', fontWeight: 600 }}>
        ← Back to Orders
      </Link>

      {/* Header + gold divider */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontFamily: '"Lato", serif', fontSize: '36px', fontWeight: 700, color: '#7B1A1A', margin: '0 0 8px' }}>
              Order #{shortNum(order.id)}
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

      {/* Audit Trail */}
      <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '24px', marginBottom: '20px' }}>
        <h2 style={{ fontFamily: '"Lato", serif', fontSize: '20px', fontWeight: 700, color: '#1A1A1A', margin: '0 0 16px' }}>
          Audit Trail
        </h2>
        {auditLog.length === 0 ? (
          <p style={{ fontSize: '14px', color: '#9CA3AF', margin: 0 }}>No audit history yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {lastStatusEntry && (
              <p style={{ fontSize: '14px', color: '#555', margin: 0 }}>
                <strong style={{ color: '#1A1A1A' }}>Status last updated by:</strong>{' '}
                <span style={{ color: '#6B7280' }}>
                  {lastStatusEntry.changed_by_user?.first_name} {lastStatusEntry.changed_by_user?.last_name} — {formatSmall(lastStatusEntry.created_at)}
                </span>
              </p>
            )}
            {lastWeightEntry && (
              <p style={{ fontSize: '14px', color: '#555', margin: 0 }}>
                <strong style={{ color: '#1A1A1A' }}>Actual weights entered by:</strong>{' '}
                <span style={{ color: '#6B7280' }}>
                  {lastWeightEntry.changed_by_user?.first_name} {lastWeightEntry.changed_by_user?.last_name} — {formatSmall(lastWeightEntry.created_at)}
                </span>
              </p>
            )}
            {auditLog
              .filter(e => e.field !== 'status' && e.field !== 'actual_weight')
              .map((entry, i) => (
                <p key={i} style={{ fontSize: '14px', color: '#555', margin: 0 }}>
                  <strong style={{ color: '#1A1A1A' }}>{entry.field} changed:</strong>{' '}
                  <span style={{ color: '#6B7280' }}>
                    {entry.old_value ?? 'none'} → {entry.new_value} by {entry.changed_by_user?.first_name} {entry.changed_by_user?.last_name} — {formatSmall(entry.created_at)}
                  </span>
                </p>
              ))}
          </div>
        )}
      </div>

      {/* Order Items */}
      <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '24px', marginBottom: '20px' }}>
        <h2 style={{ fontFamily: '"Lato", serif', fontSize: '20px', fontWeight: 700, color: '#1A1A1A', margin: '0 0 16px' }}>
          Order Items
        </h2>

        {isLocked && (
          <div style={{ background: '#FFFBEB', border: '1px solid #FCD34D', borderRadius: '8px', padding: '12px 16px', marginBottom: '16px', fontSize: '14px', color: '#92400E' }}>
            Weights are locked and cannot be edited for orders marked as{' '}
            <strong>{STATUS_CONFIG[order.status]?.label}</strong>.
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px 160px 100px 180px', padding: '10px 0', borderBottom: '1px solid #E5E7EB', marginBottom: '4px' }}>
          {['Product', 'Type', 'Weight Range', 'Quantity', 'Actual Weight (kg)'].map(h => (
            <span key={h} style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '.06em' }}>{h}</span>
          ))}
        </div>

        {(order.order_items ?? []).map((item, i) => {
          const isWeightBased = item.product?.product_type === 'WEIGHT_RANGE'
          const weightRange = item.weight_option
            ? `${item.weight_option.min_weight_kg}–${item.weight_option.max_weight_kg} kg`
            : item.weight_preference ?? '—'
          return (
            <div key={item.id ?? i} style={{
              display: 'grid', gridTemplateColumns: '1fr 140px 160px 100px 180px',
              padding: '14px 0',
              borderBottom: i < order.order_items.length - 1 ? '1px solid #F3F4F6' : 'none',
              alignItems: 'center',
            }}>
              <span style={{ fontSize: '14px', color: '#1A1A1A', fontWeight: 500 }}>{item.product?.name ?? '—'}</span>
              <span style={{ fontSize: '13px', color: '#6B7280' }}>{isWeightBased ? 'Weight-based' : 'Fixed price'}</span>
              <span style={{ fontSize: '13px', color: '#6B7280' }}>{isWeightBased ? weightRange : '—'}</span>
              <span style={{ fontSize: '13px', color: '#1A1A1A' }}>{item.quantity}</span>
              {isWeightBased ? (
                <input
                  type="number" step="0.01" min="0"
                  value={weights[item.id] ?? ''}
                  onChange={e => setWeights(p => ({ ...p, [item.id]: e.target.value }))}
                  disabled={isLocked}
                  placeholder={isLocked ? '—' : '0.00'}
                  className="gw-input"
                  style={{
                    width: '120px', padding: '8px 12px', fontSize: '13px',
                    background: isLocked ? '#F9FAFB' : '#fff',
                    cursor: isLocked ? 'not-allowed' : 'text',
                    color: isLocked ? '#9CA3AF' : '#1A1A1A',
                  }}
                />
              ) : (
                <span style={{ fontSize: '13px', color: '#9CA3AF', fontStyle: 'italic' }}>Fixed price</span>
              )}
            </div>
          )
        })}

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
      {/*Overall Notes */}
      <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '24px', marginBottom: '20px' }}>
        <h2 style={{ fontFamily: '"Lato", serif', fontSize: '20px', fontWeight: 700, color: '#1A1A1A', margin: '0 0 16px' }}>
          Notes
        </h2>
        {order.notes
          ? <p style={{ fontSize: '14px', color: '#1A1A1A', fontStyle: 'italic', margin: 0 }}>{order.notes}</p>
          : <p style={{ fontSize: '14px', color: '#9CA3AF', margin: 0 }}>No specific requirement for this order</p>
        }
      </div>
      {/* Update Status */}
      {!isCancelled && (
        <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '24px', marginBottom: '20px' }}>
          <h2 style={{ fontFamily: '"Lato", serif', fontSize: '20px', fontWeight: 700, color: '#1A1A1A', margin: '0 0 16px' }}>
            Update Status
          </h2>
          {saveError && <p style={{ fontSize: '13px', color: '#DC2626', marginBottom: '12px' }}>{saveError}</p>}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="gw-input"
              style={{ width: '220px', cursor: 'pointer' }}
            >
              {ORDER_STATUSES.map(s => (
                <option key={s} value={s}>{STATUS_CONFIG[s]?.label}</option>
              ))}
            </select>
            <button
              onClick={handleUpdateStatus}
              disabled={saving || selectedStatus === order.status}
              className="btn-primary"
              style={{ padding: '10px 28px', fontSize: '14px', opacity: selectedStatus === order.status ? 0.5 : 1 }}
            >
              {saving ? 'Saving…' : 'Update Status'}
            </button>
            {saved && (
              <span style={{ fontSize: '13px', color: '#16A34A', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                Saved
              </span>
            )}
          </div>
        </div>
      )}

      {/* Order Actions */}
      <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '24px' }}>
        <h2 style={{ fontFamily: '"Lato", serif', fontSize: '20px', fontWeight: 700, color: '#1A1A1A', margin: '0 0 20px' }}>
          Order Actions
        </h2>

        {!isCancelled && showCancelForm && (
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '15px', fontWeight: 700, color: '#1A1A1A', marginBottom: '10px' }}>
              Cancellation Reason <span style={{ color: '#EF4444' }}>(Required)</span>
            </label>
            <textarea
              value={cancelReason}
              onChange={e => { setCancelReason(e.target.value); setCancelReasonErr(false) }}
              placeholder="Please provide a reason for cancellation..."
              rows={4}
              style={{
                width: '100%', padding: '12px 16px', fontSize: '14px',
                fontFamily: '"Lato", sans-serif',
                border: `1.5px solid ${cancelReasonErr ? '#EF4444' : '#E5E7EB'}`,
                borderRadius: '10px', resize: 'vertical', outline: 'none',
                boxSizing: 'border-box', color: '#1A1A1A',
              }}
            />
            {cancelReasonErr && (
              <p style={{ fontSize: '13px', color: '#EF4444', margin: '6px 0 0' }}>
                Please provide a reason before confirming cancellation.
              </p>
            )}
            {cancelError && (
              <p style={{ fontSize: '13px', color: '#DC2626', margin: '6px 0 0' }}>{cancelError}</p>
            )}
            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
              <button
                onClick={handleCancel}
                disabled={cancelling}
                style={{
                  padding: '12px 28px', borderRadius: '10px', border: 'none',
                  background: cancelling ? '#9CA3AF' : '#EF4444',
                  color: '#fff', fontSize: '15px', fontWeight: 700,
                  cursor: cancelling ? 'not-allowed' : 'pointer',
                  fontFamily: '"Lato", sans-serif', transition: 'opacity .15s',
                }}
              >
                {cancelling ? 'Cancelling…' : 'Confirm Cancellation'}
              </button>
              <button
                onClick={() => { setShowCancelForm(false); setCancelReason(''); setCancelReasonErr(false); setCancelError(null) }}
                style={{
                  padding: '12px 28px', borderRadius: '10px',
                  border: '1.5px solid #E5E7EB', background: '#fff',
                  color: '#1A1A1A', fontSize: '15px', fontWeight: 700,
                  cursor: 'pointer', fontFamily: '"Lato", sans-serif',
                }}
              >
                Go Back
              </button>
            </div>
          </div>
        )}

        {(!showCancelForm || isCancelled) && (
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={() => window.open(`/api/orders/${id}/invoice/confirmation`, '_blank')}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '10px 20px', borderRadius: '8px',
                border: '1.5px solid #7B1A1A', background: 'transparent',
                color: '#7B1A1A', fontSize: '14px', fontWeight: 700,
                cursor: 'pointer', fontFamily: '"Lato", sans-serif', transition: 'all .15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#7B1A1A'; e.currentTarget.style.color = '#fff' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#7B1A1A' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              View / Print Final Invoice
            </button>

            {!isCancelled && (
              <button
                onClick={() => setShowCancelForm(true)}
                style={{
                  padding: '10px 20px', borderRadius: '8px', border: 'none',
                  background: '#EF4444', color: '#fff', fontSize: '14px', fontWeight: 700,
                  cursor: 'pointer', fontFamily: '"Lato", sans-serif', transition: 'opacity .15s',
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                Cancel Order
              </button>
            )}
          </div>
        )}

        {isCancelled && (
          <div style={{ marginTop: '12px', padding: '12px 16px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', fontSize: '14px', color: '#B91C1C', fontWeight: 600 }}>
            This order has been cancelled and cannot be updated.
          </div>
        )}
      </div>

    </div>
  )
}