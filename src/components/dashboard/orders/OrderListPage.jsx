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

const ALL_TABS   = ['All', 'CONFIRMED', 'IN_PROGRESS', 'READY', 'COMPLETED', 'CANCELLED']
const TAB_LABELS = {
  All: 'All', CONFIRMED: 'Confirmed', IN_PROGRESS: 'In Progress',
  READY: 'Ready for Pickup', COMPLETED: 'Completed', CANCELLED: 'Cancelled',
}

const formatDate = d => new Date(d).toLocaleDateString('en-AU', { day: '2-digit', month: 'short', year: 'numeric' })
const shortNum   = id => id ? `GW${id.slice(0, 8).toUpperCase()}` : '-'

//audit log
function lastUpdatedBy(order) {

}

//cols size
const COLS = '160px 1fr 140px 160px 160px 120px'

export default function OrdersListPage({ role }) {
//const to define which page is which 
  const isAdmin  = role === 'ADMIN'
  const basePath = isAdmin ? '/admin/orders' : '/staff/orders'

  const [orders,     setOrders]     = useState([])
  const [loading,    setLoading]    = useState(true)
  const [fetchError, setFetchError] = useState(null)
  const [activeTab,  setActiveTab]  = useState('All')
  const [search,     setSearch]     = useState('')

  //fetch all order from the api
  const loadOrders = useCallback(async () => {
    setLoading(true)
    setFetchError(null)
    try {
      const res  = await fetch('/api/admin/orders')
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
    const tabMatch    = activeTab === 'All' || o.status === activeTab
    const q           = search.toLowerCase()
    const customerName = `${o.customer?.first_name ?? ''} ${o.customer?.last_name ?? ''}`.toLowerCase()
    const orderNum    = shortNum(o.id).toLowerCase()
    const searchMatch = !q || customerName.includes(q) || orderNum.includes(q)
    return tabMatch && searchMatch
  })

  //page layout
  return (
0
  )
}
