'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, MessageSquare, Smartphone, Brain,
  BookOpen, Inbox, BarChart3, Settings, LogOut,
  MessageCircle, ChevronRight, Zap, Kanban, Sparkles,
  Wrench, ShoppingBag, RefreshCw
} from 'lucide-react'
import { useAuthStore } from '@/lib/store'
import { clsx } from 'clsx'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Visão Geral' },
  { href: '/repairs', icon: Wrench, label: 'Ordens de Serviço', badge: 'os' },
  { href: '/catalog', icon: ShoppingBag, label: 'Celulares & Vendas' },
  { href: '/inbox', icon: Inbox, label: 'Inbox Atendimento', badge: 'live' },
  { href: '/pipeline', icon: Kanban, label: 'Funil CRM' },
  { href: '/conversations', icon: MessageSquare, label: 'Histórico' },
  { href: '/knowledge', icon: BookOpen, label: 'Base de Conhecimento' },
  { href: '/ai-config', icon: Brain, label: 'Config da IA' },
  { href: '/analytics', icon: BarChart3, label: 'Analytics' },
  { href: '/whatsapp', icon: Smartphone, label: 'WhatsApp' },
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
    <div className="flex h-screen bg-surface-950 overflow-hidden">
      {/* ─── Sidebar ──────────────────────────────────────────────────── */}
      <aside className="w-60 flex-shrink-0 flex flex-col border-r border-white/[0.06] bg-surface-900">
        {/* Logo */}
        <div className="p-5 border-b border-white/[0.06]">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center shadow-glow-sm">
              <MessageCircle size={16} className="text-white" />
            </div>
            <span className="font-bold text-base tracking-tight">Zap<span className="gradient-text">IA</span></span>
          </Link>
        </div>

        {/* Tenant info */}
        <div className="px-4 py-3 border-b border-white/[0.06]">
          <div className="text-xs text-white/30 mb-0.5">Empresa</div>
          <div className="text-sm font-medium text-white/80 truncate">{user.tenant.name}</div>
          <div className="mt-1.5">
            <span className={clsx('badge text-xs', {
              'badge-green': user.tenant.plan === 'PRO' || user.tenant.plan === 'ENTERPRISE',
              'badge-gray': user.tenant.plan === 'FREE',
            })}>
              {user.tenant.plan}
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto scrollbar-thin">
          {navItems.map((item) => {
            const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
            return (
              <Link key={item.href} href={item.href}>
                <div className={clsx('nav-item', { active })}>
                  <item.icon size={17} className="flex-shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  {item.badge === 'live' && (
                    <div className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />
                  )}
                  {item.badge === 'novo' && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 font-bold uppercase tracking-wider">
                      Novo
                    </span>
                  )}
                  {active && <ChevronRight size={14} className="opacity-50" />}
                </div>
              </Link>
            )
          })}
        </nav>

        {/* Usage bar */}
        <div className="px-4 py-3 border-t border-white/[0.06]">
          <div className="flex justify-between text-xs text-white/30 mb-1.5">
            <span>{user.tenant.plan === 'FREE' ? 'Mensagens (Teste)' : 'Uso mensal'}</span>
            <span>{user.tenant.apiUsage}/{user.tenant.maxMessages}</span>
          </div>
          <div className="h-1.5 bg-surface-600 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-brand rounded-full transition-all"
              style={{ width: `${Math.min((user.tenant.apiUsage / user.tenant.maxMessages) * 100, 100)}%` }}
            />
          </div>
          {user.tenant.plan === 'FREE' && (
            <Link href="/pricing" className="mt-2 flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300 transition-colors">
              <Zap size={11} /> Upgrade para Pro
            </Link>
          )}
        </div>

        {/* User / Logout */}
        <div className="p-3 border-t border-white/[0.06]">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-8 h-8 rounded-full bg-gradient-brand flex items-center justify-center text-xs font-bold flex-shrink-0">
              {user.name[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white/80 truncate">{user.name}</div>
              <div className="text-xs text-white/30 truncate">{user.email}</div>
            </div>
            <button
              onClick={logout}
              className="p-1.5 rounded-lg hover:bg-surface-700 text-white/30 hover:text-red-400 transition-all"
              title="Sair"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* ─── Main Content ─────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
