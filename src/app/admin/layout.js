'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'

const LogoutSVG = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
)

const NAV_ITEMS = [
  { href: '/admin/orders',    label: 'Orders' },
  { href: '/admin/inventory', label: 'Inventory' },
  { href: '/admin/products',  label: 'Products & Pricing' },
  { href: '/admin/reports',   label: 'Reports' },
  { href: '/admin/staff',     label: 'Staff Management' },
  { href: '/admin/feedback',  label: 'Feedback' },
  { href: '/admin/profile',   label: 'My Account' },
]

export default function AdminLayout({ children }) {
  const pathname = usePathname()
  const router   = useRouter()

  function handleLogout() {
    sessionStorage.removeItem('gw_user')
    router.push('/login')
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#FAF3E0' }}>

      {/* Body: sidebar + main content */}
      <div style={{ display: 'flex', flex: 1 }}>

        {/* Sidebar */}
        <aside style={{
          width: '240px',
          minWidth: '240px',
          background: '#fff',
          display: 'flex',
          flexDirection: 'column',
        }}>

          {/* Admin Portal label at top of sidebar */}
          <div style={{
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
            Admin Portal
          </div>

          <nav style={{ flex: 1 }}>
            {NAV_ITEMS.map(item => {
              const isActive = pathname.startsWith(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
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
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#F5F5F5' }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <button
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

        {/* Main content */}
        <main style={{ flex: 1, background: '#FAF3E0', padding: '32px' }}>
          {children}
        </main>

      </div>
    </div>
  )
}