import { useState } from 'react'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import SiteFooter from '../components/SiteFooter'

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  // Match main content padding with sidebar width so content isn't hidden
  // - 16rem (64) when expanded
  // - 4rem (16) when collapsed
  const leftPad = sidebarOpen
    ? 'lg:pl-[calc(16rem+1rem)] pl-0'
    : 'lg:pl-[calc(4rem+1rem)] pl-0'
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 bg-black/30 z-40 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />
      <Sidebar open={sidebarOpen} />
      <Topbar sidebarOpen={sidebarOpen} onToggleSidebar={() => setSidebarOpen((v) => !v)} />
      <main className={`pt-14 ${leftPad} pr-0 transition-[padding] duration-300 overflow-x-hidden flex-1`}>
        <div className="pt-0 px-3 pb-3 overflow-x-hidden max-w-full">{children}</div>
      </main>
      <SiteFooter />
    </div>
  )
}


