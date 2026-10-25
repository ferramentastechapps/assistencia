# Padrões de Qualidade e Governança de Código — ZapIA

## Comandos Canônicos de Validação

- **Checagem de Tipos (TypeScript):**
  - Backend: `cd backend && ./node_modules/.bin/tsc --noEmit`
  - Dashboard: `cd dashboard && ./node_modules/.bin/tsc --noEmit`
- **Linting Estático:**
  - Backend: `cd backend && npm run lint`
  - Dashboard: `cd dashboard && npm run lint`
- **Testes de Integração e Sanidade:**
  - `cd backend && node test_audit.js`
  - `cd backend && node test_auth_and_ai.js`
  - `cd backend && node test_tools.js`
- **Compilação e Build:**
  - Backend: `cd backend && npm run build`
  - Dashboard: `cd dashboard && npm run build`

## Regras de Qualidade e Boas Práticas

1. **TypeScript Estrito:** Todo código novo deve possuir tipagem explícita ou inferida de forma segura, sem uso de `any` injustificado.
2. **Limite de 350 Linhas:** Arquivos devem manter responsabilidade única, tendo 350 linhas como referência máxima para evitar componentes monolíticos e facilitar revisões isoladas.
3. **Validação de Fronteira:** Todas as entradas de rotas HTTP, webhooks e comandos de agentes de IA devem ser rigorosamente validadas via schemas Zod.
4. **Proteção Invariante de Domínio:** O backend mantém guardrails ativos em `modules/templates/templates.data.ts` e `modules/repairs/brands.validator.ts`. É expressamente proibido enfraquecer essas proteções para contornar validações.
5. **Auditoria de Dependências:** Manter dependências verificadas contra vulnerabilidades conhecidas (`npm audit`), tratando alertas de severidade alta ou crítica.

## Estratégia de Testes

- **Testes de Contrato e Ferramentas:** Verificam se as chamadas de funções da IA produzem JSON schemas válidos e respondem com os dados esperados do catálogo de celulares.
- **Testes de Autenticação e RBAC:** Garantem que rotas de administração e endpoints de webhook respeitem tokens JWT e segredos de assinatura.
- **Isolamento de Estado:** Testes executados localmente não devem persistir alterações destrutivas em bancos de produção ou enviar mensagens reais para números de clientes.

## Adaptação Nativa do Harness2

O projeto adota o método iterativo inspirado no Harness2:
- Execução de smoke tests locais para validar instruções dos agentes (`AGENTS.md`).
- Diagnósticos rápidos após alterações em schemas Prisma ou rotas Fastify.
- Comparação de hipóteses antes de refatorações de grande porte.

## Procedimento de Revisão de Segurança

O projeto adota o procedimento canônico do Toolkit descrito em `docs/security-review.md`. As auditorias são realizadas em modo leitura, com relatórios redigidos sem exposição de segredos e foco em superfícies expostas (webhooks, endpoints de autenticação e injeção de prompt).
