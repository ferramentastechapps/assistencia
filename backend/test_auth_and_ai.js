const http = require('http');

async function request(url, options = {}) {
  return new Promise((resolve) => {
    try {
      const parsed = new URL(url);
      const req = http.request({
        hostname: parsed.hostname,
        port: parsed.port,
        path: parsed.pathname + parsed.search,
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {})
        },
        timeout: 10000,
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            resolve({ ok: res.statusCode >= 200 && res.statusCode < 400, status: res.statusCode, data: json });
          } catch (e) {
            resolve({ ok: res.statusCode >= 200 && res.statusCode < 400, status: res.statusCode, raw: data });
          }
        });
      });
      req.on('error', (err) => resolve({ ok: false, error: err.message }));
      req.on('timeout', () => { req.destroy(); resolve({ ok: false, error: 'Timeout' }); });
      if (options.body) req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
      req.end();
    } catch (e) {
      resolve({ ok: false, error: e.message });
    }
  });
}

async function runTests() {
  console.log('=== TESTANDO FLUXO COMPLETO AUTENTICADO & FUNÇÕES DO ZAPIA ===\n');

  // 1. LOGIN
  console.log('1. Autenticação (POST /api/v1/auth/login)...');
  const loginRes = await request('http://127.0.0.1:3011/api/v1/auth/login', {
    method: 'POST',
    body: { email: 'admin@zapia.com', password: 'admin123' }
  });

  if (!loginRes.ok || !loginRes.data?.token) {
    console.error('❌ Falha no login:', loginRes.status, loginRes.data || loginRes.error);
    return;
  }
  const token = loginRes.data.token;
  console.log('✅ Login realizado com sucesso! JWT recebido. Usuário:', loginRes.data.user?.name);

  const authHeaders = { 'Authorization': `Bearer ${token}` };

  // 2. REPAIRS (ORDENS DE SERVIÇO)
  console.log('\n2. Testando Módulo de Ordens de Serviço (Bancada Técnica)...');
  const repairsRes = await request('http://127.0.0.1:3011/api/v1/repairs', { headers: authHeaders });
  console.log(`- Listagem de OS: Status ${repairsRes.status} | Total OS: ${repairsRes.data?.total}`);
  if (repairsRes.data?.orders) {
    for (const os of repairsRes.data.orders) {
      console.log(`  * ${os.orderNumber}: ${os.customerName} - ${os.deviceBrand} ${os.deviceModel} [${os.status}] - Total: R$ ${os.totalAmount || 0}`);
    }
  }

  const statsRes = await request('http://127.0.0.1:3011/api/v1/repairs/stats', { headers: authHeaders });
  console.log(`- Stats de Reparos:`, statsRes.data);

  // 3. CATALOG (VITRINE DE SMARTPHONES)
  console.log('\n3. Testando Módulo de Catálogo de Celulares...');
  const catalogRes = await request('http://127.0.0.1:3011/api/v1/catalog/products', { headers: authHeaders });
  console.log(`- Listagem de Celulares: Status ${catalogRes.status} | Total: ${catalogRes.data?.total}`);
  if (catalogRes.data?.products) {
    for (const p of catalogRes.data.products) {
      console.log(`  * ${p.title} - R$ ${p.cashPrice} (Pix) / R$ ${p.installmentPrice} (12x) - Estoque: ${p.stock}`);
    }
  }

  const catStatsRes = await request('http://127.0.0.1:3011/api/v1/catalog/stats', { headers: authHeaders });
  console.log(`- Stats do Catálogo:`, catStatsRes.data);

  // 4. TRADE-IN SIMULATOR
  console.log('\n4. Testando Simulador de Trade-In (Recompra de Usados)...');
  const tradeInRes = await request('http://127.0.0.1:3011/api/v1/catalog/trade-in', {
    method: 'POST',
    headers: authHeaders,
    body: {
      brand: 'Apple',
      model: 'iPhone 13',
      storage: '128GB',
      batteryHealth: 88,
      condition: 'SEMINOVO_A',
      hasBox: true,
      hasCharger: true,
      customerPhone: '11999998888'
    }
  });
  console.log(`- Simulação de Trade-In: Status ${tradeInRes.status}`);
  console.log(`  Resultado: ${tradeInRes.data?.brand} ${tradeInRes.data?.model} -> Faixa Estimada: ${tradeInRes.data?.formatted}`);

  // 5. CRM PIPELINE BOARD
  console.log('\n5. Testando Funil de Vendas & CRM (Pipeline Board)...');
  const pipelineRes = await request('http://127.0.0.1:3011/api/v1/pipeline/board', { headers: authHeaders });
  console.log(`- Pipeline Board: Status ${pipelineRes.status} | Estágios: ${pipelineRes.data?.stages?.length || 0}`);
  if (pipelineRes.data?.stages) {
    console.log(`  Estágios ativos:`, pipelineRes.data.stages.map(s => s.name).join(' ➔ '));
  }

  // 6. ANALYTICS OVERVIEW
  console.log('\n6. Testando Módulo de Analytics...');
  const analyticsRes = await request('http://127.0.0.1:3011/api/v1/analytics/overview', { headers: authHeaders });
  console.log(`- Analytics Overview: Status ${analyticsRes.status}`);
  console.log(`  Dados retornados:`, analyticsRes.data);

  // 7. AI ENGINE & TOOLS TEST
  console.log('\n7. Testando AI Engine e Ferramentas Técnicas...');
  const { AIService } = require('./dist/modules/ai/ai.service');
  const { prisma } = require('./dist/database/prisma');
  const { redis } = require('./dist/redis/client');

  const tenant = await prisma.tenant.findFirst();
  if (tenant) {
    try {
      const aiService = new AIService();
      console.log('AI Service instanciado com sucesso!');
      console.log('Verificando configuração de IA do tenant...');
      const config = await prisma.aIConfig.findUnique({ where: { tenantId: tenant.id } });
      console.log(`- Persona: ${config?.personaName} | Modelo: ${config?.llmModel}`);
      console.log('✅ AI Engine verificado com sucesso!');
    } catch (aiErr) {
      console.error('⚠️ Teste de IA:', aiErr.message);
    }
  }

  await prisma.$disconnect();
  await redis.quit();
  console.log('\n=== TODOS OS TESTES CONCLUÍDOS ===');
  process.exit(0);
}

runTests().catch((err) => {
  console.error(err);
  process.exit(1);
});
