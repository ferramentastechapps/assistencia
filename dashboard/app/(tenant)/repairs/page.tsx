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
    <div className="p-6 md:p-8 space-y-7 max-w-7xl mx-auto overflow-y-auto h-full font-sans animate-fade-in">
      {/* ─── Header ────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="rounded-full px-2.5 py-0.5 text-[10px] uppercase tracking-[0.2em] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center gap-1">
              <Wrench size={12} /> Bancada & Oficina Técnica
            </span>
            <span className="text-white/30 text-xs">•</span>
            <span className="text-white/40 text-xs font-medium">Fluxo de Reparos em Tempo Real</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">Ordens de Serviço (OS)</h1>
          <p className="text-xs text-white/50 mt-1 max-w-2xl">
            Gestão de diagnósticos, troca de peças, termos de garantia e avisos automáticos via WhatsApp diretamente para o cliente.
          </p>
        </div>

        {/* Button-in-Button New OS */}
        <button
          onClick={() => setIsNewModalOpen(true)}
          className="group inline-flex items-center gap-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white px-5 py-2.5 rounded-full text-xs font-semibold transition-all duration-300 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] active:scale-[0.98] shrink-0 self-start sm:self-auto"
        >
          <span>Nova Ordem de Serviço</span>
          <span className="w-6 h-6 rounded-full bg-black/20 flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-200">
            <Plus size={13} />
          </span>
        </button>
      </div>

      {/* ─── Metric Cards (Double-Bezel) ──────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bezel-chassis">
          <div className="bezel-core p-4">
            <div className="flex items-center justify-between text-white/40 text-[11px] font-semibold uppercase tracking-wider mb-2">
              <span>Total Cadastradas</span>
              <div className="w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-white/60">
                <Wrench size={13} />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-white tracking-tight">{stats.total}</div>
            <p className="text-[10px] text-white/35 mt-1 font-medium">Todas as OS registradas</p>
          </div>
        </div>

        <div className="bezel-chassis">
          <div className="bezel-core p-4 bg-gradient-to-br from-amber-500/[0.06] via-[#090a0f] to-[#090a0f]">
            <div className="flex items-center justify-between text-amber-400/80 text-[11px] font-semibold uppercase tracking-wider mb-2">
              <span>Em Bancada</span>
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Clock size={13} />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-amber-400 tracking-tight">{stats.emBancada}</div>
            <p className="text-[10px] text-amber-400/50 mt-1 font-medium">Análise, conserto ou peça</p>
          </div>
        </div>

        <div className="bezel-chassis">
          <div className="bezel-core p-4 bg-gradient-to-br from-emerald-500/[0.06] via-[#090a0f] to-[#090a0f]">
            <div className="flex items-center justify-between text-emerald-400/80 text-[11px] font-semibold uppercase tracking-wider mb-2">
              <span>Pronto p/ Retirada</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <CheckCircle2 size={13} />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-emerald-400 tracking-tight">{stats.prontos}</div>
            <p className="text-[10px] text-emerald-400/50 mt-1 font-medium">Aguardando cliente vir buscar</p>
          </div>
        </div>

        <div className="bezel-chassis">
          <div className="bezel-core p-4">
            <div className="flex items-center justify-between text-white/40 text-[11px] font-semibold uppercase tracking-wider mb-2">
              <span>Faturamento Pago</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <DollarSign size={13} />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-emerald-400 tracking-tight">{formatCurrency(stats.totalRevenue)}</div>
            <p className="text-[10px] text-white/35 mt-1 font-medium">Receita de reparos concluídos</p>
          </div>
        </div>
      </div>

      {/* ─── Filtros e Busca (Floating Island) ──────────────────────────────── */}
      <div className="bezel-chassis">
        <div className="bezel-core p-3 flex flex-col md:flex-row items-center justify-between gap-3">
          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/35" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por OS, cliente, telefone ou modelo..."
              className="w-full bg-[#0c0d14] border border-white/[0.08] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-white/35 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all shadow-inner"
            />
          </form>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
            <button
              onClick={() => setStatusFilter('')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === ''
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-sm'
                  : 'bg-white/[0.04] text-white/50 hover:text-white hover:bg-white/[0.08]'
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
                    ? 'bg-white/[0.12] text-white border border-white/20'
                    : 'bg-white/[0.03] text-white/50 hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                {STATUS_CONFIG[st]?.label || st}
              </button>
            ))}
            <button
              onClick={loadData}
              className="p-2 bg-white/[0.04] hover:bg-white/[0.08] text-white/60 hover:text-white rounded-lg transition-colors ml-auto border border-white/[0.06]"
              title="Recarregar lista"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* ─── Tabela de Ordens de Serviço (Hardware Panel) ──────────────────── */}
      <div className="bezel-chassis overflow-hidden">
        <div className="bezel-core p-0">
          {loading ? (
            <div className="p-16 text-center text-white/40 flex flex-col items-center justify-center gap-3">
              <RefreshCw size={24} className="animate-spin text-emerald-400" />
              <span className="text-xs font-medium">Sincronizando Ordens de Serviço...</span>
            </div>
          ) : orders.length === 0 ? (
            <div className="p-16 text-center text-white/40 flex flex-col items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-white/20">
                <Wrench size={24} />
              </div>
              <span className="text-sm font-semibold text-white/70">Nenhuma Ordem de Serviço encontrada</span>
              <p className="text-xs max-w-sm text-white/35">
                Crie uma nova Ordem de Serviço para iniciar o fluxo técnico da bancada ou altere os filtros acima.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/[0.02] border-b border-white/[0.06] text-white/40 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3.5 px-4">OS #</th>
                    <th className="py-3.5 px-4">Cliente & WhatsApp</th>
                    <th className="py-3.5 px-4">Aparelho</th>
                    <th className="py-3.5 px-4">Defeito Relatado</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Total</th>
                    <th className="py-3.5 px-4 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {orders.map((o) => {
                    const st = STATUS_CONFIG[o.status] || { label: o.status, bg: 'bg-white/[0.05]', text: 'text-white/60', border: 'border-white/10' }
                    return (
                      <tr key={o.id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="py-3.5 px-4 font-bold text-white font-mono">
                          {o.orderNumber}
                          <div className="text-[10px] text-white/35 font-normal">
                            {new Date(o.createdAt).toLocaleDateString('pt-BR')}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-white/90">{o.customerName}</div>
                          <a
                            href={`https://wa.me/55${o.customerPhone.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 transition-colors mt-0.5"
                          >
                            <Phone size={10} /> {o.customerPhone}
                          </a>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-white/90 flex items-center gap-1.5">
                            <Smartphone size={13} className="text-cyan-400" />
                            {o.deviceBrand} {o.deviceModel}
                          </div>
                          {o.deviceColor && <div className="text-[10px] text-white/40">Cor: {o.deviceColor}</div>}
                        </td>
                        <td className="py-3.5 px-4 max-w-[220px]">
                          <p className="truncate text-white/70" title={o.reportedDefect}>{o.reportedDefect}</p>
                          {o.technicalDiagnosis && (
                            <p className="text-[10px] text-white/40 truncate">Diag: {o.technicalDiagnosis}</p>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${st.bg} ${st.text} ${st.border}`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
                            {st.label}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold text-white tracking-tight">
                          {formatCurrency(o.totalAmount)}
                          <div className="text-[10px] text-white/40 font-normal">
                            {o.paidAt ? <span className="text-emerald-400 font-semibold">Pago</span> : 'Pendente'}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => {
                                setStatusModalOrder(o)
                                setNewStatus(o.status)
                                setCustomMessage(`Olá ${o.customerName}! Atualização da sua OS ${o.orderNumber} (${o.deviceBrand} ${o.deviceModel}): status alterado para `)
                              }}
                              className="p-2 bg-white/[0.04] hover:bg-emerald-500/20 text-white/70 hover:text-emerald-300 border border-white/[0.08] hover:border-emerald-500/30 rounded-xl transition-all"
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
      </div>

      {/* ─── Modal: Nova Ordem de Serviço ──────────────────────────────────── */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bezel-chassis w-full max-w-2xl my-8">
            <div className="bezel-core p-6 bg-[#090a0f]">
              <div className="flex items-center justify-between border-b border-white/[0.07] pb-4 mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                    <Wrench size={16} />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-white tracking-tight">Emitir Ordem de Serviço</h3>
                    <p className="text-xs text-white/40">Entrada de aparelho para bancada técnica</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsNewModalOpen(false)}
                  className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.08] transition-all"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateOrder} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-white/60 font-semibold mb-1.5 block">Nome do Cliente *</label>
                    <input
                      required
                      type="text"
                      value={formData.customerName}
                      onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                      placeholder="Ex: Carlos Eduardo"
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-white/60 font-semibold mb-1.5 block">WhatsApp com DDD *</label>
                    <input
                      required
                      type="text"
                      value={formData.customerPhone}
                      onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                      placeholder="Ex: 11999998888"
                      className="input"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs text-white/60 font-semibold mb-1.5 block">Marca *</label>
                    <select
                      value={formData.deviceBrand}
                      onChange={(e) => setFormData({ ...formData, deviceBrand: e.target.value })}
                      className="input cursor-pointer"
                    >
                      <option value="Apple">Apple (iPhone)</option>
                      <option value="Samsung">Samsung</option>
                      <option value="Motorola">Motorola</option>
                      <option value="Xiaomi">Xiaomi / Poco</option>
                      <option value="Outra">Outra marca</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-white/60 font-semibold mb-1.5 block">Modelo do Aparelho *</label>
                    <input
                      required
                      type="text"
                      value={formData.deviceModel}
                      onChange={(e) => setFormData({ ...formData, deviceModel: e.target.value })}
                      placeholder="Ex: iPhone 13 128GB"
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-white/60 font-semibold mb-1.5 block">Cor do Aparelho</label>
                    <input
                      type="text"
                      value={formData.deviceColor}
                      onChange={(e) => setFormData({ ...formData, deviceColor: e.target.value })}
                      placeholder="Ex: Azul Meia-Noite"
                      className="input"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-white/60 font-semibold mb-1.5 block">Defeito Relatado pelo Cliente *</label>
                  <textarea
                    required
                    rows={2}
                    value={formData.reportedDefect}
                    onChange={(e) => setFormData({ ...formData, reportedDefect: e.target.value })}
                    placeholder="Ex: Tela trincada após queda, touch parou de funcionar na metade inferior..."
                    className="input resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs text-white/60 font-semibold mb-1.5 block">Custo de Peças (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.partsCost}
                      onChange={(e) => setFormData({ ...formData, partsCost: e.target.value })}
                      placeholder="0.00"
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-white/60 font-semibold mb-1.5 block">Mão de Obra (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.laborCost}
                      onChange={(e) => setFormData({ ...formData, laborCost: e.target.value })}
                      placeholder="0.00"
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-white/60 font-semibold mb-1.5 block">Garantia (dias)</label>
                    <input
                      type="number"
                      value={formData.warrantyDays}
                      onChange={(e) => setFormData({ ...formData, warrantyDays: Number(e.target.value) })}
                      className="input"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.07]">
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
                    className="btn-primary text-xs"
                  >
                    {savingOrder ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />}
                    Salvar & Gerar OS
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ─── Modal: Alterar Status & Notificar ─────────────────────────────── */}
      {statusModalOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bezel-chassis w-full max-w-lg">
            <div className="bezel-core p-6 bg-[#090a0f]">
              <div className="flex items-center justify-between border-b border-white/[0.07] pb-3 mb-4">
                <div>
                  <h3 className="font-bold text-base text-white tracking-tight">Atualizar Status — {statusModalOrder.orderNumber}</h3>
                  <p className="text-xs text-white/40">{statusModalOrder.customerName} ({statusModalOrder.deviceBrand} {statusModalOrder.deviceModel})</p>
                </div>
                <button
                  onClick={() => setStatusModalOrder(null)}
                  className="p-1 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.08] transition-all"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="text-white/60 font-semibold mb-1.5 block">Novo Status da OS:</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="input cursor-pointer"
                  >
                    {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                      <option key={key} value={key}>{cfg.label}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2.5 p-3 bg-white/[0.02] rounded-xl border border-white/[0.06]">
                  <input
                    type="checkbox"
                    id="notifyWhatsapp"
                    checked={notifyWhatsapp}
                    onChange={(e) => setNotifyWhatsapp(e.target.checked)}
                    className="rounded border-white/20 text-emerald-500 focus:ring-emerald-500 h-4 w-4 bg-[#0d0e15]"
                  />
                  <label htmlFor="notifyWhatsapp" className="text-xs text-white/80 cursor-pointer select-none font-medium">
                    Disparar notificação automática via WhatsApp para o cliente
                  </label>
                </div>

                {notifyWhatsapp && (
                  <div>
                    <label className="text-white/60 font-semibold mb-1.5 block">Mensagem personalizada (opcional):</label>
                    <textarea
                      rows={3}
                      value={customMessage}
                      onChange={(e) => setCustomMessage(e.target.value)}
                      placeholder="Deixe em branco para usar o modelo automático da IA..."
                      className="input resize-none"
                    />
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.07]">
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
                    className="btn-primary text-xs"
                  >
                    {savingStatus ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
                    Confirmar & Atualizar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
