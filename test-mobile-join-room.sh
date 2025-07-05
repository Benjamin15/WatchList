#!/bin/bash

# Script de test mobile pour valider la correction de joinRoom

BASE_URL="http://192.168.0.14:3000/api"

echo "=== Test de joinRoom côté mobile ==="
echo "Simulation exacte du processus mobile"
echo ""

# Créer une room de test
echo "1. Création d'une room de test"
create_response=$(curl -s -X POST "$BASE_URL/rooms" \
  -H "Content-Type: application/json" \
  -d '{"name":"Mobile Test Room"}')

echo "Room créée:"
echo "$create_response" | jq '.'

room_id=$(echo "$create_response" | jq -r '.room_id')
echo "Room ID: $room_id"
echo ""

# Simuler la transformation côté mobile (toUpperCase())
echo "2. Simulation de la transformation mobile (toUpperCase())"
mobile_code=$(echo "$room_id" | tr '[:lower:]' '[:upper:]')
echo "Code original: $room_id"
echo "Code transformé mobile: $mobile_code"
echo ""

# Simuler l'appel API mobile (joinRoom)
echo "3. Simulation de l'appel API mobile (joinRoom)"
echo "URL: $BASE_URL/rooms/$mobile_code"

join_response=$(curl -s -w "%{http_code}" -X GET "$BASE_URL/rooms/$mobile_code" \
  -H "Content-Type: application/json" \
  -o /tmp/mobile_response.json)

http_code="${join_response: -3}"
echo "Code HTTP: $http_code"
echo "Réponse:"
cat /tmp/mobile_response.json | jq '.'
echo ""

# Vérifier le résultat
if [ "$http_code" = "200" ]; then
    echo "✅ SUCCESS: joinRoom fonctionne maintenant"
    echo "✅ L'erreur 404 est corrigée"
    
    # Tester la navigation vers la room (simulation)
    echo ""
    echo "4. Test de navigation vers la room (simulation getRoomItems)"
    items_response=$(curl -s -X GET "$BASE_URL/rooms/$mobile_code/items" \
      -H "Content-Type: application/json")
    
    echo "Items de la room:"
    echo "$items_response" | jq '.'
    
    if echo "$items_response" | jq -e '.room' > /dev/null 2>&1; then
        echo "✅ SUCCESS: Navigation vers la room fonctionne"
    else
        echo "❌ ERREUR: Problème avec la navigation vers la room"
    fi
    
else
    echo "❌ ERREUR: joinRoom échoue toujours"
    echo "Code HTTP: $http_code"
    echo "Réponse:"
    cat /tmp/mobile_response.json
fi

# Nettoyage
rm -f /tmp/mobile_response.json
