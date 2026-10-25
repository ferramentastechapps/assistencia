# Diretrizes de Design e Acessibilidade — ZapIA

## Direção Visual

O ZapIA foi concebido como uma ferramenta de alta densidade de informação para uso contínuo em balcões de atendimento e bancadas de técnicos de assistência técnica. O design prioriza:
- Leitura rápida de status de OS e mensagens de clientes.
- Contraste alto para ambientes iluminados de oficina.
- Responsividade otimizada para desktop e tablets.

## Sistema de Design e Tokens

- **Framework de Estilo:** Tailwind CSS 3.4.
- **Tipografia:** Fonte sem serifa de sistema (`Inter`, `-apple-system`, `sans-serif`).
- **Paleta de Cores:**
  - `primary`: Tons de azul e índigo para ações primárias e estados ativos.
  - `success`: Verde para OS concluída, WhatsApp conectado e orçamentos aprovados.
  - `warning`: Amarelo/laranja para peças aguardando chegada e orçamentos pendentes.
  - `danger`: Vermelho para falhas de conexão, OS canceladas ou alertas de segurança.
  - `neutral`: Escala de cinzas para fundos de cards, bordas e textos secundários.
- **Ícones:** Pacote `lucide-react` para representações visuais unificadas.

## Padrões de Interação e Acessibilidade

1. **HTML Semântico:** Uso explícito de `<main>`, `<nav>`, `<aside>`, `<header>`, `<table>` e botões com tipo definido (`type="button"` / `type="submit"`).
2. **Navegação por Teclado:** Elementos interativos com estados de foco visíveis (`focus:ring-2 focus:ring-offset-2`).
3. **Mensagens e Feedbacks Assíncronos:** Notificações via `react-hot-toast` para ações de gravação, exclusão e alteração de status.
4. **Tratamento de Estados:**
   - Telas de carregamento com esqueletos (skeletons) ou spinners discretos.
   - Telas vazias (empty states) instruindo o usuário sobre o próximo passo (ex: "Nenhuma OS cadastrada").
   - Mensagens de erro com indicação clara do problema sem expor stack traces.

## Manutenção

Qualquer alteração visual no dashboard deve seguir os utilitários já mapeados em `dashboard/tailwind.config.js` e `dashboard/app/globals.css`. Não adicionar dependências extras de componentes sem justificativa e alinhamento com a arquitetura lean.
