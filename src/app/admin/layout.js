// Server Component — fetches user role server-side and passes to AdminSidebar
import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import DashboardSidebar from '@/components/dashboard/DashboardSideBar'

export default async function AdminLayout({ children }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Not logged in — redirect to login
  if (!user) redirect('/login')

  const role = user.app_metadata?.role

  // Not admin or staff — redirect away
  if (role !== 'ADMIN' && role !== 'STAFF') redirect('/')

  return (
    <>
      <style>{`
        .admin-layout { min-height: 100vh; display: flex; background: #FAF3E0; }
        .admin-main { flex: 1; background: #FAF3E0; padding: 32px; min-width: 0; }
        @media (max-width: 768px) {
          .admin-layout { flex-direction: column; }
          .admin-main { padding: 16px; }
        }
      `}</style>
      <div className="admin-layout">

        {/* Sidebar - Client Component, receives role as prop */}
        <DashboardSidebar role={role} />

        {/* Main content */}
        <main className="admin-main">
          {children}
        </main>

      </div>
    </>
  )
}