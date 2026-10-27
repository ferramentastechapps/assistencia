import {
  LayoutDashboard, Wrench, Inbox, ShoppingBag, Brain,
  BarChart3, Smartphone, BookOpen, Kanban, MessageSquare,
  type LucideIcon,
} from 'lucide-react'

export interface NavDestination {
  href: string
  label: string
  icon: LucideIcon
  badge?: string
  live?: boolean
}

export interface NavGroup {
  id: string
  label: string
  destinations: NavDestination[]
}

export function navigationGroups(): NavGroup[] {
  return [
    {
      id: 'operacao',
      label: 'Operação',
      destinations: [
        { href: '/dashboard', label: 'Visão Geral', icon: LayoutDashboard },
        { href: '/repairs', label: 'Ordens de Serviço', icon: Wrench, badge: '14' },
        { href: '/inbox', label: 'WhatsApp Live', icon: Inbox, live: true },
        { href: '/pipeline', label: 'Funil CRM', icon: Kanban },
      ],
    },
    {
      id: 'catalogo',
      label: 'Catálogo',
      destinations: [
        { href: '/catalog', label: 'Trade-In & Peças', icon: ShoppingBag, badge: '6' },
        { href: '/conversations', label: 'Histórico', icon: MessageSquare },
      ],
    },
    {
      id: 'inteligencia',
      label: 'Inteligência',
      destinations: [
        { href: '/ai-config', label: 'Cérebro IA', icon: Brain },
        { href: '/knowledge', label: 'Base de Conhecimento', icon: BookOpen },
        { href: '/analytics', label: 'Telemetria', icon: BarChart3 },
      ],
    },
    {
      id: 'configuracoes',
      label: 'Configurações',
      destinations: [
        { href: '/whatsapp', label: 'Conexão WhatsApp', icon: Smartphone },
      ],
    },
  ]
}

export const routeMeta: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': { title: 'Bancada Inteligente', subtitle: 'Cockpit & Telemetria' },
  '/repairs': { title: 'Ordens de Serviço', subtitle: 'Gestão da Bancada' },
  '/inbox': { title: 'WhatsApp Live', subtitle: 'Atendimento Humano' },
  '/catalog': { title: 'Trade-In & Peças', subtitle: 'Catálogo e Aparelhos' },
  '/whatsapp': { title: 'Conexão WhatsApp', subtitle: 'Instância Evolution API' },
  '/ai-config': { title: 'Cérebro & IA', subtitle: 'Persona & Agente' },
  '/analytics': { title: 'Telemetria', subtitle: 'Métricas e Conversão' },
  '/knowledge': { title: 'Base de Conhecimento', subtitle: 'RAG & Documentos' },
  '/pipeline': { title: 'Funil CRM', subtitle: 'Pipeline de Vendas' },
  '/conversations': { title: 'Histórico', subtitle: 'Conversas WhatsApp' },
}
