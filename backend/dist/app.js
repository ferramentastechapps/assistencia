"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildApp = buildApp;
const fastify_1 = __importDefault(require("fastify"));
const cors_1 = __importDefault(require("@fastify/cors"));
const helmet_1 = __importDefault(require("@fastify/helmet"));
const jwt_1 = __importDefault(require("@fastify/jwt"));
const multipart_1 = __importDefault(require("@fastify/multipart"));
const rate_limit_1 = __importDefault(require("@fastify/rate-limit"));
const config_1 = require("./config");
const client_1 = require("./redis/client");
// Rotas
const auth_routes_1 = require("./modules/auth/auth.routes");
const whatsapp_routes_1 = require("./modules/whatsapp/whatsapp.routes");
const webhook_routes_1 = require("./modules/webhooks/webhook.routes");
const knowledge_routes_1 = require("./modules/knowledge/knowledge.routes");
const conversation_routes_1 = require("./modules/conversations/conversation.routes");
const quick_replies_routes_1 = require("./modules/conversations/quick-replies.routes");
const pipeline_routes_1 = require("./modules/conversations/pipeline.routes");
const billing_routes_1 = require("./modules/billing/billing.routes");
const analytics_routes_1 = require("./modules/analytics/analytics.routes");
const templates_routes_1 = require("./modules/templates/templates.routes");
const repairs_routes_1 = require("./modules/repairs/repairs.routes");
const catalog_routes_1 = require("./modules/catalog/catalog.routes");
async function buildApp() {
    const app = (0, fastify_1.default)({
        logger: config_1.config.env === 'development'
            ? { level: 'info', transport: { target: 'pino-pretty' } }
            : { level: 'error' },
        trustProxy: true
    });
    // ─── Plugins de segurança ───────────────────────────────────────────────────
    await app.register(helmet_1.default, {
        contentSecurityPolicy: false,
        crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
    });
    await app.register(cors_1.default, {
        origin: true,
        credentials: true
    });
    await app.register(rate_limit_1.default, {
        max: 100,
        timeWindow: '1 minute',
        redis: client_1.redis,
        skipOnError: true
    });
    // ─── Multipart (upload de arquivos) ────────────────────────────────────────
    await app.register(multipart_1.default, {
        limits: {
            fileSize: 50 * 1024 * 1024 // 50MB
        }
    });
    // ─── JWT ────────────────────────────────────────────────────────────────────
    await app.register(jwt_1.default, {
        secret: config_1.config.jwt.secret
    });
    // Decorar app com helper de autenticação
    app.decorate('authenticate', async (request, reply) => {
        try {
            await request.jwtVerify();
        }
        catch {
            return reply.code(401).send({ error: 'Token inválido ou expirado' });
        }
    });
    // ─── Health check ────────────────────────────────────────────────────────────
    app.get('/health', async () => ({
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    }));
    // ─── Rotas da API ────────────────────────────────────────────────────────────
    await app.register(async (api) => {
        await api.register(auth_routes_1.authRoutes);
        await api.register(whatsapp_routes_1.whatsappRoutes);
        await api.register(webhook_routes_1.webhookRoutes);
        await api.register(knowledge_routes_1.knowledgeRoutes);
        await api.register(conversation_routes_1.conversationRoutes);
        await api.register(quick_replies_routes_1.quickRepliesRoutes);
        await api.register(pipeline_routes_1.pipelineRoutes);
        await api.register(billing_routes_1.billingRoutes);
        await api.register(analytics_routes_1.analyticsRoutes);
        await api.register(templates_routes_1.templatesRoutes);
        await api.register(repairs_routes_1.repairsRoutes);
        await api.register(catalog_routes_1.catalogRoutes);
    }, { prefix: '/api/v1' });
    // Também registrar webhook sem prefixo (Evolution API usa URL direta)
    await app.register(webhook_routes_1.webhookRoutes);
    // ─── Error handler global ────────────────────────────────────────────────────
    app.setErrorHandler((error, request, reply) => {
        const statusCode = error.statusCode || error.statusCode || 500;
        const message = error.message || 'Erro interno do servidor';
        if (statusCode >= 500) {
            app.log.error(error);
        }
        return reply.code(statusCode).send({
            error: message,
            statusCode
        });
    });
    return app;
}
//# sourceMappingURL=app.js.map