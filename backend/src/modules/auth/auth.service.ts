import axios from 'axios'
import bcrypt from 'bcryptjs'
import { FastifyInstance } from 'fastify'
import { prisma } from '../../database/prisma'
import { config } from '../../config'

export class AuthService {
  async register(data: {
    name: string
    email: string
    password: string
    companyName: string
  }) {
    // Verificar se email já existe
    const existing = await prisma.user.findUnique({ where: { email: data.email } })
    if (existing) {
      throw { statusCode: 409, message: 'Email já cadastrado' }
    }

    const hashedPassword = await bcrypt.hash(data.password, 12)

    // Criar tenant + admin em uma transaction
    const result = await prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          name: data.companyName,
          email: data.email,
          plan: 'FREE',
          maxMessages: config.plans.FREE.maxMessages
        }
      })

      const user = await tx.user.create({
        data: {
          email: data.email,
          password: hashedPassword,
          name: data.name,
          role: 'TENANT_ADMIN',
          tenantId: tenant.id
        }
      })

      // Criar config de IA padrão
      await tx.aIConfig.create({
        data: { tenantId: tenant.id }
      })

      return { tenant, user }
    })

    return {
      message: 'Conta criada com sucesso',
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        role: result.user.role
      },
      tenant: {
        id: result.tenant.id,
        name: result.tenant.name,
        plan: result.tenant.plan
      }
    }
  }

  async login(email: string, password: string, app: FastifyInstance) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        tenant: { select: { id: true, name: true, plan: true, isActive: true } }
      }
    })

    if (!user) {
      throw { statusCode: 401, message: 'Email ou senha inválidos' }
    }

    if (!user.tenant.isActive) {
      throw { statusCode: 403, message: 'Conta suspensa. Entre em contato com o suporte.' }
    }

    if (!user.password) {
      throw { statusCode: 401, message: 'Esta conta foi criada com Google. Por favor, entre usando o botão Google.' }
    }

    const validPassword = await bcrypt.compare(password, user.password)
    if (!validPassword) {
      throw { statusCode: 401, message: 'Email ou senha inválidos' }
    }

    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId
    }

    const token = app.jwt.sign(payload, { expiresIn: '7d' })

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        role: user.role,
        tenant: user.tenant
      }
    }
  }

  async loginWithGoogle(credential: string, app: FastifyInstance) {
    try {
      const response = await axios.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`, {
        timeout: 10000
      })
      const payload = response.data

      if (!payload.email || (payload.email_verified !== 'true' && payload.email_verified !== true)) {
        throw { statusCode: 401, message: 'Conta Google não verificada' }
      }

      const email = String(payload.email).toLowerCase()
      const name = payload.name || email.split('@')[0]
      const avatarUrl = payload.picture || null
      const googleId = payload.sub

      let user = await prisma.user.findFirst({
        where: {
          OR: [{ googleId }, { email }]
        },
        include: {
          tenant: { select: { id: true, name: true, plan: true, isActive: true } }
        }
      })

      if (user) {
        if (!user.tenant.isActive) {
          throw { statusCode: 403, message: 'Conta suspensa. Entre em contato com o suporte.' }
        }

        // Atualiza avatar e googleId se faltarem
        if (!user.googleId || !user.avatarUrl) {
          user = await prisma.user.update({
            where: { id: user.id },
            data: {
              googleId: user.googleId || googleId,
              avatarUrl: user.avatarUrl || avatarUrl
            },
            include: {
              tenant: { select: { id: true, name: true, plan: true, isActive: true } }
            }
          })
        }
      } else {
        // Auto-provisionar Tenant + User + AIConfig
        const result = await prisma.$transaction(async (tx) => {
          const tenant = await tx.tenant.create({
            data: {
              name: `${name}`,
              email: email,
              plan: 'FREE',
              maxMessages: config.plans.FREE.maxMessages
            }
          })

          const newUser = await tx.user.create({
            data: {
              email,
              name,
              avatarUrl,
              googleId,
              role: 'TENANT_ADMIN',
              tenantId: tenant.id
            }
          })

          await tx.aIConfig.create({
            data: { tenantId: tenant.id }
          })

          return { tenant, user: newUser }
        })

        user = {
          ...result.user,
          tenant: result.tenant
        }
      }

      const jwtPayload = {
        id: user.id,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId
      }

      const token = app.jwt.sign(jwtPayload, { expiresIn: '7d' })

      return {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          avatarUrl: user.avatarUrl,
          role: user.role,
          tenant: user.tenant
        }
      }
    } catch (err: any) {
      if (err.statusCode) throw err
      if (err.response?.data?.error_description) {
        throw { statusCode: 401, message: `Erro Google: ${err.response.data.error_description}` }
      }
      throw { statusCode: 401, message: 'Falha ao autenticar com a Conta Google' }
    }
  }

  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        role: true,
        createdAt: true,
        tenant: {
          select: {
            id: true,
            name: true,
            plan: true,
            maxMessages: true,
            apiUsage: true,
            isActive: true
          }
        }
      }
    })

    if (!user) throw { statusCode: 404, message: 'Usuário não encontrado' }
    return user
  }
}
