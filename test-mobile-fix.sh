#!/bin/bash

# Test de correction de l'intégration mobile
echo "=== Test de correction de l'intégration mobile ==="

# Créer une room de test
echo "1. Création d'une room de test..."
ROOM_RESPONSE=$(curl -s -X POST "http://localhost:3000/api/rooms" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Mobile Fix"}')

ROOM_ID=$(echo $ROOM_RESPONSE | jq -r '.room_id')
echo "Room créée avec ID: $ROOM_ID"

# Simuler l'ajout d'un média via l'API mobile (avec les données qu'elle envoie)
echo "2. Ajout d'un média via la route mobile..."
MEDIA_RESPONSE=$(curl -s -X POST "http://localhost:3000/api/rooms/$ROOM_ID/items" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Attack on Titan",
    "type": "tv",
    "external_id": "tmdb_1429",
    "image_url": "https://image.tmdb.org/t/p/w500/hTP1DtLGFamjfu8WqjnuQdP1n4i.jpg",
    "release_date": "2013-04-07",
    "description": "Humanity fights for survival against giant humanoid Titans.",
    "note": 9.0
  }')

echo "Réponse du serveur:"
echo $MEDIA_RESPONSE | jq .

# Extraire l'ID du média créé
MEDIA_ID=$(echo $MEDIA_RESPONSE | jq -r '.id')

# Vérifier en base de données
echo "3. Vérification en base de données..."
cd /Users/ben/workspace/WatchList/server
sqlite3 prisma/dev.db "SELECT id, title, external_id, image_url, release_date, description, note FROM items WHERE id = $MEDIA_ID;"

echo "=== Test terminé ==="
