'use client'

import { useEffect, useState } from 'react'
import {
  Kanban,
  Search,
  Plus,
  Phone,
  MessageSquare,
  DollarSign,
  Clock,
  ExternalLink,
  ChevronRight,
  Filter,
  CheckCircle2,
  Sparkles
} from 'lucide-react'
import { pipelineApi, conversationsApi } from '@/lib/api'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { clsx } from 'clsx'
import toast from 'react-hot-toast'

interface PipelineStage {
  id: string
  name: string
  color: string
  order: number
  conversations: any[]
}

export default function PipelinePage() {
  const router = useRouter()
  const [board, setBoard] = useState<PipelineStage[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [movingId, setMovingId] = useState<string | null>(null)

  useEffect(() => {
    loadBoard()
  }, [])

  const loadBoard = async () => {
    try {
      const { data } = await pipelineApi.getBoard()
      setBoard(data || [])
    } catch {
      toast.error('Erro ao carregar funil de vendas')
    } finally {
      setLoading(false)
    }
  }

  const moveConversation = async (conversationId: string, targetStageId: string) => {
    setMovingId(conversationId)
    try {
      await conversationsApi.updateStage(conversationId, targetStageId)
      toast.success('Lead movido com sucesso!')
      loadBoard()
    } catch {
      toast.error('Erro ao mover lead')
    } finally {
      setMovingId(null)
    }
  }

  const filteredBoard = board.map(stage => ({
    ...stage,
    conversations: (stage.conversations || []).filter(conv => {
      if (!search.trim()) return true
      const q = search.toLowerCase()
      return (
        conv.contactPhone?.toLowerCase().includes(q) ||
        conv.contactName?.toLowerCase().includes(q) ||
        conv.messages?.[0]?.content?.toLowerCase().includes(q)
      )
    })
  }))

  const totalLeads = board.reduce((acc, s) => acc + (s.conversations?.length || 0), 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-surface-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-white/40 text-xs">Carregando funil CRM...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-surface-950 text-white animate-fade-in select-none">
      {/* ─── Header do Funil ─────────────────────────────────────────────────── */}
      <div className="px-8 py-5 border-b border-white/[0.08] flex items-center justify-between bg-surface-900/40 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center shadow-glow-sm">
              <Kanban size={18} />
            </div>
            <h1 className="text-xl font-bold">Funil de Vendas & CRM</h1>
            <span className="text-xs bg-white/[0.06] text-white/60 px-2.5 py-0.5 rounded-full font-medium">
              {totalLeads} leads no funil
            </span>
          </div>
          <p className="text-xs text-white/40 mt-1">
            Acompanhe o ciclo de fechamento dos leads atendidos por IA e humanos
          </p>
        </div>

        {/* Barra de Busca e Filtros */}
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search size={14} className="absolute left-3 top-3 text-white/40" />
            <input
              className="input text-xs pl-9 py-2 bg-surface-800/80 border-white/[0.08]"
              placeholder="Buscar por nome, telefone ou mensagem..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <button
            onClick={loadBoard}
            className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5"
          >
            Atualizar
          </button>
        </div>
      </div>

      {/* ─── Colunas Kanban ──────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-x-auto p-8 scrollbar-thin">
        <div className="flex gap-5 h-full min-w-max items-start">
          {filteredBoard.map(stage => {
            return (
              <div
                key={stage.id}
                className="w-80 flex flex-col max-h-full bg-surface-900/60 rounded-2xl border border-white/[0.06] shadow-xl overflow-hidden backdrop-blur-md"
              >
                {/* Header da Coluna */}
                <div
                  className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between"
                  style={{ borderTop: `3px solid ${stage.color}` }}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: stage.color }}
                    />
                    <h3 className="font-semibold text-xs tracking-wide uppercase">
                      {stage.name}
                    </h3>
                  </div>
                  <span
                    className="text-xs font-mono font-bold px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: `${stage.color}25`,
                      color: stage.color
                    }}
                  >
                    {stage.conversations.length}
                  </span>
                </div>

                {/* Cards de Leads */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-thin">
                  {stage.conversations.length === 0 ? (
                    <div className="py-12 text-center text-white/20 text-xs border border-dashed border-white/[0.05] rounded-xl">
                      Nenhum lead nesta etapa
                    </div>
                  ) : (
                    stage.conversations.map(conv => {
                      const lastMsg = conv.messages?.[0]?.content
                      return (
                        <div
                          key={conv.id}
                          className={clsx(
                            'card p-4 hover:border-brand-500/40 transition-all duration-200 shadow-md group relative bg-surface-800/80',
                            movingId === conv.id && 'opacity-50 pointer-events-none'
                          )}
                        >
                          {/* Contato Info */}
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-semibold text-sm text-white group-hover:text-brand-300 transition-colors">
                                {conv.contactName || conv.contactPhone}
                              </h4>
                              <p className="text-xs text-white/40 flex items-center gap-1 mt-0.5 font-mono">
                                <Phone size={10} />
                                {conv.contactPhone}
                              </p>
                            </div>

                            <button
                              onClick={() => router.push('/inbox')}
                              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/10 rounded text-white/60 hover:text-white"
                              title="Abrir no Inbox"
                            >
                              <ExternalLink size={13} />
                            </button>
                          </div>

                          {/* Última mensagem */}
                          <p className="text-xs text-white/50 line-clamp-2 mt-2 leading-relaxed bg-surface-900/60 p-2 rounded-lg border border-white/[0.03]">
                            {lastMsg || 'Sem mensagens recentes'}
                          </p>

                          {/* Tags */}
                          {conv.tags && conv.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2.5">
                              {conv.tags.map((t: any) => (
                                <span
                                  key={t.tagId}
                                  className="text-[9px] px-1.5 py-0.5 rounded-full font-medium"
                                  style={{
                                    backgroundColor: `${t.tag.color}25`,
                                    color: t.tag.color
                                  }}
                                >
                                  {t.tag.name}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Footer do Card com Timestamp e Menu de Mudança Rápida */}
                          <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-white/[0.06] text-[11px] text-white/30">
                            <span className="flex items-center gap-1">
                              <Clock size={11} />
                              {format(new Date(conv.updatedAt), 'dd/MM HH:mm', { locale: ptBR })}
                            </span>

                            {/* Menu de Mover Rápido para Próxima Coluna */}
                            <select
                              value={stage.id}
                              onChange={e => moveConversation(conv.id, e.target.value)}
                              className="bg-surface-700 text-white/60 hover:text-white text-[10px] px-1.5 py-0.5 rounded border border-white/[0.08] outline-none cursor-pointer"
                            >
                              {board.map(s => (
                                <option key={s.id} value={s.id}>
                                  Mover: {s.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
