'use client'

import { useEffect, useState, useRef } from 'react'
import {
  Send,
  Bot,
  User,
  ArrowLeftRight,
  CheckCircle2,
  Users,
  Mic,
  Lock,
  MessageSquare,
  Tag as TagIcon,
  Plus,
  X,
  AlertTriangle,
  Zap,
  Filter,
  Kanban
} from 'lucide-react'
import { conversationsApi, tagsApi, quickRepliesApi, pipelineApi } from '@/lib/api'
import { io } from 'socket.io-client'
import { useAuthStore } from '@/lib/store'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { clsx } from 'clsx'
import toast from 'react-hot-toast'

interface TagItem {
  id: string
  name: string
  color: string
}

interface ConversationTag {
  tagId: string
  tag: TagItem
}

interface PipelineStage {
  id: string
  name: string
  color: string
}

interface QuickReply {
  id: string
  shortcut: string
  title: string
  content: string
}

interface MessageItem {
  id: string
  role: 'USER' | 'ASSISTANT' | 'SYSTEM' | 'INTERNAL_NOTE'
  content: string
  mediaType?: string | null
  createdAt: string
}

interface Conversation {
  id: string
  contactPhone: string
  contactName: string | null
  status: string
  updatedAt: string
  stageId?: string | null
  stage?: PipelineStage | null
  tags?: ConversationTag[]
  messages: MessageItem[]
}

