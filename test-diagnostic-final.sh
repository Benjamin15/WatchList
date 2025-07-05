#!/bin/bash

echo "🔍 Diagnostic du problème de miniature Harry Potter"
echo "================================================="

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

# Créer une room et ajouter Harry Potter
log_info "Préparation de l'environnement de test..."
ROOM_DATA=$(curl -s -X POST http://localhost:3000/api/rooms \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Miniature Harry Potter"}')

ROOM_ID=$(echo "$ROOM_DATA" | jq -r '.id')
ROOM_CODE=$(echo "$ROOM_DATA" | jq -r '.room_id')

log_info "Room créée: $ROOM_CODE"

# Ajouter Harry Potter exactement comme le ferait l'app mobile
log_info "Ajout de Harry Potter via l'API mobile..."

# Simuler l'ajout via SearchScreen -> addItemToRoom
SEARCH_RESULT='{
  "title": "Harry Potter à l'\''école des sorciers",
  "type": "movie",
  "tmdbId": 671,
  "year": 2001,
  "genre": "Fantasy, Adventure",
  "description": "Harry Potter, un jeune orphelin...",
  "posterUrl": "https://image.tmdb.org/t/p/w500/fbxQ44VRdM2PVzHSNajUseUteem.jpg",
  "rating": 7.9
}'

# Mapping comme le ferait addItemToRoom (après notre correction)
TITLE=$(echo "$SEARCH_RESULT" | jq -r '.title')
TYPE=$(echo "$SEARCH_RESULT" | jq -r '.type')
TMDB_ID=$(echo "$SEARCH_RESULT" | jq -r '.tmdbId')
POSTER_URL=$(echo "$SEARCH_RESULT" | jq -r '.posterUrl')
YEAR=$(echo "$SEARCH_RESULT" | jq -r '.year')

SERVER_DATA=$(cat <<EOF
{
  "title": "$TITLE",
  "type": "$TYPE",
  "external_id": "tmdb_${TYPE}_${TMDB_ID}",
  "description": "Harry Potter, un jeune orphelin...",
  "image_url": "$POSTER_URL",
  "release_date": "${YEAR}-01-01",
  "note": 7.9
}
EOF
)

# Ajouter à la room
ADDED_ITEM=$(curl -s -X POST "http://localhost:3000/api/rooms/$ROOM_CODE/items" \
  -H "Content-Type: application/json" \
  -d "$SERVER_DATA")

log_info "✅ Harry Potter ajouté"

# Simuler le comportement de l'app mobile
log_info "🔄 Simulation du comportement de l'app mobile..."

# 1. Données retournées par addItemToRoom
ADDED_POSTER_URL=$(echo "$ADDED_ITEM" | jq -r '.image_url')
ADDED_EXTERNAL_ID=$(echo "$ADDED_ITEM" | jq -r '.external_id')

# Extraction du tmdbId (après notre correction)
ADDED_TMDB_ID="undefined"
if [[ "$ADDED_EXTERNAL_ID" =~ ^tmdb_(movie|tv)_([0-9]+)$ ]]; then
    ADDED_TMDB_ID="${BASH_REMATCH[2]}"
fi

log_info "📤 Données retournées par addItemToRoom:"
log_info "   - posterUrl: $ADDED_POSTER_URL"
log_info "   - tmdbId: $ADDED_TMDB_ID"
log_info "   - external_id: $ADDED_EXTERNAL_ID"

# 2. Données rechargées par getRoomItems (comme dans useFocusEffect)
ROOM_ITEMS=$(curl -s "http://localhost:3000/api/rooms/$ROOM_CODE/items")
RELOADED_HARRY=$(echo "$ROOM_ITEMS" | jq '.items[] | select(.title | contains("Harry Potter"))')

RELOADED_POSTER_URL=$(echo "$RELOADED_HARRY" | jq -r '.image_url')
RELOADED_EXTERNAL_ID=$(echo "$RELOADED_HARRY" | jq -r '.external_id')

