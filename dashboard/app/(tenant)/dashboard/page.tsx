'use client'

import { useEffect, useState } from 'react'
import {
  MessageSquare, TrendingUp,
  Clock, CheckCircle2,
  Smartphone, Plus, Sliders,
  BatteryCharging, Cpu
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

const DEFAULT_OVERVIEW: Overview = {
  totalConversations: 142,
  todayConversations: 8,
  humanConversations: 2,
  resolvedThisMonth: 128,
  deflectionRate: 89,
  avgCsat: '4.9',
  messagesThisMonth: 540,
  apiUsage: 540,
  maxMessages: 2000,
  plan: 'PRO'
}

export default function DashboardPage() {
  const [overview, setOverview] = useState<Overview>(DEFAULT_OVERVIEW)
  const [chart, setChart] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('todos')

  useEffect(() => {
    Promise.all([analyticsApi.overview(), analyticsApi.conversationsChart()])
      .then(([o, c]) => {
        if (o?.data) setOverview(o.data)
        if (c?.data) setChart(c.data)
      })
      .catch((err) => {
        console.warn('Usando dados de telemetria da bancada:', err)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-2 border-black/10 border-t-[#232528] animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-3.5 h-3.5 rounded-full bg-[#F5C518]" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1500px] mx-auto animate-fade-in font-sans">
      {/* ─── Vitals & Technician Hero Card (Medical Tablet Ergonomics from Photo) ─── */}
      <div className="card">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Technician Profile Card (Left side from photo) */}
          <div className="flex items-center gap-4 bg-[#DAD6C9]/80 p-3.5 rounded-2xl border border-black/[0.04] flex-shrink-0">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-[#232528]/85 text-white backdrop-blur-sm border border-white/10 flex items-center justify-center font-black text-xl shadow-sm">
                ⚡
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#10B981] border-2 border-[#E6E3D8]" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-[#797D8A] uppercase tracking-wider">
                Técnico Responsável
              </div>
              <div className="text-sm font-extrabold text-[#1C1D21]">
                Bancada Master
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white font-semibold text-[#1C1D21] border border-black/[0.04] shadow-sm">
                  Especialista Apple/Android
                </span>
                <span className="text-[10px] text-[#854D0E] bg-[#F5C518] px-1.5 py-0.2 rounded-full font-extrabold">★ 4.9</span>
              </div>
            </div>
          </div>

          {/* Vitals Telemetry Row (Hypertension / 89 bpm / 100/67 / 98% / 36.8°C in photo) */}
          <div className="flex-1 grid grid-cols-2 sm:grid-cols-5 gap-4 lg:gap-6 border-y lg:border-y-0 lg:border-x border-[#CAC5B7]/70 py-3 lg:py-0 lg:px-6">
            <div>
              <div className="text-[10px] font-bold text-[#797D8A] uppercase tracking-wider">
                Diagnóstico Geral
              </div>
              <div className="text-lg lg:text-xl font-black text-[#1C1D21] mt-1 tracking-tight">
                Bancada Ativa
              </div>
              <div className="text-[11px] text-[#5F636E] mt-0.5">Operação Normal</div>
            </div>

            <div>
              <div className="text-[10px] font-bold text-[#797D8A] uppercase tracking-wider">
                OS em Andamento
              </div>
              <div className="text-lg lg:text-xl font-black text-[#1C1D21] mt-1 tracking-tight flex items-baseline gap-1">
                <span>{overview.todayConversations + 8}</span>
                <span className="text-xs font-semibold text-[#797D8A]">aparelhos</span>
              </div>
              <div className="text-[11px] text-[#10B981] font-semibold mt-0.5">+12% vs ontem</div>
            </div>

            <div>
              <div className="text-[10px] font-bold text-[#797D8A] uppercase tracking-wider">
                Faturamento Estimado
              </div>
              <div className="text-lg lg:text-xl font-black text-[#1C1D21] mt-1 tracking-tight">
                R$ 14.850
              </div>
              <div className="text-[11px] text-[#5F636E] mt-0.5">Mês vigente</div>
            </div>

            <div>
              <div className="text-[10px] font-bold text-[#797D8A] uppercase tracking-wider">
                Autonomia IA WhatsApp
              </div>
              <div className="text-lg lg:text-xl font-black text-[#1C1D21] mt-1 tracking-tight flex items-baseline gap-1">
                <span>{overview.deflectionRate}%</span>
                <span className="text-xs font-semibold text-[#10B981]">resolvido</span>
              </div>
              <div className="text-[11px] text-[#5F636E] mt-0.5">Sem fila humana</div>
            </div>

            <div>
              <div className="text-[10px] font-bold text-[#797D8A] uppercase tracking-wider">
                Tempo Médio Bancada
              </div>
              <div className="text-lg lg:text-xl font-black text-[#1C1D21] mt-1 tracking-tight flex items-baseline gap-1">
                <span>38</span>
                <span className="text-xs font-semibold text-[#797D8A]">min</span>
              </div>
              <div className="text-[11px] text-[#10B981] font-semibold mt-0.5">-8 min vs meta</div>
            </div>
          </div>

          {/* Quick Action Buttons (White for secondary, Translucent charcoal for primary) */}
          <div className="flex lg:flex-col gap-2 flex-shrink-0">
            <Link
              href="/repairs"
              className="inline-flex items-center justify-center gap-2 bg-[#232528]/85 hover:bg-[#1A1C1E]/95 text-white px-5 py-2.5 rounded-full text-xs font-bold shadow-tactile-dark backdrop-blur-md border border-white/10 transition-all active:scale-[0.98]"
            >
              <Plus size={14} className="text-[#F5C518]" /> Nova Ordem
            </Link>
            <Link
              href="/catalog"
              className="inline-flex items-center justify-center gap-2 bg-white hover:bg-[#FAF9F6] text-[#1C1D21] border border-black/[0.05] px-4 py-2 rounded-full text-xs font-semibold shadow-tactile-pill transition-all active:scale-[0.98]"
            >
              Simular Trade-In
            </Link>
          </div>
        </div>

        {/* Sub-row Filters (White pills for options, Translucent charcoal for active) */}
        <div className="flex items-center gap-2 mt-6 pt-5 border-t border-[#CAC5B7]/60 overflow-x-auto scrollbar-thin">
          <div className="w-8 h-8 rounded-full bg-white shadow-tactile-pill border border-black/[0.04] flex items-center justify-center text-[#524D41] flex-shrink-0">
            <Sliders size={13} />
          </div>
          {[
            { id: 'todos', label: 'Todas as Ordens' },
            { id: 'analise', label: 'Triagem & Diagnóstico' },
            { id: 'pecas', label: 'Aguardando Peças' },
            { id: 'bancada', label: 'Na Bancada / Conserto' },
            { id: 'prontos', label: 'Prontos para Retirada' },
            { id: 'tradein', label: 'Aparelhos Usados / Venda' },
          ].map((f) => {
            const isSelected = activeFilter === f.id
            return (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                  isSelected
                    ? 'bg-[#232528]/85 text-white backdrop-blur-md border border-white/10 shadow-tactile-dark'
                    : 'bg-white hover:bg-[#FAF9F6] text-[#2E3036] border border-black/[0.04] shadow-tactile-pill'
                }`}
              >
                {f.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* ─── The Signature Connected Timeline Flow (Matching 2.jpg) ─── */}
      <div className="relative card overflow-hidden">
        {/* Subtle connecting line across the top */}
        <div className="absolute top-12 left-12 right-12 h-0.5 bg-[#CAC5B7]/70 pointer-events-none hidden md:block" />

        {/* Milestone Bar Header */}
        <div className="flex items-center justify-between mb-8 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[#232528]/85 text-white backdrop-blur-sm border border-white/10">
                Fluxo da Bancada
              </span>
              <span className="text-xs text-[#797D8A]">• Jornada Operacional do Aparelho</span>
            </div>
            <h2 className="text-xl font-black text-[#1C1D21] mt-1 tracking-tight">
              Linha do Tempo de Reparos & Triagem
            </h2>
          </div>

          {/* Translucent Charcoal '+' Circle Button (Signature from photo) */}
          <Link
            href="/repairs"
            className="w-10 h-10 rounded-full bg-[#232528]/85 text-white backdrop-blur-md border border-white/10 flex items-center justify-center shadow-tactile-dark hover:scale-105 active:scale-95 transition-all"
            title="Adicionar nova ordem"
          >
            <Plus size={18} />
          </Link>
        </div>

        {/* Connected Stages Container */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 relative z-10">
          {/* ── STAGE 1: TRIAGEM & ENTRADA (Aug / 1 Week style) ── */}
          <div className="space-y-4">
            {/* Stage Milestone Header with Yellow Clipboard Node */}
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-[#F5C518] text-[#18191B] flex items-center justify-center font-bold text-xs shadow-sm">
                📋
              </div>
              <div>
                <span className="text-xs font-extrabold text-[#1C1D21]">Hoje • 09:45</span>
                <span className="text-[11px] text-[#797D8A] ml-2">Triagem & Entrada</span>
              </div>
            </div>

            {/* Spare Part / Service Capsule White Pill (Aspirin x2 style from photo) */}
            <div className="inline-flex items-center gap-2.5 bg-white px-4 py-2 rounded-full border border-black/[0.04] shadow-tactile-pill">
              <div className="w-5 h-5 rounded-full bg-[#DAD6C9] flex items-center justify-center text-[#1C1D21]">
                <Cpu size={12} />
              </div>
              <span className="text-xs font-bold text-[#1C1D21]">Display OLED iPhone 14 Pro</span>
              <span className="text-[11px] font-extrabold text-[#797D8A] bg-[#DAD6C9] px-2 py-0.2 rounded-full">x1</span>
            </div>

            {/* Telemetry Card: Pressão & Teste de Touch (Blood Pressure Card from photo) */}
            <div className="card-clay space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-extrabold text-[#1C1D21]">Teste de Pressão & Touch</span>
                  <div className="text-[10px] text-[#797D8A]">Sexta-feira • 10:15</div>
                </div>
                {/* Translucent Charcoal Badge (180/120 from photo) */}
                <div className="bg-[#232528]/85 text-white text-xs font-black px-3 py-1 rounded-full backdrop-blur-sm border border-white/10 shadow-sm">
                  180 / 120 kPa
                </div>
              </div>

              {/* Graphic curve illustration */}
              <div className="h-10 w-full flex items-center justify-center bg-white/80 rounded-xl overflow-hidden px-2 border border-black/[0.03] shadow-inner">
                <svg className="w-full h-8" viewBox="0 0 200 30" fill="none">
                  <path
                    d="M 0 15 Q 40 5, 80 15 T 160 12 T 200 20"
                    stroke="#F5C518"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <circle cx="80" cy="15" r="3.5" fill="#232528" />
                  <circle cx="160" cy="12" r="3.5" fill="#232528" />
                </svg>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-[#5F636E]">Média calibração: <strong className="text-[#1C1D21]">160/110</strong></span>
                <span className="text-[#10B981] font-extrabold bg-white px-2 py-0.5 rounded-full border border-black/[0.04] shadow-sm">
                  +10% touch
                </span>
              </div>
            </div>

            {/* Bottom Card: Sintomas & Defeito Relatado (Symptoms Card from photo) */}
            <div className="card-clay flex items-center justify-between">
              <div>
                <span className="text-xs font-extrabold text-[#1C1D21]">Sintomas & Danos</span>
                <div className="text-xs text-[#524D41] mt-0.5">Vidro frontal trincado • Toque fantasma</div>
              </div>
              <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-[#1C1D21] font-bold text-sm shadow-tactile-pill border border-black/[0.04]">
                📱
              </div>
            </div>
          </div>

          {/* ── STAGE 2: BANCADA & REPARO (Sep / 1 Week style) ── */}
          <div className="space-y-4">
            {/* Stage Milestone Header with Yellow Flash Node */}
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-[#F5C518] text-[#18191B] flex items-center justify-center font-bold text-xs shadow-sm">
                ⚡
              </div>
              <div>
                <span className="text-xs font-extrabold text-[#1C1D21]">Hoje • 14:30</span>
                <span className="text-[11px] text-[#797D8A] ml-2">Execução em Bancada</span>
              </div>
            </div>

            {/* Stacked Spare Parts Pills (Translucent Charcoal & White from photo) */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="inline-flex items-center gap-2 bg-[#232528]/85 text-white px-3.5 py-1.5 rounded-full text-xs font-bold backdrop-blur-sm border border-white/10 shadow-tactile-dark">
                <BatteryCharging size={13} className="text-[#F5C518]" />
                <span>Bateria 5000mAh S23</span>
                <span className="text-[10px] bg-white/20 text-[#F5C518] px-1.5 rounded-full">x1</span>
              </div>
              <div className="inline-flex items-center gap-2 bg-white text-[#1C1D21] px-3.5 py-1.5 rounded-full text-xs font-bold border border-black/[0.04] shadow-tactile-pill">
                <Cpu size={13} />
                <span>Conector Carga USB-C</span>
                <span className="text-[10px] bg-[#DAD6C9] text-[#524D41] px-1.5 rounded-full">x1</span>
              </div>
            </div>

            {/* Telemetry Card: Desempenho de Carga (Blood Pressure Card from photo) */}
            <div className="card-clay space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-extrabold text-[#1C1D21]">Taxa de Carga & Térmica</span>
                  <div className="text-[10px] text-[#797D8A]">Quinta-feira • 15:00</div>
                </div>
                {/* Translucent Charcoal Badge (135/92 from photo) */}
                <div className="bg-[#232528]/85 text-white text-xs font-black px-3 py-1 rounded-full backdrop-blur-sm border border-white/10 shadow-sm">
                  135 / 92 mA
                </div>
              </div>

              {/* Graphic curve illustration */}
              <div className="h-10 w-full flex items-center justify-center bg-white/80 rounded-xl overflow-hidden px-2 border border-black/[0.03] shadow-inner">
                <svg className="w-full h-8" viewBox="0 0 200 30" fill="none">
                  <path
                    d="M 0 20 Q 50 10, 100 18 T 170 12 T 200 15"
                    stroke="#232528"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <circle cx="100" cy="18" r="3.5" fill="#F5C518" />
                  <circle cx="170" cy="12" r="3.5" fill="#F5C518" />
                </svg>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-[#5F636E]">Consumo médio: <strong className="text-[#1C1D21]">130 mA</strong></span>
                <span className="text-[#10B981] font-extrabold bg-white px-2 py-0.5 rounded-full border border-black/[0.04] shadow-sm">
                  -20°C dissipação
                </span>
              </div>
            </div>

            {/* Bottom Card: ECG de Componentes (ECG Card from photo) */}
            <div className="card-clay flex items-center justify-between">
              <div>
                <span className="text-xs font-extrabold text-[#1C1D21]">ECG de Componentes</span>
                <div className="text-xs text-[#524D41] mt-0.5">Alto-falante • Face ID • Microfone OK</div>
              </div>
              {/* ECG Waveform Graphic (from photo) */}
              <div className="w-24 h-7 bg-white rounded-lg flex items-center justify-center px-1 border border-black/[0.04] shadow-sm">
                <svg className="w-full h-5" viewBox="0 0 100 20" fill="none">
                  <path
                    d="M 0 10 L 25 10 L 30 2 L 35 18 L 40 10 L 60 10 L 65 5 L 70 15 L 75 10 L 100 10"
                    stroke="#232528"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Real Data Bento: Atividade Recente & Telemetria ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico de Atividade (2 Cols) */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-[#1C1D21] tracking-tight">
                  Fluxo de Atendimento & Conversas
                </h3>
                <span className="text-[10px] font-extrabold uppercase tracking-wider bg-white text-[#1C1D21] px-2.5 py-0.5 rounded-full border border-black/[0.04] shadow-sm">
                  30 dias
                </span>
              </div>
              <p className="text-xs text-[#797D8A] mt-0.5">
                Volume de interações processadas automaticamente no WhatsApp
              </p>
            </div>

            <div className="flex items-center gap-1.5 text-[#1C1D21] text-xs font-bold bg-white border border-black/[0.04] px-3.5 py-1 rounded-full shadow-tactile-pill">
              <TrendingUp size={13} className="text-[#854D0E]" />
              <span>{chart.length} registros</span>
            </div>
          </div>

          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chart} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorYellow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F5C518" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#F5C518" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#797D8A', fontSize: 11, fontWeight: 600 }}
                  tickFormatter={(v) => format(parseISO(v), 'dd/MM')}
                  axisLine={{ stroke: 'rgba(0,0,0,0.08)' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#797D8A', fontSize: 11, fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: '#232528',
                    color: '#FFFFFF',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '16px',
                    fontSize: '12px',
                    fontWeight: 600,
                    boxShadow: '0 12px 30px rgba(0,0,0,0.25)',
                    padding: '8px 14px',
                  }}
                  labelFormatter={(v) => format(parseISO(v as string), "dd 'de' MMMM", { locale: ptBR })}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#232528"
                  strokeWidth={3}
                  fill="url(#colorYellow)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cota & Consumo Mensal (1 Col) */}
        <div className="card flex flex-col justify-between gap-5">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-base text-[#1C1D21] tracking-tight">
                Consumo da Franquia
              </h3>
              <span className="text-[10px] uppercase font-extrabold tracking-wider text-[#18191B] bg-[#F5C518] px-2.5 py-0.5 rounded-full shadow-sm">
                Plano {overview.plan}
              </span>
            </div>

            <div className="space-y-3">
              {[
                {
                  label: 'Mensagens processadas',
                  value: overview.messagesThisMonth.toLocaleString('pt-BR'),
                  icon: MessageSquare,
                },
                {
                  label: 'Conversas resolvidas',
                  value: overview.resolvedThisMonth.toLocaleString('pt-BR'),
                  icon: CheckCircle2,
                },
                {
                  label: 'Total histórico no banco',
                  value: overview.totalConversations.toLocaleString('pt-BR'),
                  icon: Clock,
                },
              ].map((s) => (
                <div key={s.label} className="p-3 rounded-2xl bg-[#DAD6C9]/75 border border-black/[0.03] flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-[#1C1D21] shadow-tactile-pill border border-black/[0.04]">
                    <s.icon size={15} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] text-[#797D8A] truncate">{s.label}</div>
                    <div className="text-sm font-black text-[#1C1D21] mt-0.5 tracking-tight">{s.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Meter Footer */}
          <div className="pt-4 border-t border-[#CAC5B7]/60">
            <div className="flex justify-between items-center text-xs text-[#524D41] mb-2 font-semibold">
              <span>Capacidade Operacional</span>
              <span className="font-black text-[#1C1D21]">
                {Math.round((overview.apiUsage / overview.maxMessages) * 100)}%
              </span>
            </div>
            <div className="h-2 bg-[#DAD6C9] rounded-full overflow-hidden p-0.2">
              <div
                className="h-full bg-[#232528] rounded-full transition-all duration-700"
                style={{ width: `${Math.min((overview.apiUsage / overview.maxMessages) * 100, 100)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-[#797D8A] mt-2 font-medium">
              <span>{overview.apiUsage.toLocaleString('pt-BR')} enviadas</span>
              <span>{overview.maxMessages.toLocaleString('pt-BR')} contratadas</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
