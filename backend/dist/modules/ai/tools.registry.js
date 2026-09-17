"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.agentToolsService = exports.AgentToolsService = exports.AVAILABLE_TOOLS = void 0;
const prisma_1 = require("../../database/prisma");
const evolution_client_1 = require("../whatsapp/evolution.client");
exports.AVAILABLE_TOOLS = [
    {
        name: 'scheduleMeeting',
        description: 'Agenda um horário, reunião ou atendimento técnico para o cliente quando ele solicitar.',
        parameters: {
            type: 'object',
            properties: {
                date: { type: 'string', description: 'Data do agendamento (formato AAAA-MM-DD ou texto como amanhã, segunda)' },
                time: { type: 'string', description: 'Horário do agendamento (ex: 14:00, 10:30)' },
                notes: { type: 'string', description: 'Motivo do agendamento ou serviço desejado' }
            },
            required: ['date', 'time']
        }
    },
    {
        name: 'checkRepairQuote',
        description: 'Consulta a tabela de orçamentos de referência da loja para um modelo de celular e tipo de serviço específico (tela, bateria, conector, etc.). Use para passar estimativas de valor para o cliente.',
        parameters: {
            type: 'object',
            properties: {
                brand: { type: 'string', description: 'Marca do celular (Apple, Samsung, Motorola, Xiaomi, etc.)' },
                model: { type: 'string', description: 'Modelo exato do celular (ex: iPhone 13, Galaxy A54, Redmi Note 12)' },
                serviceType: { type: 'string', description: 'Tipo de serviço: Tela Original, Tela Premium, Bateria, Conector de Carga, Desoxidação, Câmera, Alto-falante, etc.' }
            },
            required: ['brand', 'model', 'serviceType']
        }
    },
    {
        name: 'checkRepairOrderStatus',
        description: 'Consulta o status atual da Ordem de Serviço (OS) de um cliente pelo número da OS ou pelo telefone dele. Use quando o cliente perguntar "como está meu celular?" ou "qual o status do meu conserto?".',
        parameters: {
            type: 'object',
            properties: {
                query: { type: 'string', description: 'Número da OS (ex: OS-1001) ou número de telefone do cliente' }
            },
            required: ['query']
        }
    },
    {
        name: 'searchPhoneCatalog',
        description: 'Busca aparelhos disponíveis no catálogo da loja para venda. Use quando o cliente perguntar sobre celulares à venda, modelos específicos, preços, ou pedir recomendações de aparelhos por faixa de preço.',
        parameters: {
            type: 'object',
            properties: {
                brand: { type: 'string', description: 'Marca desejada (Apple, Samsung, Motorola, Xiaomi) - opcional' },
                maxPrice: { type: 'number', description: 'Orçamento máximo do cliente em reais - opcional' },
                search: { type: 'string', description: 'Termo de busca livre (ex: "iPhone 13", "bom custo benefício", "com 128GB")' }
            },
            required: []
        }
    },
    {
        name: 'evaluateTradeInPhone',
        description: 'Calcula o valor estimado de avaliação do celular usado do cliente para troca (trade-in) como entrada na compra de um novo ou seminovo. Use quando o cliente quiser trocar o celular dele por outro.',
        parameters: {
            type: 'object',
            properties: {
                brand: { type: 'string', description: 'Marca do celular a ser avaliado (Apple, Samsung, Motorola, Xiaomi, etc.)' },
                model: { type: 'string', description: 'Modelo exato do celular usado (ex: iPhone 11, Galaxy A53)' },
                storage: { type: 'string', description: 'Capacidade de armazenamento (64GB, 128GB, 256GB, etc.)' },
                batteryHealth: { type: 'number', description: 'Porcentagem de saúde da bateria (0-100). Obtenha com o cliente se possível.' },
                condition: { type: 'string', description: 'Estado do aparelho: Excelente (sem marcas, sem defeito), Bom (marcas leves, funcional), Regular (arranhões, funcional), Com defeito (tela trincada, não liga, etc.)' }
            },
            required: ['brand', 'model', 'condition']
        }
    },
    {
        name: 'sendCatalogPdf',
        description: 'Envia o catálogo ou documento em PDF oficial da empresa quando o cliente pedir catálogo, tabela de preços ou apresentação.',
        parameters: {
            type: 'object',
            properties: {
                documentName: { type: 'string', description: 'Nome ou assunto do documento solicitado (opcional)' }
            },
            required: []
        }
    },
    {
        name: 'generatePixCharge',
        description: 'Gera uma chave ou cobrança Pix para o cliente pagar um serviço de conserto, produto ou entrada de trade-in.',
        parameters: {
            type: 'object',
            properties: {
                amount: { type: 'number', description: 'Valor da cobrança em reais (ex: 299.90, 150.00)' },
                description: { type: 'string', description: 'Descrição do item a ser pago (ex: Troca de tela iPhone 13, Entrada trade-in Galaxy S23)' }
            },
            required: ['amount', 'description']
        }
    }
];
class AgentToolsService {
    /**
     * Executa a ferramenta solicitada pelo agente
     */
    async executeTool(toolName, args, context) {
        try {
            switch (toolName) {
                case 'scheduleMeeting':
                    return await this.handleSchedule(args, context);
                case 'checkRepairQuote':
                    return await this.handleRepairQuote(args, context);
                case 'checkRepairOrderStatus':
                    return await this.handleRepairOrderStatus(args, context);
                case 'searchPhoneCatalog':
                    return await this.handlePhoneCatalogSearch(args, context);
                case 'evaluateTradeInPhone':
                    return await this.handleTradeInEvaluation(args, context);
                case 'sendCatalogPdf':
                    return await this.handleSendCatalog(args, context);
                case 'generatePixCharge':
                    return await this.handleGeneratePix(args, context);
                default:
                    return `Ferramenta ${toolName} não reconhecida.`;
            }
        }
        catch (error) {
            console.error(`Erro ao executar tool ${toolName}:`, error);
            return `Erro ao executar ação: ${error.message || error}`;
        }
    }
    async handleSchedule(args, context) {
        await prisma_1.prisma.message.create({
            data: {
                conversationId: context.conversationId,
                role: 'INTERNAL_NOTE',
                content: `📅 [AGENDAMENTO PELA IA] Data: ${args.date} às ${args.time} - Detalhes: ${args.notes || 'Não informado'}`,
                isFromWhatsApp: false
            }
        });
        return `Agendamento pré-reservado para ${args.date} às ${args.time}. Um técnico confirmará os detalhes se necessário.`;
    }
    async handleRepairQuote(args, context) {
        const quotes = await prisma_1.prisma.repairQuoteCatalog.findMany({
            where: {
                tenantId: context.tenantId,
                isActive: true,
                brand: { contains: args.brand, mode: 'insensitive' },
                serviceType: { contains: args.serviceType, mode: 'insensitive' }
            },
            orderBy: { priceMin: 'asc' }
        });
        if (quotes.length === 0) {
            return `[SEM_TABELA] Não encontrei preço cadastrado para ${args.brand} ${args.model} - ${args.serviceType}. O técnico precisará avaliar pessoalmente o aparelho para passar um orçamento.`;
        }
        // Filtrar pelo modelo mais próximo
        const modelMatch = quotes.find(q => q.modelPattern === '*' ||
            args.model.toLowerCase().includes(q.modelPattern.toLowerCase()) ||
            q.modelPattern.toLowerCase().includes(args.model.toLowerCase())) || quotes[0];
        const priceRange = modelMatch.priceMin === modelMatch.priceMax
            ? `R$ ${modelMatch.priceMin.toFixed(2).replace('.', ',')}`
            : `R$ ${modelMatch.priceMin.toFixed(2).replace('.', ',')} a R$ ${modelMatch.priceMax.toFixed(2).replace('.', ',')}`;
        return `[ORÇAMENTO_CONSULTADO] ${args.brand} ${args.model} — ${args.serviceType}: ${priceRange} | Prazo: ${modelMatch.averageTime} | Garantia: ${modelMatch.warrantyDays} dias${modelMatch.notes ? ` | Obs: ${modelMatch.notes}` : ''}`;
    }
    async handleRepairOrderStatus(args, context) {
        const order = await prisma_1.prisma.repairOrder.findFirst({
            where: {
                tenantId: context.tenantId,
                OR: [
                    { orderNumber: { contains: args.query.replace(/\D/g, ''), mode: 'insensitive' } },
                    { customerPhone: { contains: args.query.replace(/\D/g, '') } }
                ]
            },
            orderBy: { createdAt: 'desc' }
        });
        if (!order) {
            return `[OS_NAO_ENCONTRADA] Não encontrei nenhuma ordem de serviço com essa informação (${args.query}). O cliente pode verificar o número da OS na nota ou ordem impressa que recebeu.`;
        }
        const statusLabels = {
            TRIAGEM: '🔵 Em Triagem (aguardando avaliação)',
            EM_ANALISE: '🔍 Em Análise na Bancada',
            AGUARDANDO_PECA: '📦 Aguardando Chegada de Peça',
            EM_CONSERTO: '🔧 Em Reparo na Bancada',
            PRONTO: '✅ PRONTO PARA RETIRADA! 🎉',
            ENTREGUE: '🤝 Entregue ao Cliente',
            SEM_CONSERTO: '❌ Sem Conserto Possível'
        };
        const statusLabel = statusLabels[order.status] || order.status;
        const delivery = order.estimatedDelivery
            ? ` | Previsão de entrega: ${new Date(order.estimatedDelivery).toLocaleDateString('pt-BR')}`
            : '';
        return `[STATUS_OS] ${order.orderNumber} — ${order.deviceBrand} ${order.deviceModel} de ${order.customerName}: ${statusLabel}${delivery}`;
    }
    async handlePhoneCatalogSearch(args, context) {
        const where = { tenantId: context.tenantId, isAvailable: true, stock: { gt: 0 } };
        if (args.brand)
            where.brand = { contains: args.brand, mode: 'insensitive' };
        if (args.maxPrice)
            where.cashPrice = { lte: args.maxPrice };
        if (args.search) {
            where.OR = [
                { title: { contains: args.search, mode: 'insensitive' } },
                { model: { contains: args.search, mode: 'insensitive' } },
                { description: { contains: args.search, mode: 'insensitive' } },
            ];
        }
        const products = await prisma_1.prisma.phoneProduct.findMany({
            where,
            orderBy: [{ isFeatured: 'desc' }, { cashPrice: 'asc' }],
            take: 5
        });
        if (products.length === 0) {
            return `[SEM_ESTOQUE] Não encontrei aparelhos disponíveis com esse filtro no momento. O cliente pode descrever melhor o que procura (faixa de preço, marca, características).`;
        }
        const productList = products.map(p => {
            const installmentInfo = p.installmentPrice
                ? ` | Cartão: 12x de R$ ${(p.installmentPrice / 12).toFixed(2).replace('.', ',')}`
                : '';
            const batteryInfo = p.batteryHealth ? ` | Bateria: ${p.batteryHealth}%` : '';
            const storageInfo = p.storage ? ` | ${p.storage}` : '';
            return `• *${p.title}*${storageInfo}${batteryInfo} — Pix/Dinheiro: R$ ${p.cashPrice.toFixed(2).replace('.', ',')}${installmentInfo} | Garantia: ${p.warrantyMonths} meses`;
        }).join('\n');
        return `[CATÁLOGO] Aparelhos disponíveis:\n${productList}`;
    }
    async handleTradeInEvaluation(args, context) {
        // Importar e usar a calculadora de trade-in
        // Valores base simplificados para uso direto na tool
        const baseValues = {
            'Apple': { 'iPhone 15': 3500, 'iPhone 14': 2400, 'iPhone 13': 2000, 'iPhone 12': 1500, 'iPhone 11': 1200, 'iPhone X': 700 },
            'Samsung': { 'Galaxy S23': 2300, 'Galaxy S22': 1700, 'Galaxy A54': 900, 'Galaxy A34': 650, 'Galaxy A53': 700 },
            'Motorola': { 'Edge 50': 1800, 'Moto G84': 700, 'Moto G54': 550, 'Moto G73': 600, 'Moto G53': 450 },
            'Xiaomi': { 'Redmi Note 13': 800, 'Redmi Note 12': 600, 'Poco X6': 1200 }
        };
        const brandData = baseValues[args.brand] || {};
        let base = Object.entries(brandData).find(([k]) => args.model.toLowerCase().includes(k.toLowerCase()))?.[1] ?? 500;
        const condMultipliers = {
            'Excelente': 0.88, 'Bom': 0.72, 'Regular': 0.52, 'Com defeito': 0.28
        };
        let value = base * (condMultipliers[args.condition] ?? 0.60);
        if (args.batteryHealth && args.batteryHealth < 85) {
            value *= (1 - Math.max(0, (85 - args.batteryHealth) * 0.015));
        }
        if (args.storage?.includes('256'))
            value *= 1.08;
        if (args.storage?.includes('512'))
            value *= 1.18;
        const min = Math.round(value * 0.90 / 50) * 50;
        const max = Math.round(value * 1.10 / 50) * 50;
        await prisma_1.prisma.tradeInSimulation.create({
            data: {
                tenantId: context.tenantId,
                brand: args.brand,
                model: args.model,
                storage: args.storage,
                batteryHealth: args.batteryHealth,
                condition: args.condition,
                estimatedMin: min,
                estimatedMax: max,
                conversationId: context.conversationId,
            }
        });
        return `[TRADE_IN] ${args.brand} ${args.model}${args.storage ? ' ' + args.storage : ''} em condição "${args.condition}": avaliação estimada de R$ ${min.toLocaleString('pt-BR')} a R$ ${max.toLocaleString('pt-BR')} como entrada na compra de um aparelho novo ou seminovo.`;
    }
    async handleSendCatalog(args, context) {
        const doc = await prisma_1.prisma.knowledgeDocument.findFirst({
            where: { tenantId: context.tenantId, type: 'PDF' },
            orderBy: { createdAt: 'desc' }
        });
        if (doc?.url) {
            await evolution_client_1.evolutionClient.sendMedia(context.instanceName, context.remoteJid, doc.url, 'document', doc.title, `${doc.title}.pdf`);
            return `Catálogo "${doc.title}" enviado com sucesso no WhatsApp.`;
        }
        return 'Catálogo localizado. As informações detalhadas já estão na base de conhecimento.';
    }
    async handleGeneratePix(args, context) {
        const formattedVal = Number(args.amount).toFixed(2).replace('.', ',');
        return `💳 *Cobrança Pix Gerada*\nValor: R$ ${formattedVal}\nReferência: ${args.description}\n\nChave Pix para pagamento: financeiro@suaassistencia.com\n_Após o pagamento, envie o comprovante por aqui._`;
    }
}
exports.AgentToolsService = AgentToolsService;
exports.agentToolsService = new AgentToolsService();
//# sourceMappingURL=tools.registry.js.map