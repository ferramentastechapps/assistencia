#!/bin/bash
# Parar Postgres nativo e religar containers
set -e
cd /opt/zapia

echo "=== PARANDO POSTGRES NATIVO ==="
systemctl stop postgresql
systemctl disable postgresql
echo "✅ Postgres nativo parado e desabilitado"
echo

echo "=== SUBINDO CONTAINERS ==="
docker compose up -d
echo "✅ Containers iniciados"
echo

echo "=== AGUARDANDO 30s PARA POSTGRES E REDIS ==="
sleep 30
echo

echo "=== VERIFICANDO REDE ==="
docker network inspect zapia_zapia_net --format '{{range .Containers}}{{.Name}}: {{.IPv4Address}} {{end}}'
echo

echo "=== RODANDO MIGRATIONS + SEED ==="
docker compose exec -T backend sh -c "npx prisma migrate deploy && npx prisma db seed" || echo "⚠️ Pode já ter rodado"
echo

echo "=== STATUS FINAL ==="
docker compose ps
echo

echo "=== LOGS BACKEND (20 linhas) ==="
docker compose logs backend --tail 20
echo

echo "=== LOGS EVOLUTION (20 linhas) ==="
docker compose logs evolution-api --tail 20
echo

echo "=========================================="
echo "✅ CONCLUÍDO - aguarde 2 min para estabilizar"
echo "Monitor: docker compose logs -f"
echo "=========================================="
