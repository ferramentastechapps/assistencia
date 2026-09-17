export interface BusinessTemplate {
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

export const BUSINESS_TEMPLATES: BusinessTemplate[] = [
  // ─── 1. ASSISTÊNCIA TÉCNICA DE CELULARES (PRINCIPAL / DESTAQUE) ─────────────
  {
    id: 'cellphone_repair',
    name: 'Assistência Técnica de Celulares',
    shortDescription: 'Ideal para lojas de conserto de smartphones, troca de telas, baterias e reparo em placa.',
    icon: 'Smartphone',
    badge: '⭐ Modelo Principal',
    isPrimary: true,
    color: '#06B6D4',
    gradient: 'from-cyan-500 to-blue-600',
    persona: {
      name: 'Lucas - Suporte Técnico',
      tone: 'atencioso, transparente, ágil e técnico',
      language: 'pt-BR'
    },
    systemPrompt: `Você é o Lucas, atendente e consultor técnico especializado de uma assistência técnica de celulares e smartphones.
Seu objetivo é fazer uma pré-avaliação rápida, passar confiança sobre a qualidade das peças e orientar o cliente a trazer o aparelho para avaliação física ou aprovar o orçamento.

REGRAS DE ATENDIMENTO:
1. Sempre pergunte educadamente o MODELO EXATO do celular (ex: iPhone 13, Galaxy A54, Moto G84, Redmi Note 12) e qual o DEFEITO apresentado (tela quebrada, bateria não dura, não carrega, caiu na água, etc.).
2. Explique que trabalhamos com telas Originais e Premium OLED de alta qualidade com garantia de 90 dias.
3. Se o cliente falar que o celular CAIU NA ÁGUA: Alerte imediatamente para NÃO colocar no carregador nem ligar o aparelho e trazer urgente para banho químico / desoxidação.
4. Informe que serviços rápidos como troca de tela e bateria costumam ficar prontos no mesmo dia (geralmente em até 1 hora na bancada express).
5. Pagamento facilitado em até 12x no cartão ou com desconto especial no Pix.
6. Sempre convide amigavelmente o cliente para vir à loja física ou ofereça serviço de motoboy/retirada caso disponível.`,
    pipelineStages: [
      { name: 'Novo Contato / Orçamento', color: '#3B82F6', order: 1 },
      { name: 'Aguardando Modelo/Defeito', color: '#8B5CF6', order: 2 },
      { name: 'Orçamento Apresentado', color: '#F59E0B', order: 3 },
      { name: 'Aparelho na Bancada (Em Reparo)', color: '#06B6D4', order: 4 },
      { name: 'Pronto para Retirada', color: '#10B981', order: 5 },
      { name: 'Entregue com Garantia', color: '#059669', order: 6 },
      { name: 'Sem Conserto / Recusado', color: '#EF4444', order: 7 }
    ],
    quickReplies: [
      {
        shortcut: '/orcamento',
        title: 'Solicitar Modelo e Defeito',
        content: 'Olá! Para te passar o orçamento exato agora: qual é a marca e modelo do seu aparelho (ex: iPhone 11, Samsung A32) e qual defeito ele está apresentando?'
      },
      {
        shortcut: '/telas',
        title: 'Diferença de Telas e Peças',
        content: 'Trabalhamos com telas Originais e telas Linha Premium (OLED/Incell de 1ª linha). Todas acompanham 90 dias de garantia contra defeitos de fabricação e mantêm o touch 100% sensível.'
      },
      {
        shortcut: '/garantia',
        title: 'Política de Garantia de 90 Dias',
        content: 'Todos os nossos serviços contam com garantia legal de 90 dias com emissão de ordem de serviço e nota. Peças testadas e aprovadas!'
      },
      {
        shortcut: '/pronto',
        title: 'Aparelho Pronto para Retirada',
        content: '🎉 Boa notícia! O seu aparelho já teve o reparo concluído com sucesso, passou em todos os testes técnicos e já está pronto para retirada na nossa loja!'
      },
      {
        shortcut: '/molhado',
        title: 'Aparelho que Caiu na Água',
        content: '⚠️ Importante: NÃO tente ligar o celular e NÃO coloque no carregador! Traga o mais rápido possível para a nossa bancada para fazermos a desoxidação e limpeza química dos circuitos antes que ocorra curto.'
      },
      {
        shortcut: '/endereco',
        title: 'Endereço e Horário da Loja',
        content: '📍 Estamos localizados no centro da cidade. Atendemos de Segunda a Sexta das 08h30 às 18h30 e aos Sábados das 09h às 13h. Venha tomar um café conosco!'
      },
      {
        shortcut: '/pix',
        title: 'Chave Pix para Pagamento',
        content: 'Aceitamos Pix com desconto especial à vista, dinheiro ou parcelamos em até 12x no cartão. Chave Pix: financeiro@zapia.com'
      }
    ],
    sampleFaq: {
      title: 'FAQ - Assistência Técnica de Celulares',
      content: `## ASSISTÊNCIA TÉCNICA ESPECIALIZADA EM SMARTPHONES

### Marcas e Modelos Atendidos
Atendemos todas as principais fabricantes do mercado:
- Apple (iPhone do 6 ao 15 Pro Max, iPad e Apple Watch)
- Samsung (Linhas Galaxy S, Note, A, M e Z Flip/Fold)
- Motorola (Linhas Moto G, Moto Edge, Moto E)
- Xiaomi, Redmi e POCO
- Realme, Asus e LG

### Principais Serviços Realizados
1. Troca de Vidro e Tela Touch Display (Original e Premium OLED)
2. Substituição de Bateria viciada ou com desgaste
3. Reparo em Conector de Carga (tipo C, Lightning e Micro-USB)
4. Desoxidação de aparelhos que caíram em água ou umidade
5. Reparo de Placa Mãe e Solda BGA de alta precisão
6. Troca de Câmera frontal e traseira, lentes e microfone
7. Troca de Tampa traseira e carcaça completa

### Prazos de Entrega
- Troca de tela e bateria: de 40 minutos a 2 horas (serviço express).
- Reparo em placa ou celular molhado: de 24 a 48 horas após testes de laboratório.

### Garantia e Segurança
- 90 dias de garantia sobre todas as peças trocadas e mão de obra técnica.
- Preservação total dos dados: não formatamos o aparelho a menos que o cliente autorize expressamente.

### Formas de Pagamento
- Pix com desconto especial à vista.
- Cartão de crédito em até 12x.
- Cartão de débito e dinheiro.`
    }
  }
]

