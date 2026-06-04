import { Outlet } from 'react-router-dom'
import Sidebar from './layout/Sidebar'
import Header from './layout/Header'
import MobileNav from './layout/MobileNav'

export default function Layout() {
  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-surface)]">
      <Sidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />

        {/* Page content — extra bottom padding on mobile for the nav bar */}
        <main className="flex-1 overflow-y-auto p-4 pb-20 md:p-6 md:pb-6">
          <Outlet />
        </main>
      </div>

      <MobileNav />
    </div>
  )
}
