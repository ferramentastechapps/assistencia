import 'dotenv/config'

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3001'),
  
  database: {
    url: process.env.DATABASE_URL!
  },

  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    sessionTtl: 60 * 60 * 24 * 7  // 7 dias
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'zapia_dev_secret_change_in_prod',
    expiresIn: '7d'
  },

  evolution: {
    url: process.env.EVOLUTION_API_URL || 'http://localhost:8080',
    apiKey: process.env.EVOLUTION_API_KEY || ''
  },

  openrouter: {
    apiKey: process.env.OPENROUTER_API_KEY || '',
    baseUrl: 'https://openrouter.ai/api/v1',
    defaultModel: 'openai/gpt-4o-mini',
    embeddingModel: 'openai/text-embedding-3-small'
  },

  app: {
    url: process.env.APP_URL || 'http://localhost:3000',
    backendUrl: process.env.BACKEND_URL || 'http://localhost:3001',
    googleClientId: process.env.GOOGLE_CLIENT_ID || '836980497147-lm4bk8crk2vl5ud1rpa7e1a04kk56t2b.apps.googleusercontent.com'
  },

  plans: {
    FREE: {
      maxMessages: 500,
      maxInstances: 1,
      maxKnowledgeDocs: 5
    },
    PRO: {
      maxMessages: 10000,
      maxInstances: 5,
      maxKnowledgeDocs: 50
    },
    ENTERPRISE: {
      maxMessages: 999999,
      maxInstances: 99,
      maxKnowledgeDocs: 999
    }
  }
}
