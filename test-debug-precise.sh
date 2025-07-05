#!/bin/bash

# Script de diagnostic pour identifier précisément le problème d'affichage
echo "🔍 Diagnostic précis du problème MediaDetailScreen"
echo "================================================="

# Vérifier que les serveurs sont en cours d'exécution
echo "📡 Vérification des serveurs..."
if ! curl -s http://localhost:3000/health > /dev/null 2>&1; then
    echo "❌ Serveur backend non disponible"
    exit 1
fi

# Créer une room de test et ajouter plusieurs médias
echo "🏗️ Création d'une room de test avec plusieurs médias..."

# Créer une room
ROOM_RESPONSE=$(curl -s -X POST http://localhost:3000/api/rooms \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Debug Room", "room_id": "debug-room"}')

ROOM_ID=$(echo "$ROOM_RESPONSE" | jq -r '.room_id')
echo "✅ Room créée : $ROOM_ID"

# Ajouter The Matrix (ID TMDB: 603)
echo "📽️ Ajout de The Matrix..."
curl -s -X POST http://localhost:3000/api/rooms/$ROOM_ID/items \
  -H "Content-Type: application/json" \
  -d '{
    "title": "The Matrix",
    "type": "movie",
    "year": 1999,
    "genre": "Action, Sci-Fi",
    "description": "A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.",
    "posterUrl": "https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",
    "rating": 8.7,
    "tmdbId": 603,
    "image_url": "https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg"
  }' > /dev/null

# Ajouter Inception (ID TMDB: 27205)
echo "📽️ Ajout d'Inception..."
curl -s -X POST http://localhost:3000/api/rooms/$ROOM_ID/items \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Inception",
    "type": "movie",
    "year": 2010,
    "genre": "Action, Sci-Fi",
    "description": "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
    "posterUrl": "https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
    "rating": 8.8,
    "tmdbId": 27205,
    "image_url": "https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg"
  }' > /dev/null

# Ajouter Interstellar (ID TMDB: 157336)
echo "📽️ Ajout d'Interstellar..."
curl -s -X POST http://localhost:3000/api/rooms/$ROOM_ID/items \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Interstellar",
    "type": "movie",
    "year": 2014,
    "genre": "Adventure, Drama, Sci-Fi",
    "description": "A team of explorers travel through a wormhole in space in an attempt to ensure humanity'\''s survival.",
    "posterUrl": "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    "rating": 8.6,
    "tmdbId": 157336,
    "image_url": "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg"
  }' > /dev/null

echo "✅ Médias ajoutés avec succès"

# Récupérer les items de la room
echo "📋 Récupération des items de la room..."
ITEMS_RESPONSE=$(curl -s "http://localhost:3000/api/rooms/$ROOM_ID/items")
echo "Items dans la room:"
echo "$ITEMS_RESPONSE" | jq '.items[] | {id, title, external_id}'

# Tester l'API de détails pour chaque média
echo "🔍 Test des APIs de détails TMDB..."

echo "1. Test détails The Matrix (TMDB: 603)"
curl -s "http://localhost:3000/api/media/movie/603/details" | jq '{title, id, overview}' | head -10

echo -e "\n2. Test détails Inception (TMDB: 27205)"
curl -s "http://localhost:3000/api/media/movie/27205/details" | jq '{title, id, overview}' | head -10

echo -e "\n3. Test détails Interstellar (TMDB: 157336)"
curl -s "http://localhost:3000/api/media/movie/157336/details" | jq '{title, id, overview}' | head -10

echo -e "\n🎯 Points à vérifier dans l'app mobile:"
echo "1. Ouvrir la room : $ROOM_ID"
echo "2. Vérifier que les 3 films sont affichés correctement"
echo "3. Cliquer sur chaque film et vérifier que le bon film apparaît dans les détails"
echo "4. Vérifier les logs dans la console pour tracer les IDs"

echo -e "\n💡 Commandes utiles:"
echo "- Réinitialiser la room : curl -X DELETE http://localhost:3000/api/rooms/$ROOM_ID"
echo "- Voir les logs mobile : Ouvrir l'onglet réseau dans les DevTools"
echo "- Room ID pour test : $ROOM_ID"
