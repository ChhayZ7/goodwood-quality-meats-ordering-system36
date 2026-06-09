'use client'

// Admin Reports page.
// Lets the admin view a business summary for a selected pickup month and year.
// Section 1: Income Summary (4 cards)
// Section 2: Order Summary (6 status cards)
// Section 3: Top 3 Products chart (bar chart by units ordered)

import { useState, useEffect } from 'react'
import PageWrapper from '@/components/dashboard/PageWrapper'
import PageHeader from '@/components/dashboard/PageHeader'

const COLOR = {
  red: '#7B1A1A',
  redDark: '#5C1212',
  redLight: '#FEF2F2',
  redBorder: '#FECACA',
  cream: '#FAF3E0',
  gold: '#C9A84C',
  text: '#1A1A1A',
  muted: '#6B7280',
  border: '#E5DCC8',
  white: '#FFFFFF',
  sidebar: '#F5EDD8',
  green: '#3B6D11',
  amber: '#BA7517',
  blue: '#1D4ED8',
  purple: '#6D28D9',
  danger: '#A32D2D',
}

// VALID OPTIONS for the month and year dropdowns
// Month 1 = January, 11 = November, 12 = December
const MONTH_OPTIONS = [
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
  { value: 1, label: 'January' },
]

const YEAR_OPTIONS = [2025, 2026, 2027]

// HELPER: getDefaultSelection
// Determines what month/year to show when the page first loads
// - If current month is Nov, Dec, or Jan -> use current month + year
// - Otherwise -> default to December of the current year
function getDefaultSelection() {
  const now = new Date()
  const currentMonth = now.getMonth() + 1  // +1 because JavaScript counts months from 0 (January = 0, December = 11), 
  //so add 1 to get the normal month number expect
  const currentYear = now.getFullYear()

  // Check if currently in a season month
  if ([11, 12, 1].includes(currentMonth)) {
    return { month: currentMonth, year: currentYear }
  }

  // Otherwise default to December of the current year
  return { month: 12, year: currentYear }
}


// HELPER: centsToDollars
// Formats a number of cents as a dollar amount, e.g. 28400 -> "$284"
// Math.round removes floating point issues, toLocaleString adds commas
function centsToDollars(cents) {
  return '$' + Math.round(cents / 100).toLocaleString()
}

// HELPER: getMonthLabel
// Returns the display name for a month number, e.g. 12 -> "December"
function getMonthLabel(month) {
  return MONTH_OPTIONS.find(m => m.value === month)?.label ?? '' //.label is tried to get the label of the month, if the month found is undefined, label is undefined
  //if either find the month or label undefined, return an empty string
}

// COMPONENT: SkeletonBox
// A placeholder box shown while data is loading, like other pages

function SkeletonBox({ height = 20, width = '100%', radius = 8 }) {
  return (
    <div style={{
      height,
      width,
      borderRadius: radius,
      // Gradient that animates left-to-right to simulate a loading shimmer
      background: 'linear-gradient(90deg, #EFE6D1 25%, #F7EFD9 50%, #EFE6D1 75%)',
      backgroundSize: '200% 100%',
      animation: 'pulse 1.4s ease-in-out infinite',
    }} />
  )
}

