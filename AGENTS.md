# ZapIA — Sistema SaaS de Atendimento WhatsApp com IA para Assistência Técnica

## Product and stack

- Product and scope: `PRODUCT.md`. Exclusivo para assistências técnicas de celulares e smartphones.
- Stack:
  - Backend: Node.js (v24), Fastify 4.28, TypeScript 5.6, Prisma ORM 5.19, PostgreSQL 16 + pgvector, Redis 7, LangChain 0.3, Socket.io 4.7, Zod 3.23.
  - Frontend: Next.js 14.2 (App Router), React 18.3, Tailwind CSS 3.4, Zustand 5.0, Axios, Recharts.
  - WhatsApp: Evolution API v2.
  - Infraestrutura: Docker Compose, Nginx, Let's Encrypt.
- Setup and validations: `docs/setup.md`.

## Canonical commands

- Install:
  - Backend: `cd backend && npm install`
  - Dashboard: `cd dashboard && npm install`
- Develop:
  - Backend: `cd backend && npm run dev`
  - Dashboard: `cd dashboard && npm run dev`
- Lint:
  - Backend: `cd backend && npm run lint`
  - Dashboard: `cd dashboard && npm run lint`
- Types:
  - Backend: `cd backend && ./node_modules/.bin/tsc --noEmit`
  - Dashboard: `cd dashboard && ./node_modules/.bin/tsc --noEmit`
- Tests:
  - Backend audit/auth tests: `cd backend && node test_auth_and_ai.js` e `node test_tools.js`
- Build:
  - Backend: `cd backend && npm run build`
  - Dashboard: `cd dashboard && npm run build`
- Verify foundation:
  - Checagem completa de tipos e lint em ambos os módulos.

## Working agreements

- Read relevant code and instructions before editing. State assumptions that affect behavior or scope.
- Complete the request with the smallest sufficient change. Reuse existing patterns, components, and dependencies.
- Preserve local changes, validation, error handling, security, accessibility, and explicit requirements.
- Strictly maintain the core business rule: nicho exclusivo de assistência técnica de celulares (não generalizar nem admitir outros templates de negócio).
- Do not create abstractions, architecture, options, dependencies, or features for unrequested needs.
- Run appropriate checks. Test relevant logic and regressions; trivial changes do not need tests that merely mirror the implementation.
- Do not turn assumptions into facts or pending integrations into simulated results.
- Continue authorized work. Ask only for essential information or actions outside the authorization.
- Publishing, messaging third parties, costs, and destructive actions require relevant authorization. Installing tools does not grant it.

## Execution continuity

- During authorized work, answer status questions and resume the remaining actions. Stop if the user asks to pause, cancels, or changes the objective. Without ongoing execution, an informational request ends with the answer.
- A blocker stops only dependent tasks. Complete independent tasks that remain safe and authorized; before stopping, check for executable actions still in scope.
- If an agent fails or its state becomes uncertain, confirm it has stopped before taking over its files. Inspect partial changes and resume from a verified point, without concurrent writers.
- Do not repeat an identical attempt without new evidence. Respect cost, time, and retry limits, explicit gates, and denials; earlier decisions do not expand authorization.
- When resuming from a handoff, check actual files, Git state, checks, and processes. Claim background execution only when an active process, agent, or automation can be verified.
- For unfinished multi-session work, keep a short handoff in the existing plan/task record: objective, verified state, checks, pending work, blockers, owned resources, and next action. Do not turn temporary progress into permanent memory.
- Without a safe alternative, report the blocker, completed work, and what is needed to resume; do not present pending work as results or promise automatic continuation.

## Standards and documentation

- Persistence: Prisma ORM + PostgreSQL 16 com extensão `pgvector`. Migrations gerenciadas via `prisma migrate deploy` ou `prisma db push`.
- Database access: Conexão centralizada no backend via `src/database/prisma.ts`. Sem acesso direto ao banco a partir do frontend.
- Validation: Zod schemas para todas as entradas HTTP, webhooks e payloads de agentes.
- Logging: Structured server logs com níveis adequados, sem vazar tokens JWT ou chaves de API.
- File modularity: Referência do toolkit de 350 linhas por arquivo. Componentes ou rotas com responsabilidade bem delimitada.
- Documentation map:
  - `PRODUCT.md`: escopo, regras de negócio, personas e critérios de aceitação.
  - `docs/architecture.md`: estrutura, rotas, diagramas e fronteiras.
  - `docs/design.md`: tokens Tailwind, layouts e acessibilidade do dashboard.
  - `docs/onboarding.md`: preparação de ambiente, Docker e execução local.
  - `docs/quality.md`: comandos de validação, qualidade e gates.
  - `docs/setup.md`: matriz de componentes do toolkit, deltas e evidências.
  - `docs/security-review.md`: modelo e procedimento de revisão de segurança.

## Tools and style

- **Ponytail:** filosofia de desenvolvimento lean em intensidade `full`. Modificações mínimas e objetivas.
- **Caveman:** respostas concisas em português para o usuário. Código, documentação e mensagens de commit em linguagem formal e completa.
- **Superpowers:** planejamento proporcional com fases de diagnóstico, especificação e entrega.
- **Context7:** consulta de documentação atualizada para Fastify, Next.js, Prisma, Tailwind e Evolution API.
- **Graphify:** mapeamento de dependências via `/graphify` sob demanda, sem expor credenciais.
- **Subagents & Models:** delegação disciplinada. Tarefas mecânicas e leitura usam modelos mais leves; arquitetura, segurança e integridade de dados usam modelos principais.

## Conventions and context

- Backend modular em `backend/src/modules/` (auth, ai, repairs, templates, catalog, conversations, knowledge, webhooks, whatsapp).
- Dashboard Next.js em `dashboard/app/(auth)` e `dashboard/app/(tenant)`.
- Foco absoluto na proteção do nicho de assistência técnica de celular (`cellphone_repair`).
