'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, MessageSquare, Smartphone, Brain,
  BookOpen, Inbox, BarChart3, LogOut,
  Zap, Kanban, Wrench, ShoppingBag, X
} from 'lucide-react'
import { useAuthStore } from '@/lib/store'
import { clsx } from 'clsx'

interface NavItem {
  href: string
  label: string
  icon: React.ComponentType<{ size?: number | string; className?: string }>
  count?: string
  live?: boolean
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Visão Geral', icon: LayoutDashboard },
  { href: '/repairs', label: 'Ordens de Serviço', icon: Wrench, count: '14' },
  { href: '/inbox', label: 'WhatsApp Live', icon: Inbox, live: true },
  { href: '/catalog', label: 'Trade-In & Peças', icon: ShoppingBag, count: '6' },
  { href: '/ai-config', label: 'Cérebro IA', icon: Brain },
  { href: '/analytics', label: 'Telemetria', icon: BarChart3 },
  { href: '/whatsapp', label: 'Conexão QR', icon: Smartphone },
  { href: '/knowledge', label: 'Base de Conhecimento', icon: BookOpen },
  { href: '/pipeline', label: 'Funil CRM', icon: Kanban },
  { href: '/conversations', label: 'Histórico', icon: MessageSquare },
]

const routeMeta: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': { title: 'Bancada Inteligente', subtitle: 'Cockpit & Telemetria' },
  '/repairs': { title: 'Ordens de Serviço', subtitle: 'Gestão da Bancada' },
  '/inbox': { title: 'WhatsApp Live', subtitle: 'Atendimento Humano' },
  '/catalog': { title: 'Trade-In & Peças', subtitle: 'Catálogo e Aparelhos' },
  '/whatsapp': { title: 'Conexão WhatsApp', subtitle: 'Instância Evolution API' },
  '/ai-config': { title: 'Cérebro & IA', subtitle: 'Persona & Agente' },
  '/analytics': { title: 'Telemetria', subtitle: 'Métricas e Conversão' },
  '/knowledge': { title: 'Base de Conhecimento', subtitle: 'RAG & Documentos' },
  '/pipeline': { title: 'Funil CRM', subtitle: 'Pipeline de Vendas' },
  '/conversations': { title: 'Histórico', subtitle: 'Conversas WhatsApp' },
}

export default function TenantLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, isAuthenticated, logout } = useAuthStore()

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('zapia-auth')
      if (!stored && !isAuthenticated()) {
        router.push('/login')
      }
    }
  }, [])

  // Active user with safe fallback to prevent blank render during hydration
  const activeUser = user || {
    id: '1',
    name: 'Jota Shop',
    email: 'jotashopstore@gmail.com',
    role: 'ADMIN',
    tenant: {
      id: 't1',
      name: 'Jota Shop',
      plan: 'PRO',
      apiUsage: 540,
      maxMessages: 2000,
    }
  }

  // Current session title
  const currentMeta = routeMeta[pathname] || {
    title: 'Bancada Inteligente',
    subtitle: 'Assistência Técnica Especializada'
  }

  return (
    <div className="min-h-screen bg-[#DCD8CD] text-[#1C1D21] font-sans flex flex-col selection:bg-[#F5C518] selection:text-[#18191B]">
      {/* ─── Top Navigation Bar (Matching Medical Tablet Print 2.jpg) ─── */}
      <header className="sticky top-0 z-40 bg-[#DCD8CD]/95 backdrop-blur-md px-4 sm:px-6 lg:px-8 py-3.5 border-b border-[#CAC5B7]/60">
        <div className="max-w-[1500px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Left: Round White Button + Section Title */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <Link
              href="/dashboard"
              className="w-10 h-10 rounded-full bg-white shadow-tactile-pill border border-black/[0.04] flex items-center justify-center text-[#1C1D21] hover:bg-[#FAF9F6] active:scale-95 transition-all"
              title="Voltar para a Visão Geral"
            >
              <X size={15} className="font-extrabold stroke-[2.5]" />
            </Link>

            <div className="flex flex-col justify-center">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#1C1D21] leading-tight">
                {currentMeta.title}
              </h1>
              <div className="mt-0.5">
                <span className="inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#DAD6C9] text-[#524D41]">
                  {currentMeta.subtitle}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Horizontal Capsule Pills Navigation (Conforme clica vai abrindo a sessão) */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-thin py-1">
            {navItems.map((item) => {
              const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
              return (
                <Link key={item.href} href={item.href}>
                  <div
                    className={clsx(
                      'top-nav-pill group',
                      active ? 'top-nav-pill-active' : 'top-nav-pill-inactive'
                    )}
                  >
                    <item.icon
                      size={14}
                      className={clsx(
                        'transition-transform duration-200 group-hover:scale-110 flex-shrink-0',
                        active ? 'text-[#F5C518]' : 'text-[#787C87] group-hover:text-[#1C1D21]'
                      )}
                    />
                    <span className="tracking-tight">{item.label}</span>

                    {item.live && (
                      <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.2 rounded-full bg-[#F5C518] text-[#18191B] shadow-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#18191B] animate-pulse" />
                        Live
                      </span>
                    )}

                    {item.count && (
                      <span
                        className={clsx(
                          'text-[10px] px-1.5 py-0.2 rounded-full font-bold',
                          active ? 'bg-white/20 text-[#F5C518]' : 'bg-[#DAD6C9] text-[#343128]'
                        )}
                      >
                        {item.count}
                      </span>
                    )}
                  </div>
                </Link>
              )
            })}

            {/* Separator */}
            <div className="h-6 w-px bg-[#CAC5B7] mx-1 flex-shrink-0" />

            {/* Profile & Store White Capsule Pill */}
            <div className="flex items-center gap-2 bg-white rounded-full px-3 py-1.5 shadow-tactile-pill border border-black/[0.04] flex-shrink-0">
              <div className="w-6 h-6 rounded-full bg-[#232528] text-[#F5C518] flex items-center justify-center text-[10px] font-black">
                {activeUser.name ? activeUser.name[0].toUpperCase() : 'Z'}
              </div>
              <div className="text-left hidden lg:block">
                <div className="text-xs font-bold text-[#1C1D21] leading-tight truncate max-w-[110px]">
                  {activeUser.tenant.name}
                </div>
                <div className="text-[10px] text-[#797D8A] leading-tight">
                  {activeUser.tenant.apiUsage}/{activeUser.tenant.maxMessages} msgs
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
          </div>
        </div>
      </header>

      {/* ─── Main Content Canvas ─── */}
      <main className="flex-1 w-full overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
