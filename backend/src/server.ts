import { buildApp } from './app'
import { config } from './config'
import { prisma } from './database/prisma'
import { redis } from './redis/client'
import { Server as SocketServer } from 'socket.io'
import { createServer } from 'http'

// Exportar instância global do Socket.io para uso nos handlers
export let io: SocketServer | null = null

async function start() {
  console.log('🚀 Iniciando ZapIA Backend...')

  // Testar conexão com banco
  try {
    await prisma.$connect()
    console.log('✅ PostgreSQL conectado')
  } catch (error) {
    console.error('❌ Erro ao conectar PostgreSQL:', error)
    process.exit(1)
  }

  // Construir app Fastify
  const app = await buildApp()

  // Inicializar Socket.io no servidor HTTP nativo do Fastify
  io = new SocketServer(app.server, {
    cors: {
      origin: '*',
      credentials: true
    }
  })

  // ─── Socket.io — Autenticação e rooms por tenant ──────────────────────────
  io.use((socket, next) => {
    const token = socket.handshake.auth.token
    if (!token) return next(new Error('Autenticação necessária'))

    try {
      const payload = app.jwt.verify(token) as { tenantId: string }
      socket.data.tenantId = payload.tenantId
      next()
    } catch {
      next(new Error('Token inválido'))
    }
  })

  io.on('connection', (socket) => {
    const tenantId = socket.data.tenantId
    socket.join(`tenant:${tenantId}`)
    console.log(`📡 Dashboard conectado: tenant ${tenantId}`)

    socket.on('disconnect', () => {
      console.log(`📡 Dashboard desconectado: tenant ${tenantId}`)
    })
  })

  // Iniciar servidor Fastify
  await app.listen({ port: config.port, host: '0.0.0.0' })
  console.log(`\n✅ ZapIA Backend rodando na porta ${config.port}`)
  console.log(`📡 Socket.io ativo`)
  console.log(`🗄️  Banco: conectado`)
  console.log(`🔴 Redis: conectado`)
  console.log(`\n🌐 Health check: http://localhost:${config.port}/health\n`)
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🔄 Desligando servidor...')
  await prisma.$disconnect()
  redis.disconnect()
  process.exit(0)
})

start().catch(err => {
  console.error('❌ Erro fatal:', err)
  process.exit(1)
})
