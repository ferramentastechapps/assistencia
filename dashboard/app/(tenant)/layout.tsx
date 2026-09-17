'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, MessageSquare, Smartphone, Brain,
  BookOpen, Inbox, BarChart3, LogOut,
  MessageCircle, ChevronRight, Zap, Kanban, Sparkles,
  Wrench, ShoppingBag
} from 'lucide-react'
import { useAuthStore } from '@/lib/store'
import { clsx } from 'clsx'

interface NavSection {
  title: string
  items: {
    href: string
    icon: React.ComponentType<{ size?: number; className?: string }>
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
    <div className="flex h-screen bg-[#050507] text-[#f1f3f9] overflow-hidden font-sans">
      {/* ─── Ambient Glow Effect ────────────────────────────────────── */}
      <div className="fixed top-0 left-64 right-0 h-64 bg-gradient-to-b from-emerald-500/[0.03] via-cyan-500/[0.015] to-transparent pointer-events-none z-0" />

      {/* ─── Sidebar ──────────────────────────────────────────────────── */}
      <aside className="w-64 flex-shrink-0 flex flex-col border-r border-white/[0.07] bg-[#07080b]/95 backdrop-blur-2xl z-20">
        {/* Brand & Logo Header */}
        <div className="p-4 border-b border-white/[0.06]">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="relative p-1 rounded-2xl bg-white/[0.03] border border-white/[0.08] shadow-[0_4px_20px_rgba(0,0,0,0.5)] transition-transform duration-300 group-hover:scale-105">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-[0_0_12px_rgba(16,185,129,0.4)]">
                <MessageCircle size={17} className="text-white" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm tracking-tight text-white">Zap<span className="text-emerald-400">IA</span></span>
                <span className="text-[9px] px-1.5 py-0.2 rounded-full font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Tech Pro
                </span>
              </div>
              <div className="text-[11px] text-white/40 font-medium truncate max-w-[135px]">
                {user.tenant.name}
              </div>
            </div>
          </Link>
        </div>

        {/* Grouped Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto scrollbar-thin">
          {navSections.map((section) => (
            <div key={section.title} className="space-y-1">
              <div className="px-2 pb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white/30">
                {section.title}
              </div>
              {section.items.map((item) => {
                const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
                return (
                  <Link key={item.href} href={item.href}>
                    <div
                      className={clsx(
                        'group flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer select-none',
                        active
                          ? 'text-white bg-gradient-to-r from-emerald-500/15 via-emerald-500/10 to-transparent border border-emerald-500/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]'
                          : 'text-white/55 hover:text-white hover:bg-white/[0.04]'
                      )}
                    >
                      <item.icon
                        size={16}
                        className={clsx(
                          'flex-shrink-0 transition-transform duration-200 group-hover:scale-110',
                          active ? 'text-emerald-400' : 'text-white/40 group-hover:text-white/70'
                        )}
                      />
                      <span className="flex-1 truncate tracking-tight">{item.label}</span>

                      {item.badge === 'Live' && (
                        <div className="flex items-center gap-1 bg-emerald-500/15 text-emerald-300 text-[10px] px-1.5 py-0.5 rounded-full border border-emerald-500/30 font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          Live
                        </div>
                      )}
                      {item.badge && item.badge !== 'Live' && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/[0.06] text-white/50 border border-white/[0.06] font-medium">
                          {item.badge}
                        </span>
                      )}
                      {active && <ChevronRight size={13} className="text-emerald-400/60" />}
                    </div>
                  </Link>
                )
              })}
            </div>
          ))}
        </nav>

        {/* Usage Hardware Meter */}
        <div className="p-3 mx-3 mb-2 rounded-2xl bg-white/[0.02] border border-white/[0.06] shadow-inner">
          <div className="flex items-center justify-between text-[11px] text-white/50 mb-1.5 font-medium">
            <span>Uso da cota</span>
            <span className="text-white/80 font-semibold">{user.tenant.apiUsage} / {user.tenant.maxMessages}</span>
          </div>
          <div className="h-1.5 bg-black/40 rounded-full overflow-hidden p-0.2 border border-white/[0.05]">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
              style={{ width: `${Math.min((user.tenant.apiUsage / user.tenant.maxMessages) * 100, 100)}%` }}
            />
          </div>
          {user.tenant.plan === 'FREE' && (
            <Link
              href="/pricing"
              className="mt-2.5 flex items-center justify-center gap-1.5 text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 py-1.5 px-3 rounded-lg border border-emerald-500/20 transition-all"
            >
              <Zap size={12} /> Upgrade para Pro
            </Link>
          )}
        </div>

        {/* User Pill / Logout */}
        <div className="p-3 border-t border-white/[0.06] bg-[#050507]/40">
          <div className="flex items-center gap-2.5 px-1 py-1">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center text-xs font-bold flex-shrink-0 shadow-sm">
              {user.name[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-white/90 truncate">{user.name}</div>
              <div className="text-[10px] text-white/40 truncate">{user.email}</div>
            </div>
            <button
              onClick={logout}
              className="p-1.5 rounded-lg hover:bg-white/[0.08] text-white/40 hover:text-rose-400 transition-all"
              title="Sair do sistema"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* ─── Main Content Canvas ─────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto relative z-10">
        {children}
      </main>
    </div>
  )
}
