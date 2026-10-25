#!/bin/bash
set -e

echo "=== FIXING ZAPIA & EVOLUTION INFRASTRUCTURE ==="

# 1. Create separate evolution_db if it doesn't exist
echo "Step 1: Ensuring evolution_db exists..."
docker exec zapia_postgres psql -U zapia -d zapia_db -tc "SELECT 1 FROM pg_database WHERE datname = 'evolution_db'" | grep -q 1 || \
docker exec zapia_postgres psql -U zapia -d zapia_db -c "CREATE DATABASE evolution_db;"
echo "✅ Database evolution_db ready"

# 2. Update docker-compose.yml to isolate Evolution API to evolution_db
echo "Step 2: Configuring Evolution API database URI..."
sed -i 's|@postgres:5432/\${POSTGRES_DB:-zapia_db}|@postgres:5432/evolution_db|g' /opt/zapia/docker-compose.yml
echo "✅ docker-compose.yml updated"

# 3. Restart zapia_evolution with new DB
echo "Step 3: Restarting zapia_evolution..."
cd /opt/zapia
docker compose up -d evolution-api
sleep 5

# 4. Push Evolution Prisma schema into evolution_db
echo "Step 4: Pushing Evolution DB schema..."
docker exec zapia_evolution npx prisma db push --schema ./prisma/postgresql-schema.prisma --accept-data-loss || true
echo "✅ Evolution DB schema synced"

# 5. Restore and push ZapIA Backend schema into zapia_db
echo "Step 5: Restoring ZapIA Backend schema into zapia_db..."
cd /opt/zapia/backend
npx prisma db push --accept-data-loss
npx prisma generate
echo "✅ ZapIA Backend schema synced"

# 6. Seed default data if needed
echo "Step 6: Checking seed / admin user..."
node -e "
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function init() {
  let tenant = await prisma.tenant.findFirst();
  if (!tenant) {
    tenant = await prisma.tenant.create({
      data: {
        name: 'ZapIA Tech',
        email: 'contato@zapia.com',
        plan: 'ENTERPRISE',
        maxMessages: 999999,
      }
    });
    console.log('Created tenant:', tenant.id);
  }

  let user = await prisma.user.findFirst();
  if (!user) {
    const hashed = await bcrypt.hash('admin123', 10);
    user = await prisma.user.create({
      data: {
        email: 'admin@zapia.com',
        name: 'Administrador',
        password: hashed,
        role: 'SUPER_ADMIN',
        tenantId: tenant.id
      }
    });
    console.log('Created admin user: admin@zapia.com / admin123');
  }

  let aiConfig = await prisma.aIConfig.findUnique({ where: { tenantId: tenant.id } });
  if (!aiConfig) {
    await prisma.aIConfig.create({
      data: {
        tenantId: tenant.id,
        personaName: 'Atendente Tech',
        personaTone: 'profissional, técnico e atencioso',
        llmModel: 'openai/gpt-4o-mini',
        systemPrompt: 'Você é o assistente virtual especializado em assistência técnica de celulares e venda de smartphones.'
      }
    });
    console.log('Created AI config');
  }

  // Sample catalog phone
  const countPhones = await prisma.phoneProduct.count({ where: { tenantId: tenant.id } });
  if (countPhones === 0) {
    await prisma.phoneProduct.create({
      data: {
        tenantId: tenant.id,
        title: 'iPhone 13 128GB Estelar - Seminovo Impecável',
        brand: 'Apple',
        model: 'iPhone 13',
        storage: '128GB',
        color: 'Estelar',
        batteryHealth: 92,
        condition: 'SEMINOVO_A_PLUS',
        cashPrice: 2850,
        installmentPrice: 3150,
        installments: 12,
        stock: 3,
        isAvailable: true,
        warrantyMonths: 3,
        isFeatured: true
      }
    });
    console.log('Created sample phone product');
  }

  // Sample repair quote catalog
  const countQuotes = await prisma.repairQuoteCatalog.count({ where: { tenantId: tenant.id } });
  if (countQuotes === 0) {
    await prisma.repairQuoteCatalog.create({
      data: {
        tenantId: tenant.id,
        brand: 'Apple',
        modelPattern: 'iPhone 13',
        serviceType: 'Troca de Tela OLED Premium',
        priceMin: 550,
        priceMax: 680,
        averageTime: '45 minutos',
        warrantyDays: 90,
        notes: 'Peça de primeira linha com True Tone e 3 meses de garantia.'
      }
    });
    console.log('Created sample repair quote');
  }

  await prisma.$disconnect();
}
init().catch(console.error);
"

# 7. Restart PM2 backend
echo "Step 7: Restarting PM2 zapia-backend..."
pm2 restart zapia-backend

echo "=== INFRASTRUCTURE SYNC COMPLETE ==="
