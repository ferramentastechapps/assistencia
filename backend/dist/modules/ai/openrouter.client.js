"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLLM = createLLM;
exports.createEmbeddings = createEmbeddings;
const openai_1 = require("@langchain/openai");
const config_1 = require("../../config");
// ─── Criar instância do LLM via OpenRouter ────────────────────────────────────
function createLLM(model, tenantApiKey) {
    return new openai_1.ChatOpenAI({
        modelName: model || config_1.config.openrouter.defaultModel,
        openAIApiKey: tenantApiKey || config_1.config.openrouter.apiKey,
        configuration: {
            baseURL: config_1.config.openrouter.baseUrl,
            defaultHeaders: {
                'HTTP-Referer': config_1.config.app.url,
                'X-Title': 'ZapIA'
            }
        },
        temperature: 0.3,
        maxTokens: 600
    });
}
// ─── Criar instância de embeddings ────────────────────────────────────────────
function createEmbeddings() {
    return new openai_1.OpenAIEmbeddings({
        modelName: 'text-embedding-3-small',
        openAIApiKey: config_1.config.openrouter.apiKey,
        configuration: {
            baseURL: config_1.config.openrouter.baseUrl,
            defaultHeaders: {
                'HTTP-Referer': config_1.config.app.url,
                'X-Title': 'ZapIA'
            }
        }
    });
}
//# sourceMappingURL=openrouter.client.js.map