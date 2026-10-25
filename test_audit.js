const { PrismaClient } = require('@prisma/client');
const http = require('http');

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
  console.log('=== ZAPIA COMPREHENSIVE AUDIT ===\n');

  // 1. DATABASE & PRISMA MODELS
  console.log('--- 1. DATABASE & PRISMA MODELS ---');
  const prisma = new PrismaClient();
  try {
    await prisma.$connect();
    console.log('✅ PostgreSQL Connection: OK');

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
        console.log(`❌ Prisma model [${m}]: NOT DEFINED on client`);
      } else {
        try {
          const count = await prisma[m].count();
          console.log(`✅ Prisma model [${m}]: OK (count: ${count})`);
        } catch (err) {
          console.log(`⚠️ Prisma model [${m}]: ERROR querying table (${err.message.split('\n').pop()})`);
        }
      }
    }
  } catch (err) {
    console.log('❌ PostgreSQL Connection Failed:', err.message);
  }

  // 2. BACKEND API ENDPOINTS (port 3011)
  console.log('\n--- 2. BACKEND API ENDPOINTS (Port 3011) ---');
  const endpoints = [
    { name: 'Health Check', url: 'http://127.0.0.1:3011/health' },
    { name: 'Repairs List (unauth test)', url: 'http://127.0.0.1:3011/api/v1/repairs' },
    { name: 'Catalog Products (unauth test)', url: 'http://127.0.0.1:3011/api/v1/catalog/products' },
    { name: 'Pipeline Board (unauth test)', url: 'http://127.0.0.1:3011/api/v1/pipeline/board' },
    { name: 'Conversations (unauth test)', url: 'http://127.0.0.1:3011/api/v1/conversations' },
    { name: 'Analytics Overview (unauth test)', url: 'http://127.0.0.1:3011/api/v1/analytics/overview' },
  ];

  for (const ep of endpoints) {
    const res = await checkHttp(ep.url);
    console.log(`Endpoint [${ep.name}]: Status ${res.status || 'ERR'} ${res.error ? '(' + res.error + ')' : ''}`);
  }

  // 3. EVOLUTION API (Port 8085)
  console.log('\n--- 3. EVOLUTION API / WHATSAPP ENGINE (Port 8085) ---');
  const evoRes = await checkHttp('http://127.0.0.1:8085');
  console.log(`Evolution API root: Status ${evoRes.status || 'ERR'} ${evoRes.error ? '(' + evoRes.error + ')' : ''}`);

  // 4. FRONTEND DASHBOARD (Port 3010)
  console.log('\n--- 4. FRONTEND DASHBOARD (Port 3010) ---');
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
  ];

  for (const p of pages) {
    const res = await checkHttp(`http://127.0.0.1:3010${p}`);
    console.log(`Dashboard route [${p}]: Status ${res.status || 'ERR'} ${res.error ? '(' + res.error + ')' : ''}`);
  }

  // 5. TEST USER & TENANT RECORD
  console.log('\n--- 5. DEFAULT TENANT & USER AUDIT ---');
  try {
    const tenants = await prisma.tenant.findMany({
      include: {
        users: { select: { id: true, email: true, role: true, name: true } },
        instances: { select: { id: true, instanceName: true, status: true } },
        aiConfig: { select: { id: true, personaName: true, llmModel: true } }
      }
    });
    console.log(`Total Tenants found: ${tenants.length}`);
    for (const t of tenants) {
      console.log(`- Tenant: "${t.name}" (ID: ${t.id}, Plan: ${t.plan})`);
      console.log(`  Users: ${t.users.map(u => u.email + ' [' + u.role + ']').join(', ') || 'None'}`);
      console.log(`  WhatsApp Instances: ${t.instances.map(i => i.instanceName + ' (' + i.status + ')').join(', ') || 'None'}`);
      console.log(`  AI Config: Persona "${t.aiConfig?.personaName || 'None'}", Model: ${t.aiConfig?.llmModel || 'None'}`);
    }
  } catch (err) {
    console.log('Error fetching tenant details:', err.message);
  }

  await prisma.$disconnect();
  console.log('\n=== AUDIT COMPLETE ===');
}

runAudit().catch(console.error);
