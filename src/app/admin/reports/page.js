'use client'

// Admin Reports page.
// Lets the admin view a business summary for a selected pickup month and year.
// Section 1: Income Summary (4 cards)
// Section 2: Order Summary (6 status cards)
// Section 3: Top 3 Products chart (SVG bar chart by units ordered)

import { useState, useEffect } from 'react'
// PageWrapper wraps the page content with consistent padding and layout
// PageHeader renders the page title and optional action slot (used here for the dropdowns)
import PageWrapper from '@/components/dashboard/PageWrapper'
import PageHeader from '@/components/dashboard/PageHeader'

// COLOR stores all brand colours used on this page in one place
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

// MONTH_OPTIONS is the list of months shown in the month dropdown
// only November, December, and January are valid because those are the Christmas ordering season months
const MONTH_OPTIONS = [
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
  { value: 1,  label: 'January'  },
]

// YEAR_OPTIONS is the list of years shown in the year dropdown
const YEAR_OPTIONS = [2025, 2026, 2027]

// getDefaultSelection determines what month and year to pre-select when the page first loads
// new Date() gets the current date and time
// getMonth() returns 0-11 (JavaScript months start at 0, so January = 0, December = 11)
// +1 converts it to the normal 1-12 range
// getFullYear() returns the full 4-digit year e.g. 2026
// [11, 12, 1].includes(currentMonth) checks if we are currently in a season month
// if yes, default to the current month and year
// if no (e.g. it is July), default to December of the current year
function getDefaultSelection() {
  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()

  if ([11, 12, 1].includes(currentMonth)) {
    return { month: currentMonth, year: currentYear }
  }
  return { month: 12, year: currentYear }
}

// centsToDollars converts a cents integer to a dollar string
// e.g. 28400 becomes "$284"
// Math.round removes any floating point issues before dividing
// toLocaleString adds commas for thousands e.g. 100000 becomes "100,000"
function centsToDollars(cents) {
  return '$' + Math.round(cents / 100).toLocaleString()
}

// getMonthLabel takes a month number and returns its display name
// e.g. 12 returns "December"
// .find() searches MONTH_OPTIONS for the object where value matches the month number
// ?. is optional chaining -- if find() returns undefined, .label won't crash, it just returns undefined
// ?? '' means if the result is null or undefined, return an empty string instead
function getMonthLabel(month) {
  return MONTH_OPTIONS.find(m => m.value === month)?.label ?? ''
}

// SkeletonBox renders a single shimmer placeholder block used while data is loading
// props: height, width, radius -- control the size and shape
// the pulse animation slides the gradient left to right to create the shimmer effect
function SkeletonBox({ height = 20, width = '100%', radius = 8 }) {
  return (
    <div style={{
      height,
      width,
      borderRadius: radius,
      background: 'linear-gradient(90deg, #EFE6D1 25%, #F7EFD9 50%, #EFE6D1 75%)',
      backgroundSize: '200% 100%',
      animation: 'pulse 1.4s ease-in-out infinite',
    }} />
  )
}

