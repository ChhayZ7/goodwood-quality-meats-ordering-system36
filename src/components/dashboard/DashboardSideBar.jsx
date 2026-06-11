'use client'

import Link from 'next/link'
// usePathname gets the current URL path so we can highlight the active nav item
// useRouter lets us navigate programmatically after logout
import { usePathname, useRouter } from 'next/navigation'
// supabase browser client used here to sign the user out
import { createClient } from '@/lib/supabase-browser'

// NAV_ITEMS is the full list of sidebar navigation links
// each item has:
//   href -- an object with role-specific paths e.g. ADMIN gets /admin/orders, STAFF gets /staff/orders
//   label -- the text shown in the sidebar
//   roles -- which roles can see this link
// this single array drives the sidebar for all roles (ADMIN, STAFF, CUSTOMER)
// visibleNav filters it down to only the items the current user's role can see
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

// LogoutSVG renders the logout icon shown next to the Log Out button
// inline SVG so no image file is needed
const LogoutSVG = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
)

// DashboardSidebar is a shared component used across admin, staff, and customer dashboards
// props: role -- the current user's role ('ADMIN', 'STAFF', or 'CUSTOMER')
// the sidebar filters nav items, highlights the active link, and handles logout
export default function DashboardSidebar({ role }) {
  const pathname = usePathname()
  const router = useRouter()

  // visibleNav filters NAV_ITEMS to only items where the current role is included
  // e.g. if role is 'STAFF', only items with 'STAFF' in their roles array are shown
  const visibleNav = NAV_ITEMS.filter(item => item.roles.includes(role))

  // handleLogout signs the user out via Supabase auth then redirects to /login
  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <>
      {/* Inline CSS handles both desktop and mobile sidebar layouts
          On desktop (above 768px): vertical sidebar on the left, 240px wide, full height
          On mobile (768px and below): horizontal scrollable nav bar across the top
          !important overrides are needed because some styles are set inline on the element
          AI supported this one, I decided to move this to another CSS file if have more time */}
      <style>{`
        .dash-sidebar {
          width: 240px; min-width: 240px; min-height: 100vh;
          background: #fff; display: flex; flex-direction: column;
        }
        .dash-sidebar-nav { flex: 1; }

        @media (max-width: 768px) {
          .dash-sidebar {
            /* switch from vertical column to horizontal row on mobile */
            width: 100% !important; min-width: unset !important;
            min-height: auto !important; flex-direction: row !important;
            border-bottom: 1px solid #e4e4e4;
            /* allow horizontal scrolling when nav items overflow the screen width */
            overflow-x: auto; -webkit-overflow-scrolling: touch;
            /* hide the scrollbar visually while keeping scroll functionality */
            scrollbar-width: none; flex-shrink: 0;
          }
          /* hide scrollbar in Chrome and Safari */
          .dash-sidebar::-webkit-scrollbar { display: none; }
          /* hide the portal label (Admin Portal / Staff Portal) on mobile -- no room */
          .dash-sidebar-label { display: none !important; }
          .dash-sidebar-nav {
            /* make nav items sit side by side horizontally */
            flex: unset !important; display: flex !important;
            flex-direction: row !important; overflow-x: auto;
          }
          /* prevent nav link text from wrapping onto a second line */
          .dash-sidebar-nav a { white-space: nowrap; border-bottom: none !important; }
          .dash-sidebar-logout {
            /* on mobile, logout sits at the end of the horizontal bar with a left border divider */
            border-top: none !important; border-left: 1px solid #E5E7EB !important;
            white-space: nowrap; flex-shrink: 0;
          }
        }
      `}</style>

      <aside className="dash-sidebar">

        {/* Portal label -- shown on desktop only (hidden on mobile via CSS)
            text changes based on the user's role */}
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

        {/* Nav links -- maps over visibleNav which is already filtered to this role
            href is role-specific e.g. item.href['ADMIN'] gives '/admin/orders'
            isActive uses pathname.startsWith(href) so child pages also highlight the parent link
            active link gets dark red background and white text
            inactive links get a subtle grey hover effect */}
        <nav className="dash-sidebar-nav">
          {visibleNav.map(item => {
            const href = item.href[role]
            // startsWith means /admin/orders/123 still highlights the Orders link
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
                // only apply hover styles when this link is not already active
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#F5F5F5' }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Logout button -- sits at the bottom of the sidebar on desktop
            on mobile it sits at the end of the horizontal nav bar
            clicking it calls handleLogout which signs out via Supabase and redirects to /login */}
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