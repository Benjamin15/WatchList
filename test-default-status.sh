#!/bin/bash

# Test du statut par défaut lors de l'ajout d'un média

echo "🧪 Test du statut par défaut lors de l'ajout"
echo "==========================================="

# Configuration
ROOM_ID="de5861b3fcc1"
SERVER_URL="http://localhost:3000"

echo "1. Ajout d'un nouveau média..."
add_response=$(curl -s -X POST "$SERVER_URL/api/rooms/$ROOM_ID/items" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Movie Status",
    "type": "movie",
    "description": "Test pour vérifier le statut par défaut",
    "tmdbId": 999999
  }')

echo "📝 Réponse de l'ajout:"
echo "$add_response" | jq '.'

# Vérifier le statut dans la réponse
status=$(echo "$add_response" | jq -r '.status')
echo "📊 Statut retourné: $status"

if [ "$status" = "a_voir" ]; then
    echo "✅ Statut correct: le média est dans 'À regarder'"
else
    echo "❌ Statut incorrect: le média n'est pas dans 'À regarder'"
fi

echo "2. Vérification dans la room..."
room_items=$(curl -s "$SERVER_URL/api/rooms/$ROOM_ID/items")
new_item=$(echo "$room_items" | jq -r '.items[] | select(.title == "Test Movie Status")')

if [ ! -z "$new_item" ]; then
    item_status=$(echo "$new_item" | jq -r '.status')
    echo "📊 Statut dans la room: $item_status"
    
    if [ "$item_status" = "a_voir" ]; then
        echo "✅ Statut correct dans la room"
    else
        echo "❌ Statut incorrect dans la room"
    fi
else
    echo "❌ Média non trouvé dans la room"
fi

echo "3. Nettoyage..."
item_id=$(echo "$add_response" | jq -r '.id')
if [ "$item_id" != "null" ]; then
    curl -s -X DELETE "$SERVER_URL/api/rooms/$ROOM_ID/items/$item_id" > /dev/null
    echo "🧹 Média de test supprimé"
fi

echo "🏁 Test terminé"
