import { FastifyInstance } from 'fastify'
import { prisma } from '../../database/prisma'
import { AIService } from '../ai/ai.service'
import { WhatsAppService } from '../whatsapp/whatsapp.service'
import { evolutionClient } from '../whatsapp/evolution.client'
import { audioService } from '../ai/audio.service'
import {
  getConversationState,
  setConversationState,
  pushToMessageBuffer,
  popMessageBuffer,
  setDebounceTimestamp,
  getDebounceTimestamp
} from '../../redis/client'
import { io } from '../../server'

const aiService = new AIService()
const whatsappService = new WhatsAppService()

// ─── Tipos dos payloads da Evolution API ──────────────────────────────────────

interface EvolutionMessage {
  key: { remoteJid: string; fromMe: boolean; id: string }
  message?: {
    conversation?: string
    extendedTextMessage?: { text: string }
    audioMessage?: object
    imageMessage?: object
    ephemeralMessage?: { message?: { audioMessage?: object; conversation?: string; extendedTextMessage?: { text: string } } }
  }
  messageType: string
  pushName?: string
  instanceName: string
}

interface EvolutionConnectionUpdate {
  instance: string
  state: string
  statusReason?: number
  number?: string
}

interface EvolutionQrCode {
  instance: string
  qrcode: { code: string; base64: string }
}

// ─── Handler principal ────────────────────────────────────────────────────────

export async function handleEvolutionWebhook(
  app: FastifyInstance,
  event: string,
  data: any
): Promise<void> {
  try {
    switch (event) {
      case 'messages.upsert':
        await handleMessage(data as EvolutionMessage)
        break

      case 'connection.update':
        await handleConnectionUpdate(data as EvolutionConnectionUpdate)
        break

      case 'qrcode.updated':
        await handleQrCodeUpdate(data as EvolutionQrCode)
        break

      default:
        // Evento não tratado — ignorar silenciosamente
        break
    }
  } catch (error) {
    console.error(`Erro ao processar evento ${event}:`, error)
  }
}

// ─── Processar mensagem recebida ──────────────────────────────────────────────