export default function InboxPage() {
  const { token, user } = useAuthStore()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selected, setSelected] = useState<Conversation | null>(null)
  const [message, setMessage] = useState('')
  const [isInternalNote, setIsInternalNote] = useState(false)
  const [sending, setSending] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>('ALL')

  // Super Inbox Recursos
  const [allTags, setAllTags] = useState<TagItem[]>([])
  const [stages, setStages] = useState<PipelineStage[]>([])
  const [quickReplies, setQuickReplies] = useState<QuickReply[]>([])
  const [showQuickPopover, setShowQuickPopover] = useState(false)
  const [quickSearch, setQuickSearch] = useState('')
  const [showTagPicker, setShowTagPicker] = useState(false)
  const [newTagName, setNewTagName] = useState('')
  const [otherViewer, setOtherViewer] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const socketRef = useRef<any>(null)

  useEffect(() => {
    loadConversations()
    loadAuxData()

    const socketUrl = typeof window !== 'undefined' ? (process.env.NEXT_PUBLIC_API_URL || window.location.origin) : ''
    const socket = io(socketUrl, {
      path: '/socket.io',
      auth: { token }
    })
    socketRef.current = socket

    socket.on('message:received', ({ conversationId, message: msg }: any) => {
      setConversations(prev => {
        const idx = prev.findIndex(c => c.id === conversationId)
        if (idx === -1) {
          loadConversations()
          return prev
        }
        const updated = [...prev]
        updated[idx] = {
          ...updated[idx],
          messages: [...(updated[idx].messages || []), msg],
          updatedAt: new Date().toISOString()
        }
        return updated
      })

      setSelected(prev => {
        if (!prev || prev.id !== conversationId) return prev
        return { ...prev, messages: [...prev.messages, msg] }
      })
    })

    socket.on('message:sent', ({ conversationId, message: msg }: any) => {
      setSelected(prev => {
        if (!prev || prev.id !== conversationId) return prev
        const exists = prev.messages.some(m => m.id === msg.id)
        if (exists) return prev
        return { ...prev, messages: [...prev.messages, msg] }
      })
    })

    socket.on('conversation:escalated', ({ contactPhone, contactName }: any) => {
      toast(`📞 Cliente aguardando atendimento: ${contactName || contactPhone}`, { icon: '🔔' })
      loadConversations()
    })

    // Detecção de colisão entre operadores
    socket.on('operator:presence', ({ conversationId, operatorName }: any) => {
      if (selected && selected.id === conversationId && operatorName !== user?.name) {
        setOtherViewer(operatorName)
      }
    })

    return () => {
      socket.disconnect()
    }
  }, [token, selected?.id, user?.name])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [selected?.messages])

  // Notificar visualização para detecção de colisão
  useEffect(() => {
    if (selected && socketRef.current) {
      socketRef.current.emit('operator:view', {
        conversationId: selected.id,
        operatorName: user?.name || user?.email || 'Outro atendente'
      })
      setOtherViewer(null)
    }
  }, [selected?.id, user])

  const loadAuxData = async () => {
    try {
      const [tRes, qRes, sRes] = await Promise.all([
        tagsApi.list().catch(() => ({ data: [] })),
        quickRepliesApi.list().catch(() => ({ data: [] })),
        pipelineApi.getStages().catch(() => ({ data: [] }))
      ])
      setAllTags(tRes.data || [])
      setQuickReplies(qRes.data || [])
      setStages(sRes.data || [])
    } catch {}
  }

  const loadConversations = async () => {
    try {
      const params: any = {}
      if (filterStatus !== 'ALL') params.status = filterStatus
      const { data } = await conversationsApi.list(params)
      setConversations(data.conversations || [])
    } catch {}
  }

  const selectConversation = async (conv: Conversation) => {
    try {
      const { data } = await conversationsApi.getById(conv.id)
      setSelected(data)
      setIsInternalNote(false)
      setShowTagPicker(false)
      setShowQuickPopover(false)
    } catch {}
  }

  // Enviar Mensagem ou Nota Interna
  const sendMessage = async () => {
    if (!message.trim() || !selected || sending) return
    setSending(true)
    try {
      const { data } = await conversationsApi.sendMessage(selected.id, message, isInternalNote)
      setSelected(prev => (prev ? { ...prev, messages: [...prev.messages, data] } : null))
      setMessage('')
      setShowQuickPopover(false)
      if (isInternalNote) {
        toast.success('Nota interna adicionada à conversa!')
      }
    } catch {
      toast.error('Erro ao enviar mensagem')
    } finally {
      setSending(false)
    }
  }

  // Respostas Rápidas ao digitar '/'
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setMessage(val)

    if (val.startsWith('/')) {
      setShowQuickPopover(true)
      setQuickSearch(val.slice(1).toLowerCase())
    } else {
      setShowQuickPopover(false)
    }
  }

  const selectQuickReply = (reply: QuickReply) => {
    setMessage(reply.content)
    setShowQuickPopover(false)
  }

  // Ações de Tags
  const toggleTag = async (tag: TagItem) => {
    if (!selected) return
    const hasTag = selected.tags?.some(t => t.tagId === tag.id)
    try {
      if (hasTag) {
        await conversationsApi.removeTag(selected.id, tag.id)
        setSelected(prev =>
          prev ? { ...prev, tags: (prev.tags || []).filter(t => t.tagId !== tag.id) } : null
        )
      } else {
        const { data } = await conversationsApi.addTag(selected.id, tag.id)
        setSelected(prev =>
          prev ? { ...prev, tags: [...(prev.tags || []), { tagId: tag.id, tag }] } : null
        )
      }
    } catch {
      toast.error('Erro ao atualizar tag')
    }
  }

  const createTag = async () => {
    if (!newTagName.trim()) return
    try {
      const colors = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899']
      const randomColor = colors[Math.floor(Math.random() * colors.length)]
      const { data } = await tagsApi.create(newTagName.trim(), randomColor)
      setAllTags(prev => [...prev, data])
      if (selected) {
        await conversationsApi.addTag(selected.id, data.id)
        setSelected(prev =>
          prev ? { ...prev, tags: [...(prev.tags || []), { tagId: data.id, tag: data }] } : null
        )
      }
      setNewTagName('')
      toast.success('Tag criada e vinculada!')
    } catch {
      toast.error('Erro ao criar tag')
    }
  }

  // Mudar Estágio do Funil (Pipeline)
  const changeStage = async (stageId: string) => {
    if (!selected) return
    try {
      const { data } = await conversationsApi.updateStage(selected.id, stageId)
      setSelected(prev => (prev ? { ...prev, stageId, stage: data.stage } : null))
      toast.success('Estágio de vendas atualizado!')
    } catch {
      toast.error('Erro ao mudar estágio')
    }
  }

  const resolve = async () => {
    if (!selected) return
    await conversationsApi.resolve(selected.id)
    toast.success('Conversa resolvida!')
    setSelected(null)
    loadConversations()
  }

  const returnToAI = async () => {
    if (!selected) return
    await conversationsApi.returnToAI(selected.id)
    toast.success('Devolvido para a IA cuidar!')
    setSelected(null)
    loadConversations()
  }

  const filteredQuickReplies = quickReplies.filter(
    q => q.shortcut.toLowerCase().includes(quickSearch) || q.title.toLowerCase().includes(quickSearch)
  )

  return (
    <div className="flex h-full animate-fade-in bg-surface-950 text-white select-none">
      {/* ─── Sidebar: Lista de Conversas ────────────────────────────────────────── */}
      <div className="w-80 flex-shrink-0 border-r border-white/[0.08] flex flex-col bg-surface-900/50 backdrop-blur-md">
        {/* Header do Inbox com Filtros */}
        <div className="p-4 border-b border-white/[0.08] space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-base flex items-center gap-2">
              <MessageSquare size={18} className="text-brand-400" />
              Inbox Pro
            </h2>
            <span className="text-xs bg-brand-500/20 text-brand-400 px-2 py-0.5 rounded-full font-medium">
              {conversations.length} chats
            </span>
          </div>

          {/* Abas de Filtro de Status */}
          <div className="flex bg-surface-800/80 p-0.5 rounded-lg text-xs font-medium border border-white/[0.06]">
            {[
              { id: 'ALL', label: 'Todos' },
              { id: 'HUMAN_ACTIVE', label: 'Humano' },
              { id: 'AI_ACTIVE', label: 'IA Ativa' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setFilterStatus(tab.id)
                  loadConversations()
                }}
                className={clsx('flex-1 py-1.5 rounded-md transition-all text-center', {
                  'bg-brand-500 text-white shadow-glow-sm font-semibold': filterStatus === tab.id,
                  'text-white/50 hover:text-white': filterStatus !== tab.id
                })}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Lista Rolável de Chats */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {conversations.length === 0 ? (
            <div className="p-8 text-center">
              <Users size={32} className="text-white/20 mx-auto mb-3" />
              <p className="text-sm text-white/40">Nenhuma conversa encontrada</p>
              <p className="text-xs text-white/25 mt-1">A IA está monitorando novas mensagens!</p>
            </div>
          ) : (
            conversations.map(conv => {
              const isSelected = selected?.id === conv.id
              const lastMsg = conv.messages?.[conv.messages.length - 1]
              const isAudio = lastMsg?.mediaType === 'AUDIO' || lastMsg?.content?.includes('🎙️')
              return (
                <button
                  key={conv.id}
                  onClick={() => selectConversation(conv)}
                  className={clsx(
                    'w-full text-left px-4 py-3.5 border-b border-white/[0.04] transition-all relative',
                    {
                      'bg-surface-800/90 border-l-4 border-l-brand-500': isSelected,
                      'hover:bg-surface-800/40': !isSelected
                    }
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-xs font-bold flex-shrink-0 shadow-sm">
                      {(conv.contactName || conv.contactPhone)[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm truncate">
                          {conv.contactName || conv.contactPhone}
                        </span>
                        <span className="text-[11px] text-white/30">
                          {format(new Date(conv.updatedAt), 'HH:mm')}
                        </span>
                      </div>

                      {/* Mensagem prévia */}
                      <p className="text-xs text-white/40 truncate mt-1 flex items-center gap-1">
                        {isAudio && <Mic size={12} className="text-brand-400 flex-shrink-0" />}
                        {lastMsg?.content || 'Iniciando conversa...'}
                      </p>

                      {/* Badges de Tags e Status */}
                      <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                        <span
                          className={clsx('text-[10px] px-1.5 py-0.5 rounded font-medium', {
                            'bg-amber-500/20 text-amber-300 border border-amber-500/30':
                              conv.status === 'HUMAN_ACTIVE',
                            'bg-brand-500/20 text-brand-300 border border-brand-500/30':
                              conv.status === 'AI_ACTIVE',
                            'bg-surface-700 text-white/40': conv.status === 'RESOLVED'
                          })}
                        >
                          {conv.status === 'HUMAN_ACTIVE' ? 'Aguardando Atendente' : 'IA Ativa'}
                        </span>

                        {conv.stage && (
                          <span
                            className="text-[10px] px-1.5 py-0.5 rounded font-medium text-white border"
                            style={{
                              backgroundColor: `${conv.stage.color}20`,
                              borderColor: `${conv.stage.color}40`,
                              color: conv.stage.color
                            }}
                          >
                            {conv.stage.name}
                          </span>
                        )}

                        {conv.tags?.slice(0, 2).map(t => (
                          <span
                            key={t.tagId}
                            className="text-[9px] px-1.5 py-0.2 rounded-full"
                            style={{ backgroundColor: `${t.tag.color}30`, color: t.tag.color }}
                          >
                            {t.tag.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* ─── Área Principal de Atendimento (Chat Area) ───────────────────────── */}
      {selected ? (
        <div className="flex-1 flex flex-col bg-surface-950 relative overflow-hidden">
          {/* Alerta de Detecção de Colisão entre Atendentes */}
          {otherViewer && (
            <div className="bg-amber-500/15 border-b border-amber-500/30 px-6 py-2 flex items-center gap-2 text-amber-300 text-xs font-medium animate-slide-down">
              <AlertTriangle size={14} className="animate-pulse" />
              <span>
                <strong>{otherViewer}</strong> também está visualizando esta conversa neste momento!
              </span>
            </div>
          )}

          {/* Header da Conversa */}
          <div className="px-6 py-3.5 border-b border-white/[0.08] flex items-center justify-between bg-surface-900/40 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-brand flex items-center justify-center text-sm font-bold shadow-md">
                {(selected.contactName || selected.contactPhone)[0].toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-sm">
                    {selected.contactName || selected.contactPhone}
                  </h3>
                  <span className="text-xs text-white/30">{selected.contactPhone}</span>
                </div>

                {/* Seletor de Estágio do Funil + Tags */}
                <div className="flex items-center gap-2 mt-1">
                  {/* Dropdown de Estágio */}
                  <select
                    value={selected.stageId || ''}
                    onChange={e => changeStage(e.target.value)}
                    className="bg-surface-800 text-white/70 text-[11px] px-2 py-0.5 rounded border border-white/[0.08] focus:border-brand-500 outline-none cursor-pointer"
                  >
                    <option value="">Sem Estágio</option>
                    {stages.map(s => (
                      <option key={s.id} value={s.id}>
                        📌 {s.name}
                      </option>
                    ))}
                  </select>

                  {/* Tags com botão de adicionar */}
                  <div className="flex items-center gap-1">
                    {selected.tags?.map(t => (
                      <span
                        key={t.tagId}
                        className="text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1"
                        style={{ backgroundColor: `${t.tag.color}30`, color: t.tag.color }}
                      >
                        {t.tag.name}
                        <button
                          onClick={() => toggleTag(t.tag)}
                          className="hover:opacity-70"
                        >
                          <X size={10} />
                        </button>
                      </span>
                    ))}
                    <button
                      onClick={() => setShowTagPicker(!showTagPicker)}
                      className="text-[10px] bg-surface-800 hover:bg-surface-700 text-white/50 hover:text-white px-2 py-0.5 rounded-full flex items-center gap-1 border border-white/[0.08]"
                    >
                      <Plus size={10} /> Tag
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Ações do Chat */}
            <div className="flex items-center gap-2">
              <button
                onClick={returnToAI}
                className="btn-secondary flex items-center gap-1.5 text-xs py-1.5 px-3"
              >
                <ArrowLeftRight size={13} /> Devolver para IA
              </button>
              <button
                onClick={resolve}
                className="btn-primary flex items-center gap-1.5 text-xs py-1.5 px-3.5"
              >
                <CheckCircle2 size={13} /> Resolver
              </button>
            </div>
          </div>

          {/* Modal / Popover de Tags */}
          {showTagPicker && (
            <div className="absolute top-16 right-6 z-30 w-64 card p-4 shadow-xl border border-white/10 space-y-3 animate-slide-down">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white/70">Gerenciar Tags</span>
                <button
                  onClick={() => setShowTagPicker(false)}
                  className="text-white/30 hover:text-white"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="space-y-1.5 max-h-40 overflow-y-auto scrollbar-thin">
                {allTags.map(tag => {
                  const isChecked = selected.tags?.some(t => t.tagId === tag.id)
                  return (
                    <button
                      key={tag.id}
                      onClick={() => toggleTag(tag)}
                      className={clsx(
                        'w-full text-left px-2.5 py-1.5 rounded text-xs flex items-center justify-between transition-colors',
                        isChecked ? 'bg-surface-700 font-medium' : 'hover:bg-surface-800'
                      )}
                    >
                      <span className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: tag.color }}
                        />
                        {tag.name}
                      </span>
                      {isChecked && <CheckCircle2 size={12} className="text-brand-400" />}
                    </button>
                  )
                })}
              </div>

              {/* Criar nova tag */}
              <div className="flex gap-1.5 pt-2 border-t border-white/[0.06]">
                <input
                  className="input text-xs py-1 px-2 flex-1"
                  placeholder="Nova tag..."
                  value={newTagName}
                  onChange={e => setNewTagName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && createTag()}
                />
                <button
                  onClick={createTag}
                  disabled={!newTagName.trim()}
                  className="btn-primary text-xs px-2.5 py-1"
                >
                  <Plus size={13} />
                </button>
              </div>
            </div>
          )}

          {/* Mensagens Roláveis */}
          <div className="flex-1 overflow-y-auto scrollbar-thin px-8 py-6 space-y-4">
            {selected.messages.map(msg => {
              const isUser = msg.role === 'USER'
              const isNote = msg.role === 'INTERNAL_NOTE'
              const isAudio = msg.mediaType === 'AUDIO' || msg.content?.startsWith('🎙️ [Áudio]:')

              if (isNote) {
                return (
                  <div key={msg.id} className="flex justify-center my-3">
                    <div className="max-w-md w-full bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-amber-200 text-xs space-y-1 shadow-sm">
                      <div className="flex items-center justify-between font-semibold text-amber-300">
                        <span className="flex items-center gap-1.5">
                          <Lock size={12} /> Nota Interna (Privada)
                        </span>
                        <span className="text-[10px] opacity-60">
                          {format(new Date(msg.createdAt), 'HH:mm')}
                        </span>
                      </div>
                      <p className="leading-relaxed text-amber-100/90">{msg.content}</p>
                    </div>
                  </div>
                )
              }

              return (
                <div
                  key={msg.id}
                  className={clsx('flex gap-3', {
                    'justify-end': !isUser,
                    'justify-start': isUser
                  })}
                >
                  {isUser && (
                    <div className="w-8 h-8 rounded-full bg-surface-700 flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
                      <User size={14} className="text-white/60" />
                    </div>
                  )}

                  <div
                    className={clsx('max-w-[70%] rounded-2xl px-4 py-3 shadow-md', {
                      'bg-surface-800 text-white rounded-tl-sm border border-white/[0.06]': isUser,
                      'bg-brand-600 text-white rounded-tr-sm': !isUser
                    })}
                  >
                    {isAudio && (
                      <div className="flex items-center gap-2 mb-1.5 text-xs text-brand-300 font-medium">
                        <Mic size={14} className="animate-pulse" />
                        <span>Mensagem de Áudio Transcrita</span>
                      </div>
                    )}

                    <p className="leading-relaxed text-sm whitespace-pre-wrap">{msg.content}</p>

                    <div className="text-[10px] opacity-40 mt-1.5 text-right font-mono">
                      {format(new Date(msg.createdAt), 'HH:mm')}
                    </div>
                  </div>

                  {!isUser && (
                    <div className="w-8 h-8 rounded-full bg-brand-500/20 flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
                      <Bot size={15} className="text-brand-400" />
                    </div>
                  )}
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Popover de Respostas Rápidas (quando digita '/') */}
          {showQuickPopover && filteredQuickReplies.length > 0 && (
            <div className="absolute bottom-20 left-8 right-8 max-w-lg bg-surface-800 border border-white/15 rounded-xl shadow-2xl p-2 z-20 animate-slide-up">
              <div className="text-[11px] font-semibold text-white/50 px-2 py-1 mb-1 flex items-center gap-1.5">
                <Zap size={12} className="text-amber-400" /> Respostas Rápidas (Selecione para preencher)
              </div>
              <div className="space-y-1 max-h-48 overflow-y-auto scrollbar-thin">
                {filteredQuickReplies.map(reply => (
                  <button
                    key={reply.id}
                    onClick={() => selectQuickReply(reply)}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-surface-700 transition-colors flex items-center justify-between group"
                  >
                    <div>
                      <span className="text-xs font-semibold text-brand-400 group-hover:text-brand-300">
                        {reply.shortcut}
                      </span>
                      <span className="text-xs text-white/70 ml-2">{reply.title}</span>
                      <p className="text-[11px] text-white/40 truncate max-w-sm">{reply.content}</p>
                    </div>
                    <span className="text-[10px] text-white/20 group-hover:text-white/60">Enter ↵</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Barra de Entrada / Envio */}
          <div className="px-8 py-4 border-t border-white/[0.08] bg-surface-900/60 backdrop-blur-md space-y-2">
            {/* Seletor de Modo: WhatsApp vs Nota Interna */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsInternalNote(false)}
                className={clsx(
                  'px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all',
                  !isInternalNote
                    ? 'bg-brand-500 text-white shadow-glow-sm'
                    : 'bg-surface-800 text-white/40 hover:text-white'
                )}
              >
                <Send size={12} /> Resposta WhatsApp
              </button>

              <button
                type="button"
                onClick={() => setIsInternalNote(true)}
                className={clsx(
                  'px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all',
                  isInternalNote
                    ? 'bg-amber-500 text-black font-semibold shadow-md'
                    : 'bg-surface-800 text-white/40 hover:text-white'
                )}
              >
                <Lock size={12} /> Nota Interna (Privada)
              </button>

              <span className="text-[11px] text-white/30 ml-auto">
                Dica: Digite <kbd className="bg-surface-800 px-1.5 py-0.5 rounded border border-white/10 text-white/70">/</kbd> para respostas rápidas
              </span>
            </div>

            {/* Input e Botão de Envio */}
            <div className="flex gap-3">
              <input
                className={clsx(
                  'input flex-1 text-sm py-3 px-4 transition-all',
                  isInternalNote &&
                    'border-amber-500/50 bg-amber-500/5 text-amber-100 placeholder-amber-300/40 focus:border-amber-400'
                )}
                placeholder={
                  isInternalNote
                    ? 'Escreva uma nota interna confidencial (apenas a equipe verá)...'
                    : 'Digite uma resposta para o WhatsApp (ou / para atalhos)...'
                }
                value={message}
                onChange={handleInputChange}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              />
              <button
                onClick={sendMessage}
                disabled={sending || !message.trim()}
                className={clsx(
                  'px-5 rounded-xl font-medium text-sm flex items-center justify-center transition-all',
                  isInternalNote
                    ? 'bg-amber-500 hover:bg-amber-400 text-black font-semibold'
                    : 'btn-primary'
                )}
              >
                {isInternalNote ? <Lock size={16} /> : <Send size={16} />}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-surface-950">
          <div className="text-center">
            <div className="w-16 h-16 rounded-3xl bg-surface-800 border border-white/[0.08] flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Bot size={30} className="text-brand-400/60" />
            </div>
            <h3 className="font-semibold text-white/70 text-base">Selecione uma conversa</h3>
            <p className="text-sm text-white/30 mt-1 max-w-xs">
              Escolha um chat ao lado para atender em tempo real, inserir notas internas ou gerenciar o lead.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
