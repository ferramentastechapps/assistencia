"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.quickRepliesRoutes = quickRepliesRoutes;
const prisma_1 = require("../../database/prisma");
async function quickRepliesRoutes(app) {
    const preHandler = [app.authenticate];
    // GET /quick-replies — Listar respostas rápidas do tenant
    app.get('/quick-replies', { preHandler }, async (request, reply) => {
        const replies = await prisma_1.prisma.quickReply.findMany({
            where: { tenantId: request.user.tenantId },
            orderBy: { shortcut: 'asc' }
        });
        return reply.send(replies);
    });
    // POST /quick-replies — Criar resposta rápida
    app.post('/quick-replies', { preHandler }, async (request, reply) => {
        const { shortcut, title, content } = request.body;
        // Garantir que o atalho comece com /
        const cleanShortcut = shortcut.startsWith('/') ? shortcut.toLowerCase() : `/${shortcut.toLowerCase()}`;
        const item = await prisma_1.prisma.quickReply.upsert({
            where: {
                tenantId_shortcut: {
                    tenantId: request.user.tenantId,
                    shortcut: cleanShortcut
                }
            },
            update: { title, content },
            create: {
                tenantId: request.user.tenantId,
                shortcut: cleanShortcut,
                title,
                content
            }
        });
        return reply.code(201).send(item);
    });
    // DELETE /quick-replies/:id — Deletar resposta rápida
    app.delete('/quick-replies/:id', { preHandler }, async (request, reply) => {
        const { id } = request.params;
        await prisma_1.prisma.quickReply.deleteMany({
            where: { id, tenantId: request.user.tenantId }
        });
        return reply.send({ success: true });
    });
}
//# sourceMappingURL=quick-replies.routes.js.map