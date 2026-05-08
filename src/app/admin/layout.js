// Server Component — fetches the user role server-side and passes to AdminSidebar
// No 'use client' here — this runs on the server

import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import GoldDivider from '@/components/GoldDivider'
import AdminSidebar from '@/components/AdminSideBar'

export default async function AdminLayout({ children }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Not logged in — redirect to login
  if (!user) {
    redirect('/login')
  }

  const role = user.app_metadata?.role

  // Not an admin or staff — redirect away
  if (role !== 'ADMIN' && role !== 'STAFF') {
    redirect('/')
  }

  const adminName = user.user_metadata?.first_name ?? user.email

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#FAF3E0' }}>

      <header style={{
        background: '#fff',
        borderBottom: '1px solid #E5E7EB',
        padding: '0 32px',
        height: '60px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px', height: '36px',
            background: '#7B1A1A', borderRadius: '6px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: '"Playfair Display",serif', fontWeight: 700, fontSize: '16px', color: '#fff',
          }}>G</div>
          <div>
            <div style={{ fontFamily: '"Lato",sans-serif', fontWeight: 700, fontSize: '13px', color: '#1A1A1A', letterSpacing: '.06em' }}>
              GOODWOOD QUALITY MEATS
            </div>
            <div style={{ fontFamily: '"Lato",sans-serif', fontWeight: 700, fontSize: '10px', color: '#7B1A1A', letterSpacing: '.12em', textTransform: 'uppercase' }}>
              {role === 'ADMIN' ? 'Admin Portal' : 'Staff Portal'}
            </div>
          </div>
        </div>
        <span style={{ fontFamily: '"Lato",sans-serif', fontSize: '13px', color: '#888' }}>
          Hi, {adminName}
        </span>
      </header>

      <GoldDivider />

      <div style={{ display: 'flex', flex: 1 }}>
        {/* Sidebar — Client Component, receives role as prop */}
        <AdminSidebar role={role} />

        <main style={{ flex: 1, background: '#FAF3E0' }}>
          {children}
        </main>
      </div>

    </div>
  )
}