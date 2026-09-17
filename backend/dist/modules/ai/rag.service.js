"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RagService = void 0;
const prisma_1 = require("../../database/prisma");
const openrouter_client_1 = require("./openrouter.client");
class RagService {
    embeddings = (0, openrouter_client_1.createEmbeddings)();
    // ─── Indexar documento ────────────────────────────────────────────────────
    async indexDocument(documentId, tenantId, content) {
        const chunks = this.chunkText(content);
        for (const chunk of chunks) {
            try {
                const embedding = await this.embeddings.embedQuery(chunk);
                const embeddingStr = `[${embedding.join(',')}]`;
                await prisma_1.prisma.$executeRaw `
          INSERT INTO knowledge_chunks ("id", "tenantId", "documentId", "content", "embedding", "createdAt")
          VALUES (
            gen_random_uuid()::text,
            ${tenantId},
            ${documentId},
            ${chunk},
            ${embeddingStr}::vector,
            NOW()
          )
        `;
            }
            catch (error) {
                console.error('Erro ao indexar chunk:', error);
            }
        }
        await prisma_1.prisma.knowledgeDocument.update({
            where: { id: documentId },
            data: { status: 'READY', chunkCount: chunks.length }
        });
    }
    // ─── Buscar chunks relevantes ─────────────────────────────────────────────
    async search(query, tenantId, topK = 5) {
        const queryEmbedding = await this.embeddings.embedQuery(query);
        const embeddingStr = `[${queryEmbedding.join(',')}]`;
        const results = await prisma_1.prisma.$queryRaw `
      SELECT 
        kc.content,
        kd.title,
        1 - (kc.embedding <=> ${embeddingStr}::vector) as score
      FROM knowledge_chunks kc
      JOIN knowledge_documents kd ON kd.id = kc."documentId"
      WHERE kc."tenantId" = ${tenantId}
        AND kd.status = 'READY'
      ORDER BY kc.embedding <=> ${embeddingStr}::vector
      LIMIT ${topK}
    `;
        return results
            .filter(r => r.score > 0.5) // threshold mínimo de relevância
            .map(r => ({
            content: r.content,
            score: r.score,
            documentTitle: r.title
        }));
    }
    // ─── Chunking de texto ────────────────────────────────────────────────────
    chunkText(text, chunkSize = 500, overlap = 50) {
        const sentences = text.split(/(?<=[.!?])\s+/);
        const chunks = [];
        let current = '';
        for (const sentence of sentences) {
            if ((current + sentence).length > chunkSize) {
                if (current.trim())
                    chunks.push(current.trim());
                // Overlap: manter parte do chunk anterior
                const words = current.split(' ');
                current = words.slice(-overlap / 5).join(' ') + ' ' + sentence;
            }
            else {
                current += (current ? ' ' : '') + sentence;
            }
        }
        if (current.trim())
            chunks.push(current.trim());
        return chunks.filter(c => c.length > 20);
    }
    // ─── Deletar chunks de um documento ──────────────────────────────────────
    async deleteDocumentChunks(documentId) {
        await prisma_1.prisma.$executeRaw `
      DELETE FROM knowledge_chunks WHERE "documentId" = ${documentId}
    `;
    }
}
exports.RagService = RagService;
//# sourceMappingURL=rag.service.js.map