async function handleMessage(data: EvolutionMessage): Promise<void> {
  // Ignorar mensagens enviadas pelo bot
  if (data.key.fromMe) return

  const instanceName = data.instanceName
  const remoteJid = data.key.remoteJid
  const contactPhone = remoteJid.replace('@s.whatsapp.net', '')
  const contactName = data.pushName

  // Identificar se é áudio
  const isAudio =
    data.messageType === 'audioMessage' ||
    !!data.message?.audioMessage ||
    !!data.message?.ephemeralMessage?.message?.audioMessage

  let messageText =
    data.message?.conversation ||
    data.message?.extendedTextMessage?.text ||
    data.message?.ephemeralMessage?.message?.conversation ||
    data.message?.ephemeralMessage?.message?.extendedTextMessage?.text ||
    null

  // Processar áudio com Whisper se aplicável
  if (isAudio) {
    try {
      // Obter base64 do áudio via Evolution API
      const base64Audio = await evolutionClient.getMediaBase64(instanceName, data)
      if (base64Audio) {
        const transcription = await audioService.transcribeBase64(base64Audio, 'audio/ogg')
        messageText = `🎙️ [Áudio]: ${transcription}`
      } else {
        messageText = '[Áudio recebido]'
      }
    } catch (err: any) {
      console.error('Erro ao transcrever áudio recebido:', err.message || err)
      messageText = '[Áudio recebido - erro na transcrição]'
    }
  } else if (!messageText) {
    messageText =
      (data.messageType === 'imageMessage' ? '[Imagem recebida]' : null) ||
      '[Mensagem não suportada]'
  }

  // Buscar instância no banco
  const instance = await prisma.whatsAppInstance.findUnique({
    where: { instanceName },
    include: { tenant: true }
  })

  if (!instance) {
    console.warn(`Instância não encontrada: ${instanceName}`)
    return
  }

  const tenantId = instance.tenantId

  // Buscar ou criar conversa
  let conversation = await prisma.conversation.findFirst({
    where: { tenantId, instanceId: instance.id, contactPhone, status: { not: 'RESOLVED' } }
  })

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        tenantId,
        instanceId: instance.id,
        contactPhone,
        contactName,
        status: 'AI_ACTIVE'
      }
    })
    await setConversationState(conversation.id, 'AI_ACTIVE')
  }

  // Salvar mensagem do usuário no banco
  const userMessage = await prisma.message.create({
    data: {
      conversationId: conversation.id,
      role: 'USER',
      content: messageText,
      mediaType: isAudio ? 'AUDIO' : (data.messageType === 'imageMessage' ? 'IMAGE' : null),
      isFromWhatsApp: true,
      evolutionMsgId: data.key.id
    }
  })

  // Atualizar nome do contato se disponível
  if (contactName && !conversation.contactName) {
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { contactName, updatedAt: new Date() }
    })
  }

  // Emitir mensagem para o dashboard via Socket.io imediatamente
  io?.to(`tenant:${tenantId}`).emit('message:received', {
    conversationId: conversation.id,
    message: userMessage,
    contactPhone,
    contactName
  })

  // ─── State Machine ─────────────────────────────────────────────────────────
  const state = await getConversationState(conversation.id)

  if (state === 'HUMAN_ACTIVE') {
    // Mensagem vai apenas para o inbox — não processa com IA
    io?.to(`tenant:${tenantId}`).emit('inbox:message', {
      conversationId: conversation.id,
      message: userMessage
    })
    return
  }

  if (state === 'RESOLVED') {
    // Reabrir conversa para IA
    await setConversationState(conversation.id, 'AI_ACTIVE')
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { status: 'AI_ACTIVE', resolvedAt: null }
    })
  }

  // ─── Debounce & Buffer com IA ──────────────────────────────────────────────
  // 1. Guardar a mensagem no buffer do Redis
  await pushToMessageBuffer(conversation.id, messageText)

  // 2. Enviar presença nativa de 'composing' (digitando...) para o WhatsApp
  await evolutionClient.sendTyping(instanceName, remoteJid, 4000)

  // 3. Atualizar carimbo temporal de debounce
  const currentTimestamp = Date.now()
  await setDebounceTimestamp(conversation.id, currentTimestamp)

  const conversationId = conversation.id

  // 4. Aguardar janela de debounce (3500ms) para verificar se novas mensagens chegam
  setTimeout(async () => {
    try {
      const latestTimestamp = await getDebounceTimestamp(conversationId)
      // Se outra mensagem mais recente chegou, este timer encerra silenciosamente
      if (latestTimestamp !== currentTimestamp) {
        return
      }

      // Timer mais recente assume o processamento do lote
      const bufferedMessages = await popMessageBuffer(conversationId)
      if (!bufferedMessages || bufferedMessages.length === 0) return

      // Concatenar mensagens de forma fluida
      const fullPromptText = bufferedMessages.join('\n')

      // Manter presença de digitando durante o raciocínio do LLM
      await evolutionClient.sendTyping(instanceName, remoteJid, 5000)

      const aiResponse = await aiService.processMessage(conversationId, tenantId, fullPromptText)

      // Simulação natural de digitação proporcional ao texto gerado (1.2s a 4.5s)
      const typingMs = Math.min(Math.max(aiResponse.text.length * 20, 1200), 4500)
      await evolutionClient.sendTyping(instanceName, remoteJid, typingMs)
      await new Promise(r => setTimeout(r, typingMs))

      // Salvar resposta da IA no banco
      const assistantMessage = await prisma.message.create({
        data: {
          conversationId,
          role: 'ASSISTANT',
          content: aiResponse.text
        }
      })

      // Enviar resposta via WhatsApp
      await whatsappService.sendMessage(instanceName, remoteJid, aiResponse.text)

      // Emitir resposta para o dashboard
      io?.to(`tenant:${tenantId}`).emit('message:sent', {
        conversationId,
        message: assistantMessage
      })

      // Verificar se deve escalonar
      if (aiResponse.shouldEscalate) {
        await setConversationState(conversationId, 'HUMAN_ACTIVE')
        await prisma.conversation.update({
          where: { id: conversationId },
          data: { status: 'HUMAN_ACTIVE' }
        })

        io?.to(`tenant:${tenantId}`).emit('conversation:escalated', {
          conversationId,
          contactPhone,
          contactName
        })
      }
    } catch (err: any) {
      console.error('Erro no processamento debounced da IA:', err.message || err)
    }
  }, 3500)
}

// ─── Atualização de conexão ───────────────────────────────────────────────────

async function handleConnectionUpdate(data: EvolutionConnectionUpdate): Promise<void> {
  const whatsappSvc = new WhatsAppService()

  const phoneNumber = data.number || undefined
  await whatsappSvc.updateInstanceStatus(data.instance, data.state, phoneNumber)
}

// ─── QR Code atualizado ───────────────────────────────────────────────────────

async function handleQrCodeUpdate(data: EvolutionQrCode): Promise<void> {
  const instance = await prisma.whatsAppInstance.findUnique({
    where: { instanceName: data.instance }
  })

  if (instance) {
    io?.to(`tenant:${instance.tenantId}`).emit('qr:updated', {
      instanceId: instance.id,
      qrCode: data.qrcode.base64
    })
  }
}
