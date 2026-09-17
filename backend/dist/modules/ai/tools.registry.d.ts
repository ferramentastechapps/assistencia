export interface ToolDefinition {
    name: string;
    description: string;
    parameters: {
        type: 'object';
        properties: Record<string, {
            type: string;
            description: string;
        }>;
        required: string[];
    };
}
export declare const AVAILABLE_TOOLS: ToolDefinition[];
export declare class AgentToolsService {
    /**
     * Executa a ferramenta solicitada pelo agente
     */
    executeTool(toolName: string, args: any, context: {
        conversationId: string;
        tenantId: string;
        instanceName: string;
        remoteJid: string;
    }): Promise<string>;
    private handleSchedule;
    private handleRepairQuote;
    private handleRepairOrderStatus;
    private handlePhoneCatalogSearch;
    private handleTradeInEvaluation;
    private handleSendCatalog;
    private handleGeneratePix;
}
export declare const agentToolsService: AgentToolsService;
//# sourceMappingURL=tools.registry.d.ts.map