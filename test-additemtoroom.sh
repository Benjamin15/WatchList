#!/bin/bash

echo "📱 Test de simulation d'ajout via addItemToRoom"
echo "==============================================="

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction pour afficher les logs colorés
log_info() {
    echo -e "${GREEN}ℹ️  $1${NC}"
}

log_warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Créer une nouvelle room pour ce test
log_info "Création d'une room pour test addItemToRoom..."
ROOM_DATA=$(curl -s -X POST http://localhost:3000/api/rooms \
  -H "Content-Type: application/json" \
  -d '{"name":"Test addItemToRoom"}')

ROOM_ID=$(echo "$ROOM_DATA" | jq -r '.id')
ROOM_CODE=$(echo "$ROOM_DATA" | jq -r '.room_id')

log_info "Room créée: ID=$ROOM_ID, Code=$ROOM_CODE"

# Données Harry Potter comme elles seraient envoyées par l'app mobile
# (comme dans la fonction addItemToRoom du service API)
log_info "Préparation des données Harry Potter (format mobile)..."
MOBILE_MEDIA_DATA='{
  "title": "Harry Potter à l'\''école des sorciers",
  "type": "movie",
  "tmdbId": 671,
  "year": 2001,
  "genre": "Fantasy, Adventure",
  "description": "Harry Potter, un jeune orphelin...",
  "posterUrl": "https://image.tmdb.org/t/p/w500/fbxQ44VRdM2PVzHSNajUseUteem.jpg",
  "rating": 7.9
}'

# Simuler le mapping fait par addItemToRoom
log_info "🔄 Simulation du mapping dans addItemToRoom..."

# Extraction des données
TITLE=$(echo "$MOBILE_MEDIA_DATA" | jq -r '.title')
TYPE=$(echo "$MOBILE_MEDIA_DATA" | jq -r '.type')
TMDB_ID=$(echo "$MOBILE_MEDIA_DATA" | jq -r '.tmdbId')
POSTER_URL=$(echo "$MOBILE_MEDIA_DATA" | jq -r '.posterUrl')
YEAR=$(echo "$MOBILE_MEDIA_DATA" | jq -r '.year')

# Mapping exact du service mobile (après correction)
MAPPED_TYPE=$([ "$TYPE" = "series" ] && echo "tv" || echo "$TYPE")
MAPPED_EXTERNAL_ID="tmdb_${MAPPED_TYPE}_${TMDB_ID}"
MAPPED_IMAGE_URL="$POSTER_URL"
MAPPED_RELEASE_DATE="${YEAR}-01-01"

echo "📊 Données mappées pour le serveur:"
echo "  - title: $TITLE"
echo "  - type: $MAPPED_TYPE (original: $TYPE)"
echo "  - external_id: $MAPPED_EXTERNAL_ID"
echo "  - image_url: $MAPPED_IMAGE_URL"
echo "  - release_date: $MAPPED_RELEASE_DATE"

# Envoi au serveur (comme le ferait addItemToRoom)
log_info "📤 Envoi des données au serveur..."
SERVER_DATA=$(cat <<EOF
{
  "title": "$TITLE",
  "type": "$MAPPED_TYPE",
  "external_id": "$MAPPED_EXTERNAL_ID",
  "description": "Harry Potter, un jeune orphelin...",
  "image_url": "$MAPPED_IMAGE_URL",
  "release_date": "$MAPPED_RELEASE_DATE",
  "note": 7.9
}
EOF
)

ADDED_ITEM_RESPONSE=$(curl -s -X POST "http://localhost:3000/api/rooms/$ROOM_CODE/items" \
  -H "Content-Type: application/json" \
  -d "$SERVER_DATA")

log_info "✅ Réponse du serveur:"
echo "$ADDED_ITEM_RESPONSE" | jq '{
  id: .id,
  title: .title,
  external_id: .external_id,
  image_url: .image_url,
  type: .type,
  status: .status
}'

# Simulation du mapping de retour (comme dans addItemToRoom)
log_info "🔄 Simulation du mapping de retour dans addItemToRoom..."

