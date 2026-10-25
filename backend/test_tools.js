const { agentToolsService } = require('./dist/modules/ai/tools.registry');
const { prisma } = require('./dist/database/prisma');

async function testTools() {
  console.log('=== TESTANDO FERRAMENTAS DO AGENTE IA (SPECIALIZED TOOLS) ===\n');

  const tenant = await prisma.tenant.findFirst();
  if (!tenant) {
    console.error('Tenant não encontrado!');
    return;
  }
  const context = { tenantId: tenant.id, customerPhone: '11988887777', contactName: 'Lucas Ferreira' };

  // Tool 1: checkRepairOrderStatus
  console.log('Tool 1: Executando checkRepairOrderStatus para "OS-1001"...');
  const osResult = await agentToolsService.executeTool('checkRepairOrderStatus', { query: 'OS-1001' }, context);
  console.log('Resultado OS:', osResult);

  // Tool 2: checkRepairQuote
  console.log('\nTool 2: Executando checkRepairQuote para "Apple iPhone 13 / Tela"...');
  const quoteResult = await agentToolsService.executeTool('checkRepairQuote', {
    brand: 'Apple',
    model: 'iPhone 13',
    serviceType: 'Tela'
  }, context);
  console.log('Resultado Orçamento:', quoteResult);

  // Tool 3: searchPhoneCatalog
  console.log('\nTool 3: Executando searchPhoneCatalog para "iPhone 13"...');
  const catResult = await agentToolsService.executeTool('searchPhoneCatalog', {
    search: 'iPhone 13'
  }, context);
  console.log('Resultado Catálogo:', catResult);

  // Tool 4: evaluateTradeInPhone
  console.log('\nTool 4: Executando evaluateTradeInPhone para "iPhone 13 128GB"...');
  const tradeResult = await agentToolsService.executeTool('evaluateTradeInPhone', {
    brand: 'Apple',
    model: 'iPhone 13',
    storage: '128GB',
    batteryHealth: 88,
    condition: 'SEMINOVO_A',
    hasBox: true,
    hasCharger: true
  }, context);
  console.log('Resultado Trade-In:', tradeResult);

  await prisma.$disconnect();
  console.log('\n✅ TODAS AS 4 FERRAMENTAS EXECUTARAM COM SUCESSO!');
}

testTools().catch(console.error);
