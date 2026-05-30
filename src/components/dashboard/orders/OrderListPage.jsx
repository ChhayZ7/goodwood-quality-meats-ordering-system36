//Since admin and staff sharing the Order Summary page
// Writting 2 separate pages and then copy each other is too complex and not good for furture implement and maintain
//It is too much work if there is another role need to be added to the system in the future that will use the same dashboard
//Or if there is any change that is needed to modify the page, it is too complex if developer has to go to each page just to make the same change
//Hence, create the share component for both of the role is a good design decision 

'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
//import the component of dashboard that will be resue for this list page
import PageWrapper from '@/components/dashboard/PageWrapper'
import PageHeader from '@/components/dashboard/PageHeader'
import SearchInput from '@/components/dashboard/SearchInput'
import FilterTabs from '@/components/dashboard/FilterTabs'
import StatusBadge from '@/components/dashboard/StatusBadge'

const ALL_TABS = ['All', 'CONFIRMED', 'IN_PROGRESS', 'READY', 'COMPLETED', 'CANCELLED']
const TAB_LABELS = {
    All: 'All', CONFIRMED: 'Confirmed', IN_PROGRESS: 'In Progress',
    READY: 'Ready for Pickup', COMPLETED: 'Completed', CANCELLED: 'Cancelled',
}

const formatDate = d => new Date(d).toLocaleDateString('en-AU', { day: '2-digit', month: 'short', year: 'numeric' })
const shortNum = id => id ? `GW${id.slice(0, 8).toUpperCase()}` : '-'

//audit log
function lastUpdatedBy(order) {
    //AI support to help design the algorithm
    //last_audit is the name given to the order_audit_logs table when it's fetched as part of the order query
    const logs = order.last_audit ?? [] //get last audit array, or an empty one if it doesnt exist
    if (logs.length === 0) return '-' //if no history, show a dash
    const sorted = [...logs].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) //sort by date, most recent first
    const u = sorted[0]?.changed_by_user //grab the user who made the most recent change
    if (!u) return '-' //if can't find, show a dash
    return `${u.first_name ?? ''} ${u.last_name ?? ''}`.trim() || '-' //if yes, return their full name or dash if name is empty
}

//cols size
const COLS = '160px 1fr 140px 160px 160px 120px'

export default function OrdersListPage({ role }) {
    //const to define which page is which 
    const isAdmin = role === 'ADMIN'
    const basePath = isAdmin ? '/admin/orders' : '/staff/orders'

    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [fetchError, setFetchError] = useState(null)
    const [activeTab, setActiveTab] = useState('All')
    const [search, setSearch] = useState('')

    //fetch all order from the api
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

    useEffect(() => { loadOrders() }, [loadOrders])

    //const for filter
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
        <div style={{ padding: '32px', maxWidth: '1200px' }}>

            {/* Heading + gold divider */}
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontFamily: '"Lato", serif', fontSize: '36px', fontWeight: 700, color: '#7B1A1A', margin: '0 0 32px 0' }}>
                    Order Management
                </h1>
                <div style={{ height: '2px', background: 'linear-gradient(90deg, #C9A84C, transparent)', borderRadius: '1px' }} />
            </div>

            {/* Filter tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                {ALL_TABS.map(tab => {
                    const isActive = tab === activeTab
                    return (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            style={{
                                padding: '7px 16px', borderRadius: '20px',
                                border: `1.5px solid ${isActive ? '#7B1A1A' : '#E5E7EB'}`,
                                background: isActive ? '#7B1A1A' : '#fff',
                                color: isActive ? '#fff' : '#555',
                                fontSize: '13px', fontWeight: isActive ? 700 : 400,
                                cursor: 'pointer', fontFamily: '"Lato",sans-serif',
                                transition: 'all .15s',
                            }}
                        >
                            {TAB_LABELS[tab]}
                        </button>
                    )
                })}
            </div>

            {/* Search */}
            <div style={{ marginBottom: '20px' }}>
                <div style={{ position: 'relative', display: 'inline-block', width: '340px' }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#AAAAAA" strokeWidth="2" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                        className="gw-input"
                        type="text"
                        placeholder="Search order # or customer…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{ paddingLeft: '38px', width: '340px' }}
                    />
                </div>
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

                {/* Skeleton */}
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

                {/* Rows */}
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
                        <Link href={`/admin/orders/${order.id}`} style={{ textDecoration: 'none' }}>
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

                {/* Empty state */}
                {!loading && filtered.length === 0 && !fetchError && (
                    <div style={{ padding: '48px', textAlign: 'center', fontFamily: '"Lato",sans-serif', fontSize: '14px', color: '#9CA3AF' }}>
                        {search || activeTab !== 'All' ? 'No orders match your current filter.' : 'No orders yet.'}
                    </div>
                )}
            </div>
        </div>
    )
}
