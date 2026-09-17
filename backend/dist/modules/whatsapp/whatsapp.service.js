"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsAppService = void 0;
const prisma_1 = require("../../database/prisma");
const evolution_client_1 = require("./evolution.client");
const config_1 = require("../../config");
const server_1 = require("../../server");
class WhatsAppService {
    // ─── Criar nova instância ─────────────────────────────────────────────────
    async createInstance(tenantId, name) {
        const instanceName = `zapia_${tenantId.slice(-8)}_${Date.now()}`;
        const webhookUrl = `${config_1.config.app.backendUrl}/webhooks/evolution`;
        // Criar na Evolution API
        await evolution_client_1.evolutionClient.createInstance(instanceName, webhookUrl);
        // Salvar no banco
        const instance = await prisma_1.prisma.whatsAppInstance.create({
            data: {
                instanceName,
                status: 'CONNECTING',
                tenantId
            }
        });
        return instance;
    }
    // ─── Listar instâncias do tenant ──────────────────────────────────────────
    async listInstances(tenantId) {
        return prisma_1.prisma.whatsAppInstance.findMany({
            where: { tenantId },
            orderBy: { createdAt: 'desc' }
        });
    }
    // ─── Obter QR Code ────────────────────────────────────────────────────────
    async getQrCode(instanceId, tenantId) {
        const instance = await prisma_1.prisma.whatsAppInstance.findFirst({
            where: { id: instanceId, tenantId }
        });
        if (!instance)
            throw { statusCode: 404, message: 'Instância não encontrada' };
        const qr = await evolution_client_1.evolutionClient.getQrCode(instance.instanceName);
        return qr;
    }
    // ─── Desconectar ──────────────────────────────────────────────────────────
    async disconnect(instanceId, tenantId) {
        const instance = await prisma_1.prisma.whatsAppInstance.findFirst({
            where: { id: instanceId, tenantId }
        });
        if (!instance)
            throw { statusCode: 404, message: 'Instância não encontrada' };
        await evolution_client_1.evolutionClient.logout(instance.instanceName);
        return prisma_1.prisma.whatsAppInstance.update({
            where: { id: instanceId },
            data: { status: 'DISCONNECTED', phoneNumber: null }
        });
    }
    // ─── Deletar instância ────────────────────────────────────────────────────
    async deleteInstance(instanceId, tenantId) {
        const instance = await prisma_1.prisma.whatsAppInstance.findFirst({
            where: { id: instanceId, tenantId }
        });
        if (!instance)
            throw { statusCode: 404, message: 'Instância não encontrada' };
        try {
            await evolution_client_1.evolutionClient.deleteInstance(instance.instanceName);
        }
        catch { /* Instância pode já não existir na Evolution API */ }
        await prisma_1.prisma.whatsAppInstance.delete({ where: { id: instanceId } });
        return { success: true };
    }
    // ─── Atualizar status via webhook ─────────────────────────────────────────
    async updateInstanceStatus(instanceName, status, phoneNumber) {
        const map = {
            open: 'CONNECTED',
            close: 'DISCONNECTED',
            connecting: 'CONNECTING'
        };
        const dbStatus = map[status] || 'DISCONNECTED';
        const instance = await prisma_1.prisma.whatsAppInstance.update({
            where: { instanceName },
            data: {
                status: dbStatus,
                ...(phoneNumber && { phoneNumber })
            }
        });
        // Notificar dashboard via Socket.io
        server_1.io?.to(`tenant:${instance.tenantId}`).emit('instance:status', {
            instanceId: instance.id,
            status: dbStatus,
            phoneNumber
        });
        return instance;
    }
    // ─── Enviar mensagem ──────────────────────────────────────────────────────
    async sendMessage(instanceName, to, message) {
        return evolution_client_1.evolutionClient.sendText(instanceName, to, message);
    }
}
exports.WhatsAppService = WhatsAppService;
//# sourceMappingURL=whatsapp.service.js.map