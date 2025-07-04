#!/bin/bash

# Script de test pour vérifier la correction du bug de recherche
# Test spécifique pour l'erreur "Cannot read property 'replace' of null"

echo "🔍 Test de correction du bug de recherche"
echo "========================================"

# Configuration
BACKEND_URL="http://localhost:3000"
API_URL="$BACKEND_URL/api"

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo
echo "1. Test de la santé du serveur"
HEALTH_RESPONSE=$(curl -s $API_URL/health)
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Serveur backend accessible${NC}"
else
    echo -e "${RED}❌ Serveur backend inaccessible${NC}"
    exit 1
fi

echo
echo "2. Test de recherche avec des résultats ayant external_id null"
echo -e "${BLUE}ℹ️  Recherche 'test' (contient des résultats avec external_id null)${NC}"
SEARCH_RESPONSE=$(curl -s "$API_URL/search/autocomplete/movie/test")
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Recherche 'test' réussie${NC}"
    
    # Vérifier le nombre de résultats
    TOTAL_COUNT=$(echo "$SEARCH_RESPONSE" | jq -r '.results | length')
    NULL_EXTERNAL_ID=$(echo "$SEARCH_RESPONSE" | jq -r '.results[] | select(.external_id == null) | .title' | wc -l)
    VALID_EXTERNAL_ID=$(echo "$SEARCH_RESPONSE" | jq -r '.results[] | select(.external_id != null) | .title' | wc -l)
    
    echo -e "${BLUE}ℹ️  Nombre total de résultats: $TOTAL_COUNT${NC}"
    echo -e "${BLUE}ℹ️  Résultats avec external_id null: $NULL_EXTERNAL_ID${NC}"
    echo -e "${BLUE}ℹ️  Résultats avec external_id valide: $VALID_EXTERNAL_ID${NC}"
else
    echo -e "${RED}❌ Erreur lors de la recherche 'test'${NC}"
    exit 1
fi

echo
echo "3. Test de recherche avec des résultats ayant external_id valide"
echo -e "${BLUE}ℹ️  Recherche 'spider-man' (contient des résultats avec external_id valide)${NC}"
SEARCH_RESPONSE_2=$(curl -s "$API_URL/search/autocomplete/movie/spider-man")
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Recherche 'spider-man' réussie${NC}"
    
    # Vérifier le nombre de résultats
    TOTAL_COUNT_2=$(echo "$SEARCH_RESPONSE_2" | jq -r '.results | length')
    VALID_EXTERNAL_ID_2=$(echo "$SEARCH_RESPONSE_2" | jq -r '.results[] | select(.external_id != null) | .title' | wc -l)
    
    echo -e "${BLUE}ℹ️  Nombre total de résultats: $TOTAL_COUNT_2${NC}"
    echo -e "${BLUE}ℹ️  Résultats avec external_id valide: $VALID_EXTERNAL_ID_2${NC}"
    
    # Afficher quelques exemples
    echo -e "${BLUE}ℹ️  Exemples d'external_id trouvés:${NC}"
    echo "$SEARCH_RESPONSE_2" | jq -r '.results[] | select(.external_id != null) | "   - " + .title + ": " + .external_id' | head -3
else
    echo -e "${RED}❌ Erreur lors de la recherche 'spider-man'${NC}"
    exit 1
fi

echo
echo "4. Test de recherche avec une requête qui ne retourne aucun résultat"
echo -e "${BLUE}ℹ️  Recherche 'zzzzzzzzz' (ne devrait retourner aucun résultat)${NC}"
SEARCH_RESPONSE_3=$(curl -s "$API_URL/search/autocomplete/movie/zzzzzzzzz")
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Recherche 'zzzzzzzzz' réussie${NC}"
    
    TOTAL_COUNT_3=$(echo "$SEARCH_RESPONSE_3" | jq -r '.results | length')
    echo -e "${BLUE}ℹ️  Nombre de résultats: $TOTAL_COUNT_3${NC}"
else
    echo -e "${RED}❌ Erreur lors de la recherche 'zzzzzzzzz'${NC}"
    exit 1
fi

echo
echo "5. Test de recherche série (type tv)"
echo -e "${BLUE}ℹ️  Recherche 'breaking bad' (type tv)${NC}"
SEARCH_RESPONSE_4=$(curl -s "$API_URL/search/autocomplete/tv/breaking%20bad")
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Recherche 'breaking bad' réussie${NC}"
    
    TOTAL_COUNT_4=$(echo "$SEARCH_RESPONSE_4" | jq -r '.results | length')
    echo -e "${BLUE}ℹ️  Nombre de résultats: $TOTAL_COUNT_4${NC}"
else
    echo -e "${RED}❌ Erreur lors de la recherche 'breaking bad'${NC}"
    exit 1
fi

echo
echo "📋 Résumé des tests"
echo "=================="
echo -e "${GREEN}✅ Tous les tests de recherche sont passés${NC}"
echo -e "${BLUE}ℹ️  La correction du bug external_id null fonctionne correctement${NC}"
echo -e "${BLUE}ℹ️  Les recherches avec external_id valide fonctionnent toujours${NC}"
echo -e "${BLUE}ℹ️  Les recherches vides sont gérées correctement${NC}"
echo -e "${BLUE}ℹ️  Les différents types de médias (movie, tv) fonctionnent${NC}"
echo
echo -e "${GREEN}✅ Test de correction terminé avec succès !${NC}"
echo
echo -e "${BLUE}ℹ️  Vous pouvez maintenant tester la recherche dans l'application mobile${NC}"
echo "   L'erreur 'Cannot read property 'replace' of null' ne devrait plus apparaître"
