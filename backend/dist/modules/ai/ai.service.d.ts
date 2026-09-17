export interface AIResponse {
    text: string;
    shouldEscalate: boolean;
    usedKnowledge: boolean;
    relevanceScore: number;
}
export declare class AIService {
    private ragService;
    processMessage(conversationId: string, tenantId: string, userMessage: string, instanceName?: string, remoteJid?: string): Promise<AIResponse>;
    private buildSystemPrompt;
    private isInBusinessHours;
}
//# sourceMappingURL=ai.service.d.ts.map