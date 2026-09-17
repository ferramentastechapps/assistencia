"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.conversationRoutes = conversationRoutes;
const prisma_1 = require("../../database/prisma");
const auth_1 = require("../../middleware/auth");
const client_1 = require("../../redis/client");
const whatsapp_service_1 = require("../whatsapp/whatsapp.service");
const server_1 = require("../../server");
const whatsappService = new whatsapp_service_1.WhatsAppService();
async function conversationRoutes(app) {
    const preHandler = [app.authenticate];
    const adminHandler = [app.authenticate, auth_1.tenantAdminMiddleware];
    // GET /conversations — Listar conversas
    app.get('/conversations', { preHandler }, async (request, reply) => {
        const { status, search, stageId, tagId, page = 1, limit = 50 } = request.query;
        const where = { tenantId: request.user.tenantId };
        if (status)
            where.status = status;
        if (stageId)
            where.stageId = stageId;
        if (tagId)
            where.tags = { some: { tagId } };
        if (search)
            where.OR = [
                { contactPhone: { contains: search } },
                { contactName: { contains: search, mode: 'insensitive' } }
            ];
        const [conversations, total] = await Promise.all([
            prisma_1.prisma.conversation.findMany({
                where,
                include: {
                    messages: { orderBy: { createdAt: 'desc' }, take: 1 },
                    instance: { select: { id: true, phoneNumber: true, instanceName: true } },
                    tags: { include: { tag: true } },
                    stage: true
                },
                orderBy: { updatedAt: 'desc' },
                skip: (Number(page) - 1) * Number(limit),
                take: Number(limit)
            }),
            prisma_1.prisma.conversation.count({ where })
        ]);
        return reply.send({ conversations, total, page: Number(page), limit: Number(limit) });
    });
    // GET /conversations/:id — Detalhes da conversa
    app.get('/conversations/:id', { preHandler }, async (request, reply) => {
        const { id } = request.params;
        const conversation = await prisma_1.prisma.conversation.findFirst({
            where: { id, tenantId: request.user.tenantId },
            include: {
                messages: { orderBy: { createdAt: 'asc' } },
                instance: { select: { id: true, phoneNumber: true, instanceName: true } },
                tags: { include: { tag: true } },
                stage: true
            }
        });
        if (!conversation)
            return reply.code(404).send({ error: 'Conversa não encontrada' });
        return reply.send(conversation);
    });
    // POST /conversations/:id/assign — Assumir conversa (atendente humano)
    app.post('/conversations/:id/assign', { preHandler }, async (request, reply) => {
        const { id } = request.params;
        await prisma_1.prisma.conversation.update({
            where: { id },
            data: { status: 'HUMAN_ACTIVE', assignedTo: request.user.id }
        });
        await (0, client_1.setConversationState)(id, 'HUMAN_ACTIVE');
        return reply.send({ success: true });
    });
    // POST /conversations/:id/resolve — Resolver conversa
    app.post('/conversations/:id/resolve', { preHandler }, async (request, reply) => {
        const { id } = request.params;
        const conv = await prisma_1.prisma.conversation.findFirst({ where: { id, tenantId: request.user.tenantId }, include: { instance: true } });
        if (!conv)
            return reply.code(404).send({ error: 'Conversa não encontrada' });
        // Enviar pesquisa CSAT
        const aiConfig = await prisma_1.prisma.aIConfig.findUnique({ where: { tenantId: conv.tenantId } });
        if (aiConfig?.csatEnabled) {
            await whatsappService.sendMessage(conv.instance.instanceName, `${conv.contactPhone}@s.whatsapp.net`, aiConfig.csatMessage);
        }
        await prisma_1.prisma.conversation.update({
            where: { id },
            data: { status: 'RESOLVED', resolvedAt: new Date() }
        });
        await (0, client_1.setConversationState)(id, 'RESOLVED');
        server_1.io?.to(`tenant:${conv.tenantId}`).emit('conversation:resolved', { conversationId: id });
        return reply.send({ success: true });
    });
    // POST /conversations/:id/return-to-ai — Devolver para IA
    app.post('/conversations/:id/return-to-ai', { preHandler }, async (request, reply) => {
        const { id } = request.params;
        await prisma_1.prisma.conversation.update({
            where: { id },
            data: { status: 'AI_ACTIVE', assignedTo: null }
        });
        await (0, client_1.setConversationState)(id, 'AI_ACTIVE');
        return reply.send({ success: true });
    });
    // POST /conversations/:id/send — Enviar mensagem ou Nota Interna
    app.post('/conversations/:id/send', { preHandler }, async (request, reply) => {
        const { id } = request.params;
        const { message, isInternalNote } = request.body;
        const conv = await prisma_1.prisma.conversation.findFirst({
            where: { id, tenantId: request.user.tenantId },
            include: { instance: true }
        });
        if (!conv)
            return reply.code(404).send({ error: 'Conversa não encontrada' });
        // Se for nota interna privada da equipe
        if (isInternalNote) {
            const noteMsg = await prisma_1.prisma.message.create({
                data: {
                    conversationId: id,
                    role: 'INTERNAL_NOTE',
                    content: message,
                    isFromWhatsApp: false
                }
            });
            server_1.io?.to(`tenant:${conv.tenantId}`).emit('message:sent', { conversationId: id, message: noteMsg });
            return reply.send(noteMsg);
        }
        // Mensagem de atendente enviada para o cliente no WhatsApp
        const msg = await prisma_1.prisma.message.create({
            data: {
                conversationId: id,
                role: 'ASSISTANT',
                content: message,
                isFromWhatsApp: false
            }
        });
        // Enviar via WhatsApp
        await whatsappService.sendMessage(conv.instance.instanceName, `${conv.contactPhone}@s.whatsapp.net`, message);
        server_1.io?.to(`tenant:${conv.tenantId}`).emit('message:sent', { conversationId: id, message: msg });
        return reply.send(msg);
    });
    // ─── Tags da Conversa ───────────────────────────────────────────────────────
    // POST /conversations/:id/tags — Adicionar tag à conversa
    app.post('/conversations/:id/tags', { preHandler }, async (request, reply) => {
        const { id } = request.params;
        const { tagId } = request.body;
        const convTag = await prisma_1.prisma.conversationTag.upsert({
            where: { conversationId_tagId: { conversationId: id, tagId } },
            update: {},
            create: { conversationId: id, tagId },
            include: { tag: true }
        });
        server_1.io?.to(`tenant:${request.user.tenantId}`).emit('conversation:updated', { conversationId: id });
        return reply.send(convTag);
    });
    // DELETE /conversations/:id/tags/:tagId — Remover tag da conversa
    app.delete('/conversations/:id/tags/:tagId', { preHandler }, async (request, reply) => {
        const { id, tagId } = request.params;
        await prisma_1.prisma.conversationTag.deleteMany({
            where: { conversationId: id, tagId }
        });
        server_1.io?.to(`tenant:${request.user.tenantId}`).emit('conversation:updated', { conversationId: id });
        return reply.send({ success: true });
    });
    // ─── Estágio no Funil CRM (Pipeline) ───────────────────────────────────────
    // PATCH /conversations/:id/stage — Alterar estágio do lead no funil
    app.patch('/conversations/:id/stage', { preHandler }, async (request, reply) => {
        const { id } = request.params;
        const { stageId, estimatedValue } = request.body;
        const updated = await prisma_1.prisma.conversation.update({
            where: { id },
            data: {
                ...(stageId !== undefined && { stageId }),
                ...(estimatedValue !== undefined && { estimatedValue })
            },
            include: { stage: true, tags: { include: { tag: true } } }
        });
        server_1.io?.to(`tenant:${request.user.tenantId}`).emit('conversation:updated', { conversationId: id, conversation: updated });
        return reply.send(updated);
    });
    // ─── Gestão de Tags do Tenant ──────────────────────────────────────────────
    // GET /tags — Listar tags
    app.get('/tags', { preHandler }, async (request, reply) => {
        const tags = await prisma_1.prisma.tag.findMany({
            where: { tenantId: request.user.tenantId },
            orderBy: { name: 'asc' }
        });
        return reply.send(tags);
    });
    // POST /tags — Criar nova tag
    app.post('/tags', { preHandler }, async (request, reply) => {
        const { name, color } = request.body;
        const tag = await prisma_1.prisma.tag.upsert({
            where: { tenantId_name: { tenantId: request.user.tenantId, name } },
            update: { color: color || '#10B981' },
            create: { tenantId: request.user.tenantId, name, color: color || '#10B981' }
        });
        return reply.code(201).send(tag);
    });
    // DELETE /tags/:tagId — Deletar tag
    app.delete('/tags/:tagId', { preHandler }, async (request, reply) => {
        const { tagId } = request.params;
        await prisma_1.prisma.tag.deleteMany({
            where: { id: tagId, tenantId: request.user.tenantId }
        });
        return reply.send({ success: true });
    });
}
//# sourceMappingURL=conversation.routes.js.map