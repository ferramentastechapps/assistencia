import Redis from 'ioredis';
export declare const redis: Redis;
export type ConversationState = 'AI_ACTIVE' | 'ESCALATING' | 'HUMAN_ACTIVE' | 'RESOLVED';
export declare const sessionKeys: {
    state: (conversationId: string) => string;
    history: (conversationId: string) => string;
    retries: (conversationId: string) => string;
    typing: (conversationId: string) => string;
};
export declare function getConversationState(conversationId: string): Promise<ConversationState>;
export declare function setConversationState(conversationId: string, state: ConversationState, ttlSeconds?: number): Promise<void>;
export declare function getConversationHistory(conversationId: string): Promise<Array<{
    role: string;
    content: string;
}>>;
export declare function appendToHistory(conversationId: string, role: 'user' | 'assistant', content: string, maxMessages?: number): Promise<void>;
export declare function getAiRetries(conversationId: string): Promise<number>;
export declare function incrementAiRetries(conversationId: string): Promise<number>;
export declare function resetAiRetries(conversationId: string): Promise<void>;
export declare function pushToMessageBuffer(conversationId: string, text: string): Promise<number>;
export declare function popMessageBuffer(conversationId: string): Promise<string[]>;
export declare function setDebounceTimestamp(conversationId: string, timestamp: number): Promise<void>;
export declare function getDebounceTimestamp(conversationId: string): Promise<number>;
//# sourceMappingURL=client.d.ts.map