// ReportsSkeleton renders the full page skeleton shown while the API request is in progress
// it mimics the shape of the real content so there is no layout shift when data arrives
function ReportsSkeleton() {
  return (
    <>
      {/* pulse keyframe -- slides the gradient from right to left repeatedly */}
      <style>{`
        @keyframes pulse {
          0%   { background-position:  200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

        {/* Skeleton for Income Summary -- 4 placeholder cards in a row */}
        <div>
          <SkeletonBox width="150px" height={16} />
          <div style={{ height: 14 }} />
          <div className="report-income-grid">
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

        {/* Thin divider placeholder */}
        <SkeletonBox height={1} />

        {/* Skeleton for Order Summary -- 6 placeholder cards in a row */}
        <div>
          <SkeletonBox width="180px" height={16} />
          <div style={{ height: 14 }} />
          <div className="report-order-grid">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} style={{ background: COLOR.sidebar, borderRadius: '10px', padding: '16px 20px', border: `1px solid ${COLOR.border}` }}>
                <SkeletonBox width="80%" height={14} />
                <div style={{ height: 14 }} />
                <SkeletonBox width="50%" height={30} />
              </div>
            ))}
          </div>
        </div>

        {/* Thin divider placeholder */}
        <SkeletonBox height={1} />

        {/* Skeleton for the Top 3 chart -- tall block mimicking the chart area */}
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

// MetricCard renders a single stat card with a label, a large value, and an optional sub-note
// props:
//   label -- small uppercase heading e.g. "Orders placed"
//   value -- the main large number or dollar amount shown on the card
//   sub -- optional small italic note shown below the value
//   color -- optional override for the value text colour, used to colour-code status cards
//   color ?? COLOR.text means use the passed colour if provided, otherwise fall back to the default text colour
function MetricCard({ label, value, sub, color }) {
  return (
    <div style={{ background: COLOR.sidebar, borderRadius: '10px', padding: '16px 20px', border: `1px solid ${COLOR.border}` }}>
      <p style={{ fontSize: '12px', fontWeight: 700, color: COLOR.muted, textTransform: 'uppercase', letterSpacing: '.06em', margin: '0 0 8px' }}>
        {label}
      </p>
      <p style={{ fontSize: '28px', fontWeight: 700, color: color ?? COLOR.text, lineHeight: 1, margin: 0 }}>
        {value}
      </p>
      {/* sub note only renders if a sub prop was passed in */}
      {sub && (
        <p style={{ fontSize: '11px', color: COLOR.muted, margin: '8px 0 0', fontStyle: 'italic' }}>
          {sub}
        </p>
      )}
    </div>
  )
}

// SectionLabel renders a small uppercase grey label used as a heading for each report section
// children is whatever text is passed between the opening and closing tags
function SectionLabel({ children }) {
  return (
    <p style={{ fontSize: '12px', fontWeight: 700, color: COLOR.muted, textTransform: 'uppercase', letterSpacing: '.06em', margin: '0 0 12px' }}>
      {children}
    </p>
  )
}

// Divider renders a thin horizontal line used to separate the three report sections
function Divider() {
  return <div style={{ height: '1px', background: COLOR.border, margin: '28px 0' }} />
}

// TopItemsChart renders an SVG bar chart showing the top 3 products by units ordered
// props: items -- array of objects with name and units fields from the API
// SVG is used instead of a library so there are no extra dependencies
// all positions and sizes are calculated manually using the constants and helper functions below
function TopItemsChart({ items }) {

  // empty state -- shown if the API returned no top products for this period
  if (!items || items.length === 0) {
    return (
      <p style={{ color: COLOR.muted, fontSize: '14px', margin: 0 }}>
        No order data for this period.
      </p>
    )
  }

  // SVG canvas size in pixels
  const SVG_W = 600  // total SVG width
  const SVG_H = 280  // total SVG height

  // Padding around the chart area -- creates space for labels on each side
  const PAD_L = 48   // left padding -- room for y-axis number labels
  const PAD_R = 24   // right padding -- breathing room on the right
  const PAD_T = 32   // top padding -- room for the value label above each bar
  const PAD_B = 48   // bottom padding -- room for the product name labels below the x-axis

  // CHART_W and CHART_H are the actual drawable area after subtracting all padding
  // bars can only be drawn within this area
  const CHART_W = SVG_W - PAD_L - PAD_R
  const CHART_H = SVG_H - PAD_T - PAD_B

  // BAR_W is the pixel width of each bar
  const BAR_W = 64

  // GROUP_W is the horizontal space each product gets
  // divides the chart width equally among all products (currently always 3)
  const GROUP_W = CHART_W / items.length

  // maxUnits is the highest unit count among all products
  // Math.max(...items.map(i => i.units)) spreads the units values as separate arguments to Math.max
  // the second argument ,1 prevents maxUnits from being 0 if all products have 0 units (avoids dividing by zero)
  const maxUnits = Math.max(...items.map(i => i.units), 1)

  // scaleUnits converts a unit count to a pixel height within the chart area
  // divides the value by maxUnits to get a 0-1 ratio, then multiplies by CHART_H
  // e.g. if maxUnits is 10 and value is 5, returns CHART_H * 0.5 = half the chart height
  const scaleUnits = v => (v / maxUnits) * CHART_H

  // unitTicks generates 4 evenly spaced labels for the y-axis from 0 to maxUnits
  // [0, 1, 2, 3].map(i => ...) creates 4 values by dividing maxUnits into thirds
  // e.g. if maxUnits is 15, ticks will be [0, 5, 10, 15]
  // Math.round handles any decimal results
  const unitTicks = [0, 1, 2, 3].map(i => Math.round((maxUnits / 3) * i))

  // groupCentreX calculates the horizontal centre point of each product's column
  // PAD_L is the left offset, i * GROUP_W moves to the correct column, GROUP_W / 2 finds the centre
  // e.g. for product 0: 48 + 0 * 176 + 88 = 136px from the left edge
  //      for product 1: 48 + 1 * 176 + 88 = 312px from the left edge
  //      for product 2: 48 + 2 * 176 + 88 = 488px from the left edge
  const groupCentreX = i => PAD_L + i * GROUP_W + GROUP_W / 2

  // barX calculates the left edge of the bar by taking the centre and going back half the bar width
  // this centres the bar within its column
  // e.g. barX for product 0: 136 - 32 = 104px (BAR_W is 64, half is 32)
  const barX = i => groupCentreX(i) - BAR_W / 2

  // barY calculates the top edge of the bar in SVG coordinates
  // SVG y=0 is at the top of the screen, so bars grow upward by subtracting height from the baseline
  // baseline is at PAD_T + CHART_H (the bottom of the chart area)
  // e.g. if bar height is 100px and CHART_H is 200px: barY = 32 + 200 - 100 = 132px from the top
  const barY = scaledH => PAD_T + CHART_H - scaledH

  return (
    <div>

      {/* Legend -- shows what the red bar represents */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: COLOR.muted }}>
          {/* Small red square colour swatch */}
          <span style={{ width: 12, height: 12, borderRadius: 2, background: COLOR.red, display: 'inline-block' }} />
          Units ordered
        </div>
      </div>

      {/* SVG element -- viewBox makes the chart scale to any container width
          overflow visible allows labels to show outside the SVG bounds if needed
          aria-label and role="img" make it accessible for screen readers */}
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width="100%"
        style={{ display: 'block', overflow: 'visible' }}
        aria-label="Bar chart showing top 3 products by units ordered"
        role="img"
      >
        {/* Y-axis grid lines and tick labels
            maps over unitTicks to render one horizontal line and one number label per tick
            barY(scaleUnits(tick)) converts the tick value to its pixel Y position on the SVG */}
        {unitTicks.map((tick, i) => {
          const y = barY(scaleUnits(tick))
          return (
            <g key={`tick-${i}`}>
              {/* Dashed horizontal grid line -- spans the full chart width */}
              <line
                x1={PAD_L} y1={y}
                x2={PAD_L + CHART_W} y2={y}
                stroke={COLOR.border} strokeWidth="1" strokeDasharray="4 3"
              />
              {/* Tick number label -- positioned to the left of the chart, textAnchor end right-aligns it */}
              <text x={PAD_L - 8} y={y + 4} textAnchor="end" fontSize="11" fill={COLOR.muted}>
                {tick}
              </text>
            </g>
          )
        })}

        {/* Y-axis label "Units" -- rotated 90 degrees to read vertically
            transform rotate(-90) rotates around the point (12, centreY) so it sits along the left edge */}
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

        {/* Bars -- one group per product
            each group contains the bar rectangle, value label above, and product name below */}
        {items.map((item, i) => {
          const unitsH = scaleUnits(item.units)  // pixel height of this bar
          const x = barX(i)                      // left edge x position of this bar
          const y = barY(unitsH)                 // top edge y position of this bar

          return (
            <g key={item.name}>

              {/* Bar rectangle -- rx 4 rounds the top corners slightly */}
              <rect
                x={x} y={y}
                width={BAR_W} height={unitsH}
                fill={COLOR.red} rx="4"
              />

              {/* Value label above the bar -- x + BAR_W / 2 centres it over the bar
                  y - 8 places it just above the top of the bar */}
              <text
                x={x + BAR_W / 2} y={y - 8}
                textAnchor="middle" fontSize="13" fontWeight="700" fill={COLOR.red}
              >
                {item.units}
              </text>

              {/* Product name label below the x-axis
                  PAD_T + CHART_H + 20 places it 20px below the baseline */}
              <text
                x={groupCentreX(i)} y={PAD_T + CHART_H + 20}
                textAnchor="middle" fontSize="12" fill={COLOR.text}
              >
                {item.name}
              </text>

            </g>
          )
        })}

        {/* X-axis baseline -- horizontal line at the bottom of the chart area */}
        <line
          x1={PAD_L} y1={PAD_T + CHART_H}
          x2={PAD_L + CHART_W} y2={PAD_T + CHART_H}
          stroke={COLOR.border} strokeWidth="1.5"
        />

        {/* Y-axis left border line -- vertical line on the left edge of the chart area */}
        <line
          x1={PAD_L} y1={PAD_T}
          x2={PAD_L} y2={PAD_T + CHART_H}
          stroke={COLOR.border} strokeWidth="1.5"
        />

      </svg>
    </div>
  )
}

// Main page component -- manages state, fetches report data, and renders all three sections
export default function AdminReportsPage() {

  // getDefaultSelection runs once to determine the starting month and year based on today's date
  const defaults = getDefaultSelection()

  // month tracks the currently selected pickup month (11, 12, or 1)
  const [month, setMonth] = useState(defaults.month)

  // year tracks the currently selected pickup year
  const [year, setYear] = useState(defaults.year)

  // report stores the full API response object when the fetch succeeds
  const [report, setReport] = useState(null)

  // loading is true while the API call is in progress, controls whether skeleton shows
  const [loading, setLoading] = useState(true)

  // error stores any error message if the API call fails
  const [error, setError] = useState(null)

  // useEffect runs fetchReport on first mount and again whenever month or year changes
  // [month, year] is the dependency array -- any change to these triggers a re-fetch
  useEffect(() => {
    async function fetchReport() {
      setLoading(true)
      setError(null)

      try {
        // month and year are passed as query parameters in the URL
        // e.g. /api/admin/reports?month=12&year=2026
        const url = `/api/admin/reports?month=${month}&year=${year}`
        const res = await fetch(url)

        // read the response as text first so we can handle non-JSON server errors
        const text = await res.text()
        let data
        try {
          // parse the text as JSON -- if this fails it means the server returned something unexpected
          data = JSON.parse(text)
        } catch {
          throw new Error('Server returned invalid JSON')
        }

        // if HTTP status is not 2xx, throw the error message from the API
        if (!res.ok) throw new Error(data.error ?? 'Failed to load report')

        setReport(data)
      } catch (err) {
        setError(err.message)
      } finally {
        // setLoading false always runs whether fetch succeeded or failed
        setLoading(false)
      }
    }

    fetchReport()
  }, [month, year])

  // statusCounts is the orders_by_status object from the API
  // e.g. { CONFIRMED: 3, IN_PROGRESS: 2, COMPLETED: 5 }
  // ?? {} means if report is null, use an empty object so nothing crashes before data loads
  const statusCounts = report?.orders_by_status ?? {}

  // totalOrders adds up all status counts to get the grand total
  // Object.values(statusCounts) returns the numbers only e.g. [3, 2, 5]
  // .reduce((sum, n) => sum + n, 0) adds them up starting from 0
  const totalOrders = Object.values(statusCounts).reduce((sum, n) => sum + n, 0)

  // individual status counts -- ?? 0 defaults to 0 if that status is not in the response
  const confirmed   = statusCounts.CONFIRMED   ?? 0
  const inProgress  = statusCounts.IN_PROGRESS ?? 0
  const ready       = statusCounts.READY       ?? 0
  const completed   = statusCounts.COMPLETED   ?? 0
  const cancelled   = statusCounts.CANCELLED   ?? 0

  // summary is the order_summary object from the API containing financial figures
  const summary = report?.order_summary ?? {}
  const depositsCents        = summary.deposits_collected_cents    ?? 0
  const estimatedFinalCents  = summary.estimated_final_pay_cents   ?? 0
  const avgOrderValueCents   = summary.avg_order_value_cents       ?? 0
  // nonCancelledCount is the number of active orders excluding cancelled ones
  const nonCancelledCount    = summary.order_count                 ?? 0

  // topItems is the array of top 3 products for the bar chart
  const topItems = report?.top_products ?? []

  // periodLabel is the human-readable string for the selected period e.g. "December 2026"
  const periodLabel = `${getMonthLabel(month)} ${year}`

  return (
    <PageWrapper>

      {/* Inline CSS for responsive grid layouts
          report-income-grid is 4 columns on desktop, 2 columns on tablet (max 900px)
          report-order-grid is 6 columns on desktop, 3 columns on tablet, 2 columns on small mobile (max 480px)
          report-filter is the dropdown row in the page header */}
      <style>{`
        .report-filter { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
        .report-income-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 4px; }
        .report-order-grid  { display: grid; grid-template-columns: repeat(6, 1fr); gap: 14px; margin-bottom: 4px; }
        @media (max-width: 900px) {
          .report-income-grid { grid-template-columns: repeat(2, 1fr); }
          .report-order-grid  { grid-template-columns: repeat(3, 1fr); }
        }
        @media (max-width: 480px) {
          .report-order-grid { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>

      {/* PageHeader renders the title and passes the dropdowns as the action slot
          parseInt converts the dropdown value string to a number e.g. "12" becomes 12
          because select onChange always returns a string */}
      <PageHeader
        title="Reports"
        action={
          <div className="report-filter">
            <label style={{ fontSize: '12px', color: COLOR.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em' }}>
              Month
            </label>
            <select
              value={month}
              onChange={e => setMonth(parseInt(e.target.value))}
              style={{ padding: '10px 14px', border: `1.5px solid ${COLOR.border}`, borderRadius: '8px', fontSize: '14px', background: COLOR.white, color: COLOR.text, cursor: 'pointer', fontFamily: '"Lato", sans-serif', minWidth: '140px' }}
            >
              {MONTH_OPTIONS.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>

            <label style={{ fontSize: '12px', color: COLOR.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em' }}>
              Year
            </label>
            <select
              value={year}
              onChange={e => setYear(parseInt(e.target.value))}
              style={{ padding: '10px 14px', border: `1.5px solid ${COLOR.border}`, borderRadius: '8px', fontSize: '14px', background: COLOR.white, color: COLOR.text, cursor: 'pointer', fontFamily: '"Lato", sans-serif', minWidth: '100px' }}
            >
              {YEAR_OPTIONS.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        }
      />

      {/* Skeleton -- shown while the API call is in progress */}
      {loading && <ReportsSkeleton />}

      {/* Error banner -- shown if the API call failed and loading is done */}
      {error && !loading && (
        <div style={{ background: COLOR.redLight, border: `1px solid ${COLOR.redBorder}`, borderRadius: '8px', padding: '12px 16px', marginBottom: '32px', fontSize: '14px', color: COLOR.danger }}>
          {error}
        </div>
      )}

      {/* Main content -- only renders after a successful API response
          React fragment shorthand groups the three sections without adding a DOM node */}
      {!loading && !error && report && (
        <>

          {/* SECTION 1: Income Summary
              4 MetricCard components showing financial figures for the selected month
              periodLabel e.g. "December 2026" is shown in the section heading */}
          <SectionLabel>Income summary -- {periodLabel}</SectionLabel>
          <div className="report-income-grid">

            {/* Number of active orders (not cancelled) picking up in this period */}
            <MetricCard
              label="Orders placed"
              value={nonCancelledCount}
              sub={`picking up in ${periodLabel}`}
            />

            {/* Total deposits received including cancelled orders
                refunds for cancelled orders are handled manually outside the system */}
            <MetricCard
              label="Deposits collected"
              value={centsToDollars(depositsCents)}
              sub="Incl. cancelled -- refunds processed manually"
            />

            {/* Estimated remaining amount customers still owe at pickup
                calculated as total order value minus deposits already paid */}
            <MetricCard
              label="Est. final payment"
              value={centsToDollars(estimatedFinalCents)}
              sub="Min. estimate -- based on order totals"
            />

            {/* Average order value across non-cancelled orders */}
            <MetricCard
              label="Avg order value"
              value={centsToDollars(avgOrderValueCents)}
              sub="Min. estimate incl. deposit"
            />

          </div>

          <Divider />

          {/* SECTION 2: Order Summary
              6 MetricCard components showing order counts per status
              each card uses a different colour to visually distinguish the statuses */}
          <SectionLabel>Order summary -- {periodLabel}</SectionLabel>
          <div className="report-order-grid">

            {/* Total orders across all statuses including cancelled */}
            <MetricCard label="Total orders"      value={totalOrders}  />

            {/* Confirmed -- order placed and acknowledged, not yet being prepared */}
            <MetricCard label="Confirmed"         value={confirmed}    color={COLOR.blue}   />

            {/* In Progress -- staff are actively preparing this order */}
            <MetricCard label="In progress"       value={inProgress}   color={COLOR.amber}  />

            {/* Ready -- order is prepared and waiting for customer to collect */}
            <MetricCard label="Ready for pickup"  value={ready}        color={COLOR.purple} />

            {/* Completed -- customer has collected and paid in full */}
            <MetricCard label="Completed"         value={completed}    color={COLOR.green}  />

            {/* Cancelled -- useful for tracking how many refunds need to be processed */}
            <MetricCard label="Cancelled"         value={cancelled}    color={COLOR.danger} />

          </div>

          <Divider />

          {/* SECTION 3: Top 3 Products Chart
              SVG bar chart showing the 3 most ordered products by total quantity
              cancelled orders are excluded -- only shows what actually needs preparing
              key={month-year} forces the chart to fully re-render when the selection changes
              without this, React might reuse the old SVG and the bars won't animate correctly */}
          <SectionLabel>Top 3 products -- {periodLabel}</SectionLabel>
          <div style={{ background: COLOR.white, borderRadius: '12px', border: `1px solid ${COLOR.border}`, padding: '28px', boxShadow: '0 4px 12px rgba(0,0,0,0.035)' }}>
            <TopItemsChart items={topItems} key={`${month}-${year}`} />
          </div>

          {/* Timestamp showing when this report snapshot was generated
              toLocaleString('en-AU') formats the date in Australian format */}
          <p style={{ fontSize: '12px', color: COLOR.muted, marginTop: '12px', fontStyle: 'italic' }}>
            Generated at {new Date(report.generated_at).toLocaleString('en-AU')}
          </p>

        </>
      )}
    </PageWrapper>
  )
}