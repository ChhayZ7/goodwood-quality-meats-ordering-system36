'use client'

// This page lets the admin see the report of the business.
// Section 1 shows Income Summary.
// Section 2 shows Order Summary.
// Section 3 shows Top 3 items ordered.

import { useState, useEffect } from 'react'
import PageWrapper from '@/components/dashboard/PageWrapper'
import PageHeader from '@/components/dashboard/PageHeader'

const COLOR = {
  red:       '#7B1A1A',
  redDark:   '#5C1212',
  redLight:  '#FEF2F2',
  redBorder: '#FECACA',
  cream:     '#FAF3E0',
  gold:      '#C9A84C',
  text:      '#1A1A1A',
  muted:     '#6B7280',
  border:    '#E5DCC8',
  white:     '#FFFFFF',
  sidebar:   '#F5EDD8',
  green:     '#3B6D11',
  amber:     '#BA7517',
  danger:    '#A32D2D',
}

const chartCardSt = {
  background: COLOR.white,
  borderRadius: '12px',
  border: `1px solid ${COLOR.border}`,
  padding: '28px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.035)',
}

function fmt(n) {
  return '$' + Math.round(n).toLocaleString()
}

function SkeletonBox({ height = 20, width = '100%', radius = 8 }) {
  return (
    <div style={{
      height, width, borderRadius: radius,
      background: 'linear-gradient(90deg, #EFE6D1 25%, #F7EFD9 50%, #EFE6D1 75%)',
      backgroundSize: '200% 100%',
      animation: 'pulse 1.4s ease-in-out infinite',
    }} />
  )
}

