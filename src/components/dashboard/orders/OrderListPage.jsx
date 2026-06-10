//Since admin and staff sharing the Order Summary page
// Writting 2 separate pages and then copy each other is too complex and not good for furture implement and maintain
//It is too much work if there is another role need to be added to the system in the future that will use the same dashboard
//Or if there is any change that is needed to modify the page, it is too complex if developer has to go to each page just to make the same change
//Hence, create the share component for both of the role is a good design decision 

'use client'

// This component needs to be a Client Component because it uses React state,
// useEffect, useCallback, search input changes, filter tab clicks, and browser-side events.
// Reference used:
// https://nextjs.org/docs/app/api-reference/directives/use-client

import { useState, useEffect, useCallback } from 'react'
// useState stores values that change on the page, such as orders, loading,
// fetch errors, active filter tab, and search text.
// useEffect runs the first order load when the component renders.
// useCallback keeps the loadOrders function stable for useEffect and retry.
// References used:
// https://react.dev/reference/react/useState
// https://react.dev/reference/react/useEffect
// https://react.dev/reference/react/useCallback

import Link from 'next/link'
// Link is used instead of a normal <a> tag so navigation works properly in Next.js.
// Reference used:
// https://nextjs.org/docs/app/api-reference/components/link

// These dashboard components are reused so the staff and admin pages have
// a consistent layout, heading, search box, filter buttons, and status badge style.
import PageWrapper from '@/components/dashboard/PageWrapper'
import PageHeader from '@/components/dashboard/PageHeader'
import SearchInput from '@/components/dashboard/SearchInput'
import FilterTabs from '@/components/dashboard/FilterTabs'
import StatusBadge from '@/components/dashboard/StatusBadge'

// All possible order status filter tabs. "All" is included so users can remove the status filter.
const ALL_TABS = ['All', 'CONFIRMED', 'IN_PROGRESS', 'READY', 'COMPLETED', 'CANCELLED']

// Display labels for the tabs. The database uses status codes like IN_PROGRESS, but the UI needs human-readable text
const TAB_LABELS = {
    All: 'All', CONFIRMED: 'Confirmed', IN_PROGRESS: 'In Progress',
    READY: 'Ready for Pickup', COMPLETED: 'Completed', CANCELLED: 'Cancelled',
}


// Formats a database date into a short Australian date format.
// Example: 2026-06-09 becomes 09 Jun 2026
// Reference - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleDateString
const formatDate = d => new Date(d).toLocaleDateString('en-AU', { day: '2-digit', month: 'short', year: 'numeric' })

// Creates a short order number from the order id. Example: if id starts with abc12345, it becomes GWABC12345.
const shortNum = id => id ? `GW${id.slice(0, 8).toUpperCase()}` : '-'

// Gets the user who last updated the order from the audit log.
function lastUpdatedBy(order) {
    //AI support to help design the algorithm
    //last_audit is the name given to the order_audit_logs table when it's fetched as part of the order query
    const logs = order.last_audit ?? [] //get last audit array, or an empty one if it doesnt exist
    if (logs.length === 0) return '-' //if no history, show a dash

    // Copy the logs using spread syntax before sorting. This avoids directly changing the original logs array.
    // References used:
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
    const sorted = [...logs].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    const u = sorted[0]?.changed_by_user //grab the user who made the most recent audit log entry
    if (!u) return '-' //if the user can't be found, show a dash
    return `${u.first_name ?? ''} ${u.last_name ?? ''}`.trim() || '-' //if yes, return their full name or dash if name is empty
}

// Column sizes for the orders table
const COLS = '160px 1fr 140px 160px 160px 120px'

