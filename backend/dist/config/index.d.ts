import 'dotenv/config';
export declare const config: {
    env: string;
    port: number;
    database: {
        url: string;
    };
    redis: {
        url: string;
        sessionTtl: number;
    };
    jwt: {
        secret: string;
        expiresIn: string;
    };
    evolution: {
        url: string;
        apiKey: string;
    };
    openrouter: {
        apiKey: string;
        baseUrl: string;
        defaultModel: string;
        embeddingModel: string;
    };
    app: {
        url: string;
        backendUrl: string;
        googleClientId: string;
    };
    plans: {
        FREE: {
            maxMessages: number;
            maxInstances: number;
            maxKnowledgeDocs: number;
        };
        PRO: {
            maxMessages: number;
            maxInstances: number;
            maxKnowledgeDocs: number;
        };
        ENTERPRISE: {
            maxMessages: number;
            maxInstances: number;
            maxKnowledgeDocs: number;
        };
    };
};
//# sourceMappingURL=index.d.ts.map