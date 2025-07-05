#!/bin/bash

echo "🔧 Test de reproduction du problème Harry Potter"
echo "================================================"

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

# Vérifier que le serveur fonctionne
log_info "Vérification du serveur..."
if ! curl -s http://localhost:3000/api/health >/dev/null; then
    log_error "Le serveur n'est pas démarré. Veuillez lancer 'npm start' dans le dossier server."
    exit 1
fi

# Créer une room de test
log_info "Création d'une room de test..."
ROOM_DATA=$(curl -s -X POST http://localhost:3000/api/rooms \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Harry Potter"}')

ROOM_ID=$(echo "$ROOM_DATA" | jq -r '.id')
ROOM_CODE=$(echo "$ROOM_DATA" | jq -r '.room_id')

log_info "Room créée: ID=$ROOM_ID, Code=$ROOM_CODE"

# Ajouter Harry Potter à la room
log_info "Ajout de Harry Potter à la room..."
HARRY_POTTER_DATA='{
  "title": "Harry Potter à l'\''école des sorciers",
  "type": "movie",
  "external_id": "tmdb_movie_671",
  "description": "Harry Potter, un jeune orphelin, est élevé par son oncle Vernon et sa tante Pétunia qui le détestent. Alors qu'\''il était haut comme trois pommes, ces derniers lui ont raconté que ses parents étaient morts dans un accident de voiture. Le jour de son onzième anniversaire, Harry reçoit la visite d'\''un homme gigantesque se nommant Hagrid, et celui-ci lui révèle qu'\''il est en fait le fils de deux puissants magiciens et qu'\''il possède lui aussi d'\''extraordinaires pouvoirs.",
  "image_url": "https://image.tmdb.org/t/p/w500/fbxQ44VRdM2PVzHSNajUseUteem.jpg",
  "release_date": "2001-01-01",
  "note": 7.9
}'

ADDED_ITEM=$(curl -s -X POST "http://localhost:3000/api/rooms/$ROOM_CODE/items" \
  -H "Content-Type: application/json" \
  -d "$HARRY_POTTER_DATA")

log_info "Item ajouté: $(echo "$ADDED_ITEM" | jq -r '.title')"

# Vérifier les données dans la room
log_info "Vérification des données dans la room..."
ROOM_ITEMS=$(curl -s "http://localhost:3000/api/rooms/$ROOM_CODE/items")

# Afficher les détails de Harry Potter
HARRY_DETAILS=$(echo "$ROOM_ITEMS" | jq '.items[] | select(.title | contains("Harry Potter"))')

if [ -n "$HARRY_DETAILS" ]; then
    log_info "✅ Harry Potter trouvé dans la room:"
    echo "$HARRY_DETAILS" | jq '{
        id: .id,
        title: .title,
        external_id: .external_id,
        image_url: .image_url,
        type: .type
    }'
    
    # Vérifier l'accessibilité de l'image
    IMAGE_URL=$(echo "$HARRY_DETAILS" | jq -r '.image_url')
    if [ "$IMAGE_URL" != "null" ] && [ -n "$IMAGE_URL" ]; then
        log_info "🖼️  Test d'accessibilité de l'image: $IMAGE_URL"
        HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$IMAGE_URL")
        if [ "$HTTP_STATUS" = "200" ]; then
            log_info "✅ Image accessible (HTTP $HTTP_STATUS)"
        else
            log_error "❌ Image non accessible (HTTP $HTTP_STATUS)"
        fi
    else
        log_error "❌ Pas d'URL d'image trouvée"
    fi
else
    log_error "❌ Harry Potter non trouvé dans la room"
fi

# Simuler le mapping côté mobile
log_info "🔄 Simulation du mapping côté mobile..."
echo "$ROOM_ITEMS" | jq '.items[] | select(.title | contains("Harry Potter")) | {
    original_external_id: .external_id,
    original_image_url: .image_url,
    mapped_tmdb_id: (if .external_id then (.external_id | split("_")[2] | tonumber) else null end),
    mapped_poster_url: .image_url
}'

echo ""
log_info "🎯 Test terminé!"
log_info "📋 Points à vérifier:"
log_info "   1. L'image_url doit être présente et accessible"
log_info "   2. Le external_id doit être au format tmdb_movie_671"
log_info "   3. Le mapping côté mobile doit extraire correctement le tmdbId"
log_info "   4. La posterUrl doit être mappée depuis image_url"
