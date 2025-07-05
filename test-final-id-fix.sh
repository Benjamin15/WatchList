#!/bin/bash

# Test final des corrections pour Astonishing X-Men vs Bumboo
echo "🎯 Test final: Correction des collisions d'ID TMDB"
echo "=================================================="

echo "✅ 1. Vérification des nouveaux external_id"
echo "Astonishing X-Men (série):"
curl -s "http://localhost:3000/api/search/autocomplete/astonishing%20x-men" | jq '.results[0] | {title, type, external_id, image_url}' | head -5

echo -e "\nBumboo (film):"
curl -s "http://localhost:3000/api/search/autocomplete/bumboo" | jq '.results[1] | {title, type, external_id, image_url}' | head -5

echo -e "\n🏗️ 2. Création d'une room de test finale"
ROOM_RESPONSE=$(curl -s -X POST http://localhost:3000/api/rooms \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Final ID Fix", "room_id": "final-id-test"}')

ROOM_ID=$(echo "$ROOM_RESPONSE" | jq -r '.room_id')
echo "Room créée: $ROOM_ID"

echo -e "\n📺 3. Ajout d'Astonishing X-Men (série TV)"
ASTONISHING_RESULT=$(curl -s -X POST http://localhost:3000/api/rooms/$ROOM_ID/items \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Astonishing X-Men",
    "type": "series",
    "year": 2009,
    "description": "Facing a powerful new enemy, the team of mutant superheroes find themselves further imperiled when a \"cure\" for mutants is discovered.",
    "posterUrl": "https://image.tmdb.org/t/p/w500/kkpr7lhAmXfNTT4KsbMcHJ0GNyE.jpg",
    "rating": 5.714,
    "tmdbId": 117657,
    "image_url": "https://image.tmdb.org/t/p/w500/kkpr7lhAmXfNTT4KsbMcHJ0GNyE.jpg"
  }')

echo "$ASTONISHING_RESULT" | jq '{title, external_id, image_url}' | head -5

echo -e "\n🎬 4. Ajout de Bumboo (film)"
BUMBOO_RESULT=$(curl -s -X POST http://localhost:3000/api/rooms/$ROOM_ID/items \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Bumboo", 
    "type": "movie",
    "year": 2012,
    "description": "Bumboo movie is based on one simple idea. Every person meets someone, who screws it up and makes life miserable",
    "posterUrl": "https://image.tmdb.org/t/p/w500/crz9tyL0aEHEAeG7gouvh3KNI7l.jpg",
    "rating": 2,
    "tmdbId": 117657,
    "image_url": "https://image.tmdb.org/t/p/w500/crz9tyL0aEHEAeG7gouvh3KNI7l.jpg"
  }')

echo "$BUMBOO_RESULT" | jq '{title, external_id, image_url}' | head -5

echo -e "\n📋 5. Vérification finale des items dans la room"
curl -s "http://localhost:3000/api/rooms/$ROOM_ID/items" | jq '.items[] | {
  id,
  title, 
  type, 
  external_id, 
  image_url: (.image_url // "null")
}' | head -20

echo -e "\n🔍 6. Test des APIs de détails avec les bons types"
echo "Détails Astonishing X-Men (série 117657):"
curl -s "http://localhost:3000/api/media/series/117657/details" | jq '{title, id, type: "series"}' | head -3

echo -e "\nDétails Bumboo (film 117657):"
curl -s "http://localhost:3000/api/media/movie/117657/details" | jq '{title, id, type: "movie"}' | head -3

echo -e "\n✅ 7. Résumé des corrections appliquées:"
echo "🔧 Problème résolu: Collision d'ID TMDB 117657"
echo "  - Avant: tmdb_117657 pour les deux médias (collision)"
echo "  - Après: tmdb_tv_117657 (série) vs tmdb_movie_117657 (film)"
echo ""
echo "🔧 Problème résolu: Perte d'image miniature"
echo "  - Les images sont maintenant préservées grâce à la différenciation des types"
echo ""
echo "🔧 Problème résolu: Mauvais film affiché"
echo "  - Chaque média a maintenant un identifiant unique incluant le type"
echo ""
echo "🔧 Problème résolu: Erreur Text component"
echo "  - Gestion sécurisée des genres dans MediaDetailScreen"

echo -e "\n📱 8. Test final dans l'application mobile:"
echo "1. Rejoindre la room: $ROOM_ID"
echo "2. Vérifier que Astonishing X-Men a son image"
echo "3. Vérifier que Bumboo a son image"
echo "4. Cliquer sur Astonishing X-Men → doit afficher 'Astonishing X-Men'"
echo "5. Cliquer sur Bumboo → doit afficher 'Bumboo'"
echo "6. Plus d'erreur Text component"

echo -e "\n🎉 Room ID pour test final: $ROOM_ID"
