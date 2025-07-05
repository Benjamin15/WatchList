#!/bin/bash

# Test de validation de la correction MediaDetailScreen
echo "🎯 Test de validation des corrections MediaDetailScreen"
echo "=================================================="

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:3000"
ROOM_ID="99b2fac2c7c0"

echo -e "${YELLOW}📋 Test de la différenciation Astonishing X-Men vs Bumboo${NC}"

# Vérifier les items dans la room
echo "Vérification des items dans la room de test..."
ROOM_DATA=$(curl -s "$BASE_URL/api/rooms/$ROOM_ID/items")

echo "Items dans la room:"
echo "$ROOM_DATA" | jq '.items[] | {id, title, external_id, type}'

# Test des détails Astonishing X-Men (série)
echo -e "${YELLOW}📺 Test des détails Astonishing X-Men (série)${NC}"
ASTONISHING_DETAILS=$(curl -s "$BASE_URL/api/media/series/117657/details")
echo "Détails Astonishing X-Men:"
echo "$ASTONISHING_DETAILS" | jq '{title, overview, genres, vote_average}'

# Test des détails Bumboo (film)
echo -e "${YELLOW}🎬 Test des détails Bumboo (film)${NC}"
BUMBOO_DETAILS=$(curl -s "$BASE_URL/api/media/movie/117657/details")
echo "Détails Bumboo:"
echo "$BUMBOO_DETAILS" | jq '{title, overview, genres, vote_average}'

# Test des trailers
echo -e "${YELLOW}🎥 Test des trailers${NC}"
echo "Trailers Astonishing X-Men:"
ASTONISHING_TRAILERS=$(curl -s "$BASE_URL/api/media/series/117657/trailers")
echo "$ASTONISHING_TRAILERS" | jq '.trailers | length'

echo "Trailers Bumboo:"
BUMBOO_TRAILERS=$(curl -s "$BASE_URL/api/media/movie/117657/trailers")
echo "$BUMBOO_TRAILERS" | jq '.trailers | length'

# Test de l'extraction d'ID côté mobile
echo -e "${YELLOW}🔍 Test des fonctions d'extraction d'ID${NC}"

cat > test_extraction.js << 'EOF'
// Simulation des fonctions helpers du mobile
function extractTmdbId(media) {
  if (typeof media.tmdbId === 'number') {
    return media.tmdbId;
  }
  
  if (media.external_id && typeof media.external_id === 'string') {
    const newFormatMatch = media.external_id.match(/^tmdb_(movie|tv)_(\d+)$/);
    if (newFormatMatch) {
      return parseInt(newFormatMatch[2], 10);
    }
    
    const oldFormatMatch = media.external_id.match(/^tmdb_(\d+)$/);
    if (oldFormatMatch) {
      return parseInt(oldFormatMatch[1], 10);
    }
  }
  
  return null;
}

function extractMediaType(media) {
  if (media.external_id && typeof media.external_id === 'string') {
    const newFormatMatch = media.external_id.match(/^tmdb_(movie|tv)_(\d+)$/);
    if (newFormatMatch) {
      return newFormatMatch[1];
    }
  }
  
  if (media.type === 'series' || media.type === 'tv') {
    return 'tv';
  }
  
  return 'movie';
}

// Test avec les données d'Astonishing X-Men
const astonishingXMen = {
  id: 2,
  title: "Astonishing X-Men",
  type: "tv",
  external_id: "tmdb_tv_117657"
};

// Test avec les données de Bumboo
const bumboo = {
  id: 3,
  title: "Bumboo",
  type: "movie",
  external_id: "tmdb_movie_117657"
};

console.log('Test Astonishing X-Men:');
console.log('  TMDB ID:', extractTmdbId(astonishingXMen));
console.log('  Type TMDB:', extractMediaType(astonishingXMen));
console.log('  Type API:', extractMediaType(astonishingXMen) === 'tv' ? 'series' : 'movie');

console.log('Test Bumboo:');
console.log('  TMDB ID:', extractTmdbId(bumboo));
console.log('  Type TMDB:', extractMediaType(bumboo));
console.log('  Type API:', extractMediaType(bumboo) === 'tv' ? 'series' : 'movie');
EOF

node test_extraction.js
rm test_extraction.js

# Validation
echo -e "${YELLOW}📊 Validation des corrections${NC}"

ASTONISHING_TITLE=$(echo "$ASTONISHING_DETAILS" | jq -r '.title')
BUMBOO_TITLE=$(echo "$BUMBOO_DETAILS" | jq -r '.title')

if [ "$ASTONISHING_TITLE" = "Astonishing X-Men" ]; then
  echo -e "${GREEN}✅ Astonishing X-Men récupère les bons détails${NC}"
else
  echo -e "${RED}❌ Problème avec les détails d'Astonishing X-Men${NC}"
fi

if [ "$BUMBOO_TITLE" = "Bumboo" ]; then
  echo -e "${GREEN}✅ Bumboo récupère les bons détails${NC}"
else
  echo -e "${RED}❌ Problème avec les détails de Bumboo${NC}"
fi

# Test de recherche pour vérifier la différenciation
echo -e "${YELLOW}🔍 Test de recherche pour validation${NC}"
SEARCH_ASTONISHING=$(curl -s "$BASE_URL/api/search/autocomplete/astonishing")
echo "Résultat recherche Astonishing:"
echo "$SEARCH_ASTONISHING" | jq '.results[0] | {title, external_id, type}'

SEARCH_BUMBOO=$(curl -s "$BASE_URL/api/search/autocomplete/bumboo")
echo "Résultat recherche Bumboo:"
echo "$SEARCH_BUMBOO" | jq '.results[] | select(.title == "Bumboo") | {title, external_id, type}'

echo -e "${GREEN}🎉 Tests de validation terminés !${NC}"
echo -e "${YELLOW}📱 Vous pouvez maintenant tester l'application mobile avec la room: $ROOM_ID${NC}"
echo -e "${YELLOW}   - Astonishing X-Men devrait ouvrir la bonne fiche${NC}"
echo -e "${YELLOW}   - Bumboo devrait ouvrir la bonne fiche sans erreur de rendu${NC}"
