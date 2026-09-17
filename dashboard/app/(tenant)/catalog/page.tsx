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
    <div className="p-6 md:p-8 space-y-7 max-w-7xl mx-auto overflow-y-auto h-full font-sans animate-fade-in">
      {/* ─── Header ────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="rounded-full px-2.5 py-0.5 text-[10px] uppercase tracking-[0.2em] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center gap-1">
              <ShoppingBag size={12} /> Vitrine & Trade-In
            </span>
            <span className="text-white/30 text-xs">•</span>
            <span className="text-white/40 text-xs font-medium">Smartphones Novos, Seminovos & Troca</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">Catálogo de Celulares & Vendas</h1>
          <p className="text-xs text-white/50 mt-1 max-w-2xl">
            Controle de estoque de smartphones integrado à IA do WhatsApp e simulação de recompra inteligente com avaliação de entrada.
          </p>
        </div>

        {/* Button-in-Button New Product */}
        <button
          onClick={() => setIsNewModalOpen(true)}
          className="group inline-flex items-center gap-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white px-5 py-2.5 rounded-full text-xs font-semibold transition-all duration-300 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] active:scale-[0.98] shrink-0 self-start sm:self-auto"
        >
          <span>Cadastrar Aparelho</span>
          <span className="w-6 h-6 rounded-full bg-black/20 flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-200">
            <Plus size={13} />
          </span>
        </button>
      </div>

      {/* ─── Segmented Controls (Floating Pills) ───────────────────────────── */}
      <div className="inline-flex p-1 rounded-2xl bg-white/[0.03] border border-white/[0.08] shadow-inner gap-1">
        <button
          onClick={() => setActiveTab('catalog')}
          className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-2 transition-all duration-200 ${
            activeTab === 'catalog'
              ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/15 text-white border border-emerald-500/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]'
              : 'text-white/50 hover:text-white hover:bg-white/[0.04]'
          }`}
        >
          <Smartphone size={14} className={activeTab === 'catalog' ? 'text-emerald-400' : ''} />
          <span>Aparelhos em Estoque ({products.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('trade-in')}
          className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-2 transition-all duration-200 ${
            activeTab === 'trade-in'
              ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/15 text-white border border-emerald-500/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]'
              : 'text-white/50 hover:text-white hover:bg-white/[0.04]'
          }`}
        >
          <ArrowLeftRight size={14} className={activeTab === 'trade-in' ? 'text-cyan-400' : ''} />
          <span>Simulador de Trade-In (Recompra)</span>
        </button>
      </div>

      {activeTab === 'catalog' ? (
        <>
          {/* ─── Filtros e Busca (Floating Island) ──────────────────────────── */}
          <div className="bezel-chassis">
            <div className="bezel-core p-3 flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="relative w-full md:w-80">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/35" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar por modelo, cor ou capacidade..."
                  className="w-full bg-[#0c0d14] border border-white/[0.08] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-white/35 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all shadow-inner"
                />
              </div>

              <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
                <select
                  value={brandFilter}
                  onChange={(e) => setBrandFilter(e.target.value)}
                  className="bg-[#0c0d14] border border-white/[0.08] rounded-xl px-3 py-1.5 text-xs text-white/80 outline-none cursor-pointer"
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
                  className="bg-[#0c0d14] border border-white/[0.08] rounded-xl px-3 py-1.5 text-xs text-white/80 outline-none cursor-pointer"
                >
                  <option value="">Todas as Condições</option>
                  <option value="NOVO_LACRADO">Novos Lacrados</option>
                  <option value="SEMINOVO_EXCELENTE">Seminovos Grau A+</option>
                  <option value="SEMINOVO_BOM">Seminovos Grau B</option>
                </select>

                <button
                  onClick={loadData}
                  className="p-2 bg-white/[0.04] hover:bg-white/[0.08] text-white/60 hover:text-white rounded-lg transition-colors ml-auto border border-white/[0.06]"
                  title="Recarregar"
                >
                  <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
                </button>
              </div>
            </div>
          </div>

          {/* ─── Grid de Produtos (Double-Bezel Hardware Showroom) ──────────── */}
          {loading ? (
            <div className="p-16 text-center text-white/40 flex flex-col items-center justify-center gap-3">
              <RefreshCw size={24} className="animate-spin text-emerald-400" />
              <span className="text-xs font-medium">Sincronizando catálogo de aparelhos...</span>
            </div>
          ) : products.length === 0 ? (
            <div className="bezel-chassis">
              <div className="bezel-core p-14 text-center text-white/40 flex flex-col items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-white/20">
                  <Smartphone size={26} />
                </div>
                <span className="text-sm font-semibold text-white/70">Nenhum aparelho em estoque</span>
                <p className="text-xs max-w-sm text-white/35">
                  Cadastre smartphones para que o Agente de IA possa consultar estoque, fotos e condições de pagamento automaticamente no WhatsApp.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {products.map((p) => {
                const cond = getConditionLabel(p.condition)
                return (
                  <div key={p.id} className="bezel-chassis group hover:-translate-y-1 transition-all duration-300">
                    <div className="bezel-core h-full flex flex-col justify-between">
                      <div>
                        {/* Hardware Header / Image & Specs */}
                        <div className="flex items-start justify-between gap-3 mb-4">
                          <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-emerald-400 shrink-0 p-1.5 shadow-inner">
                            {p.imageUrl ? (
                              <img src={p.imageUrl} alt={p.title} className="w-full h-full object-contain rounded-xl" />
                            ) : (
                              <Smartphone size={26} className="text-white/40" />
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-1.5">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${cond.bg}`}>
                              {cond.label}
                            </span>
                            {p.batteryHealth && (
                              <span className="text-[10px] text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1 font-semibold">
                                <Battery size={11} /> {p.batteryHealth}% bateria
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Informações */}
                        <h3 className="font-bold text-base text-white group-hover:text-emerald-400 transition-colors tracking-tight">
                          {p.title}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-white/40 mt-1 mb-3 font-medium">
                          <span>{p.brand}</span>
                          {p.storage && <span>• {p.storage}</span>}
                          {p.color && <span>• {p.color}</span>}
                        </div>

                        {p.description && (
                          <p className="text-xs text-white/50 line-clamp-2 mb-3 leading-relaxed">{p.description}</p>
                        )}
                      </div>

                      {/* Preços e Ações */}
                      <div className="pt-3 border-t border-white/[0.06] mt-2">
                        <div className="flex items-baseline justify-between">
                          <div>
                            <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">À vista no Pix</div>
                            <div className="text-2xl font-black text-white tracking-tight">{formatCurrency(p.cashPrice)}</div>
                          </div>
                          {p.installmentPrice && (
                            <div className="text-right">
                              <div className="text-[10px] text-white/40">ou até {p.installmentCount || 12}x de</div>
                              <div className="text-xs font-bold text-white/80">
                                {formatCurrency(p.installmentPrice / (p.installmentCount || 12))}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-white/40 mt-3 pt-2.5 border-t border-white/[0.04]">
                          <span className="flex items-center gap-1.5 font-medium">
                            <ShieldCheck size={13} className="text-emerald-400" /> {p.warrantyMonths} meses garantia
                          </span>
                          <span className="font-semibold text-white/70">
                            Estoque: <strong className={p.stock > 0 ? 'text-emerald-400' : 'text-rose-400'}>{p.stock} un</strong>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      ) : (
        /* ─── Simulador de Trade-In (Studio Assessment) ─────────────────────── */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bezel-chassis">
            <div className="bezel-core p-6">
              <div className="flex items-center gap-2 mb-1.5 text-cyan-400 font-bold text-xs uppercase tracking-wider">
                <Sparkles size={14} /> Avaliação de Aparelho
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight mb-1">Simular Compra com Troca</h2>
              <p className="text-xs text-white/40 mb-5 leading-relaxed">
                Descubra a faixa justa de valor para receber o smartphone usado do cliente como entrada na compra de um novo ou seminovo.
              </p>

              <form onSubmit={handleRunTradeIn} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Marca</label>
                    <select
                      value={simForm.brand}
                      onChange={(e) => setSimForm({ ...simForm, brand: e.target.value })}
                      className="input cursor-pointer"
                    >
                      <option value="Apple">Apple</option>
                      <option value="Samsung">Samsung</option>
                      <option value="Motorola">Motorola</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Modelo Usado</label>
                    <input
                      required
                      type="text"
                      value={simForm.model}
                      onChange={(e) => setSimForm({ ...simForm, model: e.target.value })}
                      placeholder="Ex: iPhone 12 Pro"
                      className="input"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Armazenamento</label>
                    <select
                      value={simForm.storage}
                      onChange={(e) => setSimForm({ ...simForm, storage: e.target.value })}
                      className="input cursor-pointer"
                    >
                      <option value="64GB">64GB</option>
                      <option value="128GB">128GB</option>
                      <option value="256GB">256GB</option>
                      <option value="512GB">512GB</option>
                      <option value="1TB">1TB</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Saúde Bateria (%)</label>
                    <input
                      type="number"
                      min="50"
                      max="100"
                      value={simForm.batteryHealth}
                      onChange={(e) => setSimForm({ ...simForm, batteryHealth: Number(e.target.value) })}
                      className="input"
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Estado Físico / Estético</label>
                  <select
                    value={simForm.condition}
                    onChange={(e) => setSimForm({ ...simForm, condition: e.target.value })}
                    className="input cursor-pointer"
                  >
                    <option value="IMPECAVEL">Impecável (sem marcas, película e capa sempre)</option>
                    <option value="EXCELENTE">Excelente (pequenas marcas leves de uso)</option>
                    <option value="BOM">Bom (riscos leves na carcaça ou tela)</option>
                    <option value="TELA_TRINCADA">Tela trincada / vidro quebrado</option>
                    <option value="DEFEITO_FUNCIONAL">Defeito funcional (FaceID, câmera ou botão)</option>
                  </select>
                </div>

                <div className="flex items-center gap-4 py-1">
                  <label className="flex items-center gap-2 cursor-pointer text-white/70 font-medium select-none">
                    <input
                      type="checkbox"
                      checked={simForm.hasBox}
                      onChange={(e) => setSimForm({ ...simForm, hasBox: e.target.checked })}
                      className="rounded border-white/20 text-emerald-500 focus:ring-emerald-500 h-4 w-4 bg-[#0d0e15]"
                    />
                    Possui Caixa Original
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-white/70 font-medium select-none">
                    <input
                      type="checkbox"
                      checked={simForm.hasCharger}
                      onChange={(e) => setSimForm({ ...simForm, hasCharger: e.target.checked })}
                      className="rounded border-white/20 text-emerald-500 focus:ring-emerald-500 h-4 w-4 bg-[#0d0e15]"
                    />
                    Possui Carregador Original
                  </label>
                </div>

                <div>
                  <label className="label">WhatsApp do Cliente (opcional)</label>
                  <input
                    type="text"
                    value={simForm.customerPhone}
                    onChange={(e) => setSimForm({ ...simForm, customerPhone: e.target.value })}
                    placeholder="Ex: 11999998888"
                    className="input"
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
                <div className="mt-5 p-4 rounded-2xl bg-gradient-to-br from-emerald-500/15 via-[#0c0e15] to-[#090a0f] border border-emerald-500/30 shadow-lg">
                  <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Faixa Sugerida de Entrada</div>
                  <div className="text-2xl font-black text-white mt-0.5 tracking-tight">
                    {formatCurrency(simResult.min)} ~ {formatCurrency(simResult.max)}
                  </div>
                  <p className="text-[11px] text-white/50 mt-1">
                    Crédito que o cliente pode abater na troca pelo smartphone novo ou seminovo.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-7 bezel-chassis">
            <div className="bezel-core p-6 h-full flex flex-col">
              <h2 className="text-base font-bold text-white tracking-tight mb-1">Últimas Avaliações de Usados (Trade-In)</h2>
              <p className="text-xs text-white/40 mb-4">Simulações calculadas no balcão e pelo Agente de IA no WhatsApp</p>

              {tradeIns.length === 0 ? (
                <div className="my-auto p-12 text-center text-white/30 text-xs">
                  Nenhuma avaliação de trade-in recente gravada.
                </div>
              ) : (
                <div className="divide-y divide-white/[0.06] text-xs flex-1 overflow-y-auto">
                  {tradeIns.slice(0, 10).map((t) => (
                    <div key={t.id} className="py-3 flex items-center justify-between gap-3 group">
                      <div>
                        <div className="font-semibold text-white/90 group-hover:text-emerald-400 transition-colors">
                          {t.brand} {t.model} {t.storage && `(${t.storage})`}
                        </div>
                        <div className="text-[11px] text-white/40 flex items-center gap-2 mt-0.5 font-medium">
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
                        <div className="font-extrabold text-emerald-400 tracking-tight">
                          {formatCurrency(t.minEvaluation)} - {formatCurrency(t.maxEvaluation)}
                        </div>
                        <span className="text-[10px] text-white/30 font-medium">faixa de recompra</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── Modal: Novo Aparelho / Produto ────────────────────────────────── */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bezel-chassis w-full max-w-2xl my-8">
            <div className="bezel-core p-6 bg-[#090a0f]">
              <div className="flex items-center justify-between border-b border-white/[0.07] pb-4 mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                    <Smartphone size={16} />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-white tracking-tight">Cadastrar Aparelho no Estoque</h3>
                    <p className="text-xs text-white/40">Disponibilize para o catálogo e para a IA no WhatsApp</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsNewModalOpen(false)}
                  className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.08] transition-all"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="label">Título Comercial *</label>
                    <input
                      required
                      type="text"
                      value={productForm.title}
                      onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                      placeholder="Ex: iPhone 13 128GB Meia-Noite Grau A+"
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">Marca *</label>
                    <select
                      value={productForm.brand}
                      onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                      className="input cursor-pointer"
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
                    <label className="label">Condição *</label>
                    <select
                      value={productForm.condition}
                      onChange={(e) => setProductForm({ ...productForm, condition: e.target.value })}
                      className="input cursor-pointer"
                    >
                      <option value="NOVO_LACRADO">Novo Lacrado</option>
                      <option value="SEMINOVO_EXCELENTE">Seminovo Grau A+ (Impecável)</option>
                      <option value="SEMINOVO_BOM">Seminovo Grau B (Marcas Leves)</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Armazenamento</label>
                    <input
                      type="text"
                      value={productForm.storage}
                      onChange={(e) => setProductForm({ ...productForm, storage: e.target.value })}
                      placeholder="Ex: 128GB"
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">Saúde Bateria (%)</label>
                    <input
                      type="number"
                      value={productForm.batteryHealth}
                      onChange={(e) => setProductForm({ ...productForm, batteryHealth: e.target.value })}
                      placeholder="Ex: 92"
                      className="input"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="label">Preço à Vista Pix (R$) *</label>
                    <input
                      required
                      type="number"
                      step="0.01"
                      value={productForm.cashPrice}
                      onChange={(e) => setProductForm({ ...productForm, cashPrice: e.target.value })}
                      placeholder="2500.00"
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">Preço Parcelado 12x (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={productForm.installmentPrice}
                      onChange={(e) => setProductForm({ ...productForm, installmentPrice: e.target.value })}
                      placeholder="2800.00"
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">Qtd em Estoque *</label>
                    <input
                      required
                      type="number"
                      value={productForm.stock}
                      onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                      className="input"
                    />
                  </div>
                </div>

                <div>
                  <label className="label">URL da Foto (opcional)</label>
                  <input
                    type="text"
                    value={productForm.imageUrl}
                    onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })}
                    placeholder="https://..."
                    className="input"
                  />
                </div>

                <div>
                  <label className="label">Descrição / Acessórios Inclusos</label>
                  <textarea
                    rows={2}
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    placeholder="Ex: Acompanha caixa original, cabo USB-C e garantia de 90 dias na loja."
                    className="input resize-none"
                  />
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
                    disabled={savingProduct}
                    className="btn-primary text-xs"
                  >
                    {savingProduct ? <RefreshCw size={14} className="animate-spin" /> : <ShoppingBag size={14} />}
                    Salvar Aparelho
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
