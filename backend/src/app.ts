import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import jwt from '@fastify/jwt'
import multipart from '@fastify/multipart'
import rateLimit from '@fastify/rate-limit'
import { config } from './config'
import { redis } from './redis/client'

// Rotas
import { authRoutes } from './modules/auth/auth.routes'
import { whatsappRoutes } from './modules/whatsapp/whatsapp.routes'
import { webhookRoutes } from './modules/webhooks/webhook.routes'
import { knowledgeRoutes } from './modules/knowledge/knowledge.routes'
import { conversationRoutes } from './modules/conversations/conversation.routes'
import { quickRepliesRoutes } from './modules/conversations/quick-replies.routes'
import { pipelineRoutes } from './modules/conversations/pipeline.routes'
import { billingRoutes } from './modules/billing/billing.routes'
import { analyticsRoutes } from './modules/analytics/analytics.routes'
import { templatesRoutes } from './modules/templates/templates.routes'
import { repairsRoutes } from './modules/repairs/repairs.routes'
import { catalogRoutes } from './modules/catalog/catalog.routes'

export async function buildApp() {
  const app = Fastify({
    logger: config.env === 'development'
      ? { level: 'info', transport: { target: 'pino-pretty' } }
      : { level: 'error' },
    trustProxy: true
  })

  // ─── Plugins de segurança ───────────────────────────────────────────────────
  await app.register(helmet, {
    contentSecurityPolicy: false,
    crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
  })
  
  await app.register(cors, {
    origin: true,
    credentials: true
  })

  await app.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
    redis,
    skipOnError: true
  })

  // ─── Multipart (upload de arquivos) ────────────────────────────────────────
  await app.register(multipart, {
    limits: {
      fileSize: 50 * 1024 * 1024  // 50MB
    }
  })

  // ─── JWT ────────────────────────────────────────────────────────────────────
  await app.register(jwt, {
    secret: config.jwt.secret
  })

  // Decorar app com helper de autenticação
  app.decorate('authenticate', async (request: any, reply: any) => {
    try {
      await request.jwtVerify()
    } catch {
      return reply.code(401).send({ error: 'Token inválido ou expirado' })
    }
  })

  // ─── Health check ────────────────────────────────────────────────────────────
  app.get('/health', async () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  }))

  // ─── Rotas da API ────────────────────────────────────────────────────────────
  await app.register(async (api) => {
    await api.register(authRoutes)
    await api.register(whatsappRoutes)
    await api.register(webhookRoutes)
    await api.register(knowledgeRoutes)
    await api.register(conversationRoutes)
    await api.register(quickRepliesRoutes)
    await api.register(pipelineRoutes)
    await api.register(billingRoutes)
    await api.register(analyticsRoutes)
    await api.register(templatesRoutes)
    await api.register(repairsRoutes)
    await api.register(catalogRoutes)
  }, { prefix: '/api/v1' })

  // Também registrar webhook sem prefixo (Evolution API usa URL direta)
  await app.register(webhookRoutes)

  // ─── Error handler global ────────────────────────────────────────────────────
  app.setErrorHandler((error, request, reply) => {
    const statusCode = (error as any).statusCode || error.statusCode || 500
    const message = (error as any).message || 'Erro interno do servidor'

    if (statusCode >= 500) {
      app.log.error(error)
    }

    return reply.code(statusCode).send({
      error: message,
      statusCode
    })
  })

  return app
}
