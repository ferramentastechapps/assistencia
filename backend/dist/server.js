"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = void 0;
const app_1 = require("./app");
const config_1 = require("./config");
const prisma_1 = require("./database/prisma");
const client_1 = require("./redis/client");
const socket_io_1 = require("socket.io");
// Exportar instância global do Socket.io para uso nos handlers
exports.io = null;
async function start() {
    console.log('🚀 Iniciando ZapIA Backend...');
    // Testar conexão com banco
    try {
        await prisma_1.prisma.$connect();
        console.log('✅ PostgreSQL conectado');
    }
    catch (error) {
        console.error('❌ Erro ao conectar PostgreSQL:', error);
        process.exit(1);
    }
    // Construir app Fastify
    const app = await (0, app_1.buildApp)();
    // Inicializar Socket.io no servidor HTTP nativo do Fastify
    exports.io = new socket_io_1.Server(app.server, {
        cors: {
            origin: '*',
            credentials: true
        }
    });
    // ─── Socket.io — Autenticação e rooms por tenant ──────────────────────────
    exports.io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token)
            return next(new Error('Autenticação necessária'));
        try {
            const payload = app.jwt.verify(token);
            socket.data.tenantId = payload.tenantId;
            next();
        }
        catch {
            next(new Error('Token inválido'));
        }
    });
    exports.io.on('connection', (socket) => {
        const tenantId = socket.data.tenantId;
        socket.join(`tenant:${tenantId}`);
        console.log(`📡 Dashboard conectado: tenant ${tenantId}`);
        socket.on('disconnect', () => {
            console.log(`📡 Dashboard desconectado: tenant ${tenantId}`);
        });
    });
    // Iniciar servidor Fastify
    await app.listen({ port: config_1.config.port, host: '0.0.0.0' });
    console.log(`\n✅ ZapIA Backend rodando na porta ${config_1.config.port}`);
    console.log(`📡 Socket.io ativo`);
    console.log(`🗄️  Banco: conectado`);
    console.log(`🔴 Redis: conectado`);
    console.log(`\n🌐 Health check: http://localhost:${config_1.config.port}/health\n`);
}
// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('🔄 Desligando servidor...');
    await prisma_1.prisma.$disconnect();
    client_1.redis.disconnect();
    process.exit(0);
});
start().catch(err => {
    console.error('❌ Erro fatal:', err);
    process.exit(1);
});
//# sourceMappingURL=server.js.map