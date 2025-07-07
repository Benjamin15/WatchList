#!/bin/bash

# Test simple avec vérification des IDs

API_BASE="http://localhost:3000/api"
TEST_DEVICE_ID="test-device-123"

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

log_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }

# Créer une room simple avec un nom unique
TIMESTAMP=$(date +%s)
ROOM_NAME="Vote Test Room $TIMESTAMP"

echo "=== Création d'une room de test ==="
ROOM_RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" -d "{\"name\": \"$ROOM_NAME\"}" "$API_BASE/rooms")
echo "Room Response: $ROOM_RESPONSE"

ROOM_ID=$(echo "$ROOM_RESPONSE" | grep -o '"room_id":"[^"]*"' | cut -d'"' -f4)
log_info "Room ID: $ROOM_ID"

# Ajouter 3 médias pour avoir du choix dans le vote
echo -e "\n=== Ajout de médias ==="
for i in 1 2 3; do
    MEDIA_RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" \
      -d "{
        \"title\": \"Test Movie $i\",
        \"type\": \"movie\",
        \"externalId\": \"tmdb:1234$i\",
        \"description\": \"Genre $i\"
      }" \
      "$API_BASE/rooms/$ROOM_ID/items")
    echo "Media $i Response: $MEDIA_RESPONSE"
done

# Récupérer les médias de la room et leurs vrais IDs
echo -e "\n=== Récupération des médias ==="
ITEMS_RESPONSE=$(curl -s "$API_BASE/rooms/$ROOM_ID/items")
echo "Items Response: $ITEMS_RESPONSE"

# Extraire les IDs des items (on prend les 3 premiers)
MEDIA_IDS=$(echo "$ITEMS_RESPONSE" | jq -r '.items[] | .id' | head -3 | tr '\n' ',' | sed 's/,$//')
log_info "Media IDs: $MEDIA_IDS"

if [ -z "$MEDIA_IDS" ]; then
    log_error "Impossible de récupérer les IDs des médias"
    exit 1
fi

# Créer un vote avec les bons IDs
echo -e "\n=== Création d'un vote ==="
VOTE_PAYLOAD="{
    \"roomId\": \"$ROOM_ID\",
    \"title\": \"Test Vote: Quel film regarder?\",
    \"description\": \"Vote de test pour valider le système userHasVoted\",
    \"mediaIds\": [$MEDIA_IDS],
    \"createdBy\": \"Test User\"
}"

echo "Vote Payload: $VOTE_PAYLOAD"

VOTE_RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" -d "$VOTE_PAYLOAD" "$API_BASE/votes")
echo "Vote Response: $VOTE_RESPONSE"

VOTE_ID=$(echo "$VOTE_RESPONSE" | grep -o '"voteId":[0-9]*' | cut -d':' -f2)
log_info "Vote ID: $VOTE_ID"

if [ -z "$VOTE_ID" ]; then
    log_error "Impossible de créer le vote"
    echo "Détails de l'erreur: $VOTE_RESPONSE"
    exit 1
fi

log_success "✓ Vote créé avec succès!"

# Test 1: Récupérer le vote AVANT d'avoir voté (userHasVoted doit être false)
echo -e "\n=== Test 1: Récupération vote AVANT vote ==="
VOTE_BEFORE=$(curl -s "$API_BASE/votes/$VOTE_ID?deviceId=$TEST_DEVICE_ID")
echo "Vote Before: $VOTE_BEFORE"

USER_VOTED_BEFORE=$(echo "$VOTE_BEFORE" | grep -o '"userHasVoted":[^,}]*' | cut -d':' -f2)
log_info "userHasVoted AVANT vote: $USER_VOTED_BEFORE"

if [ "$USER_VOTED_BEFORE" = "false" ]; then
    log_success "✓ userHasVoted correctement à false avant le vote"
else
    log_error "✗ userHasVoted devrait être false, mais est: $USER_VOTED_BEFORE"
fi

# Récupérer le premier option ID (pas media ID !)
OPTION_ID=$(echo "$VOTE_BEFORE" | jq -r '.data.options[0].id')
log_info "Option ID pour voter: $OPTION_ID"

if [ -z "$OPTION_ID" ]; then
    log_error "Impossible de récupérer l'option ID"
    exit 1
fi

# Test 2: Soumettre un vote
echo -e "\n=== Test 2: Soumission d'un vote ==="
SUBMIT_PAYLOAD="{
    \"voteId\": $VOTE_ID,
    \"optionId\": $OPTION_ID,
    \"voterName\": \"Test Voter\",
    \"deviceId\": \"$TEST_DEVICE_ID\"
}"

echo "Submit Payload: $SUBMIT_PAYLOAD"

SUBMIT_RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" -d "$SUBMIT_PAYLOAD" "$API_BASE/votes/submit")
echo "Submit Response: $SUBMIT_RESPONSE"

if echo "$SUBMIT_RESPONSE" | grep -q '"success":true'; then
    log_success "✓ Vote soumis avec succès"
else
    log_error "✗ Erreur lors de la soumission du vote"
    exit 1
fi

# Test 3: Récupérer le vote APRÈS avoir voté (userHasVoted doit être true)
echo -e "\n=== Test 3: Récupération vote APRÈS vote ==="
VOTE_AFTER=$(curl -s "$API_BASE/votes/$VOTE_ID?deviceId=$TEST_DEVICE_ID")
echo "Vote After (extrait): $(echo "$VOTE_AFTER" | head -c 200)..."

USER_VOTED_AFTER=$(echo "$VOTE_AFTER" | grep -o '"userHasVoted":[^,}]*' | cut -d':' -f2)
log_info "userHasVoted APRÈS vote: $USER_VOTED_AFTER"

if [ "$USER_VOTED_AFTER" = "true" ]; then
    log_success "✓ userHasVoted correctement à true après le vote"
else
    log_error "✗ userHasVoted devrait être true, mais est: $USER_VOTED_AFTER"
fi

# Test 4: Tenter un double vote (doit échouer)
echo -e "\n=== Test 4: Tentative de double vote (doit échouer) ==="
DOUBLE_VOTE_RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" -d "$SUBMIT_PAYLOAD" "$API_BASE/votes/submit")
echo "Double Vote Response: $DOUBLE_VOTE_RESPONSE"

if echo "$DOUBLE_VOTE_RESPONSE" | grep -q '"error"'; then
    log_success "✓ Double vote correctement rejeté"
else
    log_error "✗ Le double vote devrait être rejeté"
fi

# Résumé final
echo -e "\n=== RÉSUMÉ DES TESTS ==="
log_info "Room ID: $ROOM_ID"
log_info "Vote ID: $VOTE_ID"
log_info "Option ID: $OPTION_ID"
log_info "Device ID: $TEST_DEVICE_ID"

if [ "$USER_VOTED_BEFORE" = "false" ] && [ "$USER_VOTED_AFTER" = "true" ]; then
    log_success "🎉 Système userHasVoted fonctionne parfaitement!"
else
    log_error "🔧 Le système userHasVoted nécessite des corrections"
fi
