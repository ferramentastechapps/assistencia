import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai'
import { config } from '../../config'

// ─── Criar instância do LLM via OpenRouter ────────────────────────────────────

export function createLLM(model?: string, tenantApiKey?: string) {
  return new ChatOpenAI({
    modelName: model || config.openrouter.defaultModel,
    openAIApiKey: tenantApiKey || config.openrouter.apiKey,
    configuration: {
      baseURL: config.openrouter.baseUrl,
      defaultHeaders: {
        'HTTP-Referer': config.app.url,
        'X-Title': 'ZapIA'
      }
    },
    temperature: 0.3,
    maxTokens: 600
  })
}

// ─── Criar instância de embeddings ────────────────────────────────────────────

export function createEmbeddings() {
  return new OpenAIEmbeddings({
    modelName: 'text-embedding-3-small',
    openAIApiKey: config.openrouter.apiKey,
    configuration: {
      baseURL: config.openrouter.baseUrl,
      defaultHeaders: {
        'HTTP-Referer': config.app.url,
        'X-Title': 'ZapIA'
      }
    }
  })
}
