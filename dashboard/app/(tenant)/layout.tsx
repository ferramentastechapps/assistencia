'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, MessageSquare, Smartphone, Brain,
  BookOpen, Inbox, BarChart3, LogOut,
  ChevronRight, Zap, Kanban,
  Wrench, ShoppingBag
} from 'lucide-react'
import { useAuthStore } from '@/lib/store'
import { clsx } from 'clsx'

interface NavSection {
  title: string
  items: {
    href: string
    icon: React.ComponentType<{ size?: number | string; className?: string }>
    label: string
    badge?: string
  }[]
}

const navSections: NavSection[] = [
  {
    title: 'Bancada & Loja',
    items: [
      { href: '/repairs', icon: Wrench, label: 'Ordens de Serviço', badge: 'Bancada' },
      { href: '/catalog', icon: ShoppingBag, label: 'Celulares & Vendas', badge: 'Trade-In' },
      { href: '/pipeline', icon: Kanban, label: 'Funil CRM' },
    ]
  },
  {
    title: 'Atendimento WhatsApp',
    items: [
      { href: '/dashboard', icon: LayoutDashboard, label: 'Visão Geral' },
      { href: '/inbox', icon: Inbox, label: 'Inbox Atendimento', badge: 'Live' },
      { href: '/conversations', icon: MessageSquare, label: 'Histórico' },
      { href: '/whatsapp', icon: Smartphone, label: 'Conexão WhatsApp' },
    ]
  },
  {
    title: 'Inteligência & Gestão',
    items: [
      { href: '/ai-config', icon: Brain, label: 'Comportamento da IA' },
      { href: '/knowledge', icon: BookOpen, label: 'Base de Conhecimento' },
      { href: '/analytics', icon: BarChart3, label: 'Analytics' },
    ]
  }
]

export default function TenantLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, isAuthenticated, logout } = useAuthStore()

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login')
    }
  }, [])

  if (!user) return null

  return (
    <div className="flex h-screen bg-[#E5E3DC] text-[#1C1D21] overflow-hidden font-sans select-none">
      {/* ─── Organic Warm Sidebar (Clay & Capsule Aesthetic) ─────────── */}
      <aside className="w-64 flex-shrink-0 flex flex-col border-r border-black/[0.06] bg-[#E5E3DC] z-20">
        {/* Brand & Logo Header */}
        <div className="p-4 border-b border-black/[0.05]">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="relative p-1 rounded-2xl bg-white shadow-tactile-sm border border-black/[0.04] transition-transform duration-300 group-hover:scale-105">
              <div className="w-8 h-8 rounded-xl bg-[#18191B] flex items-center justify-center text-white shadow-sm">
                <Wrench size={16} className="text-[#F5C518]" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm tracking-tight text-[#18191B]">
                  Zap<span className="text-[#F5C518] drop-shadow-sm">IA</span>
                </span>
                <span className="text-[9px] px-2 py-0.2 rounded-full font-bold uppercase tracking-wider bg-[#18191B] text-white">
                  Bancada
                </span>
              </div>
              <div className="text-[11px] text-[#787C87] font-medium truncate max-w-[135px]">
                {user.tenant.name}
              </div>
            </div>
          </Link>
        </div>

        {/* Grouped Capsule Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto scrollbar-thin">
          {navSections.map((section) => (
            <div key={section.title} className="space-y-1">
              <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#888C95]">
                {section.title}
              </div>
              {section.items.map((item) => {
                const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
                return (
                  <Link key={item.href} href={item.href}>
                    <div
                      className={clsx(
                        'group flex items-center gap-2.5 px-3 py-2 rounded-full text-xs transition-all duration-200 cursor-pointer',
                        active
                          ? 'text-[#18191B] bg-white font-bold shadow-[0_4px_16px_-2px_rgba(27,28,30,0.06),inset_0_1px_0_#fff] border border-black/[0.04]'
                          : 'text-[#555962] hover:text-[#18191B] hover:bg-white/60 font-medium'
                      )}
                    >
                      <item.icon
                        size={16}
                        className={clsx(
                          'flex-shrink-0 transition-transform duration-200 group-hover:scale-110',
                          active ? 'text-[#18191B]' : 'text-[#888C95] group-hover:text-[#18191B]'
                        )}
                      />
                      <span className="flex-1 truncate tracking-tight">{item.label}</span>

                      {item.badge === 'Live' && (
                        <div className="flex items-center gap-1 bg-[#18191B] text-white text-[10px] px-2 py-0.5 rounded-full font-semibold shadow-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#F5C518] animate-pulse" />
                          Live
                        </div>
                      )}
                      {item.badge && item.badge !== 'Live' && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#DDD9CE] text-[#332F26] font-semibold border border-black/[0.04]">
                          {item.badge}
                        </span>
                      )}
                      {active && <ChevronRight size={13} className="text-[#18191B]" />}
                    </div>
                  </Link>
                )
              })}
            </div>
          ))}
        </nav>

        {/* Usage Hardware Meter in Warm Clay Well */}
        <div className="p-3 mx-3 mb-2 rounded-[20px] bg-white/70 border border-black/[0.04] shadow-tactile-pill">
          <div className="flex items-center justify-between text-[11px] text-[#555962] mb-1.5 font-medium">
            <span>Uso da cota</span>
            <span className="text-[#18191B] font-bold">{user.tenant.apiUsage} / {user.tenant.maxMessages}</span>
          </div>
          <div className="h-1.5 bg-[#DDD9CE] rounded-full overflow-hidden p-0.2">
            <div
              className="h-full bg-[#18191B] rounded-full transition-all duration-500"
              style={{ width: `${Math.min((user.tenant.apiUsage / user.tenant.maxMessages) * 100, 100)}%` }}
            />
          </div>
          {user.tenant.plan === 'FREE' && (
            <Link
              href="/pricing"
              className="mt-2.5 flex items-center justify-center gap-1.5 text-[11px] font-bold text-[#18191B] bg-[#F5C518] hover:bg-[#FFE033] py-1.5 px-3 rounded-full shadow-sm transition-all"
            >
              <Zap size={12} className="fill-current" /> Upgrade Pro
            </Link>
          )}
        </div>

        {/* User Capsule Pill */}
        <div className="p-3 border-t border-black/[0.05] bg-[#E5E3DC]">
          <div className="flex items-center gap-2.5 p-1 rounded-2xl bg-white border border-black/[0.04] shadow-tactile-pill">
            <div className="w-8 h-8 rounded-full bg-[#18191B] text-[#F5C518] flex items-center justify-center text-xs font-extrabold flex-shrink-0 shadow-sm">
              {user.name[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-[#18191B] truncate">{user.name}</div>
              <div className="text-[10px] text-[#787C87] truncate">{user.email}</div>
            </div>
            <button
              onClick={logout}
              className="p-1.5 rounded-full hover:bg-rose-50 text-[#888C95] hover:text-rose-600 transition-all mr-1"
              title="Sair do sistema"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* ─── Main Content Canvas (Tablet Frame Ergonomics) ─────────────── */}
      <main className="flex-1 overflow-y-auto relative z-10 bg-[#E5E3DC]">
        {children}
      </main>
    </div>
  )
}
