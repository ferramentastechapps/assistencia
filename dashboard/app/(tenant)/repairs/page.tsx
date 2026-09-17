'use client'

import { useEffect, useState } from 'react'
import {
  Wrench, Plus, Search, Filter, Phone, CheckCircle2,
  Clock, AlertCircle, Send, Check, X, RefreshCw,
  Smartphone, DollarSign, Calendar, Shield, Trash2, Edit, ChevronRight
} from 'lucide-react'
import { repairsApi } from '@/lib/api'

interface RepairOrder {
  id: string
  orderNumber: string
  customerName: string
  customerPhone: string
  customerCpf?: string
  deviceBrand: string
  deviceModel: string
  deviceColor?: string
  deviceImei?: string
  reportedDefect: string
  technicalDiagnosis?: string
  status: string
  partsCost: number
  laborCost: number
  totalAmount: number
  warrantyDays: number
  estimatedDelivery?: string
  notes?: string
  paidAt?: string
  createdAt: string
}

interface RepairStats {
  total: number
  emBancada: number
  prontos: number
  entregues: number
  totalRevenue: number
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; border: string }> = {
  EM_ANALISE: { label: 'Em Análise', bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
  AGUARDANDO_APROVACAO: { label: 'Aguardando Aprovação', bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20' },
  APROVADO: { label: 'Aprovado', bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
  AGUARDANDO_PECA: { label: 'Aguardando Peça', bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
  EM_CONSERTO: { label: 'Em Conserto', bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20' },
  PRONTO: { label: 'Pronto p/ Retirada', bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  ENTREGUE: { label: 'Entregue / Concluído', bg: 'bg-zinc-500/10', text: 'text-zinc-400', border: 'border-zinc-500/20' },
  CANCELADO: { label: 'Cancelado', bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20' },
}

export default function RepairsPage() {
  const [orders, setOrders] = useState<RepairOrder[]>([])
  const [stats, setStats] = useState<RepairStats>({ total: 0, emBancada: 0, prontos: 0, entregues: 0, totalRevenue: 0 })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  
  // Modais
  const [isNewModalOpen, setIsNewModalOpen] = useState(false)
  const [statusModalOrder, setStatusModalOrder] = useState<RepairOrder | null>(null)
  const [newStatus, setNewStatus] = useState('PRONTO')
  const [notifyWhatsapp, setNotifyWhatsapp] = useState(true)
  const [customMessage, setCustomMessage] = useState('')
  const [savingStatus, setSavingStatus] = useState(false)

  // Formulário de Nova OS
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerCpf: '',
    deviceBrand: 'Apple',
    deviceModel: '',
    deviceColor: '',
    deviceImei: '',
    reportedDefect: '',
    technicalDiagnosis: '',
    partsCost: '',
    laborCost: '',
    warrantyDays: 90,
    estimatedDelivery: '',
  })
  const [savingOrder, setSavingOrder] = useState(false)

  const loadData = async () => {
    setLoading(true)
    try {
      const [resOrders, resStats] = await Promise.all([
        repairsApi.list({ status: statusFilter || undefined, search: search || undefined }),
        repairsApi.stats()
      ])
      setOrders(resOrders.data.orders || [])
      setStats(resStats.data || { total: 0, emBancada: 0, prontos: 0, entregues: 0, totalRevenue: 0 })
    } catch (err) {
      console.error('Erro ao carregar Ordens de Serviço:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [statusFilter])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    loadData()
  }

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingOrder(true)
    try {
      const payload = {
        ...formData,
        partsCost: Number(formData.partsCost) || 0,
        laborCost: Number(formData.laborCost) || 0,
        warrantyDays: Number(formData.warrantyDays) || 90,
      }
      await repairsApi.create(payload)
      setIsNewModalOpen(false)
      setFormData({
        customerName: '',
        customerPhone: '',
        customerCpf: '',
        deviceBrand: 'Apple',
        deviceModel: '',
        deviceColor: '',
        deviceImei: '',
        reportedDefect: '',
        technicalDiagnosis: '',
        partsCost: '',
        laborCost: '',
        warrantyDays: 90,
        estimatedDelivery: '',
      })
      await loadData()
    } catch (err: any) {
      alert('Erro ao criar Ordem de Serviço: ' + (err.response?.data?.message || err.message))
    } finally {
      setSavingOrder(false)
    }
  }

  const handleUpdateStatus = async () => {
    if (!statusModalOrder) return
    setSavingStatus(true)
    try {
      await repairsApi.updateStatus(statusModalOrder.id, newStatus, notifyWhatsapp, customMessage || undefined)
      setStatusModalOrder(null)
      await loadData()
    } catch (err: any) {
      alert('Erro ao alterar status: ' + (err.response?.data?.message || err.message))
    } finally {
      setSavingStatus(false)
    }
  }

  const formatCurrency = (val?: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0)
  }

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto overflow-y-auto h-full">
      {/* ─── Header ────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-brand-400 uppercase tracking-wider mb-1">
            <Wrench size={14} /> Bancada Técnica & Assistência
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Ordens de Serviço (OS)</h1>
          <p className="text-sm text-white/50 mt-0.5">Controle de reparos de smartphones, peças e avisos automáticos via WhatsApp</p>
        </div>
        <button
          onClick={() => setIsNewModalOpen(true)}
          className="btn-primary flex items-center justify-center gap-2 shrink-0 self-start sm:self-auto"
        >
          <Plus size={18} /> Nova Ordem de Serviço
        </button>
      </div>

      {/* ─── Metric Cards ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-5">
          <div className="flex items-center justify-between text-white/50 text-xs font-medium mb-2">
            <span>Total Cadastradas</span>
            <div className="w-7 h-7 rounded-lg bg-surface-800 flex items-center justify-center text-white/60">
              <Wrench size={14} />
            </div>
          </div>
          <div className="text-2xl font-bold">{stats.total}</div>
          <p className="text-[11px] text-white/40 mt-1">Todas as OS do mês</p>
        </div>

        <div className="card p-5 border-amber-500/20 bg-gradient-to-br from-amber-500/[0.04] to-transparent">
          <div className="flex items-center justify-between text-amber-400/80 text-xs font-medium mb-2">
            <span>Em Bancada</span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
              <Clock size={14} />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-400">{stats.emBancada}</div>
          <p className="text-[11px] text-white/40 mt-1">Análise, conserto ou peça</p>
        </div>

        <div className="card p-5 border-emerald-500/20 bg-gradient-to-br from-emerald-500/[0.04] to-transparent">
          <div className="flex items-center justify-between text-emerald-400/80 text-xs font-medium mb-2">
            <span>Pronto p/ Retirada</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <CheckCircle2 size={14} />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-400">{stats.prontos}</div>
          <p className="text-[11px] text-white/40 mt-1">Aguardando cliente vir buscar</p>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between text-white/50 text-xs font-medium mb-2">
            <span>Faturamento Pago</span>
            <div className="w-7 h-7 rounded-lg bg-surface-800 flex items-center justify-center text-white/60">
              <DollarSign size={14} />
            </div>
          </div>
          <div className="text-2xl font-bold text-brand-400">{formatCurrency(stats.totalRevenue)}</div>
          <p className="text-[11px] text-white/40 mt-1">Receita de reparos concluídos</p>
        </div>
      </div>

      {/* ─── Filtros e Busca ──────────────────────────────────────────────── */}
      <div className="card p-4 flex flex-col md:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por OS, cliente, telefone ou modelo..."
            className="w-full bg-surface-800 border border-white/[0.07] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-brand-500"
          />
        </form>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          <button
            onClick={() => setStatusFilter('')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              statusFilter === '' ? 'bg-brand-500 text-white shadow-glow-sm' : 'bg-surface-800 text-white/60 hover:text-white'
            }`}
          >
            Todos
          </button>
          {['EM_ANALISE', 'AGUARDANDO_PECA', 'EM_CONSERTO', 'PRONTO', 'ENTREGUE'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                statusFilter === st
                  ? 'bg-surface-700 text-white border border-white/20'
                  : 'bg-surface-800/80 text-white/60 hover:text-white'
              }`}
            >
              {STATUS_CONFIG[st]?.label || st}
            </button>
          ))}
          <button
            onClick={loadData}
            className="p-2 bg-surface-800 hover:bg-surface-700 text-white/60 hover:text-white rounded-lg transition-colors ml-auto"
            title="Recarregar"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* ─── Tabela de Ordens de Serviço ───────────────────────────────────── */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-white/40 flex flex-col items-center justify-center gap-2">
            <RefreshCw size={24} className="animate-spin text-brand-500" />
            <span>Carregando Ordens de Serviço...</span>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-white/40 flex flex-col items-center justify-center gap-2">
            <Wrench size={32} className="text-white/20" />
            <span className="text-base font-semibold text-white/70">Nenhuma OS encontrada</span>
            <p className="text-xs max-w-sm">Crie uma nova Ordem de Serviço para iniciar o fluxo técnico da bancada ou altere os filtros de busca.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-900/80 border-b border-white/[0.06] text-white/40 font-medium">
                <tr>
                  <th className="py-3 px-4">OS #</th>
                  <th className="py-3 px-4">Cliente & WhatsApp</th>
                  <th className="py-3 px-4">Aparelho</th>
                  <th className="py-3 px-4">Defeito Relatado</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Total</th>
                  <th className="py-3 px-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {orders.map((o) => {
                  const st = STATUS_CONFIG[o.status] || { label: o.status, bg: 'bg-surface-800', text: 'text-white/60', border: 'border-white/10' }
                  return (
                    <tr key={o.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="py-3 px-4 font-bold text-white/90">
                        {o.orderNumber}
                        <div className="text-[10px] text-white/40 font-normal">
                          {new Date(o.createdAt).toLocaleDateString('pt-BR')}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-white/90">{o.customerName}</div>
                        <a
                          href={`https://wa.me/55${o.customerPhone.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 text-[11px] text-emerald-400 hover:underline mt-0.5"
                        >
                          <Phone size={10} /> {o.customerPhone}
                        </a>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white/90 flex items-center gap-1.5">
                          <Smartphone size={13} className="text-brand-400" />
                          {o.deviceBrand} {o.deviceModel}
                        </div>
                        {o.deviceColor && <div className="text-[10px] text-white/40">Cor: {o.deviceColor}</div>}
                      </td>
                      <td className="py-3 px-4 max-w-[220px]">
                        <p className="truncate text-white/70" title={o.reportedDefect}>{o.reportedDefect}</p>
                        {o.technicalDiagnosis && (
                          <p className="text-[10px] text-white/40 truncate">Diag: {o.technicalDiagnosis}</p>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium border ${st.bg} ${st.text} ${st.border}`}>
                          {st.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-white/90">
                        {formatCurrency(o.totalAmount)}
                        <div className="text-[10px] text-white/40 font-normal">
                          {o.paidAt ? <span className="text-emerald-400">Pago</span> : 'Pendente'}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => {
                              setStatusModalOrder(o)
                              setNewStatus(o.status)
                              setCustomMessage(`Olá ${o.customerName}! Atualização da sua OS ${o.orderNumber} (${o.deviceBrand} ${o.deviceModel}): status alterado para `)
                            }}
                            className="p-1.5 bg-surface-800 hover:bg-brand-500/20 text-white/70 hover:text-brand-400 rounded-lg transition-colors"
                            title="Atualizar Status & Notificar WhatsApp"
                          >
                            <Send size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─── Modal: Nova Ordem de Serviço ──────────────────────────────────── */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="card w-full max-w-2xl p-6 bg-surface-900 border-white/[0.1] my-8">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-4 mb-5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center text-brand-400">
                  <Wrench size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Emitir Ordem de Serviço</h3>
                  <p className="text-xs text-white/40">Entrada de aparelho para bancada técnica</p>
                </div>
              </div>
              <button onClick={() => setIsNewModalOpen(false)} className="p-1.5 text-white/40 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-white/60 font-medium mb-1 block">Nome do Cliente *</label>
                  <input
                    required
                    type="text"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    placeholder="Ex: Carlos Eduardo"
                    className="w-full bg-surface-800 border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white placeholder-white/30 focus:border-brand-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/60 font-medium mb-1 block">WhatsApp com DDD *</label>
                  <input
                    required
                    type="text"
                    value={formData.customerPhone}
                    onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                    placeholder="Ex: 11999998888"
                    className="w-full bg-surface-800 border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white placeholder-white/30 focus:border-brand-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-white/60 font-medium mb-1 block">Marca *</label>
                  <select
                    value={formData.deviceBrand}
                    onChange={(e) => setFormData({ ...formData, deviceBrand: e.target.value })}
                    className="w-full bg-surface-800 border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white outline-none"
                  >
                    <option value="Apple">Apple (iPhone)</option>
                    <option value="Samsung">Samsung</option>
                    <option value="Motorola">Motorola</option>
                    <option value="Xiaomi">Xiaomi / Poco</option>
                    <option value="Outra">Outra marca</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-white/60 font-medium mb-1 block">Modelo do Aparelho *</label>
                  <input
                    required
                    type="text"
                    value={formData.deviceModel}
                    onChange={(e) => setFormData({ ...formData, deviceModel: e.target.value })}
                    placeholder="Ex: iPhone 13 128GB"
                    className="w-full bg-surface-800 border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white placeholder-white/30 focus:border-brand-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/60 font-medium mb-1 block">Cor do Aparelho</label>
                  <input
                    type="text"
                    value={formData.deviceColor}
                    onChange={(e) => setFormData({ ...formData, deviceColor: e.target.value })}
                    placeholder="Ex: Azul Meia-Noite"
                    className="w-full bg-surface-800 border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white placeholder-white/30 focus:border-brand-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-white/60 font-medium mb-1 block">Defeito Relatado pelo Cliente *</label>
                <textarea
                  required
                  rows={2}
                  value={formData.reportedDefect}
                  onChange={(e) => setFormData({ ...formData, reportedDefect: e.target.value })}
                  placeholder="Ex: Tela trincada após queda, touch parou de funcionar na metade inferior..."
                  className="w-full bg-surface-800 border border-white/[0.08] rounded-xl p-3 text-xs text-white placeholder-white/30 focus:border-brand-500 outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-white/60 font-medium mb-1 block">Custo de Peças (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.partsCost}
                    onChange={(e) => setFormData({ ...formData, partsCost: e.target.value })}
                    placeholder="0.00"
                    className="w-full bg-surface-800 border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/60 font-medium mb-1 block">Mão de Obra (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.laborCost}
                    onChange={(e) => setFormData({ ...formData, laborCost: e.target.value })}
                    placeholder="0.00"
                    className="w-full bg-surface-800 border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/60 font-medium mb-1 block">Garantia (dias)</label>
                  <input
                    type="number"
                    value={formData.warrantyDays}
                    onChange={(e) => setFormData({ ...formData, warrantyDays: Number(e.target.value) })}
                    className="w-full bg-surface-800 border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="btn-secondary text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingOrder}
                  className="btn-primary text-xs flex items-center gap-1.5"
                >
                  {savingOrder ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />}
                  Salvar & Gerar OS
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Modal: Alterar Status & Notificar ─────────────────────────────── */}
      {statusModalOrder && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card w-full max-w-lg p-6 bg-surface-900 border-white/[0.1]">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 mb-4">
              <div>
                <h3 className="font-bold text-base">Atualizar Status — {statusModalOrder.orderNumber}</h3>
                <p className="text-xs text-white/40">{statusModalOrder.customerName} ({statusModalOrder.deviceBrand} {statusModalOrder.deviceModel})</p>
              </div>
              <button onClick={() => setStatusModalOrder(null)} className="p-1 text-white/40 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="text-white/60 font-medium mb-1 block">Novo Status da OS:</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full bg-surface-800 border border-white/[0.08] rounded-xl px-3 py-2.5 text-xs text-white outline-none"
                >
                  {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                    <option key={key} value={key}>{cfg.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 p-3 bg-surface-800/60 rounded-xl border border-white/[0.04]">
                <input
                  type="checkbox"
                  id="notifyWhatsapp"
                  checked={notifyWhatsapp}
                  onChange={(e) => setNotifyWhatsapp(e.target.checked)}
                  className="rounded border-white/20 text-brand-500 focus:ring-brand-500 h-4 w-4 bg-surface-700"
                />
                <label htmlFor="notifyWhatsapp" className="text-xs text-white/80 cursor-pointer select-none">
                  Disparar notificação automática via WhatsApp para o cliente
                </label>
              </div>

              {notifyWhatsapp && (
                <div>
                  <label className="text-white/60 font-medium mb-1 block">Mensagem personalizada (opcional):</label>
                  <textarea
                    rows={3}
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    placeholder="Deixe em branco para usar o modelo automático da IA..."
                    className="w-full bg-surface-800 border border-white/[0.08] rounded-xl p-3 text-xs text-white placeholder-white/30 focus:border-brand-500 outline-none resize-none"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => setStatusModalOrder(null)}
                  className="btn-secondary text-xs"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleUpdateStatus}
                  disabled={savingStatus}
                  className="btn-primary text-xs flex items-center gap-1.5"
                >
                  {savingStatus ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
                  Confirmar & Atualizar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
