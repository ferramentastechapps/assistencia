'use client'

import { useEffect, useState } from 'react'
import {
  Brain, Save, Loader, Wrench, Clock, MessageSquare,
  Shield, Zap, Star, ChevronDown, Info, CheckCircle2,
  AlertTriangle, Smartphone
} from 'lucide-react'
import { aiConfigApi } from '@/lib/api'
import toast from 'react-hot-toast'
import { clsx } from 'clsx'

const MODELS = [
  { value: 'openai/gpt-4o-mini',                   label: 'GPT-4o Mini', desc: 'Custo/benefício — recomendado' },
  { value: 'openai/gpt-4o',                         label: 'GPT-4o',      desc: 'Mais inteligente' },
  { value: 'anthropic/claude-3.5-sonnet',           label: 'Claude 3.5 Sonnet', desc: 'Excelente para suporte' },
  { value: 'google/gemini-pro-1.5',                 label: 'Gemini Pro 1.5', desc: 'Google' },
  { value: 'meta-llama/llama-3.1-70b-instruct',    label: 'Llama 3.1 70B', desc: 'Gratuito — open source' },
]

const TONES = [
  { value: 'amigável e profissional',   label: 'Amigável e Profissional', icon: '😊' },
  { value: 'formal e objetivo',         label: 'Formal e Objetivo',       icon: '💼' },
  { value: 'descontraído e próximo',    label: 'Descontraído e Próximo',  icon: '🤙' },
  { value: 'técnico e especializado',   label: 'Técnico e Especializado', icon: '🔧' },
  { value: 'empático e paciente',       label: 'Empático e Paciente',     icon: '🤝' },
]

const DAYS = [
  { d: 0, label: 'D' },
  { d: 1, label: 'S' },
  { d: 2, label: 'T' },
  { d: 3, label: 'Q' },
  { d: 4, label: 'Q' },
  { d: 5, label: 'S' },
  { d: 6, label: 'S' },
]

const TOOLS_INFO = [
  { icon: '🔧', label: 'Consultar OS',     desc: 'Verifica status da Ordem de Serviço pelo número ou telefone do cliente' },
  { icon: '💰', label: 'Orçamento',        desc: 'Busca preços de conserto da tabela cadastrada (tela, bateria, conector...)' },
  { icon: '📱', label: 'Catálogo',         desc: 'Lista aparelhos disponíveis no estoque para venda' },
  { icon: '🔄', label: 'Trade-In',         desc: 'Avalia e calcula valor estimado do celular usado do cliente' },
  { icon: '📅', label: 'Agendamento',      desc: 'Reserva horário automaticamente como nota interna' },
  { icon: '💳', label: 'Gerar Pix',        desc: 'Gera cobrança Pix formatada no WhatsApp' },
]

