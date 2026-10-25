#!/bin/bash
# Fix ZapIA - mover de PM2 para Docker Compose 100%
set -e

cd /opt/zapia

echo "=========================================="
echo "CORRIGINDO ZAPIA - $(date)"
echo "=========================================="
echo

echo "=== 1. PARANDO BACKEND NO PM2 ==="
pm2 stop zapia-backend 2>/dev/null || echo "Backend já parado"
pm2 delete zapia-backend 2>/dev/null || echo "Backend já removido do PM2"
echo "✅ Backend removido do PM2"
echo

echo "=== 2. PARANDO TODOS OS CONTAINERS ==="
docker compose down
echo "✅ Containers parados"
echo

echo "=== 3. LIMPANDO REDE DOCKER ==="
docker network rm zapia_zapia_net 2>/dev/null || echo "Rede já removida"
echo "✅ Rede limpa"
echo

echo "=== 4. RECRIANDO E SUBINDO CONTAINERS ==="
docker compose up -d --force-recreate
echo "✅ Containers recriados"
echo

echo "=== 5. AGUARDANDO POSTGRES E REDIS (30s) ==="
sleep 30
echo

echo "=== 6. VERIFICANDO REDE DOCKER ==="
docker network inspect zapia_zapia_net --format '{{range .Containers}}{{.Name}}: {{.IPv4Address}} {{end}}'
echo

echo "=== 7. RODANDO MIGRATIONS + SEED NO BACKEND ==="
docker compose exec -T backend sh -c "npx prisma migrate deploy && npx prisma db seed" || echo "⚠️ Migration/seed falhou (pode já ter rodado antes)"
echo

echo "=== 8. STATUS FINAL ==="
docker compose ps
echo

echo "=== 9. LOGS BACKEND (últimas 20 linhas) ==="
docker compose logs backend --tail 20
echo

echo "=== 10. LOGS EVOLUTION (últimas 20 linhas) ==="
docker compose logs evolution-api --tail 20
echo

echo "=========================================="
echo "✅ CORREÇÃO CONCLUÍDA"
echo "Aguarde 2-3 minutos para tudo estabilizar"
echo "Monitore: docker compose logs -f"
echo "=========================================="
