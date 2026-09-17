import { prisma } from '../../database/prisma'
import { evolutionClient } from './evolution.client'
import { config } from '../../config'
import { io } from '../../server'

export class WhatsAppService {
  // ─── Criar nova instância ─────────────────────────────────────────────────
  async createInstance(tenantId: string, name: string) {
    const instanceName = `zapia_${tenantId.slice(-8)}_${Date.now()}`
    const webhookUrl = `${config.app.backendUrl}/webhooks/evolution`

    // Criar na Evolution API
    await evolutionClient.createInstance(instanceName, webhookUrl)

    // Salvar no banco
    const instance = await prisma.whatsAppInstance.create({
      data: {
        instanceName,
        status: 'CONNECTING',
        tenantId
      }
    })

    return instance
  }

  // ─── Listar instâncias do tenant ──────────────────────────────────────────
  async listInstances(tenantId: string) {
    return prisma.whatsAppInstance.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' }
    })
  }

  // ─── Obter QR Code ────────────────────────────────────────────────────────
  async getQrCode(instanceId: string, tenantId: string) {
    const instance = await prisma.whatsAppInstance.findFirst({
      where: { id: instanceId, tenantId }
    })
    if (!instance) throw { statusCode: 404, message: 'Instância não encontrada' }

    const qr = await evolutionClient.getQrCode(instance.instanceName)
    return qr
  }

  // ─── Desconectar ──────────────────────────────────────────────────────────
  async disconnect(instanceId: string, tenantId: string) {
    const instance = await prisma.whatsAppInstance.findFirst({
      where: { id: instanceId, tenantId }
    })
    if (!instance) throw { statusCode: 404, message: 'Instância não encontrada' }

    await evolutionClient.logout(instance.instanceName)
    
    return prisma.whatsAppInstance.update({
      where: { id: instanceId },
      data: { status: 'DISCONNECTED', phoneNumber: null }
    })
  }

  // ─── Deletar instância ────────────────────────────────────────────────────
  async deleteInstance(instanceId: string, tenantId: string) {
    const instance = await prisma.whatsAppInstance.findFirst({
      where: { id: instanceId, tenantId }
    })
    if (!instance) throw { statusCode: 404, message: 'Instância não encontrada' }

    try {
      await evolutionClient.deleteInstance(instance.instanceName)
    } catch { /* Instância pode já não existir na Evolution API */ }

    await prisma.whatsAppInstance.delete({ where: { id: instanceId } })
    return { success: true }
  }

  // ─── Atualizar status via webhook ─────────────────────────────────────────
  async updateInstanceStatus(instanceName: string, status: string, phoneNumber?: string) {
    const map: Record<string, string> = {
      open: 'CONNECTED',
      close: 'DISCONNECTED',
      connecting: 'CONNECTING'
    }

    const dbStatus = map[status] || 'DISCONNECTED'

    const instance = await prisma.whatsAppInstance.update({
      where: { instanceName },
      data: {
        status: dbStatus as any,
        ...(phoneNumber && { phoneNumber })
      }
    })

    // Notificar dashboard via Socket.io
    io?.to(`tenant:${instance.tenantId}`).emit('instance:status', {
      instanceId: instance.id,
      status: dbStatus,
      phoneNumber
    })

    return instance
  }

  // ─── Enviar mensagem ──────────────────────────────────────────────────────
  async sendMessage(instanceName: string, to: string, message: string) {
    return evolutionClient.sendText(instanceName, to, message)
  }
}
