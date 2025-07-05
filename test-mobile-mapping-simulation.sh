#!/bin/bash

echo "📱 Test de simulation du mapping côté mobile"
echo "==========================================="

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

# Récupérer les données de Harry Potter depuis l'API
log_info "Récupération des données de Harry Potter..."
ROOM_ITEMS=$(curl -s "http://localhost:3000/api/rooms/b2a8a5f0de96/items")

# Extraire Harry Potter
HARRY_POTTER=$(echo "$ROOM_ITEMS" | jq '.items[] | select(.title | contains("Harry Potter"))')

if [ -z "$HARRY_POTTER" ]; then
    log_error "Harry Potter non trouvé dans la room"
    exit 1
fi

log_info "✅ Harry Potter trouvé"

# Simuler le mapping exact du service API mobile
log_info "🔄 Simulation du mapping côté mobile (getRoomItems)..."

# Données originales
ORIGINAL_EXTERNAL_ID=$(echo "$HARRY_POTTER" | jq -r '.external_id')
ORIGINAL_IMAGE_URL=$(echo "$HARRY_POTTER" | jq -r '.image_url')
ORIGINAL_TITLE=$(echo "$HARRY_POTTER" | jq -r '.title')

echo "📊 Données originales:"
echo "  - external_id: $ORIGINAL_EXTERNAL_ID"
echo "  - image_url: $ORIGINAL_IMAGE_URL"
echo "  - title: $ORIGINAL_TITLE"

# Simuler extractTmdbId
log_info "🔍 Extraction du tmdbId..."
if [[ "$ORIGINAL_EXTERNAL_ID" =~ ^tmdb_(movie|tv)_([0-9]+)$ ]]; then
    EXTRACTED_TMDB_ID="${BASH_REMATCH[2]}"
    log_info "✅ tmdbId extrait: $EXTRACTED_TMDB_ID"
else
    log_error "❌ Impossible d'extraire le tmdbId depuis: $ORIGINAL_EXTERNAL_ID"
    EXTRACTED_TMDB_ID="undefined"
fi

# Simuler le mapping complet
log_info "🗺️  Mapping complet vers WatchlistItem..."
echo "{"
echo "  \"id\": $(echo "$HARRY_POTTER" | jq '.id'),"
echo "  \"roomId\": $(echo "$ROOM_ITEMS" | jq '.room.id'),"
echo "  \"mediaId\": $(echo "$HARRY_POTTER" | jq '.id'),"
echo "  \"status\": \"planned\","
echo "  \"addedAt\": $(echo "$HARRY_POTTER" | jq '.created_at'),"
echo "  \"media\": {"
echo "    \"id\": $(echo "$HARRY_POTTER" | jq '.id'),"
echo "    \"title\": $(echo "$HARRY_POTTER" | jq '.title'),"
echo "    \"type\": $(echo "$HARRY_POTTER" | jq '.type'),"
echo "    \"year\": $(echo "$HARRY_POTTER" | jq '.release_date | split("-")[0] | tonumber'),"
echo "    \"genre\": null,"
echo "    \"description\": $(echo "$HARRY_POTTER" | jq '.description'),"
echo "    \"posterUrl\": $(echo "$HARRY_POTTER" | jq '.image_url'),"
echo "    \"rating\": $(echo "$HARRY_POTTER" | jq '.note'),"
echo "    \"tmdbId\": $EXTRACTED_TMDB_ID,"
echo "    \"createdAt\": $(echo "$HARRY_POTTER" | jq '.created_at'),"
echo "    \"updatedAt\": $(echo "$HARRY_POTTER" | jq '.created_at')"
echo "  }"
echo "}"

# Test critique : vérifier que posterUrl est bien mappé
POSTER_URL=$(echo "$HARRY_POTTER" | jq -r '.image_url')
if [ "$POSTER_URL" != "null" ] && [ -n "$POSTER_URL" ]; then
    log_info "✅ posterUrl mappé correctement: $POSTER_URL"
    
    # Vérifier l'accessibilité
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$POSTER_URL")
    if [ "$HTTP_STATUS" = "200" ]; then
        log_info "✅ Image accessible via posterUrl (HTTP $HTTP_STATUS)"
    else
        log_error "❌ Image non accessible via posterUrl (HTTP $HTTP_STATUS)"
    fi
else
    log_error "❌ posterUrl non mappé ou null"
fi

# Simulation du rendu dans RoomScreen
log_info "🎬 Simulation du rendu dans RoomScreen..."
echo "Dans renderMediaPoster, l'item aurait les propriétés suivantes:"
echo "  - item.media.posterUrl: $POSTER_URL"
echo "  - item.media.type: $(echo "$HARRY_POTTER" | jq -r '.type')"
echo "  - item.id: $(echo "$HARRY_POTTER" | jq -r '.id')"

# Vérifier la logique de renderMediaPoster
if [ "$POSTER_URL" != "null" ] && [ -n "$POSTER_URL" ]; then
    log_info "✅ Logique renderMediaPoster: Image sera affichée"
    log_info "   Component: <Image source={{ uri: '$POSTER_URL' }} />"
else
    log_warn "⚠️  Logique renderMediaPoster: Fallback emoji sera affiché"
    MEDIA_TYPE=$(echo "$HARRY_POTTER" | jq -r '.type')
    if [ "$MEDIA_TYPE" = "movie" ]; then
        log_info "   Component: <Text>🎬</Text>"
    else
        log_info "   Component: <Text>📺</Text>"
    fi
fi

echo ""
log_info "🎯 Test de simulation terminé!"
log_info "📋 Résumé:"
log_info "   - external_id: $ORIGINAL_EXTERNAL_ID"
log_info "   - tmdbId extrait: $EXTRACTED_TMDB_ID"
log_info "   - posterUrl mappé: $POSTER_URL"
log_info "   - Image accessible: $([ "$HTTP_STATUS" = "200" ] && echo "OUI" || echo "NON")"