# Extraction du tmdbId
RELOADED_TMDB_ID="undefined"
if [[ "$RELOADED_EXTERNAL_ID" =~ ^tmdb_(movie|tv)_([0-9]+)$ ]]; then
    RELOADED_TMDB_ID="${BASH_REMATCH[2]}"
fi

log_info "📥 Données rechargées par getRoomItems:"
log_info "   - posterUrl: $RELOADED_POSTER_URL"
log_info "   - tmdbId: $RELOADED_TMDB_ID"
log_info "   - external_id: $RELOADED_EXTERNAL_ID"

# 3. Simulation du rendu dans RoomScreen
log_info "🎬 Simulation du rendu dans RoomScreen..."

# Simuler l'état imageErrors (vide au début)
IMAGE_ERRORS_HAS_ITEM=false

# Simuler renderMediaPoster
if [ "$RELOADED_POSTER_URL" != "null" ] && [ -n "$RELOADED_POSTER_URL" ] && [ "$IMAGE_ERRORS_HAS_ITEM" = false ]; then
    log_info "✅ renderMediaPoster affichera l'image:"
    log_info "   <Image source={{ uri: '$RELOADED_POSTER_URL' }} />"
    
    # Test d'accessibilité
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$RELOADED_POSTER_URL")
    if [ "$HTTP_STATUS" = "200" ]; then
        log_info "✅ Image accessible (HTTP $HTTP_STATUS)"
    else
        log_error "❌ Image non accessible (HTTP $HTTP_STATUS)"
    fi
else
    log_warn "⚠️  renderMediaPoster affichera le fallback emoji:"
    log_info "   <Text>🎬</Text>"
    log_info "   Raisons possibles:"
    log_info "   - posterUrl null: $([ "$RELOADED_POSTER_URL" = "null" ] && echo "OUI" || echo "NON")"
    log_info "   - posterUrl vide: $([ -z "$RELOADED_POSTER_URL" ] && echo "OUI" || echo "NON")"
    log_info "   - Image en erreur: $IMAGE_ERRORS_HAS_ITEM"
fi

# 4. Diagnostic final
log_info ""
log_info "🎯 DIAGNOSTIC FINAL"
log_info "=================="

# Vérifier la cohérence
if [ "$ADDED_POSTER_URL" = "$RELOADED_POSTER_URL" ]; then
    log_info "✅ Cohérence des données: OK"
else
    log_error "❌ Incohérence des données:"
    log_error "   - addItemToRoom: $ADDED_POSTER_URL"
    log_error "   - getRoomItems: $RELOADED_POSTER_URL"
fi

# Vérifier l'URL d'image
if [ "$RELOADED_POSTER_URL" != "null" ] && [ -n "$RELOADED_POSTER_URL" ]; then
    log_info "✅ URL d'image: Présente"
    
    # Vérifier l'accessibilité
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$RELOADED_POSTER_URL")
    if [ "$HTTP_STATUS" = "200" ]; then
        log_info "✅ Accessibilité: OK"
    else
        log_error "❌ Accessibilité: KO (HTTP $HTTP_STATUS)"
    fi
else
    log_error "❌ URL d'image: Manquante"
fi

# Conclusion
if [ "$RELOADED_POSTER_URL" != "null" ] && [ -n "$RELOADED_POSTER_URL" ] && [ "$HTTP_STATUS" = "200" ]; then
    log_info "✅ CONCLUSION: L'image DEVRAIT s'afficher dans l'app mobile"
    log_info "   Si elle ne s'affiche pas, le problème est probablement:"
    log_info "   1. Cache d'image dans expo-image"
    log_info "   2. État imageErrors dans RoomScreen"
    log_info "   3. Problème de timing de chargement"
else
    log_error "❌ CONCLUSION: L'image NE DEVRAIT PAS s'afficher"
fi

echo ""
log_info "🧪 Pour tester dans l'app mobile:"
log_info "   - Room Code: $ROOM_CODE"
log_info "   - Image URL: $RELOADED_POSTER_URL"
log_info "   - Vérifiez les logs de RoomScreen renderMediaPoster"
