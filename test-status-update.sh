#!/bin/bash

# Test de correction des routes de mise à jour de statut
echo "=== Test de correction des routes de mise à jour de statut ==="

# Obtenir les informations de test
echo "1. Récupération des informations existantes..."
cd /Users/ben/workspace/WatchList/server
RECENT_ITEM=$(sqlite3 prisma/dev.db "SELECT i.id, r.room_id FROM items i JOIN item_in_room ir ON i.id = ir.item_id JOIN rooms r ON ir.room_id = r.id ORDER BY i.created_at DESC LIMIT 1;")

if [ -z "$RECENT_ITEM" ]; then
    echo "Aucun item trouvé dans la base de données"
    exit 1
fi

ITEM_ID=$(echo $RECENT_ITEM | cut -d'|' -f1)
ROOM_ID=$(echo $RECENT_ITEM | cut -d'|' -f2)

echo "Item ID: $ITEM_ID"
echo "Room ID: $ROOM_ID"

# Tester la mise à jour du statut
echo "2. Test de mise à jour du statut..."
UPDATE_RESPONSE=$(curl -s -X PUT "http://localhost:3000/api/rooms/$ROOM_ID/items/$ITEM_ID/status" \
  -H "Content-Type: application/json" \
  -d '{"status": "en_cours"}')

echo "Réponse de mise à jour:"
echo $UPDATE_RESPONSE | jq .

# Vérifier en base de données
echo "3. Vérification en base de données..."
sqlite3 prisma/dev.db "SELECT id, title, status FROM items WHERE id = $ITEM_ID;"

# Tester une autre mise à jour
echo "4. Test d'une autre mise à jour..."
UPDATE_RESPONSE2=$(curl -s -X PUT "http://localhost:3000/api/rooms/$ROOM_ID/items/$ITEM_ID/status" \
  -H "Content-Type: application/json" \
  -d '{"status": "vu"}')

echo "Réponse de deuxième mise à jour:"
echo $UPDATE_RESPONSE2 | jq .

# Vérification finale
echo "5. Vérification finale..."
sqlite3 prisma/dev.db "SELECT id, title, status FROM items WHERE id = $ITEM_ID;"

echo "=== Test terminé ==="
