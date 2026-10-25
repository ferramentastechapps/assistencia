# Arquitetura e Engenharia de Sistema — ZapIA

## Stack Observada

- **Runtime & Plataforma:** Node.js v24.22 LTS, ambiente Linux Ubuntu (VPS) e Windows x64 (dev).
- **Backend:** Fastify 4.28, TypeScript 5.6, Zod 3.23, LangChain.js 0.3, Socket.io 4.7.
- **Banco de Dados & ORM:** PostgreSQL 16 com extensão `pgvector`, acessado via Prisma ORM 5.19.1.
- **Cache & Filas:** Redis 7 com cliente `ioredis` 5.4.
- **Frontend / Dashboard:** Next.js 14.2 (App Router), React 18.3, Tailwind CSS 3.4, Zustand 5.0, Axios, Recharts.
- **WhatsApp Gateway:** Evolution API v2 (instância multi-tenant).
- **Proxy Reverso & Infra:** Nginx com terminação SSL (Let's Encrypt), Docker Compose.

## Mapa da Base de Código

```
zapia-system/
├── AGENTS.md                  # Instruções canônicas de operação para agentes AI
├── CLAUDE.md                  # Ponto de entrada do Claude Code (@AGENTS.md)
├── PRODUCT.md                 # Definição de escopo, regras de negócio e MVP
├── README.md                  # Visão geral e instruções operacionais
├── docker-compose.yml         # Orquestração local/VPS (Postgres, Redis, Evolution, Backend, Dashboard)
├── nginx/                     # Configurações do Nginx e proxy reverso
├── docs/                      # Documentação canônica do toolkit
│   ├── architecture.md        # Este documento
│   ├── design.md              # Padrões visuais e acessibilidade
│   ├── onboarding.md          # Setup local e ambiente de desenvolvimento
│   ├── quality.md             # Comandos de teste, lint e limites de código
│   ├── setup.md               # Registro de evidências e adoção do toolkit
│   └── security-review.md     # Procedimento padronizado de auditoria de segurança
├── backend/                   # API Fastify e serviços em TypeScript
│   ├── prisma/                # Schema do banco relacional + vetorial
│   ├── src/
│   │   ├── config/            # Variáveis de ambiente e validações
│   │   ├── database/          # Cliente Prisma e migrações
│   │   ├── middleware/        # Autenticação JWT, rate limit e segurança
│   │   ├── redis/             # Cliente Redis e locks distribuídos
│   │   └── modules/           # Módulos de domínio
│   │       ├── ai/            # Chains LangChain, prompts e RAG
│   │       ├── analytics/     # Métricas de conversas e OS
│   │       ├── auth/          # Autenticação e gestão de usuários/tenants
│   │       ├── billing/       # Planos e assinaturas
│   │       ├── catalog/       # Peças e serviços de celulares
│   │       ├── conversations/ # Histórico de chat e inbox
│   │       ├── knowledge/     # Embeddings e manuais técnicos
│   │       ├── repairs/       # Gestão de Ordens de Serviço e marcas
│   │       ├── templates/     # Guardrail rígido do nicho cellphone_repair
│   │       ├── webhooks/      # Recebimento de eventos da Evolution API
│   │       └── whatsapp/      # Envio de mensagens e controle de instâncias
└── dashboard/                 # Frontend Next.js (App Router)
    ├── app/
    │   ├── (auth)/            # Telas de login e recuperação
    │   ├── (tenant)/          # Dashboard autenticado multi-tenant
    │   │   ├── dashboard/     # Visão geral e KPIs
    │   │   ├── inbox/         # Chat em tempo real
    │   │   ├── pipeline/      # Kanban de OS
    │   │   ├── repairs/       # Tabela de ordens de serviço
    │   │   ├── catalog/       # Tabela de preços e serviços
    │   │   └── knowledge/     # Upload e gestão da base vetorial
    │   ├── layout.tsx         # Layout raiz
    │   └── globals.css        # Configurações Tailwind e variáveis de tema
    └── lib/                   # Utilitários, hooks e clientes de API
```

## Fronteiras e Fluxo de Dados

1. **Entrada de Mensagens:**
   - WhatsApp -> Evolution API -> Nginx (`/webhooks/evolution`) -> `backend/src/modules/webhooks/evolution.routes.ts`.
2. **Processamento Assíncrono:**
   - O webhook despacha o processamento para a fila/lock no Redis para garantir ordem sequencial por contato.
   - O módulo de IA (`modules/ai`) constrói o contexto recuperando fragmentos via busca de similaridade de cosseno em `modules/knowledge` (`pgvector`).
   - A IA aciona tools (busca de OS em `modules/repairs` e tabela de preços em `modules/catalog`).
3. **Persistência:**
   - O Prisma grava conversas, mensagens e mudanças de estado no PostgreSQL.
4. **Interface do Operador:**
   - O dashboard Next.js se conecta via REST ao backend para carregar dados e via WebSocket (Socket.io) para atualizações instantâneas do chat e movimentação de cards de reparo.

## Decisões Arquiteturais Registradas

1. **Prisma ORM com pgvector:** Escolhido pela facilidade de manutenção de tipagem estática e suporte nativo a extensões PostgreSQL para busca vetorial.
2. **Fastify em vez de Express:** Escolhido pela performance de throughput e suporte integrado a schemas Zod e TypeScript.
3. **Isolamento de Nicho em Runtime:** Implementado bloqueio explícito em `templates.data.ts` que impede a execução do servidor caso outro nicho comercial seja configurado.
