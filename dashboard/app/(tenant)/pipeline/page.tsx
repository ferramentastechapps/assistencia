'use client'

import { useEffect, useState } from 'react'
import {
  Kanban, Search, Phone, Clock, ExternalLink,
  Plus, Sparkles, RefreshCw, ChevronRight
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

  useEffect(() => { loadBoard() }, [])

  const loadBoard = async () => {
    setLoading(true)
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
      toast.success('Lead movido!')
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
      <div className="flex items-center justify-center h-full bg-[#DCD8CD]">
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-2 border-black/10 border-t-[#232528] animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-3.5 h-3.5 rounded-full bg-[#F5C518]" />
            </div>
          </div>
          <p className="text-xs text-[#797D8A] font-semibold">Carregando funil CRM...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-[#DCD8CD] text-[#1C1D21] animate-fade-in select-none">

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="px-6 py-4 border-b border-[#CAC5B7]/70 flex items-center justify-between gap-4 bg-[#DCD8CD]/95 backdrop-blur-md flex-shrink-0">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#232528]/85 text-[#F5C518] flex items-center justify-center shadow-tactile-dark border border-white/10 backdrop-blur-sm">
              <Kanban size={16} />
            </div>
            <h1 className="text-lg font-black tracking-tight text-[#1C1D21]">Funil CRM</h1>
            <span className="text-xs bg-white text-[#1C1D21] px-2.5 py-0.5 rounded-full font-bold border border-black/[0.04] shadow-sm">
              {totalLeads} leads
            </span>
          </div>
          <p className="text-xs text-[#797D8A] mt-0.5 font-medium">
            Ciclo de fechamento dos clientes atendidos
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative w-56">
            <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#797D8A]" />
            <input
              className="w-full bg-white border border-black/[0.05] rounded-full pl-9 pr-4 py-2 text-xs text-[#1C1D21] placeholder-[#797D8A] focus:outline-none focus:border-[#232528] shadow-sm transition-all"
              placeholder="Buscar por nome, telefone..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button
            onClick={loadBoard}
            className="w-9 h-9 bg-white hover:bg-[#FAF9F6] text-[#555962] hover:text-[#18191B] rounded-full flex items-center justify-center transition-all border border-black/[0.04] shadow-sm"
            title="Recarregar"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* ── Kanban Board ─────────────────────────────────────────────── */}
      <div className="flex-1 overflow-x-auto p-6 scrollbar-thin">
        {filteredBoard.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="card !p-10 text-center max-w-sm rounded-[32px]">
              <div className="w-14 h-14 rounded-2xl bg-[#DAD6C9] flex items-center justify-center mx-auto mb-4 text-[#797D8A]">
                <Kanban size={24} />
              </div>
              <h3 className="font-extrabold text-[#1C1D21] mb-1">Funil vazio</h3>
              <p className="text-xs text-[#797D8A] font-medium">
                Configure estágios do funil e mova conversas para acompanhar os negócios.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex gap-4 h-full min-w-max items-start pb-4">
            {filteredBoard.map(stage => (
              <div
                key={stage.id}
                className="w-72 flex flex-col max-h-[calc(100vh-180px)] rounded-[24px] overflow-hidden"
                style={{ boxShadow: '0 8px 24px -6px rgba(27,28,30,0.06), 0 2px 6px -2px rgba(27,28,30,0.03)' }}
              >
                {/* Column header */}
                <div
                  className="px-4 py-3 bg-[#E6E3D8] border-b border-[#CAC5B7]/70 flex items-center justify-between flex-shrink-0"
                  style={{ borderTop: `3px solid ${stage.color}` }}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: stage.color }} />
                    <h3 className="font-extrabold text-xs tracking-wide uppercase text-[#1C1D21]">{stage.name}</h3>
                  </div>
                  <span
                    className="text-xs font-black px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: `${stage.color}20`, color: stage.color }}
                  >
                    {stage.conversations.length}
                  </span>
                </div>

                {/* Cards */}
                <div className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-3 bg-[#DAD6C9]/60">
                  {stage.conversations.length === 0 ? (
                    <div className="py-12 text-center text-[#CAC5B7] text-xs border border-dashed border-[#CAC5B7] rounded-2xl font-semibold">
                      Nenhum lead aqui
                    </div>
                  ) : (
                    stage.conversations.map(conv => {
                      const lastMsg = conv.messages?.[0]?.content
                      return (
                        <div
                          key={conv.id}
                          className={clsx(
                            'card !p-4 group relative transition-all duration-200 hover:shadow-tactile-card',
                            movingId === conv.id && 'opacity-50 pointer-events-none'
                          )}
                        >
                          {/* Lead header */}
                          <div className="flex items-start justify-between mb-2.5">
                            <div className="flex items-start gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-[#18191B] text-[#F5C518] flex items-center justify-center text-xs font-black flex-shrink-0 shadow-sm">
                                {(conv.contactName || conv.contactPhone)[0].toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <h4 className="font-extrabold text-xs text-[#1C1D21] truncate max-w-[130px] group-hover:text-[#232528]">
                                  {conv.contactName || conv.contactPhone}
                                </h4>
                                <p className="text-[10px] text-[#797D8A] font-semibold flex items-center gap-1 mt-0.5">
                                  <Phone size={9} /> {conv.contactPhone}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => router.push('/inbox')}
                              className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-[#DAD6C9] rounded-full text-[#797D8A] hover:text-[#1C1D21]"
                              title="Abrir no Inbox"
                            >
                              <ExternalLink size={12} />
                            </button>
                          </div>

                          {/* Last message preview */}
                          {lastMsg && (
                            <p className="text-[11px] text-[#524D41] line-clamp-2 leading-relaxed bg-[#DAD6C9]/60 px-3 py-2 rounded-xl border border-black/[0.03] mb-2.5 font-medium">
                              {lastMsg}
                            </p>
                          )}

                          {/* Tags */}
                          {conv.tags && conv.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2.5">
                              {conv.tags.map((t: any) => (
                                <span
                                  key={t.tagId}
                                  className="text-[9px] px-2 py-0.5 rounded-full font-semibold"
                                  style={{ backgroundColor: `${t.tag.color}20`, color: t.tag.color }}
                                >
                                  {t.tag.name}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Footer */}
                          <div className="flex items-center justify-between pt-2 border-t border-[#CAC5B7]/60 text-[10px] text-[#797D8A]">
                            <span className="flex items-center gap-1 font-semibold">
                              <Clock size={10} />
                              {format(new Date(conv.updatedAt), 'dd/MM HH:mm', { locale: ptBR })}
                            </span>

                            <select
                              value={stage.id}
                              onChange={e => moveConversation(conv.id, e.target.value)}
                              className="bg-white text-[#18191B] text-[10px] px-2 py-0.5 rounded-full border border-black/[0.06] outline-none cursor-pointer font-bold shadow-sm hover:border-[#232528] transition-colors"
                            >
                              {board.map(s => (
                                <option key={s.id} value={s.id}>→ {s.name}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
