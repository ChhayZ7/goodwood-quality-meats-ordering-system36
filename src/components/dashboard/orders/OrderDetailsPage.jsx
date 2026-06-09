//src/components/dashboard/orders/OrderDetailsPage.jsx
// Same as before but with actual weight saving fully wired up.

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import StatusBadge, { STATUS_CONFIG } from '@/components/dashboard/StatusBadge'
import PageWrapper from '@/components/dashboard/PageWrapper'

const ORDER_STATUSES = ['CONFIRMED', 'IN_PROGRESS', 'READY', 'COMPLETED']

const formatDate  = d => new Date(d).toLocaleDateString('en-AU', { day: '2-digit', month: '2-digit', year: 'numeric' })
const formatSmall = d => new Date(d).toLocaleString('en-AU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
const formatCents = c => c != null ? `$${(c / 100).toFixed(2)}` : '—'
const shortNum    = id => id ? `GW${id.slice(0, 8).toUpperCase()}` : '—'

function SkeletonBlock({ width, height, radius = '4px', style = {} }) {
  return <div style={{ width, height, background: '#F0E8D0', borderRadius: radius, ...style }} />
}

export default function OrderDetailPage({ role }) {
  const { id }    = useParams()
  const router    = useRouter()
  const isAdmin   = role === 'ADMIN'
  const basePath  = isAdmin ? '/admin/orders' : '/staff/orders'

  // ── Core order state ───────────────────────────────────────────────────────
  const [order,        setOrder]        = useState(null)
  const [loading,      setLoading]      = useState(true)
  const [fetchError,   setFetchError]   = useState(null)

  // ── Status update state ────────────────────────────────────────────────────
  const [selectedStatus, setSelectedStatus] = useState('')
  const [saving,         setSaving]         = useState(false)
  const [saved,          setSaved]          = useState(false)
  const [saveError,      setSaveError]      = useState(null)

  // ── Actual weight state ────────────────────────────────────────────────────
  // { [order_item_id]: string }  — string so the input doesn't jump to "0"
  const [weights,        setWeights]        = useState({})
  const [weightSaving,   setWeightSaving]   = useState(false)
  const [weightSaved,    setWeightSaved]    = useState(false)
  const [weightError,    setWeightError]    = useState(null)

  // ── Cancel state ──────────────────────────────────────────────────────────
  const [showCancelForm,   setShowCancelForm]   = useState(false)
  const [cancelReason,     setCancelReason]     = useState('')
  const [cancelReasonErr,  setCancelReasonErr]  = useState(false)
  const [cancelling,       setCancelling]       = useState(false)
  const [cancelError,      setCancelError]      = useState(null)

  // ── Load order ─────────────────────────────────────────────────────────────
  const loadOrder = useCallback(async () => {
    setLoading(true)
    setFetchError(null)
    try {
      const res  = await fetch(`/api/admin/orders/${id}`)
      if (res.status === 401) { router.replace('/login'); return }
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to load order')
      setOrder(data.order)
      setSelectedStatus(data.order.status)

      // Pre-populate weight inputs from saved actual_weight_kg values
      const saved = {}
      for (const item of data.order.order_items ?? []) {
        if (item.product?.product_type === 'WEIGHT_RANGE') {
          saved[item.id] = item.actual_weight_kg != null
            ? String(item.actual_weight_kg)
            : ''
        }
      }
      setWeights(saved)
    } catch (err) {
      setFetchError(err.message)
    } finally {
      setLoading(false)
    }
  }, [id, router])

  useEffect(() => { loadOrder() }, [loadOrder])

  // ── Derived flags ──────────────────────────────────────────────────────────
  const isCancelled = order?.status === 'CANCELLED'
  // Weights are locked once READY or COMPLETED — the customer has been
  // notified of the balance so it must not change.
  const weightsLocked = ['READY', 'COMPLETED'].includes(order?.status ?? '')

  // Has the user typed any weight value that differs from what's in the DB?
  const hasWeightChanges = (order?.order_items ?? []).some(item => {
    if (item.product?.product_type !== 'WEIGHT_RANGE') return false
    const typed  = weights[item.id]
    const stored = item.actual_weight_kg != null ? String(item.actual_weight_kg) : ''
    return typed !== undefined && typed !== '' && typed !== stored
  })

  // ── Status update ──────────────────────────────────────────────────────────
  async function handleUpdateStatus() {
    if (!order || selectedStatus === order.status) return
    setSaving(true)
    setSaveError(null)
    try {
      const res  = await fetch(`/api/admin/orders/${id}`, {
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

  // ── Actual weight save ─────────────────────────────────────────────────────
  async function handleSaveWeights() {
    setWeightError(null)

    // Build the payload — only include weight-based items that have a value
    const payload = (order?.order_items ?? [])
      .filter(item => item.product?.product_type === 'WEIGHT_RANGE')
      .filter(item => weights[item.id] !== undefined && weights[item.id] !== '')
      .map(item => ({
        order_item_id:    item.id,
        actual_weight_kg: parseFloat(weights[item.id]),
      }))

    // Client-side validation
    const invalid = payload.filter(e => isNaN(e.actual_weight_kg) || e.actual_weight_kg < 0)
    if (invalid.length > 0) {
      setWeightError('All weights must be valid positive numbers.')
      return
    }

    if (payload.length === 0) {
      setWeightError('Please enter at least one weight before saving.')
      return
    }

    setWeightSaving(true)
    try {
      const res  = await fetch(`/api/admin/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actual_weights: payload }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to save weights')

      setWeightSaved(true)
      setTimeout(() => setWeightSaved(false), 3000)
      // Refresh order so totals and audit trail are up to date
      await loadOrder()
    } catch (err) {
      setWeightError(err.message)
    } finally {
      setWeightSaving(false)
    }
  }

  // ── Cancel order ───────────────────────────────────────────────────────────
  async function handleCancel() {
    if (!cancelReason.trim()) { setCancelReasonErr(true); return }
    setCancelReasonErr(false)
    setCancelling(true)
    setCancelError(null)
    try {
      const res  = await fetch(`/api/admin/orders/${id}`, {
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

  // ── Loading skeleton ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <PageWrapper>
        <SkeletonBlock width="120px" height="14px" style={{ marginBottom: '28px' }} />
        <div style={{ marginBottom: '32px' }}>
          <SkeletonBlock width="320px" height="36px" style={{ marginBottom: '32px' }} />
          <div style={{ height: '2px', background: 'linear-gradient(90deg, #C9A84C, transparent)', borderRadius: '1px' }} />
        </div>
        {[{ rows: 2 }, { rows: 4 }, { rows: 1 }, { rows: 1 }].map((card, ci) => (
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
      </PageWrapper>
    )
  }

  // ── Error state ────────────────────────────────────────────────────────────
  if (fetchError || !order) {
    return (
      <PageWrapper>
        <Link href={basePath} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: '#7B1A1A', textDecoration: 'none', marginBottom: '24px', fontWeight: 600 }}>
          ← Back to Orders
        </Link>
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '16px', color: '#B91C1C', fontSize: '14px' }}>
          {fetchError ?? 'Order not found.'}
        </div>
      </PageWrapper>
    )
  }

  const auditLog         = order.audit_log ?? []
  const lastStatusEntry  = auditLog.find(e => e.field === 'status')
  const lastWeightEntry  = auditLog.find(e => e.field === 'actual_weight')

  // Weight-based items only (shown with the weight input column)
  const weightBasedItems = (order.order_items ?? []).filter(
    item => item.product?.product_type === 'WEIGHT_RANGE'
  )
  const hasWeightBasedItems = weightBasedItems.length > 0

  // Mirrors the same logic in the PDF template and invoice API route.
  // True when the order is READY/COMPLETED AND every weight-based item
  // has an actual weight recorded — meaning the PDF will be a Final Invoice.
  const FINAL_STATUSES = ['READY', 'COMPLETED']
  const allWeighed = weightBasedItems.every(item => item.actual_weight_kg != null)
  const isFinal    = FINAL_STATUSES.includes(order.status) && (weightBasedItems.length === 0 || allWeighed)
  const invoiceLabel = isFinal ? 'View / Print Final Invoice' : 'View / Print Confirmation Invoice'

  return (
    <PageWrapper>

      {/* Back link */}
      <Link href={basePath} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: '#7B1A1A', textDecoration: 'none', marginBottom: '24px', fontWeight: 600 }}>
        ← Back to Orders
      </Link>

      {/* ── Header ── */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '36px', fontWeight: 700, color: '#7B1A1A', margin: '0 0 8px' }}>
              Order #{shortNum(order.id)}
            </h1>
            <div style={{ display: 'flex', gap: '24px', fontSize: '14px', color: '#6B7280' }}>
              <span>Customer: <strong style={{ color: '#1A1A1A' }}>{order.customer?.first_name} {order.customer?.last_name}</strong></span>
              {order.pickup_date && <span>Pickup: <strong style={{ color: '#1A1A1A' }}>{formatDate(order.pickup_date)}</strong></span>}
            </div>
          </div>
          <StatusBadge status={order.status} />
        </div>
        <div style={{ height: '2px', background: 'linear-gradient(90deg, #C9A84C, transparent)', borderRadius: '1px' }} />
      </div>

      {/* ── Audit Trail ── */}
      <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '24px', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1A1A1A', margin: '0 0 16px' }}>Audit Trail</h2>
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
                <strong style={{ color: '#1A1A1A' }}>Actual weights last entered by:</strong>{' '}
                <span style={{ color: '#6B7280' }}>
                  {lastWeightEntry.changed_by_user?.first_name} {lastWeightEntry.changed_by_user?.last_name} — {formatSmall(lastWeightEntry.created_at)}
                </span>
              </p>
            )}
            {auditLog.filter(e => e.field !== 'status' && e.field !== 'actual_weight').map((entry, i) => (
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

      {/* ── Order Items ── */}
      <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '24px', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1A1A1A', margin: '0 0 16px' }}>Order Items</h2>

        {/* Lock notice */}
        {weightsLocked && (
          <div style={{ background: '#FFFBEB', border: '1px solid #FCD34D', borderRadius: '8px', padding: '12px 16px', marginBottom: '16px', fontSize: '14px', color: '#92400E' }}>
            Weights are locked and cannot be edited for orders marked as <strong>{STATUS_CONFIG[order.status]?.label}</strong>.
          </div>
        )}

        {/* Editable weight notice for IN_PROGRESS */}
        {order.status === 'IN_PROGRESS' && hasWeightBasedItems && !weightsLocked && (
          <div style={{ background: '#F0FDF4', border: '1px solid #86EFAC', borderRadius: '8px', padding: '12px 16px', marginBottom: '16px', fontSize: '14px', color: '#166534' }}>
            Enter the actual weight for each item below, then click <strong>Save Weights</strong>. The order total will update automatically.
          </div>
        )}

        {/* Table header — 7 columns */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 110px 130px 50px 110px 100px 110px', padding: '10px 0', borderBottom: '1px solid #E5E7EB', marginBottom: '4px' }}>
          {['Product', 'Type', 'Weight Range', 'Qty', 'Price/kg', 'Actual Weight', 'Subtotal'].map(h => (
            <span key={h} style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '.06em' }}>{h}</span>
          ))}
        </div>

        {/* Item rows */}
        {(order.order_items ?? []).map((item, i) => {
          const isWeightBased  = item.product?.product_type === 'WEIGHT_RANGE'
          const weightRange    = item.weight_option
            ? `${item.weight_option.label}`
            : item.weight_preference ?? '—'
          const pricePerKg     = item.product?.price_per_kg_cents ?? 0
          const fixedPrice     = item.unit_price_cents ?? 0

          // Live subtotal: recalculate from the current typed weight so staff
          // can verify the math before hitting Save Weights.
          // Falls back to the stored subtotal_cents if no weight is typed yet.
          const typedWeight    = parseFloat(weights[item.id])
          const liveSubtotal   = isWeightBased
            ? (!isNaN(typedWeight) && typedWeight > 0
                ? Math.round(typedWeight * pricePerKg * item.quantity)
                : item.subtotal_cents)
            : fixedPrice * item.quantity

          // Flag whether the live subtotal differs from the saved one
          // so we can hint to the user that unsaved changes are pending
          const subtotalChanged = isWeightBased
            && !isNaN(typedWeight)
            && typedWeight > 0
            && liveSubtotal !== item.subtotal_cents

          return (
            <div
              key={item.id ?? i}
              style={{
                display: 'grid',
                gridTemplateColumns: '1.4fr 110px 130px 50px 110px 100px 110px',
                padding: '14px 0',
                borderBottom: i < order.order_items.length - 1 ? '1px solid #F3F4F6' : 'none',
                alignItems: 'center',
              }}
            >
              {/* Product name */}
              <span style={{ fontSize: '14px', color: '#1A1A1A', fontWeight: 500 }}>{item.product?.name ?? '—'}</span>

              {/* Type */}
              <span style={{ fontSize: '13px', color: '#6B7280' }}>{isWeightBased ? 'Weight-based' : 'Fixed price'}</span>

              {/* Weight range */}
              <span style={{ fontSize: '13px', color: '#6B7280' }}>{isWeightBased ? weightRange : '—'}</span>

              {/* Qty */}
              <span style={{ fontSize: '13px', color: '#1A1A1A' }}>{item.quantity}</span>

              {/* Price per kg (or per box for fixed) */}
              <span style={{ fontSize: '13px', color: '#1A1A1A' }}>
                {isWeightBased
                  ? `${formatCents(pricePerKg)}/kg`
                  : formatCents(fixedPrice)
                }
              </span>

              {/* Actual weight input */}
              {isWeightBased ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={weights[item.id] ?? ''}
                    onChange={e => {
                      setWeights(prev => ({ ...prev, [item.id]: e.target.value }))
                      setWeightError(null)
                      setWeightSaved(false)
                    }}
                    disabled={weightsLocked}
                    placeholder={weightsLocked ? '—' : '0.00'}
                    className="gw-input"
                    style={{
                      width: '72px',
                      padding: '7px 8px',
                      fontSize: '13px',
                      background: weightsLocked ? '#F9FAFB' : '#fff',
                      cursor:     weightsLocked ? 'not-allowed' : 'text',
                      color:      weightsLocked ? '#9CA3AF'    : '#1A1A1A',
                    }}
                  />
                  <span style={{ fontSize: '11px', color: '#9CA3AF' }}>kg</span>
                </div>
              ) : (
                <span style={{ fontSize: '13px', color: '#9CA3AF', fontStyle: 'italic' }}>—</span>
              )}

              {/* Live subtotal */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{
                  fontSize: '13px',
                  fontWeight: subtotalChanged ? 700 : 400,
                  color: subtotalChanged ? '#7B1A1A' : '#1A1A1A',
                }}>
                  {liveSubtotal != null ? formatCents(liveSubtotal) : '—'}
                </span>
                {/* Unsaved indicator — shows when the typed weight would change the subtotal */}
                {subtotalChanged && (
                  <span style={{ fontSize: '10px', color: '#C9A84C', fontWeight: 700, letterSpacing: '.03em' }}>
                    UNSAVED
                  </span>
                )}
              </div>
            </div>
          )
        })}

        {/* ── Save Weights section ── */}
        {hasWeightBasedItems && !weightsLocked && (
          <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #E5E7EB' }}>

            {weightError && (
              <p style={{ fontSize: '13px', color: '#DC2626', marginBottom: '10px' }}>{weightError}</p>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                onClick={handleSaveWeights}
                disabled={weightSaving || !hasWeightChanges}
                style={{
                  padding: '10px 28px',
                  background: weightSaving || !hasWeightChanges ? '#E5E7EB' : '#7B1A1A',
                  color:      weightSaving || !hasWeightChanges ? '#9CA3AF' : '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: weightSaving || !hasWeightChanges ? 'not-allowed' : 'pointer',
                  fontFamily: '"Lato", sans-serif',
                  transition: 'background .15s',
                }}
              >
                {weightSaving ? 'Saving…' : 'Save Weights'}
              </button>

              {weightSaved && (
                <span style={{ fontSize: '13px', color: '#16A34A', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Weights saved
                </span>
              )}

              {!hasWeightChanges && !weightSaving && !weightSaved && (
                <span style={{ fontSize: '13px', color: '#9CA3AF' }}>
                  Enter or update weights above to save
                </span>
              )}
            </div>
          </div>
        )}

        {/* Totals summary */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #E5E7EB' }}>
          <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '13px', color: '#6B7280' }}>
              {hasWeightBasedItems ? 'Estimated' : ''} Total:{' '}
              <strong style={{ color: '#1A1A1A' }}>{formatCents(order.total_cents)}</strong>
            </span>
            <span style={{ fontSize: '13px', color: '#6B7280' }}>
              Deposit Paid: <strong style={{ color: '#16A34A' }}>{formatCents(order.deposit_paid_cents)}</strong>
            </span>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#7B1A1A' }}>
              Balance Due:{' '}
              {order.total_cents != null && order.deposit_paid_cents != null
                ? formatCents(order.total_cents - order.deposit_paid_cents)
                : '—'
              }
            </span>
          </div>
        </div>
      </div>

      {/* ── Notes ── */}
      <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '24px', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1A1A1A', margin: '0 0 16px' }}>Notes</h2>
        {order.notes
          ? <p style={{ fontSize: '14px', color: '#1A1A1A', fontStyle: 'italic', margin: 0 }}>{order.notes}</p>
          : <p style={{ fontSize: '14px', color: '#9CA3AF', margin: 0 }}>No specific requirement for this order</p>
        }
      </div>

      {/* ── Update Status ── */}
      {!isCancelled && (
        <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '24px', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1A1A1A', margin: '0 0 16px' }}>Update Status</h2>
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

      {/* ── Order Actions ── */}
      <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1A1A1A', margin: '0 0 20px' }}>Order Actions</h2>

        {isAdmin && !isCancelled && showCancelForm && (
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '15px', fontWeight: 700, color: '#1A1A1A', marginBottom: '10px' }}>
              Cancellation Reason <span style={{ color: '#EF4444' }}>(Required)</span>
            </label>
            <textarea
              value={cancelReason}
              onChange={e => { setCancelReason(e.target.value); setCancelReasonErr(false) }}
              placeholder="Please provide a reason for cancellation..."
              rows={4}
              style={{ width: '100%', padding: '12px 16px', fontSize: '14px', border: `1.5px solid ${cancelReasonErr ? '#EF4444' : '#E5E7EB'}`, borderRadius: '10px', resize: 'vertical', outline: 'none', boxSizing: 'border-box', color: '#1A1A1A' }}
            />
            {cancelReasonErr && <p style={{ fontSize: '13px', color: '#EF4444', margin: '6px 0 0' }}>Please provide a reason before confirming cancellation.</p>}
            {cancelError && <p style={{ fontSize: '13px', color: '#DC2626', margin: '6px 0 0' }}>{cancelError}</p>}
            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
              <button
                onClick={handleCancel}
                disabled={cancelling}
                style={{ padding: '12px 28px', borderRadius: '10px', border: 'none', background: cancelling ? '#9CA3AF' : '#EF4444', color: '#fff', fontSize: '15px', fontWeight: 700, cursor: cancelling ? 'not-allowed' : 'pointer' }}
              >
                {cancelling ? 'Cancelling…' : 'Confirm Cancellation'}
              </button>
              <button
                onClick={() => { setShowCancelForm(false); setCancelReason(''); setCancelReasonErr(false); setCancelError(null) }}
                style={{ padding: '12px 28px', borderRadius: '10px', border: '1.5px solid #E5E7EB', background: '#fff', color: '#1A1A1A', fontSize: '15px', fontWeight: 700, cursor: 'pointer' }}
              >
                Go Back
              </button>
            </div>
          </div>
        )}

        {(!showCancelForm || isCancelled) && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Invoice status context — tells staff/admin which type of invoice will download */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 14px', borderRadius: '8px',
              background: isFinal ? '#F0FDF4' : '#FEF9E7',
              border: `1px solid ${isFinal ? '#86EFAC' : '#FAC775'}`,
            }}>
              {isFinal ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#854F0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
              )}
              <span style={{ fontSize: '13px', fontWeight: 600, color: isFinal ? '#166534' : '#854F0B' }}>
                {isFinal
                  ? 'All weights confirmed — invoice shows final figures'
                  : hasWeightBasedItems
                    ? 'Weights not yet confirmed — invoice shows estimated figures'
                    : 'Fixed-price order — invoice shows confirmed figures'
                }
              </span>
            </div>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button
                onClick={() => window.open(`/api/orders/${id}/invoice/confirmation`, '_blank')}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '8px', border: '1.5px solid #7B1A1A', background: 'transparent', color: '#7B1A1A', fontSize: '14px', fontWeight: 700, cursor: 'pointer', transition: 'all .15s' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#7B1A1A'; e.currentTarget.style.color = '#fff' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#7B1A1A' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                {invoiceLabel}
              </button>

              {isAdmin && !isCancelled && (
                <button
                  onClick={() => setShowCancelForm(true)}
                  style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#EF4444', color: '#fff', fontSize: '14px', fontWeight: 700, cursor: 'pointer', transition: 'opacity .15s' }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                >
                  Cancel Order
                </button>
              )}
            </div>
          </div>
        )}

        {isCancelled && (
          <div style={{ marginTop: '12px', padding: '12px 16px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', fontSize: '14px', color: '#B91C1C', fontWeight: 600 }}>
            This order has been cancelled and cannot be updated.
          </div>
        )}
      </div>

    </PageWrapper>
  )
}