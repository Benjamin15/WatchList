#!/bin/bash

# Test d'intégration complète de l'application mobile avec MediaDetailScreen
echo "🧪 Test d'intégration complète - MediaDetailScreen"
echo "================================================="

# Variables
SERVER_URL="http://localhost:3000"
ROOM_ID="test-room-$(date +%s)"

echo "🔧 Configuration du test:"
echo "   - Server URL: $SERVER_URL"
echo "   - Room ID: $ROOM_ID"

# Test 1: Vérifier que le serveur est démarré
echo ""
echo "1. Vérification du serveur..."
if curl -s "$SERVER_URL/api/health" > /dev/null; then
    echo "✅ Serveur accessible"
else
    echo "❌ Serveur non accessible"
    echo "💡 Démarrez le serveur avec: cd server && npm start"
    exit 1
fi

# Test 2: Créer une room de test
echo ""
echo "2. Création d'une room de test..."
ROOM_RESPONSE=$(curl -s -X POST "$SERVER_URL/api/rooms" \
  -H "Content-Type: application/json" \
  -d "{\"room_id\": \"$ROOM_ID\", \"name\": \"Test Room MediaDetail\"}")

if echo "$ROOM_RESPONSE" | jq -e '.room_id' > /dev/null 2>&1; then
    echo "✅ Room créée: $ROOM_ID"
else
    echo "❌ Erreur lors de la création de la room"
    echo "Response: $ROOM_RESPONSE"
    exit 1
fi

# Test 3: Tester la recherche (source pour MediaDetailScreen)
echo ""
echo "3. Test de la recherche..."
SEARCH_RESPONSE=$(curl -s "$SERVER_URL/api/search/autocomplete?q=matrix&room_id=$ROOM_ID")
if echo "$SEARCH_RESPONSE" | jq -e '.[0].title' > /dev/null 2>&1; then
    FIRST_RESULT=$(echo "$SEARCH_RESPONSE" | jq -r '.[0].title')
    TMDB_ID=$(echo "$SEARCH_RESPONSE" | jq -r '.[0].external_id' | sed 's/tmdb_//')
    echo "✅ Recherche OK: $FIRST_RESULT (TMDB ID: $TMDB_ID)"
else
    echo "❌ Erreur lors de la recherche"
fi

# Test 4: Tester les détails du média
echo ""
echo "4. Test des détails du média..."
if [ ! -z "$TMDB_ID" ]; then
    DETAILS_RESPONSE=$(curl -s "$SERVER_URL/api/media/movie/$TMDB_ID/details")
    if echo "$DETAILS_RESPONSE" | jq -e '.title' > /dev/null 2>&1; then
        TITLE=$(echo "$DETAILS_RESPONSE" | jq -r '.title')
        OVERVIEW=$(echo "$DETAILS_RESPONSE" | jq -r '.overview' | cut -c1-50)
        echo "✅ Détails récupérés: $TITLE"
        echo "   Synopsis: $OVERVIEW..."
    else
        echo "❌ Erreur lors de la récupération des détails"
    fi
fi

# Test 5: Tester les trailers
echo ""
echo "5. Test des trailers..."
if [ ! -z "$TMDB_ID" ]; then
    TRAILERS_RESPONSE=$(curl -s "$SERVER_URL/api/media/movie/$TMDB_ID/trailers")
    if echo "$TRAILERS_RESPONSE" | jq -e '.trailers' > /dev/null 2>&1; then
        TRAILER_COUNT=$(echo "$TRAILERS_RESPONSE" | jq '.trailers | length')
        echo "✅ Trailers récupérés: $TRAILER_COUNT trailer(s)"
        
        if [ "$TRAILER_COUNT" -gt 0 ]; then
            FIRST_TRAILER=$(echo "$TRAILERS_RESPONSE" | jq -r '.trailers[0].name')
            echo "   Premier trailer: $FIRST_TRAILER"
        fi
    else
        echo "❌ Erreur lors de la récupération des trailers"
    fi
fi

# Test 6: Ajouter un média à la room
echo ""
echo "6. Ajout d'un média à la room..."
ADD_RESPONSE=$(curl -s -X POST "$SERVER_URL/api/rooms/$ROOM_ID/items" \
  -H "Content-Type: application/json" \
  -d "{
    \"title\": \"The Matrix\",
    \"type\": \"movie\",
    \"year\": 1999,
    \"description\": \"A computer programmer discovers reality is a simulation\",
    \"image_url\": \"https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg\",
    \"tmdbId\": 603,
    \"rating\": 8.7,
    \"status\": \"planned\"
  }")

if echo "$ADD_RESPONSE" | jq -e '.id' > /dev/null 2>&1; then
    MEDIA_ID=$(echo "$ADD_RESPONSE" | jq -r '.id')
    echo "✅ Média ajouté à la room: ID $MEDIA_ID"
else
    echo "❌ Erreur lors de l'ajout du média"
    echo "Response: $ADD_RESPONSE"
fi

# Test 7: Récupérer les médias de la room
echo ""
echo "7. Récupération des médias de la room..."
ITEMS_RESPONSE=$(curl -s "$SERVER_URL/api/rooms/$ROOM_ID/items")
if echo "$ITEMS_RESPONSE" | jq -e '.[0].media.title' > /dev/null 2>&1; then
    ITEM_COUNT=$(echo "$ITEMS_RESPONSE" | jq '. | length')
    echo "✅ Médias récupérés: $ITEM_COUNT média(s)"
    
    if [ "$ITEM_COUNT" -gt 0 ]; then
        FIRST_MEDIA=$(echo "$ITEMS_RESPONSE" | jq -r '.[0].media.title')
        echo "   Premier média: $FIRST_MEDIA"
    fi
else
    echo "❌ Erreur lors de la récupération des médias"
fi

# Nettoyage
echo ""
echo "8. Nettoyage..."
curl -s -X DELETE "$SERVER_URL/api/rooms/$ROOM_ID" > /dev/null
echo "✅ Room de test supprimée"

echo ""
echo "🎉 Tests terminés !"
echo ""
echo "📱 Pour tester l'application mobile:"
echo "   1. cd mobile && npm start"
echo "   2. Scan le QR code avec Expo Go"
echo "   3. Créer ou rejoindre une room"
echo "   4. Rechercher un média et taper dessus pour voir les détails"
echo "   5. Depuis la room, taper sur un média pour voir les détails"
echo "   6. Tester les trailers et l'ajout à la watchlist"
echo ""
echo "🎬 Fonctionnalités à tester:"
echo "   - Navigation SearchScreen → MediaDetailScreen"
echo "   - Navigation RoomScreen → MediaDetailScreen"
echo "   - Affichage des détails du média (titre, synopsis, note, etc.)"
echo "   - Carrousel de trailers avec lecture YouTube"
echo "   - Ajout/modification du statut dans la watchlist"
echo "   - Partage du média"
echo "   - Boutons retour et actions"
