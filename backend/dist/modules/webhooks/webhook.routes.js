"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.webhookRoutes = webhookRoutes;
const webhook_handler_1 = require("./webhook.handler");
async function webhookRoutes(app) {
    // POST /webhooks/evolution — Recebe eventos da Evolution API
    app.post('/webhooks/evolution', async (request, reply) => {
        const body = request.body;
        // Processar de forma assíncrona para não bloquear o webhook
        setImmediate(() => (0, webhook_handler_1.handleEvolutionWebhook)(app, body.event, body.data));
        // Responder imediatamente com 200 (importante para não re-enviar)
        return reply.code(200).send({ received: true });
    });
}
//# sourceMappingURL=webhook.routes.js.map