#!/bin/bash
# Diagnóstico ZapIA - leitura pura, sem alterações
set -e
cd /opt/zapia

echo "=========================================="
echo "DIAGNÓSTICO ZAPIA - $(date)"
echo "=========================================="
echo

echo "=== 1. STATUS DOS CONTAINERS ==="
docker compose ps
echo

echo "=== 2. BACKEND - existe o container? ==="
docker ps -a | grep zapia_backend || echo "Backend container NÃO ENCONTRADO"
echo

echo "=== 3. BACKEND PM2 - status ==="
pm2 info zapia-backend 2>&1 | grep -E "status|uptime|restart|cpu|mem" || echo "Backend não está no PM2 ou erro"
echo

echo "=== 4. POSTGRES - pode conectar? ==="
docker compose exec -T postgres pg_isready -U zapia -d evolution_db 2>&1 || echo "Postgres não aceita conexões"
echo

echo "=== 5. EVOLUTION - últimas 20 linhas ==="
docker logs zapia_evolution --tail 20 2>&1
echo

echo "=== 6. REDE DOCKER - zapia_zapia_net ==="
docker network inspect zapia_zapia_net --format '{{range .Containers}}{{.Name}}: {{.IPv4Address}} {{end}}' 2>&1
echo

echo "=== 7. .ENV - keys presentes (SEM valores) ==="
grep -o '^[A-Z_]*=' .env 2>/dev/null | cut -d= -f1 | sort || echo "Sem .env"
echo

echo "=== 8. TABELAS NO evolution_db ==="
docker compose exec -T postgres psql -U zapia -d evolution_db -c "\dt" 2>&1 | head -n 30
echo

echo "=== 9. PM2 - backend logs (últimas 30 linhas) ==="
pm2 logs zapia-backend --lines 30 --nostream 2>&1 || echo "Logs PM2 inacessíveis"
echo

echo "=========================================="
echo "FIM DO DIAGNÓSTICO"
echo "=========================================="
