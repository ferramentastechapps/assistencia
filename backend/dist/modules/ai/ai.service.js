"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIService = void 0;
const messages_1 = require("@langchain/core/messages");
const prisma_1 = require("../../database/prisma");
const openrouter_client_1 = require("./openrouter.client");
const rag_service_1 = require("./rag.service");
const tools_registry_1 = require("./tools.registry");
const client_1 = require("../../redis/client");
// ─── Tags de ferramentas especializadas para assistência técnica ───────────────
const TOOL_PATTERNS = [
    { tag: /\[CONSULTAR_OS:\s*([^\]]+)\]/i, tool: 'checkRepairOrderStatus', argKey: 'query' },
    { tag: /\[BUSCAR_PRECO:\s*([^,\]]+),([^,\]]+),([^\]]+)\]/i, tool: 'checkRepairQuote', argKey: '_multi' },
    { tag: /\[BUSCAR_CATALOGO(?::\s*([^\]]+))?\]/i, tool: 'searchPhoneCatalog', argKey: 'search' },
    { tag: /\[AVALIAR_USADO:\s*([^,\]]+),([^,\]]+),([^\]]*),([^\]]*),([^\]]+)\]/i, tool: 'evaluateTradeInPhone', argKey: '_multi' },
    { tag: /\[AGENDAR:\s*([^,\]]+),\s*([^,\]]+)(?:,\s*([^\]]+))?\]/i, tool: 'scheduleMeeting', argKey: '_multi' },
    { tag: /\[GERAR_PIX:\s*([^,\]]+),([^\]]+)\]/i, tool: 'generatePixCharge', argKey: '_multi' },
];
class AIService {
    ragService = new rag_service_1.RagService();
    async processMessage(conversationId, tenantId, userMessage, instanceName = '', remoteJid = '') {
        // 1. Buscar configuração do tenant
        const aiConfig = await prisma_1.prisma.aIConfig.findUnique({
            where: { tenantId }
        });
        if (!aiConfig) {
            return {
                text: 'Serviço temporariamente indisponível.',
                shouldEscalate: false,
                usedKnowledge: false,
                relevanceScore: 0
            };
        }
        // 2. Verificar palavras-chave de escalonamento
        const escalationKeywords = JSON.parse(aiConfig.escalationKeywords || '[]');
        const msgLower = userMessage.toLowerCase();
        const hasEscalationKeyword = escalationKeywords.some(kw => msgLower.includes(kw.toLowerCase()));
        if (hasEscalationKeyword) {
            return {
                text: 'Claro! Vou te conectar com um de nossos técnicos. Aguarde um momento...',
                shouldEscalate: true,
                usedKnowledge: false,
                relevanceScore: 1
            };
        }
        // 3. Verificar horário de atendimento
        if (aiConfig.businessHours) {
            const inHours = this.isInBusinessHours(aiConfig.businessHours);
            if (!inHours) {
                return {
                    text: aiConfig.outOfHoursMsg,
                    shouldEscalate: false,
                    usedKnowledge: false,
                    relevanceScore: 1
                };
            }
        }
        // 4. Buscar conhecimento relevante (RAG)
        const relevantChunks = await this.ragService.search(userMessage, tenantId);
        const hasKnowledge = relevantChunks.length > 0;
        const maxScore = relevantChunks.length > 0 ? Math.max(...relevantChunks.map(c => c.score)) : 0;
        // 5. Buscar histórico da conversa (Redis)
        const history = await (0, client_1.getConversationHistory)(conversationId);
        // 6. Montar prompt do sistema
        const systemPrompt = this.buildSystemPrompt(aiConfig, relevantChunks);
        // 7. Montar mensagens para o LLM
        const messages = [
            new messages_1.SystemMessage(systemPrompt),
            ...history.slice(-10).map(h => h.role === 'user'
                ? new messages_1.HumanMessage(h.content)
                : new messages_1.AIMessage(h.content)),
            new messages_1.HumanMessage(userMessage)
        ];
        // 8. Chamar o LLM
        let responseText;
        try {
            const llm = (0, openrouter_client_1.createLLM)(aiConfig.llmModel, aiConfig.llmApiKey || undefined);
            const response = await llm.invoke(messages);
            responseText = response.content;
        }
        catch (error) {
            console.error('Erro ao chamar LLM:', error);
            responseText = aiConfig.fallbackMessage;
        }
        // 9. Detectar sinais de não-saber e de escalonamento
        const aiDoesntKnow = responseText.includes('[NAO_SEI]');
        const aiWantsEscalate = responseText.includes('[ESCALAR]');
        // 10. Executar ferramentas disparadas pela IA (Function Calling Especializado)
        const toolContext = { conversationId, tenantId, instanceName, remoteJid };
        let toolsOutput = '';
        // 10.1 Consultar status de OS: [CONSULTAR_OS: numero_ou_telefone]
        const osMatch = responseText.match(/\[CONSULTAR_OS:\s*([^\]]+)\]/i);
        if (osMatch) {
            const result = await tools_registry_1.agentToolsService.executeTool('checkRepairOrderStatus', { query: osMatch[1].trim() }, toolContext);
            toolsOutput += '\n' + result;
            responseText = responseText.replace(osMatch[0], '').trim();
        }
        // 10.2 Buscar preço de conserto: [BUSCAR_PRECO: marca, modelo, servico]
        const quoteMatch = responseText.match(/\[BUSCAR_PRECO:\s*([^,\]]+),([^,\]]+),([^\]]+)\]/i);
        if (quoteMatch) {
            const result = await tools_registry_1.agentToolsService.executeTool('checkRepairQuote', {
                brand: quoteMatch[1].trim(),
                model: quoteMatch[2].trim(),
                serviceType: quoteMatch[3].trim()
            }, toolContext);
            toolsOutput += '\n' + result;
            responseText = responseText.replace(quoteMatch[0], '').trim();
        }
        // 10.3 Buscar celulares no catálogo: [BUSCAR_CATALOGO: termo_opcional]
        const catalogMatch = responseText.match(/\[BUSCAR_CATALOGO(?::\s*([^\]]+))?\]/i);
        if (catalogMatch) {
            const result = await tools_registry_1.agentToolsService.executeTool('searchPhoneCatalog', {
                search: catalogMatch[1]?.trim() || undefined
            }, toolContext);
            toolsOutput += '\n' + result;
            responseText = responseText.replace(catalogMatch[0], '').trim();
        }
        // 10.4 Avaliar trade-in: [AVALIAR_USADO: marca, modelo, armazenamento, bateria%, condicao]
        const tradeInMatch = responseText.match(/\[AVALIAR_USADO:\s*([^,\]]+),([^,\]]+),([^,\]]*),([^,\]]*),([^\]]+)\]/i);
        if (tradeInMatch) {
            const result = await tools_registry_1.agentToolsService.executeTool('evaluateTradeInPhone', {
                brand: tradeInMatch[1].trim(),
                model: tradeInMatch[2].trim(),
                storage: tradeInMatch[3]?.trim() || undefined,
                batteryHealth: tradeInMatch[4]?.trim() ? parseInt(tradeInMatch[4].trim()) : undefined,
                condition: tradeInMatch[5].trim()
            }, toolContext);
            toolsOutput += '\n' + result;
            responseText = responseText.replace(tradeInMatch[0], '').trim();
        }
        // 10.5 Agendamento: [AGENDAR: data, horario, motivo]
        const scheduleMatch = responseText.match(/\[AGENDAR:\s*([^,\]]+),\s*([^,\]]+)(?:,\s*([^\]]+))?\]/i);
        if (scheduleMatch) {
            await tools_registry_1.agentToolsService.executeTool('scheduleMeeting', {
                date: scheduleMatch[1].trim(),
                time: scheduleMatch[2].trim(),
                notes: scheduleMatch[3]?.trim()
            }, toolContext);
            responseText = responseText.replace(scheduleMatch[0], '').trim();
        }
        // 10.6 Gerar Pix: [GERAR_PIX: valor, descricao]
        const pixMatch = responseText.match(/\[GERAR_PIX:\s*([^,\]]+),([^\]]+)\]/i);
        if (pixMatch) {
            const pixResult = await tools_registry_1.agentToolsService.executeTool('generatePixCharge', {
                amount: parseFloat(pixMatch[1].trim()),
                description: pixMatch[2].trim()
            }, toolContext);
            responseText = responseText.replace(pixMatch[0], pixResult).trim();
        }
        // 11. Se houve resultados de ferramentas, re-processar com o LLM para gerar resposta humanizada
        if (toolsOutput.trim()) {
            try {
                const llm = (0, openrouter_client_1.createLLM)(aiConfig.llmModel, aiConfig.llmApiKey || undefined);
                const contextMsg = `${responseText}\n\n[DADOS DAS FERRAMENTAS]:\n${toolsOutput.trim()}\n\nAgora use os dados acima para formular uma resposta clara, amigável e completa para o cliente no WhatsApp. Não mencione as tags técnicas.`;
                const reReply = await llm.invoke([
                    new messages_1.SystemMessage(systemPrompt),
                    new messages_1.HumanMessage(userMessage),
                    new messages_1.AIMessage(contextMsg)
                ]);
                responseText = reReply.content;
            }
            catch {
                // Se falhar o re-processamento, usa resposta simples com os dados
                responseText = (responseText + '\n' + toolsOutput).trim();
            }
        }
        // 12. Limpar tags
        responseText = responseText
            .replace('[NAO_SEI]', '')
            .replace('[ESCALAR]', '')
            .trim();
        // 13. Verificar retries (anti-loop)
        let shouldEscalate = aiWantsEscalate;
        if (aiDoesntKnow) {
            const retries = await (0, client_1.incrementAiRetries)(conversationId);
            if (retries >= aiConfig.maxAiRetries) {
                shouldEscalate = true;
                responseText = aiConfig.noKnowledgeMsg;
            }
            else {
                responseText = responseText || aiConfig.noKnowledgeMsg;
            }
        }
        else {
            await (0, client_1.resetAiRetries)(conversationId);
        }
        // 14. Atualizar histórico no Redis
        await (0, client_1.appendToHistory)(conversationId, 'user', userMessage);
        await (0, client_1.appendToHistory)(conversationId, 'assistant', responseText);
        // 15. Atualizar contador de API usage do tenant
        await prisma_1.prisma.tenant.update({
            where: { id: tenantId },
            data: { apiUsage: { increment: 1 } }
        });
        return {
            text: responseText,
            shouldEscalate,
            usedKnowledge: hasKnowledge,
            relevanceScore: maxScore
        };
    }
    buildSystemPrompt(config, chunks) {
        const contextSection = chunks.length > 0
            ? `\n\n## BASE DE CONHECIMENTO (use estas informações para responder)\n${chunks.map(c => `### ${c.documentTitle}\n${c.content}`).join('\n\n')}`
            : '';
        const customInstructions = config.systemPrompt
            ? `\n\n## INSTRUÇÕES ADICIONAIS\n${config.systemPrompt}`
            : '';
        return `Você é ${config.personaName}, um especialista em assistência técnica de celulares e vendas de smartphones, ${config.personaTone}.
Responda sempre em ${config.language}.
Seja conciso e objetivo — respostas curtas funcionam melhor no WhatsApp.
Use emojis com moderação para tornar a conversa mais amigável. 📱

## CAPACIDADES E FERRAMENTAS — COMO CHAMAR CADA UMA:

### 🔧 Consultar Status de OS:
Quando o cliente perguntar sobre o celular dele, conserto, ordem de serviço ou quando estará pronto:
- Peça o número da OS (ex: OS-1234) ou o número de telefone cadastrado.
- Use a tag: [CONSULTAR_OS: numero_da_os_ou_telefone]
- Exemplo: "Meu celular já ficou pronto?" → pergunte o número da OS → [CONSULTAR_OS: OS-1001]

### 💰 Buscar Preço de Conserto:
Quando o cliente perguntar o preço de um conserto (tela, bateria, conector, desoxidação, etc.):
- Sempre pergunte primeiro a MARCA e MODELO EXATO.
- Use a tag: [BUSCAR_PRECO: Marca, Modelo, Tipo de Serviço]
- Exemplo: "Quanto custa trocar a tela do iPhone 13?" → [BUSCAR_PRECO: Apple, iPhone 13, Tela Original]

### 📱 Buscar Celulares no Catálogo para Venda:
Quando o cliente quiser comprar um celular, ver opções, perguntar preços de venda:
- Use a tag: [BUSCAR_CATALOGO: termo_de_busca_opcional]
- Exemplos: "Vocês têm iPhone barato?" → [BUSCAR_CATALOGO: iPhone] | "Quero um Galaxy" → [BUSCAR_CATALOGO: Samsung Galaxy]

### 🔄 Avaliar Celular Usado (Trade-In):
Quando o cliente quiser trocar o celular ou perguntar quanto vale o aparelho dele:
- Colete: marca, modelo, armazenamento (GB), saúde da bateria (%) se possível, e condição (Excelente/Bom/Regular/Com defeito).
- Use a tag: [AVALIAR_USADO: Marca, Modelo, ArmazenamentoGB, Bateria%, Condição]
- Exemplo: [AVALIAR_USADO: Apple, iPhone 11, 64GB, 85, Bom]

### 📅 Agendar Atendimento:
Quando o cliente quiser agendar: [AGENDAR: data, horario, motivo]

### 💳 Gerar Pix:
Quando o cliente quiser pagar e confirmar: [GERAR_PIX: valor, descricao]

## REGRAS DE OURO — ASSISTÊNCIA TÉCNICA:
- SEMPRE pergunte o modelo EXATO do celular (ex: iPhone 13, Galaxy A54, Redmi Note 12 — não aceite só "Samsung" ou "iPhone").
- Se o cliente disser que o celular CAIU NA ÁGUA: ⚠️ Alerte IMEDIATAMENTE para NÃO ligar, NÃO colocar no carregador e trazer URGENTE para desoxidação.
- Explique que trabalhamos com telas Originais e telas Premium OLED de 1ª linha com 90 dias de garantia.
- Serviços rápidos (tela, bateria) costumam ficar prontos no mesmo dia ou em até 1 hora na bancada express.
- Pagamento facilitado em até 12x no cartão ou desconto especial no Pix.
- Se não souber algo, escreva [NAO_SEI] no início da resposta.
- Se detectar frustração extrema ou pedido explícito de humano/técnico, escreva [ESCALAR].
- NUNCA invente preços, prazos ou informações técnicas sem usar as ferramentas acima.
- Nunca revele que você é uma IA, a menos que o cliente pergunte diretamente.${contextSection}${customInstructions}`;
    }
    isInBusinessHours(businessHoursJson) {
        try {
            const { start, end, days } = JSON.parse(businessHoursJson);
            const now = new Date();
            const day = now.getDay(); // 0=Dom, 1=Seg, ...
            if (!days.includes(day))
                return false;
            const [startH, startM] = start.split(':').map(Number);
            const [endH, endM] = end.split(':').map(Number);
            const startMinutes = startH * 60 + startM;
            const endMinutes = endH * 60 + endM;
            const nowMinutes = now.getHours() * 60 + now.getMinutes();
            return nowMinutes >= startMinutes && nowMinutes <= endMinutes;
        }
        catch {
            return true; // Em caso de erro, assume que está no horário
        }
    }
}
exports.AIService = AIService;
//# sourceMappingURL=ai.service.js.map