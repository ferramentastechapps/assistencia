"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
exports.adminMiddleware = adminMiddleware;
exports.tenantAdminMiddleware = tenantAdminMiddleware;
exports.checkTenantActive = checkTenantActive;
const prisma_1 = require("../database/prisma");
require("@fastify/jwt");
async function authMiddleware(request, reply) {
    try {
        await request.jwtVerify();
    }
    catch {
        return reply.code(401).send({ error: 'Token inválido ou expirado' });
    }
}
async function adminMiddleware(request, reply) {
    if (request.user.role !== 'SUPER_ADMIN') {
        return reply.code(403).send({ error: 'Acesso negado: apenas administradores' });
    }
}
async function tenantAdminMiddleware(request, reply) {
    const allowed = ['SUPER_ADMIN', 'TENANT_ADMIN'];
    if (!allowed.includes(request.user.role)) {
        return reply.code(403).send({ error: 'Acesso negado: apenas admins do tenant' });
    }
}
async function checkTenantActive(request, reply) {
    const tenant = await prisma_1.prisma.tenant.findUnique({
        where: { id: request.user.tenantId },
        select: { isActive: true }
    });
    if (!tenant?.isActive) {
        return reply.code(403).send({ error: 'Conta suspensa. Entre em contato com o suporte.' });
    }
}
//# sourceMappingURL=auth.js.map