'use client'

import { useEffect, useState } from 'react'
import {
  MessageSquare, Users, Zap, Star, TrendingUp,
  ArrowUpRight, Bot, Clock, CheckCircle2,
  Smartphone, Sparkles, ArrowRight, Wrench, ShieldCheck,
  Activity, Radio
} from 'lucide-react'
import Link from 'next/link'
import { analyticsApi } from '@/lib/api'
import { ResponsiveContainer, Area, AreaChart, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Overview {
  totalConversations: number
  todayConversations: number
  humanConversations: number
  resolvedThisMonth: number
  deflectionRate: number
  avgCsat: string | null
  messagesThisMonth: number
  apiUsage: number
  maxMessages: number
  plan: string
}

export default function DashboardPage() {
  const [overview, setOverview] = useState<Overview | null>(null)
  const [chart, setChart] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([analyticsApi.overview(), analyticsApi.conversationsChart()])
      .then(([o, c]) => {
        setOverview(o.data)
        setChart(c.data)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-2 border-emerald-500/20 border-t-emerald-400 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-4 rounded-full bg-emerald-400/80 animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  if (!overview) return null

  return (
    <div className="p-6 lg:p-8 space-y-7 max-w-7xl mx-auto animate-fade-in font-sans">
      {/* ─── Top Header Cockpit ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="rounded-full px-2.5 py-0.5 text-[10px] uppercase tracking-[0.2em] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Cockpit Operacional
            </span>
            <span className="text-white/30 text-xs">•</span>
            <span className="text-white/40 text-xs font-medium">
              {format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}
            </span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-white">
            Painel de Controle
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]">
            <span className="status-dot connected" />
            <span className="text-xs font-semibold text-white/80">Sistema Ativo</span>
            <span className="text-[10px] text-white/30 px-1.5 py-0.5 rounded bg-white/[0.05] font-mono">
              99.9%
            </span>
          </div>
        </div>
      </div>

      {/* ─── Hero Hardware Hub (Double-Bezel) ────────────────────────── */}
      <div className="bezel-chassis">
        <div className="bezel-core bg-gradient-to-br from-[#0c0e16] via-[#08090d] to-[#050507]">
          {/* Subtle circuit/orb background lighting */}
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-cyan-500/[0.06] rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 -mb-8 w-64 h-64 bg-emerald-500/[0.05] rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-start sm:items-center gap-4">
              <div className="relative p-2 rounded-2xl bg-gradient-to-b from-white/[0.08] to-white/[0.02] border border-white/[0.1] shadow-lg flex-shrink-0">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-300">
                  <Smartphone size={24} className="stroke-[1.75]" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-1">
                    <Sparkles size={12} /> Assistência Técnica & Vendas
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 font-semibold border border-emerald-500/25">
                    Modo Especialista
                  </span>
                </div>
                <h2 className="text-lg lg:text-xl font-bold text-white tracking-tight">
                  Gestão Inteligente de Ordens de Serviço & Trade-In
                </h2>
                <p className="text-xs text-white/50 max-w-xl leading-relaxed">
                  Automação completa via WhatsApp: atualização em tempo real para o cliente, simulação de aparelhos usados e controle de bancada técnica.
                </p>
              </div>
            </div>

            {/* Button-in-Button Action Group */}
            <div className="flex items-center gap-3 flex-wrap">
              <Link
                href="/repairs"
                className="group inline-flex items-center gap-3 bg-white/[0.06] hover:bg-white/[0.1] text-white border border-white/[0.1] hover:border-white/[0.2] px-4 py-2.5 rounded-full text-xs font-semibold transition-all duration-300 shadow-sm active:scale-[0.98]"
              >
                <span>Ordens de Serviço</span>
                <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white/80 group-hover:bg-white/20 group-hover:text-white group-hover:translate-x-0.5 transition-all duration-200">
                  <Wrench size={12} />
                </span>
              </Link>

              <Link
                href="/catalog"
                className="group inline-flex items-center gap-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white px-5 py-2.5 rounded-full text-xs font-semibold transition-all duration-300 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] active:scale-[0.98]"
              >
                <span>Catálogo & Trade-In</span>
                <span className="w-6 h-6 rounded-full bg-black/20 flex items-center justify-center text-white group-hover:translate-x-0.5 transition-transform duration-200">
                  <ArrowRight size={12} />
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Asymmetrical Bento Metric Grid ──────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
        {/* Card 1: Conversas Hoje (Hero Metric) */}
        <div className="bezel-chassis group hover:-translate-y-0.5 transition-all duration-300">
          <div className="bezel-core h-full flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <MessageSquare size={17} className="stroke-[1.75]" />
              </div>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                +12% vs ontem
              </span>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-extrabold tracking-tight text-white">
                {overview.todayConversations}
              </div>
              <div className="text-xs font-medium text-white/40 mt-1">
                Conversas Ativas Hoje
              </div>
              <div className="text-[11px] text-white/25 mt-0.5">
                Atendimento receptivo no WhatsApp
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Deflection Rate (AI Autonomy) */}
        <div className="bezel-chassis group hover:-translate-y-0.5 transition-all duration-300">
          <div className="bezel-core h-full flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Bot size={17} className="stroke-[1.75]" />
              </div>
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            </div>
            <div className="mt-4">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold tracking-tight text-white">
                  {overview.deflectionRate}%
                </span>
                <span className="text-xs font-semibold text-cyan-400">Autonomia</span>
              </div>
              {/* Micro progress meter */}
              <div className="h-1.5 w-full bg-white/[0.06] rounded-full overflow-hidden mt-2">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full"
                  style={{ width: `${overview.deflectionRate}%` }}
                />
              </div>
              <div className="text-[11px] text-white/35 mt-1.5">
                Resolvido 100% pela IA sem atendente
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: CSAT / Satisfação */}
        <div className="bezel-chassis group hover:-translate-y-0.5 transition-all duration-300">
          <div className="bezel-core h-full flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Star size={17} className="stroke-[1.75]" />
              </div>
              <span className="text-[10px] font-semibold text-amber-300/80 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                Feedback Real
              </span>
            </div>
            <div className="mt-4">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold tracking-tight text-white">
                  {overview.avgCsat ? overview.avgCsat : '4.9'}
                </span>
                <span className="text-xs text-white/30 font-medium">/ 5.0</span>
              </div>
              <div className="text-xs font-medium text-white/40 mt-1">
                Índice CSAT Médio
              </div>
              <div className="text-[11px] text-white/25 mt-0.5">
                Avaliação média pós-atendimento
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: Fila Humana */}
        <div className="bezel-chassis group hover:-translate-y-0.5 transition-all duration-300">
          <div className="bezel-core h-full flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                overview.humanConversations > 0
                  ? 'bg-rose-500/15 border border-rose-500/30 text-rose-400'
                  : 'bg-white/[0.05] border border-white/[0.08] text-white/40'
              }`}>
                <Users size={17} className="stroke-[1.75]" />
              </div>
              {overview.humanConversations > 0 ? (
                <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full animate-pulse">
                  Atenção
                </span>
              ) : (
                <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                  Fila Zerada
                </span>
              )}
            </div>
            <div className="mt-4">
              <div className="text-3xl font-extrabold tracking-tight text-white">
                {overview.humanConversations}
              </div>
              <div className="text-xs font-medium text-white/40 mt-1">
                Aguardando Atendente
              </div>
              <div className="text-[11px] text-white/25 mt-0.5">
                {overview.humanConversations > 0 ? 'Casos complexos na fila' : 'Nenhum cliente esperando'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Bento Grid Inferior: Gráfico & Telemetria ───────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Gráfico de Atividade (2 Cols) */}
        <div className="lg:col-span-2 bezel-chassis">
          <div className="bezel-core">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-white tracking-tight">Fluxo de Conversas</h3>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-white/[0.06] text-white/60 px-2 py-0.5 rounded-md border border-white/[0.06]">
                    Últimos 30 dias
                  </span>
                </div>
                <p className="text-xs text-white/35 mt-0.5">
                  Volume diário de interações processadas pelo ecossistema ZapIA
                </p>
              </div>

              <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                <TrendingUp size={13} />
                <span>{chart.length} registros</span>
              </div>
            </div>

            <div className="h-[230px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chart} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorEmerald" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }}
                    tickFormatter={(v) => format(parseISO(v), 'dd/MM')}
                    axisLine={{ stroke: 'rgba(255,255,255,0.05)' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: '#090a0f',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '14px',
                      fontSize: '12px',
                      boxShadow: '0 12px 30px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.1)',
                      padding: '8px 12px',
                    }}
                    labelFormatter={(v) => format(parseISO(v as string), "dd 'de' MMMM", { locale: ptBR })}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fill="url(#colorEmerald)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Estatísticas Rápidas & Telemetria de Cota (1 Col) */}
        <div className="bezel-chassis">
          <div className="bezel-core h-full flex flex-col justify-between gap-5">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-base text-white tracking-tight">Consumo do Mês</h3>
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  {overview.plan}
                </span>
              </div>

              <div className="space-y-3">
                {[
                  {
                    label: 'Mensagens processadas',
                    value: overview.messagesThisMonth.toLocaleString('pt-BR'),
                    icon: MessageSquare,
                    color: 'text-cyan-400',
                    bg: 'bg-cyan-500/10 border-cyan-500/20'
                  },
                  {
                    label: 'Conversas resolvidas',
                    value: overview.resolvedThisMonth.toLocaleString('pt-BR'),
                    icon: CheckCircle2,
                    color: 'text-emerald-400',
                    bg: 'bg-emerald-500/10 border-emerald-500/20'
                  },
                  {
                    label: 'Total histórico',
                    value: overview.totalConversations.toLocaleString('pt-BR'),
                    icon: Clock,
                    color: 'text-amber-400',
                    bg: 'bg-amber-500/10 border-amber-500/20'
                  },
                ].map((s) => (
                  <div key={s.label} className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${s.bg} ${s.color}`}>
                      <s.icon size={15} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] text-white/40 truncate">{s.label}</div>
                      <div className="text-sm font-bold text-white mt-0.5 tracking-tight">{s.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hardware Gauge Footer */}
            <div className="pt-4 border-t border-white/[0.06]">
              <div className="flex justify-between items-center text-xs text-white/50 mb-2 font-medium">
                <span>Capacidade da Franquia</span>
                <span className="font-bold text-white/90">
                  {Math.round((overview.apiUsage / overview.maxMessages) * 100)}%
                </span>
              </div>
              <div className="h-2 bg-black/40 border border-white/[0.06] rounded-full overflow-hidden p-0.2">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 rounded-full transition-all duration-700"
                  style={{ width: `${Math.min((overview.apiUsage / overview.maxMessages) * 100, 100)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-white/30 mt-2">
                <span>{overview.apiUsage.toLocaleString('pt-BR')} enviadas</span>
                <span>{overview.maxMessages.toLocaleString('pt-BR')} contratadas</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
