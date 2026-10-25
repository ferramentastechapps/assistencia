const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding ZapIA technical & phone sales system...');

  // 1. Tenant
  let tenant = await prisma.tenant.findFirst();
  if (!tenant) {
    tenant = await prisma.tenant.create({
      data: {
        name: 'ZapIA Tech & Smartphones',
        email: 'contato@zapia.com',
        plan: 'ENTERPRISE',
        isActive: true,
        maxMessages: 999999,
      }
    });
    console.log('✅ Created Tenant:', tenant.name, tenant.id);
  } else {
    console.log('ℹ️ Existing Tenant:', tenant.name, tenant.id);
  }

  // 2. Super Admin User
  let user = await prisma.user.findFirst({ where: { email: 'admin@zapia.com' } });
  if (!user) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    user = await prisma.user.create({
      data: {
        email: 'admin@zapia.com',
        name: 'Administrador Técnico',
        password: hashedPassword,
        role: 'SUPER_ADMIN',
        tenantId: tenant.id
      }
    });
    console.log('✅ Created Admin user: admin@zapia.com (senha: admin123)');
  } else {
    console.log('ℹ️ Existing Admin user:', user.email);
  }

  // 3. AI Configuration for Technical Assistance & Sales
  let aiConfig = await prisma.aIConfig.findUnique({ where: { tenantId: tenant.id } });
  if (!aiConfig) {
    aiConfig = await prisma.aIConfig.create({
      data: {
        tenantId: tenant.id,
        personaName: 'Atendente Tech Especialista',
        personaTone: 'profissional, técnico, ágil e acolhedor',
        language: 'pt-BR',
        llmModel: 'openai/gpt-4o-mini',
        temperature: 0.3,
        systemPrompt: `Você é a IA oficial da assistência técnica e loja de smartphones.
Suas responsabilidades:
1. Consultar status de ordens de serviço (OS) pelo número (ex: OS-1001) ou telefone do cliente.
2. Fornecer estimativas de orçamento para reparos (troca de tela, bateria, conector, etc) usando a tabela de referência.
3. Apresentar aparelhos do catálogo de smartphones com preços à vista (Pix) e parcelamento no cartão.
4. Avaliar aparelhos usados de clientes para Trade-In (recompra na troca de um novo).
Seja sempre cordial, direto e seguro nas respostas técnicas.`
      }
    });
    console.log('✅ AI Config created');
  } else {
    console.log('ℹ️ Existing AI Config');
  }

  // 4. Pipeline Stages
  const stageCount = await prisma.pipelineStage.count({ where: { tenantId: tenant.id } });
  if (stageCount === 0) {
    const stages = [
      { name: 'Novo Contato', order: 1, color: '#3B82F6' },
      { name: 'Em Triagem / Análise', order: 2, color: '#8B5CF6' },
      { name: 'Orçamento Enviado', order: 3, color: '#F59E0B' },
      { name: 'Reparo Aprovado', order: 4, color: '#10B981' },
      { name: 'Aguardando Retirada', order: 5, color: '#06B6D4' },
      { name: 'Finalizado / Entregue', order: 6, color: '#6B7280' }
    ];
    for (const s of stages) {
      await prisma.pipelineStage.create({
        data: { tenantId: tenant.id, ...s }
      });
    }
    console.log('✅ 6 Pipeline Stages created');
  }

  // 5. Sample Repair Orders
  const repairCount = await prisma.repairOrder.count({ where: { tenantId: tenant.id } });
  if (repairCount === 0) {
    await prisma.repairOrder.createMany({
      data: [
        {
          orderNumber: 'OS-1001',
          tenantId: tenant.id,
          customerName: 'Lucas Ferreira',
          customerPhone: '11988887777',
          deviceBrand: 'Apple',
          deviceModel: 'iPhone 13 128GB',
          deviceColor: 'Azul',
          reportedDefect: 'Tela trincada após queda, touch com falhas no canto superior.',
          technicalDiagnosis: 'Display OLED quebrado, aro sem empenamento.',
          status: 'PRONTO',
          partsCost: 320,
          laborCost: 200,
          totalAmount: 520,
          warrantyDays: 90,
          notifiedReady: true
        },
        {
          orderNumber: 'OS-1002',
          tenantId: tenant.id,
          customerName: 'Mariana Souza',
          customerPhone: '11977776666',
          deviceBrand: 'Samsung',
          deviceModel: 'Galaxy S23',
          deviceColor: 'Preto Fantasma',
          reportedDefect: 'Bateria descarrega muito rápido e aquece ao carregar.',
          technicalDiagnosis: 'Bateria com 71% de capacidade residual e resistência interna alta.',
          status: 'EM_CONSERTO',
          partsCost: 180,
          laborCost: 150,
          totalAmount: 330,
          warrantyDays: 90
        },
        {
          orderNumber: 'OS-1003',
          tenantId: tenant.id,
          customerName: 'Carlos Eduardo',
          customerPhone: '11966665555',
          deviceBrand: 'Xiaomi',
          deviceModel: 'Redmi Note 12',
          deviceColor: 'Cinza Ônix',
          reportedDefect: 'Não carrega no cabo original nem alternativo.',
          technicalDiagnosis: 'Conector de carga tipo C com pinos oxidados e quebrados.',
          status: 'EM_ANALISE',
          warrantyDays: 90
        }
      ]
    });
    console.log('✅ 3 Sample Repair Orders created');
  }

  // 6. Sample Phone Catalog Products
  const phoneCount = await prisma.phoneProduct.count({ where: { tenantId: tenant.id } });
  if (phoneCount === 0) {
    await prisma.phoneProduct.createMany({
      data: [
        {
          tenantId: tenant.id,
          title: 'iPhone 14 Pro 128GB Roxo Profundo',
          brand: 'Apple',
          model: 'iPhone 14 Pro',
          storage: '128GB',
          color: 'Roxo Profundo',
          batteryHealth: 94,
          condition: 'SEMINOVO_A_PLUS',
          cashPrice: 4390,
          installmentPrice: 4790,
          installments: 12,
          stock: 2,
          isAvailable: true,
          warrantyMonths: 3,
          isFeatured: true,
          description: 'Aparelho impecável, sem marcas, bateria 94%, com cabo original e nota.'
        },
        {
          tenantId: tenant.id,
          title: 'iPhone 13 128GB Estelar',
          brand: 'Apple',
          model: 'iPhone 13',
          storage: '128GB',
          color: 'Estelar',
          batteryHealth: 89,
          condition: 'SEMINOVO_A',
          cashPrice: 2890,
          installmentPrice: 3190,
          installments: 12,
          stock: 3,
          isAvailable: true,
          warrantyMonths: 3,
          isFeatured: true,
          description: 'Seminovos selecionados com procedência garantida e garantia de 90 dias.'
        },
        {
          tenantId: tenant.id,
          title: 'Samsung Galaxy S23 256GB Verde',
          brand: 'Samsung',
          model: 'Galaxy S23',
          storage: '256GB',
          color: 'Verde Botânico',
          batteryHealth: 98,
          condition: 'SEMINOVO_A_PLUS',
          cashPrice: 2690,
          installmentPrice: 2990,
          installments: 12,
          stock: 1,
          isAvailable: true,
          warrantyMonths: 3,
          isFeatured: true,
          description: 'Top de linha Samsung com Snapdragon 8 Gen 2 e câmeras de 50MP.'
        }
      ]
    });
    console.log('✅ 3 Sample Phone Products created');
  }

  // 7. Reference Quotes
  const quotesCount = await prisma.repairQuoteCatalog.count({ where: { tenantId: tenant.id } });
  if (quotesCount === 0) {
    await prisma.repairQuoteCatalog.createMany({
      data: [
        {
          tenantId: tenant.id,
          brand: 'Apple',
          modelPattern: 'iPhone 13',
          serviceType: 'Troca de Tela OLED Premium',
          priceMin: 550,
          priceMax: 680,
          averageTime: '45 minutos',
          warrantyDays: 90,
          notes: 'Peça de altíssima fidelidade de cores, compatível com True Tone.'
        },
        {
          tenantId: tenant.id,
          brand: 'Apple',
          modelPattern: 'iPhone 13',
          serviceType: 'Troca de Bateria Original/Primeira Linha',
          priceMin: 220,
          priceMax: 290,
          averageTime: '30 minutos',
          warrantyDays: 90,
          notes: 'Bateria com células novas de alto rendimento e calibração de ciclo.'
        },
        {
          tenantId: tenant.id,
          brand: 'Samsung',
          modelPattern: 'Galaxy S23',
          serviceType: 'Troca de Vidro Traseiro',
          priceMin: 250,
          priceMax: 320,
          averageTime: '1 hora',
          warrantyDays: 90,
          notes: 'Tampa traseira em vidro original com lente das câmeras.'
        },
        {
          tenantId: tenant.id,
          brand: 'Motorola',
          modelPattern: 'Moto G*',
          serviceType: 'Troca de Conector de Carga Tipo-C',
          priceMin: 120,
          priceMax: 160,
          averageTime: '40 minutos',
          warrantyDays: 90,
          notes: 'Subplaca de carga original com suporte a carregamento rápido TurboPower.'
        }
      ]
    });
    console.log('✅ 4 Repair Quotes created');
  }

  console.log('\n🚀 ALL TECHNICAL DATA SEEDED SUCCESSFULLY!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
