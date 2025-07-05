#!/bin/bash

# Test des corrections pour le problème Astonishing X-Men vs Bumboo
echo "🔧 Test des corrections pour les collisions d'ID TMDB"
echo "===================================================="

echo "🔍 1. Test de la recherche avec nouveaux external_id"
echo "Recherche Astonishing X-Men:"
curl -s "http://localhost:3000/api/search/autocomplete/astonishing%20x-men" | jq '.results[0] | {title, type, external_id}' | head -5

echo -e "\nRecherche Bumboo:"
curl -s "http://localhost:3000/api/search/autocomplete/bumboo" | jq '.results[0] | {title, type, external_id}' | head -5

echo -e "\n📱 2. Test des APIs de détails"
echo "Détails pour Astonishing X-Men (série TV 117657):"
curl -s "http://localhost:3000/api/media/series/117657/details" | jq '{title, id, overview}' | head -3

echo -e "\nDétails pour Bumboo (film 117657):"
curl -s "http://localhost:3000/api/media/movie/117657/details" | jq '{title, id, overview}' | head -3

echo -e "\n🎯 3. Test d'ajout dans une room"
echo "Création d'une room de test..."
ROOM_RESPONSE=$(curl -s -X POST http://localhost:3000/api/rooms \
  -H "Content-Type: application/json" \
  -d '{"name": "Test ID Collision", "room_id": "collision-test"}')

ROOM_ID=$(echo "$ROOM_RESPONSE" | jq -r '.room_id')
echo "Room créée: $ROOM_ID"

echo -e "\nAjout d'Astonishing X-Men (série)..."
curl -s -X POST http://localhost:3000/api/rooms/$ROOM_ID/items \
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
  }' | jq '{title, external_id}'

echo -e "\nAjout de Bumboo (film)..."
curl -s -X POST http://localhost:3000/api/rooms/$ROOM_ID/items \
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
  }' | jq '{title, external_id}'

echo -e "\n📋 4. Vérification des items dans la room"
curl -s "http://localhost:3000/api/rooms/$ROOM_ID/items" | jq '.items[] | {id, title, type, external_id, image_url}' | head -15

echo -e "\n✅ 5. Résultats attendus après correction:"
echo "- Astonishing X-Men devrait avoir external_id: tmdb_tv_117657"
echo "- Bumboo devrait avoir external_id: tmdb_movie_117657"
echo "- Les deux médias sont maintenant différenciés par le type dans l'external_id"
echo "- Plus de collision entre les IDs"
echo "- L'image miniature devrait être préservée"

echo -e "\n🧪 6. Test dans l'application mobile:"
echo "1. Rejoindre la room: $ROOM_ID"
echo "2. Vérifier que les 2 médias ont des images distinctes"
echo "3. Cliquer sur Astonishing X-Men → doit afficher 'Astonishing X-Men'"
echo "4. Cliquer sur Bumboo → doit afficher 'Bumboo'"
echo "5. Plus d'erreur 'Text strings must be rendered within a <Text> component'"

echo -e "\n💡 Room ID pour test mobile: $ROOM_ID"
