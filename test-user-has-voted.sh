#!/bin/bash

# Test simplifié du système userHasVoted

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

# Créer une room simple
echo "=== Création d'une room de test ==="
ROOM_RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" -d '{"name": "Vote Test Room"}' "$API_BASE/rooms")
echo "Room Response: $ROOM_RESPONSE"

ROOM_ID=$(echo "$ROOM_RESPONSE" | grep -o '"room_id":"[^"]*"' | cut -d'"' -f4)
log_info "Room ID: $ROOM_ID"

# Ajouter un média simple
echo -e "\n=== Ajout d'un média ==="
MEDIA_RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" \
  -d '{
    "title": "Test Movie",
    "type": "movie",
    "externalId": "tmdb:12345"
  }' \
  "$API_BASE/rooms/$ROOM_ID/items")
echo "Media Response: $MEDIA_RESPONSE"

# Récupérer les médias de la room
echo -e "\n=== Récupération des médias ==="
ITEMS_RESPONSE=$(curl -s "$API_BASE/rooms/$ROOM_ID/items")
echo "Items Response: $ITEMS_RESPONSE"

MEDIA_ID=$(echo "$ITEMS_RESPONSE" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
log_info "Media ID: $MEDIA_ID"

if [ -z "$MEDIA_ID" ]; then
    log_error "Impossible de récupérer l'ID du média"
    exit 1
fi

# Créer un vote
echo -e "\n=== Création d'un vote ==="
VOTE_RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" \
  -d '{
    "roomId": "'$ROOM_ID'",
    "title": "Test Vote",
    "description": "Vote de test",
    "mediaIds": ['$MEDIA_ID'],
    "createdBy": "Test User"
  }' \
  "$API_BASE/votes")
echo "Vote Response: $VOTE_RESPONSE"

VOTE_ID=$(echo "$VOTE_RESPONSE" | grep -o '"voteId":[0-9]*' | cut -d':' -f2)
log_info "Vote ID: $VOTE_ID"

if [ -z "$VOTE_ID" ]; then
    log_error "Impossible de créer le vote"
    exit 1
fi

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

# Récupérer l'option ID
OPTION_ID=$(echo "$VOTE_BEFORE" | grep -o '"id":[0-9]*' | tail -1 | cut -d':' -f2)
log_info "Option ID: $OPTION_ID"

# Test 2: Soumettre un vote
echo -e "\n=== Test 2: Soumission d'un vote ==="
SUBMIT_RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" \
  -d '{
    "voteId": '$VOTE_ID',
    "optionId": '$OPTION_ID',
    "voterName": "Test Voter",
    "deviceId": "'$TEST_DEVICE_ID'"
  }' \
  "$API_BASE/votes/submit")
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
echo "Vote After: $VOTE_AFTER"

USER_VOTED_AFTER=$(echo "$VOTE_AFTER" | grep -o '"userHasVoted":[^,}]*' | cut -d':' -f2)
log_info "userHasVoted APRÈS vote: $USER_VOTED_AFTER"

if [ "$USER_VOTED_AFTER" = "true" ]; then
    log_success "✓ userHasVoted correctement à true après le vote"
else
    log_error "✗ userHasVoted devrait être true, mais est: $USER_VOTED_AFTER"
fi

# Test 4: Tenter un double vote (doit échouer)
echo -e "\n=== Test 4: Tentative de double vote (doit échouer) ==="
DOUBLE_VOTE_RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" \
  -d '{
    "voteId": '$VOTE_ID',
    "optionId": '$OPTION_ID',
    "voterName": "Test Voter 2",
    "deviceId": "'$TEST_DEVICE_ID'"
  }' \
  "$API_BASE/votes/submit")
echo "Double Vote Response: $DOUBLE_VOTE_RESPONSE"

if echo "$DOUBLE_VOTE_RESPONSE" | grep -q '"error"'; then
    log_success "✓ Double vote correctement rejeté"
else
    log_error "✗ Le double vote devrait être rejeté"
fi

# Test 5: Vérifier avec un autre deviceId (doit permettre de voter)
echo -e "\n=== Test 5: Vote avec un autre deviceId ==="
OTHER_DEVICE_ID="other-device-456"
OTHER_VOTE_RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" \
  -d '{
    "voteId": '$VOTE_ID',
    "optionId": '$OPTION_ID',
    "voterName": "Other Voter",
    "deviceId": "'$OTHER_DEVICE_ID'"
  }' \
  "$API_BASE/votes/submit")
echo "Other Vote Response: $OTHER_VOTE_RESPONSE"

if echo "$OTHER_VOTE_RESPONSE" | grep -q '"success":true'; then
    log_success "✓ Vote avec autre deviceId autorisé"
else
    log_error "✗ Vote avec autre deviceId devrait être autorisé"
fi

# Résumé final
echo -e "\n=== RÉSUMÉ DES TESTS ==="
log_info "Room ID: $ROOM_ID"
log_info "Vote ID: $VOTE_ID"
log_info "Device ID 1: $TEST_DEVICE_ID"
log_info "Device ID 2: $OTHER_DEVICE_ID"

log_success "🎉 Tests du système userHasVoted terminés!"
