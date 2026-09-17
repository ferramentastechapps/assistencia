export interface BusinessTemplate {
    id: string;
    name: string;
    shortDescription: string;
    icon: string;
    badge?: string;
    isPrimary?: boolean;
    color: string;
    gradient: string;
    persona: {
        name: string;
        tone: string;
        language: string;
    };
    systemPrompt: string;
    pipelineStages: Array<{
        name: string;
        color: string;
        order: number;
    }>;
    quickReplies: Array<{
        shortcut: string;
        title: string;
        content: string;
    }>;
    sampleFaq: {
        title: string;
        content: string;
    };
}
export declare const BUSINESS_TEMPLATES: BusinessTemplate[];
//# sourceMappingURL=templates.data.d.ts.map