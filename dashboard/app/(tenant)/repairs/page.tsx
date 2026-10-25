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
  EM_ANALISE: { label: 'Em Análise', bg: 'bg-[#FEF9C3]', text: 'text-[#854D0E]', border: 'border-[#FDE047]/60' },
  AGUARDANDO_APROVACAO: { label: 'Aguardando Aprovação', bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  APROVADO: { label: 'Aprovado', bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200' },
  AGUARDANDO_PECA: { label: 'Aguardando Peça', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  EM_CONSERTO: { label: 'Em Conserto', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  PRONTO: { label: 'Pronto p/ Retirada', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  ENTREGUE: { label: 'Entregue / Concluído', bg: 'bg-[#EAE8E1]', text: 'text-[#555962]', border: 'border-black/[0.04]' },
  CANCELADO: { label: 'Cancelado', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
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
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1500px] mx-auto overflow-y-auto h-full font-sans animate-fade-in bg-[#DCD8CD]">
      {/* ─── Header ────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="rounded-full px-3 py-0.5 text-[10px] uppercase tracking-wider font-extrabold bg-[#232528]/85 text-white backdrop-blur-sm border border-white/10 flex items-center gap-1.5 shadow-sm">
              <Wrench size={12} className="text-[#F5C518]" /> Bancada & Oficina Técnica
            </span>
            <span className="text-[#797D8A] text-xs">•</span>
            <span className="text-[#524D41] text-xs font-semibold">Fluxo de Reparos em Tempo Real</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-[#1C1D21]">
            Ordens de Serviço (OS)
          </h1>
          <p className="text-xs text-[#797D8A] mt-1 max-w-2xl font-medium">
            Gestão de diagnósticos, troca de peças, termos de garantia e avisos automáticos via WhatsApp diretamente para o cliente.
          </p>
        </div>

        {/* Tactile New OS Button */}
        <button
          onClick={() => setIsNewModalOpen(true)}
          className="group inline-flex items-center gap-3 bg-[#232528]/85 hover:bg-[#1A1C1E]/95 text-white px-5 py-2.5 rounded-full text-xs font-bold transition-all duration-300 shadow-tactile-dark backdrop-blur-md border border-white/10 active:scale-[0.98] shrink-0 self-start sm:self-auto"
        >
          <span>Nova Ordem de Serviço</span>
          <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-[#F5C518] group-hover:scale-110 transition-transform duration-200">
            <Plus size={13} />
          </span>
        </button>
      </div>

      {/* ─── Metric Cards (Tactile Clay) ────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card !p-5">
          <div className="flex items-center justify-between text-[#797D8A] text-[11px] font-bold uppercase tracking-wider mb-2">
            <span>Total Cadastradas</span>
            <div className="w-8 h-8 rounded-xl bg-white shadow-tactile-pill border border-black/[0.04] flex items-center justify-center text-[#1C1D21]">
              <Wrench size={14} />
            </div>
          </div>
          <div className="text-3xl font-black text-[#1C1D21] tracking-tight">{stats.total}</div>
          <p className="text-[11px] text-[#797D8A] mt-1 font-medium">Todas as OS registradas</p>
        </div>

        <div className="card !p-5">
          <div className="flex items-center justify-between text-[#854D0E] text-[11px] font-bold uppercase tracking-wider mb-2">
            <span>Em Bancada</span>
            <div className="w-8 h-8 rounded-xl bg-[#F5C518] flex items-center justify-center text-[#18191B] font-bold shadow-sm">
              <Clock size={14} />
            </div>
          </div>
          <div className="text-3xl font-black text-[#854D0E] tracking-tight">{stats.emBancada}</div>
          <p className="text-[11px] text-[#797D8A] mt-1 font-medium">Análise, conserto ou peça</p>
        </div>

        <div className="card !p-5">
          <div className="flex items-center justify-between text-emerald-800 text-[11px] font-bold uppercase tracking-wider mb-2">
            <span>Pronto p/ Retirada</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800 shadow-sm">
              <CheckCircle2 size={14} />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-800 tracking-tight">{stats.prontos}</div>
          <p className="text-[11px] text-[#797D8A] mt-1 font-medium">Aguardando cliente vir buscar</p>
        </div>

        <div className="card !p-5">
          <div className="flex items-center justify-between text-[#797D8A] text-[11px] font-bold uppercase tracking-wider mb-2">
            <span>Faturamento Pago</span>
            <div className="w-8 h-8 rounded-xl bg-white shadow-tactile-pill border border-black/[0.04] flex items-center justify-center text-[#1C1D21]">
              <DollarSign size={14} />
            </div>
          </div>
          <div className="text-3xl font-black text-[#1C1D21] tracking-tight">{formatCurrency(stats.totalRevenue)}</div>
          <p className="text-[11px] text-[#797D8A] mt-1 font-medium">Receita de reparos concluídos</p>
        </div>
      </div>

      {/* ─── Filtros e Busca (Floating Capsule Bar) ─────────────────────────── */}
      <div className="card !p-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#797D8A]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por OS, cliente, telefone ou modelo..."
              className="w-full bg-white border border-black/[0.05] rounded-full pl-10 pr-4 py-2 text-xs text-[#1C1D21] placeholder-[#797D8A] focus:outline-none focus:border-[#232528] shadow-sm transition-all"
            />
          </form>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
            <button
              onClick={() => setStatusFilter('')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm ${
                statusFilter === ''
                  ? 'bg-[#232528]/85 text-white backdrop-blur-md border border-white/10 shadow-tactile-dark'
                  : 'bg-white text-[#2E3036] hover:bg-[#FAF9F6] border border-black/[0.04] shadow-tactile-pill'
              }`}
            >
              Todos
            </button>
            {['EM_ANALISE', 'AGUARDANDO_PECA', 'EM_CONSERTO', 'PRONTO', 'ENTREGUE'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all shadow-sm ${
                  statusFilter === st
                    ? 'bg-[#232528]/85 text-white backdrop-blur-md border border-white/10 shadow-tactile-dark'
                    : 'bg-white text-[#2E3036] hover:bg-[#FAF9F6] border border-black/[0.04] shadow-tactile-pill'
                }`}
              >
                {STATUS_CONFIG[st]?.label || st}
              </button>
            ))}
            <button
              onClick={loadData}
              className="p-2 bg-white hover:bg-[#FAF9F6] text-[#555962] hover:text-[#18191B] rounded-full transition-colors ml-auto border border-black/[0.04] shadow-tactile-pill"
              title="Recarregar lista"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* ─── Tabela de Ordens de Serviço (Porcelain Card Sheet) ─────────────── */}
      <div className="card !p-0 overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-[#787C87] flex flex-col items-center justify-center gap-3">
            <RefreshCw size={24} className="animate-spin text-[#18191B]" />
            <span className="text-xs font-semibold">Sincronizando Ordens de Serviço...</span>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-16 text-center text-[#787C87] flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#EFECE4] flex items-center justify-center text-[#18191B]">
              <Wrench size={22} />
            </div>
            <span className="text-sm font-bold text-[#18191B]">Nenhuma Ordem de Serviço encontrada</span>
            <p className="text-xs max-w-sm text-[#787C87]">
              Crie uma nova Ordem de Serviço para iniciar o fluxo técnico da bancada ou altere os filtros acima.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF9F6] border-b border-black/[0.05] text-[#787C87] font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-5">OS #</th>
                  <th className="py-3.5 px-4">Cliente & WhatsApp</th>
                  <th className="py-3.5 px-4">Aparelho</th>
                  <th className="py-3.5 px-4">Defeito Relatado</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Total</th>
                  <th className="py-3.5 px-5 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.04]">
                {orders.map((o) => {
                  const st = STATUS_CONFIG[o.status] || { label: o.status, bg: 'bg-[#EFECE4]', text: 'text-[#18191B]', border: 'border-black/[0.04]' }
                  return (
                    <tr key={o.id} className="hover:bg-[#FAF9F6] transition-colors group">
                      <td className="py-3.5 px-5 font-bold text-[#18191B] font-mono">
                        {o.orderNumber}
                        <div className="text-[10px] text-[#888C95] font-normal">
                          {new Date(o.createdAt).toLocaleDateString('pt-BR')}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#18191B]">{o.customerName}</div>
                        <a
                          href={`https://wa.me/55${o.customerPhone.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-[#18191B] font-semibold hover:underline mt-0.5"
                        >
                          <Phone size={10} className="text-[#10B981]" /> {o.customerPhone}
                        </a>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#18191B] flex items-center gap-1.5">
                          <Smartphone size={13} className="text-[#787C87]" />
                          {o.deviceBrand} {o.deviceModel}
                        </div>
                        {o.deviceColor && <div className="text-[10px] text-[#787C87]">Cor: {o.deviceColor}</div>}
                      </td>
                      <td className="py-3.5 px-4 max-w-[220px]">
                        <p className="truncate text-[#555962] font-medium" title={o.reportedDefect}>{o.reportedDefect}</p>
                        {o.technicalDiagnosis && (
                          <p className="text-[10px] text-[#787C87] truncate">Diag: {o.technicalDiagnosis}</p>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border shadow-sm ${st.bg} ${st.text} ${st.border}`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
                          {st.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-black text-[#18191B] tracking-tight">
                        {formatCurrency(o.totalAmount)}
                        <div className="text-[10px] font-semibold">
                          {o.paidAt ? <span className="text-[#10B981]">Pago</span> : <span className="text-[#888C95]">Pendente</span>}
                        </div>
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => {
                              setStatusModalOrder(o)
                              setNewStatus(o.status)
                              setCustomMessage(`Olá ${o.customerName}! Atualização da sua OS ${o.orderNumber} (${o.deviceBrand} ${o.deviceModel}): status alterado para `)
                            }}
                            className="p-2 bg-[#EFECE4] hover:bg-[#18191B] text-[#18191B] hover:text-white rounded-full transition-all shadow-sm"
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

      {/* ─── Modal: Nova Ordem de Serviço (Tactile Porcelain Box) ──────────── */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl my-8 card !p-7 shadow-tablet-kiosk rounded-[32px] animate-slide-up">
            <div className="flex items-center justify-between border-b border-black/[0.06] pb-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-[#18191B] text-[#F5C518] flex items-center justify-center shadow-sm">
                  <Wrench size={16} />
                </div>
                <div>
                  <h3 className="font-black text-base text-[#18191B] tracking-tight">Emitir Ordem de Serviço</h3>
                  <p className="text-xs text-[#787C87] font-medium">Entrada de aparelho para bancada técnica</p>
                </div>
              </div>
              <button
                onClick={() => setIsNewModalOpen(false)}
                className="p-2 rounded-full text-[#787C87] hover:text-[#18191B] hover:bg-[#EFECE4] transition-all"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Nome do Cliente *</label>
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
                  <label className="label">WhatsApp com DDD *</label>
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
                  <label className="label">Marca *</label>
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
                  <label className="label">Modelo do Aparelho *</label>
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
                  <label className="label">Cor do Aparelho</label>
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
                <label className="label">Defeito Relatado pelo Cliente *</label>
                <textarea
                  required
                  rows={2}
                  value={formData.reportedDefect}
                  onChange={(e) => setFormData({ ...formData, reportedDefect: e.target.value })}
                  placeholder="Ex: Tela trincada após queda, touch parou de funcionar na metade inferior..."
                  className="w-full bg-white border border-black/[0.08] text-[#1C1D21] placeholder-[#9DA1AB] rounded-2xl p-4 text-sm outline-none focus:border-[#18191B] resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="label">Custo de Peças (R$)</label>
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
                  <label className="label">Mão de Obra (R$)</label>
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
                  <label className="label">Garantia (dias)</label>
                  <input
                    type="number"
                    value={formData.warrantyDays}
                    onChange={(e) => setFormData({ ...formData, warrantyDays: Number(e.target.value) })}
                    className="input"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-black/[0.06]">
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
      )}

      {/* ─── Modal: Alterar Status & Notificar ─────────────────────────────── */}
      {statusModalOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg card !p-7 shadow-tablet-kiosk rounded-[32px] animate-slide-up">
            <div className="flex items-center justify-between border-b border-black/[0.06] pb-3 mb-4">
              <div>
                <h3 className="font-black text-base text-[#18191B] tracking-tight">Atualizar Status — {statusModalOrder.orderNumber}</h3>
                <p className="text-xs text-[#787C87]">{statusModalOrder.customerName} ({statusModalOrder.deviceBrand} {statusModalOrder.deviceModel})</p>
              </div>
              <button
                onClick={() => setStatusModalOrder(null)}
                className="p-2 rounded-full text-[#787C87] hover:text-[#18191B] hover:bg-[#EFECE4] transition-all"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="label">Novo Status da OS:</label>
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

              <div className="flex items-center gap-2.5 p-3.5 bg-[#EFECE4] rounded-2xl border border-black/[0.03]">
                <input
                  type="checkbox"
                  id="notifyWhatsapp"
                  checked={notifyWhatsapp}
                  onChange={(e) => setNotifyWhatsapp(e.target.checked)}
                  className="rounded text-[#18191B] focus:ring-black h-4 w-4 bg-white"
                />
                <label htmlFor="notifyWhatsapp" className="text-xs text-[#18191B] cursor-pointer select-none font-bold">
                  Disparar notificação automática via WhatsApp para o cliente
                </label>
              </div>

              {notifyWhatsapp && (
                <div>
                  <label className="label">Mensagem personalizada (opcional):</label>
                  <textarea
                    rows={3}
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    placeholder="Deixe em branco para usar o modelo automático da IA..."
                    className="w-full bg-white border border-black/[0.08] text-[#1C1D21] placeholder-[#9DA1AB] rounded-2xl p-3.5 text-xs outline-none focus:border-[#18191B] resize-none"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-black/[0.06]">
                <button
                  type="button"
                  onClick={() => setStatusModalOrder(null)}
                  className="btn-secondary text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleUpdateStatus}
                  disabled={savingStatus}
                  className="btn-primary text-xs"
                >
                  {savingStatus ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
                  Salvar e Notificar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
