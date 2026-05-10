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

// TopItemsChart component
//
// Renders a grouped SVG bar chart showing the top 3 ordered products.
// Each product gets two bars side by side:
//   - Dark red bar  = units ordered  (left y-axis scale)
//   - Gold bar      = revenue in $   (right y-axis scale)
//

function TopItemsChart({ items }) {
  //Layout constants 
  const SVG_W    = 700   // total width of the SVG viewBox
  const SVG_H    = 280   // total height of the SVG viewBox
  const PAD_L    = 48    // left padding: space for unit axis labels
  const PAD_R    = 64    // right padding: space for revenue axis labels
  const PAD_T    = 16    // top padding: space above the tallest bar
  const PAD_B    = 48    // bottom padding: space for product name labels
  const CHART_W  = SVG_W - PAD_L - PAD_R   // drawable width
  const CHART_H  = SVG_H - PAD_T - PAD_B   // drawable height
  const GROUP_W  = CHART_W / items.length   // width per product group
  const BAR_W    = 28    // width of each bar
  const BAR_GAP  = 8     //gap between the two bars in each group
 
  // Scale calculations
  //maxUnits / maxRevenue is the highest value in each dataset.
  // Used to scale bar heights so the tallest bar fills the chart area
  const maxUnits   = Math.max(...items.map(i => i.units))
  const maxRevenue = Math.max(...items.map(i => i.revenue))
 
  //Converts a units value to a bar height in SVG pixels
  const scaleUnits   = v => (v / maxUnits)   * CHART_H
  //Converts a revenue value to a bar height in SVG pixels
  const scaleRevenue = v => (v / maxRevenue) * CHART_H
 
  //Y-axis tick generation
  //Creates 4 evenly spaced tick marks for the left (units) axis
  const unitTicks    = [0, 1, 2, 3].map(i => Math.round((maxUnits   / 3) * i))
  //Creates 4 evenly spaced tick marks for the right (revenue) axis
  const revenueTicks = [0, 1, 2, 3].map(i => Math.round((maxRevenue / 3) * i))
 
  //Bar x-position helpers
  // Returns the x coordinate of the centre of group i
  const groupCentreX = i => PAD_L + i * GROUP_W + GROUP_W / 2
  // Returns the x coordinate of the left edge of the units bar in group i
  const unitsBarX    = i => groupCentreX(i) - BAR_GAP / 2 - BAR_W
  //returns the x coordinate of the left edge of the revenue bar in group i
  const revenueBarX  = i => groupCentreX(i) + BAR_GAP / 2
 
  //Bar y-position helper
  // SVG y increases downward, so a taller bar starts at a lower y value
  // PAD_T + CHART_H is the bottom of the chart area (y = 0 on the scale)
  const barY = (scaledH) => PAD_T + CHART_H - scaledH
 
  return (
    <div>
      {/* Legend is shown above the chart */}
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
 
      {/* SVG chart: scales to fill its container width */}
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width="100%"
        style={{ display: 'block', overflow: 'visible' }}
        aria-label="Grouped bar chart showing top 3 products by units ordered and revenue"
        role="img"
      >
 
        {/* Horizontal grid lines + left axis (units) labels */}
        {unitTicks.map((tick, i) => {
          const y = barY(scaleUnits(tick))
          return (
            <g key={`unit-tick-${i}`}>
              {/* Horizontal grid line across the full chart width */}
              <line
                x1={PAD_L} y1={y}
                x2={PAD_L + CHART_W} y2={y}
                stroke={COLOR.border}
                strokeWidth="1"
                strokeDasharray="4 3"
              />
              {/* Left axis label units value */}
              <text
                x={PAD_L - 8} y={y + 4}
                textAnchor="end"
                fontSize="11"
                fill={COLOR.muted}
              >
                {tick}
              </text>
            </g>
          )
        })}
 
        {/* Right axis (revenue) labels */}
        {revenueTicks.map((tick, i) => {
          const y = barY(scaleRevenue(tick))
          return (
            <text
              key={`rev-tick-${i}`}
              x={PAD_L + CHART_W + 8} y={y + 4}
              textAnchor="start"
              fontSize="11"
              fill={COLOR.gold}
            >
              ${tick >= 1000 ? (tick / 1000).toFixed(1) + 'k' : tick}
            </text>
          )
        })}
 
        {/* Left axis label */}
        <text
          x={12} y={PAD_T + CHART_H / 2}
          textAnchor="middle"
          fontSize="11"
          fill={COLOR.muted}
          transform={`rotate(-90, 12, ${PAD_T + CHART_H / 2})`}
        >
          Units
        </text>
 
        {/*Right axis label */}
        <text
          x={SVG_W - 8} y={PAD_T + CHART_H / 2}
          textAnchor="middle"
          fontSize="11"
          fill={COLOR.gold}
          transform={`rotate(90, ${SVG_W - 8}, ${PAD_T + CHART_H / 2})`}
        >
          Revenue
        </text>
 
        {/*Bars + value labels + product name labels */}
        {items.map((item, i) => {
          const unitsH   = scaleUnits(item.units)
          const revenueH = scaleRevenue(item.revenue)
          const ux = unitsBarX(i)
          const rx = revenueBarX(i)
 
          return (
            <g key={item.name}>
 
              {/* Units bar dark red */}
              <rect
                x={ux}
                y={barY(unitsH)}
                width={BAR_W}
                height={unitsH}
                fill={COLOR.red}
                rx="3"
              />
              {/*Units value label above the bar */}
              <text
                x={ux + BAR_W / 2}
                y={barY(unitsH) - 6}
                textAnchor="middle"
                fontSize="12"
                fontWeight="700"
                fill={COLOR.red}
              >
                {item.units}
              </text>
 
              {/* Revenue bar gold */}
              <rect
                x={rx}
                y={barY(revenueH)}
                width={BAR_W}
                height={revenueH}
                fill={COLOR.gold}
                rx="3"
              />
              {/* Revenue value label above the bar */}
              <text
                x={rx + BAR_W / 2}
                y={barY(revenueH) - 6}
                textAnchor="middle"
                fontSize="11"
                fontWeight="700"
                fill={COLOR.gold}
              >
                ${item.revenue >= 1000 ? (item.revenue / 1000).toFixed(1) + 'k' : item.revenue}
              </text>
 
              {/*Product name label below the group centred between both bars */}
              <text
                x={groupCentreX(i)}
                y={PAD_T + CHART_H + 20}
                textAnchor="middle"
                fontSize="12"
                fill={COLOR.text}
              >
                {item.name}
              </text>
 
            </g>
          )
        })}
 
        {/* Bottom baseline  */}
        <line
          x1={PAD_L} y1={PAD_T + CHART_H}
          x2={PAD_L + CHART_W} y2={PAD_T + CHART_H}
          stroke={COLOR.border}
          strokeWidth="1.5"
        />
 
        {/*  Left axis line  */}
        <line
          x1={PAD_L} y1={PAD_T}
          x2={PAD_L} y2={PAD_T + CHART_H}
          stroke={COLOR.border}
          strokeWidth="1.5"
        />
 
      </svg>
    </div>
  )
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
 
          {/* Period filter dropdown: controls which mock data slice is shown */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex', gap: '4px' }}>
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

        <SectionLabel>Top 3 items ordered recently</SectionLabel>
        <div style={{ background: COLOR.white, borderRadius: '12px', border: `1px solid ${COLOR.border}`, padding: '24px' }}>
          {/*
            key={period} forces React to fully re-mount the chart component
            when the period changes, so the SVG recalculates from scratch
          */}
          <TopItemsChart items={data.topItems} key={period} />
        </div>
 
 
        {/* remove once backend is connected */}
        <p style={{ fontSize: '12px', color: COLOR.muted, marginTop: '16px', fontStyle: 'italic' }}>
          * Showing mock data. Connect to /api/admin/reports to display real figures.
        </p>
 
      </div>
  )
}