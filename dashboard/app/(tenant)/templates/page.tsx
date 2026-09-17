'use client'

import { useState, useEffect } from 'react'
import {
  Smartphone, ShoppingBag, Stethoscope, Building, Utensils,
  Briefcase, GraduationCap, Sparkles, CheckCircle2, ArrowRight,
  Bot, Kanban, MessageSquare, HelpCircle, RefreshCw, AlertCircle,
  ShieldCheck, Wrench, ChevronRight, Zap, Check, Eye, X
} from 'lucide-react'
import { templatesApi } from '@/lib/api'
import Link from 'next/link'

interface BusinessTemplate {
  id: string
  name: string
  shortDescription: string
  icon: string
  badge?: string
  isPrimary?: boolean
  color: string
  gradient: string
  persona: {
    name: string
    tone: string
    language: string
  }
  systemPrompt: string
  pipelineStages: Array<{
    name: string
    color: string
    order: number
  }>
  quickReplies: Array<{
    shortcut: string
    title: string
    content: string
  }>
  sampleFaq: {
    title: string
    content: string
  }
}

// Mapeamento dinâmico de ícones
const ICON_MAP: Record<string, any> = {
  Smartphone,
  ShoppingBag,
  Stethoscope,
  Building,
  Utensils,
  Briefcase,
  GraduationCap,
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<BusinessTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTemplate, setSelectedTemplate] = useState<BusinessTemplate | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'stages' | 'quickReplies' | 'faq'>('overview')
  const [applyingId, setApplyingId] = useState<string | null>(null)
  const [successModal, setSuccessModal] = useState<{ isOpen: boolean; templateName: string }>({
    isOpen: false,
    templateName: '',
  })

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      setLoading(true)
      const res = await templatesApi.list()
      if (res.data && res.data.templates) {
        setTemplates(res.data.templates)
      }
    } catch (err) {
      console.error('Erro ao buscar templates:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleApplyTemplate = async (template: BusinessTemplate) => {
    try {
      setApplyingId(template.id)
      await templatesApi.apply(template.id)
      setSuccessModal({
        isOpen: true,
        templateName: template.name,
      })
      if (selectedTemplate?.id === template.id) {
        setSelectedTemplate(null)
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao aplicar o modelo. Tente novamente.')
    } finally {
      setApplyingId(null)
    }
  }

  const primaryTemplate = templates.find((t) => t.isPrimary) || templates[0]
  const otherTemplates = templates.filter((t) => t.id !== primaryTemplate?.id)

  return (
    <div className="flex-1 flex flex-col h-full bg-surface-950 overflow-y-auto">
      {/* ─── Top Header ────────────────────────────────────────────────────────── */}
      <div className="p-8 border-b border-white/[0.06] bg-gradient-to-b from-surface-900/90 to-surface-950">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold mb-3">
                <Sparkles size={14} className="animate-spin-slow" />
                Agente Especialista Integrado
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tight">
                Assistência Técnica de Celulares & Loja
              </h1>
              <p className="mt-1 text-sm text-white/50 max-w-2xl">
                Configuração especializada da Persona técnica (Lucas), etapas do Funil de Bancada (Kanban),
                respostas rápidas de garantias/telas e orçamentos automáticos via WhatsApp.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/pipeline"
                className="px-4 py-2 rounded-xl bg-surface-800 hover:bg-surface-700 text-white/80 hover:text-white text-xs font-medium border border-white/[0.08] transition-all flex items-center gap-1.5"
              >
                <Kanban size={15} /> Ver Funil Atual
              </Link>
              <Link
                href="/ai-config"
                className="px-4 py-2 rounded-xl bg-surface-800 hover:bg-surface-700 text-white/80 hover:text-white text-xs font-medium border border-white/[0.08] transition-all flex items-center gap-1.5"
              >
                <Bot size={15} /> Configuração da IA
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-7xl w-full mx-auto p-8 space-y-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <RefreshCw className="animate-spin text-cyan-400" size={36} />
            <p className="text-white/40 text-sm">Carregando catálogo de modelos de negócio...</p>
          </div>
        ) : (
          <>
            {/* ─── 1. DESTAQUE PRINCIPAL: ASSISTÊNCIA TÉCNICA DE CELULARES ───────── */}
            {primaryTemplate && (
              <div className="relative overflow-hidden rounded-3xl border-2 border-cyan-500/30 bg-gradient-to-br from-surface-900 via-surface-900/90 to-cyan-950/30 shadow-2xl p-6 lg:p-8">
                {/* Efeito de brilho de fundo */}
                <div className="absolute top-0 right-0 -mt-8 -mr-8 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-1/3 -mb-12 w-64 h-64 bg-blue-600/10 rounded-full blur-2xl pointer-events-none" />

                <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
                  <div className="space-y-4 max-w-3xl">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                        <Sparkles size={13} /> {primaryTemplate.badge || '⭐ Modelo Principal'}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-medium flex items-center gap-1">
                        <ShieldCheck size={13} /> Garantia 90 Dias Integrada
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-medium flex items-center gap-1">
                        <Wrench size={13} /> Triagem de Bancada Express
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20 flex-shrink-0">
                        <Smartphone size={32} />
                      </div>
                      <div>
                        <h2 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
                          {primaryTemplate.name}
                        </h2>
                        <p className="text-white/60 text-sm mt-0.5">
                          {primaryTemplate.shortDescription}
                        </p>
                      </div>
                    </div>

                    {/* Destaques rápidos */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                      <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                        <div className="text-xs text-white/40 flex items-center gap-1.5 mb-1">
                          <Bot size={13} className="text-cyan-400" /> Consultor Técnico
                        </div>
                        <div className="text-sm font-semibold text-white">
                          {primaryTemplate.persona.name}
                        </div>
                        <div className="text-xs text-cyan-400/80 mt-0.5 truncate">
                          Tom: {primaryTemplate.persona.tone}
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                        <div className="text-xs text-white/40 flex items-center gap-1.5 mb-1">
                          <Kanban size={13} className="text-blue-400" /> Funil Especializado
                        </div>
                        <div className="text-sm font-semibold text-white">
                          {primaryTemplate.pipelineStages.length} Etapas de Bancada
                        </div>
                        <div className="text-xs text-white/40 mt-0.5 truncate">
                          Orçamento → Bancada → Retirada
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                        <div className="text-xs text-white/40 flex items-center gap-1.5 mb-1">
                          <MessageSquare size={13} className="text-emerald-400" /> Respostas & FAQ
                        </div>
                        <div className="text-sm font-semibold text-white">
                          {primaryTemplate.quickReplies.length} Atalhos Prontos
                        </div>
                        <div className="text-xs text-white/40 mt-0.5 truncate">
                          /orcamento, /telas, /molhado...
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Ações do modelo principal */}
                  <div className="w-full lg:w-auto flex flex-col sm:flex-row lg:flex-col gap-3 flex-shrink-0">
                    <button
                      onClick={() => handleApplyTemplate(primaryTemplate)}
                      disabled={applyingId === primaryTemplate.id}
                      className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-sm shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                    >
                      {applyingId === primaryTemplate.id ? (
                        <>
                          <RefreshCw size={16} className="animate-spin" />
                          Aplicando Configurações...
                        </>
                      ) : (
                        <>
                          <Zap size={16} className="fill-white group-hover:scale-110 transition-transform" />
                          Ativar Modelo Principal Agora
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        setSelectedTemplate(primaryTemplate)
                        setActiveTab('overview')
                      }}
                      className="px-6 py-3 rounded-xl bg-surface-800 hover:bg-surface-700 text-white/80 hover:text-white text-sm font-medium border border-white/[0.08] transition-all flex items-center justify-center gap-2"
                    >
                      <Eye size={16} /> Ver Detalhes e Roteiro
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ─── 2. OUTROS NICHOS & SEGMENTOS (apenas se existirem) ────────────────── */}
            {otherTemplates.length > 0 && (
              <div className="space-y-4 pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-white tracking-tight">
                      Outros Nichos e Segmentos
                    </h2>
                    <p className="text-xs text-white/40">
                      Templates pré-configurados com vocabulário, etapas e respostas específicas para cada mercado.
                    </p>
                  </div>
                  <span className="text-xs text-white/40">
                    {otherTemplates.length} segmentos disponíveis
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {otherTemplates.map((tpl) => {
                    const IconComponent = ICON_MAP[tpl.icon] || Sparkles
                    const isApplying = applyingId === tpl.id

                    return (
                      <div
                        key={tpl.id}
                        className="group flex flex-col justify-between p-6 rounded-2xl bg-surface-900 border border-white/[0.06] hover:border-white/[0.15] hover:bg-surface-850/80 transition-all duration-200 relative overflow-hidden shadow-lg"
                      >
                        <div className="space-y-4">
                          <div className="flex items-start justify-between">
                            <div
                              className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tpl.gradient} flex items-center justify-center text-white shadow-md`}
                            >
                              <IconComponent size={24} />
                            </div>
                            <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-white/[0.05] text-white/60 border border-white/[0.06]">
                              {tpl.pipelineStages.length} etapas CRM
                            </span>
                          </div>

                          <div>
                            <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">
                              {tpl.name}
                            </h3>
                            <p className="mt-1 text-xs text-white/50 line-clamp-2 leading-relaxed">
                              {tpl.shortDescription}
                            </p>
                          </div>

                          {/* Metadados */}
                          <div className="pt-2 border-t border-white/[0.04] space-y-1.5 text-xs text-white/40">
                            <div className="flex items-center gap-1.5">
                              <Bot size={13} className="text-white/30" />
                              <span className="text-white/60 font-medium">{tpl.persona.name}</span>
                              <span>•</span>
                              <span className="truncate">{tpl.persona.tone}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <MessageSquare size={13} className="text-white/30" />
                              <span>{tpl.quickReplies.length} atalhos rápidos prontos</span>
                            </div>
                          </div>
                        </div>

                        {/* Botões de Ação */}
                        <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedTemplate(tpl)
                              setActiveTab('overview')
                            }}
                            className="flex-1 px-3 py-2 rounded-xl bg-surface-800 hover:bg-surface-700 text-white/70 hover:text-white text-xs font-medium border border-white/[0.06] transition-all flex items-center justify-center gap-1.5"
                          >
                            <Eye size={14} /> Detalhes
                          </button>

                          <button
                            onClick={() => handleApplyTemplate(tpl)}
                            disabled={isApplying}
                            className="flex-1 px-3 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500 text-cyan-400 hover:text-white border border-cyan-500/20 hover:border-cyan-500 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                          >
                            {isApplying ? (
                              <RefreshCw size={14} className="animate-spin" />
                            ) : (
                              <>
                                <Zap size={13} /> Aplicar
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ─── MODAL DE DETALHES DO TEMPLATE ────────────────────────────────────── */}
      {selectedTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-4xl max-h-[90vh] bg-surface-900 border border-white/[0.1] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-white/[0.08] flex items-center justify-between bg-surface-950/60">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${selectedTemplate.gradient} flex items-center justify-center text-white`}
                >
                  {(() => {
                    const Icon = ICON_MAP[selectedTemplate.icon] || Sparkles
                    return <Icon size={20} />
                  })()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white">{selectedTemplate.name}</h3>
                    {selectedTemplate.isPrimary && (
                      <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-bold">
                        Destaque
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-white/50">{selectedTemplate.shortDescription}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedTemplate(null)}
                className="w-8 h-8 rounded-lg bg-surface-800 hover:bg-surface-700 text-white/60 hover:text-white flex items-center justify-center transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="flex items-center border-b border-white/[0.08] px-6 bg-surface-900/50">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
                  activeTab === 'overview'
                    ? 'border-cyan-400 text-cyan-400'
                    : 'border-transparent text-white/40 hover:text-white/80'
                }`}
              >
                <Bot size={15} /> Persona & Prompt da IA
              </button>
              <button
                onClick={() => setActiveTab('stages')}
                className={`px-4 py-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
                  activeTab === 'stages'
                    ? 'border-cyan-400 text-cyan-400'
                    : 'border-transparent text-white/40 hover:text-white/80'
                }`}
              >
                <Kanban size={15} /> Funil CRM ({selectedTemplate.pipelineStages.length})
              </button>
              <button
                onClick={() => setActiveTab('quickReplies')}
                className={`px-4 py-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
                  activeTab === 'quickReplies'
                    ? 'border-cyan-400 text-cyan-400'
                    : 'border-transparent text-white/40 hover:text-white/80'
                }`}
              >
                <MessageSquare size={15} /> Atalhos ({selectedTemplate.quickReplies.length})
              </button>
              <button
                onClick={() => setActiveTab('faq')}
                className={`px-4 py-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
                  activeTab === 'faq'
                    ? 'border-cyan-400 text-cyan-400'
                    : 'border-transparent text-white/40 hover:text-white/80'
                }`}
              >
                <HelpCircle size={15} /> FAQ & Conhecimento
              </button>
            </div>

            {/* Modal Content Body */}
            <div className="flex-1 p-6 overflow-y-auto scrollbar-thin space-y-6">
              {activeTab === 'overview' && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-surface-950 border border-white/[0.06]">
                      <div className="text-xs text-white/40 mb-1">Nome do Agente Virtual</div>
                      <div className="text-sm font-semibold text-white">
                        {selectedTemplate.persona.name}
                      </div>
                    </div>
                    <div className="p-4 rounded-xl bg-surface-950 border border-white/[0.06]">
                      <div className="text-xs text-white/40 mb-1">Tom de Voz</div>
                      <div className="text-sm font-semibold text-white">
                        {selectedTemplate.persona.tone}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-white/70 block mb-2">
                      Prompt de Sistema (Instruções do Agente):
                    </label>
                    <div className="p-4 rounded-xl bg-surface-950 border border-white/[0.06] text-xs font-mono text-white/80 whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto">
                      {selectedTemplate.systemPrompt}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'stages' && (
                <div className="space-y-4">
                  <p className="text-xs text-white/50">
                    Ao aplicar este modelo, as etapas do seu Funil de Vendas Kanban serão configuradas na seguinte ordem:
                  </p>
                  <div className="space-y-2">
                    {selectedTemplate.pipelineStages.map((stage, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3.5 rounded-xl bg-surface-950 border border-white/[0.06]"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-white/[0.05] text-white/60 text-xs flex items-center justify-center font-semibold">
                            {stage.order || idx + 1}
                          </span>
                          <span
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: stage.color }}
                          />
                          <span className="text-sm font-medium text-white">{stage.name}</span>
                        </div>
                        <span className="text-[11px] text-white/30">Etapa {idx + 1}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'quickReplies' && (
                <div className="space-y-4">
                  <p className="text-xs text-white/50">
                    Respostas prontas que seus atendentes e a IA podem disparar no Inbox Pro digitando <span className="text-cyan-400 font-mono">/</span>:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedTemplate.quickReplies.map((qr, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-xl bg-surface-950 border border-white/[0.06] space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono text-cyan-400 font-bold bg-cyan-500/10 px-2 py-0.5 rounded">
                            {qr.shortcut}
                          </span>
                          <span className="text-xs text-white/40">{qr.title}</span>
                        </div>
                        <p className="text-xs text-white/70 leading-relaxed">
                          {qr.content}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'faq' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-300">
                    Este documento técnico será indexado automaticamente via Inteligência Artificial (RAG) na Base de Conhecimento da sua empresa para responder dúvidas frequentes no WhatsApp.
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white mb-2">
                      {selectedTemplate.sampleFaq.title}
                    </h4>
                    <div className="p-4 rounded-xl bg-surface-950 border border-white/[0.06] text-xs font-mono text-white/80 whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto">
                      {selectedTemplate.sampleFaq.content}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 px-6 border-t border-white/[0.08] bg-surface-950/60 flex items-center justify-between">
              <button
                onClick={() => setSelectedTemplate(null)}
                className="px-4 py-2 rounded-xl bg-surface-800 hover:bg-surface-700 text-white/70 text-xs font-medium transition-colors"
              >
                Fechar
              </button>

              <button
                onClick={() => handleApplyTemplate(selectedTemplate)}
                disabled={applyingId === selectedTemplate.id}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {applyingId === selectedTemplate.id ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    Aplicando no Sistema...
                  </>
                ) : (
                  <>
                    <Zap size={14} />
                    Aplicar Configurações no Meu Sistema
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL DE SUCESSO ─────────────────────────────────────────────────── */}
      {successModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-surface-900 border border-white/[0.1] rounded-2xl shadow-2xl p-6 text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/30">
              <CheckCircle2 size={36} />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-bold text-white">Modelo Ativado com Sucesso!</h3>
              <p className="text-xs text-white/60">
                O modelo <strong className="text-cyan-400">{successModal.templateName}</strong> foi configurado na sua conta.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-surface-950 border border-white/[0.06] text-left text-xs space-y-2 text-white/70">
              <div className="flex items-center gap-2 text-emerald-400">
                <Check size={14} /> Persona e Prompt de Atendimento atualizados
              </div>
              <div className="flex items-center gap-2 text-emerald-400">
                <Check size={14} /> Etapas do Funil CRM (Kanban) reconfiguradas
              </div>
              <div className="flex items-center gap-2 text-emerald-400">
                <Check size={14} /> Respostas rápidas (/atalhos) cadastradas
              </div>
              <div className="flex items-center gap-2 text-emerald-400">
                <Check size={14} /> FAQ indexado na Base de Conhecimento RAG
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
              <Link
                href="/pipeline"
                className="w-full sm:flex-1 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <Kanban size={14} /> Ver Funil CRM
              </Link>
              <button
                onClick={() => setSuccessModal({ isOpen: false, templateName: '' })}
                className="w-full sm:flex-1 py-2.5 rounded-xl bg-surface-800 hover:bg-surface-700 text-white/80 text-xs font-medium transition-colors"
              >
                Concluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
