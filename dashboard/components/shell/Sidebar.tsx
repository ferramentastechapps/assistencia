'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronDown, ChevronRight, Settings } from 'lucide-react'
import { clsx } from 'clsx'
import { navigationGroups, type NavDestination } from '@/lib/navigation/registry'
import { useAuthStore } from '@/lib/store'

const CHAVE_GRUPOS_FECHADOS = 'zapia-sidebar-grupos-fechados'
const GRUPO_CONFIGURACOES_ID = 'configuracoes'

function NavItem({
  dest,
  collapsed,
  onNavigate,
}: {
  dest: NavDestination
  collapsed: boolean
  onNavigate?: () => void
}) {
  const pathname = usePathname()
  const active =
    pathname === dest.href ||
    (dest.href !== '/dashboard' && pathname.startsWith(dest.href))

  return (
    <Link
      href={dest.href}
      onClick={onNavigate}
      title={collapsed ? dest.label : undefined}
      className={clsx(
        'group flex items-center gap-2.5 px-3 py-2 rounded-full text-xs font-bold transition-all duration-200 relative',
        collapsed ? 'justify-center w-10 h-10 mx-auto' : 'w-full',
        active
          ? 'bg-[#232528]/85 text-white shadow-[0_4px_16px_rgba(20,22,25,0.22),inset_0_1px_0_rgba(255,255,255,0.18)] border border-white/10 backdrop-blur-md'
          : 'text-[#524D41] hover:bg-white/60 hover:text-[#1C1D21]'
      )}
    >
      <dest.icon
        size={14}
        className={clsx(
          'flex-shrink-0 transition-transform duration-200 group-hover:scale-110',
          active ? 'text-[#F5C518]' : 'text-[#787C87] group-hover:text-[#1C1D21]'
        )}
      />

      {!collapsed && (
        <>
          <span className="flex-1 truncate tracking-tight">{dest.label}</span>

          {dest.live && (
            <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F5C518] text-[#18191B]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#18191B] animate-pulse" />
              Live
            </span>
          )}

          {dest.badge && (
            <span
              className={clsx(
                'text-[10px] px-1.5 rounded-full font-bold',
                active
                  ? 'bg-white/20 text-[#F5C518]'
                  : 'bg-[#DAD6C9] text-[#343128]'
              )}
            >
              {dest.badge}
            </span>
          )}
        </>
      )}
    </Link>
  )
}

interface SidebarProps {
  collapsed: boolean
  onToggleCollapse: () => void
  onNavigate?: () => void
}

export function Sidebar({ collapsed, onToggleCollapse, onNavigate }: SidebarProps) {
  const { user } = useAuthStore()
  const activeUser = user || { name: 'ZapIA', tenant: { name: 'Assistência Técnica', plan: 'PRO' } }

  const groups = navigationGroups()
  const mainGroups = groups.filter(g => g.id !== GRUPO_CONFIGURACOES_ID)
  const configGroup = groups.find(g => g.id === GRUPO_CONFIGURACOES_ID)

  const [gruposFechados, setGruposFechados] = useState<Set<string>>(() => new Set())

  useEffect(() => {
    try {
      const salvo = window.localStorage.getItem(CHAVE_GRUPOS_FECHADOS)
      if (salvo) setGruposFechados(new Set(JSON.parse(salvo) as string[]))
    } catch {
      // localStorage bloqueado — fica tudo aberto
    }
  }, [])

  function toggleGrupo(id: string) {
    setGruposFechados(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      try {
        window.localStorage.setItem(CHAVE_GRUPOS_FECHADOS, JSON.stringify(Array.from(next)))
      } catch { /* sem persistência nesta sessão */ }
      return next
    })
  }

  return (
    <aside
      className={clsx(
        'flex flex-col h-full bg-[#E6E3D8] border-r border-[#CAC5B7]/70 transition-all duration-300',
        collapsed ? 'w-[64px]' : 'w-[220px]'
      )}
    >
      {/* Logo / Marca */}
      <div
        className={clsx(
          'flex h-14 items-center border-b border-[#CAC5B7]/70 px-3 flex-shrink-0',
          collapsed ? 'justify-center' : 'justify-between'
        )}
      >
        {!collapsed && (
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-xl bg-[#232528] text-[#F5C518] flex items-center justify-center font-black text-xs flex-shrink-0">
              ⚡
            </div>
            <div className="min-w-0">
              <div className="text-xs font-black text-[#1C1D21] truncate">{activeUser.tenant?.name ?? 'ZapIA'}</div>
              <div className="text-[10px] text-[#797D8A] font-semibold">Assistência Técnica</div>
            </div>
          </div>
        )}

        {collapsed && (
          <div className="w-8 h-8 rounded-xl bg-[#232528] text-[#F5C518] flex items-center justify-center font-black text-sm">
            ⚡
          </div>
        )}

        {!collapsed && (
          <button
            onClick={onToggleCollapse}
            className="w-7 h-7 rounded-full bg-white hover:bg-[#FAF9F6] border border-black/[0.04] shadow-sm flex items-center justify-center text-[#555962] hover:text-[#1C1D21] transition-all flex-shrink-0"
            title="Recolher menu"
          >
            <ChevronRight size={12} />
          </button>
        )}
      </div>

      {/* Nav Groups */}
      <div className="flex-1 overflow-y-auto scrollbar-thin py-3 px-2 space-y-1">
        {collapsed ? (
          // modo colapsado: sem grupos, só ícones
          <>
            {groups.flatMap(g => g.destinations).map(dest => (
              <NavItem key={dest.href} dest={dest} collapsed onNavigate={onNavigate} />
            ))}
            <button
              onClick={onToggleCollapse}
              className="w-10 h-10 mx-auto flex items-center justify-center rounded-full text-[#797D8A] hover:bg-white/60 hover:text-[#1C1D21] transition-all mt-2"
              title="Expandir menu"
            >
              <ChevronRight size={14} className="rotate-180" />
            </button>
          </>
        ) : (
          mainGroups.map(group => {
            const fechado = gruposFechados.has(group.id)
            return (
              <div key={group.id}>
                <button
                  onClick={() => toggleGrupo(group.id)}
                  className="w-full flex items-center justify-between px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-widest text-[#797D8A] hover:text-[#1C1D21] transition-colors"
                >
                  <span>{group.label}</span>
                  {fechado
                    ? <ChevronRight size={10} />
                    : <ChevronDown size={10} />
                  }
                </button>

                {!fechado && (
                  <div className="space-y-0.5 mt-0.5">
                    {group.destinations.map(dest => (
                      <NavItem key={dest.href} dest={dest} collapsed={false} onNavigate={onNavigate} />
                    ))}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Rodapé: Configurações */}
      {configGroup && !collapsed && (
        <div className="border-t border-[#CAC5B7]/70 px-2 py-3 flex-shrink-0">
          {configGroup.destinations.map(dest => (
            <NavItem key={dest.href} dest={dest} collapsed={false} onNavigate={onNavigate} />
          ))}
        </div>
      )}

      {/* Avatar do usuário (collapsed) */}
      {collapsed && (
        <div className="border-t border-[#CAC5B7]/70 p-2 flex-shrink-0 flex justify-center">
          <div
            className="w-8 h-8 rounded-full bg-[#232528] text-[#F5C518] flex items-center justify-center text-[10px] font-black"
            title={activeUser.name ?? 'Usuário'}
          >
            {(activeUser.name ?? 'Z')[0].toUpperCase()}
          </div>
        </div>
      )}
    </aside>
  )
}
