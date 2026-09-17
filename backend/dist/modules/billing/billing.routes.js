"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.billingRoutes = billingRoutes;
const prisma_1 = require("../../database/prisma");
const config_1 = require("../../config");
async function billingRoutes(app) {
    // GET /billing/overview — Informações do plano e uso atual
    app.get('/billing/overview', { preHandler: [app.authenticate] }, async (request, reply) => {
        const tenantId = request.user.tenantId;
        const tenant = await prisma_1.prisma.tenant.findUnique({
            where: { id: tenantId },
            include: {
                _count: {
                    select: {
                        instances: true,
                        knowledgeDocs: true,
                        conversations: true
                    }
                }
            }
        });
        if (!tenant)
            return reply.code(404).send({ error: 'Tenant não encontrado' });
        const planConfig = config_1.config.plans[tenant.plan] || config_1.config.plans.FREE;
        const percentUsed = Math.min(Math.round((tenant.apiUsage / tenant.maxMessages) * 100), 100);
        return reply.send({
            plan: tenant.plan,
            apiUsage: tenant.apiUsage,
            maxMessages: tenant.maxMessages,
            percentUsed,
            activeInstances: tenant._count.instances,
            maxInstances: planConfig.maxInstances,
            knowledgeDocsCount: tenant._count.knowledgeDocs,
            maxKnowledgeDocs: planConfig.maxKnowledgeDocs,
            totalConversations: tenant._count.conversations,
            isNearLimit: percentUsed >= 80,
            isLimitReached: tenant.apiUsage >= tenant.maxMessages
        });
    });
    // POST /billing/create-checkout — Simular ou gerar checkout para Upgrade
    app.post('/billing/create-checkout', { preHandler: [app.authenticate] }, async (request, reply) => {
        const { targetPlan } = request.body;
        const tenantId = request.user.tenantId;
        if (!['PRO', 'ENTERPRISE'].includes(targetPlan)) {
            return reply.code(400).send({ error: 'Plano inválido' });
        }
        const price = targetPlan === 'PRO' ? 149.00 : 399.00;
        // Retorna URL de checkout ou instruções Pix
        return reply.send({
            targetPlan,
            price,
            currency: 'BRL',
            pixCopyAndPaste: `00020126580014br.gov.bcb.pix0136zapia-saas-${tenantId}520400005303986540${price}.005802BR5915ZapIA SaaS6009Sao Paulo62070503***6304ABCD`,
            checkoutUrl: `${config_1.config.app.url}/checkout?plan=${targetPlan}&tenantId=${tenantId}`
        });
    });
    // POST /billing/webhook — Webhook de confirmação de pagamento de assinaturas
    app.post('/billing/webhook', async (request, reply) => {
        const payload = request.body;
        // Tratamento de evento de pagamento aprovado
        if (payload?.event === 'PAYMENT_RECEIVED' || payload?.status === 'approved') {
            const tenantId = payload?.tenantId || payload?.external_reference;
            const newPlan = payload?.plan || 'PRO';
            if (tenantId) {
                const planConfig = config_1.config.plans[newPlan] || config_1.config.plans.PRO;
                await prisma_1.prisma.tenant.update({
                    where: { id: tenantId },
                    data: {
                        plan: newPlan,
                        maxMessages: planConfig.maxMessages,
                        isActive: true
                    }
                });
                console.log(`✅ [Billing] Tenant ${tenantId} atualizado para o plano ${newPlan}`);
            }
        }
        return reply.send({ received: true });
    });
}
//# sourceMappingURL=billing.routes.js.map