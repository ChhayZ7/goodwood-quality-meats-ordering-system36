'use client'

import DashboardSidebar from '@/components/dashboard/DashboardSideBar'

export default function AccountLayout({ children }) {
  return (
    <div className="flex" style={{ minHeight: '100vh', background: '#FAF3E0' }}>
      <DashboardSidebar role="CUSTOMER" />
      <main className="flex-1" style={{ backgroundColor: '#FAF3E0' }}>
        <div className="px-16 py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
