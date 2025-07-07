#!/bin/bash

# Test des notifications de vote avec différents statuts

API_BASE="http://localhost:3000/api"
TEST_DEVICE_ID="test-notification-device"

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m'

log_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }
log_warn() { echo -e "${YELLOW}⚠️  $1${NC}"; }

# Créer une room de test
echo "=== Création d'une room de test pour notifications ==="
ROOM_RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" -d '{"name": "Test Notification Room"}' "$API_BASE/rooms")
ROOM_ID=$(echo "$ROOM_RESPONSE" | jq -r '.room_id')
log_info "Room ID: $ROOM_ID"

# Ajouter des médias
echo -e "\n=== Ajout de médias ==="
for i in {1..3}; do
    MEDIA_RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" \
      -d '{
        "title": "Film Notification '$i'",
        "type": "movie",
        "description": "Genre '$i'"
      }' \
      "$API_BASE/rooms/$ROOM_ID/items")
done

# Récupérer les médias
ITEMS_RESPONSE=$(curl -s "$API_BASE/rooms/$ROOM_ID/items")
MEDIA_IDS=$(echo "$ITEMS_RESPONSE" | jq -r '.items[] | .id' | head -3 | tr '\n' ',' | sed 's/,$//')
log_info "Media IDs: $MEDIA_IDS"

# Test 1: Vote actif (2 minutes)
echo -e "\n=== Test 1: Vote actif (2 minutes) ==="
VOTE_ACTIVE_RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" \
  -d '{
    "roomId": "'$ROOM_ID'",
    "title": "Vote Actif - Film de ce soir",
    "description": "Un vote qui va expirer dans 2 minutes",
    "duration": 2,
    "durationUnit": "minutes",
    "mediaIds": ['$MEDIA_IDS'],
    "createdBy": "Test User Active"
  }' \
  "$API_BASE/votes")

if echo "$VOTE_ACTIVE_RESPONSE" | jq -e '.success' > /dev/null; then
    VOTE_ACTIVE_ID=$(echo "$VOTE_ACTIVE_RESPONSE" | jq -r '.data.voteId')
    log_success "Vote actif créé (ID: $VOTE_ACTIVE_ID)"
else
    log_error "Échec création vote actif"
fi

# Test 2: Vote permanent
echo -e "\n=== Test 2: Vote permanent ==="
VOTE_PERM_RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" \
  -d '{
    "roomId": "'$ROOM_ID'",
    "title": "Vote Permanent - Suggestions générales",
    "description": "Un vote qui ne finit jamais",
    "mediaIds": ['$MEDIA_IDS'],
    "createdBy": "Test User Permanent"
  }' \
  "$API_BASE/votes")

if echo "$VOTE_PERM_RESPONSE" | jq -e '.success' > /dev/null; then
    VOTE_PERM_ID=$(echo "$VOTE_PERM_RESPONSE" | jq -r '.data.voteId')
    log_success "Vote permanent créé (ID: $VOTE_PERM_ID)"
else
    log_error "Échec création vote permanent"
fi

# Test 3: Simuler un vote terminé (en modifiant directement la DB)
echo -e "\n=== Test 3: Simuler un vote terminé ==="
VOTE_COMPLETED_RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" \
  -d '{
    "roomId": "'$ROOM_ID'",
    "title": "Vote Terminé - Décision prise",
    "description": "Ce vote est déjà fini",
    "duration": 1,
    "durationUnit": "minutes",
    "mediaIds": ['$MEDIA_IDS'],
    "createdBy": "Test User Completed"
  }' \
  "$API_BASE/votes")

if echo "$VOTE_COMPLETED_RESPONSE" | jq -e '.success' > /dev/null; then
    VOTE_COMPLETED_ID=$(echo "$VOTE_COMPLETED_RESPONSE" | jq -r '.data.voteId')
    log_success "Vote à terminer créé (ID: $VOTE_COMPLETED_ID)"
    
    # Marquer le vote comme terminé (via l'API si elle existe, sinon attendre l'expiration)
    sleep 1
    log_info "Vote expirera automatiquement dans ~1 minute"
else
    log_error "Échec création vote à terminer"
fi

echo -e "\n=== Récupération des votes de la room ==="
VOTES_RESPONSE=$(curl -s "$API_BASE/votes/room/$ROOM_ID?deviceId=$TEST_DEVICE_ID")
echo "$VOTES_RESPONSE" | jq '.data[] | {id: .id, title: .title, status: .status, endsAt: .endsAt}'

echo -e "\n=== Instructions pour tester dans l'app mobile ==="
log_info "🏠 Room ID: $ROOM_ID"
log_success "✅ Allez dans cette room dans l'app mobile"
log_info "📱 Vous devriez voir les notifications de vote:"
log_info "   • Vote actif (badge EN COURS vert)"
log_info "   • Vote permanent (badge EN COURS vert)"
log_info "   • Après 1-2 min: Vote expiré (badge EXPIRÉ orange)"
log_warn "👆 Testez le swipe vers la gauche pour supprimer les notifications"

echo -e "\n=== Tests terminés ==="
log_success "Room prête pour tester les notifications de vote!"
log_info "Swipe ← pour supprimer les notifications"
log_info "Les statuts changent automatiquement selon l'expiration"
