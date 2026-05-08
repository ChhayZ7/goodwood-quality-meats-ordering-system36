'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'

const NAV_ITEMS = [
  { href: '/admin/orders',    label: 'Orders',             roles: ['ADMIN', 'STAFF'] },
  { href: '/admin/inventory', label: 'Inventory',          roles: ['ADMIN', 'STAFF'] },
  { href: '/admin/products',  label: 'Products & Pricing', roles: ['ADMIN'] },
  { href: '/admin/reports',   label: 'Reports',            roles: ['ADMIN'] },
  { href: '/admin/staff',     label: 'Staff Management',   roles: ['ADMIN'] },
  { href: '/admin/profile',   label: 'My Account',         roles: ['ADMIN', 'STAFF'] },
]

const LogoutSVG = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
)

export default function AdminSidebar({ role }) {
  const pathname = usePathname()
  const router   = useRouter()

  // Filter nav items based on the role passed from the server
  const visibleNav = NAV_ITEMS.filter(item => item.roles.includes(role))

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside style={{
      width: '240px',
      minWidth: '240px',
      background: '#fff',
      borderRight: '1px solid #E5E7EB',
      display: 'flex',
      flexDirection: 'column',
      paddingTop: '20px',
    }}>
      <nav style={{ flex: 1 }}>
        {visibleNav.map(item => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'block',
                padding: '12px 20px',
                fontFamily: '"Lato",sans-serif',
                fontSize: '14px',
                fontWeight: isActive ? 700 : 400,
                color: isActive ? '#fff' : '#1A1A1A',
                background: isActive ? '#7B1A1A' : 'transparent',
                textDecoration: 'none',
                transition: 'background .15s',
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#F5F5F5' }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Role badge — lets staff know their access level */}
      <div style={{
        padding: '12px 20px',
        borderTop: '1px solid #F3F4F6',
        borderBottom: '1px solid #E5E7EB',
      }}>
        <span style={{
          display: 'inline-block',
          fontSize: '11px',
          fontWeight: 700,
          fontFamily: '"Lato",sans-serif',
          color: role === 'ADMIN' ? '#7B1A1A' : '#1D4ED8',
          background: role === 'ADMIN' ? '#FEF2F2' : '#EFF6FF',
          padding: '3px 10px',
          borderRadius: '99px',
          letterSpacing: '.06em',
          textTransform: 'uppercase',
        }}>
          {role}
        </span>
      </div>

      <button
        onClick={handleLogout}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '14px 20px',
          fontFamily: '"Lato",sans-serif',
          fontSize: '14px',
          color: '#1A1A1A',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          width: '100%',
        }}
        onMouseEnter={e => e.currentTarget.style.background = '#F5F5F5'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        <LogoutSVG />
        Log Out
      </button>
    </aside>
  )
}