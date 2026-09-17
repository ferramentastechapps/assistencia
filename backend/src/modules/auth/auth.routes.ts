import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { AuthService } from './auth.service'

export async function authRoutes(app: FastifyInstance) {
  const authService = new AuthService()

  const registerSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(8),
    companyName: z.string().min(2)
  })

  const loginSchema = z.object({
    email: z.string().email(),
    password: z.string()
  })

  // POST /auth/register — Criar nova conta (tenant + admin)
  app.post('/auth/register', async (request, reply) => {
    const body = registerSchema.parse(request.body)
    const result = await authService.register(body)
    return reply.code(201).send(result)
  })

  const googleLoginSchema = z.object({
    credential: z.string().min(10)
  })

  // POST /auth/google — Login / Cadastro instantâneo com Google
  app.post('/auth/google', async (request, reply) => {
    const { credential } = googleLoginSchema.parse(request.body)
    const result = await authService.loginWithGoogle(credential, app)
    return reply.send(result)
  })

  // POST /auth/login
  app.post('/auth/login', async (request, reply) => {
    const { email, password } = loginSchema.parse(request.body)
    const result = await authService.login(email, password, app)
    return reply.send(result)
  })

  // GET /auth/me — Dados do usuário logado
  app.get('/auth/me', {
    preHandler: [app.authenticate]
  }, async (request, reply) => {
    const result = await authService.getMe(request.user.id)
    return reply.send(result)
  })

  // POST /auth/refresh — Renovar token
  app.post('/auth/refresh', {
    preHandler: [app.authenticate]
  }, async (request, reply) => {
    const user = request.user
    const token = app.jwt.sign({
      id: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId
    }, { expiresIn: '7d' })
    return reply.send({ token })
  })
}
