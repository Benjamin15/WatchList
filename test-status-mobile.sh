#!/bin/bash

# Test de l'ajout d'un média et vérification du statut dans l'interface mobile

echo "🧪 Test complet de l'ajout de média avec statut"
echo "=============================================="

# Configuration
ROOM_ID="de5861b3fcc1"
SERVER_URL="http://localhost:3000"

echo "1. Ajout d'un nouveau média de test..."
add_response=$(curl -s -X POST "$SERVER_URL/api/rooms/$ROOM_ID/items" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Film Status Mobile",
    "type": "movie",
    "description": "Test du statut par défaut côté mobile",
    "tmdbId": 888888
  }')

echo "📝 Réponse serveur de l'ajout:"
echo "$add_response" | jq '.'

# Récupérer l'ID du média ajouté
item_id=$(echo "$add_response" | jq -r '.id')
echo "🆔 ID du média ajouté: $item_id"

echo "2. Récupération des items de la room (format mobile)..."
room_items=$(curl -s "$SERVER_URL/api/rooms/$ROOM_ID/items")
echo "📋 Items de la room:"
echo "$room_items" | jq '.items[] | select(.id == '$item_id') | {id, title, status}'

# Vérifier le statut du média ajouté
media_status=$(echo "$room_items" | jq -r '.items[] | select(.id == '$item_id') | .status')
echo "📊 Statut du média dans la room: $media_status"

echo "3. Vérification du mapping de statut..."
if [ "$media_status" = "a_voir" ]; then
    echo "✅ Statut correct côté serveur: 'a_voir'"
    echo "🔄 Ce statut devrait être transformé en 'planned' côté mobile"
else
    echo "❌ Statut incorrect côté serveur: $media_status (attendu: a_voir)"
fi

echo "4. Simulation de la transformation mobile..."
echo "   - Statut serveur: '$media_status'"
if [ "$media_status" = "a_voir" ]; then
    echo "   - Statut mobile: 'planned'"
    echo "   - Section mobile: 'À regarder'"
    echo "   ✅ Le média devrait apparaître dans l'onglet 'À regarder'"
else
    echo "   - Transformation inconnue pour: '$media_status'"
fi

echo "5. Test de mise à jour de statut..."
echo "Passage de 'a_voir' vers 'en_cours'..."
update_response=$(curl -s -X PUT "$SERVER_URL/api/rooms/$ROOM_ID/items/$item_id/status" \
  -H "Content-Type: application/json" \
  -d '{"status": "en_cours"}')

echo "📝 Réponse de mise à jour:"
echo "$update_response" | jq '.'

# Vérifier le nouveau statut
new_status=$(echo "$update_response" | jq -r '.status')
echo "📊 Nouveau statut: $new_status"

if [ "$new_status" = "en_cours" ]; then
    echo "✅ Mise à jour réussie: 'en_cours'"
    echo "🔄 Ce statut devrait être transformé en 'watching' côté mobile"
    echo "📂 Le média devrait maintenant être dans l'onglet 'En cours'"
else
    echo "❌ Mise à jour échouée ou statut incorrect"
fi

echo "6. Nettoyage..."
curl -s -X DELETE "$SERVER_URL/api/rooms/$ROOM_ID/items/$item_id" > /dev/null
echo "🧹 Média de test supprimé"

echo ""
echo "📊 Résumé du mapping des statuts:"
echo "   Serveur → Mobile → Interface"
echo "   a_voir → planned → À regarder"
echo "   en_cours → watching → En cours"
echo "   vu → completed → Terminé"

echo "🏁 Test terminé"
