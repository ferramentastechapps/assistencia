import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed do banco de dados — Assistência Técnica de Celulares...')

  // Criar tenant admin padrão
  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'admin@zapia.com' }
  })

  if (!existingAdmin) {
    const adminTenant = await prisma.tenant.create({
      data: {
        name: 'CelTech Assistência & Vendas',
        email: 'admin@zapia.com',
        plan: 'ENTERPRISE',
        maxMessages: 999999
      }
    })

    await prisma.user.create({
      data: {
        email: 'admin@zapia.com',
        password: await bcrypt.hash('admin123456', 12),
        name: 'Super Admin',
        role: 'SUPER_ADMIN',
        tenantId: adminTenant.id
      }
    })

    // ─── AI Config especializada ──────────────────────────────────────────────
    await prisma.aIConfig.create({
      data: {
        tenantId: adminTenant.id,
        personaName: 'Lucas - Técnico & Consultor',
        personaTone: 'atencioso, transparente, ágil e especialista em celulares',
        language: 'pt-BR',
        llmModel: 'openai/gpt-4o-mini',
        temperature: 0.3,
        maxTokens: 600,
        escalationKeywords: '["falar com humano","falar com atendente","quero falar com pessoa","supervisor","gerente","reclamação"]',
        businessHours: '{"start":"08:30","end":"18:30","days":[1,2,3,4,5,6]}',
        outOfHoursMsg: '⏰ Olá! Nosso horário de atendimento é de segunda a sexta das 8h30 às 18h30 e sábado das 9h às 13h. Deixa sua mensagem que te respondemos assim que abrirmos! 😊',
        fallbackMessage: 'Desculpe, ocorreu um problema técnico. Tente novamente em instantes.',
        noKnowledgeMsg: 'Não tenho essa informação na minha base. Vou te conectar com um de nossos técnicos para ajudar melhor! 🔧',
        csatEnabled: true,
        csatMessage: 'Como você avalia nosso atendimento hoje? Responda de 1 a 5 ⭐',
      }
    })

    // ─── Pipeline Stages (Funil de OS) ────────────────────────────────────────
    await prisma.pipelineStage.createMany({
      data: [
        { tenantId: adminTenant.id, name: 'Novo Contato / Orçamento', color: '#3B82F6', order: 1 },
        { tenantId: adminTenant.id, name: 'Aguardando Modelo/Defeito', color: '#8B5CF6', order: 2 },
        { tenantId: adminTenant.id, name: 'Orçamento Apresentado', color: '#F59E0B', order: 3 },
        { tenantId: adminTenant.id, name: 'Aparelho na Bancada', color: '#06B6D4', order: 4 },
        { tenantId: adminTenant.id, name: 'Pronto para Retirada', color: '#10B981', order: 5 },
        { tenantId: adminTenant.id, name: 'Entregue com Garantia', color: '#059669', order: 6 },
        { tenantId: adminTenant.id, name: 'Aparelho à Venda', color: '#F97316', order: 7 },
        { tenantId: adminTenant.id, name: 'Venda Concluída', color: '#7C3AED', order: 8 },
      ]
    })

    // ─── Quick Replies (Respostas Rápidas) ────────────────────────────────────
    await prisma.quickReply.createMany({
      data: [
        {
          tenantId: adminTenant.id,
          shortcut: '/orcamento',
          title: 'Solicitar Modelo e Defeito',
          content: 'Olá! Para te passar o orçamento exato agora: qual é a marca e modelo do seu aparelho (ex: iPhone 11, Samsung A32) e qual defeito ele está apresentando?'
        },
        {
          tenantId: adminTenant.id,
          shortcut: '/telas',
          title: 'Diferença de Telas e Peças',
          content: 'Trabalhamos com telas Originais e telas Linha Premium (OLED/Incell de 1ª linha). Todas acompanham 90 dias de garantia contra defeitos de fabricação e mantêm o touch 100% sensível.'
        },
        {
          tenantId: adminTenant.id,
          shortcut: '/garantia',
          title: 'Política de Garantia de 90 Dias',
          content: 'Todos os nossos serviços contam com garantia legal de 90 dias com emissão de ordem de serviço e nota. Peças testadas e aprovadas! ✅'
        },
        {
          tenantId: adminTenant.id,
          shortcut: '/pronto',
          title: 'Aparelho Pronto para Retirada',
          content: '🎉 Boa notícia! O seu aparelho já teve o reparo concluído com sucesso, passou em todos os testes técnicos e já está pronto para retirada na nossa loja!'
        },
        {
          tenantId: adminTenant.id,
          shortcut: '/molhado',
          title: 'Aparelho que Caiu na Água',
          content: '⚠️ Importante: NÃO tente ligar o celular e NÃO coloque no carregador! Traga o mais rápido possível para a nossa bancada para fazermos a desoxidação e limpeza química dos circuitos antes que ocorra curto.'
        },
        {
          tenantId: adminTenant.id,
          shortcut: '/endereco',
          title: 'Endereço e Horário da Loja',
          content: '📍 Estamos localizados no centro da cidade. Atendemos de Segunda a Sexta das 08h30 às 18h30 e aos Sábados das 09h às 13h. Venha tomar um café conosco!'
        },
        {
          tenantId: adminTenant.id,
          shortcut: '/pix',
          title: 'Chave Pix para Pagamento',
          content: 'Aceitamos Pix com desconto especial à vista, dinheiro ou parcelamos em até 12x no cartão. Chave Pix: financeiro@celtech.com.br'
        },
        {
          tenantId: adminTenant.id,
          shortcut: '/status',
          title: 'Consultar Status de OS',
          content: 'Para verificar o status do seu conserto, me informe o número da sua Ordem de Serviço (OS) que está na sua nota, ou seu número de telefone cadastrado.'
        },
        {
          tenantId: adminTenant.id,
          shortcut: '/venda',
          title: 'Celulares à Venda',
          content: '📱 Temos celulares seminovos e novos disponíveis! Trabalhamos com Apple, Samsung, Motorola e Xiaomi. Me diga qual marca prefere ou qual seu orçamento para eu te mostrar as opções!'
        },
        {
          tenantId: adminTenant.id,
          shortcut: '/troca',
          title: 'Trocar Celular Usado (Trade-In)',
          content: '🔄 Você pode usar seu celular atual como entrada na compra de um novo ou seminovo! Me informe a marca, modelo, capacidade (GB) e o estado do aparelho para faço uma avaliação de crédito.'
        }
      ]
    })

    // ─── Tabela de Orçamentos de Referência ──────────────────────────────────
    await prisma.repairQuoteCatalog.createMany({
      data: [
        // Apple iPhone
        { tenantId: adminTenant.id, brand: 'Apple', modelPattern: 'iPhone 15 Pro Max', serviceType: 'Tela Original', priceMin: 950, priceMax: 1200, averageTime: '2 horas', warrantyDays: 90 },
        { tenantId: adminTenant.id, brand: 'Apple', modelPattern: 'iPhone 15 Pro', serviceType: 'Tela Original', priceMin: 850, priceMax: 1050, averageTime: '2 horas', warrantyDays: 90 },
        { tenantId: adminTenant.id, brand: 'Apple', modelPattern: 'iPhone 15', serviceType: 'Tela Original', priceMin: 700, priceMax: 900, averageTime: '1 hora', warrantyDays: 90 },
        { tenantId: adminTenant.id, brand: 'Apple', modelPattern: 'iPhone 14 Pro Max', serviceType: 'Tela Original', priceMin: 800, priceMax: 1000, averageTime: '2 horas', warrantyDays: 90 },
        { tenantId: adminTenant.id, brand: 'Apple', modelPattern: 'iPhone 14 Pro', serviceType: 'Tela Original', priceMin: 700, priceMax: 900, averageTime: '2 horas', warrantyDays: 90 },
        { tenantId: adminTenant.id, brand: 'Apple', modelPattern: 'iPhone 14', serviceType: 'Tela Original', priceMin: 550, priceMax: 750, averageTime: '1 hora', warrantyDays: 90 },
        { tenantId: adminTenant.id, brand: 'Apple', modelPattern: 'iPhone 13 Pro Max', serviceType: 'Tela Original', priceMin: 650, priceMax: 850, averageTime: '1 hora', warrantyDays: 90 },
        { tenantId: adminTenant.id, brand: 'Apple', modelPattern: 'iPhone 13 Pro', serviceType: 'Tela Original', priceMin: 580, priceMax: 750, averageTime: '1 hora', warrantyDays: 90 },
        { tenantId: adminTenant.id, brand: 'Apple', modelPattern: 'iPhone 13', serviceType: 'Tela Original', priceMin: 480, priceMax: 650, averageTime: '1 hora', warrantyDays: 90 },
        { tenantId: adminTenant.id, brand: 'Apple', modelPattern: 'iPhone 12', serviceType: 'Tela Original', priceMin: 380, priceMax: 520, averageTime: '1 hora', warrantyDays: 90 },
        { tenantId: adminTenant.id, brand: 'Apple', modelPattern: 'iPhone 11', serviceType: 'Tela Original', priceMin: 320, priceMax: 450, averageTime: '1 hora', warrantyDays: 90 },
        { tenantId: adminTenant.id, brand: 'Apple', modelPattern: 'iPhone X', serviceType: 'Tela Original', priceMin: 280, priceMax: 400, averageTime: '1 hora', warrantyDays: 90 },
        // Apple Bateria
        { tenantId: adminTenant.id, brand: 'Apple', modelPattern: '*', serviceType: 'Bateria', priceMin: 180, priceMax: 320, averageTime: '30 minutos', warrantyDays: 90, notes: 'Bateria original Apple ou compatível premium com chip de capacidade real' },
        // Apple Desoxidação
        { tenantId: adminTenant.id, brand: 'Apple', modelPattern: '*', serviceType: 'Desoxidação', priceMin: 150, priceMax: 280, averageTime: '1 a 2 horas', warrantyDays: 30, notes: 'Sem garantia de funcionamento total — aparelhos molhados podem ter danos na placa-mãe' },
        // Apple Conector
        { tenantId: adminTenant.id, brand: 'Apple', modelPattern: '*', serviceType: 'Conector de Carga', priceMin: 220, priceMax: 380, averageTime: '1 hora', warrantyDays: 90 },
        // Samsung
        { tenantId: adminTenant.id, brand: 'Samsung', modelPattern: 'Galaxy S23 Ultra', serviceType: 'Tela Original', priceMin: 700, priceMax: 950, averageTime: '2 horas', warrantyDays: 90 },
        { tenantId: adminTenant.id, brand: 'Samsung', modelPattern: 'Galaxy S23', serviceType: 'Tela Original', priceMin: 450, priceMax: 650, averageTime: '1 hora', warrantyDays: 90 },
        { tenantId: adminTenant.id, brand: 'Samsung', modelPattern: 'Galaxy A54', serviceType: 'Tela Original', priceMin: 280, priceMax: 380, averageTime: '1 hora', warrantyDays: 90 },
        { tenantId: adminTenant.id, brand: 'Samsung', modelPattern: 'Galaxy A34', serviceType: 'Tela Original', priceMin: 220, priceMax: 320, averageTime: '1 hora', warrantyDays: 90 },
        { tenantId: adminTenant.id, brand: 'Samsung', modelPattern: 'Galaxy A14', serviceType: 'Tela Original', priceMin: 180, priceMax: 260, averageTime: '45 minutos', warrantyDays: 90 },
        { tenantId: adminTenant.id, brand: 'Samsung', modelPattern: '*', serviceType: 'Bateria', priceMin: 120, priceMax: 220, averageTime: '30 minutos', warrantyDays: 90 },
        { tenantId: adminTenant.id, brand: 'Samsung', modelPattern: '*', serviceType: 'Desoxidação', priceMin: 120, priceMax: 200, averageTime: '1 hora', warrantyDays: 30 },
        // Motorola
        { tenantId: adminTenant.id, brand: 'Motorola', modelPattern: 'Moto G84', serviceType: 'Tela Original', priceMin: 220, priceMax: 320, averageTime: '1 hora', warrantyDays: 90 },
        { tenantId: adminTenant.id, brand: 'Motorola', modelPattern: 'Moto G54', serviceType: 'Tela Original', priceMin: 180, priceMax: 260, averageTime: '1 hora', warrantyDays: 90 },
        { tenantId: adminTenant.id, brand: 'Motorola', modelPattern: '*', serviceType: 'Bateria', priceMin: 100, priceMax: 180, averageTime: '30 minutos', warrantyDays: 90 },
        { tenantId: adminTenant.id, brand: 'Motorola', modelPattern: '*', serviceType: 'Desoxidação', priceMin: 100, priceMax: 180, averageTime: '1 hora', warrantyDays: 30 },
        // Xiaomi
        { tenantId: adminTenant.id, brand: 'Xiaomi', modelPattern: 'Redmi Note 13', serviceType: 'Tela Original', priceMin: 200, priceMax: 300, averageTime: '1 hora', warrantyDays: 90 },
        { tenantId: adminTenant.id, brand: 'Xiaomi', modelPattern: 'Redmi Note 12', serviceType: 'Tela Original', priceMin: 180, priceMax: 280, averageTime: '1 hora', warrantyDays: 90 },
        { tenantId: adminTenant.id, brand: 'Xiaomi', modelPattern: '*', serviceType: 'Bateria', priceMin: 100, priceMax: 180, averageTime: '30 minutos', warrantyDays: 90 },
      ]
    })

    // ─── Ordens de Serviço de Demonstração ───────────────────────────────────
    await prisma.repairOrder.createMany({
      data: [
        {
          tenantId: adminTenant.id,
          orderNumber: 'OS-1001',
          status: 'PRONTO',
          customerName: 'João Silva',
          customerPhone: '11987654321',
          deviceBrand: 'Apple',
          deviceModel: 'iPhone 13',
          deviceColor: 'Preto',
          reportedDefect: 'Tela trincada após queda',
          technicalDiagnosis: 'Substituição de display OLED completo realizada com sucesso',
          partsCost: 420,
          laborCost: 80,
          totalAmount: 500,
          warrantyDays: 90,
          notifiedReady: true,
        },
        {
          tenantId: adminTenant.id,
          orderNumber: 'OS-1002',
          status: 'EM_CONSERTO',
          customerName: 'Maria Santos',
          customerPhone: '11976543210',
          deviceBrand: 'Samsung',
          deviceModel: 'Galaxy A54',
          deviceColor: 'Azul',
          reportedDefect: 'Não carrega — conector de carga com problema',
          technicalDiagnosis: 'Conector tipo C danificado, realizando troca',
          partsCost: 80,
          laborCost: 60,
          totalAmount: 140,
          warrantyDays: 90,
        },
        {
          tenantId: adminTenant.id,
          orderNumber: 'OS-1003',
          status: 'AGUARDANDO_PECA',
          customerName: 'Carlos Lima',
          customerPhone: '11965432109',
          deviceBrand: 'Apple',
          deviceModel: 'iPhone 14 Pro',
          deviceColor: 'Dourado',
          reportedDefect: 'Tela com manchas após queda leve',
          technicalDiagnosis: 'Display danificado internamente, aguardando peça original',
          partsCost: 750,
          laborCost: 100,
          totalAmount: 850,
          warrantyDays: 90,
        },
        {
          tenantId: adminTenant.id,
          orderNumber: 'OS-1004',
          status: 'ENTREGUE',
          customerName: 'Ana Ferreira',
          customerPhone: '11954321098',
          deviceBrand: 'Motorola',
          deviceModel: 'Moto G84',
          deviceColor: 'Verde',
          reportedDefect: 'Bateria viciada — não dura nem 30 minutos',
          technicalDiagnosis: 'Bateria com 61% de saúde, substituída por bateria nova original',
          partsCost: 120,
          laborCost: 50,
          totalAmount: 170,
          warrantyDays: 90,
          deliveredAt: new Date(),
        }
      ]
    })

    // ─── Catálogo de Celulares para Venda ─────────────────────────────────────
    await prisma.phoneProduct.createMany({
      data: [
        {
          tenantId: adminTenant.id,
          title: 'iPhone 14 Pro Max 256GB',
          brand: 'Apple',
          model: 'iPhone 14 Pro Max',
          category: 'SMARTPHONE',
          condition: 'SEMINOVO_A_PLUS',
          storage: '256GB',
          color: 'Preto Espacial',
          batteryHealth: 91,
          cashPrice: 4200,
          installmentPrice: 4800,
          installments: 12,
          stock: 1,
          isAvailable: true,
          warrantyMonths: 3,
          isFeatured: true,
          description: 'Em perfeito estado estético e funcional. Câmera profissional de 48MP, chip A16 Bionic. Acompanha carregador.'
        },
        {
          tenantId: adminTenant.id,
          title: 'iPhone 13 128GB',
          brand: 'Apple',
          model: 'iPhone 13',
          category: 'SMARTPHONE',
          condition: 'SEMINOVO_A_PLUS',
          storage: '128GB',
          color: 'Azul',
          batteryHealth: 87,
          cashPrice: 1900,
          installmentPrice: 2280,
          installments: 12,
          stock: 2,
          isAvailable: true,
          warrantyMonths: 3,
          isFeatured: true,
          description: 'Sem arranhões visíveis. Bateria saudável, face ID 100% funcional. Excelente custo-benefício.'
        },
        {
          tenantId: adminTenant.id,
          title: 'Samsung Galaxy S23 Ultra 256GB',
          brand: 'Samsung',
          model: 'Galaxy S23 Ultra',
          category: 'SMARTPHONE',
          condition: 'SEMINOVO_A_PLUS',
          storage: '256GB',
          color: 'Verde',
          batteryHealth: 94,
          cashPrice: 3600,
          installmentPrice: 4320,
          installments: 12,
          stock: 1,
          isAvailable: true,
          warrantyMonths: 3,
          isFeatured: true,
          description: 'Com S Pen. Câmera de 200MP. Estado impecável. Acompanha caixa e carregador original Samsung.'
        },
        {
          tenantId: adminTenant.id,
          title: 'Samsung Galaxy A54 128GB',
          brand: 'Samsung',
          model: 'Galaxy A54',
          category: 'SMARTPHONE',
          condition: 'SEMINOVO_A',
          storage: '128GB',
          color: 'Roxo',
          batteryHealth: 89,
          cashPrice: 780,
          installmentPrice: 936,
          installments: 12,
          stock: 3,
          isAvailable: true,
          warrantyMonths: 3,
          isFeatured: false,
          description: 'Marcas leves de uso normal. Tela AMOLED de 6.4", câmera tripla de 50MP. Ótimo custo-benefício.'
        },
        {
          tenantId: adminTenant.id,
          title: 'Motorola Edge 50 256GB',
          brand: 'Motorola',
          model: 'Edge 50',
          category: 'SMARTPHONE',
          condition: 'NOVO_LACRADO',
          storage: '256GB',
          color: 'Azul',
          cashPrice: 1700,
          installmentPrice: 2040,
          installments: 12,
          stock: 2,
          isAvailable: true,
          warrantyMonths: 12,
          isFeatured: false,
          description: 'Novo lacrado com nota fiscal. Carregamento turbo de 68W, tela pOLED de 144Hz.'
        },
        {
          tenantId: adminTenant.id,
          title: 'Xiaomi Redmi Note 13 Pro 256GB',
          brand: 'Xiaomi',
          model: 'Redmi Note 13 Pro',
          category: 'SMARTPHONE',
          condition: 'NOVO_LACRADO',
          storage: '256GB',
          color: 'Preto Midnight',
          cashPrice: 1050,
          installmentPrice: 1260,
          installments: 12,
          stock: 4,
          isAvailable: true,
          warrantyMonths: 12,
          isFeatured: false,
          description: 'Novo lacrado. Câmera de 200MP, tela AMOLED 120Hz, bateria de 5100mAh. Melhor custo-benefício da categoria.'
        },
        {
          tenantId: adminTenant.id,
          title: 'Capa Anti-Impacto iPhone 13/14',
          brand: 'Genérico',
          model: 'Capa Anti-Impacto',
          category: 'ACESSORIO',
          condition: 'ACESSORIO',
          cashPrice: 45,
          stock: 15,
          isAvailable: true,
          warrantyMonths: 0,
          isFeatured: false,
          description: 'Capa anti-impacto premium com cantos reforçados. Compatível com iPhone 13 e iPhone 14.'
        },
        {
          tenantId: adminTenant.id,
          title: 'Película 3D Privacidade iPhone 13',
          brand: 'Genérico',
          model: 'Película 3D',
          category: 'ACESSORIO',
          condition: 'ACESSORIO',
          cashPrice: 38,
          stock: 20,
          isAvailable: true,
          warrantyMonths: 0,
          isFeatured: false,
          description: 'Película de privacidade 3D temperada. Instalação gratuita na loja.'
        }
      ]
    })

    // ─── Base de Conhecimento (FAQ pré-populado) ──────────────────────────────
    await prisma.knowledgeDocument.create({
      data: {
        tenantId: adminTenant.id,
        title: 'FAQ - Assistência Técnica de Celulares',
        type: 'TEXT',
        status: 'READY',
        content: `## ASSISTÊNCIA TÉCNICA ESPECIALIZADA EM SMARTPHONES

### Marcas e Modelos Atendidos
Atendemos todas as principais fabricantes do mercado:
- Apple (iPhone do 6 ao 15 Pro Max, iPad e Apple Watch)
- Samsung (Linhas Galaxy S, Note, A, M e Z Flip/Fold)
- Motorola (Linhas Moto G, Moto Edge, Moto E)
- Xiaomi, Redmi e POCO
- Realme, Asus e outros

### Principais Serviços Realizados
1. Troca de Vidro e Tela Touch Display (Original e Premium OLED)
2. Substituição de Bateria viciada ou com desgaste
3. Reparo em Conector de Carga (tipo C, Lightning e Micro-USB)
4. Desoxidação de aparelhos que caíram em água ou umidade
5. Troca de Câmera frontal e traseira
6. Reparo de alto-falante, microfone e botões
7. Reparo em placa-mãe e microssoldagem

### Informações sobre Peças
- Trabalhamos com telas ORIGINAIS (retiradas de aparelhos originais) e PREMIUM (OLED/Incell de 1ª linha de fábrica)
- Todas as peças têm 90 dias de garantia contra defeitos de fabricação
- Não trabalhamos com peças de segunda linha ou sem procedência

### Importante: Aparelhos que Caíram na Água
⚠️ NÃO ligue o aparelho e NÃO coloque no carregador — isso provoca curto-circuito!
- Traga o aparelho o mais rápido possível para desoxidação química completa
- Quanto mais rápido chegar, maiores as chances de recuperação
- O procedimento de desoxidação custa entre R$120 e R$280

### Prazos de Atendimento
- Troca de tela: 30 minutos a 2 horas (depende do modelo)
- Troca de bateria: 20 a 40 minutos
- Conector de carga: 45 minutos a 1 hora
- Desoxidação: 1 a 3 horas
- Reparos em placa: 2 a 7 dias úteis (envio para laboratório especializado se necessário)

### Política de Garantia
- Todos os serviços têm garantia legal de 90 dias
- Emissão de Nota Fiscal e Ordem de Serviço para todos os reparos
- Garantia cobre defeitos de fabricação da peça, não cobre quedas ou danos após o reparo

### Formas de Pagamento
- Pix/Dinheiro: desconto especial
- Cartão de débito: aceito
- Cartão de crédito: parcelamos em até 12x sem juros (sujeito a consulta)
- Não aceitamos cheque

### Sobre a Venda de Celulares
- Trabalhamos com celulares Novos Lacrados e Seminovos Grau A+ e A
- Todos os seminovos passam por revisão técnica completa
- Garantia de 90 dias na loja para seminovos, 12 meses para novos
- Aceitamos celular usado como entrada na compra (Trade-In)
- Financiamos em até 12x no cartão

### Horário e Localização
Atendemos de Segunda a Sexta: 08h30 às 18h30
Sábados: 09h00 às 13h00
Domingos e Feriados: Fechado`
      }
    })

    console.log('✅ Admin criado: admin@zapia.com / admin123456')
    console.log('✅ AI Config especializada em assistência técnica configurada')
    console.log('✅ 8 estágios do funil de OS criados')
    console.log('✅ 10 respostas rápidas criadas')
    console.log('✅ Tabela de orçamentos de referência populada (40+ entradas)')
    console.log('✅ 4 ordens de serviço de demonstração criadas')
    console.log('✅ 8 produtos no catálogo (celulares e acessórios)')
    console.log('✅ Base de conhecimento FAQ populada')
    console.log('⚠️  TROQUE A SENHA EM PRODUÇÃO!')
  } else {
    console.log('ℹ️  Admin já existe — pulando seed')
  }

  console.log('✅ Seed concluído!')
}

main()
  .catch(e => {
    console.error('❌ Erro no seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
