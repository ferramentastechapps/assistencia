# Setup e Evidências de Adoção do Toolkit — ZapIA

## Origem e Contexto

- **Data da Verificação/Adoção:** 23 de outubro de 2026.
- **Revisão do Toolkit Upstream:** `790a895304e0c08b70a5b215c9d334f1c86b816c` (branch `main`).
- **Repositório Origem do Toolkit:** `https://github.com/soumatheusgomes/vibe-coding-toolkit`.
- **Produto:** ZapIA — SaaS multi-tenant de atendimento WhatsApp com IA exclusivo para assistência técnica de celulares.
- **Client de IA:** Claude Code (extensão nativa VS Code).
- **Runtimes e Ferramental:** Node.js v24.22.0, npm 12.2.0, TypeScript 5.6.2, Fastify 4.28, Next.js 14.2, Prisma ORM 5.19, Docker Compose.
- **Política de Subagentes:** Modelos leves para leituras, buscas mecânicas e inventários; modelo principal para integridade arquitetural, segurança, validação de nicho e esquemas de dados.

## Decisões e Fontes Consultadas

1. **Harness Canônico:** Implementado conjunto canônico de instruções e documentos do manifesto (`AGENTS.md`, `CLAUDE.md`, `PRODUCT.md`, e pasta `docs/`).
2. **Preservação Rígida de Domínio:** O nicho de assistência técnica de smartphones (`cellphone_repair`) é tratado como invariante fundamental de arquitetura. Bloqueios de runtime em `templates.data.ts` e `brands.validator.ts` foram mantidos e documentados.
3. **Padrão de Qualidade Lean (Ponytail Full):** Modificações pontuais e mínimas, sem introduzir abstrações especulativas ou bibliotecas desnecessárias.
4. **Comunicação Concisa (Caveman):** Respostas técnicas diretas e sem floreios para o usuário em português, preservando redação formal e detalhada nos arquivos do repositório.

## Matriz de Cobertura do Catálogo

| Componente | Ação e Justificativa | Escopo | Estado e Evidência |
|---|---|---|---|
| `AGENTS.md` | Criado adaptando template oficial | Projeto | Presente na raiz com comandos canônicos e acordos |
| `CLAUDE.md` | Criado integrando `@AGENTS.md` | Projeto | Presente na raiz |
| `PRODUCT.md` | Criado com escopo, personas e regras do nicho | Projeto | Presente na raiz |
| `docs/architecture.md` | Criado com mapa de código e fronteiras | Projeto | Presente em `docs/architecture.md` |
| `docs/design.md` | Criado com tokens Tailwind e acessibilidade | Projeto | Presente em `docs/design.md` |
| `docs/onboarding.md` | Criado com guia de setup local e Docker | Projeto | Presente em `docs/onboarding.md` |
| `docs/quality.md` | Criado com comandos e limite de 350 linhas | Projeto | Presente em `docs/quality.md` |
| `docs/setup.md` | Criado para rastreabilidade de evidências | Projeto | Este documento |
| `docs/security-review.md` | Protocolo Prompt 13 adotado | Projeto | Presente em `docs/security-review.md` |
| `01 Superpowers` | Reutilizado do ambiente global | Usuário | Skills `brainstorming`, `writing-plans`, etc. ativas |
| `02 Subagents` | Documentada disciplina de delegação | Projeto | Regras registradas em `AGENTS.md` |
| `03 RTK` | Declarado inaplicável (ausente no host) | - | Saída padrão de terminal mantida sem wrappers |
| `04 Ponytail` | Reutilizado do ambiente global | Usuário | Configuração ativa com intensidade `full` |
| `05 Caveman` | Reutilizado na sessão | Usuário | Estilo conciso ativo em português |
| `06 ESLint / Quality Gates` | Configurado no backend e dashboard | Projeto | `backend/.eslintrc.json` criado; dependências no devDependencies |
| `07 Graphify` | Reutilizado sob demanda | Usuário | Disponível via comando `/graphify` |
| `08 Obsidian Memory` | Inaplicável | - | Contexto persistente gerido em `docs/` e memória Claude |
| `09 Claude Memory System` | Reutilizado | Usuário | Memória persistente ativa no workspace |
| `10 Hooks` | Reutilizado | Usuário | Hooks de sessão mantidos sem duplicação |
| `11 agent-browser` | Reutilizado | Usuário | Skill disponível para validações web |
| `12 Context7` | Reutilizado | Usuário | MCP disponível para documentação atualizada de libs |
| `13 Anthropic Skills` | Reutilizado | Usuário | Catálogo oficial disponível no host |
| `14 Chrome DevTools MCP` | Inaplicável | - | Não configurado; `agent-browser` cobre as necessidades |
| `15 Codex Workflow` | Inaplicável | - | Host ativo é Claude Code |
| `16 Vercel Skills` | Reutilizado | Usuário | Diretrizes de React/Next disponíveis |
| `17 Next.js Runtime/Bundle` | Integrado via diretrizes | Projeto | Documentado em `docs/quality.md` |
| `18 PostgreSQL Skills` | Prisma ORM + pgvector documentados | Projeto | Diretrizes registradas em `docs/architecture.md` |
| `19 gh-fix-ci` | Inaplicável | - | Repositório sem workflows de CI do GitHub Actions |
| `20 Security Review` | Adotado procedimento canônico | Projeto | `docs/security-review.md` integrado |
| `21 shadcn/ui` | Inaplicável | - | Dashboard utiliza Tailwind CSS com componentes nativos |
| `22 Sentry MCP` | Inaplicável | - | Sem conta ou projeto Sentry configurados |
| `23 Harness2` | Adaptado nativamente | Projeto | Procedimento e smoke tests documentados |