export default function OrdersListPage({ role }) {
    // This decides whether the page is being used as an admin page or a staff page.
    const isAdmin = role === 'ADMIN'

    // This decides where the View Details link should go.
    // Admin users go to /admin/orders/[id], and staff users go to /staff/orders/[id].
    const basePath = isAdmin ? '/admin/orders' : '/staff/orders'

    const [orders, setOrders] = useState([]) // Full list of orders returned from the API
    const [loading, setLoading] = useState(true) // Shows skeleton rows while the orders are loading
    const [fetchError, setFetchError] = useState(null) // Stores an error message if loading orders fails
    const [activeTab, setActiveTab] = useState('All') // Stores the currently selected status filter
    const [search, setSearch] = useState('') // Stores the text typed into the search box

    // Loads all orders from the API.
    // AI was used here to help structure the async fetch, try/catch, and retry pattern.
    // References used:
    // https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
    // https://react.dev/reference/react/useCallback
    const loadOrders = useCallback(async () => {
        setLoading(true)
        setFetchError(null)
        try {
            const res = await fetch('/api/admin/orders')
            const data = await res.json()
            if (!res.ok) throw new Error(data.error ?? 'Failed to load orders')
            setOrders(data.orders ?? [])
        } catch (err) {
            setFetchError(err.message)
        } finally {
            setLoading(false)
        }
    }, [])

    // Load orders when the component first opens. loadOrders is in the dependency array because it is used inside this effect
    useEffect(() => { loadOrders() }, [loadOrders])

    // Filters the order list by both status tab and search text.
    // AI was used to help combine the tab filter and search filter cleanly.
    // References used:
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/includes
    const filtered = orders.filter(o => {
        const tabMatch = activeTab === 'All' || o.status === activeTab
        const q = search.toLowerCase()
        const customerName = `${o.customer?.first_name ?? ''} ${o.customer?.last_name ?? ''}`.toLowerCase()
        const orderNum = shortNum(o.id).toLowerCase()
        const searchMatch = !q || customerName.includes(q) || orderNum.includes(q)
        return tabMatch && searchMatch
    })

    //page layout
    return (
        <PageWrapper>

            {/* Heading + gold divider */}
            <PageHeader title="Order Management" />


            {/* Filter tabs */}
            <FilterTabs tabs={ALL_TABS} labels={TAB_LABELS} active={activeTab} onChange={setActiveTab} />


            {/* Search */}
            <div style={{ marginBottom: '20px' }}>
                <SearchInput value={search} onChange={e => setSearch(e.target.value)} placeholder="Search order number or customer…" />
            </div>

            {/* Fetch error */}
            {fetchError && (
                <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '12px 16px', fontSize: '13px', color: '#B91C1C', marginBottom: '20px', fontFamily: '"Lato",sans-serif' }}>
                    {fetchError} —{' '}
                    <button onClick={loadOrders} style={{ background: 'none', border: 'none', color: '#7B1A1A', cursor: 'pointer', textDecoration: 'underline', fontSize: '13px', padding: 0 }}>
                        retry
                    </button>
                </div>
            )}

            {/* Table */}
            <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>

                {/* Header */}
                <div style={{ display: 'grid', gridTemplateColumns: COLS, padding: '12px 20px', background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                    {['Order #', 'Customer', 'Pickup Date', 'Status', 'Last Updated By', ''].map(h => (
                        <span key={h} style={{ fontFamily: '"Lato",sans-serif', fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '.06em' }}>
                            {h}
                        </span>
                    ))}
                </div>

                {/* Skeleton rows shown while the page is loading. */}
                {/* This prevents the table from looking empty while waiting for the API. */}
                {/* Reference - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from */}
                {loading && Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: COLS, padding: '15px 20px', borderBottom: i < 5 ? '1px solid #F3F4F6' : 'none', alignItems: 'center', gap: '8px' }}>
                        <div style={{ height: '13px', width: '110px', background: '#F0E8D0', borderRadius: '4px' }} />
                        <div style={{ height: '13px', width: '140px', background: '#F0E8D0', borderRadius: '4px' }} />
                        <div style={{ height: '13px', width: '90px', background: '#F3F4F6', borderRadius: '4px' }} />
                        <div style={{ height: '24px', width: '100px', background: '#F3F4F6', borderRadius: '20px' }} />
                        <div style={{ height: '13px', width: '100px', background: '#F3F4F6', borderRadius: '4px' }} />
                        <div style={{ height: '30px', width: '70px', background: '#F0E8D0', borderRadius: '6px' }} />
                    </div>
                ))}

                {/* Real order rows. */}
                {/* Reference - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map */}
                {!loading && filtered.map((order, i) => (
                    <div
                        key={order.id}
                        style={{
                            display: 'grid', gridTemplateColumns: COLS,
                            padding: '15px 20px',
                            borderBottom: i < filtered.length - 1 ? '1px solid #F3F4F6' : 'none',
                            alignItems: 'center',
                        }}
                    >
                        <span style={{ fontFamily: 'monospace', fontSize: '13px', fontWeight: 700, color: '#1A1A1A' }}>
                            {shortNum(order.id)}
                        </span>
                        <span style={{ fontFamily: '"Lato",sans-serif', fontSize: '13px', color: '#374151' }}>
                            {order.customer?.first_name} {order.customer?.last_name}
                        </span>
                        <span style={{ fontFamily: '"Lato",sans-serif', fontSize: '13px', color: '#374151' }}>
                            {order.pickup_date ? formatDate(order.pickup_date) : '—'}
                        </span>
                        <StatusBadge status={order.status} />
                        <span style={{ fontFamily: '"Lato",sans-serif', fontSize: '12px', color: '#9CA3AF', paddingLeft: '8px' }}>
                            {lastUpdatedBy(order)}
                        </span>

                        {/* View Details link changes depending on role. */}
                        <Link href={`${basePath}/${order.id}`} style={{ textDecoration: 'none' }}>
                            <div
                                style={{
                                    padding: '6px 14px',
                                    borderRadius: '6px',
                                    border: '1.5px solid #7B1A1A',
                                    background: '#7B1A1A',
                                    color: '#fff',
                                    fontSize: '12px',
                                    fontWeight: 700,
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    fontFamily: '"Lato",sans-serif',
                                    transition: 'box-shadow .15s',
                                }}
                                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 12px rgba(123,26,26,0.5)'}
                                onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
                            >
                                View Details
                            </div>
                        </Link>
                    </div>
                ))}

                {/* Empty state shown when there are no orders or no matching filter results*/}
                {!loading && filtered.length === 0 && !fetchError && (
                    <div style={{ padding: '48px', textAlign: 'center', fontFamily: '"Lato",sans-serif', fontSize: '14px', color: '#9CA3AF' }}>
                        {search || activeTab !== 'All' ? 'No orders match your current filter.' : 'No orders yet.'}
                    </div>
                )}
            </div>
        </PageWrapper>
    )
}
