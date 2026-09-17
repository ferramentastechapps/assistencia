import axios from 'axios'
import { config } from '../../config'

export class AudioService {
  /**
   * Transcreve um áudio a partir de seu conteúdo em Base64 usando Whisper (Groq ou OpenAI)
   * @param base64Audio Áudio codificado em base64
   * @param mimetype Formato do áudio (ex: audio/ogg, audio/mp4, audio/mpeg)
   * @returns Texto transcrito
   */
  async transcribeBase64(base64Audio: string, mimetype = 'audio/ogg'): Promise<string> {
    try {
      // Remover prefixo data:audio/...;base64, se existir
      const cleanBase64 = base64Audio.replace(/^data:audio\/[a-z0-9]+;base64,/i, '')
      const buffer = Buffer.from(cleanBase64, 'base64')

      const groqKey = process.env.GROQ_API_KEY
      const openAiKey = process.env.OPENAI_API_KEY

      if (!groqKey && !openAiKey) {
        console.warn(
          '⚠️ [AudioService] Nenhuma chave GROQ_API_KEY ou OPENAI_API_KEY configurada para transcrição de áudios.'
        )
        return '[Mensagem de áudio recebida - transcrição indisponível: configure GROQ_API_KEY no .env]'
      }

      // Preparar FormData nativo do Node.js 20+
      const blob = new Blob([buffer], { type: mimetype })
      const formData = new FormData()
      formData.append('file', blob, 'audio.ogg')
      formData.append('language', 'pt')

      if (groqKey) {
        formData.append('model', 'whisper-large-v3')
        formData.append('response_format', 'json')

        const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${groqKey}`
          },
          body: formData
        })

        if (!response.ok) {
          const errText = await response.text()
          throw new Error(`Groq Whisper error (${response.status}): ${errText}`)
        }

        const data = (await response.json()) as { text?: string }
        return data.text?.trim() || '[Áudio vazio ou inaudível]'
      }

      if (openAiKey) {
        formData.append('model', 'whisper-1')
        formData.append('response_format', 'json')

        const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${openAiKey}`
          },
          body: formData
        })

        if (!response.ok) {
          const errText = await response.text()
          throw new Error(`OpenAI Whisper error (${response.status}): ${errText}`)
        }

        const data = (await response.json()) as { text?: string }
        return data.text?.trim() || '[Áudio vazio ou inaudível]'
      }

      return '[Transcrição de áudio não configurada]'
    } catch (error: any) {
      console.error('❌ [AudioService] Erro ao transcrever áudio:', error.message || error)
      return '[Erro ao transcrever mensagem de áudio]'
    }
  }
}

export const audioService = new AudioService()
