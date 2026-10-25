const fs = require('fs');
const path = require('path');
const http = require('http');

// Manually load env from /opt/zapia/.env and /opt/zapia/backend/.env
function loadEnv(filePath) {
  if (fs.existsSync(filePath)) {
    const lines = fs.readFileSync(filePath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const idx = trimmed.indexOf('=');
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim().replace(/^['"](.*)['"]$/, '$1');
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

loadEnv('/opt/zapia/.env');
loadEnv('/opt/zapia/backend/.env');
loadEnv(path.join(__dirname, '.env'));
loadEnv(path.join(__dirname, '..', '.env'));

const { PrismaClient } = require('@prisma/client');

async function checkHttp(url, options = {}) {
  return new Promise((resolve) => {
    try {
      const parsed = new URL(url);
      const req = http.request({
        hostname: parsed.hostname,
        port: parsed.port,
        path: parsed.pathname + parsed.search,
        method: options.method || 'GET',
        headers: options.headers || {},
        timeout: 5000,
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          resolve({ ok: res.statusCode >= 200 && res.statusCode < 400, status: res.statusCode, body: data });
        });
      });
      req.on('error', (err) => resolve({ ok: false, error: err.message }));
      req.on('timeout', () => { req.destroy(); resolve({ ok: false, error: 'Timeout' }); });
      if (options.body) req.write(options.body);
      req.end();
    } catch (e) {
      resolve({ ok: false, error: e.message });
    }
  });
}

async function runAudit() {
  console.log('====================================================');
  console.log('       ZAPIA FULL-STACK FUNCTIONALITY AUDIT         ');
  console.log('====================================================\n');
  console.log('DATABASE_URL present:', !!process.env.DATABASE_URL);
  console.log('OPENROUTER_API_KEY present:', !!process.env.OPENROUTER_API_KEY);
  console.log('JWT_SECRET present:', !!process.env.JWT_SECRET);
  console.log('EVOLUTION_API_KEY present:', !!process.env.EVOLUTION_API_KEY);
  console.log('EVOLUTION_API_URL:', process.env.EVOLUTION_API_URL || 'http://localhost:8085');

  // 1. DATABASE & PRISMA MODELS
  console.log('\n--- 1. DATABASE & PRISMA ENTITIES ---');
  const prisma = new PrismaClient();
  let defaultTenant = null;
  let defaultToken = null;

  try {
    await prisma.$connect();
    console.log('✅ PostgreSQL Connection: SUCESSO');

    const models = [
      'tenant',
      'user',
      'whatsAppInstance',
      'aIConfig',
      'repairOrder',
      'phoneProduct',
      'repairQuoteCatalog',
      'tradeInSimulation',
      'pipelineStage',
      'conversation',
      'message',
      'knowledgeDocument',
      'quickReply',
      'tag'
    ];

    for (const m of models) {
      if (!prisma[m]) {
        console.log(`❌ Prisma model [${m}]: NÃO DEFINIDO no Prisma Client!`);
      } else {
        try {
          const count = await prisma[m].count();
          console.log(`✅ Prisma model [${m}]: OK (${count} registros)`);
        } catch (err) {
          console.log(`⚠️ Prisma model [${m}]: ERRO ao consultar (${err.message.split('\n').pop()})`);
        }
      }
    }

    // Carregar tenant padrão para testes autenticados
    defaultTenant = await prisma.tenant.findFirst({
      include: {
        users: true,
        instances: true,
        aiConfig: true
      }
    });

  } catch (err) {
    console.log('❌ PostgreSQL Erro:', err.message);
  }

  // 2. BACKEND API ENDPOINTS (Port 3011)
  console.log('\n--- 2. BACKEND FASTIFY API (Port 3011) ---');
  const endpoints = [
    { name: 'Health Check (/health)', url: 'http://127.0.0.1:3011/health' },
    { name: 'Repairs List (/api/v1/repairs)', url: 'http://127.0.0.1:3011/api/v1/repairs' },
    { name: 'Repairs Stats (/api/v1/repairs/stats)', url: 'http://127.0.0.1:3011/api/v1/repairs/stats' },
    { name: 'Catalog Products (/api/v1/catalog/products)', url: 'http://127.0.0.1:3011/api/v1/catalog/products' },
    { name: 'Catalog Quotes (/api/v1/catalog/quotes)', url: 'http://127.0.0.1:3011/api/v1/catalog/quotes' },
    { name: 'Trade-in Sim (/api/v1/catalog/trade-in)', url: 'http://127.0.0.1:3011/api/v1/catalog/trade-in' },
    { name: 'Pipeline Board (/api/v1/pipeline/board)', url: 'http://127.0.0.1:3011/api/v1/pipeline/board' },
    { name: 'Conversations (/api/v1/conversations)', url: 'http://127.0.0.1:3011/api/v1/conversations' },
    { name: 'Analytics Overview (/api/v1/analytics/overview)', url: 'http://127.0.0.1:3011/api/v1/analytics/overview' },
    { name: 'Knowledge Docs (/api/v1/knowledge/docs)', url: 'http://127.0.0.1:3011/api/v1/knowledge/docs' },
    { name: 'AI Config (/api/v1/ai/config)', url: 'http://127.0.0.1:3011/api/v1/ai/config' },
    { name: 'WhatsApp Instances (/api/v1/whatsapp/instances)', url: 'http://127.0.0.1:3011/api/v1/whatsapp/instances' },
  ];

  for (const ep of endpoints) {
    const res = await checkHttp(ep.url);
    const summary = res.body ? (res.body.length > 80 ? res.body.slice(0, 80) + '...' : res.body) : '';
    console.log(`Endpoint [${ep.name}]: Status ${res.status || 'ERR'} | Resposta: ${summary}`);
  }

  // 3. EVOLUTION API (Port 8085)
  console.log('\n--- 3. EVOLUTION API / WHATSAPP GATEWAY (Port 8085) ---');
  const evoRes = await checkHttp('http://127.0.0.1:8085', {
    headers: { 'apikey': process.env.EVOLUTION_API_KEY || '' }
  });
  console.log(`Evolution API root: Status ${evoRes.status || 'ERR'} | ${evoRes.body?.slice(0, 80) || evoRes.error}`);

  const evoInstances = await checkHttp('http://127.0.0.1:8085/instance/fetchInstances', {
    headers: { 'apikey': process.env.EVOLUTION_API_KEY || '' }
  });
  console.log(`Evolution Instances: Status ${evoInstances.status || 'ERR'} | ${evoInstances.body?.slice(0, 100) || evoInstances.error}`);

  // 4. FRONTEND DASHBOARD (Port 3010)
  console.log('\n--- 4. FRONTEND DASHBOARD NEXT.JS (Port 3010) ---');
  const pages = [
    '/',
    '/login',
    '/dashboard',
    '/repairs',
    '/catalog',
    '/trade-in',
    '/conversations',
    '/pipeline',
    '/knowledge',
    '/settings/ai',
    '/settings/whatsapp',
    '/settings/team',
  ];

  for (const p of pages) {
    const res = await checkHttp(`http://127.0.0.1:3010${p}`);
    console.log(`Dashboard page [${p}]: Status ${res.status || 'ERR'}`);
  }

  // 5. TENANT & USER STATE
  console.log('\n--- 5. ESTADO ATUAL DE TENANT, USUÁRIO E IA ---');
  if (defaultTenant) {
    console.log(`Tenant Ativo: "${defaultTenant.name}" (ID: ${defaultTenant.id})`);
    console.log(`Plano: ${defaultTenant.plan} | Ativo: ${defaultTenant.isActive}`);
    console.log(`Usuários (${defaultTenant.users.length}):`, defaultTenant.users.map(u => `${u.name} <${u.email}> [${u.role}]`));
    console.log(`WhatsApp (${defaultTenant.instances.length}):`, defaultTenant.instances.map(i => `${i.instanceName} [${i.status}]`));
    console.log(`AI Config: Persona "${defaultTenant.aiConfig?.personaName}", LLM: ${defaultTenant.aiConfig?.llmModel}`);
  } else {
    console.log('⚠️ Nenhum tenant encontrado no banco de dados.');
  }

  await prisma.$disconnect();
  console.log('\n====================================================');
  console.log('                 FIM DO AUDIT                       ');
  console.log('====================================================');
}

runAudit().catch(console.error);
