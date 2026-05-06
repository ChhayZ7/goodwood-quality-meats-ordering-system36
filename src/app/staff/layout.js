'use client'



import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import GoldDivider from '@/components/GoldDivider'

const LogoutSVG = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
)

const NAV_ITEMS = [
  { href: '/staff/orders',    label: 'Orders'     },
  { href: '/staff/inventory', label: 'Inventory'  },
  { href: '/account',         label: 'My Account' },
]