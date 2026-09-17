import { FastifyInstance } from 'fastify'
import { prisma } from '../../database/prisma'

export async function quickRepliesRoutes(app: FastifyInstance) {
  const preHandler = [app.authenticate]

  // GET /quick-replies — Listar respostas rápidas do tenant
  app.get('/quick-replies', { preHandler }, async (request, reply) => {
    const replies = await prisma.quickReply.findMany({
      where: { tenantId: request.user.tenantId },
      orderBy: { shortcut: 'asc' }
    })
    return reply.send(replies)
  })

  // POST /quick-replies — Criar resposta rápida
  app.post('/quick-replies', { preHandler }, async (request, reply) => {
    const { shortcut, title, content } = request.body as {
      shortcut: string
      title: string
      content: string
    }

    // Garantir que o atalho comece com /
    const cleanShortcut = shortcut.startsWith('/') ? shortcut.toLowerCase() : `/${shortcut.toLowerCase()}`

    const item = await prisma.quickReply.upsert({
      where: {
        tenantId_shortcut: {
          tenantId: request.user.tenantId,
          shortcut: cleanShortcut
        }
      },
      update: { title, content },
      create: {
        tenantId: request.user.tenantId,
        shortcut: cleanShortcut,
        title,
        content
      }
    })

    return reply.code(201).send(item)
  })

  // DELETE /quick-replies/:id — Deletar resposta rápida
  app.delete('/quick-replies/:id', { preHandler }, async (request, reply) => {
    const { id } = request.params as { id: string }
    await prisma.quickReply.deleteMany({
      where: { id, tenantId: request.user.tenantId }
    })
    return reply.send({ success: true })
  })
}
