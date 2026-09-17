"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.templatesRoutes = templatesRoutes;
const prisma_1 = require("../../database/prisma");
const templates_data_1 = require("./templates.data");
const rag_service_1 = require("../ai/rag.service");
const ragService = new rag_service_1.RagService();
async function templatesRoutes(app) {
    // GET /templates - Listar todos os modelos de negócio
    app.get('/templates', async (request, reply) => {
        return reply.send({
            total: templates_data_1.BUSINESS_TEMPLATES.length,
            templates: templates_data_1.BUSINESS_TEMPLATES
        });
    });
    // GET /templates/:id - Obter detalhes de um modelo específico
    app.get('/templates/:id', async (request, reply) => {
        const { id } = request.params;
        const template = templates_data_1.BUSINESS_TEMPLATES.find((t) => t.id === id);
        if (!template) {
            return reply.code(404).send({ error: 'Modelo de negócio não encontrado' });
        }
        return reply.send(template);
    });
    // POST /templates/apply - Aplicar um modelo no tenant autenticado
    app.post('/templates/apply', { preHandler: [app.authenticate] }, async (request, reply) => {
        const { templateId } = request.body;
        const tenantId = request.user.tenantId;
        if (!templateId) {
            return reply.code(400).send({ error: 'templateId é obrigatório' });
        }
        const template = templates_data_1.BUSINESS_TEMPLATES.find((t) => t.id === templateId);
        if (!template) {
            return reply.code(404).send({ error: 'Modelo de negócio não encontrado' });
        }
        try {
            // 1. Atualizar ou Criar AI Config
            await prisma_1.prisma.aIConfig.upsert({
                where: { tenantId },
                create: {
                    tenantId,
                    personaName: template.persona.name,
                    personaTone: template.persona.tone,
                    language: template.persona.language,
                    systemPrompt: template.systemPrompt,
                },
                update: {
                    personaName: template.persona.name,
                    personaTone: template.persona.tone,
                    language: template.persona.language,
                    systemPrompt: template.systemPrompt,
                }
            });
            // 2. Reconfigurar Funil de Vendas (Kanban Stages)
            // Remove etapas antigas (conversas ficam com stageId null via SetNull)
            await prisma_1.prisma.pipelineStage.deleteMany({
                where: { tenantId }
            });
            if (template.pipelineStages && template.pipelineStages.length > 0) {
                await prisma_1.prisma.pipelineStage.createMany({
                    data: template.pipelineStages.map((stage, idx) => ({
                        tenantId,
                        name: stage.name,
                        color: stage.color,
                        order: stage.order ?? idx + 1
                    }))
                });
            }
            // 3. Cadastrar Respostas Rápidas (/atalhos)
            if (template.quickReplies && template.quickReplies.length > 0) {
                for (const qr of template.quickReplies) {
                    await prisma_1.prisma.quickReply.upsert({
                        where: {
                            tenantId_shortcut: {
                                tenantId,
                                shortcut: qr.shortcut
                            }
                        },
                        create: {
                            tenantId,
                            shortcut: qr.shortcut,
                            title: qr.title,
                            content: qr.content
                        },
                        update: {
                            title: qr.title,
                            content: qr.content
                        }
                    });
                }
            }
            // 4. Injetar FAQ na Base de Conhecimento e indexar no RAG
            if (template.sampleFaq) {
                const existingDoc = await prisma_1.prisma.knowledgeDocument.findFirst({
                    where: {
                        tenantId,
                        title: template.sampleFaq.title
                    }
                });
                let docId;
                if (existingDoc) {
                    const updated = await prisma_1.prisma.knowledgeDocument.update({
                        where: { id: existingDoc.id },
                        data: {
                            content: template.sampleFaq.content,
                            status: 'PROCESSING'
                        }
                    });
                    docId = updated.id;
                }
                else {
                    const created = await prisma_1.prisma.knowledgeDocument.create({
                        data: {
                            tenantId,
                            title: template.sampleFaq.title,
                            type: 'TEXT',
                            content: template.sampleFaq.content,
                            status: 'PROCESSING'
                        }
                    });
                    docId = created.id;
                }
                // Indexar vetor no RAG em background
                setImmediate(async () => {
                    try {
                        await ragService.indexDocument(docId, tenantId, template.sampleFaq.content);
                    }
                    catch (err) {
                        console.error('Erro ao indexar FAQ do template:', err);
                        await prisma_1.prisma.knowledgeDocument.update({
                            where: { id: docId },
                            data: { status: 'ERROR', errorMsg: String(err) }
                        }).catch(() => { });
                    }
                });
            }
            return reply.send({
                success: true,
                message: `O modelo "${template.name}" foi aplicado com sucesso em sua conta!`,
                template: {
                    id: template.id,
                    name: template.name,
                    icon: template.icon,
                    persona: template.persona,
                    stagesCount: template.pipelineStages.length,
                    quickRepliesCount: template.quickReplies.length
                }
            });
        }
        catch (error) {
            request.log.error(error);
            return reply.code(500).send({
                error: 'Falha ao aplicar modelo de negócio',
                details: error.message
            });
        }
    });
}
//# sourceMappingURL=templates.routes.js.map