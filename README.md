# ZapIA 🤖 — Sistema SaaS de Atendimento WhatsApp com IA

Sistema profissional e multi-tenant de atendimento ao cliente via WhatsApp, com Inteligência Artificial generativa, base de conhecimento customizável (RAG), handoff inteligente IA↔Humano e dashboard completo.

---

## 🏗️ Arquitetura

```
Internet → Nginx (SSL) → Dashboard (Next.js :3000)
                       → Backend API (Fastify :3001)
                       → Evolution API (WhatsApp :8080)
```

**Stack completo:**
- **Backend:** Node.js + Fastify + TypeScript
- **IA:** LangChain.js + RAG (pgvector) + OpenRouter
- **WhatsApp:** Evolution API v2
- **Banco:** PostgreSQL 16 + pgvector
- **Cache/Estado:** Redis 7
- **Frontend:** Next.js 14 + Tailwind CSS
- **Infra:** Docker Compose + Nginx + Let's Encrypt

---

## 🚀 Deploy no VPS (Ubuntu 24.04)

### Pré-requisitos
- VPS Ubuntu 24.04 LTS com pelo menos 2GB RAM
- Domínio apontando para o IP do VPS
- Chave de API do OpenRouter

### 1. Subir os arquivos para o VPS
```bash
# No seu computador local:
scp -r ./zapia user@SEU_IP_VPS:/tmp/zapia
```

### 2. Executar o script de setup
```bash
# No VPS:
sudo bash /tmp/zapia/scripts/setup-vps.sh
```

O script instala Docker, configura firewall, copia os arquivos e sobe os containers automaticamente.

### 3. Configurar as variáveis de ambiente
```bash
sudo nano /opt/zapia/.env
```

Preencha com suas informações:
```env
DOMAIN=seudominio.com.br
SSL_EMAIL=seu@email.com
OPENROUTER_API_KEY=sk-or-v1-SUACHAVE
JWT_SECRET=$(openssl rand -base64 64)
POSTGRES_PASSWORD=senha_forte_aqui
REDIS_PASSWORD=senha_forte_aqui
EVOLUTION_API_KEY=chave_forte_aqui
APP_URL=https://seudominio.com.br
BACKEND_URL=https://api.seudominio.com.br
EVOLUTION_SERVER_URL=https://wa.seudominio.com.br
```

### 4. Configurar DNS
No painel do seu provedor de domínio, crie:
```
A  seudominio.com.br      → IP_DO_VPS
A  api.seudominio.com.br  → IP_DO_VPS
A  wa.seudominio.com.br   → IP_DO_VPS
```

### 5. Instalar SSL (após DNS propagar ~5 min)
```bash
cd /opt/zapia
docker compose --profile ssl run certbot
docker compose restart nginx
```

### 6. Acessar o sistema
- **Dashboard:** https://seudominio.com.br
- **Login inicial:** admin@zapia.com / admin123456 ⚠️ TROQUE IMEDIATAMENTE

---

## 💻 Desenvolvimento Local

### Pré-requisitos
- Node.js 20+
- Docker Desktop

### Instalar dependências
```bash
# Backend
cd backend && npm install

# Dashboard  
cd dashboard && npm install
```

### Subir serviços locais
```bash
# Na raiz do projeto:
docker compose up postgres redis evolution-api -d
```

### Rodar em desenvolvimento
```bash
# Terminal 1 — Backend
cd backend
npx prisma migrate dev --name init
npx prisma db seed
npm run dev

# Terminal 2 — Dashboard
cd dashboard
npm run dev
```

Acesse: http://localhost:3000

---

## 📁 Estrutura do Projeto

```
zapia/
├── docker-compose.yml          # Orquestração de todos os serviços
├── .env.example                # Variáveis de ambiente (copie para .env)
├── nginx/
│   └── nginx.conf              # Proxy reverso + SSL
├── scripts/
│   └── setup-vps.sh            # Setup automatizado do VPS
├── backend/                    # API Node.js + Fastify
│   ├── prisma/
│   │   ├── schema.prisma       # Schema do banco (multi-tenant + pgvector)
│   │   └── seed.ts             # Dados iniciais
│   └── src/
│       ├── config/             # Configurações centralizadas
│       ├── database/           # Cliente Prisma
│       ├── redis/              # Cliente Redis + helpers de sessão
│       ├── middleware/         # Auth JWT + roles
│       └── modules/
│           ├── auth/           # Login, registro, JWT
│           ├── whatsapp/       # Gerenciamento de instâncias
│           ├── ai/             # LangChain + RAG + OpenRouter
│           ├── webhooks/       # Handler de eventos (state machine)
│           ├── conversations/  # CRUD + handoff
│           ├── knowledge/      # Base de conhecimento + upload
│           └── analytics/      # Métricas + config da IA
└── dashboard/                  # Next.js 14
    └── app/
        ├── page.tsx            # Landing page pública
        ├── (auth)/             # Login + Registro
        └── (tenant)/           # Área logada
            ├── dashboard/      # Overview com gráficos
            ├── whatsapp/       # Conectar número (QR Code)
            ├── inbox/          # Atendimento humano em tempo real
            ├── knowledge/      # Base de conhecimento
            ├── ai-config/      # Configuração da IA
            ├── conversations/  # Histórico
            └── analytics/      # Métricas detalhadas
```

---

## 🔄 Fluxo de uma mensagem

```
Cliente WhatsApp
      ↓
Evolution API (recebe)
      ↓
Webhook → Backend (POST /webhooks/evolution)
      ↓
Redis: verificar estado da conversa
      ├── HUMAN_ACTIVE → encaminhar para Inbox (Socket.io)
      └── AI_ACTIVE →
            ↓
            LangChain.js: busca RAG no PostgreSQL/pgvector
            ↓
            Monta prompt (persona + contexto + histórico)
            ↓
            OpenRouter → LLM (GPT-4o-mini / Claude / etc)
            ↓
            Detectar [ESCALAR] ou [NAO_SEI]
            ↓
            ├── Normal → Evolution API → WhatsApp
            └── Escalonar → muda estado para HUMAN_ACTIVE
                          → notifica Inbox via Socket.io
```

---

## 🔑 Variáveis de Ambiente

| Variável | Descrição |
|----------|-----------|
| `DOMAIN` | Seu domínio principal |
| `OPENROUTER_API_KEY` | Chave API do OpenRouter (sk-or-...) |
| `JWT_SECRET` | Segredo para tokens JWT (use `openssl rand -base64 64`) |
| `POSTGRES_PASSWORD` | Senha do PostgreSQL |
| `REDIS_PASSWORD` | Senha do Redis |
| `EVOLUTION_API_KEY` | Chave de segurança da Evolution API |

---

## 🛠️ Comandos úteis

```bash
# Ver logs de todos os serviços
docker compose logs -f

# Ver logs de um serviço específico
docker compose logs -f backend

# Reiniciar um serviço
docker compose restart backend

# Executar migração do banco
docker compose exec backend npx prisma migrate deploy

# Acessar o banco de dados
docker compose exec postgres psql -U zapia -d zapia_db

# Atualizar o sistema
git pull && docker compose build --no-cache && docker compose up -d
```

---

## 📞 Suporte e Contribuição

Este projeto foi desenvolvido como sistema SaaS profissional. Para dúvidas ou melhorias, abra uma issue no repositório.
