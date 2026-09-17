'use client'

import { useEffect, useState } from 'react'
import { Brain, Save, Loader, ChevronDown, Info } from 'lucide-react'
import { aiConfigApi } from '@/lib/api'
import toast from 'react-hot-toast'

const MODELS = [
  { value: 'openai/gpt-4o-mini', label: 'GPT-4o Mini (Recomendado — custo/benefício)' },
  { value: 'openai/gpt-4o', label: 'GPT-4o (Mais inteligente)' },
  { value: 'anthropic/claude-3.5-sonnet', label: 'Claude 3.5 Sonnet (Excelente para suporte)' },
  { value: 'google/gemini-pro-1.5', label: 'Gemini Pro 1.5' },
  { value: 'meta-llama/llama-3.1-70b-instruct', label: 'Llama 3.1 70B (Gratuito)' },
]

const TONES = [
  'amigável e profissional',
  'formal e objetivo',
  'descontraído e próximo',
  'técnico e especializado',
  'empático e paciente',
]

const LANGUAGES = [
  { value: 'pt-BR', label: 'Português Brasileiro' },
  { value: 'en-US', label: 'English' },
  { value: 'es-ES', label: 'Español' },
]

const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

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
          setBusinessDays(bh.days || [1,2,3,4,5])
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
    <div className="flex items-center justify-center h-full">
      <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="p-8 max-w-3xl animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Configuração da IA</h1>
          <p className="text-white/40 text-sm mt-1">Defina a personalidade e comportamento do assistente</p>
        </div>
        <button onClick={save} disabled={saving} className="btn-primary flex items-center gap-2">
          {saving ? <Loader size={15} className="animate-spin" /> : <Save size={15} />}
          Salvar alterações
        </button>
      </div>

      <div className="space-y-6">
        {/* Persona */}
        <div className="card p-6 space-y-5">
          <h2 className="font-semibold flex items-center gap-2">
            <Brain size={16} className="text-brand-400" /> Persona da IA
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Nome do assistente</label>
              <input className="input" placeholder="Ex: Ana, Max, Zap..." value={config?.personaName || ''}
                onChange={e => toggle('personaName', e.target.value)} />
            </div>
            <div>
              <label className="label">Idioma</label>
              <select className="input" value={config?.language || 'pt-BR'}
                onChange={e => toggle('language', e.target.value)}>
                {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="label">Tom de voz</label>
            <select className="input" value={config?.personaTone || TONES[0]}
              onChange={e => toggle('personaTone', e.target.value)}>
              {TONES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <label className="label">Instruções adicionais (opcional)</label>
            <textarea className="input min-h-[100px] resize-none" placeholder="Ex: Nunca mencione concorrentes. Sempre ofereça o plano Premium. Peça o nome do cliente no início."
              value={config?.systemPrompt || ''} onChange={e => toggle('systemPrompt', e.target.value)} />
          </div>
        </div>

        {/* LLM */}
        <div className="card p-6 space-y-5">
          <h2 className="font-semibold">Modelo de IA</h2>
          <div>
            <label className="label">LLM via OpenRouter</label>
            <select className="input" value={config?.llmModel || 'openai/gpt-4o-mini'}
              onChange={e => toggle('llmModel', e.target.value)}>
              {MODELS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
            <p className="text-xs text-white/25 mt-1.5">Os custos de API são cobrados diretamente pelo OpenRouter na sua conta.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Máx. tokens por resposta</label>
              <input type="number" className="input" min={100} max={2000} step={50}
                value={config?.maxTokens || 500} onChange={e => toggle('maxTokens', parseInt(e.target.value))} />
            </div>
            <div>
              <label className="label">Tentativas antes de escalar</label>
              <input type="number" className="input" min={1} max={10}
                value={config?.maxAiRetries || 3} onChange={e => toggle('maxAiRetries', parseInt(e.target.value))} />
            </div>
          </div>
        </div>

        {/* Horário */}
        <div className="card p-6 space-y-5">
          <h2 className="font-semibold">Horário de atendimento</h2>

          <div>
            <label className="label">Dias da semana</label>
            <div className="flex gap-2 flex-wrap">
              {DAYS.map((d, i) => (
                <button key={d} type="button" onClick={() => toggleDay(i)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    businessDays.includes(i)
                      ? 'bg-brand-500 text-white shadow-glow-sm'
                      : 'bg-surface-700 text-white/40 hover:text-white/70'
                  }`}>
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
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
            <textarea className="input resize-none" rows={2}
              value={config?.outOfHoursMsg || ''} onChange={e => toggle('outOfHoursMsg', e.target.value)} />
          </div>
        </div>

        {/* Escalonamento */}
        <div className="card p-6 space-y-5">
          <h2 className="font-semibold">Escalonamento para humano</h2>

          <div>
            <label className="label">Palavras-chave (uma por linha)</label>
            <textarea className="input resize-none" rows={4}
              placeholder={'humano\natendente\nfalar com alguém\nquero cancelar'}
              value={JSON.parse(config?.escalationKeywords || '[]').join('\n')}
              onChange={e => toggle('escalationKeywords', JSON.stringify(
                e.target.value.split('\n').map(s => s.trim()).filter(Boolean)
              ))} />
            <p className="text-xs text-white/25 mt-1.5">Quando o cliente digitar qualquer uma dessas palavras, a conversa vai para o inbox.</p>
          </div>

          <div>
            <label className="label">Mensagem quando não souber responder</label>
            <input className="input" value={config?.noKnowledgeMsg || ''}
              onChange={e => toggle('noKnowledgeMsg', e.target.value)} />
          </div>
        </div>

        {/* CSAT */}
        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Pesquisa de satisfação (CSAT)</h2>
            <button
              type="button"
              onClick={() => toggle('csatEnabled', !config?.csatEnabled)}
              className={`w-11 h-6 rounded-full transition-colors relative ${config?.csatEnabled ? 'bg-brand-500' : 'bg-surface-600'}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${config?.csatEnabled ? 'left-6' : 'left-1'}`} />
            </button>
          </div>
          {config?.csatEnabled && (
            <div>
              <label className="label">Mensagem enviada ao resolver</label>
              <input className="input" value={config?.csatMessage || ''}
                onChange={e => toggle('csatMessage', e.target.value)} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
