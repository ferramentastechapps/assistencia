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
    <div className="flex h-full animate-fade-in bg-[#DCD8CD] text-[#1C1D21] select-none">
      {/* ─── Sidebar: Lista de Conversas ────────────────────────────────────────── */}
      <div className="w-80 flex-shrink-0 border-r border-[#CAC5B7]/70 flex flex-col bg-[#E6E3D8]">
        {/* Header do Inbox com Filtros */}
        <div className="p-4 border-b border-[#CAC5B7]/60 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-extrabold text-base flex items-center gap-2 text-[#1C1D21]">
              <MessageSquare size={18} className="text-[#F5C518]" />
              Inbox Pro
            </h2>
            <span className="text-xs bg-[#232528]/85 text-white px-2.5 py-0.5 rounded-full font-bold shadow-sm backdrop-blur-sm border border-white/10">
              {conversations.length} chats
            </span>
          </div>

          {/* Abas de Filtro de Status */}
          <div className="flex bg-[#DAD6C9] p-1 rounded-full text-xs font-semibold border border-black/[0.04]">
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
                className={clsx('flex-1 py-1.5 rounded-full transition-all text-center', {
                  'bg-white text-[#1C1D21] shadow-tactile-pill font-extrabold': filterStatus === tab.id,
                  'text-[#555962] hover:text-[#1C1D21]': filterStatus !== tab.id
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
              <Users size={32} className="text-[#888C95] mx-auto mb-3" />
              <p className="text-sm text-[#787C87] font-semibold">Nenhuma conversa encontrada</p>
              <p className="text-xs text-[#888C95] mt-1">A IA está monitorando novas mensagens!</p>
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
                    'w-full text-left px-4 py-3.5 border-b border-black/[0.04] transition-all relative',
                    {
                      'bg-white border-l-4 border-l-[#18191B] shadow-tactile-pill': isSelected,
                      'hover:bg-white/60': !isSelected
                    }
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#18191B] text-[#F5C518] flex items-center justify-center text-xs font-black flex-shrink-0 shadow-sm">
                      {(conv.contactName || conv.contactPhone)[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-sm text-[#18191B] truncate">
                          {conv.contactName || conv.contactPhone}
                        </span>
                        <span className="text-[11px] text-[#888C95] font-semibold">
                          {format(new Date(conv.updatedAt), 'HH:mm')}
                        </span>
                      </div>

                      {/* Mensagem prévia */}
                      <p className="text-xs text-[#555962] truncate mt-1 flex items-center gap-1 font-medium">
                        {isAudio && <Mic size={12} className="text-[#18191B] flex-shrink-0" />}
                        {lastMsg?.content || 'Iniciando conversa...'}
                      </p>

                      {/* Badges de Tags e Status */}
                      <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                        <span
                          className={clsx('text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm', {
                            'bg-[#FEF9C3] text-[#854D0E] border border-[#FDE047]/60':
                              conv.status === 'HUMAN_ACTIVE',
                            'bg-[#18191B] text-white':
                              conv.status === 'AI_ACTIVE',
                            'bg-[#EFECE4] text-[#787C87]': conv.status === 'RESOLVED'
                          })}
                        >
                          {conv.status === 'HUMAN_ACTIVE' ? 'Aguardando Atendente' : 'IA Ativa'}
                        </span>

                        {conv.stage && (
                          <span
                            className="text-[10px] px-2 py-0.5 rounded-full font-bold text-[#18191B] bg-white border border-black/[0.04] shadow-sm"
                          >
                            {conv.stage.name}
                          </span>
                        )}

                        {conv.tags?.slice(0, 2).map(t => (
                          <span
                            key={t.tagId}
                            className="text-[9px] px-2 py-0.2 rounded-full font-semibold"
                            style={{ backgroundColor: `${t.tag.color}25`, color: '#18191B' }}
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
        <div className="flex-1 flex flex-col bg-[#E5E3DC] relative overflow-hidden">
          {/* Alerta de Detecção de Colisão entre Atendentes */}
          {otherViewer && (
            <div className="bg-[#FEF9C3] border-b border-[#FDE047] px-6 py-2 flex items-center gap-2 text-[#854D0E] text-xs font-bold animate-slide-down">
              <AlertTriangle size={14} className="animate-pulse" />
              <span>
                <strong>{otherViewer}</strong> também está visualizando esta conversa neste momento!
              </span>
            </div>
          )}

          {/* Header da Conversa */}
          <div className="px-6 py-3.5 border-b border-black/[0.06] flex items-center justify-between bg-white shadow-tactile-pill">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#18191B] text-[#F5C518] flex items-center justify-center text-sm font-extrabold shadow-sm">
                {(selected.contactName || selected.contactPhone)[0].toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-sm text-[#18191B]">
                    {selected.contactName || selected.contactPhone}
                  </h3>
                  <span className="text-xs text-[#787C87] font-semibold">{selected.contactPhone}</span>
                </div>

                {/* Seletor de Estágio do Funil + Tags */}
                <div className="flex items-center gap-2 mt-1">
                  {/* Dropdown de Estágio */}
                  <select
                    value={selected.stageId || ''}
                    onChange={e => changeStage(e.target.value)}
                    className="bg-[#EFECE4] text-[#18191B] text-[11px] px-2.5 py-0.5 rounded-full border border-black/[0.06] focus:border-[#18191B] outline-none cursor-pointer font-semibold"
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
                        className="text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 font-semibold bg-[#EFECE4] text-[#18191B]"
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
                      className="text-[10px] bg-[#EFECE4] hover:bg-white text-[#555962] hover:text-[#18191B] px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-black/[0.04] font-semibold"
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
                className="btn-secondary flex items-center gap-1.5 text-xs py-1.5 px-3.5 font-bold"
              >
                <ArrowLeftRight size={13} /> Devolver para IA
              </button>
              <button
                onClick={resolve}
                className="btn-primary flex items-center gap-1.5 text-xs py-1.5 px-4 font-bold"
              >
                <CheckCircle2 size={13} className="text-[#F5C518]" /> Resolver
              </button>
            </div>
          </div>

          {/* Modal / Popover de Tags */}
          {showTagPicker && (
            <div className="absolute top-16 right-6 z-30 w-64 card !p-4 shadow-tablet-kiosk space-y-3 animate-slide-down">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#18191B]">Gerenciar Tags</span>
                <button
                  onClick={() => setShowTagPicker(false)}
                  className="text-[#888C95] hover:text-[#18191B]"
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
                        'w-full text-left px-2.5 py-1.5 rounded-full text-xs flex items-center justify-between transition-colors',
                        isChecked ? 'bg-[#18191B] text-white font-semibold' : 'hover:bg-[#EFECE4] text-[#18191B]'
                      )}
                    >
                      <span className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: tag.color }}
                        />
                        {tag.name}
                      </span>
                      {isChecked && <CheckCircle2 size={12} className="text-[#F5C518]" />}
                    </button>
                  )
                })}
              </div>

              {/* Criar nova tag */}
              <div className="flex gap-1.5 pt-2 border-t border-black/[0.06]">
                <input
                  className="input text-xs py-1.5 px-3 flex-1"
                  placeholder="Nova tag..."
                  value={newTagName}
                  onChange={e => setNewTagName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && createTag()}
                />
                <button
                  onClick={createTag}
                  disabled={!newTagName.trim()}
                  className="btn-primary text-xs px-3 py-1"
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
                    <div className="max-w-md w-full bg-[#FEF9C3] border border-[#FDE047] rounded-2xl p-3.5 text-[#854D0E] text-xs space-y-1 shadow-sm">
                      <div className="flex items-center justify-between font-bold">
                        <span className="flex items-center gap-1.5">
                          <Lock size={12} /> Nota Interna da Oficina
                        </span>
                        <span className="text-[10px] opacity-70 font-semibold">
                          {format(new Date(msg.createdAt), 'HH:mm')}
                        </span>
                      </div>
                      <p className="leading-relaxed font-medium">{msg.content}</p>
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
                    <div className="w-8 h-8 rounded-full bg-[#DDD9CE] flex items-center justify-center flex-shrink-0 mt-1 shadow-sm text-[#18191B]">
                      <User size={14} />
                    </div>
                  )}

                  <div
                    className={clsx('max-w-[70%] rounded-3xl px-5 py-3.5 shadow-sm', {
                      'bg-white text-[#18191B] rounded-tl-sm border border-black/[0.04]': isUser,
                      'bg-[#18191B] text-white rounded-tr-sm shadow-tactile-dark': !isUser
                    })}
                  >
                    {isAudio && (
                      <div className="flex items-center gap-2 mb-1.5 text-xs text-[#F5C518] font-bold">
                        <Mic size={14} className="animate-pulse" />
                        <span>Mensagem de Áudio Transcrita</span>
                      </div>
                    )}

                    <p className="leading-relaxed text-sm whitespace-pre-wrap font-medium">{msg.content}</p>

                    <div className={clsx('text-[10px] mt-1.5 text-right font-mono', {
                      'text-[#888C95]': isUser,
                      'text-white/40': !isUser
                    })}>
                      {format(new Date(msg.createdAt), 'HH:mm')}
                    </div>
                  </div>

                  {!isUser && (
                    <div className="w-8 h-8 rounded-full bg-[#18191B] text-[#F5C518] flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
                      <Bot size={15} />
                    </div>
                  )}
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Popover de Respostas Rápidas (quando digita '/') */}
          {showQuickPopover && filteredQuickReplies.length > 0 && (
            <div className="absolute bottom-20 left-8 right-8 max-w-lg card !p-3 shadow-tablet-kiosk z-20 animate-slide-up">
              <div className="text-[11px] font-bold text-[#888C95] px-2 py-1 mb-1 flex items-center gap-1.5">
                <Zap size={12} className="text-[#F5C518]" /> Respostas Rápidas (Selecione para preencher)
              </div>
              <div className="space-y-1 max-h-48 overflow-y-auto scrollbar-thin">
                {filteredQuickReplies.map(reply => (
                  <button
                    key={reply.id}
                    onClick={() => selectQuickReply(reply)}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#EFECE4] transition-colors flex items-center justify-between group"
                  >
                    <div>
                      <span className="text-xs font-bold text-[#18191B] group-hover:underline">
                        {reply.shortcut}
                      </span>
                      <span className="text-xs text-[#555962] ml-2 font-medium">{reply.title}</span>
                      <p className="text-[11px] text-[#787C87] truncate max-w-sm">{reply.content}</p>
                    </div>
                    <span className="text-[10px] text-[#888C95]">Enter ↵</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Barra de Entrada / Envio */}
          <div className="px-8 py-4 border-t border-black/[0.06] bg-white shadow-sm space-y-2.5">
            {/* Seletor de Modo: WhatsApp vs Nota Interna */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsInternalNote(false)}
                className={clsx(
                  'px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm',
                  !isInternalNote
                    ? 'bg-[#18191B] text-white shadow-tactile-dark'
                    : 'bg-[#EFECE4] text-[#555962] hover:text-[#18191B]'
                )}
              >
                <Send size={12} className={!isInternalNote ? 'text-[#F5C518]' : ''} /> Resposta WhatsApp
              </button>

              <button
                type="button"
                onClick={() => setIsInternalNote(true)}
                className={clsx(
                  'px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm',
                  isInternalNote
                    ? 'bg-[#F5C518] text-[#18191B] shadow-tactile-pill'
                    : 'bg-[#EFECE4] text-[#555962] hover:text-[#18191B]'
                )}
              >
                <Lock size={12} /> Nota Interna (Privada)
              </button>

              <span className="text-[11px] text-[#888C95] ml-auto font-medium">
                Dica: Digite <kbd className="bg-[#EFECE4] px-1.5 py-0.5 rounded-md border border-black/[0.06] text-[#18191B] font-bold">/</kbd> para respostas rápidas
              </span>
            </div>

            {/* Input e Botão de Envio */}
            <div className="flex gap-3">
              <input
                className={clsx(
                  'input flex-1 text-sm py-3 px-5 transition-all',
                  isInternalNote &&
                    'border-[#FDE047] bg-[#FEF9C3]/50 text-[#854D0E] placeholder-[#854D0E]/60 focus:border-[#F5C518]'
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
                  'px-6 rounded-full font-bold text-sm flex items-center justify-center transition-all shadow-tactile-dark',
                  isInternalNote
                    ? 'bg-[#F5C518] hover:bg-[#FFE033] text-[#18191B]'
                    : 'btn-primary'
                )}
              >
                {isInternalNote ? <Lock size={16} /> : <Send size={16} className="text-[#F5C518]" />}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-[#E5E3DC]">
          <div className="text-center card !p-8 max-w-sm rounded-[32px] shadow-tactile-card">
            <div className="w-16 h-16 rounded-3xl bg-[#18191B] text-[#F5C518] flex items-center justify-center mx-auto mb-4 shadow-tactile-dark">
              <Bot size={30} />
            </div>
            <h3 className="font-extrabold text-[#18191B] text-base">Selecione uma conversa</h3>
            <p className="text-xs text-[#787C87] mt-1.5 font-medium leading-relaxed">
              Escolha um cliente na coluna lateral para acompanhar o atendimento em tempo real ou enviar respostas rápidas.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
