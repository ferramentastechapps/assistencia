export interface RetrievedChunk {
    content: string;
    score: number;
    documentTitle: string;
}
export declare class RagService {
    private embeddings;
    indexDocument(documentId: string, tenantId: string, content: string): Promise<void>;
    search(query: string, tenantId: string, topK?: number): Promise<RetrievedChunk[]>;
    private chunkText;
    deleteDocumentChunks(documentId: string): Promise<void>;
}
//# sourceMappingURL=rag.service.d.ts.map