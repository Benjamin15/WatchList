#!/bin/bash

# Test de diagnostic pour l'image de Harry Potter
echo "🔍 Diagnostic de l'image Harry Potter à l'école des sorciers"
echo "========================================================="

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:3000"
ROOM_ID="99b2fac2c7c0"

echo -e "${YELLOW}📋 Vérification des données Harry Potter${NC}"

# Récupérer les données de Harry Potter dans la room
HARRY_POTTER_DATA=$(curl -s "$BASE_URL/api/rooms/$ROOM_ID/items" | jq '.items[] | select(.title | test("Harry Potter"))')

echo "Données Harry Potter dans la room:"
echo "$HARRY_POTTER_DATA" | jq '{id, title, external_id, image_url, type}'

# Extraire l'URL de l'image
IMAGE_URL=$(echo "$HARRY_POTTER_DATA" | jq -r '.image_url')
echo -e "${YELLOW}🖼️ URL de l'image: $IMAGE_URL${NC}"

# Tester l'accessibilité de l'image
echo -e "${YELLOW}🌐 Test d'accessibilité de l'image${NC}"
HTTP_STATUS=$(curl -o /dev/null -s -w "%{http_code}" "$IMAGE_URL")
echo "Statut HTTP de l'image: $HTTP_STATUS"

if [ "$HTTP_STATUS" = "200" ]; then
  echo -e "${GREEN}✅ Image accessible${NC}"
  
  # Obtenir les headers de l'image
  echo -e "${YELLOW}📄 Headers de l'image:${NC}"
  curl -I -s "$IMAGE_URL" | head -10
  
  # Taille de l'image
  IMAGE_SIZE=$(curl -s "$IMAGE_URL" | wc -c)
  echo -e "${YELLOW}📏 Taille de l'image: $IMAGE_SIZE bytes${NC}"
else
  echo -e "${RED}❌ Image non accessible (HTTP $HTTP_STATUS)${NC}"
fi

# Vérifier d'autres films pour comparaison
echo -e "${YELLOW}🔍 Comparaison avec d'autres films${NC}"

OTHER_ITEMS=$(curl -s "$BASE_URL/api/rooms/$ROOM_ID/items" | jq '.items[] | select(.title != "Harry Potter à l'\''école des sorciers") | {title, image_url} | select(.image_url != null)')

echo "Autres films avec images:"
echo "$OTHER_ITEMS"

# Test de quelques autres images
echo -e "${YELLOW}🧪 Test d'autres images${NC}"
OTHER_IMAGE_URLS=$(curl -s "$BASE_URL/api/rooms/$ROOM_ID/items" | jq -r '.items[] | select(.title != "Harry Potter à l'\''école des sorciers" and .image_url != null) | .image_url' | head -2)

for url in $OTHER_IMAGE_URLS; do
  status=$(curl -o /dev/null -s -w "%{http_code}" "$url")
  echo "Image $url: HTTP $status"
done

# Test de l'API TMDB directement
echo -e "${YELLOW}🎬 Test de l'API TMDB pour Harry Potter${NC}"
TMDB_DETAILS=$(curl -s "$BASE_URL/api/media/movie/671/details")
TMDB_TITLE=$(echo "$TMDB_DETAILS" | jq -r '.title')
TMDB_POSTER=$(echo "$TMDB_DETAILS" | jq -r '.poster_path // .posterUrl // empty')

echo "Détails TMDB:"
echo "  Titre: $TMDB_TITLE"
echo "  Poster: $TMDB_POSTER"

if [ "$TMDB_POSTER" != "" ] && [ "$TMDB_POSTER" != "null" ]; then
  # Si c'est un chemin relatif, construire l'URL complète
  if [[ "$TMDB_POSTER" == /* ]]; then
    FULL_TMDB_URL="https://image.tmdb.org/t/p/w500$TMDB_POSTER"
  else
    FULL_TMDB_URL="$TMDB_POSTER"
  fi
  
  echo "  URL complète: $FULL_TMDB_URL"
  
  TMDB_STATUS=$(curl -o /dev/null -s -w "%{http_code}" "$FULL_TMDB_URL")
  echo "  Statut HTTP TMDB: $TMDB_STATUS"
fi

# Diagnostic des logs côté mobile
echo -e "${YELLOW}📱 Simulation du mapping côté mobile${NC}"

cat > test_mapping.js << 'EOF'
// Simulation du mapping côté mobile
const item = {
  "id": 8,
  "title": "Harry Potter à l'école des sorciers",
  "external_id": "tmdb_movie_671",
  "image_url": "https://image.tmdb.org/t/p/w500/fbxQ44VRdM2PVzHSNajUseUteem.jpg",
  "type": "movie",
  "status": "a_voir",
  "created_at": "2025-07-05T05:05:30.447Z"
};

function extractTmdbId(externalId) {
  if (!externalId) return null;
  
  const newFormatMatch = externalId.match(/^tmdb_(movie|tv)_(\d+)$/);
  if (newFormatMatch) {
    return parseInt(newFormatMatch[2], 10);
  }
  
  const oldFormatMatch = externalId.match(/^tmdb_(\d+)$/);
  if (oldFormatMatch) {
    return parseInt(oldFormatMatch[1], 10);
  }
  
  return null;
}

// Transformation comme dans api.ts
const transformedItem = {
  id: item.id,
  roomId: 1, // Simulé
  mediaId: item.id,
  status: item.status,
  addedAt: item.created_at,
  media: {
    id: item.id,
    title: item.title,
    type: item.type,
    year: item.release_date ? new Date(item.release_date).getFullYear() : undefined,
    genre: undefined,
    description: item.description,
    posterUrl: item.image_url, // ← Point critique
    rating: item.note,
    tmdbId: extractTmdbId(item.external_id),
    createdAt: item.created_at,
    updatedAt: item.created_at,
  },
};

console.log('Item original:', item.title);
console.log('  image_url:', item.image_url);
console.log('Item transformé:');
console.log('  media.posterUrl:', transformedItem.media.posterUrl);
console.log('  media.tmdbId:', transformedItem.media.tmdbId);
EOF

node test_mapping.js
rm test_mapping.js

echo -e "${GREEN}🎯 Diagnostic terminé !${NC}"
echo -e "${YELLOW}📋 Points à vérifier côté mobile:${NC}"
echo "  1. Vérifier les logs de l'app mobile pour les erreurs d'image"
echo "  2. Vérifier si l'URL est bien reçue dans RoomScreen"
echo "  3. Vérifier si il y a des erreurs de chargement d'image"
echo "  4. Room de test: $ROOM_ID"
