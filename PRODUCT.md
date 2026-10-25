# ZapIA — Especificação de Produto

## Problema e Objetivo

Assistências técnicas de smartphones e celulares enfrentam alto volume de atendimentos repetitivos no WhatsApp: triagem inicial, dúvidas sobre defeitos comuns (tela quebrada, conector com defeito, aparelho molhado), orçamentos prévios e acompanhamento de status de ordens de serviço (OS).

O ZapIA resolve esse gargalo automatizando o atendimento com uma IA especializada que:
1. Identifica a marca e o modelo do celular do cliente.
2. Faz diagnóstico prévio dos sintomas reportados.
3. Consulta o catálogo de serviços/peças e calcula estimativas de orçamento.
4. Consulta e atualiza o status de Ordens de Serviço.
5. Realiza o transbordo (handoff) para um atendente humano quando necessário.

## Público-Alvo e Papéis

- **Administrador / Proprietário da Oficina:** Gerencia planos, faturamento, integrações do WhatsApp e métricas de atendimento.
- **Técnico / Atendente:** Utiliza o inbox para atendimentos manuais, atualiza o pipeline de reparos e edita o catálogo de peças.
- **Cliente Final (WhatsApp):** Interage via mensagens de texto e áudio no WhatsApp para tirar dúvidas, orçar reparos e consultar o andamento da OS.

## Fluxos Principais (MVP)

1. **Recepção de Mensagens (Webhook Evolution API):**
   - O cliente envia uma mensagem para o número da assistência técnica.
   - O webhook Fastify recebe e normaliza a mensagem, associando ao tenant e à conversa ativa.
2. **Processamento Cognitivo e RAG:**
   - O módulo de IA processa o histórico recente com LangChain.
   - Consulta a base vetorial (`pgvector`) com manuais, políticas e FAQs da assistência.
   - Executa tools (consulta de marcas homologadas, status de OS, tabela de preços).
3. **Consulta e Gestão de Reparos:**
   - Consulta do status da OS por número ou telefone do cliente.
   - Movimentação de cards no kanban do dashboard (triagem, orçamento, aprovação, reparo, pronto para retirada).
4. **Handoff Humano:**
   - Ativação quando o cliente solicita falar com um atendente ou quando a IA detecta complexidade fora de escopo.
   - Pausa das respostas automáticas até o operador finalizar o atendimento manual.

## Fora de Escopo (Anti-Goals)

- Atendimento genérico para outros segmentos (restaurantes, clínicas, imobiliárias).
- Suporte a manutenção de outros equipamentos (notebooks, smart TVs, videogames).
- Customizações de regras que violem a restrição exclusiva do template `cellphone_repair`.

## Restrições e Decisões de Engenharia

- **Backend:** Node.js (v24), Fastify 4.28, TypeScript 5.6.
- **Banco de Dados:** PostgreSQL 16 com extensão `pgvector`.
- **ORM:** Prisma 5.19.1.
- **Frontend:** Next.js 14.2 (App Router), React 18.3, Tailwind CSS 3.4.
- **Mensageria WhatsApp:** Evolution API v2 conectado via WebSockets e Webhooks.
- **Cache e Filas:** Redis 7 via `ioredis`.

## Critérios de Aceitação

1. O backend trava na inicialização e rejeita requisições se qualquer template além de `cellphone_repair` for configurado.
2. O validador de marcas (`brands.validator.ts`) restringe e normaliza consultas para marcas de smartphones reconhecidas.
3. Todas as rotas de API possuem validação estrita com schemas Zod.
4. O dashboard permite login de tenant, visualização de conversas em tempo real via Socket.io e gestão de OS.
