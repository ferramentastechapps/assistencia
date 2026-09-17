import { FastifyInstance } from 'fastify'
import { authMiddleware, tenantAdminMiddleware, checkTenantActive } from '../../middleware/auth'
import { WhatsAppService } from './whatsapp.service'
import { z } from 'zod'

export async function whatsappRoutes(app: FastifyInstance) {
  const service = new WhatsAppService()
  const preHandler = [app.authenticate, checkTenantActive]

  // POST /whatsapp/instances — Criar instância
  app.post('/whatsapp/instances', {
    preHandler: [...preHandler, tenantAdminMiddleware]
  }, async (request, reply) => {
    const { name } = request.body as { name?: string }
    const instance = await service.createInstance(request.user.tenantId, name || 'Principal')
    return reply.code(201).send(instance)
  })

  // GET /whatsapp/instances — Listar instâncias
  app.get('/whatsapp/instances', { preHandler }, async (request, reply) => {
    const instances = await service.listInstances(request.user.tenantId)
    return reply.send(instances)
  })

  // GET /whatsapp/instances/:id/qr — Obter QR Code
  app.get('/whatsapp/instances/:id/qr', { preHandler }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const qr = await service.getQrCode(id, request.user.tenantId)
    return reply.send(qr)
  })

  // DELETE /whatsapp/instances/:id/disconnect — Desconectar
  app.delete('/whatsapp/instances/:id/disconnect', {
    preHandler: [...preHandler, tenantAdminMiddleware]
  }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const result = await service.disconnect(id, request.user.tenantId)
    return reply.send(result)
  })

  // DELETE /whatsapp/instances/:id — Deletar instância
  app.delete('/whatsapp/instances/:id', {
    preHandler: [...preHandler, tenantAdminMiddleware]
  }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const result = await service.deleteInstance(id, request.user.tenantId)
    return reply.send(result)
  })
}
