'use client'

import { usePathname } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { useAuthStore } from '@/lib/store'
import { routeMeta } from '@/lib/navigation/registry'

export function TopBar() {
  const pathname = usePathname()
  const { user, logout } = useAuthStore()

  const activeUser = user || {
    name: 'Jota Shop',
    tenant: { name: 'Jota Shop', plan: 'PRO', apiUsage: 540, maxMessages: 2000 },
  }

  const meta = routeMeta[pathname] || { title: 'ZapIA', subtitle: 'Assistência Técnica' }

  return (
    <header
      className="sticky z-20 flex h-14 items-center justify-between gap-4 border-b border-[#CAC5B7]/70 bg-[#DCD8CD]/95 px-4 md:px-6 backdrop-blur-md"
      style={{ top: 'var(--faixas-de-cima, 0px)' }}
    >
      {/* Left: Section title */}
      <div className="min-w-0 flex items-center gap-3">
        <div className="min-w-0">
          <h1 className="text-base font-black tracking-tight text-[#1C1D21] leading-tight truncate">
            {meta.title}
          </h1>
          <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#DAD6C9] text-[#524D41]">
            {meta.subtitle}
          </span>
        </div>
      </div>

      {/* Right: User capsule */}
      <div className="flex items-center gap-2 bg-white rounded-full px-3 py-1.5 shadow-[0_2px_8px_rgba(0,0,0,0.04),inset_0_1px_0_#fff] border border-black/[0.04] flex-shrink-0">
        <div className="w-6 h-6 rounded-full bg-[#232528] text-[#F5C518] flex items-center justify-center text-[10px] font-black">
          {(activeUser.name ?? 'Z')[0].toUpperCase()}
        </div>
        <div className="text-left hidden lg:block">
          <div className="text-xs font-bold text-[#1C1D21] leading-tight truncate max-w-[110px]">
            {activeUser.tenant?.name ?? activeUser.name}
          </div>
          <div className="text-[10px] text-[#797D8A] leading-tight">
            {activeUser.tenant?.apiUsage ?? 0}/{activeUser.tenant?.maxMessages ?? 2000} msgs
          </div>
        </div>
        <button
          onClick={logout}
          className="w-6 h-6 rounded-full hover:bg-rose-50 text-[#888C95] hover:text-rose-600 flex items-center justify-center transition-all ml-1"
          title="Sair do sistema"
        >
          <LogOut size={13} />
        </button>
      </div>
    </header>
  )
}
