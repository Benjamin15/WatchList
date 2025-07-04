#!/bin/bash

# Script de test rapide pour l'intégration Backend/Mobile
# Usage: ./test-integration.sh

echo "🧪 Test d'intégration Backend/Mobile WatchList"
echo "=============================================="

# Configuration
API_BASE="http://localhost:3000/api"
ROOM_ID=""

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les résultats
log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Test 1: Santé du serveur
echo -e "\n${BLUE}1. Test de la santé du serveur${NC}"
HEALTH_RESPONSE=$(curl -s -w "%{http_code}" "${API_BASE}/health")
HTTP_CODE="${HEALTH_RESPONSE: -3}"
RESPONSE_BODY="${HEALTH_RESPONSE%???}"

if [ "$HTTP_CODE" = "200" ]; then
    log_success "Serveur backend accessible"
    log_info "Réponse: $RESPONSE_BODY"
else
    log_error "Serveur backend inaccessible (HTTP $HTTP_CODE)"
    exit 1
fi

# Test 2: Créer une room
echo -e "\n${BLUE}2. Création d'une room de test${NC}"
CREATE_ROOM_RESPONSE=$(curl -s -X POST "${API_BASE}/rooms" \
  -H "Content-Type: application/json" \
  -d '{"name": "Room Test Integration"}')

if echo "$CREATE_ROOM_RESPONSE" | grep -q "room_id"; then
    ROOM_ID=$(echo "$CREATE_ROOM_RESPONSE" | sed -n 's/.*"room_id":"\([^"]*\)".*/\1/p')
    log_success "Room créée avec succès"
    log_info "Room ID: $ROOM_ID"
else
    log_error "Échec de la création de la room"
    log_info "Réponse: $CREATE_ROOM_RESPONSE"
    exit 1
fi

# Test 3: Récupérer les infos de la room
echo -e "\n${BLUE}3. Récupération des infos de la room${NC}"
GET_ROOM_RESPONSE=$(curl -s "${API_BASE}/rooms/${ROOM_ID}")

if echo "$GET_ROOM_RESPONSE" | grep -q "Room Test Integration"; then
    log_success "Room récupérée avec succès"
else
    log_error "Échec de la récupération de la room"
    log_info "Réponse: $GET_ROOM_RESPONSE"
fi

# Test 4: Ajouter un média
echo -e "\n${BLUE}4. Ajout d'un média de test${NC}"
ADD_MEDIA_RESPONSE=$(curl -s -X POST "${API_BASE}/items/rooms/${ROOM_ID}/items" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Movie Integration",
    "type": "movie",
    "year": 2024,
    "genre": "Test",
    "description": "Un film de test pour l'\''intégration"
  }')

if echo "$ADD_MEDIA_RESPONSE" | grep -q "Test Movie Integration"; then
    MEDIA_ID=$(echo "$ADD_MEDIA_RESPONSE" | sed -n 's/.*"id":\([0-9]*\).*/\1/p')
    log_success "Média ajouté avec succès"
    log_info "Media ID: $MEDIA_ID"
else
    log_error "Échec de l'ajout du média"
    log_info "Réponse: $ADD_MEDIA_RESPONSE"
fi

# Test 5: Récupérer les items de la room
echo -e "\n${BLUE}5. Récupération des items de la room${NC}"
GET_ITEMS_RESPONSE=$(curl -s "${API_BASE}/rooms/${ROOM_ID}/items")

if echo "$GET_ITEMS_RESPONSE" | grep -q "Test Movie Integration"; then
    log_success "Items récupérés avec succès"
    ITEM_COUNT=$(echo "$GET_ITEMS_RESPONSE" | grep -o '"id":[0-9]*' | wc -l)
    log_info "Nombre d'items: $ITEM_COUNT"
else
    log_error "Échec de la récupération des items"
    log_info "Réponse: $GET_ITEMS_RESPONSE"
fi

# Test 6: Mettre à jour le statut du média
if [ -n "$MEDIA_ID" ]; then
    echo -e "\n${BLUE}6. Mise à jour du statut du média${NC}"
    UPDATE_STATUS_RESPONSE=$(curl -s -X PUT "${API_BASE}/items/rooms/${ROOM_ID}/items/${MEDIA_ID}/status" \
      -H "Content-Type: application/json" \
      -d '{"status": "en_cours"}')

    if echo "$UPDATE_STATUS_RESPONSE" | grep -q "en_cours"; then
        log_success "Statut mis à jour avec succès"
    else
        log_error "Échec de la mise à jour du statut"
        log_info "Réponse: $UPDATE_STATUS_RESPONSE"
    fi
fi

# Test 7: Test de recherche (si l'endpoint existe)
echo -e "\n${BLUE}7. Test de recherche${NC}"
SEARCH_RESPONSE=$(curl -s "${API_BASE}/search/autocomplete/movie/spider" 2>/dev/null)

if [ "$?" = "0" ] && [ -n "$SEARCH_RESPONSE" ]; then
    log_success "Recherche fonctionnelle"
else
    log_warning "Recherche non disponible ou endpoint différent"
fi

# Résumé
echo -e "\n${BLUE}📋 Résumé des tests${NC}"
echo "=================="
log_info "Room de test créée: $ROOM_ID"
log_info "Média de test ajouté: $MEDIA_ID"
echo ""
log_info "Pour tester l'application mobile:"
echo "1. Ouvrir l'app mobile"
echo "2. Utiliser le code de room: $ROOM_ID"
echo "3. Vérifier que le média 'Test Movie Integration' apparaît"
echo "4. Tester le swipe pour changer le statut"
echo "5. Tester l'ajout de médias via la recherche"
echo ""
log_success "Tests d'intégration terminés !"
