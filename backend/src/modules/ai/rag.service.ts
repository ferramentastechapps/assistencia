import { prisma } from '../../database/prisma'
import { createEmbeddings } from './openrouter.client'

export interface RetrievedChunk {
  content: string
  score: number
  documentTitle: string
}

export class RagService {
  private embeddings = createEmbeddings()

  // ─── Indexar documento ────────────────────────────────────────────────────
  async indexDocument(documentId: string, tenantId: string, content: string): Promise<void> {
    const chunks = this.chunkText(content)
    
    for (const chunk of chunks) {
      try {
        const embedding = await this.embeddings.embedQuery(chunk)
        const embeddingStr = `[${embedding.join(',')}]`

        await prisma.$executeRaw`
          INSERT INTO knowledge_chunks ("id", "tenantId", "documentId", "content", "embedding", "createdAt")
          VALUES (
            gen_random_uuid()::text,
            ${tenantId},
            ${documentId},
            ${chunk},
            ${embeddingStr}::vector,
            NOW()
          )
        `
      } catch (error) {
        console.error('Erro ao indexar chunk:', error)
      }
    }

    await prisma.knowledgeDocument.update({
      where: { id: documentId },
      data: { status: 'READY', chunkCount: chunks.length }
    })
  }

  // ─── Buscar chunks relevantes ─────────────────────────────────────────────
  async search(query: string, tenantId: string, topK = 5): Promise<RetrievedChunk[]> {
    const queryEmbedding = await this.embeddings.embedQuery(query)
    const embeddingStr = `[${queryEmbedding.join(',')}]`

    const results = await prisma.$queryRaw<Array<{
      content: string
      score: number
      title: string
    }>>`
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
    `

    return results
      .filter(r => r.score > 0.5)  // threshold mínimo de relevância
      .map(r => ({
        content: r.content,
        score: r.score,
        documentTitle: r.title
      }))
  }

  // ─── Chunking de texto ────────────────────────────────────────────────────
  private chunkText(text: string, chunkSize = 500, overlap = 50): string[] {
    const sentences = text.split(/(?<=[.!?])\s+/)
    const chunks: string[] = []
    let current = ''

    for (const sentence of sentences) {
      if ((current + sentence).length > chunkSize) {
        if (current.trim()) chunks.push(current.trim())
        // Overlap: manter parte do chunk anterior
        const words = current.split(' ')
        current = words.slice(-overlap / 5).join(' ') + ' ' + sentence
      } else {
        current += (current ? ' ' : '') + sentence
      }
    }

    if (current.trim()) chunks.push(current.trim())
    return chunks.filter(c => c.length > 20)
  }

  // ─── Deletar chunks de um documento ──────────────────────────────────────
  async deleteDocumentChunks(documentId: string): Promise<void> {
    await prisma.$executeRaw`
      DELETE FROM knowledge_chunks WHERE "documentId" = ${documentId}
    `
  }
}
