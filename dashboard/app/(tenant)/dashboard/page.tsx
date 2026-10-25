'use client'

import { useEffect, useState } from 'react'
import {
  MessageSquare, Users, Zap, Star, TrendingUp,
  Bot, Clock, CheckCircle2,
  Smartphone, Sparkles, ArrowRight, Wrench, ShieldCheck,
  Activity, Plus, Search, Filter, Calendar, ChevronRight,
  Sliders, BatteryCharging, Check, Cpu, Phone
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
  const [activeTab, setActiveTab] = useState('bancada')
  const [activeFilter, setActiveFilter] = useState('todos')

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
          <div className="w-12 h-12 rounded-full border-2 border-black/10 border-t-[#18191B] animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-3.5 h-3.5 rounded-full bg-[#F5C518]" />
          </div>
        </div>
      </div>
    )
  }

  if (!overview) return null

  return (
    <div className="min-h-screen bg-[#E5E3DC] p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1400px] mx-auto animate-fade-in font-sans pb-28">
      {/* ─── Tablet Cockpit Header (Matching Visual Reference Top Bar) ─── */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        {/* Title & Close / Home Icon */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white shadow-tactile-pill border border-black/[0.05] flex items-center justify-center text-[#18191B] hover:bg-[#FAF9F6] transition-all cursor-pointer">
            <span className="text-xs font-black">✕</span>
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-[#18191B]">
              Bancada Inteligente
            </h1>
          </div>
        </div>

        {/* Top Pill Navigation Tabs (Exact Reference Style: Treatment Dynamics, Visits, etc.) */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-thin py-1">
          {[
            { id: 'bancada', label: 'Ordens de Serviço', icon: Wrench, count: '14' },
            { id: 'tradein', label: 'Trade-In & Vendas', icon: Smartphone, count: '6' },
            { id: 'whatsapp', label: 'Atendimento WhatsApp', icon: MessageSquare, count: 'Live' },
            { id: 'ia', label: 'Inteligência IA', icon: Bot, count: `${overview.deflectionRate}%` },
            { id: 'analytics', label: 'Telemetria', icon: Activity },
          ].map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 whitespace-nowrap shadow-tactile-pill ${
                  isActive
                    ? 'bg-[#18191B] text-white shadow-tactile-dark'
                    : 'bg-white text-[#2E3036] hover:bg-[#FAF9F6] border border-black/[0.04]'
                }`}
              >
                <tab.icon size={13} className={isActive ? 'text-[#F5C518]' : 'text-[#787C87] group-hover:text-[#18191B]'} />
                <span>{tab.label}</span>
                {tab.count && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive
                        ? 'bg-white/20 text-[#F5C518]'
                        : 'bg-[#DDD9CE] text-[#332F26]'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* ─── Vitals & Technician Hero Row (Matching Reference Profile & Numbers) ─── */}
      <div className="card !p-6 lg:!p-7">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Technician Profile Card (Left side from photo) */}
          <div className="flex items-center gap-4 bg-[#EFECE4] p-3 rounded-2xl border border-black/[0.03] flex-shrink-0">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-[#18191B] text-white flex items-center justify-center font-black text-xl shadow-sm">
                ⚡
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#10B981] border-2 border-white" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-[#888C95] uppercase tracking-wider">
                Técnico Responsável
              </div>
              <div className="text-sm font-extrabold text-[#18191B]">
                Bancada Master
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white font-semibold text-[#18191B] border border-black/[0.04]">
                  Especialista Apple/Android
                </span>
                <span className="text-[10px] text-[#F5C518] font-bold">★ 4.9</span>
              </div>
            </div>
          </div>

          {/* Vitals Telemetry Row (Hypertension / 89 bpm / 100/67 / 98% / 36.8°C in photo) */}
          <div className="flex-1 grid grid-cols-2 sm:grid-cols-5 gap-4 lg:gap-6 border-y lg:border-y-0 lg:border-x border-black/[0.06] py-3 lg:py-0 lg:px-6">
            <div>
              <div className="text-[10px] font-bold text-[#888C95] uppercase tracking-wider">
                Diagnóstico Geral
              </div>
              <div className="text-lg lg:text-xl font-black text-[#18191B] mt-1 tracking-tight">
                Bancada Ativa
              </div>
              <div className="text-[11px] text-[#787C87] mt-0.5">Operação Normal</div>
            </div>

            <div>
              <div className="text-[10px] font-bold text-[#888C95] uppercase tracking-wider">
                OS em Andamento
              </div>
              <div className="text-lg lg:text-xl font-black text-[#18191B] mt-1 tracking-tight flex items-baseline gap-1">
                <span>{overview.todayConversations + 8}</span>
                <span className="text-xs font-semibold text-[#787C87]">aparelhos</span>
              </div>
              <div className="text-[11px] text-[#10B981] font-semibold mt-0.5">+12% vs ontem</div>
            </div>

            <div>
              <div className="text-[10px] font-bold text-[#888C95] uppercase tracking-wider">
                Faturamento Estimado
              </div>
              <div className="text-lg lg:text-xl font-black text-[#18191B] mt-1 tracking-tight">
                R$ 14.850
              </div>
              <div className="text-[11px] text-[#787C87] mt-0.5">Mês vigente</div>
            </div>

            <div>
              <div className="text-[10px] font-bold text-[#888C95] uppercase tracking-wider">
                Autonomia IA WhatsApp
              </div>
              <div className="text-lg lg:text-xl font-black text-[#18191B] mt-1 tracking-tight flex items-baseline gap-1">
                <span>{overview.deflectionRate}%</span>
                <span className="text-xs font-semibold text-[#10B981]">resolvido</span>
              </div>
              <div className="text-[11px] text-[#787C87] mt-0.5">Sem fila humana</div>
            </div>

            <div>
              <div className="text-[10px] font-bold text-[#888C95] uppercase tracking-wider">
                Tempo Médio de Bancada
              </div>
              <div className="text-lg lg:text-xl font-black text-[#18191B] mt-1 tracking-tight flex items-baseline gap-1">
                <span>38</span>
                <span className="text-xs font-semibold text-[#787C87]">min</span>
              </div>
              <div className="text-[11px] text-[#10B981] font-semibold mt-0.5">-8 min vs meta</div>
            </div>
          </div>

          {/* Quick Action Pill */}
          <div className="flex lg:flex-col gap-2 flex-shrink-0">
            <Link
              href="/repairs"
              className="inline-flex items-center justify-center gap-2 bg-[#18191B] hover:bg-black text-white px-5 py-2.5 rounded-full text-xs font-bold shadow-tactile-dark transition-all active:scale-[0.98]"
            >
              <Plus size={14} className="text-[#F5C518]" /> Nova Ordem
            </Link>
            <Link
              href="/catalog"
              className="inline-flex items-center justify-center gap-2 bg-white hover:bg-[#FAF9F6] text-[#1C1D21] border border-black/[0.08] px-4 py-2 rounded-full text-xs font-semibold shadow-tactile-pill transition-all active:scale-[0.98]"
            >
              Simular Trade-In
            </Link>
          </div>
        </div>

        {/* Sub-row Filters (Pills below Vitals: Office Visits, Medications, Labs, etc. in photo) */}
        <div className="flex items-center gap-2 mt-6 pt-5 border-t border-black/[0.05] overflow-x-auto scrollbar-thin">
          <div className="w-8 h-8 rounded-full bg-[#EFECE4] flex items-center justify-center text-[#555962] flex-shrink-0">
            <Sliders size={14} />
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
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap shadow-sm ${
                  isSelected
                    ? 'bg-[#18191B] text-white shadow-tactile-dark'
                    : 'bg-[#EFECE4] hover:bg-white text-[#555962] hover:text-[#18191B] border border-black/[0.03]'
                }`}
              >
                {f.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* ─── The Signature Connected Timeline Flow (Centerpiece from Photo) ─── */}
      <div className="relative card !p-6 lg:!p-8 overflow-hidden">
        {/* Subtle background connecting line across the top */}
        <div className="absolute top-12 left-12 right-12 h-0.5 bg-[#DDD9CE] pointer-events-none hidden md:block" />

        {/* Milestone Bar Header */}
        <div className="flex items-center justify-between mb-8 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[#18191B] text-white">
                Fluxo da Bancada
              </span>
              <span className="text-xs text-[#888C95]">• Jornada Operacional do Aparelho</span>
            </div>
            <h2 className="text-xl font-black text-[#18191B] mt-1 tracking-tight">
              Linha do Tempo de Reparos & Triagem
            </h2>
          </div>

          {/* Black '+' Circle Button (Signature from photo) */}
          <Link
            href="/repairs"
            className="w-10 h-10 rounded-full bg-[#18191B] text-white flex items-center justify-center shadow-tactile-dark hover:scale-105 active:scale-95 transition-all"
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
                <span className="text-xs font-extrabold text-[#18191B]">Hoje • 09:45</span>
                <span className="text-[11px] text-[#888C95] ml-2">Triagem & Entrada</span>
              </div>
            </div>

            {/* Spare Part / Service Capsule Pill (Aspirin x2 style from photo) */}
            <div className="inline-flex items-center gap-2.5 bg-[#EFECE4] px-4 py-2 rounded-full border border-black/[0.04] shadow-sm">
              <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-[#18191B]">
                <Cpu size={12} />
              </div>
              <span className="text-xs font-bold text-[#1C1D21]">Display OLED iPhone 14 Pro</span>
              <span className="text-[11px] font-extrabold text-[#888C95] bg-white px-2 py-0.2 rounded-full">x1</span>
            </div>

            {/* Telemetry Card: Pressão & Teste de Touch (Blood Pressure Card from photo) */}
            <div className="card-clay !p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-extrabold text-[#18191B]">Teste de Pressão & Touch</span>
                  <div className="text-[10px] text-[#888C95]">Sexta-feira • 10:15</div>
                </div>
                {/* Black Charcoal Badge (180/120 from photo) */}
                <div className="bg-[#18191B] text-white text-xs font-black px-3 py-1 rounded-full shadow-sm">
                  180 / 120 kPa
                </div>
              </div>

              {/* Graphic curve illustration */}
              <div className="h-10 w-full flex items-center justify-center bg-white/70 rounded-xl overflow-hidden px-2 border border-black/[0.03]">
                <svg className="w-full h-8" viewBox="0 0 200 30" fill="none">
                  <path
                    d="M 0 15 Q 40 5, 80 15 T 160 12 T 200 20"
                    stroke="#F5C518"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <circle cx="80" cy="15" r="3.5" fill="#18191B" />
                  <circle cx="160" cy="12" r="3.5" fill="#18191B" />
                </svg>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-[#787C87]">Média de calibração: <strong className="text-[#18191B]">160/110</strong></span>
                <span className="text-[#10B981] font-extrabold bg-white px-2 py-0.5 rounded-full border border-black/[0.04]">
                  +10% touch
                </span>
              </div>
            </div>

            {/* Bottom Card: Sintomas & Defeito Relatado (Symptoms Card from photo) */}
            <div className="card-clay !p-4 flex items-center justify-between">
              <div>
                <span className="text-xs font-extrabold text-[#18191B]">Sintomas & Danos</span>
                <div className="text-xs text-[#555962] mt-0.5">Vidro frontal trincado • Toque fantasma</div>
              </div>
              <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-[#18191B] font-bold text-sm shadow-sm">
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
                <span className="text-xs font-extrabold text-[#18191B]">Hoje • 14:30</span>
                <span className="text-[11px] text-[#888C95] ml-2">Execução em Bancada</span>
              </div>
            </div>

            {/* Stacked Spare Parts Pills (bisoprolol & Aspirin from photo) */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="inline-flex items-center gap-2 bg-[#18191B] text-white px-3.5 py-1.5 rounded-full text-xs font-bold shadow-tactile-dark">
                <BatteryCharging size={13} className="text-[#F5C518]" />
                <span>Bateria 5000mAh S23</span>
                <span className="text-[10px] bg-white/20 text-[#F5C518] px-1.5 rounded-full">x1</span>
              </div>
              <div className="inline-flex items-center gap-2 bg-[#EFECE4] text-[#1C1D21] px-3.5 py-1.5 rounded-full text-xs font-bold border border-black/[0.04]">
                <Cpu size={13} />
                <span>Conector Carga USB-C</span>
                <span className="text-[10px] bg-white text-[#888C95] px-1.5 rounded-full">x1</span>
              </div>
            </div>

            {/* Telemetry Card: Desempenho de Carga (Blood Pressure Card from photo) */}
            <div className="card-clay !p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-extrabold text-[#18191B]">Taxa de Carga & Térmica</span>
                  <div className="text-[10px] text-[#888C95]">Quinta-feira • 15:00</div>
                </div>
                {/* Black Charcoal Badge (135/92 from photo) */}
                <div className="bg-[#18191B] text-white text-xs font-black px-3 py-1 rounded-full shadow-sm">
                  135 / 92 mA
                </div>
              </div>

              {/* Graphic curve illustration */}
              <div className="h-10 w-full flex items-center justify-center bg-white/70 rounded-xl overflow-hidden px-2 border border-black/[0.03]">
                <svg className="w-full h-8" viewBox="0 0 200 30" fill="none">
                  <path
                    d="M 0 20 Q 50 10, 100 18 T 170 12 T 200 15"
                    stroke="#18191B"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <circle cx="100" cy="18" r="3.5" fill="#F5C518" />
                  <circle cx="170" cy="12" r="3.5" fill="#F5C518" />
                </svg>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-[#787C87]">Consumo médio: <strong className="text-[#18191B]">130 mA</strong></span>
                <span className="text-[#10B981] font-extrabold bg-white px-2 py-0.5 rounded-full border border-black/[0.04]">
                  -20°C dissipação
                </span>
              </div>
            </div>

            {/* Bottom Card: ECG de Bancada / Telemetria (ECG Card from photo) */}
            <div className="card-clay !p-4 flex items-center justify-between">
              <div>
                <span className="text-xs font-extrabold text-[#18191B]">ECG de Componentes</span>
                <div className="text-xs text-[#555962] mt-0.5">Alto-falante • Face ID • Microfone OK</div>
              </div>
              {/* ECG Waveform Graphic (from photo) */}
              <div className="w-24 h-7 bg-white rounded-lg flex items-center justify-center px-1 border border-black/[0.03]">
                <svg className="w-full h-5" viewBox="0 0 100 20" fill="none">
                  <path
                    d="M 0 10 L 25 10 L 30 2 L 35 18 L 40 10 L 60 10 L 65 5 L 70 15 L 75 10 L 100 10"
                    stroke="#18191B"
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
                <h3 className="font-extrabold text-base text-[#18191B] tracking-tight">
                  Fluxo de Atendimento & Conversas
                </h3>
                <span className="text-[10px] font-extrabold uppercase tracking-wider bg-[#EFECE4] text-[#18191B] px-2.5 py-0.5 rounded-full border border-black/[0.04]">
                  30 dias
                </span>
              </div>
              <p className="text-xs text-[#787C87] mt-0.5">
                Volume de interações processadas automaticamente no WhatsApp
              </p>
            </div>

            <div className="flex items-center gap-1.5 text-[#18191B] text-xs font-bold bg-[#EFECE4] border border-black/[0.04] px-3.5 py-1 rounded-full shadow-sm">
              <TrendingUp size={13} className="text-[#F5C518]" />
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
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#787C87', fontSize: 11, fontWeight: 600 }}
                  tickFormatter={(v) => format(parseISO(v), 'dd/MM')}
                  axisLine={{ stroke: 'rgba(0,0,0,0.06)' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#787C87', fontSize: 11, fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: '#18191B',
                    color: '#FFFFFF',
                    border: 'none',
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
                  stroke="#18191B"
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
              <h3 className="font-extrabold text-base text-[#18191B] tracking-tight">
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
                <div key={s.label} className="p-3 rounded-2xl bg-[#EFECE4] border border-black/[0.03] flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-[#18191B] shadow-sm">
                    <s.icon size={15} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] text-[#787C87] truncate">{s.label}</div>
                    <div className="text-sm font-black text-[#18191B] mt-0.5 tracking-tight">{s.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Meter Footer */}
          <div className="pt-4 border-t border-black/[0.05]">
            <div className="flex justify-between items-center text-xs text-[#555962] mb-2 font-semibold">
              <span>Capacidade Operacional</span>
              <span className="font-black text-[#18191B]">
                {Math.round((overview.apiUsage / overview.maxMessages) * 100)}%
              </span>
            </div>
            <div className="h-2 bg-[#DDD9CE] rounded-full overflow-hidden p-0.2">
              <div
                className="h-full bg-[#18191B] rounded-full transition-all duration-700"
                style={{ width: `${Math.min((overview.apiUsage / overview.maxMessages) * 100, 100)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-[#787C87] mt-2 font-medium">
              <span>{overview.apiUsage.toLocaleString('pt-BR')} enviadas</span>
              <span>{overview.maxMessages.toLocaleString('pt-BR')} contratadas</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Floating Bottom Dock (Signature Element from Reference Photo) ─── */}
      <div className="floating-dock">
        {/* Calendar Scrubber */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-bold text-white">
            <Calendar size={13} className="text-[#F5C518]" />
            <span>2025</span>
          </div>

          {['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago'].map((month, idx) => {
            const isCurrent = month === 'Ago'
            return (
              <button
                key={month}
                className={`text-xs px-2 sm:px-2.5 py-1 rounded-full transition-all flex items-center gap-1 font-semibold ${
                  isCurrent
                    ? 'bg-white text-[#18191B] font-extrabold shadow-sm'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <span>{month}</span>
                {isCurrent && (
                  <span className="w-4 h-4 rounded-full bg-[#F5C518] text-[#18191B] text-[9px] font-black flex items-center justify-center">
                    6
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Separator */}
        <div className="h-4 w-px bg-white/20 hidden sm:block" />

        {/* Quick Action Button inside Dock */}
        <Link
          href="/inbox"
          className="hidden sm:inline-flex items-center gap-2 bg-[#F5C518] hover:bg-[#FFE033] text-[#18191B] font-extrabold px-4 py-1.5 rounded-full text-xs shadow-sm transition-all"
        >
          <MessageSquare size={13} />
          <span>Ver WhatsApp Live</span>
        </Link>
      </div>
    </div>
  )
}
