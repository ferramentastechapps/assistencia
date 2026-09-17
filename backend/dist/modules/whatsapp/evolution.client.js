"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.evolutionClient = exports.EvolutionClient = void 0;
const axios_1 = __importDefault(require("axios"));
const config_1 = require("../../config");
class EvolutionClient {
    client;
    constructor() {
        this.client = axios_1.default.create({
            baseURL: config_1.config.evolution.url,
            headers: {
                apikey: config_1.config.evolution.apiKey,
                'Content-Type': 'application/json'
            },
            timeout: 30000
        });
    }
    // ─── Instâncias ────────────────────────────────────────────────────────────
    async createInstance(instanceName, webhookUrl) {
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
        });
        return data;
    }
    async deleteInstance(instanceName) {
        const { data } = await this.client.delete(`/instance/delete/${instanceName}`);
        return data;
    }
    async getInstanceInfo(instanceName) {
        try {
            const { data } = await this.client.get(`/instance/fetchInstances?instanceName=${instanceName}`);
            return data[0] || null;
        }
        catch {
            return null;
        }
    }
    async getAllInstances() {
        const { data } = await this.client.get('/instance/fetchInstances');
        return data;
    }
    // ─── QR Code ───────────────────────────────────────────────────────────────
    async getQrCode(instanceName) {
        const { data } = await this.client.get(`/instance/connect/${instanceName}`);
        return data;
    }
    // ─── Mensagens ─────────────────────────────────────────────────────────────
    async sendText(instanceName, to, message) {
        const { data } = await this.client.post(`/message/sendText/${instanceName}`, {
            number: to,
            text: message,
            delay: 1000 // simula digitação
        });
        return data;
    }
    async sendTyping(instanceName, to, durationMs = 2000) {
        try {
            await this.client.post(`/chat/sendPresence/${instanceName}`, {
                number: to,
                options: { delay: durationMs, presence: 'composing' }
            });
        }
        catch {
            // Não crítico — ignorar falhas de typing indicator
        }
    }
    async sendButtons(instanceName, to, text, buttons) {
        const { data } = await this.client.post(`/message/sendButtons/${instanceName}`, {
            number: to,
            title: text,
            buttons: buttons.map(b => ({ buttonId: b.id, buttonText: { displayText: b.title }, type: 1 }))
        });
        return data;
    }
    async sendList(instanceName, to, title, sections) {
        const { data } = await this.client.post(`/message/sendList/${instanceName}`, {
            number: to,
            title,
            buttonText: 'Ver opções',
            sections
        });
        return data;
    }
    // ─── Contatos ──────────────────────────────────────────────────────────────
    async getProfilePicture(instanceName, number) {
        try {
            const { data } = await this.client.get(`/chat/fetchProfilePictureUrl/${instanceName}?number=${number}`);
            return data?.profilePictureUrl || null;
        }
        catch {
            return null;
        }
    }
    // ─── Mídias ────────────────────────────────────────────────────────────────
    async getMediaBase64(instanceName, messageData) {
        try {
            const { data } = await this.client.post(`/chat/getBase64FromMediaMessage/${instanceName}`, {
                message: messageData,
                convertToMp4: false
            });
            return data?.base64 || null;
        }
        catch (err) {
            console.error('Erro ao obter mídia base64 da Evolution API:', err?.response?.data || err.message);
            return null;
        }
    }
    async sendMedia(instanceName, to, mediaUrlOrBase64, mediatype = 'image', caption, fileName) {
        const { data } = await this.client.post(`/message/sendMedia/${instanceName}`, {
            number: to,
            mediaMessage: {
                mediatype,
                caption: caption || '',
                media: mediaUrlOrBase64,
                fileName: fileName || 'arquivo'
            }
        });
        return data;
    }
    // ─── Logout ────────────────────────────────────────────────────────────────
    async logout(instanceName) {
        const { data } = await this.client.delete(`/instance/logout/${instanceName}`);
        return data;
    }
}
exports.EvolutionClient = EvolutionClient;
exports.evolutionClient = new EvolutionClient();
//# sourceMappingURL=evolution.client.js.map