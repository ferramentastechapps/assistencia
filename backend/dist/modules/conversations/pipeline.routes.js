"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pipelineRoutes = pipelineRoutes;
const prisma_1 = require("../../database/prisma");
const DEFAULT_STAGES = [
    { name: 'Novo Lead', order: 1, color: '#3B82F6' },
    { name: 'Em Atendimento IA', order: 2, color: '#8B5CF6' },
    { name: 'Aguardando Atendente', order: 3, color: '#F59E0B' },
    { name: 'Proposta Enviada', order: 4, color: '#06B6D4' },
    { name: 'Fechado / Ganho', order: 5, color: '#10B981' },
    { name: 'Perdido', order: 6, color: '#EF4444' }
];
async function pipelineRoutes(app) {
    const preHandler = [app.authenticate];
    // GET /pipeline/stages — Listar estágios do funil
    app.get('/pipeline/stages', { preHandler }, async (request, reply) => {
        let stages = await prisma_1.prisma.pipelineStage.findMany({
            where: { tenantId: request.user.tenantId },
            orderBy: { order: 'asc' }
        });
        // Se não tiver estágios cadastrados, criar estágios padrão para o tenant
        if (stages.length === 0) {
            await Promise.all(DEFAULT_STAGES.map(s => prisma_1.prisma.pipelineStage.create({
                data: {
                    tenantId: request.user.tenantId,
                    name: s.name,
                    order: s.order,
                    color: s.color
                }
            })));
            stages = await prisma_1.prisma.pipelineStage.findMany({
                where: { tenantId: request.user.tenantId },
                orderBy: { order: 'asc' }
            });
        }
        return reply.send(stages);
    });
    // GET /pipeline/board — Retorna colunas com conversas para exibição Kanban
    app.get('/pipeline/board', { preHandler }, async (request, reply) => {
        // Garantir estágios
        let stages = await prisma_1.prisma.pipelineStage.findMany({
            where: { tenantId: request.user.tenantId },
            orderBy: { order: 'asc' }
        });
        if (stages.length === 0) {
            await Promise.all(DEFAULT_STAGES.map(s => prisma_1.prisma.pipelineStage.create({
                data: {
                    tenantId: request.user.tenantId,
                    name: s.name,
                    order: s.order,
                    color: s.color
                }
            })));
            stages = await prisma_1.prisma.pipelineStage.findMany({
                where: { tenantId: request.user.tenantId },
                orderBy: { order: 'asc' }
            });
        }
        // Buscar todas as conversas ativas
        const conversations = await prisma_1.prisma.conversation.findMany({
            where: { tenantId: request.user.tenantId },
            include: {
                messages: { orderBy: { createdAt: 'desc' }, take: 1 },
                instance: { select: { id: true, phoneNumber: true, instanceName: true } },
                tags: { include: { tag: true } }
            },
            orderBy: { updatedAt: 'desc' }
        });
        // Distribuir nas colunas
        const board = stages.map(stage => ({
            ...stage,
            conversations: conversations.filter(c => c.stageId === stage.id)
        }));
        // Conversas sem estágio (inbox geral / recém chegadas) vão para o primeiro estágio
        const unassigned = conversations.filter(c => !c.stageId);
        if (board.length > 0 && unassigned.length > 0) {
            board[0].conversations.push(...unassigned);
        }
        return reply.send(board);
    });
    // POST /pipeline/stages — Criar novo estágio
    app.post('/pipeline/stages', { preHandler }, async (request, reply) => {
        const { name, color, order } = request.body;
        const stage = await prisma_1.prisma.pipelineStage.create({
            data: {
                tenantId: request.user.tenantId,
                name,
                color: color || '#3B82F6',
                order: order || 99
            }
        });
        return reply.code(201).send(stage);
    });
    // DELETE /pipeline/stages/:id — Deletar estágio
    app.delete('/pipeline/stages/:id', { preHandler }, async (request, reply) => {
        const { id } = request.params;
        await prisma_1.prisma.pipelineStage.deleteMany({
            where: { id, tenantId: request.user.tenantId }
        });
        return reply.send({ success: true });
    });
}
//# sourceMappingURL=pipeline.routes.js.map