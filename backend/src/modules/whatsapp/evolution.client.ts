import axios, { AxiosInstance } from 'axios'
import { config } from '../../config'

export class EvolutionClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: config.evolution.url,
      headers: {
        apikey: config.evolution.apiKey,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    })
  }

  // ─── Instâncias ────────────────────────────────────────────────────────────

  async createInstance(instanceName: string, webhookUrl: string) {
    const { data } = await this.client.post('/instance/create', {
      instanceName,
      qrcode: true,
      integration: 'WHATSAPP-BAILEYS',
      webhook: {
        url: webhookUrl,
        enabled: true,
        byEvents: true,
        events: ['MESSAGES_UPSERT', 'CONNECTION_UPDATE', 'QRCODE_UPDATED']
      }
    })
    return data
  }

  async deleteInstance(instanceName: string) {
    const { data } = await this.client.delete(`/instance/delete/${instanceName}`)
    return data
  }

  async getInstanceInfo(instanceName: string) {
    try {
      const { data } = await this.client.get(`/instance/fetchInstances?instanceName=${instanceName}`)
      return data[0] || null
    } catch {
      return null
    }
  }

  async getAllInstances() {
    const { data } = await this.client.get('/instance/fetchInstances')
    return data
  }

  // ─── QR Code ───────────────────────────────────────────────────────────────

  async getQrCode(instanceName: string) {
    const { data } = await this.client.get(`/instance/connect/${instanceName}`)
    return data
  }

  // ─── Mensagens ─────────────────────────────────────────────────────────────

  async sendText(instanceName: string, to: string, message: string) {
    const { data } = await this.client.post(`/message/sendText/${instanceName}`, {
      number: to,
      text: message,
      delay: 1000  // simula digitação
    })
    return data
  }

  async sendTyping(instanceName: string, to: string, durationMs = 2000) {
    try {
      await this.client.post(`/chat/sendPresence/${instanceName}`, {
        number: to,
        options: { delay: durationMs, presence: 'composing' }
      })
    } catch {
      // Não crítico — ignorar falhas de typing indicator
    }
  }

  async sendButtons(instanceName: string, to: string, text: string, buttons: Array<{ id: string; title: string }>) {
    const { data } = await this.client.post(`/message/sendButtons/${instanceName}`, {
      number: to,
      title: text,
      buttons: buttons.map(b => ({ buttonId: b.id, buttonText: { displayText: b.title }, type: 1 }))
    })
    return data
  }

  async sendList(instanceName: string, to: string, title: string, sections: Array<{ title: string; rows: Array<{ id: string; title: string; description?: string }> }>) {
    const { data } = await this.client.post(`/message/sendList/${instanceName}`, {
      number: to,
      title,
      buttonText: 'Ver opções',
      sections
    })
    return data
  }

  // ─── Contatos ──────────────────────────────────────────────────────────────

  async getProfilePicture(instanceName: string, number: string) {
    try {
      const { data } = await this.client.get(`/chat/fetchProfilePictureUrl/${instanceName}?number=${number}`)
      return data?.profilePictureUrl || null
    } catch {
      return null
    }
  }

  // ─── Mídias ────────────────────────────────────────────────────────────────

  async getMediaBase64(instanceName: string, messageData: any): Promise<string | null> {
    try {
      const { data } = await this.client.post(`/chat/getBase64FromMediaMessage/${instanceName}`, {
        message: messageData,
        convertToMp4: false
      })
      return data?.base64 || null
    } catch (err: any) {
      console.error('Erro ao obter mídia base64 da Evolution API:', err?.response?.data || err.message)
      return null
    }
  }

  async sendMedia(
    instanceName: string,
    to: string,
    mediaUrlOrBase64: string,
    mediatype: 'image' | 'audio' | 'document' = 'image',
    caption?: string,
    fileName?: string
  ) {
    const { data } = await this.client.post(`/message/sendMedia/${instanceName}`, {
      number: to,
      mediaMessage: {
        mediatype,
        caption: caption || '',
        media: mediaUrlOrBase64,
        fileName: fileName || 'arquivo'
      }
    })
    return data
  }

  // ─── Logout ────────────────────────────────────────────────────────────────

  async logout(instanceName: string) {
    const { data } = await this.client.delete(`/instance/logout/${instanceName}`)
    return data
  }
}

export const evolutionClient = new EvolutionClient()
