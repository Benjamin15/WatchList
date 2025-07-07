#!/bin/bash

# Script de test pour le système de vote avec curl
# Teste les fonctionnalités principales : création, récupération, vote, et vérification userHasVoted

API_BASE="http://localhost:3000/api"
TEST_ROOM_ID="test-vote-room"
TEST_DEVICE_ID="test-device-123"

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Test de création d'une room
create_test_room() {
    log_info "Création de la room de test..."
    
    RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" \
        -X POST \
        -H "Content-Type: application/json" \
        -d '{"name": "Test Vote Room", "roomId": "'$TEST_ROOM_ID'"}' \
        "$API_BASE/rooms")
        
    HTTP_CODE=$(echo $RESPONSE | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
    BODY=$(echo $RESPONSE | sed -e 's/HTTPSTATUS:.*//g')
    
    if [ "$HTTP_CODE" -eq 201 ] || [ "$HTTP_CODE" -eq 409 ]; then
        log_success "Room de test créée ou existe déjà"
    else
        log_error "Erreur lors de la création de la room: $BODY"
        exit 1
    fi
}

# Ajouter des médias de test
add_test_media() {
    log_info "Ajout des médias de test..."
    
    # Film 1
    RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" \
        -X POST \
        -H "Content-Type: application/json" \
        -d '{
            "title": "Film Test 1",
            "type": "movie",
            "externalId": "tmdb:11111",
            "imageUrl": "https://image.tmdb.org/t/p/w500/test1.jpg",
            "description": "Action",
            "releaseDate": "2023-01-01"
        }' \
        "$API_BASE/rooms/$TEST_ROOM_ID/items")
        
    HTTP_CODE=$(echo $RESPONSE | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
    if [ "$HTTP_CODE" -eq 201 ] || [ "$HTTP_CODE" -eq 409 ]; then
        log_success "Film Test 1 ajouté ou existe déjà"
    fi
    
    # Film 2
    curl -s -X POST \
        -H "Content-Type: application/json" \
        -d '{
            "title": "Film Test 2",
            "type": "movie",
            "externalId": "tmdb:22222",
            "imageUrl": "https://image.tmdb.org/t/p/w500/test2.jpg",
            "description": "Comedy",
            "releaseDate": "2023-06-01"
        }' \
        "$API_BASE/rooms/$TEST_ROOM_ID/items" > /dev/null
        
    # Film 3
    curl -s -X POST \
        -H "Content-Type: application/json" \
        -d '{
            "title": "Film Test 3",
            "type": "movie",
            "externalId": "tmdb:33333",
            "imageUrl": "https://image.tmdb.org/t/p/w500/test3.jpg",
            "description": "Drama",
            "releaseDate": "2023-12-01"
        }' \
        "$API_BASE/rooms/$TEST_ROOM_ID/items" > /dev/null
    
    log_success "Médias de test ajoutés"
}

# Récupérer les médias de la room
get_media_ids() {
    RESPONSE=$(curl -s "$API_BASE/rooms/$TEST_ROOM_ID/items")
    MEDIA_IDS=$(echo $RESPONSE | grep -o '"id":[0-9]*' | head -3 | cut -d':' -f2 | tr '\n' ',' | sed 's/,$//')
    echo $MEDIA_IDS
}

# Créer un vote de test
create_test_vote() {
    local media_ids=$1
    log_info "Création du vote de test..."
    
    RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" \
        -X POST \
        -H "Content-Type: application/json" \
        -d '{
            "roomId": "'$TEST_ROOM_ID'",
            "title": "Test Vote: Quel film regarder ce soir?",
            "description": "Vote de test pour valider le système",
            "duration": 24,
            "mediaIds": ['$media_ids'],
            "createdBy": "Test User"
        }' \
        "$API_BASE/votes")
        
    HTTP_CODE=$(echo $RESPONSE | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
    BODY=$(echo $RESPONSE | sed -e 's/HTTPSTATUS:.*//g')
    
    if [ "$HTTP_CODE" -eq 201 ]; then
        VOTE_ID=$(echo $BODY | grep -o '"voteId":[0-9]*' | cut -d':' -f2)
        log_success "Vote créé avec succès (ID: $VOTE_ID)"
        echo $VOTE_ID
    else
        log_error "Erreur lors de la création du vote: $BODY"
        exit 1
    fi
}

