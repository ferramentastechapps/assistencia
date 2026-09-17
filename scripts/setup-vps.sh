#!/bin/bash
# ═══════════════════════════════════════════════════════════
# ZapIA — Script de Setup Automatizado para VPS Ubuntu 24.04
# ═══════════════════════════════════════════════════════════
set -e

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log()     { echo -e "${GREEN}[✓]${NC} $1"; }
warn()    { echo -e "${YELLOW}[!]${NC} $1"; }
error()   { echo -e "${RED}[✗]${NC} $1"; exit 1; }
section() { echo -e "\n${BLUE}══════════════════════════════${NC}"; echo -e "${BLUE}  $1${NC}"; echo -e "${BLUE}══════════════════════════════${NC}"; }

# Verificar se é root
if [ "$EUID" -ne 0 ]; then
  error "Execute como root: sudo bash setup-vps.sh"
fi

section "1. Atualizando sistema"
apt-get update -qq && apt-get upgrade -y -qq
log "Sistema atualizado"

section "2. Instalando dependências base"
apt-get install -y -qq \
  curl wget git nano htop \
  ca-certificates gnupg lsb-release \
  ufw fail2ban \
  software-properties-common apt-transport-https
log "Dependências instaladas"

section "3. Instalando Docker"
if ! command -v docker &> /dev/null; then
  # Adicionar repositório Docker oficial
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | \
    gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  chmod a+r /etc/apt/keyrings/docker.gpg

  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
    https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | \
    tee /etc/apt/sources.list.d/docker.list > /dev/null

  apt-get update -qq
  apt-get install -y -qq docker-ce docker-ce-cli containerd.io docker-compose-plugin

  systemctl enable docker
  systemctl start docker
  log "Docker instalado"
else
  warn "Docker já instalado — pulando"
fi

section "4. Configurando Firewall (UFW)"
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw --force enable
log "Firewall configurado (SSH + HTTP + HTTPS)"

section "5. Configurando Fail2ban"
systemctl enable fail2ban
systemctl start fail2ban
log "Fail2ban ativo"

section "6. Otimizações de sistema"
# Aumentar limites de arquivo abertos (necessário para alto volume de conexões)
cat >> /etc/security/limits.conf << EOF
* soft nofile 65536
* hard nofile 65536
EOF

# Otimizações de rede
cat >> /etc/sysctl.conf << EOF
net.core.somaxconn=65535
net.ipv4.tcp_max_syn_backlog=65535
vm.overcommit_memory=1
EOF
sysctl -p > /dev/null 2>&1
log "Otimizações de sistema aplicadas"

section "7. Clonando projeto ZapIA"
APP_DIR="/opt/zapia"
if [ ! -d "$APP_DIR" ]; then
  mkdir -p "$APP_DIR"
  log "Diretório criado: $APP_DIR"
else
  warn "Diretório já existe: $APP_DIR"
fi

section "8. Copiando arquivos do projeto"
# (Execute este script de dentro do diretório do projeto)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cp -r "$PROJECT_DIR"/* "$APP_DIR/"
log "Arquivos copiados para $APP_DIR"

section "9. Configurando variáveis de ambiente"
if [ ! -f "$APP_DIR/.env" ]; then
  cp "$APP_DIR/.env.example" "$APP_DIR/.env"
  warn "Arquivo .env criado a partir do .env.example"
  warn "IMPORTANTE: Edite $APP_DIR/.env com suas configurações!"
  warn "  nano $APP_DIR/.env"
else
  warn "Arquivo .env já existe — mantendo configurações atuais"
fi

section "10. Iniciando serviços"
cd "$APP_DIR"

# Primeiro build e inicialização
docker compose pull
docker compose build --no-cache
docker compose up -d

log "Todos os serviços iniciados!"

section "11. Aguardando banco de dados"
sleep 15
docker compose exec -T backend sh -c "(npx prisma migrate deploy || npx prisma db push) && npx prisma db seed" 2>/dev/null || true
log "Migrações e sementes executadas"

section "═══ SETUP CONCLUÍDO ═══"
echo ""
echo -e "${GREEN}ZapIA está rodando! Próximos passos:${NC}"
echo ""
echo "1. Edite as variáveis de ambiente:"
echo "   ${YELLOW}nano $APP_DIR/.env${NC}"
echo ""
echo "2. Configure o DNS do seu domínio:"
echo "   A record: ${YELLOW}seu-dominio.com${NC} → ${YELLOW}$(curl -s ifconfig.me)${NC}"
echo "   A record: ${YELLOW}api.seu-dominio.com${NC} → ${YELLOW}$(curl -s ifconfig.me)${NC}"
echo "   A record: ${YELLOW}wa.seu-dominio.com${NC} → ${YELLOW}$(curl -s ifconfig.me)${NC}"
echo ""
echo "3. Após DNS propagar, instale SSL:"
echo "   ${YELLOW}cd $APP_DIR && docker compose --profile ssl run certbot${NC}"
echo ""
echo "4. Reinicie o Nginx:"
echo "   ${YELLOW}docker compose restart nginx${NC}"
echo ""
echo "5. Acesse o painel:"
echo "   ${YELLOW}https://seu-dominio.com${NC}"
echo ""
echo -e "${GREEN}IP do seu servidor: $(curl -s ifconfig.me)${NC}"
echo ""
