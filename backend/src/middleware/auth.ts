import { FastifyRequest, FastifyReply } from 'fastify'
import { prisma } from '../database/prisma'

import '@fastify/jwt'

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: {
      id: string
      email: string
      role: string
      tenantId: string
    }
    user: {
      id: string
      email: string
      role: string
      tenantId: string
    }
  }
}

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: any
  }
}

export async function authMiddleware(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify()
  } catch {
    return reply.code(401).send({ error: 'Token inválido ou expirado' })
  }
}

export async function adminMiddleware(request: FastifyRequest, reply: FastifyReply) {
  if (request.user.role !== 'SUPER_ADMIN') {
    return reply.code(403).send({ error: 'Acesso negado: apenas administradores' })
  }
}

export async function tenantAdminMiddleware(request: FastifyRequest, reply: FastifyReply) {
  const allowed = ['SUPER_ADMIN', 'TENANT_ADMIN']
  if (!allowed.includes(request.user.role)) {
    return reply.code(403).send({ error: 'Acesso negado: apenas admins do tenant' })
  }
}

export async function checkTenantActive(request: FastifyRequest, reply: FastifyReply) {
  const tenant = await prisma.tenant.findUnique({
    where: { id: request.user.tenantId },
    select: { isActive: true }
  })
  if (!tenant?.isActive) {
    return reply.code(403).send({ error: 'Conta suspensa. Entre em contato com o suporte.' })
  }
}
