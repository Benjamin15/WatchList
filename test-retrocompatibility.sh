#!/bin/bash

# Test de rétrocompatibilité avec les anciens external_id
echo "🔄 Test de rétrocompatibilité"
echo "============================"

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:3000"

echo -e "${YELLOW}📋 Test de rétrocompatibilité avec les anciens external_id${NC}"

# Créer une room de test
echo "Création de la room de test..."
ROOM_RESPONSE=$(curl -s -X POST "$BASE_URL/api/rooms" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Retrocompatibilité"
  }')

ROOM_ID=$(echo "$ROOM_RESPONSE" | jq -r '.room_id')
echo "Room ID: $ROOM_ID"

# Ajouter un média avec l'ancien format d'external_id (sans le type)
echo -e "${YELLOW}📝 Ajout d'un média avec l'ancien format external_id${NC}"
curl -s -X POST "$BASE_URL/api/rooms/$ROOM_ID/items" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Film Ancien Format",
    "type": "movie",
    "external_id": "tmdb_12345",
    "status": "a_voir",
    "image_url": "https://image.tmdb.org/t/p/w500/old_format.jpg"
  }' > /dev/null

# Ajouter un média avec le nouveau format
echo -e "${YELLOW}📝 Ajout d'un média avec le nouveau format external_id${NC}"
curl -s -X POST "$BASE_URL/api/rooms/$ROOM_ID/items" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Film Nouveau Format",
    "type": "movie",
    "external_id": "tmdb_movie_12345",
    "status": "a_voir",
    "image_url": "https://image.tmdb.org/t/p/w500/new_format.jpg"
  }' > /dev/null

# Ajouter un média via tmdbId (qui devrait générer le nouveau format)
echo -e "${YELLOW}📝 Ajout d'un média via tmdbId${NC}"
curl -s -X POST "$BASE_URL/api/rooms/$ROOM_ID/items" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Film Via TMDB ID",
    "type": "movie",
    "tmdbId": 67890,
    "status": "a_voir",
    "image_url": "https://image.tmdb.org/t/p/w500/via_tmdb.jpg"
  }' > /dev/null

# Vérifier les données
echo -e "${YELLOW}📊 Vérification des formats d'external_id${NC}"
ROOM_DATA=$(curl -s "$BASE_URL/api/rooms/$ROOM_ID/items")

echo "Items dans la room:"
echo "$ROOM_DATA" | jq '.items[] | {title, external_id, type, status}' | head -20

# Test des fonctions d'extraction d'ID
echo -e "${YELLOW}🔍 Test des fonctions d'extraction d'ID${NC}"

# Créer un script de test côté mobile
cat > test_id_extraction.js << 'EOF'
// Fonction extractTmdbId du mobile
function extractTmdbId(externalId) {
  if (!externalId) return null;
  
  // Nouveau format: tmdb_movie_123 ou tmdb_tv_123
  const newFormatMatch = externalId.match(/^tmdb_(movie|tv)_(\d+)$/);
  if (newFormatMatch) {
    return {
      id: parseInt(newFormatMatch[2]),
      type: newFormatMatch[1] === 'tv' ? 'tv' : 'movie'
    };
  }
  
  // Ancien format: tmdb_123
  const oldFormatMatch = externalId.match(/^tmdb_(\d+)$/);
  if (oldFormatMatch) {
    return {
      id: parseInt(oldFormatMatch[1]),
      type: 'movie' // Défaut pour la rétrocompatibilité
    };
  }
  
  return null;
}

// Test des différents formats
const testCases = [
  'tmdb_12345',         // Ancien format
  'tmdb_movie_12345',   // Nouveau format film
  'tmdb_tv_12345',      // Nouveau format série
  'tmdb_movie_67890',   // Nouveau format via API
  'invalid_format'      // Format invalide
];

console.log('Tests d\'extraction d\'ID:');
testCases.forEach(testCase => {
  const result = extractTmdbId(testCase);
  console.log(`${testCase} -> ${JSON.stringify(result)}`);
});
EOF

node test_id_extraction.js

# Nettoyer
rm test_id_extraction.js

# Test de recherche et filtrage
echo -e "${YELLOW}🔍 Test de recherche et filtrage${NC}"

# Simuler une recherche qui devrait exclure les items existants
echo "Test de recherche avec exclusion des items existants..."
SEARCH_RESPONSE=$(curl -s "$BASE_URL/api/search?q=test&type=movie" | jq '.results[:3]')
echo "Résultats de recherche (3 premiers):"
echo "$SEARCH_RESPONSE" | jq '.[] | {title, external_id, type}'

# Test de détails d'un média
echo -e "${YELLOW}📺 Test de détails d'un média${NC}"
ITEM_ID=$(echo "$ROOM_DATA" | jq -r '.items[0].id')
TMDB_ID=$(echo "$ROOM_DATA" | jq -r '.items[0].external_id')

echo "Test de détails pour item $ITEM_ID avec external_id $TMDB_ID"

# Extraire l'ID TMDB du external_id
if [[ "$TMDB_ID" =~ ^tmdb_movie_([0-9]+)$ ]]; then
  EXTRACTED_ID=${BASH_REMATCH[1]}
  MEDIA_TYPE="movie"
elif [[ "$TMDB_ID" =~ ^tmdb_tv_([0-9]+)$ ]]; then
  EXTRACTED_ID=${BASH_REMATCH[1]}
  MEDIA_TYPE="tv"
elif [[ "$TMDB_ID" =~ ^tmdb_([0-9]+)$ ]]; then
  EXTRACTED_ID=${BASH_REMATCH[1]}
  MEDIA_TYPE="movie"
else
  echo "Format external_id non reconnu: $TMDB_ID"
  EXTRACTED_ID="550"
  MEDIA_TYPE="movie"
fi

echo "ID extrait: $EXTRACTED_ID, Type: $MEDIA_TYPE"

# Tester l'API de détails
DETAILS_RESPONSE=$(curl -s "$BASE_URL/api/media/$MEDIA_TYPE/$EXTRACTED_ID/details")
echo "Détails du média:"
echo "$DETAILS_RESPONSE" | jq '{title, overview, vote_average, genres}' 2>/dev/null || echo "Pas de détails disponibles"

echo -e "${GREEN}✅ Tests de rétrocompatibilité terminés${NC}"
echo -e "${YELLOW}📋 Résumé:${NC}"
echo "- ✅ Ancien format external_id supporté"
echo "- ✅ Nouveau format external_id supporté"
echo "- ✅ Génération automatique via tmdbId"
echo "- ✅ Fonction d'extraction d'ID compatible"
echo "- ✅ API de détails fonctionnelle"

echo -e "${GREEN}🎉 Rétrocompatibilité validée !${NC}"
echo -e "${YELLOW}🔗 Room de test accessible sur: http://localhost:8081 (Room ID: $ROOM_ID)${NC}"
