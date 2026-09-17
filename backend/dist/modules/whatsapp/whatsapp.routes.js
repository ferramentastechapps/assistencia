"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.whatsappRoutes = whatsappRoutes;
const auth_1 = require("../../middleware/auth");
const whatsapp_service_1 = require("./whatsapp.service");
async function whatsappRoutes(app) {
    const service = new whatsapp_service_1.WhatsAppService();
    const preHandler = [app.authenticate, auth_1.checkTenantActive];
    // POST /whatsapp/instances — Criar instância
    app.post('/whatsapp/instances', {
        preHandler: [...preHandler, auth_1.tenantAdminMiddleware]
    }, async (request, reply) => {
        const { name } = request.body;
        const instance = await service.createInstance(request.user.tenantId, name || 'Principal');
        return reply.code(201).send(instance);
    });
    // GET /whatsapp/instances — Listar instâncias
    app.get('/whatsapp/instances', { preHandler }, async (request, reply) => {
        const instances = await service.listInstances(request.user.tenantId);
        return reply.send(instances);
    });
    // GET /whatsapp/instances/:id/qr — Obter QR Code
    app.get('/whatsapp/instances/:id/qr', { preHandler }, async (request, reply) => {
        const { id } = request.params;
        const qr = await service.getQrCode(id, request.user.tenantId);
        return reply.send(qr);
    });
    // DELETE /whatsapp/instances/:id/disconnect — Desconectar
    app.delete('/whatsapp/instances/:id/disconnect', {
        preHandler: [...preHandler, auth_1.tenantAdminMiddleware]
    }, async (request, reply) => {
        const { id } = request.params;
        const result = await service.disconnect(id, request.user.tenantId);
        return reply.send(result);
    });
    // DELETE /whatsapp/instances/:id — Deletar instância
    app.delete('/whatsapp/instances/:id', {
        preHandler: [...preHandler, auth_1.tenantAdminMiddleware]
    }, async (request, reply) => {
        const { id } = request.params;
        const result = await service.deleteInstance(id, request.user.tenantId);
        return reply.send(result);
    });
}
//# sourceMappingURL=whatsapp.routes.js.map