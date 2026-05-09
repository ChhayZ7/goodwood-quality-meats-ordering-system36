// Server Component — fetches user role server-side and passes to AdminSidebar
import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import AdminSidebar from '@/components/AdminSidebar'

export default async function AdminLayout({ children }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Not logged in — redirect to login
  if (!user) redirect('/login')

  const role = user.app_metadata?.role

  // Not admin or staff — redirect away
  if (role !== 'ADMIN' && role !== 'STAFF') redirect('/')

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#FAF3E0' }}>

      {/* Sidebar — Client Component, receives role as prop */}
      <AdminSidebar role={role} />

      {/* Main content */}
      <main style={{ flex: 1, background: '#FAF3E0', padding: '32px' }}>
        {children}
      </main>

    </div>
  )
}