// COMPONENT: ReportsSkeleton
// Full-page skeleton shown while the API request is in progress
function ReportsSkeleton() {
  return (
    <>
      {/* Define the shimmer keyframe animation */}
      <style>{`
        @keyframes pulse {
          0%   { background-position:  200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

        {/* Skeleton for Income Summary section - 4 cards */}
        <div>
          <SkeletonBox width="150px" height={16} />
          <div style={{ height: 14 }} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{ background: COLOR.sidebar, borderRadius: '10px', padding: '16px 20px', border: `1px solid ${COLOR.border}` }}>
                <SkeletonBox width="80%" height={14} />
                <div style={{ height: 14 }} />
                <SkeletonBox width="60%" height={30} />
                <div style={{ height: 10 }} />
                <SkeletonBox width="70%" height={12} />
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <SkeletonBox height={1} />

        {/* Skeleton for Order Summary section - 6 cards */}
        <div>
          <SkeletonBox width="180px" height={16} />
          <div style={{ height: 14 }} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '14px' }}>
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} style={{ background: COLOR.sidebar, borderRadius: '10px', padding: '16px 20px', border: `1px solid ${COLOR.border}` }}>
                <SkeletonBox width="80%" height={14} />
                <div style={{ height: 14 }} />
                <SkeletonBox width="50%" height={30} />
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <SkeletonBox height={1} />

        {/* Skeleton for Top 3 chart */}
        <div>
          <SkeletonBox width="210px" height={16} />
          <div style={{ height: 14 }} />
          <div style={{ background: COLOR.white, borderRadius: '12px', border: `1px solid ${COLOR.border}`, padding: '28px' }}>
            <SkeletonBox height={280} radius={10} />
          </div>
        </div>

      </div>
    </>
  )
}

// COMPONENT: MetricCard
// A single stat card with a label, large value, and optional sub-note
// color prop overrides the default text color for the value (used for status cards)

function MetricCard({ label, value, sub, color }) {
  return (
    <div style={{ background: COLOR.sidebar, borderRadius: '10px', padding: '16px 20px', border: `1px solid ${COLOR.border}` }}>
      {/* Card label - small uppercase */}
      <p style={{ fontSize: '12px', fontWeight: 700, color: COLOR.muted, textTransform: 'uppercase', letterSpacing: '.06em', margin: '0 0 8px' }}>
        {label}
      </p>
      {/* Main value - large and bold */}
      <p style={{ fontSize: '28px', fontWeight: 700, color: color ?? COLOR.text, lineHeight: 1, margin: 0 }}>
        {value}
      </p>
      {/* Optional sub-note beneath the value */}
      {sub && (
        <p style={{ fontSize: '11px', color: COLOR.muted, margin: '8px 0 0', fontStyle: 'italic' }}>
          {sub}
        </p>
      )}
    </div>
  )
}

// COMPONENT: SectionLabel
// Small uppercase label used as a heading for each report section

function SectionLabel({ children }) {
  return (
    <p style={{ fontSize: '12px', fontWeight: 700, color: COLOR.muted, textTransform: 'uppercase', letterSpacing: '.06em', margin: '0 0 12px' }}>
      {children}
    </p>
  )
}

// COMPONENT: Divider
// A horizontal line used to visually separate report sections.

function Divider() {
  return <div style={{ height: '1px', background: COLOR.border, margin: '28px 0' }} />
}

// COMPONENT: TopItemsChart
// SVG bar chart showing the top 3 products by units ordered
// Single bar per product (units only)
// x-axis: product name | y-axis: quantity ordered

function TopItemsChart({ items }) {
  // If no items returned from API, show a friendly empty state message
  if (!items || items.length === 0) {
    return (
      <p style={{ color: COLOR.muted, fontSize: '14px', margin: 0 }}>
        No order data for this period.
      </p>
    )
  }

  // SVG canvas dimensions
  const SVG_W = 600   // total SVG width in pixels
  const SVG_H = 280   // total SVG height in pixels
  const PAD_L = 48    // left padding - room for y-axis labels
  const PAD_R = 24    // right padding
  const PAD_T = 32    // top padding - room for value labels above bars
  const PAD_B = 48    // bottom padding - room for product name labels

  // The actual drawable chart area after subtracting padding, so bars can only be draw within this width and height
  const CHART_W = SVG_W - PAD_L - PAD_R
  const CHART_H = SVG_H - PAD_T - PAD_B

  // Width of each bar 
  const BAR_W = 64

  // divide the chart width equally so each product gets the same amount of horizontal space, for now, it's only 3
  const GROUP_W = CHART_W / items.length

  // Find the highest unit count, so the heightest one will reach the chart height and the other ones will be divided proportionally
  const maxUnits = Math.max(...items.map(i => i.units), 1)

  // Scale a unit value to a pixel height within the chart area
  // e.g. if maxUnits is 10 and value is 5, returns CHART_H / 2
  const scaleUnits = v => (v / maxUnits) * CHART_H

  // split the y-axis into 4 evenly spaced labels from 0 to maxUnits
  // e.g. if maxUnits is 15, ticks will be [0, 5, 10, 15]
  //math round just in case there is a decimal number, but this rarely happen, just in case
  const unitTicks = [0, 1, 2, 3].map(i => Math.round((maxUnits / 3) * i))

  // this constant finds the horizontal centre point of each product's section
  //for sample
  //product 0 centre = 48 + 0 * 176 + 88 = 136px from left
  //product 1 centre = 48 + 1 * 176 + 88 = 312px from left
  //product 2 centre = 48 + 2 * 176 + 88 = 488px from left
  const groupCentreX = i => PAD_L + i * GROUP_W + GROUP_W / 2

  //finds where the left edge of the bar starts, by taking the centre and going back half the bar width so the bar sits centred in its group
  //sample calculation: barX = 136 - 32 = 104px  (BAR_W is 64, so half is 32)

  const barX = i => groupCentreX(i) - BAR_W / 2

  //finds where the top of the bar sits. SVG is tricky because y=0 is at the top of the screen, not the bottom
  // So bars have to grow upward by subtracting the bar height from the baseline
  // if bar height is 100px and CHART_H is 200px1
  // then barY = 32 (PAD_T) + 200 - 100 = 132px from top
  const barY = scaledH => PAD_T + CHART_H - scaledH

  return (
    <div>
      {/* Legend showing what the red bar represents */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: COLOR.muted }}>
          <span style={{ width: 12, height: 12, borderRadius: 2, background: COLOR.red, display: 'inline-block' }} />
          Units ordered
        </div>
      </div>

      {/* SVG chart element */}
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width="100%"
        style={{ display: 'block', overflow: 'visible' }}
        aria-label="Bar chart showing top 3 products by units ordered"
        role="img"
      >
        {/* Y-axis: grid lines and tick labels */}
        {unitTicks.map((tick, i) => {
          const y = barY(scaleUnits(tick))  // pixel Y position for this tick value
          return (
            <g key={`tick-${i}`}>
              {/* Horizontal dashed grid line across the full chart width */}
              <line
                x1={PAD_L} y1={y}
                x2={PAD_L + CHART_W} y2={y}
                stroke={COLOR.border} strokeWidth="1" strokeDasharray="4 3"
              />
              {/* Numeric tick label to the left of the chart */}
              <text x={PAD_L - 8} y={y + 4} textAnchor="end" fontSize="11" fill={COLOR.muted}>
                {tick}
              </text>
            </g>
          )
        })}

        {/* Y-axis label, rotated 90 degrees to read vertically */}
        <text
          x={12}
          y={PAD_T + CHART_H / 2}
          textAnchor="middle"
          fontSize="11"
          fill={COLOR.muted}
          transform={`rotate(-90, 12, ${PAD_T + CHART_H / 2})`}
        >
          Units
        </text>

        {/* Bars - one per product */}
        {items.map((item, i) => {
          const unitsH = scaleUnits(item.units)   // pixel height of this bar
          const x = barX(i)                  // left edge x of bar
          const y = barY(unitsH)             // top edge y of bar

          return (
            <g key={item.name}>
              {/* The bar rectangle */}
              <rect
                x={x} y={y}
                width={BAR_W} height={unitsH}
                fill={COLOR.red} rx="4"
              />

              {/* Unit count label displayed above the bar */}
              <text
                x={x + BAR_W / 2} y={y - 8}
                textAnchor="middle" fontSize="13" fontWeight="700" fill={COLOR.red}
              >
                {item.units}
              </text>

              {/* Product name label below the x-axis baseline */}
              <text
                x={groupCentreX(i)} y={PAD_T + CHART_H + 20}
                textAnchor="middle" fontSize="12" fill={COLOR.text}
              >
                {item.name}
              </text>
            </g>
          )
        })}

        {/* X-axis baseline */}
        <line
          x1={PAD_L} y1={PAD_T + CHART_H}
          x2={PAD_L + CHART_W} y2={PAD_T + CHART_H}
          stroke={COLOR.border} strokeWidth="1.5"
        />

        {/* Y-axis left border line */}
        <line
          x1={PAD_L} y1={PAD_T}
          x2={PAD_L} y2={PAD_T + CHART_H}
          stroke={COLOR.border} strokeWidth="1.5"
        />
      </svg>
    </div>
  )
}


// Main export: Manages state, fetches data, and renders the full reports page
export default function AdminReportsPage() {
  // Get smart default month/year based on current date
  const defaults = getDefaultSelection()

  // Selected month (11 = November, 12 = December, 1 = January)
  const [month, setMonth] = useState(defaults.month)

  // Selected year (2025, 2026, or 2027)
  const [year, setYear] = useState(defaults.year)

  // Report data returned from the API
  const [report, setReport] = useState(null)

  // Whether the API request is currently in progress
  const [loading, setLoading] = useState(true)

  // Error message if the API request fails
  const [error, setError] = useState(null)

  // EFFECT: fetchReport
  // Runs on first load, and again whenever month or year state changes
  // Fetches report data from the API for the selected pickup month/year

  useEffect(() => {
    async function fetchReport() {
      setLoading(true)   // show skeleton while fetching
      setError(null)     // clear any previous error message

      try {
        // Build the API URL, month and year are passed as query params
        const url = `/api/admin/reports?month=${month}&year=${year}`
        const res = await fetch(url)

        // Read the response body as text first so we can handle non-JSON errors
        const text = await res.text()
        let data
        try {
          data = JSON.parse(text)  // parse the JSON body
        } catch {
          throw new Error('Server returned invalid JSON')
        }

        // If HTTP status is not 2xx, throw the error message from the API
        if (!res.ok) throw new Error(data.error ?? 'Failed to load report')

        // Save the successful report data into state
        setReport(data)
      } catch (err) {
        // Save the error message to display to the admin
        setError(err.message)
      } finally {
        setLoading(false)  // always hide skeleton when done, success or failure
      }
    }

    fetchReport()
  }, [month, year])  // re-run this effect whenever the selected month or year changes

  // Derived values computed from the API response
  // These are calculated once here and used in the JSX below.

  // Order counts per status - default all to 0 before data loads
  const statusCounts = report?.orders_by_status ?? {}
  const totalOrders = Object.values(statusCounts).reduce((sum, n) => sum + n, 0)  // sum all statuses
  const confirmed = statusCounts.CONFIRMED ?? 0  // acknowledged, not yet being prepared
  const inProgress = statusCounts.IN_PROGRESS ?? 0  // staff actively preparing
  const ready = statusCounts.READY ?? 0  // done, awaiting customer pickup
  const completed = statusCounts.COMPLETED ?? 0  // fully collected and paid
  const cancelled = statusCounts.CANCELLED ?? 0  // cancelled for any reason

  // Income figures from the order_summary object returned by the API
  const summary = report?.order_summary ?? {}
  const estimatedTotalCents = summary.estimated_total_cents ?? 0  // sum of all order totals (min estimate)
  const depositsCents = summary.deposits_collected_cents ?? 0  // real money received (incl. cancelled)
  const estimatedFinalCents = summary.estimated_final_pay_cents ?? 0  // what customers still owe
  const avgOrderValueCents = summary.avg_order_value_cents ?? 0  // average per order (min estimate)
  const nonCancelledCount = summary.order_count ?? 0  // number of active orders

  // Top 3 products array for the chart
  const topItems = report?.top_products ?? []

  // Human-readable label for the selected period, e.g. "December 2026"
  const periodLabel = `${getMonthLabel(month)} ${year}`

  // RENDER
  return (
    <PageWrapper>
      <PageHeader
        title="Reports"
        action={
          // Month and year dropdowns displayed in the top-right of the page header
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>

            {/* Month dropdown label */}
            <label style={{ fontSize: '12px', color: COLOR.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em' }}>
              Month
            </label>

            {/* Month dropdown - options are November, December, January */}
            <select
              value={month}
              onChange={e => setMonth(parseInt(e.target.value))}  // parseInt converts "12" -> 12
              style={{ padding: '10px 14px', border: `1.5px solid ${COLOR.border}`, borderRadius: '8px', fontSize: '14px', background: COLOR.white, color: COLOR.text, cursor: 'pointer', fontFamily: '"Lato", sans-serif', minWidth: '140px' }}
            >
              {MONTH_OPTIONS.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>

            {/* Year dropdown label */}
            <label style={{ fontSize: '12px', color: COLOR.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em' }}>
              Year
            </label>

            {/* Year dropdown - options are 2025, 2026, 2027 */}
            <select
              value={year}
              onChange={e => setYear(parseInt(e.target.value))}  // parseInt converts "2026" -> 2026
              style={{ padding: '10px 14px', border: `1.5px solid ${COLOR.border}`, borderRadius: '8px', fontSize: '14px', background: COLOR.white, color: COLOR.text, cursor: 'pointer', fontFamily: '"Lato", sans-serif', minWidth: '100px' }}
            >
              {YEAR_OPTIONS.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>

          </div>
        }
      />

      {/* Show skeleton placeholder while API request is in flight */}
      {loading && <ReportsSkeleton />}

      {/* Show red error banner if the API request failed */}
      {error && !loading && (
        <div style={{ background: COLOR.redLight, border: `1px solid ${COLOR.redBorder}`, borderRadius: '8px', padding: '12px 16px', marginBottom: '32px', fontSize: '14px', color: COLOR.danger }}>
          {error}
        </div>
      )}

      {/* Main content - only rendered after a successful API response */}
      {!loading && !error && report && (
        <>
          {/* 
              SECTION 1: Income Summary
              4 cards showing financial figures for the selected pickup month
           */}
          <SectionLabel>Income summary — {periodLabel}</SectionLabel>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '4px' }}>

            {/* Card 1: Number of active (non-cancelled) orders for this pickup month */}
            <MetricCard
              label="Orders placed"
              value={nonCancelledCount}
              sub={`picking up in ${periodLabel}`}
            />

            {/* Card 2: Total deposits received, includes cancelled orders
                because refunds must be processed manually outside the system */}
            <MetricCard
              label="Deposits collected"
              value={centsToDollars(depositsCents)}
              sub="Incl. cancelled — refunds processed manually"
            />

            {/* Card 3: Estimated amount still owed by customers at pickup
                = sum of order totals minus deposits already paid */}
            <MetricCard
              label="Est. final payment"
              value={centsToDollars(estimatedFinalCents)}
              sub="Min. estimate — based on order totals"
            />

            {/* Card 4: Average order value across non-cancelled orders
                Calculated as total estimated value divided by order count */}
            <MetricCard
              label="Avg order value"
              value={centsToDollars(avgOrderValueCents)}
              sub="Min. estimate incl. deposit"
            />

          </div>

          <Divider />

          {/* 
              SECTION 2: Order Summary
              6 status cards showing how orders are progressing this month
              Helps the admin see at a glance what stage each order is at
           */}
          <SectionLabel>Order summary — {periodLabel}</SectionLabel>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '14px', marginBottom: '4px' }}>

            {/* Total orders including every status (incl. cancelled and pending) */}
            <MetricCard
              label="Total orders"
              value={totalOrders}
            />

            {/* Confirmed: order placed and acknowledged, staff haven't started yet */}
            <MetricCard
              label="Confirmed"
              value={confirmed}
              color={COLOR.blue}
            />

            {/* In Progress: staff are actively preparing this order */}
            <MetricCard
              label="In progress"
              value={inProgress}
              color={COLOR.amber}
            />

            {/* Ready: order is prepared and waiting for the customer to collect */}
            <MetricCard
              label="Ready for pickup"
              value={ready}
              color={COLOR.purple}
            />

            {/* Completed: customer has collected the order and paid in full */}
            <MetricCard
              label="Completed"
              value={completed}
              color={COLOR.green}
            />

            {/* Cancelled: order was cancelled - useful for tracking refunds */}
            <MetricCard
              label="Cancelled"
              value={cancelled}
              color={COLOR.danger}
            />

          </div>

          <Divider />

          {/* 
              SECTION 3: Top 3 Products Chart
              Bar chart showing the 3 most ordered products by total quantity.
              Cancelled orders are excluded - only shows what needs preparing.
              x-axis: product name | y-axis: total units ordered
           */}
          <SectionLabel>Top 3 products — {periodLabel}</SectionLabel>
          <div style={{ background: COLOR.white, borderRadius: '12px', border: `1px solid ${COLOR.border}`, padding: '28px', boxShadow: '0 4px 12px rgba(0,0,0,0.035)' }}>
            {/* key forces the chart SVG to fully re-render when month/year changes */}
            <TopItemsChart items={topItems} key={`${month}-${year}`} />
          </div>

          {/* Timestamp so the admin knows when this snapshot was generated */}
          <p style={{ fontSize: '12px', color: COLOR.muted, marginTop: '12px', fontStyle: 'italic' }}>
            Generated at {new Date(report.generated_at).toLocaleString('en-AU')}
          </p>
        </>
      )}
    </PageWrapper>
  )
}