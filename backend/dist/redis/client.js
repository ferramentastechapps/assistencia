"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sessionKeys = exports.redis = void 0;
exports.getConversationState = getConversationState;
exports.setConversationState = setConversationState;
exports.getConversationHistory = getConversationHistory;
exports.appendToHistory = appendToHistory;
exports.getAiRetries = getAiRetries;
exports.incrementAiRetries = incrementAiRetries;
exports.resetAiRetries = resetAiRetries;
exports.pushToMessageBuffer = pushToMessageBuffer;
exports.popMessageBuffer = popMessageBuffer;
exports.setDebounceTimestamp = setDebounceTimestamp;
exports.getDebounceTimestamp = getDebounceTimestamp;
const ioredis_1 = __importDefault(require("ioredis"));
const config_1 = require("../config");
exports.redis = new ioredis_1.default(config_1.config.redis.url, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
        if (times > 3)
            return null;
        return Math.min(times * 200, 1000);
    }
});
exports.redis.on('connect', () => console.log('✅ Redis conectado'));
exports.redis.on('error', (err) => console.error('❌ Redis erro:', err.message));
exports.sessionKeys = {
    state: (conversationId) => `conv:state:${conversationId}`,
    history: (conversationId) => `conv:history:${conversationId}`,
    retries: (conversationId) => `conv:retries:${conversationId}`,
    typing: (conversationId) => `conv:typing:${conversationId}`
};
async function getConversationState(conversationId) {
    const state = await exports.redis.get(exports.sessionKeys.state(conversationId));
    return state || 'AI_ACTIVE';
}
async function setConversationState(conversationId, state, ttlSeconds = 60 * 60 * 24 * 7 // 7 dias
) {
    await exports.redis.set(exports.sessionKeys.state(conversationId), state, 'EX', ttlSeconds);
}
async function getConversationHistory(conversationId) {
    const raw = await exports.redis.get(exports.sessionKeys.history(conversationId));
    return raw ? JSON.parse(raw) : [];
}
async function appendToHistory(conversationId, role, content, maxMessages = 20) {
    const history = await getConversationHistory(conversationId);
    history.push({ role, content });
    // Manter somente as últimas N mensagens
    const trimmed = history.slice(-maxMessages);
    await exports.redis.set(exports.sessionKeys.history(conversationId), JSON.stringify(trimmed), 'EX', 60 * 60 * 24 * 7);
}
async function getAiRetries(conversationId) {
    const retries = await exports.redis.get(exports.sessionKeys.retries(conversationId));
    return retries ? parseInt(retries) : 0;
}
async function incrementAiRetries(conversationId) {
    const key = exports.sessionKeys.retries(conversationId);
    const count = await exports.redis.incr(key);
    await exports.redis.expire(key, 60 * 60 * 24); // 24h
    return count;
}
async function resetAiRetries(conversationId) {
    await exports.redis.del(exports.sessionKeys.retries(conversationId));
}
// ─── Debounce & Buffer de Mensagens ──────────────────────────────────────────
async function pushToMessageBuffer(conversationId, text) {
    const key = `conv:buffer:${conversationId}`;
    const count = await exports.redis.rpush(key, text);
    await exports.redis.expire(key, 60); // 1 minuto TTL
    return count;
}
async function popMessageBuffer(conversationId) {
    const key = `conv:buffer:${conversationId}`;
    const messages = await exports.redis.lrange(key, 0, -1);
    await exports.redis.del(key);
    return messages || [];
}
async function setDebounceTimestamp(conversationId, timestamp) {
    const key = `conv:debounce:${conversationId}`;
    await exports.redis.set(key, timestamp.toString(), 'EX', 30);
}
async function getDebounceTimestamp(conversationId) {
    const key = `conv:debounce:${conversationId}`;
    const val = await exports.redis.get(key);
    return val ? parseInt(val, 10) : 0;
}
//# sourceMappingURL=client.js.map