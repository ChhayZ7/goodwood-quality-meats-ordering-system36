'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'

const NAV_ITEMS = [
  { href: { ADMIN: '/admin/orders', STAFF: '/staff/orders' }, label: 'Orders', roles: ['ADMIN', 'STAFF'] },
  { href: { ADMIN: '/admin/inventory', STAFF: '/staff/inventory' }, label: 'Inventory', roles: ['ADMIN', 'STAFF'] },
  { href: { ADMIN: '/admin/daily-prep', STAFF: '/staff/daily-prep' }, label: 'Daily Prep', roles: ['ADMIN', 'STAFF'] },
  { href: { CUSTOMER: '/account/orders' }, label: 'My Orders', roles: ['CUSTOMER'] },
  { href: { CUSTOMER: '/account/profile' }, label: 'My Profile', roles: ['CUSTOMER'] },
  { href: { ADMIN: '/admin/products' }, label: 'Products & Pricing', roles: ['ADMIN'] },
  { href: { ADMIN: '/admin/reports' }, label: 'Reports', roles: ['ADMIN'] },
  { href: { ADMIN: '/admin/staff' }, label: 'Staff Management', roles: ['ADMIN'] },
  { href: { ADMIN: '/admin/feedback' }, label: 'Feedback', roles: ['ADMIN'] },
  { href: { ADMIN: '/admin/profile', STAFF: '/staff/profile' }, label: 'My Account', roles: ['ADMIN', 'STAFF'] },
]


const LogoutSVG = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
)


export default function DashboardSidebar({ role }) {
  const pathname = usePathname()
  const router = useRouter()

  const visibleNav = NAV_ITEMS.filter(item => item.roles.includes(role))


  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }


  return (
    <>
      <style>{`
        .dash-sidebar {
          width: 240px; min-width: 240px; min-height: 100vh;
          background: #fff; display: flex; flex-direction: column;
        }
        .dash-sidebar-nav { flex: 1; }
        @media (max-width: 768px) {
          .dash-sidebar {
            width: 100% !important; min-width: unset !important;
            min-height: auto !important; flex-direction: row !important;
            border-bottom: 1px solid #e4e4e4;
            overflow-x: auto; -webkit-overflow-scrolling: touch;
            scrollbar-width: none; flex-shrink: 0;
          }
          .dash-sidebar::-webkit-scrollbar { display: none; }
          .dash-sidebar-label { display: none !important; }
          .dash-sidebar-nav {
            flex: unset !important; display: flex !important;
            flex-direction: row !important; overflow-x: auto;
          }
          .dash-sidebar-nav a { white-space: nowrap; border-bottom: none !important; }
          .dash-sidebar-logout {
            border-top: none !important; border-left: 1px solid #E5E7EB !important;
            white-space: nowrap; flex-shrink: 0;
          }
        }
      `}</style>
      <aside className="dash-sidebar">

      {/* Portal label: changes based on role */}
      <div className="dash-sidebar-label" style={{
        padding: '20px 20px 16px',
        fontFamily: '"Lato", sans-serif',
        fontWeight: 700,
        fontSize: '16px',
        color: '#7B1A1A',
        letterSpacing: '.12em',
        textTransform: 'uppercase',
        borderBottom: '0.5px solid #e4e4e4',
        marginBottom: '8px',
      }}>
        {role === 'ADMIN' ? 'Admin Portal' : role === 'STAFF' ? 'Staff Portal' : 'My Account'}
      </div>


      <nav className="dash-sidebar-nav">
        {visibleNav.map(item => {
          const href = item.href[role]
          const isActive = pathname.startsWith(href)

          return (
            <Link
              key={href}
              href={href}
              style={{
                display: 'block',
                padding: '12px 20px',
                fontFamily: '"Lato", sans-serif',
                fontSize: '14px',
                fontWeight: isActive ? 700 : 400,
                color: isActive ? '#fff' : '#1A1A1A',
                background: isActive ? '#7B1A1A' : 'transparent',
                textDecoration: 'none',
                transition: 'background .15s',
              }}
              onMouseEnter={e => {
                if (!isActive) e.currentTarget.style.background = '#F5F5F5'
              }}
              onMouseLeave={e => {
                if (!isActive) e.currentTarget.style.background = 'transparent'
              }}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>

      <button
        className="dash-sidebar-logout"
        onClick={handleLogout}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '12px 20px',
          fontFamily: '"Lato", sans-serif',
          fontSize: '14px',
          color: '#1A1A1A',
          background: 'transparent',
          border: 'none',
          borderTop: '1px solid #E5E7EB',
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
    </>
  )
}