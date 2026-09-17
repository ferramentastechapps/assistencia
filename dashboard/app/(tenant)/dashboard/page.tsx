'use client'

import { useEffect, useState } from 'react'
import {
  MessageSquare, Users, Zap, Star, TrendingUp,
  ArrowUpRight, Bot, Clock, CheckCircle2,
  Smartphone, Sparkles, ArrowRight
} from 'lucide-react'
import Link from 'next/link'
import { analyticsApi } from '@/lib/api'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'
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

const statCards = (data: Overview) => [
  {
    label: 'Conversas hoje',
    value: data.todayConversations,
    icon: MessageSquare,
    color: 'brand',
    trend: '+12%'
  },
  {
    label: 'Deflection Rate',
    value: `${data.deflectionRate}%`,
    icon: Bot,
    color: 'blue',
    trend: 'IA resolveu sozinha'
  },
  {
    label: 'CSAT médio',
    value: data.avgCsat ? `${data.avgCsat}/5` : '—',
    icon: Star,
    color: 'yellow',
    trend: 'satisfação dos clientes'
  },
  {
    label: 'Aguardando humano',
    value: data.humanConversations,
    icon: Users,
    color: 'red',
    trend: 'precisam de atenção'
  },
]

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
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!overview) return null

  return (
    <div className="p-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Visão geral</h1>
          <p className="text-white/40 text-sm mt-1">
            {format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}
          </p>
        </div>
        <div className="card px-4 py-2 flex items-center gap-2 text-sm">
          <div className="status-dot connected" />
          <span className="text-white/60">Sistema operacional</span>
        </div>
      </div>

      {/* Assistência Técnica & Vendas Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-cyan-500/25 bg-gradient-to-r from-surface-900 via-surface-900/90 to-cyan-950/40 p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 flex-shrink-0">
            <Smartphone size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1">
                <Sparkles size={12} /> Ecossistema Especialista
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold">
                Bancada & Loja Ativas
              </span>
            </div>
            <p className="text-sm font-semibold text-white mt-0.5">
              Assistência Técnica de Celulares & Venda de Smartphones
            </p>
            <p className="text-xs text-white/50">
              Controle de OS com notificação WhatsApp, tabela de orçamentos de telas e simulador de Trade-In de seminovos.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap flex-shrink-0">
          <Link
            href="/repairs"
            className="px-3.5 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 text-xs font-semibold transition-all flex items-center gap-1.5"
          >
            <Smartphone size={14} /> Ordens de Serviço
          </Link>
          <Link
            href="/catalog"
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-semibold shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-1.5"
          >
            Catálogo & Trade-In <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards(overview).map((s) => (
          <div key={s.label} className="stat-card group hover:border-white/10 transition-all">
            <div className="flex items-start justify-between">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                s.color === 'brand' ? 'bg-brand-500/15' :
                s.color === 'blue' ? 'bg-blue-500/15' :
                s.color === 'yellow' ? 'bg-yellow-500/15' :
                'bg-red-500/15'
              }`}>
                <s.icon size={18} className={
                  s.color === 'brand' ? 'text-brand-400' :
                  s.color === 'blue' ? 'text-blue-400' :
                  s.color === 'yellow' ? 'text-yellow-400' :
                  'text-red-400'
                } />
              </div>
              <ArrowUpRight size={16} className="text-white/20 group-hover:text-white/40 transition-colors" />
            </div>
            <div>
              <div className="text-3xl font-bold">{s.value}</div>
              <div className="text-sm text-white/40 mt-0.5">{s.label}</div>
              <div className="text-xs text-white/25 mt-1">{s.trend}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Chart + Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-semibold">Conversas por dia</h2>
              <p className="text-xs text-white/30 mt-0.5">Últimos 30 dias</p>
            </div>
            <div className="flex items-center gap-1.5 text-brand-400 text-xs font-medium">
              <TrendingUp size={14} />
              {chart.length} dias com dados
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chart} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#25a45e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#25a45e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis
                dataKey="date"
                tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }}
                tickFormatter={(v) => format(parseISO(v), 'dd/MM')}
              />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} />
              <Tooltip
                contentStyle={{ background: '#18181f', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, fontSize: 12 }}
                labelFormatter={(v) => format(parseISO(v as string), 'dd/MM/yyyy')}
              />
              <Area type="monotone" dataKey="count" stroke="#25a45e" strokeWidth={2} fill="url(#colorGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Quick stats */}
        <div className="card p-6 flex flex-col gap-5">
          <h2 className="font-semibold">Este mês</h2>
          
          {[
            { label: 'Mensagens trocadas', value: overview.messagesThisMonth.toLocaleString('pt-BR'), icon: MessageSquare },
            { label: 'Conversas resolvidas', value: overview.resolvedThisMonth.toLocaleString('pt-BR'), icon: CheckCircle2 },
            { label: 'Total de conversas', value: overview.totalConversations.toLocaleString('pt-BR'), icon: Clock },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-surface-700 flex items-center justify-center flex-shrink-0">
                <s.icon size={15} className="text-white/40" />
              </div>
              <div className="flex-1">
                <div className="text-xs text-white/30">{s.label}</div>
                <div className="font-semibold text-sm mt-0.5">{s.value}</div>
              </div>
            </div>
          ))}

          {/* Usage progress */}
          <div className="mt-auto pt-4 border-t border-white/[0.06]">
            <div className="flex justify-between text-xs text-white/30 mb-2">
              <span>Uso da API</span>
              <span>{Math.round((overview.apiUsage / overview.maxMessages) * 100)}%</span>
            </div>
            <div className="h-2 bg-surface-600 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-brand rounded-full"
                style={{ width: `${Math.min((overview.apiUsage / overview.maxMessages) * 100, 100)}%` }}
              />
            </div>
            <div className="text-xs text-white/20 mt-1.5">
              {overview.apiUsage.toLocaleString('pt-BR')} / {overview.maxMessages.toLocaleString('pt-BR')} mensagens
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
