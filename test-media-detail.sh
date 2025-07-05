#!/bin/bash

# Test de l'implémentation du MediaDetailScreen
echo "🧪 Tests de l'implémentation MediaDetailScreen"
echo "=============================================="

# Variables
SERVER_URL="http://localhost:3000"
TMDB_ID="550"  # Fight Club
MEDIA_TYPE="movie"

# Test 1: Vérifier que le serveur est démarré
echo "1. Test de connexion au serveur..."
if curl -s "$SERVER_URL/api/health" > /dev/null; then
    echo "✅ Serveur accessible"
else
    echo "❌ Serveur non accessible. Démarrez le serveur avec: npm start"
    exit 1
fi

# Test 2: Test des détails d'un film
echo "2. Test des détails d'un film..."
RESPONSE=$(curl -s "$SERVER_URL/api/media/$MEDIA_TYPE/$TMDB_ID/details")
if echo "$RESPONSE" | jq -e '.title' > /dev/null 2>&1; then
    TITLE=$(echo "$RESPONSE" | jq -r '.title')
    echo "✅ Détails du film récupérés: $TITLE"
else
    echo "❌ Erreur lors de la récupération des détails du film"
    echo "Response: $RESPONSE"
fi

# Test 3: Test des trailers d'un film
echo "3. Test des trailers d'un film..."
RESPONSE=$(curl -s "$SERVER_URL/api/media/$MEDIA_TYPE/$TMDB_ID/trailers")
if echo "$RESPONSE" | jq -e '.trailers' > /dev/null 2>&1; then
    TRAILER_COUNT=$(echo "$RESPONSE" | jq '.trailers | length')
    echo "✅ Trailers récupérés: $TRAILER_COUNT trailer(s)"
else
    echo "❌ Erreur lors de la récupération des trailers"
    echo "Response: $RESPONSE"
fi

# Test 4: Test avec une série
echo "4. Test avec une série..."
SERIES_ID="1399"  # Game of Thrones
RESPONSE=$(curl -s "$SERVER_URL/api/media/series/$SERIES_ID/details")
if echo "$RESPONSE" | jq -e '.title' > /dev/null 2>&1; then
    TITLE=$(echo "$RESPONSE" | jq -r '.title')
    echo "✅ Détails de la série récupérés: $TITLE"
else
    echo "❌ Erreur lors de la récupération des détails de la série"
    echo "Response: $RESPONSE"
fi

# Test 5: Test avec un ID invalide
echo "5. Test avec un ID invalide..."
RESPONSE=$(curl -s "$SERVER_URL/api/media/movie/99999999/details")
if echo "$RESPONSE" | jq -e '.success == false' > /dev/null 2>&1; then
    echo "✅ Gestion d'erreur correcte pour ID invalide"
else
    echo "❌ Gestion d'erreur incorrecte pour ID invalide"
    echo "Response: $RESPONSE"
fi

# Test 6: Test avec un type de média invalide
echo "6. Test avec un type de média invalide..."
RESPONSE=$(curl -s -w "%{http_code}" "$SERVER_URL/api/media/invalid/123/details")
if echo "$RESPONSE" | grep -q "400"; then
    echo "✅ Gestion d'erreur correcte pour type invalide"
else
    echo "❌ Gestion d'erreur incorrecte pour type invalide"
fi

echo ""
echo "✅ Tests terminés !"
echo "💡 Prochaines étapes:"
echo "   - Démarrer l'application mobile: cd mobile && npm start"
echo "   - Tester la navigation vers MediaDetailScreen"
echo "   - Vérifier l'affichage des détails et trailers"
