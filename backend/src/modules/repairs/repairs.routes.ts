import { FastifyInstance } from 'fastify'
import { prisma } from '../../database/prisma'
import { evolutionClient } from '../whatsapp/evolution.client'

// Helper: gerar número sequencial de OS
async function generateOrderNumber(tenantId: string): Promise<string> {
  const lastOrder = await prisma.repairOrder.findFirst({
    where: { tenantId },
    orderBy: { createdAt: 'desc' },
    select: { orderNumber: true }
  })

  if (!lastOrder) return 'OS-1001'

  const lastNum = parseInt(lastOrder.orderNumber.replace('OS-', ''), 10)
  return `OS-${lastNum + 1}`
}

export async function repairsRoutes(app: FastifyInstance) {
  // ─── Todas as rotas exigem autenticação ─────────────────────────────────────
  const opts = { preHandler: [app.authenticate] }

  // ─── GET /repairs — Listar Ordens de Serviço ──────────────────────────────
  app.get('/repairs', opts, async (request, reply) => {
    const tenantId = request.user.tenantId
    const { status, search, page = '1', limit = '20' } = request.query as Record<string, string>

    const take = Math.min(Number(limit), 100)
    const skip = (Number(page) - 1) * take

    const where: any = { tenantId }
    if (status) where.status = status
    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { customerName: { contains: search, mode: 'insensitive' } },
        { customerPhone: { contains: search } },
        { deviceModel: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [total, orders] = await Promise.all([
      prisma.repairOrder.count({ where }),
      prisma.repairOrder.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take,
        skip,
      })
    ])

    return reply.send({ total, page: Number(page), orders })
  })

  // ─── GET /repairs/stats — Estatísticas do dashboard ──────────────────────
  app.get('/repairs/stats', opts, async (request, reply) => {
    const tenantId = request.user.tenantId

    const [total, emBancada, prontos, entregues, totalRevenue] = await Promise.all([
      prisma.repairOrder.count({ where: { tenantId } }),
      prisma.repairOrder.count({ where: { tenantId, status: { in: ['EM_ANALISE', 'EM_CONSERTO', 'AGUARDANDO_PECA'] } } }),
      prisma.repairOrder.count({ where: { tenantId, status: 'PRONTO' } }),
      prisma.repairOrder.count({ where: { tenantId, status: 'ENTREGUE' } }),
      prisma.repairOrder.aggregate({
        where: { tenantId, paidAt: { not: null } },
        _sum: { totalAmount: true }
      })
    ])

    return reply.send({
      total,
      emBancada,
      prontos,
      entregues,
      totalRevenue: totalRevenue._sum.totalAmount ?? 0
    })
  })

  // ─── GET /repairs/track/:query — Rastreamento de OS para o cliente ────────
  app.get('/repairs/track/:query', async (request, reply) => {
    const { query } = request.params as { query: string }
    const { tenantId } = request.query as { tenantId: string }

    if (!tenantId) return reply.code(400).send({ error: 'tenantId obrigatório' })

    const order = await prisma.repairOrder.findFirst({
      where: {
        tenantId,
        OR: [
          { orderNumber: { contains: query, mode: 'insensitive' } },
          { customerPhone: { contains: query } }
        ]
      },
      orderBy: { createdAt: 'desc' }
    })

    if (!order) return reply.code(404).send({ error: 'Ordem de serviço não encontrada' })

    return reply.send({
      orderNumber: order.orderNumber,
      status: order.status,
      deviceBrand: order.deviceBrand,
      deviceModel: order.deviceModel,
      estimatedDelivery: order.estimatedDelivery,
      totalAmount: order.totalAmount,
      createdAt: order.createdAt
    })
  })

  // ─── GET /repairs/quotes — Tabela de orçamentos de referência ────────────
  app.get('/repairs/quotes', opts, async (request, reply) => {
    const tenantId = request.user.tenantId
    const { brand, service } = request.query as { brand?: string; service?: string }

    const where: any = { tenantId, isActive: true }
    if (brand) where.brand = { contains: brand, mode: 'insensitive' }
    if (service) where.serviceType = { contains: service, mode: 'insensitive' }

    const quotes = await prisma.repairQuoteCatalog.findMany({
      where,
      orderBy: [{ brand: 'asc' }, { serviceType: 'asc' }]
    })

    return reply.send({ quotes })
  })

  // ─── GET /repairs/:id — Detalhes de uma OS ────────────────────────────────
  app.get('/repairs/:id', opts, async (request, reply) => {
    const { id } = request.params as { id: string }
    const tenantId = request.user.tenantId

    const order = await prisma.repairOrder.findFirst({
      where: { id, tenantId }
    })

    if (!order) return reply.code(404).send({ error: 'Ordem de serviço não encontrada' })

    return reply.send(order)
  })

  // ─── POST /repairs — Criar nova OS ────────────────────────────────────────
  app.post('/repairs', opts, async (request, reply) => {
    const tenantId = request.user.tenantId
    const body = request.body as {
      customerName: string
      customerPhone: string
      deviceBrand: string
      deviceModel: string
      deviceColor?: string
      deviceImei?: string
      devicePassword?: string
      reportedDefect: string
      partsCost?: number
      laborCost?: number
      estimatedDelivery?: string
    }

    const orderNumber = await generateOrderNumber(tenantId)
    const totalAmount = (body.partsCost ?? 0) + (body.laborCost ?? 0)

    const order = await prisma.repairOrder.create({
      data: {
        tenantId,
        orderNumber,
        customerName: body.customerName,
        customerPhone: body.customerPhone,
        deviceBrand: body.deviceBrand,
        deviceModel: body.deviceModel,
        deviceColor: body.deviceColor,
        deviceImei: body.deviceImei,
        devicePassword: body.devicePassword,
        reportedDefect: body.reportedDefect,
        partsCost: body.partsCost,
        laborCost: body.laborCost,
        totalAmount: totalAmount > 0 ? totalAmount : undefined,
        estimatedDelivery: body.estimatedDelivery ? new Date(body.estimatedDelivery) : undefined,
      }
    })

    return reply.code(201).send(order)
  })

  // ─── PATCH /repairs/:id — Atualizar OS ────────────────────────────────────
  app.patch('/repairs/:id', opts, async (request, reply) => {
    const { id } = request.params as { id: string }
    const tenantId = request.user.tenantId
    const body = request.body as Record<string, any>

    const existing = await prisma.repairOrder.findFirst({ where: { id, tenantId } })
    if (!existing) return reply.code(404).send({ error: 'Ordem não encontrada' })

    // Calcular total automaticamente se mudaram custos
    const partsCost = body.partsCost !== undefined ? body.partsCost : existing.partsCost
    const laborCost = body.laborCost !== undefined ? body.laborCost : existing.laborCost
    const totalAmount = (partsCost ?? 0) + (laborCost ?? 0)

    const data: Record<string, any> = { ...body }
    if (totalAmount > 0) data.totalAmount = totalAmount
    if (body.estimatedDelivery) data.estimatedDelivery = new Date(body.estimatedDelivery)
    if (body.approvedAt) data.approvedAt = new Date(body.approvedAt)
    if (body.paidAt) data.paidAt = new Date(body.paidAt)
    if (body.deliveredAt) data.deliveredAt = new Date(body.deliveredAt)

    const updated = await prisma.repairOrder.update({
      where: { id },
      data
    })

    return reply.send(updated)
  })

  // ─── PATCH /repairs/:id/status — Atualizar status + notificar WhatsApp ────
  app.patch('/repairs/:id/status', opts, async (request, reply) => {
    const { id } = request.params as { id: string }
    const tenantId = request.user.tenantId
    const { status, notifyWhatsapp = true, customMessage } = request.body as {
      status: string
      notifyWhatsapp?: boolean
      customMessage?: string
    }

    const order = await prisma.repairOrder.findFirst({ where: { id, tenantId } })
    if (!order) return reply.code(404).send({ error: 'Ordem não encontrada' })

    const updateData: Record<string, any> = { status }
    if (status === 'ENTREGUE') updateData.deliveredAt = new Date()

    const updated = await prisma.repairOrder.update({ where: { id }, data: updateData })

    // Enviar notificação WhatsApp se solicitado
    let whatsappSent = false
    if (notifyWhatsapp && order.customerPhone) {
      try {
        // Buscar instância ativa do tenant
        const instance = await prisma.whatsAppInstance.findFirst({
          where: { tenantId, status: 'CONNECTED' }
        })

        if (instance) {
          const statusMessages: Record<string, string> = {
            EM_ANALISE: `🔍 *${order.orderNumber}* — Olá ${order.customerName}! Seu ${order.deviceBrand} ${order.deviceModel} chegou em nossa bancada e já está em análise técnica. Em breve te passaremos o diagnóstico!`,
            AGUARDANDO_PECA: `📦 *${order.orderNumber}* — Identificamos o defeito do seu ${order.deviceBrand} ${order.deviceModel}. Estamos aguardando a chegada da peça para concluir o reparo. Te avisaremos quando chegar!`,
            EM_CONSERTO: `🔧 *${order.orderNumber}* — Boa notícia! A peça do seu ${order.deviceBrand} ${order.deviceModel} chegou e o reparo já está em andamento na bancada!`,
            PRONTO: `✅ *${order.orderNumber}* — Excelente! Seu *${order.deviceBrand} ${order.deviceModel}* ficou pronto! Passou em todos os nossos testes de qualidade. Você pode vir buscar quando quiser. Horário: Seg-Sex 8h30–18h30, Sáb 9h–13h. 🎉`,
            ENTREGUE: `🙏 *${order.orderNumber}* — Obrigado pela confiança! Seu aparelho foi entregue com sucesso. Lembre-se da nossa garantia de ${order.warrantyDays} dias. Qualquer dúvida é só chamar!`
          }

          const message = customMessage || statusMessages[status]
          if (message) {
            const phone = order.customerPhone.replace(/\D/g, '')
            await evolutionClient.sendText(instance.instanceName, phone, message)
            whatsappSent = true

            if (status === 'PRONTO') {
              await prisma.repairOrder.update({ where: { id }, data: { notifiedReady: true } })
            }
          }
        }
      } catch (err: any) {
        console.error('Erro ao enviar notificação WhatsApp:', err.message || err)
      }
    }

    return reply.send({ ...updated, whatsappSent })
  })

  // ─── DELETE /repairs/:id — Remover OS ─────────────────────────────────────
  app.delete('/repairs/:id', opts, async (request, reply) => {
    const { id } = request.params as { id: string }
    const tenantId = request.user.tenantId

    const existing = await prisma.repairOrder.findFirst({ where: { id, tenantId } })
    if (!existing) return reply.code(404).send({ error: 'Ordem não encontrada' })

    await prisma.repairOrder.delete({ where: { id } })
    return reply.code(204).send()
  })

  // ─── POST /repairs/quotes — Criar item na tabela de orçamentos ────────────
  app.post('/repairs/quotes', opts, async (request, reply) => {
    const tenantId = request.user.tenantId
    const body = request.body as {
      brand: string
      modelPattern: string
      serviceType: string
      priceMin: number
      priceMax: number
      averageTime: string
      warrantyDays?: number
      notes?: string
    }

    const quote = await prisma.repairQuoteCatalog.create({
      data: { tenantId, ...body }
    })

    return reply.code(201).send(quote)
  })

  // ─── DELETE /repairs/quotes/:id — Remover orçamento de referência ─────────
  app.delete('/repairs/quotes/:id', opts, async (request, reply) => {
    const { id } = request.params as { id: string }
    const tenantId = request.user.tenantId

    await prisma.repairQuoteCatalog.deleteMany({ where: { id, tenantId } })
    return reply.code(204).send()
  })
}
