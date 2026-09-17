"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.catalogRoutes = catalogRoutes;
const prisma_1 = require("../../database/prisma");
// ─── Calculadora de Trade-In ──────────────────────────────────────────────────
// Baseado em tabelas FIPE de celulares e referências de mercado de seminovos BR
const TRADE_IN_BASE_VALUES = {
    'Apple': {
        'iPhone 15 Pro Max': 5500,
        'iPhone 15 Pro': 4800,
        'iPhone 15 Plus': 4000,
        'iPhone 15': 3500,
        'iPhone 14 Pro Max': 4200,
        'iPhone 14 Pro': 3600,
        'iPhone 14 Plus': 2800,
        'iPhone 14': 2400,
        'iPhone 13 Pro Max': 3400,
        'iPhone 13 Pro': 2900,
        'iPhone 13': 2000,
        'iPhone 13 Mini': 1600,
        'iPhone 12 Pro Max': 2600,
        'iPhone 12 Pro': 2200,
        'iPhone 12': 1500,
        'iPhone 11 Pro Max': 1800,
        'iPhone 11 Pro': 1500,
        'iPhone 11': 1200,
        'iPhone XS Max': 1000,
        'iPhone XS': 800,
        'iPhone X': 700,
        'iPhone 8 Plus': 500,
        'iPhone 8': 400,
        'iPhone SE (2022)': 900,
        'iPhone SE (2020)': 500,
    },
    'Samsung': {
        'Galaxy S24 Ultra': 5000,
        'Galaxy S24+': 3800,
        'Galaxy S24': 3200,
        'Galaxy S23 Ultra': 3800,
        'Galaxy S23+': 2800,
        'Galaxy S23': 2300,
        'Galaxy S22 Ultra': 2800,
        'Galaxy S22+': 2000,
        'Galaxy S22': 1700,
        'Galaxy Z Flip5': 3500,
        'Galaxy Z Fold5': 6000,
        'Galaxy Z Flip4': 2500,
        'Galaxy A54': 900,
        'Galaxy A34': 650,
        'Galaxy A24': 450,
        'Galaxy A14': 350,
        'Galaxy A53': 700,
        'Galaxy A33': 500,
        'Galaxy M54': 800,
    },
    'Motorola': {
        'Edge 50 Ultra': 2800,
        'Edge 50 Pro': 2200,
        'Edge 50': 1800,
        'Edge 40 Pro': 2000,
        'Edge 40': 1400,
        'Edge 30 Ultra': 1600,
        'Moto G84': 700,
        'Moto G54': 550,
        'Moto G34': 400,
        'Moto G14': 280,
        'Moto G73': 600,
        'Moto G53': 450,
        'Moto G32': 350,
        'Moto G22': 280,
    },
    'Xiaomi': {
        'Redmi Note 13 Pro+': 1400,
        'Redmi Note 13 Pro': 1100,
        'Redmi Note 13': 800,
        'Redmi Note 12 Pro+': 1000,
        'Redmi Note 12 Pro': 800,
        'Redmi Note 12': 600,
        'Redmi 13C': 400,
        'Poco X6 Pro': 1500,
        'Poco X6': 1200,
        'Poco F5': 1800,
        'Xiaomi 14': 3500,
        'Xiaomi 13T Pro': 2800,
        'Xiaomi 13T': 2200,
    }
};
function calculateTradeIn(brand, model, storage, batteryHealth, condition, hasBox, hasCharger) {
    // Buscar valor base (procura normalizado)
    const brandData = TRADE_IN_BASE_VALUES[brand];
    let baseValue = 0;
    if (brandData) {
        // Tentativa exata primeiro, depois parcial
        const exactKey = Object.keys(brandData).find(k => k.toLowerCase() === model.toLowerCase());
        const partialKey = Object.keys(brandData).find(k => k.toLowerCase().includes(model.toLowerCase()) ||
            model.toLowerCase().includes(k.toLowerCase()));
        baseValue = brandData[exactKey ?? partialKey ?? ''] ?? 0;
    }
    if (baseValue === 0)
        baseValue = 500; // Fallback para modelos desconhecidos
    // Multiplicador por condição
    const conditionMultipliers = {
        'Excelente': 0.90,
        'Bom': 0.75,
        'Regular': 0.55,
        'Com defeito': 0.30,
    };
    const condMult = conditionMultipliers[condition] ?? 0.65;
    let value = baseValue * condMult;
    // Desconto por saúde da bateria (abaixo de 85% começa a descontar)
    if (batteryHealth !== null && batteryHealth < 85) {
        const batteryDiscount = Math.max(0, (85 - batteryHealth) * 0.015); // -1.5% por ponto abaixo de 85
        value *= (1 - batteryDiscount);
    }
    // Bônus por armazenamento maior (ex: 256GB vs 128GB)
    if (storage?.includes('256'))
        value *= 1.08;
    if (storage?.includes('512'))
        value *= 1.18;
    if (storage?.includes('1T') || storage?.includes('1TB'))
        value *= 1.30;
    // Bônus por acessórios
    if (hasBox)
        value *= 1.03;
    if (hasCharger)
        value *= 1.02;
    const min = Math.round(value * 0.90 / 50) * 50; // Arredonda para R$ 50
    const max = Math.round(value * 1.10 / 50) * 50;
    return { min, max };
}
async function catalogRoutes(app) {
    const opts = { preHandler: [app.authenticate] };
    // ─── GET /catalog/products — Listar aparelhos ─────────────────────────────
    app.get('/catalog/products', opts, async (request, reply) => {
        const tenantId = request.user.tenantId;
        const { brand, category, condition, search, available, featured, page = '1', limit = '20' } = request.query;
        const take = Math.min(Number(limit), 100);
        const skip = (Number(page) - 1) * take;
        const where = { tenantId };
        if (brand)
            where.brand = { contains: brand, mode: 'insensitive' };
        if (category)
            where.category = category;
        if (condition)
            where.condition = condition;
        if (available === 'true')
            where.isAvailable = true;
        if (available === 'false')
            where.isAvailable = false;
        if (featured === 'true')
            where.isFeatured = true;
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { brand: { contains: search, mode: 'insensitive' } },
                { model: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }
        const [total, products] = await Promise.all([
            prisma_1.prisma.phoneProduct.count({ where }),
            prisma_1.prisma.phoneProduct.findMany({
                where,
                orderBy: [{ isFeatured: 'desc' }, { cashPrice: 'asc' }],
                take,
                skip
            })
        ]);
        return reply.send({ total, page: Number(page), products });
    });
    // ─── GET /catalog/stats — Estatísticas de estoque ─────────────────────────
    app.get('/catalog/stats', opts, async (request, reply) => {
        const tenantId = request.user.tenantId;
        const [totalProducts, totalStock, available, featured, avgPrice] = await Promise.all([
            prisma_1.prisma.phoneProduct.count({ where: { tenantId } }),
            prisma_1.prisma.phoneProduct.aggregate({ where: { tenantId }, _sum: { stock: true } }),
            prisma_1.prisma.phoneProduct.count({ where: { tenantId, isAvailable: true, stock: { gt: 0 } } }),
            prisma_1.prisma.phoneProduct.count({ where: { tenantId, isFeatured: true } }),
            prisma_1.prisma.phoneProduct.aggregate({ where: { tenantId }, _avg: { cashPrice: true } }),
        ]);
        return reply.send({
            totalProducts,
            totalStock: totalStock._sum.stock ?? 0,
            available,
            featured,
            avgPrice: avgPrice._avg.cashPrice ?? 0,
        });
    });
    // ─── GET /catalog/products/:id — Detalhe do produto ─────────────────────
    app.get('/catalog/products/:id', opts, async (request, reply) => {
        const { id } = request.params;
        const tenantId = request.user.tenantId;
        const product = await prisma_1.prisma.phoneProduct.findFirst({ where: { id, tenantId } });
        if (!product)
            return reply.code(404).send({ error: 'Produto não encontrado' });
        return reply.send(product);
    });
    // ─── POST /catalog/products — Cadastrar aparelho ──────────────────────────
    app.post('/catalog/products', opts, async (request, reply) => {
        const tenantId = request.user.tenantId;
        const body = request.body;
        const product = await prisma_1.prisma.phoneProduct.create({
            data: {
                tenantId,
                title: body.title,
                brand: body.brand,
                model: body.model,
                category: body.category || 'SMARTPHONE',
                condition: body.condition || 'SEMINOVO_A_PLUS',
                storage: body.storage,
                color: body.color,
                batteryHealth: body.batteryHealth,
                ram: body.ram,
                cashPrice: body.cashPrice,
                installmentPrice: body.installmentPrice,
                installments: body.installments || 12,
                stock: body.stock ?? 1,
                isAvailable: (body.stock ?? 1) > 0,
                imageUrl: body.imageUrl,
                imageUrls: body.imageUrls ? JSON.stringify(body.imageUrls) : undefined,
                description: body.description,
                warrantyMonths: body.warrantyMonths ?? 3,
                isFeatured: body.isFeatured ?? false,
            }
        });
        return reply.code(201).send(product);
    });
    // ─── PATCH /catalog/products/:id — Atualizar aparelho ────────────────────
    app.patch('/catalog/products/:id', opts, async (request, reply) => {
        const { id } = request.params;
        const tenantId = request.user.tenantId;
        const body = request.body;
        const existing = await prisma_1.prisma.phoneProduct.findFirst({ where: { id, tenantId } });
        if (!existing)
            return reply.code(404).send({ error: 'Produto não encontrado' });
        const data = { ...body };
        if (data.imageUrls && Array.isArray(data.imageUrls)) {
            data.imageUrls = JSON.stringify(data.imageUrls);
        }
        if (data.stock !== undefined) {
            data.isAvailable = data.stock > 0;
        }
        const updated = await prisma_1.prisma.phoneProduct.update({ where: { id }, data });
        return reply.send(updated);
    });
    // ─── DELETE /catalog/products/:id — Remover produto ──────────────────────
    app.delete('/catalog/products/:id', opts, async (request, reply) => {
        const { id } = request.params;
        const tenantId = request.user.tenantId;
        const existing = await prisma_1.prisma.phoneProduct.findFirst({ where: { id, tenantId } });
        if (!existing)
            return reply.code(404).send({ error: 'Produto não encontrado' });
        await prisma_1.prisma.phoneProduct.delete({ where: { id } });
        return reply.code(204).send();
    });
    // ─── POST /catalog/trade-in — Calcular avaliação de aparelho usado ─────────
    app.post('/catalog/trade-in', opts, async (request, reply) => {
        const tenantId = request.user.tenantId;
        const body = request.body;
        const { min, max } = calculateTradeIn(body.brand, body.model, body.storage ?? null, body.batteryHealth ?? null, body.condition, body.hasBox ?? false, body.hasCharger ?? false);
        // Salvar simulação
        const simulation = await prisma_1.prisma.tradeInSimulation.create({
            data: {
                tenantId,
                brand: body.brand,
                model: body.model,
                storage: body.storage,
                batteryHealth: body.batteryHealth,
                condition: body.condition,
                hasBox: body.hasBox ?? false,
                hasCharger: body.hasCharger ?? false,
                estimatedMin: min,
                estimatedMax: max,
                customerPhone: body.customerPhone,
                conversationId: body.conversationId,
            }
        });
        return reply.code(201).send({
            id: simulation.id,
            estimatedMin: min,
            estimatedMax: max,
            formatted: `R$ ${min.toLocaleString('pt-BR')} a R$ ${max.toLocaleString('pt-BR')}`,
            brand: body.brand,
            model: body.model,
            condition: body.condition,
        });
    });
    // ─── GET /catalog/trade-in — Listar simulações de trade-in ────────────────
    app.get('/catalog/trade-in', opts, async (request, reply) => {
        const tenantId = request.user.tenantId;
        const simulations = await prisma_1.prisma.tradeInSimulation.findMany({
            where: { tenantId },
            orderBy: { createdAt: 'desc' },
            take: 50
        });
        return reply.send({ simulations });
    });
}
//# sourceMappingURL=catalog.routes.js.map