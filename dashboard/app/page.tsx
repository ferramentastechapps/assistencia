'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  MessageCircle, Play, Pause, ChevronDown, Check,
  Sparkles, Smartphone, ShoppingBag, Shield, Clock,
  Users, Mic, Wrench, Battery, RefreshCw, PhoneCall
} from 'lucide-react'

// Cenários — 100% focados em assistência técnica de celulares
const SCENARIOS = {
  conserto: {
    id: 'conserto',
    title: 'Orçamento de Conserto',
    icon: Wrench,
    agentName: 'Lucas • Técnico Virtual',
    agentAvatar: '👨‍🔧',
    userMessage: 'Oi! Meu iPhone 13 caiu e a tela trincou toda. Vocês trocam hoje? Quanto fica mais ou menos?',
    audioDuration: '0:10',
    audioText: 'O cliente enviou um áudio perguntando sobre o conserto.',
    aiResponse: 'Olá! Sim, realizamos a troca da tela do iPhone 13 hoje mesmo em cerca de 40 minutos na nossa bancada! 📱\n\nTrabalhamos com telas Originais Apple e Premium OLED de 1ª linha, com 90 dias de garantia e sensibilidade de toque perfeita.\n\nPelo modelo, a troca fica entre R$ 480 e R$ 650. Prefere trazer na loja ou quer motoboy para buscar seu aparelho?',
    statusBadge: 'Orçamento Enviado',
    statusColor: '#06B6D4'
  },
  status: {
    id: 'status',
    title: 'Status de Conserto',
    icon: Clock,
    agentName: 'Lucas • Técnico Virtual',
    agentAvatar: '👨‍🔧',
    userMessage: 'Boa tarde! Quero saber se meu celular ficou pronto. Minha OS é a OS-1043.',
    audioDuration: '0:08',
    audioText: 'O cliente enviou um áudio consultando o status do conserto.',
    aiResponse: '✅ *OS-1043 — PRONTO PARA RETIRADA!* 🎉\n\nSeu Samsung Galaxy A54 passou em todos os testes técnicos e o conserto foi concluído com sucesso!\n\nVocê pode passar buscar quando preferir. Horário: Seg-Sex 8h30–18h30, Sáb 9h–13h.\n\nLembrando: o serviço tem garantia de 90 dias! 🛡️',
    statusBadge: 'Aparelho Pronto',
    statusColor: '#10B981'
  },
  venda: {
    id: 'venda',
    title: 'Comprar Celular',
    icon: ShoppingBag,
    agentName: 'Lucas • Técnico Virtual',
    agentAvatar: '👨‍🔧',
    userMessage: 'Quero trocar meu celular! Tenho um iPhone 11 128GB em bom estado. Vocês avaliam pra dar como entrada?',
    audioDuration: '0:13',
    audioText: 'O cliente enviou um áudio sobre trade-in do celular.',
    aiResponse: '🔄 Ótimo! O iPhone 11 128GB em bom estado tem avaliação estimada de *R$ 850 a R$ 1.000* como entrada na compra de um novo ou seminovo.\n\nTemos disponíveis agora:\n• *iPhone 13 128GB* — R$ 1.900 no Pix\n• *Samsung Galaxy S23* — R$ 2.200 no Pix\n• *Motorola Edge 50* — R$ 1.700 no Pix\n\nQuer ver fotos de algum? Com o trade-in do seu iPhone você já sai com aparelho novo! 🎯',
    statusBadge: 'Trade-In Avaliado',
    statusColor: '#8B5CF6'
  }
}