export default function AIConfigPage() {
  const [config, setConfig] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [businessDays, setBusinessDays] = useState<number[]>([1, 2, 3, 4, 5])
  const [startTime, setStartTime] = useState('08:00')
  const [endTime, setEndTime] = useState('18:00')

  useEffect(() => {
    aiConfigApi.get().then(({ data }) => {
      setConfig(data)
      if (data?.businessHours) {
        try {
          const bh = JSON.parse(data.businessHours)
          setBusinessDays(bh.days || [1, 2, 3, 4, 5])
          setStartTime(bh.start || '08:00')
          setEndTime(bh.end || '18:00')
        } catch {}
      }
    }).finally(() => setLoading(false))
  }, [])

  const save = async () => {
    setSaving(true)
    try {
      const businessHours = JSON.stringify({ start: startTime, end: endTime, days: businessDays })
      const { data } = await aiConfigApi.update({ ...config, businessHours })
      setConfig(data)
      toast.success('Configurações salvas!')
    } catch { toast.error('Erro ao salvar') }
    finally { setSaving(false) }
  }

  const toggle = (k: string, v: any) => setConfig((c: any) => ({ ...c, [k]: v }))

  const toggleDay = (d: number) => setBusinessDays(prev =>
    prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d].sort()
  )

  if (loading) return (
    <div className="flex items-center justify-center h-full bg-[#DCD8CD]">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-2 border-black/10 border-t-[#232528] animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3.5 h-3.5 rounded-full bg-[#F5C518]" />
        </div>
      </div>
    </div>
  )

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1100px] mx-auto animate-fade-in font-sans">

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="rounded-full px-3 py-0.5 text-[10px] uppercase tracking-wider font-extrabold bg-[#232528]/85 text-white backdrop-blur-sm border border-white/10 flex items-center gap-1.5 shadow-sm">
              <Brain size={11} className="text-[#F5C518]" /> Cérebro & IA
            </span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-[#1C1D21]">
            Configuração da IA
          </h1>
          <p className="text-xs text-[#797D8A] mt-1 font-medium">
            Persona, comportamento e ferramentas do assistente WhatsApp
          </p>
        </div>
        <button onClick={save} disabled={saving}
          className="group inline-flex items-center gap-3 bg-[#232528]/85 hover:bg-[#1A1C1E]/95 text-white px-5 py-2.5 rounded-full text-xs font-bold transition-all duration-300 shadow-tactile-dark backdrop-blur-md border border-white/10 active:scale-[0.98] shrink-0 self-start sm:self-auto disabled:opacity-60"
        >
          {saving ? <Loader size={14} className="animate-spin" /> : <Save size={14} className="text-[#F5C518]" />}
          Salvar Configurações
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Left col: Persona + LLM ──────────────────────────────── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Persona */}
          <div className="card space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-[#F5C518] text-[#18191B] flex items-center justify-center shadow-sm flex-shrink-0">
                <Brain size={17} />
              </div>
              <div>
                <h2 className="font-black text-base text-[#1C1D21] tracking-tight">Persona da IA</h2>
                <p className="text-xs text-[#797D8A] font-medium">Como a IA se apresenta e fala com os clientes</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Nome do Assistente *</label>
                <input className="input" placeholder="Ex: Ana, Max, Zap..."
                  value={config?.personaName || ''}
                  onChange={e => toggle('personaName', e.target.value)} />
              </div>
              <div>
                <label className="label">Idioma</label>
                <select className="input cursor-pointer" value={config?.language || 'pt-BR'}
                  onChange={e => toggle('language', e.target.value)}>
                  <option value="pt-BR">Português Brasileiro</option>
                  <option value="en-US">English</option>
                  <option value="es-ES">Español</option>
                </select>
              </div>
            </div>

            <div>
              <label className="label">Tom de Voz</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {TONES.map(t => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => toggle('personaTone', t.value)}
                    className={clsx(
                      'flex items-center gap-2 px-3 py-2.5 rounded-2xl text-xs font-bold transition-all border text-left',
                      config?.personaTone === t.value
                        ? 'bg-[#232528]/85 text-white border-white/10 shadow-tactile-dark backdrop-blur-sm'
                        : 'bg-white text-[#1C1D21] border-black/[0.05] hover:bg-[#FAF9F6] shadow-sm'
                    )}
                  >
                    <span className="text-base">{t.icon}</span>
                    <span className="leading-tight">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label">Instruções Adicionais</label>
              <textarea
                className="w-full bg-white border border-black/[0.08] text-[#1C1D21] placeholder-[#9DA1AB] rounded-2xl p-4 text-sm outline-none focus:border-[#18191B] resize-none"
                rows={4}
                placeholder="Ex: Nunca mencione concorrentes. Sempre ofereça parcelamento em 12x. Pergunte o modelo exato do celular antes de qualquer orçamento..."
                value={config?.systemPrompt || ''}
                onChange={e => toggle('systemPrompt', e.target.value)}
              />
            </div>
          </div>

          {/* LLM Model */}
          <div className="card space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-[#DAD6C9] flex items-center justify-center text-[#1C1D21] flex-shrink-0">
                <Zap size={16} />
              </div>
              <div>
                <h2 className="font-black text-base text-[#1C1D21] tracking-tight">Modelo de IA (LLM)</h2>
                <p className="text-xs text-[#797D8A] font-medium">Fornecido via OpenRouter</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {MODELS.map(m => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => toggle('llmModel', m.value)}
                  className={clsx(
                    'flex flex-col items-start px-4 py-3 rounded-2xl text-xs transition-all border text-left',
                    config?.llmModel === m.value
                      ? 'bg-[#232528]/85 text-white border-white/10 shadow-tactile-dark backdrop-blur-sm'
                      : 'bg-white text-[#1C1D21] border-black/[0.05] hover:bg-[#FAF9F6] shadow-sm'
                  )}
                >
                  <span className="font-extrabold">{m.label}</span>
                  <span className={clsx('text-[10px] mt-0.5', config?.llmModel === m.value ? 'text-white/60' : 'text-[#797D8A]')}>{m.desc}</span>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4 pt-1">
              <div>
                <label className="label">Máx. Tokens / Resposta</label>
                <input type="number" className="input" min={100} max={2000} step={50}
                  value={config?.maxTokens || 500}
                  onChange={e => toggle('maxTokens', parseInt(e.target.value))} />
              </div>
              <div>
                <label className="label">Tentativas antes de Escalar</label>
                <input type="number" className="input" min={1} max={10}
                  value={config?.maxAiRetries || 3}
                  onChange={e => toggle('maxAiRetries', parseInt(e.target.value))} />
              </div>
            </div>
          </div>

          {/* Escalation */}
          <div className="card space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-[#DAD6C9] flex items-center justify-center text-[#1C1D21] flex-shrink-0">
                <AlertTriangle size={16} />
              </div>
              <div>
                <h2 className="font-black text-base text-[#1C1D21] tracking-tight">Escalonamento para Humano</h2>
                <p className="text-xs text-[#797D8A] font-medium">Quando a IA deve chamar um atendente</p>
              </div>
            </div>

            <div>
              <label className="label">Palavras-chave (uma por linha)</label>
              <textarea
                className="w-full bg-white border border-black/[0.08] text-[#1C1D21] placeholder-[#9DA1AB] rounded-2xl p-4 text-sm outline-none focus:border-[#18191B] resize-none"
                rows={4}
                placeholder={'humano\natendente\nfalar com alguém\nquero cancelar\ntécnico'}
                value={JSON.parse(config?.escalationKeywords || '[]').join('\n')}
                onChange={e => toggle('escalationKeywords', JSON.stringify(
                  e.target.value.split('\n').map((s: string) => s.trim()).filter(Boolean)
                ))}
              />
              <p className="text-[11px] text-[#797D8A] mt-1.5 font-medium">
                Ao detectar qualquer uma dessas palavras, a conversa vai para o Inbox automaticamente.
              </p>
            </div>

            <div>
              <label className="label">Mensagem quando não souber responder</label>
              <input className="input"
                value={config?.noKnowledgeMsg || ''}
                onChange={e => toggle('noKnowledgeMsg', e.target.value)}
                placeholder="Ex: Peço desculpas, vou acionar um técnico para te ajudar melhor!" />
            </div>
          </div>
        </div>

        {/* ── Right col: Horário + CSAT + Tools ─────────────────── */}
        <div className="space-y-5">

          {/* Business Hours */}
          <div className="card space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-[#DAD6C9] flex items-center justify-center text-[#1C1D21] flex-shrink-0">
                <Clock size={16} />
              </div>
              <div>
                <h2 className="font-black text-sm text-[#1C1D21] tracking-tight">Horário de Atendimento</h2>
                <p className="text-xs text-[#797D8A] font-medium">IA só atende neste período</p>
              </div>
            </div>

            <div>
              <label className="label">Dias da Semana</label>
              <div className="flex gap-1.5">
                {DAYS.map(({ d, label }) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => toggleDay(d)}
                    className={clsx(
                      'w-9 h-9 rounded-full text-xs font-extrabold transition-all',
                      businessDays.includes(d)
                        ? 'bg-[#232528]/85 text-white border border-white/10 shadow-tactile-dark backdrop-blur-sm'
                        : 'bg-white text-[#555962] border border-black/[0.05] hover:bg-[#FAF9F6] shadow-sm'
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Início</label>
                <input type="time" className="input" value={startTime} onChange={e => setStartTime(e.target.value)} />
              </div>
              <div>
                <label className="label">Fim</label>
                <input type="time" className="input" value={endTime} onChange={e => setEndTime(e.target.value)} />
              </div>
            </div>

            <div>
              <label className="label">Mensagem fora do horário</label>
              <textarea
                className="w-full bg-white border border-black/[0.08] text-[#1C1D21] placeholder-[#9DA1AB] rounded-2xl p-3 text-xs outline-none focus:border-[#18191B] resize-none"
                rows={3}
                value={config?.outOfHoursMsg || ''}
                onChange={e => toggle('outOfHoursMsg', e.target.value)}
                placeholder="Ex: Olá! Nosso atendimento é de segunda a sexta, das 8h às 18h. Retornaremos em breve! 📱"
              />
            </div>
          </div>

          {/* CSAT */}
          <div className="card space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-[#F5C518] text-[#18191B] flex items-center justify-center flex-shrink-0">
                  <Star size={15} />
                </div>
                <div>
                  <h2 className="font-black text-sm text-[#1C1D21] tracking-tight">CSAT</h2>
                  <p className="text-xs text-[#797D8A] font-medium">Pesquisa de satisfação</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => toggle('csatEnabled', !config?.csatEnabled)}
                className={clsx(
                  'w-12 h-6 rounded-full transition-all relative flex-shrink-0 shadow-sm',
                  config?.csatEnabled ? 'bg-[#10B981]' : 'bg-[#DAD6C9]'
                )}
              >
                <div className={clsx('w-4 h-4 bg-white rounded-full absolute top-1 transition-all shadow-sm', config?.csatEnabled ? 'left-7' : 'left-1')} />
              </button>
            </div>
            {config?.csatEnabled && (
              <div>
                <label className="label">Mensagem enviada ao resolver</label>
                <input className="input text-xs"
                  value={config?.csatMessage || ''}
                  onChange={e => toggle('csatMessage', e.target.value)}
                  placeholder="Ex: Resolvemos sua solicitação! De 1 a 5, como foi seu atendimento? ⭐" />
              </div>
            )}
          </div>

          {/* Active Tools */}
          <div className="card space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-[#DAD6C9] flex items-center justify-center text-[#1C1D21] flex-shrink-0">
                <Smartphone size={15} />
              </div>
              <div>
                <h2 className="font-black text-sm text-[#1C1D21] tracking-tight">Ferramentas Ativas</h2>
                <p className="text-xs text-[#797D8A] font-medium">Capacidades do agente IA</p>
              </div>
            </div>

            <div className="space-y-2">
              {TOOLS_INFO.map(tool => (
                <div key={tool.label} className="flex items-start gap-3 p-3 rounded-2xl bg-[#DAD6C9]/60 border border-black/[0.03]">
                  <span className="text-base flex-shrink-0 mt-0.5">{tool.icon}</span>
                  <div className="min-w-0">
                    <div className="text-xs font-extrabold text-[#1C1D21]">{tool.label}</div>
                    <div className="text-[10px] text-[#797D8A] font-medium leading-relaxed mt-0.5">{tool.desc}</div>
                  </div>
                  <CheckCircle2 size={14} className="text-[#10B981] flex-shrink-0 mt-0.5" />
                </div>
              ))}
            </div>

            <div className="p-3 rounded-2xl bg-[#F5C518]/10 border border-[#F5C518]/30">
              <p className="text-[10px] font-bold text-[#854D0E] leading-relaxed">
                ⚡ Ferramentas são ativadas automaticamente pela IA conforme o contexto da conversa. Nenhuma configuração adicional necessária.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
