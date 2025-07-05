#!/bin/bash

echo "🔄 Test de cycle complet: Ajout + Rechargement"
echo "=============================================="

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

# Créer une room pour ce test
log_info "Création d'une room de test..."
ROOM_DATA=$(curl -s -X POST http://localhost:3000/api/rooms \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Cycle Complet"}')

ROOM_ID=$(echo "$ROOM_DATA" | jq -r '.id')
ROOM_CODE=$(echo "$ROOM_DATA" | jq -r '.room_id')

log_info "Room créée: ID=$ROOM_ID, Code=$ROOM_CODE"

# === ÉTAPE 1: Ajout de Harry Potter ===
log_info "🎬 ÉTAPE 1: Ajout de Harry Potter via addItemToRoom"
SERVER_DATA='{
  "title": "Harry Potter à l'\''école des sorciers",
  "type": "movie",
  "external_id": "tmdb_movie_671",
  "description": "Harry Potter, un jeune orphelin...",
  "image_url": "https://image.tmdb.org/t/p/w500/fbxQ44VRdM2PVzHSNajUseUteem.jpg",
  "release_date": "2001-01-01",
  "note": 7.9
}'

ADDED_ITEM=$(curl -s -X POST "http://localhost:3000/api/rooms/$ROOM_CODE/items" \
  -H "Content-Type: application/json" \
  -d "$SERVER_DATA")

log_info "✅ Item ajouté (réponse addItemToRoom):"
echo "$ADDED_ITEM" | jq '{
  id: .id,
  title: .title,
  external_id: .external_id,
  image_url: .image_url,
  type: .type,
  status: .status
}'

# Mapping de retour addItemToRoom
ADDED_POSTER_URL=$(echo "$ADDED_ITEM" | jq -r '.image_url')
ADDED_EXTERNAL_ID=$(echo "$ADDED_ITEM" | jq -r '.external_id')
ADDED_TMDB_ID="undefined"

if [[ "$ADDED_EXTERNAL_ID" =~ ^tmdb_(movie|tv)_([0-9]+)$ ]]; then
    ADDED_TMDB_ID="${BASH_REMATCH[2]}"
fi

log_info "🔍 Mapping addItemToRoom:"
log_info "   - posterUrl: $ADDED_POSTER_URL"
log_info "   - tmdbId: $ADDED_TMDB_ID"
log_info "   - external_id: $ADDED_EXTERNAL_ID"

# === ÉTAPE 2: Rechargement via getRoomItems ===
log_info ""
log_info "🔄 ÉTAPE 2: Rechargement via getRoomItems"
ROOM_ITEMS=$(curl -s "http://localhost:3000/api/rooms/$ROOM_CODE/items")

RELOADED_HARRY=$(echo "$ROOM_ITEMS" | jq '.items[] | select(.title | contains("Harry Potter"))')

if [ -n "$RELOADED_HARRY" ]; then
    log_info "✅ Harry Potter rechargé via getRoomItems:"
    echo "$RELOADED_HARRY" | jq '{
      id: .id,
      title: .title,
      external_id: .external_id,
      image_url: .image_url,
      type: .type,
      status: .status
    }'
    
    # Mapping de retour getRoomItems
    RELOADED_POSTER_URL=$(echo "$RELOADED_HARRY" | jq -r '.image_url')
    RELOADED_EXTERNAL_ID=$(echo "$RELOADED_HARRY" | jq -r '.external_id')
    RELOADED_TMDB_ID="undefined"

    if [[ "$RELOADED_EXTERNAL_ID" =~ ^tmdb_(movie|tv)_([0-9]+)$ ]]; then
        RELOADED_TMDB_ID="${BASH_REMATCH[2]}"
    fi

    log_info "🔍 Mapping getRoomItems:"
    log_info "   - posterUrl: $RELOADED_POSTER_URL"
    log_info "   - tmdbId: $RELOADED_TMDB_ID"
    log_info "   - external_id: $RELOADED_EXTERNAL_ID"
