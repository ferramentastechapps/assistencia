'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { useAuthStore } from '@/lib/store'
import { Sidebar } from '@/components/shell/Sidebar'
import { TopBar } from '@/components/shell/TopBar'
import { FaixasDeCima } from '@/components/shell/FaixasDeCima'

const CHAVE_SIDEBAR_COLLAPSED = 'zapia-sidebar-collapsed'

export default function TenantLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()

  const [collapsed, setCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('zapia-auth')
      if (!stored && !isAuthenticated()) {
        router.push('/login')
      }
      // Restaura preferência de collapse
      const pref = localStorage.getItem(CHAVE_SIDEBAR_COLLAPSED)
      if (pref === 'true') setCollapsed(true)
    }
  }, [])

  function handleToggleCollapse() {
    setCollapsed(prev => {
      const next = !prev
      try { localStorage.setItem(CHAVE_SIDEBAR_COLLAPSED, String(next)) } catch { /* noop */ }
      return next
    })
  }

  return (
    <div className="min-h-screen bg-[#DCD8CD] text-[#1C1D21] font-sans flex selection:bg-[#F5C518] selection:text-[#18191B]">

      {/* ── Sidebar Desktop ───────────────────────────────────────── */}
      <div className="hidden md:flex flex-shrink-0 h-screen sticky top-0">
        <Sidebar collapsed={collapsed} onToggleCollapse={handleToggleCollapse} />
      </div>

      {/* ── Mobile Sidebar Overlay ────────────────────────────────── */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative h-full flex">
            <Sidebar
              collapsed={false}
              onToggleCollapse={() => setMobileSidebarOpen(false)}
              onNavigate={() => setMobileSidebarOpen(false)}
            />
            <button
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center"
              onClick={() => setMobileSidebarOpen(false)}
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ── Main Column ───────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <FaixasDeCima>
          {/* Mobile hamburger integrado ao TopBar */}
          <div className="md:hidden flex items-center h-14 border-b border-[#CAC5B7]/70 bg-[#DCD8CD]/95 backdrop-blur-md px-4 gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="w-9 h-9 rounded-full bg-white border border-black/[0.04] shadow-sm flex items-center justify-center text-[#524D41] hover:text-[#1C1D21] transition-all"
            >
              <Menu size={16} />
            </button>
            <span className="font-black text-[#1C1D21] text-sm tracking-tight">ZapIA</span>
          </div>
          <div className="hidden md:block">
            <TopBar />
          </div>
        </FaixasDeCima>

        <main className="flex-1 w-full overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
