import { FastifyInstance } from 'fastify'
import { prisma } from '../../database/prisma'
import { authMiddleware, tenantAdminMiddleware } from '../../middleware/auth'
import { setConversationState } from '../../redis/client'
import { WhatsAppService } from '../whatsapp/whatsapp.service'
import { io } from '../../server'

const whatsappService = new WhatsAppService()

export async function conversationRoutes(app: FastifyInstance) {
  const preHandler = [app.authenticate]
  const adminHandler = [app.authenticate, tenantAdminMiddleware]

  // GET /conversations — Listar conversas
  app.get('/conversations', { preHandler }, async (request, reply) => {
    const { status, search, stageId, tagId, page = 1, limit = 50 } = request.query as {
      status?: string; search?: string; stageId?: string; tagId?: string; page?: number; limit?: number
    }

    const where: any = { tenantId: request.user.tenantId }
    if (status) where.status = status
    if (stageId) where.stageId = stageId
    if (tagId) where.tags = { some: { tagId } }
    if (search) where.OR = [
      { contactPhone: { contains: search } },
      { contactName: { contains: search, mode: 'insensitive' } }
    ]

    const [conversations, total] = await Promise.all([
      prisma.conversation.findMany({
        where,
        include: {
          messages: { orderBy: { createdAt: 'desc' }, take: 1 },
          instance: { select: { id: true, phoneNumber: true, instanceName: true } },
          tags: { include: { tag: true } },
          stage: true
        },
        orderBy: { updatedAt: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit)
      }),
      prisma.conversation.count({ where })
    ])

    return reply.send({ conversations, total, page: Number(page), limit: Number(limit) })
  })

  // GET /conversations/:id — Detalhes da conversa
  app.get('/conversations/:id', { preHandler }, async (request, reply) => {
    const { id } = request.params as { id: string }

    const conversation = await prisma.conversation.findFirst({
      where: { id, tenantId: request.user.tenantId },
      include: {
        messages: { orderBy: { createdAt: 'asc' } },
        instance: { select: { id: true, phoneNumber: true, instanceName: true } },
        tags: { include: { tag: true } },
        stage: true
      }
    })

    if (!conversation) return reply.code(404).send({ error: 'Conversa não encontrada' })
    return reply.send(conversation)
  })

  // POST /conversations/:id/assign — Assumir conversa (atendente humano)
  app.post('/conversations/:id/assign', { preHandler }, async (request, reply) => {
    const { id } = request.params as { id: string }

    await prisma.conversation.update({
      where: { id },
      data: { status: 'HUMAN_ACTIVE', assignedTo: request.user.id }
    })
    await setConversationState(id, 'HUMAN_ACTIVE')

    return reply.send({ success: true })
  })

  // POST /conversations/:id/resolve — Resolver conversa
  app.post('/conversations/:id/resolve', { preHandler }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const conv = await prisma.conversation.findFirst({ where: { id, tenantId: request.user.tenantId }, include: { instance: true } })
    if (!conv) return reply.code(404).send({ error: 'Conversa não encontrada' })

    // Enviar pesquisa CSAT
    const aiConfig = await prisma.aIConfig.findUnique({ where: { tenantId: conv.tenantId } })
    if (aiConfig?.csatEnabled) {
      await whatsappService.sendMessage(
        conv.instance.instanceName,
        `${conv.contactPhone}@s.whatsapp.net`,
        aiConfig.csatMessage
      )
    }

    await prisma.conversation.update({
      where: { id },
      data: { status: 'RESOLVED', resolvedAt: new Date() }
    })
    await setConversationState(id, 'RESOLVED')

    io?.to(`tenant:${conv.tenantId}`).emit('conversation:resolved', { conversationId: id })

    return reply.send({ success: true })
  })

  // POST /conversations/:id/return-to-ai — Devolver para IA
  app.post('/conversations/:id/return-to-ai', { preHandler }, async (request, reply) => {
    const { id } = request.params as { id: string }

    await prisma.conversation.update({
      where: { id },
      data: { status: 'AI_ACTIVE', assignedTo: null }
    })
    await setConversationState(id, 'AI_ACTIVE')

    return reply.send({ success: true })
  })

  // POST /conversations/:id/send — Enviar mensagem ou Nota Interna
  app.post('/conversations/:id/send', { preHandler }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const { message, isInternalNote } = request.body as { message: string; isInternalNote?: boolean }

    const conv = await prisma.conversation.findFirst({
      where: { id, tenantId: request.user.tenantId },
      include: { instance: true }
    })
    if (!conv) return reply.code(404).send({ error: 'Conversa não encontrada' })

    // Se for nota interna privada da equipe
    if (isInternalNote) {
      const noteMsg = await prisma.message.create({
        data: {
          conversationId: id,
          role: 'INTERNAL_NOTE',
          content: message,
          isFromWhatsApp: false
        }
      })

      io?.to(`tenant:${conv.tenantId}`).emit('message:sent', { conversationId: id, message: noteMsg })
      return reply.send(noteMsg)
    }

    // Mensagem de atendente enviada para o cliente no WhatsApp
    const msg = await prisma.message.create({
      data: {
        conversationId: id,
        role: 'ASSISTANT',
        content: message,
        isFromWhatsApp: false
      }
    })

    // Enviar via WhatsApp
    await whatsappService.sendMessage(
      conv.instance.instanceName,
      `${conv.contactPhone}@s.whatsapp.net`,
      message
    )

    io?.to(`tenant:${conv.tenantId}`).emit('message:sent', { conversationId: id, message: msg })

    return reply.send(msg)
  })

  // ─── Tags da Conversa ───────────────────────────────────────────────────────

  // POST /conversations/:id/tags — Adicionar tag à conversa
  app.post('/conversations/:id/tags', { preHandler }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const { tagId } = request.body as { tagId: string }

    const convTag = await prisma.conversationTag.upsert({
      where: { conversationId_tagId: { conversationId: id, tagId } },
      update: {},
      create: { conversationId: id, tagId },
      include: { tag: true }
    })

    io?.to(`tenant:${request.user.tenantId}`).emit('conversation:updated', { conversationId: id })
    return reply.send(convTag)
  })

  // DELETE /conversations/:id/tags/:tagId — Remover tag da conversa
  app.delete('/conversations/:id/tags/:tagId', { preHandler }, async (request, reply) => {
    const { id, tagId } = request.params as { id: string; tagId: string }

    await prisma.conversationTag.deleteMany({
      where: { conversationId: id, tagId }
    })

    io?.to(`tenant:${request.user.tenantId}`).emit('conversation:updated', { conversationId: id })
    return reply.send({ success: true })
  })

  // ─── Estágio no Funil CRM (Pipeline) ───────────────────────────────────────

  // PATCH /conversations/:id/stage — Alterar estágio do lead no funil
  app.patch('/conversations/:id/stage', { preHandler }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const { stageId, estimatedValue } = request.body as { stageId?: string; estimatedValue?: number }

    const updated = await prisma.conversation.update({
      where: { id },
      data: {
        ...(stageId !== undefined && { stageId }),
        ...(estimatedValue !== undefined && { estimatedValue })
      },
      include: { stage: true, tags: { include: { tag: true } } }
    })

    io?.to(`tenant:${request.user.tenantId}`).emit('conversation:updated', { conversationId: id, conversation: updated })
    return reply.send(updated)
  })

  // ─── Gestão de Tags do Tenant ──────────────────────────────────────────────

  // GET /tags — Listar tags
  app.get('/tags', { preHandler }, async (request, reply) => {
    const tags = await prisma.tag.findMany({
      where: { tenantId: request.user.tenantId },
      orderBy: { name: 'asc' }
    })
    return reply.send(tags)
  })

  // POST /tags — Criar nova tag
  app.post('/tags', { preHandler }, async (request, reply) => {
    const { name, color } = request.body as { name: string; color?: string }
    const tag = await prisma.tag.upsert({
      where: { tenantId_name: { tenantId: request.user.tenantId, name } },
      update: { color: color || '#10B981' },
      create: { tenantId: request.user.tenantId, name, color: color || '#10B981' }
    })
    return reply.code(201).send(tag)
  })

  // DELETE /tags/:tagId — Deletar tag
  app.delete('/tags/:tagId', { preHandler }, async (request, reply) => {
    const { tagId } = request.params as { tagId: string }
    await prisma.tag.deleteMany({
      where: { id: tagId, tenantId: request.user.tenantId }
    })
    return reply.send({ success: true })
  })
}