function ReportsSkeleton() {
  return (
    <>
      <style>{`
        @keyframes pulse {
          0%   { background-position:  200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        <div>
          <SkeletonBox width="150px" height={16} />
          <div style={{ height: 14 }} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
            {[1, 2, 3, 4].map(item => (
              <div key={item} style={{ background: COLOR.sidebar, borderRadius: '10px', padding: '16px 20px', border: `1px solid ${COLOR.border}` }}>
                <SkeletonBox width="80%" height={14} />
                <div style={{ height: 14 }} />
                <SkeletonBox width="60%" height={30} />
                <div style={{ height: 10 }} />
                <SkeletonBox width="70%" height={12} />
              </div>
            ))}
          </div>
        </div>
        <SkeletonBox height={1} />
        <div>
          <SkeletonBox width="180px" height={16} />
          <div style={{ height: 14 }} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
            {[1, 2, 3, 4].map(item => (
              <div key={item} style={{ background: COLOR.sidebar, borderRadius: '10px', padding: '16px 20px', border: `1px solid ${COLOR.border}` }}>
                <SkeletonBox width="80%" height={14} />
                <div style={{ height: 14 }} />
                <SkeletonBox width="50%" height={30} />
                <div style={{ height: 10 }} />
                <SkeletonBox width="65%" height={12} />
              </div>
            ))}
          </div>
        </div>
        <SkeletonBox height={1} />
        <div>
          <SkeletonBox width="210px" height={16} />
          <div style={{ height: 14 }} />
          <div style={chartCardSt}>
            <div style={{ display: 'flex', gap: '20px', marginBottom: '18px' }}>
              <SkeletonBox width="120px" height={14} />
              <SkeletonBox width="110px" height={14} />
            </div>
            <SkeletonBox height={280} radius={10} />
          </div>
        </div>
      </div>
    </>
  )
}

function MetricCard({ label, value, sub, color }) {
  return (
    <div style={{ background: COLOR.sidebar, borderRadius: '10px', padding: '16px 20px', border: `1px solid ${COLOR.border}` }}>
      <p style={{ fontSize: '12px', fontWeight: 700, color: COLOR.muted, textTransform: 'uppercase', letterSpacing: '.06em', margin: '0 0 8px' }}>{label}</p>
      <p style={{ fontSize: '28px', fontWeight: 700, color: color ?? COLOR.text, lineHeight: 1, margin: 0 }}>{value}</p>
      {sub && <p style={{ fontSize: '12px', color: COLOR.muted, margin: '8px 0 0' }}>{sub}</p>}
    </div>
  )
}

function SectionLabel({ children }) {
  return (
    <p style={{ fontSize: '12px', fontWeight: 700, color: COLOR.muted, textTransform: 'uppercase', letterSpacing: '.06em', margin: '0 0 12px' }}>
      {children}
    </p>
  )
}

function Divider() {
  return <div style={{ height: '1px', background: COLOR.border, margin: '28px 0' }} />
}

function TopItemsChart({ items }) {
  if (!items || items.length === 0) {
    return <p style={{ color: COLOR.muted, fontSize: '14px', margin: 0 }}>No order data for this period.</p>
  }

  const SVG_W = 700, SVG_H = 280, PAD_L = 48, PAD_R = 64, PAD_T = 16, PAD_B = 48
  const CHART_W = SVG_W - PAD_L - PAD_R
  const CHART_H = SVG_H - PAD_T - PAD_B
  const GROUP_W = CHART_W / items.length
  const BAR_W = 28, BAR_GAP = 8

  const maxUnits   = Math.max(...items.map(i => i.units), 1)
  const maxRevenue = Math.max(...items.map(i => i.revenue), 1)

  const scaleUnits   = v => (v / maxUnits) * CHART_H
  const scaleRevenue = v => (v / maxRevenue) * CHART_H

  const unitTicks    = [0, 1, 2, 3].map(i => Math.round((maxUnits / 3) * i))
  const revenueTicks = [0, 1, 2, 3].map(i => Math.round((maxRevenue / 3) * i))

  const groupCentreX = i => PAD_L + i * GROUP_W + GROUP_W / 2
  const unitsBarX    = i => groupCentreX(i) - BAR_GAP / 2 - BAR_W
  const revenueBarX  = i => groupCentreX(i) + BAR_GAP / 2
  const barY         = scaledH => PAD_T + CHART_H - scaledH

  return (
    <div>
      <div style={{ display: 'flex', gap: '20px', marginBottom: '12px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: COLOR.muted }}>
          <span style={{ width: 12, height: 12, borderRadius: 2, background: COLOR.red, display: 'inline-block' }} />
          Units ordered
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: COLOR.muted }}>
          <span style={{ width: 12, height: 12, borderRadius: 2, background: COLOR.gold, display: 'inline-block' }} />
          Revenue ($)
        </div>
      </div>
      <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} width="100%" style={{ display: 'block', overflow: 'visible' }} aria-label="Grouped bar chart showing top 3 products by units ordered and revenue" role="img">
        {unitTicks.map((tick, i) => {
          const y = barY(scaleUnits(tick))
          return (
            <g key={`unit-tick-${i}`}>
              <line x1={PAD_L} y1={y} x2={PAD_L + CHART_W} y2={y} stroke={COLOR.border} strokeWidth="1" strokeDasharray="4 3" />
              <text x={PAD_L - 8} y={y + 4} textAnchor="end" fontSize="11" fill={COLOR.muted}>{tick}</text>
            </g>
          )
        })}
        {revenueTicks.map((tick, i) => (
          <text key={`rev-tick-${i}`} x={PAD_L + CHART_W + 8} y={barY(scaleRevenue(tick)) + 4} textAnchor="start" fontSize="11" fill={COLOR.gold}>
            ${tick >= 1000 ? (tick / 1000).toFixed(1) + 'k' : tick}
          </text>
        ))}
        <text x={12} y={PAD_T + CHART_H / 2} textAnchor="middle" fontSize="11" fill={COLOR.muted} transform={`rotate(-90, 12, ${PAD_T + CHART_H / 2})`}>Units</text>
        <text x={SVG_W - 8} y={PAD_T + CHART_H / 2} textAnchor="middle" fontSize="11" fill={COLOR.gold} transform={`rotate(90, ${SVG_W - 8}, ${PAD_T + CHART_H / 2})`}>Revenue</text>
        {items.map((item, i) => {
          const unitsH   = scaleUnits(item.units)
          const revenueH = scaleRevenue(item.revenue)
          const ux = unitsBarX(i)
          const rx = revenueBarX(i)
          return (
            <g key={item.name}>
              <rect x={ux} y={barY(unitsH)} width={BAR_W} height={unitsH} fill={COLOR.red} rx="3" />
              <text x={ux + BAR_W / 2} y={barY(unitsH) - 6} textAnchor="middle" fontSize="12" fontWeight="700" fill={COLOR.red}>{item.units}</text>
              <rect x={rx} y={barY(revenueH)} width={BAR_W} height={revenueH} fill={COLOR.gold} rx="3" />
              <text x={rx + BAR_W / 2} y={barY(revenueH) - 6} textAnchor="middle" fontSize="11" fontWeight="700" fill={COLOR.gold}>
                ${item.revenue >= 1000 ? (item.revenue / 1000).toFixed(1) + 'k' : item.revenue}
              </text>
              <text x={groupCentreX(i)} y={PAD_T + CHART_H + 20} textAnchor="middle" fontSize="12" fill={COLOR.text}>{item.name}</text>
            </g>
          )
        })}
        <line x1={PAD_L} y1={PAD_T + CHART_H} x2={PAD_L + CHART_W} y2={PAD_T + CHART_H} stroke={COLOR.border} strokeWidth="1.5" />
        <line x1={PAD_L} y1={PAD_T} x2={PAD_L} y2={PAD_T + CHART_H} stroke={COLOR.border} strokeWidth="1.5" />
      </svg>
    </div>
  )
}

export default function AdminReportsPage() {
  const [period,  setPeriod]  = useState('month')
  const [report,  setReport]  = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(null)

  useEffect(() => {
    async function fetchReport() {
      setLoading(true)
      setError(null)
      try {
        const url = `/api/admin/reports?period=${period}`
        const res  = await fetch(url)
        const text = await res.text()
        let data
        try { data = JSON.parse(text) } catch { throw new Error('Server returned invalid JSON') }
        if (!res.ok) throw new Error(data.error ?? 'Failed to load report')
        setReport(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchReport()
  }, [period])

  const statusCounts = report?.orders_by_status ?? {}
  const totalOrders  = Object.values(statusCounts).reduce((s, n) => s + n, 0)
  const completed    = statusCounts.COMPLETED ?? 0
  const cancelled    = statusCounts.CANCELLED ?? 0
  const remaining    = (statusCounts.PENDING ?? 0) + (statusCounts.CONFIRMED ?? 0) + (statusCounts.READY ?? 0)

  const revenueCents  = report?.revenue?.revenue_cents ?? 0
  const depositsCents = report?.deposits?.deposits_collected_cents ?? 0
  const finalPayCents = revenueCents - depositsCents
  const avgOrderValue = completed > 0 ? revenueCents / completed : 0
  const topItems      = report?.top_products ?? []

  return (
    <PageWrapper>
      <PageHeader
        title="Reports"
        action={
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label style={{ fontSize: '12px', color: COLOR.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em' }}>
              Period
            </label>
            <select
              value={period}
              onChange={e => setPeriod(e.target.value)}
              style={{ padding: '10px 14px', border: `1.5px solid ${COLOR.border}`, borderRadius: '8px', fontSize: '14px', background: COLOR.white, color: COLOR.text, cursor: 'pointer', fontFamily: '"Lato", sans-serif', minWidth: '150px' }}
            >
              <option value="today">Today</option>
              <option value="month">This month</option>
            </select>
          </div>
        }
      />

      {loading && <ReportsSkeleton />}

      {error && !loading && (
        <div style={{ background: COLOR.redLight, border: `1px solid ${COLOR.redBorder}`, borderRadius: '8px', padding: '12px 16px', marginBottom: '32px', fontSize: '14px', color: COLOR.danger }}>
          {error}
        </div>
      )}

      {!loading && !error && report && (
        <>
          <SectionLabel>Income summary</SectionLabel>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '4px' }}>
            <MetricCard label="Total income"        value={fmt(revenueCents / 100)}              sub="completed orders" />
            <MetricCard label="Deposits collected"  value={fmt(depositsCents / 100)}             sub="$20 per order" />
            <MetricCard label="Final payments"      value={fmt(Math.max(finalPayCents, 0) / 100)} sub="completed orders only" />
            <MetricCard label="Avg order value"     value={fmt(avgOrderValue / 100)}             sub="completed orders only" />
          </div>

          <Divider />

          <SectionLabel>Order summary — {period === 'today' ? 'today' : 'this month'}</SectionLabel>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '4px' }}>
            <MetricCard label="Total orders placed" value={totalOrders} />
            <MetricCard label="Completed"           value={completed}  color={COLOR.green} />
            <MetricCard label="Remaining"           value={remaining}  sub="pending + confirmed + ready" color={COLOR.amber} />
            <MetricCard label="Cancelled"           value={cancelled}  color={COLOR.danger} />
          </div>

          <Divider />

          <SectionLabel>Top 3 items ordered — {period === 'today' ? 'today' : 'this month'}</SectionLabel>
          <div style={chartCardSt}>
            <TopItemsChart items={topItems} key={period} />
          </div>

          <p style={{ fontSize: '12px', color: COLOR.muted, marginTop: '12px', fontStyle: 'italic' }}>
            Generated at {new Date(report.generated_at).toLocaleString('en-AU')}
          </p>
        </>
      )}
    </PageWrapper>
  )
}