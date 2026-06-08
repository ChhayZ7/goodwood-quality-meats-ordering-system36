//use design pattern of admin's sidebar layout.js

import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import DashboardSidebar from '@/components/dashboard/DashboardSideBar'

export default async function StaffLayout({ children }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
 
  //if user hasn't logged in yet -> redirect to login page
  if (!user) redirect('/login')
 
  const role = user.app_metadata?.role
 
  // Only staff can access this layout
  if (role !== 'STAFF') redirect('/')
 
  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#FAF3E0' }}>
      <DashboardSidebar role={role} />
      <main style={{ flex: 1, background: '#FAF3E0', padding: '32px' }}>
        {children}
      </main>
    </div>
  )
}
 