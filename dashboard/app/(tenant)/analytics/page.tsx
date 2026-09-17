'use client'

import { useEffect, useState } from 'react'
import { BarChart3, Bot, Users, Star, MessageSquare, TrendingUp, CheckCircle } from 'lucide-react'
import { analyticsApi } from '@/lib/api'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { format, parseISO } from 'date-fns'

export default function AnalyticsPage() {
  const [overview, setOverview] = useState<any>(null)
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

  return (
    <div className="p-8 space-y-8 animate-fade-in max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold">Analytics & Relatórios</h1>
        <p className="text-white/40 text-sm mt-1">Métricas de performance do atendimento e inteligência artificial</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="stat-card">
          <div className="flex items-center justify-between text-white/40 text-xs">
            <span>Deflection Rate</span>
            <Bot size={15} className="text-brand-400" />
          </div>
          <div className="text-3xl font-bold">{overview?.deflectionRate}%</div>
          <div className="text-xs text-brand-400/80">Resolvidos 100% pela IA</div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between text-white/40 text-xs">
            <span>CSAT Médio</span>
            <Star size={15} className="text-yellow-400" />
          </div>
          <div className="text-3xl font-bold">{overview?.avgCsat ? `${overview.avgCsat}/5.0` : '—'}</div>
          <div className="text-xs text-white/30">Satisfação dos clientes</div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between text-white/40 text-xs">
            <span>Mensagens no Mês</span>
            <MessageSquare size={15} className="text-blue-400" />
          </div>
          <div className="text-3xl font-bold">{overview?.messagesThisMonth?.toLocaleString('pt-BR')}</div>
          <div className="text-xs text-white/30">Volume trafegado</div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between text-white/40 text-xs">
            <span>Resolvidas no Mês</span>
            <CheckCircle size={15} className="text-brand-400" />
          </div>
          <div className="text-3xl font-bold">{overview?.resolvedThisMonth?.toLocaleString('pt-BR')}</div>
          <div className="text-xs text-white/30">Total concluído</div>
        </div>
      </div>

      {/* Chart */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-semibold text-base">Evolução de Atendimentos</h2>
            <p className="text-xs text-white/30 mt-0.5">Volume diário nos últimos 30 dias</p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-brand-400 font-medium">
            <TrendingUp size={14} /> Em tempo real
          </div>
        </div>

        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={chart} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorGrad2" x1="0" y1="0" x2="0" y2="1">
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
            <Area type="monotone" dataKey="count" stroke="#25a45e" strokeWidth={2} fill="url(#colorGrad2)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
