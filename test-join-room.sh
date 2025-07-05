#!/bin/bash

# Script pour tester la fonctionnalité de joinRoom côté mobile
# Simule exactement ce que fait l'application mobile

BASE_URL="http://192.168.0.14:3000/api"
ROOM_CODE="d3b9d992b348"

echo "=== Test de joinRoom côté mobile ==="
echo "URL de base: $BASE_URL"
echo "Code de room: $ROOM_CODE"
echo ""

# Test 1: Reproduire exactement l'appel fait par mobile/src/services/api.ts
echo "1. Test de l'appel joinRoom (GET /rooms/{code})"
echo "URL complète: $BASE_URL/rooms/$ROOM_CODE"
echo ""

response=$(curl -s -w "%{http_code}" -X GET "$BASE_URL/rooms/$ROOM_CODE" \
  -H "Content-Type: application/json" \
  -o /tmp/response_body.json)

http_code="${response: -3}"
echo "Code de réponse HTTP: $http_code"
echo "Contenu de la réponse:"
cat /tmp/response_body.json
echo ""

if [ "$http_code" = "200" ]; then
    echo "✅ SUCCESS: La room a été trouvée"
else
    echo "❌ ERREUR: Code HTTP $http_code"
    echo "Détails de l'erreur:"
    cat /tmp/response_body.json
fi

echo ""
echo "=== Test du health check ==="
curl -s "$BASE_URL/health" | jq '.'

echo ""
echo "=== Test de connectivité réseau ==="
ping -c 3 192.168.0.14 || echo "❌ Problème de connectivité réseau"

# Nettoyage
rm -f /tmp/response_body.json