## Documentação Criada e Consolidada

- Raiz: `AGENTS.md`, `CLAUDE.md`, `PRODUCT.md`, `README.md` (atualizado com ponte de links).
- Pasta `docs/`: `architecture.md`, `design.md`, `onboarding.md`, `quality.md`, `setup.md`, `security-review.md`.
- Documentos pré-existentes preservados intactos: `CONFIGURACAO_ASSISTENCIA_TECNICA.md`, `MUDANCAS_APLICADAS.md`, `RECOMENDACOES_FOCO_EXCLUSIVO.md`, `RESUMO_EXECUTIVO.md`.

## Verificação Comparativa (Antes vs. Depois)

| Item | Antes do Setup | Depois do Setup | Evidência |
|---|---|---|---|
| **Harness Canônico** | Ausente | Completo (9 destinos mapeados) | Arquivos criados e validados |
| **Backend TypeScript** | Passando | Passando | `./node_modules/.bin/tsc` compilação limpa em `backend/dist` |
| **Backend ESLint** | Falhando (comando inexistente) | Configurado | `backend/.eslintrc.json` criado |
| **Dashboard Node Modules**| Ausente | Instalado | `dashboard/node_modules` gerado via `npm install` |
| **Dashboard Lint** | Falhando (sem dependências e com erros) | Passando (0 erros) | `next lint` executado com sucesso após correção de entidades não escapadas em `dashboard/app/page.tsx` |
| **Ponte de IA (Claude/Codex)**| Ausente | `CLAUDE.md` apontando para `AGENTS.md` | Arquivo verificado na raiz |
| **Protocolo de Segurança**| Ausente | Disponível em `docs/security-review.md` | Rastreabilidade do Prompt 13 |

## Próximos Passos e Manutenção

1. Iniciar os serviços locais via Docker (`docker compose up postgres redis evolution-api -d`) para testes ponta a ponta com banco real.
2. Manter atualizados os arquivos de `docs/` sempre que novos endpoints, migrações do Prisma ou regras de negócio forem introduzidos.
3. Executar o protocolo de segurança de `docs/security-review.md` antes de deploys em produção.
