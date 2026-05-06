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

export default function StaffLayout({ children }) {
  const pathname = usePathname()
  const router   = useRouter()

  function handleLogout() {
    // BACKEND TEAM: replace with → await createClientComponentClient().auth.signOut()
    sessionStorage.removeItem('gw_user')
    router.push('/login')
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#FAF3E0' }}>

      <header style={{ background: '#fff', borderBottom: '1px solid #E5E7EB', padding: '0 32px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '36px', height: '36px', background: '#7B1A1A', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Playfair Display",serif', fontWeight: 700, fontSize: '16px', color: '#fff' }}>G</div>
          <div>
            <div style={{ fontFamily: '"Lato",sans-serif', fontWeight: 700, fontSize: '13px', color: '#1A1A1A', letterSpacing: '.06em' }}>GOODWOOD QUALITY MEATS</div>
            <div style={{ fontFamily: '"Lato",sans-serif', fontWeight: 600, fontSize: '10px', color: '#7B1A1A', letterSpacing: '.12em', textTransform: 'uppercase' }}>Staff Portal</div>
          </div>
        </div>
        {/* BACKEND TEAM: replace "Staff Member" with real name from Supabase session */}
        <span style={{ fontFamily: '"Lato",sans-serif', fontSize: '13px', color: '#888' }}>Hi, Staff Member</span>
      </header>

      <GoldDivider />
      </div>
  )
}