# Extraction des données de la réponse
RESPONSE_EXTERNAL_ID=$(echo "$ADDED_ITEM_RESPONSE" | jq -r '.external_id')
RESPONSE_IMAGE_URL=$(echo "$ADDED_ITEM_RESPONSE" | jq -r '.image_url')
RESPONSE_STATUS=$(echo "$ADDED_ITEM_RESPONSE" | jq -r '.status')

# Simulation de extractTmdbId (après correction)
if [[ "$RESPONSE_EXTERNAL_ID" =~ ^tmdb_(movie|tv)_([0-9]+)$ ]]; then
    EXTRACTED_TMDB_ID="${BASH_REMATCH[2]}"
    log_info "✅ tmdbId extrait de la réponse: $EXTRACTED_TMDB_ID"
else
    log_error "❌ Impossible d'extraire le tmdbId depuis: $RESPONSE_EXTERNAL_ID"
    EXTRACTED_TMDB_ID="undefined"
fi

# Simulation de transformStatus
TRANSFORMED_STATUS="planned"  # Par défaut, nouveau statut
if [ "$RESPONSE_STATUS" = "en_cours" ]; then
    TRANSFORMED_STATUS="watching"
elif [ "$RESPONSE_STATUS" = "vu" ]; then
    TRANSFORMED_STATUS="completed"
fi

log_info "✅ Statut transformé: $RESPONSE_STATUS -> $TRANSFORMED_STATUS"

# Résultat final du mapping addItemToRoom
log_info "🎯 Résultat final du mapping addItemToRoom:"
echo "{"
echo "  \"id\": $(echo "$ADDED_ITEM_RESPONSE" | jq '.id'),"
echo "  \"roomId\": $ROOM_ID,"
echo "  \"mediaId\": $(echo "$ADDED_ITEM_RESPONSE" | jq '.id'),"
echo "  \"status\": \"$TRANSFORMED_STATUS\","
echo "  \"addedAt\": $(echo "$ADDED_ITEM_RESPONSE" | jq '.created_at'),"
echo "  \"media\": {"
echo "    \"id\": $(echo "$ADDED_ITEM_RESPONSE" | jq '.id'),"
echo "    \"title\": $(echo "$ADDED_ITEM_RESPONSE" | jq '.title'),"
echo "    \"type\": $(echo "$ADDED_ITEM_RESPONSE" | jq '.type'),"
echo "    \"year\": $YEAR,"
echo "    \"genre\": \"Fantasy, Adventure\","
echo "    \"description\": $(echo "$ADDED_ITEM_RESPONSE" | jq '.description'),"
echo "    \"posterUrl\": $(echo "$ADDED_ITEM_RESPONSE" | jq '.image_url'),"
echo "    \"rating\": $(echo "$ADDED_ITEM_RESPONSE" | jq '.note'),"
echo "    \"tmdbId\": $EXTRACTED_TMDB_ID,"
echo "    \"createdAt\": $(echo "$ADDED_ITEM_RESPONSE" | jq '.created_at'),"
echo "    \"updatedAt\": $(echo "$ADDED_ITEM_RESPONSE" | jq '.created_at')"
echo "  }"
echo "}"

# Vérification critique
log_info "🔍 Vérification critique:"
if [ "$RESPONSE_IMAGE_URL" != "null" ] && [ -n "$RESPONSE_IMAGE_URL" ]; then
    log_info "✅ posterUrl sera mappé: $RESPONSE_IMAGE_URL"
    
    # Test d'accessibilité
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$RESPONSE_IMAGE_URL")
    if [ "$HTTP_STATUS" = "200" ]; then
        log_info "✅ Image accessible (HTTP $HTTP_STATUS)"
    else
        log_error "❌ Image non accessible (HTTP $HTTP_STATUS)"
    fi
else
    log_error "❌ posterUrl sera null ou vide"
fi

echo ""
log_info "🎯 Test terminé!"
log_info "📋 Résumé:"
log_info "   - external_id mappé: $MAPPED_EXTERNAL_ID"
log_info "   - tmdbId extrait: $EXTRACTED_TMDB_ID"
log_info "   - posterUrl mappé: $RESPONSE_IMAGE_URL"
log_info "   - Image accessible: $([ "$HTTP_STATUS" = "200" ] && echo "OUI" || echo "NON")"