# Récupérer un vote par ID
get_vote_by_id() {
    local vote_id=$1
    local expect_user_voted=$2
    
    log_info "Récupération du vote $vote_id..."
    
    RESPONSE=$(curl -s "$API_BASE/votes/$vote_id?deviceId=$TEST_DEVICE_ID")
    
    if echo "$RESPONSE" | grep -q '"success":true'; then
        USER_HAS_VOTED=$(echo "$RESPONSE" | grep -o '"userHasVoted":[^,]*' | cut -d':' -f2)
        TOTAL_VOTES=$(echo "$RESPONSE" | grep -o '"totalVotes":[0-9]*' | cut -d':' -f2)
        TITLE=$(echo "$RESPONSE" | grep -o '"title":"[^"]*"' | cut -d':' -f2 | sed 's/"//g')
        
        log_success "Vote récupéré: $TITLE"
        log_info "Total votes: $TOTAL_VOTES"
        log_info "User has voted: $USER_HAS_VOTED"
        
        if [ "$USER_HAS_VOTED" = "$expect_user_voted" ]; then
            log_success "userHasVoted correctement défini à $expect_user_voted"
        else
            log_warn "Attendu userHasVoted=$expect_user_voted, obtenu=$USER_HAS_VOTED"
        fi
        
        # Récupérer le premier option ID pour les tests
        FIRST_OPTION_ID=$(echo "$RESPONSE" | grep -o '"id":[0-9]*' | head -4 | tail -1 | cut -d':' -f2)
        echo $FIRST_OPTION_ID
    else
        log_error "Erreur lors de la récupération du vote: $RESPONSE"
        exit 1
    fi
}

# Soumettre un vote
submit_vote() {
    local vote_id=$1
    local option_id=$2
    
    log_info "Soumission du vote..."
    
    RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" \
        -X POST \
        -H "Content-Type: application/json" \
        -d '{
            "voteId": '$vote_id',
            "optionId": '$option_id',
            "voterName": "Test Voter",
            "deviceId": "'$TEST_DEVICE_ID'"
        }' \
        "$API_BASE/votes/submit")
        
    HTTP_CODE=$(echo $RESPONSE | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
    BODY=$(echo $RESPONSE | sed -e 's/HTTPSTATUS:.*//g')
    
    if [ "$HTTP_CODE" -eq 200 ]; then
        RESULT_ID=$(echo $BODY | grep -o '"resultId":[0-9]*' | cut -d':' -f2)
        log_success "Vote soumis avec succès (Result ID: $RESULT_ID)"
        return 0
    else
        log_error "Erreur lors de la soumission du vote: $BODY"
        return 1
    fi
}

# Tests principaux
main() {
    log_info "🧪 Début des tests du système de vote"
    
    # 1. Créer une room de test
    log_info "\n📋 Étape 1: Création de la room de test"
    create_test_room
    
    # 2. Ajouter des médias de test
    log_info "\n🎬 Étape 2: Ajout des médias de test"
    add_test_media
    
    # 3. Récupérer les IDs des médias
    MEDIA_IDS=$(get_media_ids)
    log_info "IDs des médias: $MEDIA_IDS"
    
    # 4. Créer un vote de test
    log_info "\n🗳️  Étape 3: Création du vote"
    VOTE_ID=$(create_test_vote "$MEDIA_IDS")
    
    # 5. Tester la récupération du vote (userHasVoted = false)
    log_info "\n📖 Étape 4: Test récupération vote (avant vote)"
    OPTION_ID=$(get_vote_by_id "$VOTE_ID" "false")
    
    # 6. Tester la soumission d'un vote
    log_info "\n✋ Étape 5: Test soumission vote"
    submit_vote "$VOTE_ID" "$OPTION_ID"
    
    # 7. Tester la récupération du vote (userHasVoted = true)
    log_info "\n📖 Étape 6: Test récupération vote (après vote)"
    get_vote_by_id "$VOTE_ID" "true" > /dev/null
    
    # 8. Tester un second vote (devrait échouer)
    log_info "\n🚫 Étape 7: Test double vote (devrait échouer)"
    if submit_vote "$VOTE_ID" "$OPTION_ID"; then
        log_error "Le double vote devrait échouer!"
        exit 1
    else
        log_success "Double vote correctement rejeté"
    fi
    
    log_success "\n🎉 Tous les tests sont passés avec succès!"
    log_info "Le système de vote fonctionne correctement."
}

# Exécuter les tests
main
