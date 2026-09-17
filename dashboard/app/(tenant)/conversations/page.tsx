'use client'

import { useEffect, useState } from 'react'
import { MessageSquare, Search, User, Bot, Clock, CheckCircle2, AlertCircle } from 'lucide-react'
import { conversationsApi } from '@/lib/api'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { clsx } from 'clsx'

interface Conversation {
  id: string
  contactPhone: string
  contactName: string | null
  status: string
  csatScore: number | null
  createdAt: string
  updatedAt: string
  messages: Array<{ id: string; role: string; content: string; createdAt: string }>
}

export default function ConversationsHistoryPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selected, setSelected] = useState<Conversation | null>(null)

  useEffect(() => {
    loadConversations()
  }, [search, statusFilter])

  const loadConversations = async () => {
    setLoading(true)
    try {
      const { data } = await conversationsApi.list({
        search: search || undefined,
        status: statusFilter || undefined,
      })
      setConversations(data.conversations)
      setTotal(data.total)
    } catch {
    } finally {
      setLoading(false)
    }
  }

  const selectConversation = async (conv: Conversation) => {
    try {
      const { data } = await conversationsApi.getById(conv.id)
      setSelected(data)
    } catch {}
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'AI_ACTIVE':
        return <span className="badge badge-green">IA Ativa</span>
      case 'HUMAN_ACTIVE':
        return <span className="badge badge-red">Humano</span>
      case 'RESOLVED':
        return <span className="badge badge-blue">Resolvido</span>
      default:
        return <span className="badge badge-gray">{status}</span>
    }
  }

  return (
    <div className="flex h-full animate-fade-in">
      {/* ─── List ─────────────────────────────────────────────────── */}
      <div className="w-80 flex-shrink-0 border-r border-white/[0.06] flex flex-col">
        <div className="p-4 border-b border-white/[0.06] space-y-3">
          <div className="flex items-center justify-between">
            <h1 className="font-bold text-lg">Histórico</h1>
            <span className="text-xs text-white/40">{total} conversas</span>
          </div>

          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              className="input pl-9 py-2 text-xs"
              placeholder="Buscar por nome ou telefone..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="flex gap-1.5 overflow-x-auto scrollbar-thin">
            {[
              { label: 'Todas', value: '' },
              { label: 'IA', value: 'AI_ACTIVE' },
              { label: 'Humano', value: 'HUMAN_ACTIVE' },
              { label: 'Resolvidas', value: 'RESOLVED' },
            ].map(f => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={clsx('px-2.5 py-1 rounded-lg text-xs font-medium transition-all whitespace-nowrap', {
                  'bg-brand-500 text-white': statusFilter === f.value,
                  'bg-surface-700 text-white/40 hover:text-white/70': statusFilter !== f.value,
                })}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {loading ? (
            <div className="p-8 text-center">
              <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-8 text-center text-white/30 text-sm">
              Nenhuma conversa encontrada
            </div>
          ) : (
            conversations.map(conv => (
              <button
                key={conv.id}
                onClick={() => selectConversation(conv)}
                className={clsx('w-full text-left px-4 py-3.5 border-b border-white/[0.04] hover:bg-surface-800 transition-colors', {
                  'bg-surface-800 border-l-2 border-l-brand-500': selected?.id === conv.id,
                })}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="font-medium text-sm truncate">
                    {conv.contactName || conv.contactPhone}
                  </div>
                  {getStatusBadge(conv.status)}
                </div>
                <div className="text-xs text-white/30 truncate mt-1">
                  {conv.messages?.[0]?.content || 'Sem mensagens'}
                </div>
                <div className="flex items-center justify-between text-xs text-white/20 mt-2">
                  <span>{conv.contactPhone}</span>
                  <span>{format(new Date(conv.updatedAt), 'dd/MM HH:mm')}</span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* ─── Details ──────────────────────────────────────────────── */}
      {selected ? (
        <div className="flex-1 flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
            <div>
              <div className="font-semibold text-base">{selected.contactName || selected.contactPhone}</div>
              <div className="text-xs text-white/30 flex items-center gap-2 mt-0.5">
                <span>{selected.contactPhone}</span>
                <span>•</span>
                <span>Iniciada em {format(new Date(selected.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>
              </div>
            </div>
            <div>{getStatusBadge(selected.status)}</div>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-thin px-6 py-5 space-y-4">
            {selected.messages?.map(msg => (
              <div
                key={msg.id}
                className={clsx('flex gap-3', {
                  'justify-end': msg.role === 'ASSISTANT',
                  'justify-start': msg.role === 'USER',
                })}
              >
                {msg.role === 'USER' && (
                  <div className="w-7 h-7 rounded-full bg-surface-600 flex items-center justify-center flex-shrink-0 mt-1">
                    <User size={13} className="text-white/50" />
                  </div>
                )}
                <div className={msg.role === 'USER' ? 'msg-user' : 'msg-bot'}>
                  <p className="leading-relaxed">{msg.content}</p>
                  <div className="text-xs opacity-40 mt-1.5 text-right">
                    {format(new Date(msg.createdAt), 'HH:mm')}
                  </div>
                </div>
                {msg.role === 'ASSISTANT' && (
                  <div className="w-7 h-7 rounded-full bg-brand-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot size={13} className="text-brand-400" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-surface-700 flex items-center justify-center mx-auto mb-4">
              <MessageSquare size={28} className="text-white/20" />
            </div>
            <h3 className="font-semibold text-white/60">Selecione uma conversa</h3>
            <p className="text-sm text-white/30 mt-1">Veja todo o histórico e mensagens trocadas</p>
          </div>
        </div>
      )}
    </div>
  )
}
