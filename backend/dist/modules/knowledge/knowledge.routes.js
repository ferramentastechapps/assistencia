"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.knowledgeRoutes = knowledgeRoutes;
const prisma_1 = require("../../database/prisma");
const auth_1 = require("../../middleware/auth");
const rag_service_1 = require("../ai/rag.service");
const pdf_parse_1 = __importDefault(require("pdf-parse"));
const ragService = new rag_service_1.RagService();
async function knowledgeRoutes(app) {
    const preHandler = [app.authenticate];
    const adminHandler = [app.authenticate, auth_1.tenantAdminMiddleware];
    // GET /knowledge — Listar documentos
    app.get('/knowledge', { preHandler }, async (request, reply) => {
        const docs = await prisma_1.prisma.knowledgeDocument.findMany({
            where: { tenantId: request.user.tenantId },
            select: {
                id: true, title: true, type: true, status: true,
                chunkCount: true, filename: true, fileSize: true,
                createdAt: true, updatedAt: true
            },
            orderBy: { createdAt: 'desc' }
        });
        return reply.send(docs);
    });
    // POST /knowledge/text — Adicionar texto/FAQ
    app.post('/knowledge/text', { preHandler: adminHandler }, async (request, reply) => {
        const { title, content } = request.body;
        const doc = await prisma_1.prisma.knowledgeDocument.create({
            data: {
                tenantId: request.user.tenantId,
                title,
                type: 'TEXT',
                content,
                status: 'PROCESSING'
            }
        });
        // Indexar em background
        setImmediate(async () => {
            try {
                await ragService.indexDocument(doc.id, request.user.tenantId, content);
            }
            catch (e) {
                console.error('Erro ao indexar documento:', e);
                await prisma_1.prisma.knowledgeDocument.update({
                    where: { id: doc.id },
                    data: { status: 'ERROR', errorMsg: String(e) }
                });
            }
        });
        return reply.code(201).send(doc);
    });
    // POST /knowledge/url — Adicionar URL
    app.post('/knowledge/url', { preHandler: adminHandler }, async (request, reply) => {
        const { title, url } = request.body;
        // Buscar conteúdo da URL
        let content = '';
        try {
            const res = await fetch(url);
            content = await res.text();
            // Remover HTML tags básico
            content = content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
            content = content.slice(0, 50000); // Limitar tamanho
        }
        catch (e) {
            return reply.code(400).send({ error: 'Não foi possível acessar a URL' });
        }
        const doc = await prisma_1.prisma.knowledgeDocument.create({
            data: {
                tenantId: request.user.tenantId,
                title,
                type: 'URL',
                url,
                content,
                status: 'PROCESSING'
            }
        });
        setImmediate(async () => {
            try {
                await ragService.indexDocument(doc.id, request.user.tenantId, content);
            }
            catch (e) {
                await prisma_1.prisma.knowledgeDocument.update({
                    where: { id: doc.id },
                    data: { status: 'ERROR', errorMsg: String(e) }
                });
            }
        });
        return reply.code(201).send(doc);
    });
    // POST /knowledge/upload — Upload de PDF
    app.post('/knowledge/upload', { preHandler: adminHandler }, async (request, reply) => {
        const data = await request.file();
        if (!data)
            return reply.code(400).send({ error: 'Nenhum arquivo enviado' });
        if (!data.filename.endsWith('.pdf')) {
            return reply.code(400).send({ error: 'Apenas PDFs são suportados' });
        }
        const buffer = await data.toBuffer();
        const parsed = await (0, pdf_parse_1.default)(buffer);
        const content = parsed.text.trim();
        const doc = await prisma_1.prisma.knowledgeDocument.create({
            data: {
                tenantId: request.user.tenantId,
                title: data.filename.replace('.pdf', ''),
                type: 'PDF',
                filename: data.filename,
                fileSize: buffer.length,
                content,
                status: 'PROCESSING'
            }
        });
        setImmediate(async () => {
            try {
                await ragService.indexDocument(doc.id, request.user.tenantId, content);
            }
            catch (e) {
                await prisma_1.prisma.knowledgeDocument.update({
                    where: { id: doc.id },
                    data: { status: 'ERROR', errorMsg: String(e) }
                });
            }
        });
        return reply.code(201).send(doc);
    });
    // DELETE /knowledge/:id — Deletar documento
    app.delete('/knowledge/:id', { preHandler: adminHandler }, async (request, reply) => {
        const { id } = request.params;
        const doc = await prisma_1.prisma.knowledgeDocument.findFirst({
            where: { id, tenantId: request.user.tenantId }
        });
        if (!doc)
            return reply.code(404).send({ error: 'Documento não encontrado' });
        await ragService.deleteDocumentChunks(id);
        await prisma_1.prisma.knowledgeDocument.delete({ where: { id } });
        return reply.send({ success: true });
    });
}
//# sourceMappingURL=knowledge.routes.js.map