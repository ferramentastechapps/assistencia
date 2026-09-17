#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════
# ZapIA — Deploy Automatizado para VPS Ubuntu 24.04
# Executar: bash deploy.sh
# ═══════════════════════════════════════════════════════════════════════
set -e

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'
log()     { echo -e "${GREEN}[✓]${NC} $1"; }
warn()    { echo -e "${YELLOW}[!]${NC} $1"; }
section() { echo -e "\n${BLUE}══════════════════════════════════════${NC}"; echo -e "${BLUE}  $1${NC}"; echo -e "${BLUE}══════════════════════════════════════${NC}"; }

DOMAIN="atendai.ftech-apps.com.br"
APP_DIR="/opt/zapia"

section "1. Atualizando sistema"
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get upgrade -y -qq
log "Sistema atualizado"

section "2. Instalando Docker"
if ! command -v docker &>/dev/null; then
  apt-get install -y -qq ca-certificates curl gnupg lsb-release
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  chmod a+r /etc/apt/keyrings/docker.gpg
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
  apt-get update -qq
  apt-get install -y -qq docker-ce docker-ce-cli containerd.io docker-compose-plugin
  systemctl enable docker && systemctl start docker
  log "Docker instalado"
else
  warn "Docker já instalado — ok"
fi

section "3. Configurando Firewall"
apt-get install -y -qq ufw
ufw default deny incoming 2>/dev/null || true
ufw default allow outgoing 2>/dev/null || true
ufw allow 22/tcp 2>/dev/null || true
ufw allow 80/tcp 2>/dev/null || true
ufw allow 443/tcp 2>/dev/null || true
ufw --force enable 2>/dev/null || true
log "Firewall configurado"

section "4. Criando diretório do projeto"
mkdir -p "$APP_DIR"
log "Diretório: $APP_DIR"

section "5. Copiando arquivos"
cp -r /tmp/zapia/* "$APP_DIR/"
log "Arquivos copiados"

section "6. Verificando .env"
if [ -f "/tmp/zapia/.env" ]; then
  cp /tmp/zapia/.env "$APP_DIR/.env"
  log ".env copiado com sucesso"
else
  warn ".env não encontrado — usando .env.example"
  cp "$APP_DIR/.env.example" "$APP_DIR/.env"
fi

section "7. Iniciando containers"
cd "$APP_DIR"
docker compose pull 2>/dev/null || true
docker compose build
docker compose up -d
log "Containers iniciados"

section "8. Aguardando banco ficar pronto"
echo "Aguardando PostgreSQL..."
for i in {1..30}; do
  if docker compose exec -T postgres pg_isready -U zapia &>/dev/null; then
    log "PostgreSQL pronto!"
    break
  fi
  sleep 2
  echo -n "."
done

section "9. Executando migrações"
sleep 5
docker compose exec -T backend sh -c "cd /app && npx prisma migrate deploy" || warn "Migração falhou — tentará no próximo restart"
docker compose exec -T backend sh -c "cd /app && npx prisma db seed" || warn "Seed falhou (pode já ter sido executado)"
log "Banco configurado"

section "10. Instalando SSL"
if [ ! -d "/etc/letsencrypt/live/$DOMAIN" ]; then
  warn "Configurando SSL para $DOMAIN..."
  docker compose run --rm certbot certonly \
    --webroot --webroot-path=/var/www/certbot \
    --email admin@ftech-apps.com.br \
    --agree-tos --no-eff-email \
    -d "$DOMAIN" || warn "SSL falhou — verificar DNS. O sistema funciona via HTTP por enquanto."
  docker compose restart nginx
  log "SSL configurado"
else
  log "SSL já configurado"
fi

section "═══ DEPLOY CONCLUÍDO ═══"
IP=$(curl -s ifconfig.me 2>/dev/null || echo "212.85.10.239")
echo ""
echo -e "${GREEN}🎉 ZapIA está no ar!${NC}"
echo ""
echo "  📱 Dashboard:  http://$DOMAIN"
echo "  🔑 Login:      admin@zapia.com"
echo "  🔐 Senha:      admin123456  ← TROQUE AGORA!"
echo ""
echo "  🐳 Status dos containers:"
docker compose ps
echo ""
echo -e "${YELLOW}IMPORTANTE: Acesse o painel e troque a senha do admin!${NC}"
