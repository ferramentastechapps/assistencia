'use client'

import { useEffect, useState } from 'react'
import {
  Smartphone, Plus, Search, Filter, RefreshCw,
  ShoppingBag, Sparkles, Battery, Tag, ShieldCheck,
  CheckCircle2, ArrowRight, ArrowLeftRight, Trash2, Edit, X, Phone
} from 'lucide-react'
import { catalogApi } from '@/lib/api'

interface Product {
  id: string
  title: string
  brand: string
  model: string
  category: string
  condition: string
  storage?: string
  color?: string
  batteryHealth?: number
  cashPrice: number
  installmentPrice: number
  installmentCount: number
  stock: number
  imageUrl?: string
  description?: string
  warrantyMonths: number
  isFeatured: boolean
}

interface TradeInRecord {
  id: string
  customerPhone?: string
  brand: string
  model: string
  storage?: string
  condition: string
  batteryHealth?: number
  minEvaluation: number
  maxEvaluation: number
  createdAt: string
}

export default function CatalogPage() {
  const [activeTab, setActiveTab] = useState<'catalog' | 'trade-in'>('catalog')
  const [products, setProducts] = useState<Product[]>([])
  const [tradeIns, setTradeIns] = useState<TradeInRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [brandFilter, setBrandFilter] = useState('')
  const [conditionFilter, setConditionFilter] = useState('')
  const [search, setSearch] = useState('')

  // Modal Novo Produto
  const [isNewModalOpen, setIsNewModalOpen] = useState(false)
  const [productForm, setProductForm] = useState({
    title: '',
    brand: 'Apple',
    model: '',
    category: 'SMARTPHONE',
    condition: 'SEMINOVO_EXCELENTE',
    storage: '128GB',
    color: '',
    batteryHealth: '90',
    cashPrice: '',
    installmentPrice: '',
    stock: '1',
    warrantyMonths: '3',
    description: '',
    imageUrl: '',
  })
  const [savingProduct, setSavingProduct] = useState(false)

  // Formulário do Simulador de Trade-In
  const [simForm, setSimForm] = useState({
    brand: 'Apple',
    model: 'iPhone 13',
    storage: '128GB',
    batteryHealth: 88,
    condition: 'EXCELENTE',
    hasBox: true,
    hasCharger: true,
    customerPhone: '',
  })
  const [simResult, setSimResult] = useState<{ min: number; max: number; notes?: string } | null>(null)
  const [simulating, setSimulating] = useState(false)

  const loadData = async () => {
    setLoading(true)
    try {
      const [resProd, resTrade] = await Promise.all([
        catalogApi.listProducts({
          brand: brandFilter || undefined,
          condition: conditionFilter || undefined,
          search: search || undefined,
        }),
        catalogApi.listTradeIns()
      ])
      setProducts(resProd.data.products || [])
      setTradeIns(resTrade.data.tradeIns || [])
    } catch (err) {
      console.error('Erro ao carregar catálogo:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [brandFilter, conditionFilter])

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingProduct(true)
    try {
      const payload = {
        ...productForm,
        batteryHealth: productForm.batteryHealth ? Number(productForm.batteryHealth) : undefined,
        cashPrice: Number(productForm.cashPrice),
        installmentPrice: Number(productForm.installmentPrice || productForm.cashPrice),
        stock: Number(productForm.stock),
        warrantyMonths: Number(productForm.warrantyMonths),
      }
      await catalogApi.createProduct(payload)
      setIsNewModalOpen(false)
      setProductForm({
        title: '',
        brand: 'Apple',
        model: '',
        category: 'SMARTPHONE',
        condition: 'SEMINOVO_EXCELENTE',
        storage: '128GB',
        color: '',
        batteryHealth: '90',
        cashPrice: '',
        installmentPrice: '',
        stock: '1',
        warrantyMonths: '3',
        description: '',
        imageUrl: '',
      })
      await loadData()
    } catch (err: any) {
      alert('Erro ao cadastrar aparelho: ' + (err.response?.data?.message || err.message))
    } finally {
      setSavingProduct(false)
    }
  }

  const handleRunTradeIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setSimulating(true)
    try {
      const res = await catalogApi.evaluateTradeIn(simForm)
      setSimResult({
        min: res.data.minEvaluation,
        max: res.data.maxEvaluation,
        notes: res.data.notes,
      })
      // Atualizar lista
      const resTrade = await catalogApi.listTradeIns()
      setTradeIns(resTrade.data.tradeIns || [])
    } catch (err: any) {
      alert('Erro ao simular trade-in: ' + (err.response?.data?.message || err.message))
    } finally {
      setSimulating(false)
    }
  }

  const formatCurrency = (val?: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0)
  }

  const getConditionLabel = (cond: string) => {
    switch (cond) {
      case 'NOVO_LACRADO': return { label: 'Novo Lacrado', bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' }
      case 'SEMINOVO_EXCELENTE': return { label: 'Grau A+ (Impecável)', bg: 'bg-blue-500/10 text-blue-400 border-blue-500/20' }
      case 'SEMINOVO_BOM': return { label: 'Grau B (Marcas Leves)', bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20' }
      default: return { label: cond, bg: 'bg-surface-800 text-white/60 border-white/10' }
    }
  }

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto overflow-y-auto h-full">
      {/* ─── Header ────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-brand-400 uppercase tracking-wider mb-1">
            <ShoppingBag size={14} /> Vendas & Trade-In
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Catálogo de Celulares & Vendas</h1>
          <p className="text-sm text-white/50 mt-0.5">Gestão de estoque de smartphones e simulação de troca inteligente (Trade-In)</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsNewModalOpen(true)}
            className="btn-primary flex items-center justify-center gap-2 shrink-0 text-xs"
          >
            <Plus size={16} /> Cadastrar Aparelho
          </button>
        </div>
      </div>

      {/* ─── Tabs de Navegação ────────────────────────────────────────────── */}
      <div className="flex border-b border-white/[0.08] gap-4">
        <button
          onClick={() => setActiveTab('catalog')}
          className={`pb-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'catalog'
              ? 'border-brand-500 text-white'
              : 'border-transparent text-white/50 hover:text-white'
          }`}
        >
          <Smartphone size={15} /> Aparelhos em Estoque ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('trade-in')}
          className={`pb-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'trade-in'
              ? 'border-brand-500 text-white'
              : 'border-transparent text-white/50 hover:text-white'
          }`}
        >
          <ArrowLeftRight size={15} /> Simulador de Trade-In (Troca com Usado)
        </button>
      </div>

      {activeTab === 'catalog' ? (
        <>
          {/* ─── Filtros e Busca ──────────────────────────────────────────── */}
          <div className="card p-4 flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-80">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por modelo, cor ou capacidade..."
                className="w-full bg-surface-800 border border-white/[0.07] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
              <select
                value={brandFilter}
                onChange={(e) => setBrandFilter(e.target.value)}
                className="bg-surface-800 border border-white/[0.08] rounded-xl px-3 py-1.5 text-xs text-white outline-none"
              >
                <option value="">Todas as Marcas</option>
                <option value="Apple">Apple</option>
                <option value="Samsung">Samsung</option>
                <option value="Xiaomi">Xiaomi</option>
                <option value="Motorola">Motorola</option>
              </select>

              <select
                value={conditionFilter}
                onChange={(e) => setConditionFilter(e.target.value)}
                className="bg-surface-800 border border-white/[0.08] rounded-xl px-3 py-1.5 text-xs text-white outline-none"
              >
                <option value="">Todas as Condições</option>
                <option value="NOVO_LACRADO">Novos Lacrados</option>
                <option value="SEMINOVO_EXCELENTE">Seminovos Grau A+</option>
                <option value="SEMINOVO_BOM">Seminovos Grau B</option>
              </select>

              <button
                onClick={loadData}
                className="p-2 bg-surface-800 hover:bg-surface-700 text-white/60 hover:text-white rounded-lg transition-colors ml-auto"
                title="Recarregar"
              >
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>

          {/* ─── Grid de Produtos ─────────────────────────────────────────── */}
          {loading ? (
            <div className="p-16 text-center text-white/40 flex flex-col items-center justify-center gap-2">
              <RefreshCw size={24} className="animate-spin text-brand-500" />
              <span>Carregando catálogo de aparelhos...</span>
            </div>
          ) : products.length === 0 ? (
            <div className="card p-12 text-center text-white/40 flex flex-col items-center justify-center gap-2">
              <Smartphone size={36} className="text-white/20" />
              <span className="text-base font-semibold text-white/70">Nenhum aparelho em estoque</span>
              <p className="text-xs max-w-sm">Cadastre smartphones para que o Agente de IA possa consultar estoque e preços automaticamente no WhatsApp.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {products.map((p) => {
                const cond = getConditionLabel(p.condition)
                return (
                  <div key={p.id} className="card p-5 flex flex-col justify-between hover:border-white/[0.15] transition-all group">
                    <div>
                      {/* Imagem / Header */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="w-12 h-12 rounded-xl bg-surface-800 border border-white/[0.06] flex items-center justify-center text-brand-400 shrink-0">
                          {p.imageUrl ? (
                            <img src={p.imageUrl} alt={p.title} className="w-full h-full object-contain rounded-xl p-1" />
                          ) : (
                            <Smartphone size={24} />
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${cond.bg}`}>
                            {cond.label}
                          </span>
                          {p.batteryHealth && (
                            <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
                              <Battery size={12} /> {p.batteryHealth}% bateria
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Informações */}
                      <h3 className="font-bold text-base text-white/90 group-hover:text-brand-400 transition-colors">
                        {p.title}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-white/50 mt-1 mb-3">
                        <span>{p.brand}</span>
                        {p.storage && <span>• {p.storage}</span>}
                        {p.color && <span>• {p.color}</span>}
                      </div>

                      {p.description && (
                        <p className="text-xs text-white/60 line-clamp-2 mb-3">{p.description}</p>
                      )}
                    </div>

                    {/* Preços e Ações */}
                    <div className="pt-3 border-t border-white/[0.06] mt-2">
                      <div className="flex items-baseline justify-between">
                        <div>
                          <div className="text-[10px] text-emerald-400 font-semibold uppercase">À vista no Pix</div>
                          <div className="text-xl font-black text-white">{formatCurrency(p.cashPrice)}</div>
                        </div>
                        {p.installmentPrice && (
                          <div className="text-right">
                            <div className="text-[10px] text-white/40">ou até {p.installmentCount || 12}x de</div>
                            <div className="text-xs font-semibold text-white/80">
                              {formatCurrency(p.installmentPrice / (p.installmentCount || 12))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-white/40 mt-3 pt-2 border-t border-white/[0.04]">
                        <span className="flex items-center gap-1">
                          <ShieldCheck size={13} className="text-brand-400" /> {p.warrantyMonths} meses garantia
                        </span>
                        <span className="font-medium text-white/70">
                          Estoque: <strong className={p.stock > 0 ? 'text-emerald-400' : 'text-rose-400'}>{p.stock} un</strong>
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      ) : (
        /* ─── Simulador de Trade-In ────────────────────────────────────────── */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 card p-6">
            <div className="flex items-center gap-2 mb-1 text-brand-400 font-bold text-xs uppercase tracking-wider">
              <Sparkles size={14} /> Avaliação Instantânea
            </div>
            <h2 className="text-lg font-bold mb-1">Simular Compra com Troca</h2>
            <p className="text-xs text-white/50 mb-5">
              Descubra a faixa de valor para receber o celular usado do cliente como entrada na compra de um novo.
            </p>

            <form onSubmit={handleRunTradeIn} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-white/60 font-medium mb-1 block">Marca</label>
                  <select
                    value={simForm.brand}
                    onChange={(e) => setSimForm({ ...simForm, brand: e.target.value })}
                    className="w-full bg-surface-800 border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white outline-none"
                  >
                    <option value="Apple">Apple</option>
                    <option value="Samsung">Samsung</option>
                    <option value="Motorola">Motorola</option>
                  </select>
                </div>
                <div>
                  <label className="text-white/60 font-medium mb-1 block">Modelo Usado</label>
                  <input
                    required
                    type="text"
                    value={simForm.model}
                    onChange={(e) => setSimForm({ ...simForm, model: e.target.value })}
                    placeholder="Ex: iPhone 12 Pro"
                    className="w-full bg-surface-800 border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-white/60 font-medium mb-1 block">Armazenamento</label>
                  <select
                    value={simForm.storage}
                    onChange={(e) => setSimForm({ ...simForm, storage: e.target.value })}
                    className="w-full bg-surface-800 border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white outline-none"
                  >
                    <option value="64GB">64GB</option>
                    <option value="128GB">128GB</option>
                    <option value="256GB">256GB</option>
                    <option value="512GB">512GB</option>
                    <option value="1TB">1TB</option>
                  </select>
                </div>
                <div>
                  <label className="text-white/60 font-medium mb-1 block">Saúde Bateria (%)</label>
                  <input
                    type="number"
                    min="50"
                    max="100"
                    value={simForm.batteryHealth}
                    onChange={(e) => setSimForm({ ...simForm, batteryHealth: Number(e.target.value) })}
                    className="w-full bg-surface-800 border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-white/60 font-medium mb-1 block">Estado Físico / Estético</label>
                <select
                  value={simForm.condition}
                  onChange={(e) => setSimForm({ ...simForm, condition: e.target.value })}
                  className="w-full bg-surface-800 border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white outline-none"
                >
                  <option value="IMPECAVEL">Impecável (sem marcas, película e capa sempre)</option>
                  <option value="EXCELENTE">Excelente (pequenas marcas leves de uso)</option>
                  <option value="BOM">Bom (riscos leves na carcaça ou tela)</option>
                  <option value="TELA_TRINCADA">Tela trincada / vidro quebrado</option>
                  <option value="DEFEITO_FUNCIONAL">Defeito funcional (FaceID, câmera ou botão)</option>
                </select>
              </div>

              <div className="flex items-center gap-4 py-1">
                <label className="flex items-center gap-1.5 cursor-pointer text-white/70">
                  <input
                    type="checkbox"
                    checked={simForm.hasBox}
                    onChange={(e) => setSimForm({ ...simForm, hasBox: e.target.checked })}
                    className="rounded text-brand-500"
                  />
                  Possui Caixa Original
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-white/70">
                  <input
                    type="checkbox"
                    checked={simForm.hasCharger}
                    onChange={(e) => setSimForm({ ...simForm, hasCharger: e.target.checked })}
                    className="rounded text-brand-500"
                  />
                  Possui Carregador Original
                </label>
              </div>

              <div>
                <label className="text-white/60 font-medium mb-1 block">WhatsApp do Cliente (opcional)</label>
                <input
                  type="text"
                  value={simForm.customerPhone}
                  onChange={(e) => setSimForm({ ...simForm, customerPhone: e.target.value })}
                  placeholder="Ex: 11999998888"
                  className="w-full bg-surface-800 border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={simulating}
                className="btn-primary w-full text-xs flex items-center justify-center gap-2 mt-2"
              >
                {simulating ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
                Calcular Avaliação de Entrada
              </button>
            </form>

            {simResult && (
              <div className="mt-5 p-4 rounded-xl bg-gradient-to-br from-emerald-500/[0.1] to-brand-500/[0.05] border border-emerald-500/20">
                <div className="text-[11px] text-emerald-400 font-semibold uppercase">Faixa Sugerida de Entrada</div>
                <div className="text-2xl font-black text-white mt-0.5">
                  {formatCurrency(simResult.min)} ~ {formatCurrency(simResult.max)}
                </div>
                <p className="text-[11px] text-white/60 mt-1">
                  Crédito que o cliente pode abater na troca pelo smartphone novo/seminovo.
                </p>
              </div>
            )}
          </div>

          <div className="lg:col-span-7 card p-6">
            <h2 className="text-base font-bold mb-1">Últimas Avaliações de Usados (Trade-In)</h2>
            <p className="text-xs text-white/50 mb-4">Simulações calculadas no balcão e pelo Agente de IA no WhatsApp</p>

            {tradeIns.length === 0 ? (
              <div className="p-8 text-center text-white/30 text-xs">
                Nenhuma avaliação de trade-in recente gravada.
              </div>
            ) : (
              <div className="divide-y divide-white/[0.06] text-xs">
                {tradeIns.slice(0, 10).map((t) => (
                  <div key={t.id} className="py-3 flex items-center justify-between gap-3">
                    <div>
                      <div className="font-semibold text-white/90">
                        {t.brand} {t.model} {t.storage && `(${t.storage})`}
                      </div>
                      <div className="text-[11px] text-white/40 flex items-center gap-2 mt-0.5">
                        <span>Estado: {t.condition}</span>
                        {t.customerPhone && (
                          <span className="text-emerald-400 flex items-center gap-1">
                            <Phone size={10} /> {t.customerPhone}
                          </span>
                        )}
                        <span>{new Date(t.createdAt).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-emerald-400">
                        {formatCurrency(t.minEvaluation)} - {formatCurrency(t.maxEvaluation)}
                      </div>
                      <span className="text-[10px] text-white/40">faixa de recompra</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── Modal: Novo Aparelho / Produto ────────────────────────────────── */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="card w-full max-w-2xl p-6 bg-surface-900 border-white/[0.1] my-8">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-4 mb-5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center text-brand-400">
                  <Smartphone size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Cadastrar Aparelho / Produto</h3>
                  <p className="text-xs text-white/40">Adicione ao estoque e disponibilize para a IA no WhatsApp</p>
                </div>
              </div>
              <button onClick={() => setIsNewModalOpen(false)} className="p-1.5 text-white/40 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-white/60 font-medium mb-1 block">Título Comercial *</label>
                  <input
                    required
                    type="text"
                    value={productForm.title}
                    onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                    placeholder="Ex: iPhone 13 128GB Meia-Noite Grau A+"
                    className="w-full bg-surface-800 border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white placeholder-white/30 focus:border-brand-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-white/60 font-medium mb-1 block">Marca *</label>
                  <select
                    value={productForm.brand}
                    onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                    className="w-full bg-surface-800 border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white outline-none"
                  >
                    <option value="Apple">Apple</option>
                    <option value="Samsung">Samsung</option>
                    <option value="Xiaomi">Xiaomi</option>
                    <option value="Motorola">Motorola</option>
                    <option value="Outra">Outra</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-white/60 font-medium mb-1 block">Condição *</label>
                  <select
                    value={productForm.condition}
                    onChange={(e) => setProductForm({ ...productForm, condition: e.target.value })}
                    className="w-full bg-surface-800 border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white outline-none"
                  >
                    <option value="NOVO_LACRADO">Novo Lacrado</option>
                    <option value="SEMINOVO_EXCELENTE">Seminovo Grau A+ (Impecável)</option>
                    <option value="SEMINOVO_BOM">Seminovo Grau B (Marcas Leves)</option>
                  </select>
                </div>
                <div>
                  <label className="text-white/60 font-medium mb-1 block">Armazenamento</label>
                  <input
                    type="text"
                    value={productForm.storage}
                    onChange={(e) => setProductForm({ ...productForm, storage: e.target.value })}
                    placeholder="Ex: 128GB"
                    className="w-full bg-surface-800 border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-white/60 font-medium mb-1 block">Saúde Bateria (%)</label>
                  <input
                    type="number"
                    value={productForm.batteryHealth}
                    onChange={(e) => setProductForm({ ...productForm, batteryHealth: e.target.value })}
                    placeholder="Ex: 92"
                    className="w-full bg-surface-800 border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-white/60 font-medium mb-1 block">Preço à Vista Pix (R$) *</label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    value={productForm.cashPrice}
                    onChange={(e) => setProductForm({ ...productForm, cashPrice: e.target.value })}
                    placeholder="2500.00"
                    className="w-full bg-surface-800 border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-white/60 font-medium mb-1 block">Preço Parcelado 12x (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={productForm.installmentPrice}
                    onChange={(e) => setProductForm({ ...productForm, installmentPrice: e.target.value })}
                    placeholder="2800.00"
                    className="w-full bg-surface-800 border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-white/60 font-medium mb-1 block">Qtd em Estoque *</label>
                  <input
                    required
                    type="number"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                    className="w-full bg-surface-800 border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-white/60 font-medium mb-1 block">URL da Foto (opcional)</label>
                <input
                  type="text"
                  value={productForm.imageUrl}
                  onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-surface-800 border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
              </div>

              <div>
                <label className="text-white/60 font-medium mb-1 block">Descrição / Acessórios Inclusos</label>
                <textarea
                  rows={2}
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  placeholder="Ex: Acompanha caixa original, cabo USB-C e garantia de 90 dias na loja."
                  className="w-full bg-surface-800 border border-white/[0.08] rounded-xl p-3 text-xs text-white outline-none resize-none"
                />
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
                  disabled={savingProduct}
                  className="btn-primary text-xs flex items-center gap-1.5"
                >
                  {savingProduct ? <RefreshCw size={14} className="animate-spin" /> : <ShoppingBag size={14} />}
                  Salvar Aparelho
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