else
    log_error "❌ Harry Potter non trouvé après rechargement"
fi

# === ÉTAPE 3: Comparaison ===
log_info ""
log_info "🔍 ÉTAPE 3: Comparaison des résultats"

if [ "$ADDED_POSTER_URL" = "$RELOADED_POSTER_URL" ]; then
    log_info "✅ posterUrl cohérent: $ADDED_POSTER_URL"
else
    log_error "❌ posterUrl incohérent:"
    log_error "   - addItemToRoom: $ADDED_POSTER_URL"
    log_error "   - getRoomItems: $RELOADED_POSTER_URL"
fi

if [ "$ADDED_TMDB_ID" = "$RELOADED_TMDB_ID" ]; then
    log_info "✅ tmdbId cohérent: $ADDED_TMDB_ID"
else
    log_error "❌ tmdbId incohérent:"
    log_error "   - addItemToRoom: $ADDED_TMDB_ID"
    log_error "   - getRoomItems: $RELOADED_TMDB_ID"
fi

if [ "$ADDED_EXTERNAL_ID" = "$RELOADED_EXTERNAL_ID" ]; then
    log_info "✅ external_id cohérent: $ADDED_EXTERNAL_ID"
else
    log_error "❌ external_id incohérent:"
    log_error "   - addItemToRoom: $ADDED_EXTERNAL_ID"
    log_error "   - getRoomItems: $RELOADED_EXTERNAL_ID"
fi

# === ÉTAPE 4: Test d'accessibilité ===
log_info ""
log_info "🌐 ÉTAPE 4: Test d'accessibilité des images"

if [ "$ADDED_POSTER_URL" != "null" ] && [ -n "$ADDED_POSTER_URL" ]; then
    HTTP_STATUS_ADDED=$(curl -s -o /dev/null -w "%{http_code}" "$ADDED_POSTER_URL")
    if [ "$HTTP_STATUS_ADDED" = "200" ]; then
        log_info "✅ Image addItemToRoom accessible (HTTP $HTTP_STATUS_ADDED)"
    else
        log_error "❌ Image addItemToRoom non accessible (HTTP $HTTP_STATUS_ADDED)"
    fi
else
    log_error "❌ Pas d'URL d'image addItemToRoom"
fi

if [ "$RELOADED_POSTER_URL" != "null" ] && [ -n "$RELOADED_POSTER_URL" ]; then
    HTTP_STATUS_RELOADED=$(curl -s -o /dev/null -w "%{http_code}" "$RELOADED_POSTER_URL")
    if [ "$HTTP_STATUS_RELOADED" = "200" ]; then
        log_info "✅ Image getRoomItems accessible (HTTP $HTTP_STATUS_RELOADED)"
    else
        log_error "❌ Image getRoomItems non accessible (HTTP $HTTP_STATUS_RELOADED)"
    fi
else
    log_error "❌ Pas d'URL d'image getRoomItems"
fi

# === RÉSUMÉ ===
echo ""
log_info "🎯 RÉSUMÉ DU TEST"
log_info "=================="
log_info "Room: $ROOM_CODE"
log_info "Cohérence posterUrl: $([ "$ADDED_POSTER_URL" = "$RELOADED_POSTER_URL" ] && echo "✅ OUI" || echo "❌ NON")"
log_info "Cohérence tmdbId: $([ "$ADDED_TMDB_ID" = "$RELOADED_TMDB_ID" ] && echo "✅ OUI" || echo "❌ NON")"
log_info "Image accessible: $([ "$HTTP_STATUS_RELOADED" = "200" ] && echo "✅ OUI" || echo "❌ NON")"

if [ "$ADDED_POSTER_URL" = "$RELOADED_POSTER_URL" ] && [ "$HTTP_STATUS_RELOADED" = "200" ]; then
    log_info "✅ Le mapping fonctionne correctement. L'image devrait s'afficher."
else
    log_error "❌ Il y a un problème dans le mapping. L'image pourrait ne pas s'afficher."
fi