export default function LandingPage() {
  const [activeScenario, setActiveScenario] = useState<'conserto' | 'status' | 'venda'>('conserto')
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  // Observer nativo para animações suaves conforme rola a página
  const revealRefs = useRef<(HTMLElement | null)[]>([])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('opacity-100', 'translate-y-0')
            entry.target.classList.remove('opacity-0', 'translate-y-8')
          }
        })
      },
      { threshold: 0.1 }
    )

    revealRefs.current.forEach((el) => {
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [])

  const addRevealRef = (el: HTMLElement | null) => {
    if (el && !revealRefs.current.includes(el)) {
      revealRefs.current.push(el)
    }
  }

  const scenario = SCENARIOS[activeScenario]

  const faqs = [
    {
      q: 'A IA realmente sabe dar orçamentos de conserto de celular?',
      a: 'Sim! Você cadastra sua própria tabela de preços de referência por modelo e serviço (tela, bateria, conector, etc.). Quando o cliente perguntar o preço, a IA consulta a tabela e responde com os valores reais da sua loja, sem inventar nada.'
    },
    {
      q: 'O sistema avisa o cliente automaticamente quando o aparelho fica pronto?',
      a: 'Sim, com 1 clique! Quando você muda o status da OS para "Pronto", o sistema envia automaticamente uma mensagem personalizada para o WhatsApp do cliente avisando que o aparelho pode ser retirado, com o seu horário de funcionamento.'
    },
    {
      q: 'Ela entende áudios de voz do cliente?',
      a: 'Sim! Mais de 40% dos clientes preferem mandar áudio. A IA escuta qualquer áudio enviado pelo cliente, compreende o que foi pedido (tipo de conserto, modelo do celular, dúvida sobre peça) e responde de forma precisa e simpática.'
    },
    {
      q: 'E se o cliente falar de um celular que caiu na água?',
      a: 'A IA já está preparada! Quando o cliente mencionar que o celular molhou, ela alerta imediatamente para NÃO ligar o aparelho e NÃO colocar no carregador, e pede para trazer urgente para desoxidação — exatamente como um técnico experiente faria.'
    },
    {
      q: 'Posso assumir a conversa a qualquer momento?',
      a: 'Com certeza! A qualquer momento você ou sua equipe pode entrar no Inbox e responder o cliente. O sistema detecta que um humano começou a falar e pausa a IA automaticamente. O histórico completo fica visível para você continuar de onde a IA parou.'
    },
    {
      q: 'Como funciona o teste gratuito de 500 mensagens?',
      a: 'Ao criar sua conta, você recebe 500 mensagens para usar no seu ritmo, sem prazo de validade e sem precisar cadastrar cartão. Todas as funcionalidades ficam liberadas: ordens de serviço, catálogo de celulares, trade-in, notificações automáticas e inbox de atendimento.'
    }
  ]

  return (
    <div className="min-h-screen bg-[#050507] text-white selection:bg-emerald-500 selection:text-black font-sans relative overflow-hidden">
      {/* ─── Luz e Ambiente Sutil (Sem exagero de IA) ─────────────────────────── */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[380px] bg-emerald-500/10 blur-[130px] pointer-events-none rounded-full z-0" />
      <div className="fixed bottom-0 right-10 w-[500px] h-[500px] bg-teal-500/5 blur-[140px] pointer-events-none rounded-full z-0" />

      {/* ─── Header / Barra de Navegação ────────────────────────────────────── */}
      <header className="sticky top-4 z-50 max-w-5xl mx-auto px-4">
        <nav className="border border-white/[0.08] backdrop-blur-2xl bg-[#0b0f0d]/80 rounded-full px-6 h-14 flex items-center justify-between shadow-2xl">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center shadow-[0_0_12px_rgba(16,185,129,0.5)]">
              <MessageCircle className="w-4 h-4 text-black stroke-[2.5]" />
            </div>
            <span className="font-semibold text-base tracking-tight text-white">
              Zap<span className="text-emerald-400">IA</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6 text-xs font-light text-zinc-400">
            <a href="#simulator" className="hover:text-white transition-colors">Como funciona</a>
            <a href="#beneficios" className="hover:text-white transition-colors">Vantagens</a>
            <a href="#modelos" className="hover:text-white transition-colors">Seu segmento</a>
            <a href="#precos" className="hover:text-white transition-colors">Preços</a>
            <a href="#faq" className="hover:text-white transition-colors">Dúvidas</a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs font-light text-zinc-400 hover:text-white transition-colors px-2 py-1"
            >
              Entrar
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 rounded-full bg-white/[0.08] hover:bg-white/[0.12] border border-white/[0.1] text-xs font-medium text-white transition-all"
            >
              Criar conta grátis
            </Link>
          </div>
        </nav>
      </header>

      {/* ─── Hero Section ───────────────────────────────────────────────────── */}
      <section className="relative z-10 pt-20 pb-20 px-4 max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-medium mb-6">
          <Sparkles size={12} /> Especialista em Assistência Técnica de Celulares
        </div>
        {/* Título */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-white max-w-3xl mx-auto leading-[1.15] mb-5">
          O assistente de IA que cuida do WhatsApp da sua assistência técnica
        </h1>

        {/* Subtítulo */}
        <p className="text-base sm:text-lg font-light text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Da mensagem do cliente ao aviso de &quot;aparelho pronto&quot; — tudo automático. Orçamentos,
          status de OS, catálogo de celulares e trade-in, sem você precisar parar a bancada.
        </p>

        {/* ─── O BOTÃO NO ESTILO ASIMOV COM BRILHO SUAVE ────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16">
          <div className="relative group inline-block">
            {/* 1. Halo difuso de luz de fundo (Glow Effect) */}
            <div className="absolute -inset-1 rounded-full bg-emerald-500/30 blur-xl opacity-70 transition-all duration-500 group-hover:bg-emerald-500/50 group-hover:blur-2xl group-hover:opacity-100 pointer-events-none" />

            {/* 2. Botão Principal com feixe de luz giratório e sombra */}
            <Link
              href="/register"
              className="button-glow"
            >
              {/* Camada da borda giratória */}
              <div className="button-glow__border">
                <div className="button-glow__border-spin" />
              </div>

              {/* Máscara do fundo interno (deixa 1px de borda aparente) */}
              <div className="button-glow__inner" />

              {/* Conteúdo visível do botão */}
              <div className="button-glow__content">
                <div className="button-glow__icon">
                  <svg className="h-3.5 w-3.5 fill-black ml-0.5" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
                <span className="button-glow__label">Testar 500 mensagens grátis</span>
                <div className="button-glow__arrow">
                  <svg className="h-3.5 w-3.5 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </div>
              </div>
            </Link>
          </div>

          {/* Prova Social com avatares reais ao lado do botão */}
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2.5 overflow-hidden">
              <img
                className="inline-block h-8 w-8 rounded-full ring-2 ring-[#050507] object-cover"
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                alt="Cliente"
              />
              <img
                className="inline-block h-8 w-8 rounded-full ring-2 ring-[#050507] object-cover"
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
                alt="Cliente"
              />
              <img
                className="inline-block h-8 w-8 rounded-full ring-2 ring-[#050507] object-cover"
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80"
                alt="Cliente"
              />
              <img
                className="inline-block h-8 w-8 rounded-full ring-2 ring-[#050507] object-cover"
                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80"
                alt="Cliente"
              />
            </div>
            <div className="text-left text-xs font-light text-zinc-400">
              <strong className="text-white font-medium">+400 empresas</strong> já atendem no piloto automático
            </div>
          </div>
        </div>

        {/* Garantias sem atrito em letras finas */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-light text-zinc-500">
          <span className="flex items-center gap-1.5">
            <Check size={13} className="text-emerald-400" /> Sem cartão de crédito
          </span>
          <span className="flex items-center gap-1.5">
            <Check size={13} className="text-emerald-400" /> Sem prazo de validade
          </span>
          <span className="flex items-center gap-1.5">
            <Check size={13} className="text-emerald-400" /> Sem marca d'água nas respostas
          </span>
          <span className="flex items-center gap-1.5">
            <Check size={13} className="text-emerald-400" /> Conexão em 30 segundos
          </span>
        </div>

        {/* ─── SIMULADOR INTERATIVO AO VIVO DO WHATSAPP ─────────────────────── */}
        <div id="simulator" className="mt-14 max-w-3xl mx-auto">
          <div className="rounded-3xl border border-white/[0.08] bg-[#0b0f0d] p-5 sm:p-7 shadow-2xl text-left">
            {/* Barra de alternância de cenários */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-white/[0.06]">
              <div>
                <div className="text-xs font-medium text-emerald-400 flex items-center gap-1.5 mb-0.5">
                  <Sparkles size={12} /> Demonstração ao vivo
                </div>
                <div className="text-sm font-medium text-white">
                  Veja como a IA responde em cada situação:
                </div>
              </div>

              <div className="flex items-center gap-1 p-1 bg-black/40 rounded-xl border border-white/[0.05]">
                {(['conserto', 'status', 'venda'] as const).map((key) => {
                  const item = SCENARIOS[key]
                  const isActive = activeScenario === key
                  const Icon = item.icon
                  return (
                    <button
                      key={key}
                      onClick={() => setActiveScenario(key)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                        isActive
                          ? 'bg-emerald-500 text-black shadow-sm font-semibold'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      <Icon size={13} />
                      {item.title}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Janela de Mensagens estilo WhatsApp */}
            <div className="mt-5 rounded-2xl bg-[#080d0a] border border-white/[0.05] p-4 sm:p-5 space-y-4">
              {/* Topo do chat */}
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.05] text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">{scenario.agentAvatar}</span>
                  <div>
                    <div className="font-medium text-white flex items-center gap-1.5">
                      {scenario.agentName}
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    </div>
                    <div className="text-[11px] font-light text-zinc-500">Atendente Virtual Ativo</div>
                  </div>
                </div>

                <div className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-white/[0.04] text-zinc-300 border border-white/[0.06]">
                  {scenario.statusBadge}
                </div>
              </div>

              {/* Mensagem do cliente */}
              <div className="flex flex-col items-end">
                <div className="bg-[#004d40] text-white rounded-2xl rounded-tr-none px-4 py-3 max-w-md shadow-sm">
                  <p className="text-xs sm:text-sm font-normal leading-relaxed">{scenario.userMessage}</p>
                  <div className="text-[10px] text-white/40 text-right mt-1">14:32 ✓✓</div>
                </div>

                {/* Player de áudio simulado */}
                <div className="mt-2 bg-[#121915] border border-white/[0.06] rounded-xl p-2.5 max-w-xs flex items-center gap-3">
                  <button
                    onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                    className="w-8 h-8 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black flex items-center justify-center transition-colors flex-shrink-0"
                  >
                    {isPlayingAudio ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
                  </button>
                  <div className="flex-1">
                    <div className="flex items-center gap-1 h-3.5">
                      {[30, 60, 20, 85, 50, 35, 75, 45, 60, 25, 80, 35, 65, 45, 25].map((h, i) => (
                        <div
                          key={i}
                          className="w-1 bg-emerald-400 rounded-full transition-all duration-300"
                          style={{
                            height: isPlayingAudio ? `${Math.max(20, h * (i % 2 === 0 ? 1 : 0.6))}%` : `${h}%`,
                            opacity: isPlayingAudio ? 1 : 0.4
                          }}
                        />
                      ))}
                    </div>
                    <div className="flex justify-between text-[10px] font-light text-zinc-500 mt-1">
                      <span>Áudio de voz transcrito</span>
                      <span>{scenario.audioDuration}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Resposta da IA */}
              <div className="flex flex-col items-start pt-1">
                <div className="bg-[#121915] text-zinc-200 rounded-2xl rounded-tl-none px-4 py-3.5 max-w-lg shadow-sm border border-white/[0.04]">
                  <p className="text-xs sm:text-sm font-light leading-relaxed whitespace-pre-line text-zinc-200">
                    {scenario.aiResponse}
                  </p>
                  <div className="text-[10px] font-light text-zinc-500 text-right mt-2">
                    Respondido instantaneamente
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Stats ─────────────────────────────────────────────────────────── */}
      <section className="py-12 px-4 border-t border-white/[0.06] relative z-10">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { value: '+8.000', label: 'OS geradas por mês' },
            { value: '94%', label: 'clientes avisados antes de ligar' },
            { value: '< 30s', label: 'tempo de resposta ao cliente' },
            { value: '90 dias', label: 'de garantia cobertos pela IA' },
          ].map((stat, i) => (
            <div key={i} ref={addRevealRef} className="text-center opacity-0 translate-y-8 transition-all duration-700">
              <div className="text-2xl sm:text-3xl font-semibold text-white">{stat.value}</div>
              <div className="text-xs font-light text-zinc-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Funcionalidades Especializadas ──────────────────────────────────── */}
      <section id="funcionalidades" className="py-20 px-4 max-w-5xl mx-auto relative z-10 border-t border-white/[0.06]">
        <div
          ref={addRevealRef}
          className="text-center max-w-xl mx-auto mb-16 opacity-0 translate-y-8 transition-all duration-700"
        >
          <div className="text-xs font-medium text-emerald-400 mb-2">Feito para Assistência Técnica</div>
          <h2 className="text-2xl sm:text-4xl font-semibold tracking-tight text-white mb-3">
            Tudo o que sua loja precisa, em um só lugar
          </h2>
          <p className="text-sm font-light text-zinc-400 leading-relaxed">
            Orçamentos, OS, catálogo, trade-in e atendimento humano. A IA cuida do WhatsApp enquanto você cuida da bancada.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Orçamentos automáticos */}
          <div ref={addRevealRef} className="p-7 rounded-3xl bg-[#0b0f0d] border border-white/[0.06] hover:border-emerald-500/30 transition-all opacity-0 translate-y-8 duration-700">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4"><Wrench size={20} /></div>
            <h3 className="text-lg font-medium text-white mb-2">Orçamentos automáticos por modelo</h3>
            <p className="text-xs sm:text-sm font-light text-zinc-400 leading-relaxed">
              Cadastre sua tabela de preços de tela, bateria, conector e desoxidação. Quando o cliente perguntar, a IA consulta e responde com os valores reais da sua loja — nunca inventa preços.
            </p>
          </div>

          {/* Gestão de OS */}
          <div ref={addRevealRef} className="p-7 rounded-3xl bg-[#0b0f0d] border border-white/[0.06] hover:border-emerald-500/30 transition-all opacity-0 translate-y-8 duration-700 delay-100">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center mb-4"><Clock size={20} /></div>
            <h3 className="text-lg font-medium text-white mb-2">Ordens de Serviço com notificação automática</h3>
            <p className="text-xs sm:text-sm font-light text-zinc-400 leading-relaxed">
              Gerencie OS com status visuais: Triagem, Em Bancada, Aguardando Peça, Pronto. Com 1 clique o cliente recebe no WhatsApp a mensagem de que o aparelho está pronto para retirada.
            </p>
          </div>

          {/* Catálogo + Trade-In */}
          <div ref={addRevealRef} className="p-7 rounded-3xl bg-[#0b0f0d] border border-white/[0.06] hover:border-emerald-500/30 transition-all opacity-0 translate-y-8 duration-700">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-4"><Smartphone size={20} /></div>
            <h3 className="text-lg font-medium text-white mb-2">Catálogo de celulares + Trade-In integrado</h3>
            <p className="text-xs sm:text-sm font-light text-zinc-400 leading-relaxed">
              Cadastre seus seminovos e novos lacrados. A IA mostra os aparelhos disponíveis e calcula automaticamente o valor do celular usado do cliente como entrada — simulador de trade-in integrado.
            </p>
          </div>

          {/* Áudios + intervenção */}
          <div ref={addRevealRef} className="p-7 rounded-3xl bg-[#0b0f0d] border border-white/[0.06] hover:border-emerald-500/30 transition-all opacity-0 translate-y-8 duration-700 delay-100">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-4"><Mic size={20} /></div>
            <h3 className="text-lg font-medium text-white mb-2">Entende áudios e seus técnicos assumem quando precisar</h3>
            <p className="text-xs sm:text-sm font-light text-zinc-400 leading-relaxed">
              A IA transcreve e responde áudios de voz. Se quiser assumir a conversa para fechar uma venda especial, basta digitar — a IA para e te passa o histórico completo.
            </p>
          </div>
        </div>

        {/* Banner: Aparelho molhado */}
        <div ref={addRevealRef} className="mt-6 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 opacity-0 translate-y-8 transition-all duration-700">
          <div className="text-2xl">⚠️</div>
          <div>
            <div className="text-sm font-semibold text-amber-300 mb-1">Aparelho que caiu na água? A IA já sabe o que fazer.</div>
            <div className="text-xs font-light text-zinc-400 leading-relaxed">
              Quando o cliente mencionar que o celular molhou, a IA alerta imediatamente: <em className="text-zinc-300">&quot;NÃO ligue, NÃO carregue — traga urgente para desoxidação!&quot;</em> Exatamente como um técnico experiente responderia.
            </div>
          </div>
        </div>

      </section>

      {/* ─── Planos e Preços ─────────────────────────────────────────────────── */}
      <section id="precos" className="py-20 px-4 max-w-5xl mx-auto relative z-10 border-t border-white/[0.06]">
        <div
          ref={addRevealRef}
          className="text-center max-w-xl mx-auto mb-14 opacity-0 translate-y-8 transition-all duration-700"
        >
          <div className="text-xs font-medium text-emerald-400 mb-2">Preços Transparentes</div>
          <h2 className="text-2xl sm:text-4xl font-semibold tracking-tight text-white mb-3">
            Comece grátis e escale quando quiser
          </h2>
          <p className="text-sm font-light text-zinc-400 leading-relaxed">
            Sem cartão de crédito no cadastro. Você ganha 500 mensagens de cortesia para ver a ferramenta funcionando na prática.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card Free */}
          <div
            ref={addRevealRef}
            className="p-7 rounded-3xl bg-[#0b0f0d] border border-white/[0.08] flex flex-col justify-between opacity-0 translate-y-8 transition-all duration-700"
          >
            <div>
              <div className="text-xs font-medium text-emerald-400 uppercase tracking-wider mb-2">
                Teste Gratuito
              </div>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-3xl sm:text-4xl font-semibold text-white">R$ 0</span>
                <span className="text-xs font-light text-zinc-500">/ cortesia inicial</span>
              </div>

              <ul className="space-y-3 text-xs font-light text-zinc-300 mb-8">
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-400 flex-shrink-0" />
                  <span><strong>500 mensagens grátis</strong> para teste</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-400 flex-shrink-0" />
                  <span><strong>Sem prazo de validade</strong> (use no seu ritmo)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-400 flex-shrink-0" />
                  <span><strong>Sem marca d'água</strong> nas respostas</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-400 flex-shrink-0" />
                  <span>Entendimento de áudios de voz</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-400 flex-shrink-0" />
                  <span>1 número de WhatsApp conectado</span>
                </li>
              </ul>
            </div>

            <Link
              href="/register"
              className="w-full py-3 rounded-full bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-xs font-medium text-center text-white transition-all"
            >
              Começar teste grátis
            </Link>
          </div>

          {/* Card Pro */}
          <div
            ref={addRevealRef}
            className="p-7 rounded-3xl bg-[#080d0a] border-2 border-emerald-500/50 flex flex-col justify-between relative shadow-xl shadow-emerald-500/10 opacity-0 translate-y-8 transition-all duration-700"
          >
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3.5 py-0.5 rounded-full bg-emerald-500 text-black text-[10px] font-bold uppercase tracking-wider">
              Mais Escolhido
            </div>

            <div>
              <div className="text-xs font-medium text-emerald-400 uppercase tracking-wider mb-2">
                Plano Pro
              </div>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-3xl sm:text-4xl font-semibold text-white">R$ 147</span>
                <span className="text-xs font-light text-zinc-500">/ mês</span>
              </div>

              <ul className="space-y-3 text-xs font-light text-zinc-200 mb-8">
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-400 flex-shrink-0" />
                  <span><strong>10.000 mensagens</strong> por mês</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-400 flex-shrink-0" />
                  <span>Até 5 números de WhatsApp</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-400 flex-shrink-0" />
                  <span>Base de conhecimento com até 50 arquivos</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-400 flex-shrink-0" />
                  <span>Organização completa de pedidos e vendas</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-400 flex-shrink-0" />
                  <span>Suporte prioritário no WhatsApp</span>
                </li>
              </ul>
            </div>

            <Link
              href="/register"
              className="w-full py-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs text-center transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)]"
            >
              Assinar Plano Pro
            </Link>
          </div>

          {/* Card Enterprise */}
          <div
            ref={addRevealRef}
            className="p-7 rounded-3xl bg-[#0b0f0d] border border-white/[0.08] flex flex-col justify-between opacity-0 translate-y-8 transition-all duration-700"
          >
            <div>
              <div className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
                Empresas Maiores
              </div>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-2xl sm:text-3xl font-semibold text-white">Sob Medida</span>
              </div>

              <ul className="space-y-3 text-xs font-light text-zinc-400 mb-8">
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-400 flex-shrink-0" />
                  <span>Volume de mensagens ilimitado</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-400 flex-shrink-0" />
                  <span>Múltiplos números e atendentes</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-400 flex-shrink-0" />
                  <span>Integrações com seu sistema próprio</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-400 flex-shrink-0" />
                  <span>Acompanhamento e suporte dedicado</span>
                </li>
              </ul>
            </div>

            <Link
              href="/register"
              className="w-full py-3 rounded-full bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-xs font-medium text-center text-white transition-all"
            >
              Falar com nossa equipe
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Dúvidas Frequentes (FAQ) ────────────────────────────────────────── */}
      <section id="faq" className="py-20 px-4 max-w-3xl mx-auto relative z-10 border-t border-white/[0.06]">
        <div
          ref={addRevealRef}
          className="text-center mb-12 opacity-0 translate-y-8 transition-all duration-700"
        >
          <div className="text-xs font-medium text-emerald-400 mb-2">Dúvidas Frequentes</div>
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white mb-2">
            Perguntas mais comuns
          </h2>
          <p className="text-xs sm:text-sm font-light text-zinc-400">
            Tudo o que você precisa saber antes de iniciar seu teste gratuito.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx
            return (
              <div
                key={idx}
                ref={addRevealRef}
                className="rounded-2xl bg-[#0b0f0d] border border-white/[0.06] overflow-hidden opacity-0 translate-y-8 transition-all duration-700"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-normal text-xs sm:text-sm text-white"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    size={15}
                    className={`text-zinc-500 transition-transform duration-200 flex-shrink-0 ${
                      isOpen ? 'rotate-180 text-emerald-400' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs sm:text-sm font-light text-zinc-400 leading-relaxed border-t border-white/[0.04] pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* ─── CTA Final com o Botão Asimov ─────────────────────────────────────── */}
      <section className="py-20 px-4 max-w-4xl mx-auto relative z-10">
        <div
          ref={addRevealRef}
          className="rounded-3xl border border-emerald-500/30 bg-gradient-to-b from-[#080d0a] to-[#040605] p-8 sm:p-14 text-center shadow-2xl opacity-0 translate-y-8 transition-all duration-700"
        >
          <div className="text-4xl mb-4">🔧</div>
          <h2 className="text-2xl sm:text-4xl font-semibold tracking-tight text-white mb-4 max-w-xl mx-auto">
            Sua assistência técnica atendendo 24h, sem você precisar parar a bancada
          </h2>
          <p className="text-xs sm:text-sm font-light text-zinc-400 max-w-lg mx-auto mb-8 leading-relaxed">
            Cadastre-se em menos de 1 minuto, conecte seu WhatsApp e veja seu primeiro cliente sendo atendido ainda hoje.
          </p>

          <div className="relative group inline-block">
            {/* 1. Halo difuso de luz de fundo (Glow Effect) */}
            <div className="absolute -inset-1 rounded-full bg-emerald-500/30 blur-xl opacity-70 transition-all duration-500 group-hover:bg-emerald-500/50 group-hover:blur-2xl group-hover:opacity-100 pointer-events-none" />

            {/* 2. Botão Principal com feixe de luz giratório e sombra */}
            <Link
              href="/register"
              className="button-glow"
            >
              {/* Camada da borda giratória */}
              <div className="button-glow__border">
                <div className="button-glow__border-spin" />
              </div>

              {/* Máscara do fundo interno (deixa 1px de borda aparente) */}
              <div className="button-glow__inner" />

              {/* Conteúdo visível do botão */}
              <div className="button-glow__content">
                <div className="button-glow__icon">
                  <svg className="h-3.5 w-3.5 fill-black ml-0.5" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
                <span className="button-glow__label">Começar meu teste grátis agora</span>
                <div className="button-glow__arrow">
                  <svg className="h-3.5 w-3.5 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/[0.06] py-8 px-4 text-center text-zinc-500 text-xs relative z-10">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 font-light">
          <div className="flex items-center gap-2 font-normal text-white">
            <div className="w-5 h-5 rounded-md bg-emerald-500 flex items-center justify-center">
              <Wrench size={11} className="text-black stroke-[2.5]" />
            </div>
            ZapIA • Assistência Técnica
          </div>
          <div>
            © {new Date().getFullYear()} ZapIA. Todos os direitos reservados.
          </div>
          <div className="flex items-center gap-4 text-zinc-400">
            <Link href="/login" className="hover:text-white transition-colors">Login</Link>
            <Link href="/register" className="hover:text-white transition-colors">Cadastro</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
