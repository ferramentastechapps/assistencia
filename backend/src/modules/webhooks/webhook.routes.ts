import { FastifyInstance } from 'fastify'
import { handleEvolutionWebhook } from './webhook.handler'

export async function webhookRoutes(app: FastifyInstance) {
  // POST /webhooks/evolution — Recebe eventos da Evolution API
  app.post('/webhooks/evolution', async (request, reply) => {
    const body = request.body as { event: string; data: any; instance?: string }
    
    // Processar de forma assíncrona para não bloquear o webhook
    setImmediate(() => handleEvolutionWebhook(app, body.event, body.data))
    
    // Responder imediatamente com 200 (importante para não re-enviar)
    return reply.code(200).send({ received: true })
  })
}
