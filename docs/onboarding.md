# Preparação do Ambiente Local e Onboarding — ZapIA

## Pré-requisitos

- **Node.js:** Versão 20 LTS ou superior (desenvolvimento testado em v24.22).
- **npm:** Versão 10+.
- **Docker & Docker Compose:** Para execução de PostgreSQL (pgvector), Redis e Evolution API.
- **Git:** Controle de versão.

## Primeiro Passo: Variáveis de Ambiente

Copie o arquivo de exemplo na raiz do projeto:
```bash
cp .env.example .env
```
Preencha os valores essenciais no `.env` (credenciais de banco, segredo JWT e chave do OpenRouter).

## Inicialização com Docker

Para subir toda a infraestrutura de apoio (PostgreSQL com pgvector, Redis e Evolution API):
```bash
docker compose up -d postgres redis evolution_api
```

## Configuração do Backend

1. Acesse o diretório do backend:
   ```bash
   cd backend
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Gere o cliente Prisma e sincronize o schema:
   ```bash
   npm run prisma:generate
   npm run prisma:push
   ```
4. (Opcional) Popule o banco com dados de teste para assistência técnica:
   ```bash
   node seed_tech.js
   ```
5. Inicie o servidor em modo desenvolvimento:
   ```bash
   npm run dev
   ```
   O backend estará disponível em `http://localhost:3001`.

## Configuração do Dashboard

1. Acesse o diretório do dashboard:
   ```bash
   cd ../dashboard
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Inicie o servidor Next.js em modo desenvolvimento:
   ```bash
   npm run dev
   ```
   O dashboard estará acessível em `http://localhost:3000`.

## Verificação e Sanidade

Execute os testes de sanidade locais:
```bash
cd backend
node test_audit.js
node test_auth_and_ai.js
node test_tools.js
```

## Solução de Problemas Conhecidos

- **Porta do PostgreSQL em conflito (5432):** Se já houver um PostgreSQL instalado no host, utilize o script `./fix_postgres_port.sh` ou ajuste a porta exposta no `docker-compose.yml` para `5433:5432`.
- **Containers do Docker não inicializando:** Execute `./fix_docker.sh` para resetar volumes e containers órfãos com segurança.
- **Evolution API desconectada:** Verifique se as variáveis `EVOLUTION_API_KEY` e `EVOLUTION_SERVER_URL` coincidem entre o `.env` e o painel do Evolution.
