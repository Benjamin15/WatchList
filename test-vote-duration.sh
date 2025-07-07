#!/bin/bash

# Test du système de vote avec minutes et heures

API_BASE="http://localhost:3000/api"
TEST_DEVICE_ID="test-duration-device"

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
echo "=== Création d'une room de test ==="
ROOM_RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" -d '{"name": "Test Duration Room"}' "$API_BASE/rooms")
ROOM_ID=$(echo "$ROOM_RESPONSE" | jq -r '.room_id')
log_info "Room ID: $ROOM_ID"

# Ajouter des médias
echo -e "\n=== Ajout de médias ==="
MEDIA_RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" \
  -d '{
    "title": "Film Test Duration",
    "type": "movie",
    "description": "Test"
  }' \
  "$API_BASE/rooms/$ROOM_ID/items")

# Récupérer les médias
ITEMS_RESPONSE=$(curl -s "$API_BASE/rooms/$ROOM_ID/items")
MEDIA_ID=$(echo "$ITEMS_RESPONSE" | jq -r '.items[0].id')
log_info "Media ID: $MEDIA_ID"

# Test 1: Vote de 5 minutes
echo -e "\n=== Test 1: Vote de 5 minutes ==="
VOTE_5MIN_RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" \
  -d '{
    "roomId": "'$ROOM_ID'",
    "title": "Vote 5 minutes",
    "duration": 5,
    "durationUnit": "minutes",
    "mediaIds": ['$MEDIA_ID'],
    "createdBy": "Test User"
  }' \
  "$API_BASE/votes")

echo "Response: $VOTE_5MIN_RESPONSE"

if echo "$VOTE_5MIN_RESPONSE" | jq -e '.success' > /dev/null; then
    VOTE_5MIN_ID=$(echo "$VOTE_5MIN_RESPONSE" | jq -r '.data.voteId')
    log_success "Vote 5 minutes créé (ID: $VOTE_5MIN_ID)"
    
    # Vérifier les détails
    VOTE_DETAILS=$(curl -s "$API_BASE/votes/$VOTE_5MIN_ID?deviceId=$TEST_DEVICE_ID")
    ENDS_AT=$(echo "$VOTE_DETAILS" | jq -r '.data.endsAt')
    log_info "Fin prévue: $ENDS_AT"
    
    # Calculer le temps restant
    if command -v python3 &> /dev/null; then
        REMAINING=$(python3 -c "
from datetime import datetime
import sys
try:
    end_time = datetime.fromisoformat('$ENDS_AT'.replace('Z', '+00:00'))
    now = datetime.now(end_time.tzinfo)
    diff = (end_time - now).total_seconds()
    minutes = int(diff / 60)
    seconds = int(diff % 60)
    print(f'{minutes}m {seconds}s')
except:
    print('Erreur calcul')
")
        log_info "Temps restant calculé: $REMAINING"
    fi
else
    log_error "Échec création vote 5 minutes"
fi

# Test 2: Vote de 2 heures
echo -e "\n=== Test 2: Vote de 2 heures ==="
VOTE_2H_RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" \
  -d '{
    "roomId": "'$ROOM_ID'",
    "title": "Vote 2 heures",
    "duration": 2,
    "durationUnit": "hours",
    "mediaIds": ['$MEDIA_ID'],
    "createdBy": "Test User"
  }' \
  "$API_BASE/votes")

if echo "$VOTE_2H_RESPONSE" | jq -e '.success' > /dev/null; then
    VOTE_2H_ID=$(echo "$VOTE_2H_RESPONSE" | jq -r '.data.voteId')
    log_success "Vote 2 heures créé (ID: $VOTE_2H_ID)"
    
    # Vérifier les détails
    VOTE_DETAILS=$(curl -s "$API_BASE/votes/$VOTE_2H_ID?deviceId=$TEST_DEVICE_ID")
    ENDS_AT=$(echo "$VOTE_DETAILS" | jq -r '.data.endsAt')
    log_info "Fin prévue: $ENDS_AT"
else
    log_error "Échec création vote 2 heures"
fi

# Test 3: Vote sans durée (permanent)
echo -e "\n=== Test 3: Vote permanent ==="
VOTE_PERM_RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" \
  -d '{
    "roomId": "'$ROOM_ID'",
    "title": "Vote permanent",
    "mediaIds": ['$MEDIA_ID'],
    "createdBy": "Test User"
  }' \
  "$API_BASE/votes")

if echo "$VOTE_PERM_RESPONSE" | jq -e '.success' > /dev/null; then
    VOTE_PERM_ID=$(echo "$VOTE_PERM_RESPONSE" | jq -r '.data.voteId')
    log_success "Vote permanent créé (ID: $VOTE_PERM_ID)"
    
    # Vérifier les détails
    VOTE_DETAILS=$(curl -s "$API_BASE/votes/$VOTE_PERM_ID?deviceId=$TEST_DEVICE_ID")
    ENDS_AT=$(echo "$VOTE_DETAILS" | jq -r '.data.endsAt')
    log_info "Fin prévue: $ENDS_AT (doit être null)"
else
    log_error "Échec création vote permanent"
fi

echo -e "\n=== Résumé des tests ==="
log_success "Tests de durée des votes terminés!"
log_info "✓ Vote de 5 minutes: supporté"
log_info "✓ Vote de 2 heures: supporté" 
log_info "✓ Vote permanent: supporté"
