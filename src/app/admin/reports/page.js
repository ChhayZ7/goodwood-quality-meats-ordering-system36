//This page letting the admin see the report of the business
//Section 1 will show Income Summary (total income, deposits, final payments, avg order value)
//Section 2 will shpw Order Summary (total placed, completed, remaining, cancelled)
//Sectipn 3 will show top 3 items ordered


'use client'
 
import { useState, useEffect, useRef } from 'react'
 

const COLOR = {
  red:       '#7B1A1A',
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
 
// Mock data
//
// Replace this entire object with a real fetch('/api/admin/reports?period=...')
// call once the backend endpoint exists. The shape of the data should stay
// the same so the rest of the component doesn't need to change.

const MOCK = {
  today: {
    totalIncome:  860,
    deposits:     140,
    finalPay:     720,
    totalOrders:  7,
    completed:    4,
    remaining:    3,
    cancelled:    0,
    topItems: [
      { name: 'Porchetta',       units: 3, revenue: 320 },
      { name: 'Boneless Ham',    units: 2, revenue: 260 },
      { name: 'Beef Tenderloin', units: 2, revenue: 280 },
    ],
  },
  month: {
    totalIncome:  18420,
    deposits:     3200,
    finalPay:     15220,
    totalOrders:  160,
    completed:    98,
    remaining:    52,
    cancelled:    10,
    topItems: [
      { name: 'Porchetta',       units: 42, revenue: 5840 },
      { name: 'Boneless Ham',    units: 38, revenue: 4940 },
      { name: 'Beef Tenderloin', units: 31, revenue: 5580 },
    ],
  },
}
 

 
// Formats a number as a dollar string with thousand separators
// e.g. 18420 → "$18,420"
function fmt(n) {
  return '$' + Math.round(n).toLocaleString()
}
 
// MetricCard component
//
// Displays a single summary number with a label and optional sub-label
// Used in both the income and order summary sections
// Props:
//   label is the heading above the number
//   value is the main number/string to display
//   sub is for optional smaller text below the value
//   coloris foroptional override for the value text color
function MetricCard({ label, value, sub, color }) {
  return (
    <div style={{ background: COLOR.sidebar, borderRadius: '10px', padding: '16px 20px' }}>
      <p style={{ fontSize: '12px', fontWeight: 700, color: COLOR.muted, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '8px' }}>
        {label}
      </p>
      <p style={{ fontSize: '26px', fontWeight: 700, color: color ?? COLOR.text, lineHeight: 1 }}>
        {value}
      </p>
      {sub && (
        <p style={{ fontSize: '12px', color: COLOR.muted, marginTop: '6px' }}>{sub}</p>
      )}
    </div>
  )
}
 
// SectionLabel component
//
//uppercase label used as a heading before each section
function SectionLabel({ children }) {
  return (
    <p style={{ fontSize: '12px', fontWeight: 700, color: COLOR.muted, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '12px' }}>
      {children}
    </p>
  )
}
 
// Divider component
function Divider() {
  return <div style={{ height: '1px', background: COLOR.border, margin: '28px 0' }} />
}
 
// TopItemsChart component
//
// Renders a grouped SVG bar chart showing the top 3 ordered products.
// Each product gets two bars side by side:
//   - Dark red bar  = units ordered  (left y-axis scale)
//   - Gold bar      = revenue in $   (right y-axis scale)
//

function TopItemsChart() {
 
}
 
// main page component
export default function AdminReportsPage() {
 
  // period: currently selected filter: 'today' or 'month'
  const [period, setPeriod] = useState('month')
 
  // data: the current mock data object for the selected period
  //replace with a useEffect fetch('/api/admin/reports?period=...')
  // when the backend endpoint is ready. Keep the same data shape
  const data = MOCK[period]
 
  return (
    <div style={{ minHeight: '100vh', background: COLOR.cream, fontFamily: '"Lato", sans-serif' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '40px 48px' }}>
 
        {/* Page header: title on the left, period filter below */}
            <h1 style={{ fontSize: '32px', fontWeight: 700, color: COLOR.red, marginBottom: '4px' }}>
              Reports
            </h1>
            <p style={{ fontSize: '14px', color: COLOR.muted, marginTop: '4px', marginBottom: '4px' }}>
              Income and order summary
            </p>
 
          {/* Period filter dropdown — controls which mock data slice is shown */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
            <label style={{ fontSize: '12px', color: COLOR.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em' }}>
              Period
            </label>
            <select
              value={period}
              onChange={e => setPeriod(e.target.value)}
              style={{
                padding: '8px 12px',
                border: `1.5px solid ${COLOR.border}`,
                borderRadius: '8px',
                fontSize: '14px',
                background: COLOR.white,
                color: COLOR.text,
                cursor: 'pointer',
                fontFamily: '"Lato", sans-serif',
              }}
            >
              <option value="today">Today</option>
              <option value="month">This month</option>
            </select>
          </div>
        </div>
 
        {/* Gold gradient divider */}
        <div style={{ height: '2px', background: `linear-gradient(90deg, ${COLOR.gold}, transparent)`, marginBottom: '32px', borderRadius: '1px' }} />
 
        {/* Section 1: Income Summary */}
        <SectionLabel>Income summary</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '4px' }}>
          <MetricCard
            label="Total income"
            value={fmt(data.totalIncome)}
            sub="deposits + final payments"
          />
          <MetricCard
            label="Deposits collected"
            value={fmt(data.deposits)}
            sub="$20 per order"
          />
          <MetricCard
            label="Final payments"
            value={fmt(data.finalPay)}
            sub="completed orders only"
          />
          <MetricCard
            label="Avg order value"
            value={fmt(data.finalPay / (data.completed || 1))}
            sub="completed orders only"
          />
        </div>
 
        <Divider />
 
        {/*Section 2: Order Summary */}
        <SectionLabel>
          Order summary — {period === 'today' ? 'today' : 'this month'}
        </SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '4px' }}>
          <MetricCard
            label="Total orders placed"
            value={data.totalOrders}
          />
          <MetricCard
            label="Completed"
            value={data.completed}
            color={COLOR.green}
          />
          <MetricCard
            label="Remaining"
            value={data.remaining}
            sub="pending + confirmed"
            color={COLOR.amber}
          />
          <MetricCard
            label="Cancelled"
            value={data.cancelled}
            color={COLOR.danger}
          />
        </div>
 
        <Divider />
 
 
        {/* remove once backend is connected */}
        <p style={{ fontSize: '12px', color: COLOR.muted, marginTop: '16px', fontStyle: 'italic' }}>
          * Showing mock data. Connect to /api/admin/reports to display real figures.
        </p>
 
      </div>
  )
}