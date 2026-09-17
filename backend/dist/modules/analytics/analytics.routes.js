"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyticsRoutes = analyticsRoutes;
const prisma_1 = require("../../database/prisma");
const auth_1 = require("../../middleware/auth");
async function analyticsRoutes(app) {
    const preHandler = [app.authenticate];
    // GET /analytics/overview — Visão geral
    app.get('/analytics/overview', { preHandler }, async (request, reply) => {
        const tenantId = request.user.tenantId;
        const now = new Date();
        const startOfDay = new Date(now.setHours(0, 0, 0, 0));
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const [totalConversations, todayConversations, humanConversations, resolvedConversations, avgCsat, messageCount, tenant] = await Promise.all([
            prisma_1.prisma.conversation.count({ where: { tenantId } }),
            prisma_1.prisma.conversation.count({ where: { tenantId, createdAt: { gte: startOfDay } } }),
            prisma_1.prisma.conversation.count({ where: { tenantId, status: 'HUMAN_ACTIVE' } }),
            prisma_1.prisma.conversation.count({ where: { tenantId, status: 'RESOLVED', resolvedAt: { gte: startOfMonth } } }),
            prisma_1.prisma.conversation.aggregate({
                where: { tenantId, csatScore: { not: null } },
                _avg: { csatScore: true }
            }),
            prisma_1.prisma.message.count({
                where: { conversation: { tenantId }, createdAt: { gte: startOfMonth } }
            }),
            prisma_1.prisma.tenant.findUnique({
                where: { id: tenantId },
                select: { apiUsage: true, maxMessages: true, plan: true }
            })
        ]);
        // Taxa de deflection (% resolvido pela IA sem intervenção humana)
        const allResolved = await prisma_1.prisma.conversation.count({ where: { tenantId, status: 'RESOLVED' } });
        const humanResolved = await prisma_1.prisma.conversation.count({
            where: { tenantId, status: 'RESOLVED', assignedTo: { not: null } }
        });
        const deflectionRate = allResolved > 0
            ? Math.round(((allResolved - humanResolved) / allResolved) * 100)
            : 0;
        return reply.send({
            totalConversations,
            todayConversations,
            humanConversations,
            resolvedThisMonth: resolvedConversations,
            deflectionRate,
            avgCsat: avgCsat._avg.csatScore?.toFixed(1) || null,
            messagesThisMonth: messageCount,
            apiUsage: tenant?.apiUsage || 0,
            maxMessages: tenant?.maxMessages || 0,
            plan: tenant?.plan || 'FREE'
        });
    });
    // GET /analytics/conversations-chart — Gráfico de conversas por dia (últimos 30 dias)
    app.get('/analytics/conversations-chart', { preHandler }, async (request, reply) => {
        const tenantId = request.user.tenantId;
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const data = await prisma_1.prisma.$queryRaw `
      SELECT 
        DATE("createdAt")::text as date,
        COUNT(*)::int as count
      FROM conversations
      WHERE "tenantId" = ${tenantId}
        AND "createdAt" >= ${thirtyDaysAgo}
      GROUP BY DATE("createdAt")
      ORDER BY date ASC
    `;
        return reply.send(data);
    });
    // GET /analytics/ai-config — Configuração da IA
    app.get('/ai-config', { preHandler }, async (request, reply) => {
        const config = await prisma_1.prisma.aIConfig.findUnique({
            where: { tenantId: request.user.tenantId }
        });
        return reply.send(config);
    });
    // PATCH /analytics/ai-config — Atualizar configuração da IA
    app.patch('/ai-config', { preHandler: [app.authenticate, auth_1.tenantAdminMiddleware] }, async (request, reply) => {
        const data = request.body;
        const config = await prisma_1.prisma.aIConfig.upsert({
            where: { tenantId: request.user.tenantId },
            update: data,
            create: { tenantId: request.user.tenantId, ...data }
        });
        return reply.send(config);
    });
}
//# sourceMappingURL=analytics.routes.js.map