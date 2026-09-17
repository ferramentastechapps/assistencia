import Redis from 'ioredis'
import { config } from '../config'

export const redis = new Redis(config.redis.url, {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    if (times > 3) return null
    return Math.min(times * 200, 1000)
  }
})

redis.on('connect', () => console.log('✅ Redis conectado'))
redis.on('error', (err) => console.error('❌ Redis erro:', err.message))

// ─── Helpers de sessão de conversa ───────────────────────────────────────────

export type ConversationState = 'AI_ACTIVE' | 'ESCALATING' | 'HUMAN_ACTIVE' | 'RESOLVED'

export const sessionKeys = {
  state: (conversationId: string) => `conv:state:${conversationId}`,
  history: (conversationId: string) => `conv:history:${conversationId}`,
  retries: (conversationId: string) => `conv:retries:${conversationId}`,
  typing: (conversationId: string) => `conv:typing:${conversationId}`
}

export async function getConversationState(conversationId: string): Promise<ConversationState> {
  const state = await redis.get(sessionKeys.state(conversationId))
  return (state as ConversationState) || 'AI_ACTIVE'
}

export async function setConversationState(
  conversationId: string,
  state: ConversationState,
  ttlSeconds = 60 * 60 * 24 * 7  // 7 dias
): Promise<void> {
  await redis.set(sessionKeys.state(conversationId), state, 'EX', ttlSeconds)
}

export async function getConversationHistory(conversationId: string): Promise<Array<{ role: string; content: string }>> {
  const raw = await redis.get(sessionKeys.history(conversationId))
  return raw ? JSON.parse(raw) : []
}

export async function appendToHistory(
  conversationId: string,
  role: 'user' | 'assistant',
  content: string,
  maxMessages = 20
): Promise<void> {
  const history = await getConversationHistory(conversationId)
  history.push({ role, content })
  
  // Manter somente as últimas N mensagens
  const trimmed = history.slice(-maxMessages)
  
  await redis.set(
    sessionKeys.history(conversationId),
    JSON.stringify(trimmed),
    'EX',
    60 * 60 * 24 * 7
  )
}

export async function getAiRetries(conversationId: string): Promise<number> {
  const retries = await redis.get(sessionKeys.retries(conversationId))
  return retries ? parseInt(retries) : 0
}

export async function incrementAiRetries(conversationId: string): Promise<number> {
  const key = sessionKeys.retries(conversationId)
  const count = await redis.incr(key)
  await redis.expire(key, 60 * 60 * 24)  // 24h
  return count
}

export async function resetAiRetries(conversationId: string): Promise<void> {
  await redis.del(sessionKeys.retries(conversationId))
}

// ─── Debounce & Buffer de Mensagens ──────────────────────────────────────────

export async function pushToMessageBuffer(conversationId: string, text: string): Promise<number> {
  const key = `conv:buffer:${conversationId}`
  const count = await redis.rpush(key, text)
  await redis.expire(key, 60) // 1 minuto TTL
  return count
}

export async function popMessageBuffer(conversationId: string): Promise<string[]> {
  const key = `conv:buffer:${conversationId}`
  const messages = await redis.lrange(key, 0, -1)
  await redis.del(key)
  return messages || []
}

export async function setDebounceTimestamp(conversationId: string, timestamp: number): Promise<void> {
  const key = `conv:debounce:${conversationId}`
  await redis.set(key, timestamp.toString(), 'EX', 30)
}

export async function getDebounceTimestamp(conversationId: string): Promise<number> {
  const key = `conv:debounce:${conversationId}`
  const val = await redis.get(key)
  return val ? parseInt(val, 10) : 0
}

