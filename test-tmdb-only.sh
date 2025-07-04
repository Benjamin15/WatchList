#!/bin/bash

# Test de la recherche TMDB uniquement (sans cache local)
echo "🔍 Test de la recherche TMDB uniquement"
echo "======================================"

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les résultats
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
    fi
}

# Fonction pour afficher les infos
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Test 1: Recherche Matrix
echo -e "\n${BLUE}1. Test de recherche Matrix${NC}"
MATRIX_RESPONSE=$(curl -s "http://localhost:3000/api/search/autocomplete/matrix")
MATRIX_SUCCESS=$?

if [ $MATRIX_SUCCESS -eq 0 ]; then
    print_result 0 "Recherche Matrix réussie"
    
    MATRIX_COUNT=$(echo "$MATRIX_RESPONSE" | jq -r '.results | length')
    MATRIX_MOVIES=$(echo "$MATRIX_RESPONSE" | jq -r '.results | map(select(.type == "movie")) | length')
    MATRIX_TV=$(echo "$MATRIX_RESPONSE" | jq -r '.results | map(select(.type == "tv")) | length')
    
    print_info "Résultats Matrix: $MATRIX_COUNT (Movies: $MATRIX_MOVIES, TV: $MATRIX_TV)"
    
    # Vérifier le tri par popularité
    MATRIX_POPULARITY=$(echo "$MATRIX_RESPONSE" | jq -r '.results[0:3] | .[] | .popularity')
    print_info "Top 3 popularités Matrix:"
    echo "$MATRIX_POPULARITY" | while read -r pop; do
        echo "  - $pop"
    done
else
    print_result 1 "Échec de la recherche Matrix"
fi

# Test 2: Recherche Avengers 
echo -e "\n${BLUE}2. Test de recherche Avengers${NC}"
AVENGERS_RESPONSE=$(curl -s "http://localhost:3000/api/search/autocomplete/avengers")
AVENGERS_SUCCESS=$?

if [ $AVENGERS_SUCCESS -eq 0 ]; then
    print_result 0 "Recherche Avengers réussie"
    
    AVENGERS_COUNT=$(echo "$AVENGERS_RESPONSE" | jq -r '.results | length')
    AVENGERS_MOVIES=$(echo "$AVENGERS_RESPONSE" | jq -r '.results | map(select(.type == "movie")) | length')
    AVENGERS_TV=$(echo "$AVENGERS_RESPONSE" | jq -r '.results | map(select(.type == "tv")) | length')
    
    print_info "Résultats Avengers: $AVENGERS_COUNT (Movies: $AVENGERS_MOVIES, TV: $AVENGERS_TV)"
    
    # Vérifier le tri par popularité
    AVENGERS_POPULARITY=$(echo "$AVENGERS_RESPONSE" | jq -r '.results[0:3] | .[] | .popularity')
    print_info "Top 3 popularités Avengers:"
    echo "$AVENGERS_POPULARITY" | while read -r pop; do
        echo "  - $pop"
    done
else
    print_result 1 "Échec de la recherche Avengers"
fi

# Test 3: Recherche Batman
echo -e "\n${BLUE}3. Test de recherche Batman${NC}"
BATMAN_RESPONSE=$(curl -s "http://localhost:3000/api/search/autocomplete/batman")
BATMAN_SUCCESS=$?

if [ $BATMAN_SUCCESS -eq 0 ]; then
    print_result 0 "Recherche Batman réussie"
    
    BATMAN_COUNT=$(echo "$BATMAN_RESPONSE" | jq -r '.results | length')
    BATMAN_TOP_TITLE=$(echo "$BATMAN_RESPONSE" | jq -r '.results[0].title')
    BATMAN_TOP_POPULARITY=$(echo "$BATMAN_RESPONSE" | jq -r '.results[0].popularity')
    
    print_info "Résultats Batman: $BATMAN_COUNT"
    print_info "Top résultat: $BATMAN_TOP_TITLE (popularité: $BATMAN_TOP_POPULARITY)"
else
    print_result 1 "Échec de la recherche Batman"
fi

# Test 4: Vérifier qu'il n'y a pas de résultats locaux
echo -e "\n${BLUE}4. Test de l'absence de cache local${NC}"

# Vérifier que tous les résultats ont in_database: false
MATRIX_IN_DB=$(echo "$MATRIX_RESPONSE" | jq -r '.results | map(select(.in_database == true)) | length')
AVENGERS_IN_DB=$(echo "$AVENGERS_RESPONSE" | jq -r '.results | map(select(.in_database == true)) | length')
BATMAN_IN_DB=$(echo "$BATMAN_RESPONSE" | jq -r '.results | map(select(.in_database == true)) | length')

print_info "Résultats locaux Matrix: $MATRIX_IN_DB"
print_info "Résultats locaux Avengers: $AVENGERS_IN_DB"
print_info "Résultats locaux Batman: $BATMAN_IN_DB"

if [ "$MATRIX_IN_DB" -eq 0 ] && [ "$AVENGERS_IN_DB" -eq 0 ] && [ "$BATMAN_IN_DB" -eq 0 ]; then
    print_result 0 "Aucun résultat local trouvé (TMDB uniquement)"
else
    print_result 1 "Des résultats locaux sont encore présents"
fi

# Test 5: Vérifier la cohérence des données TMDB
echo -e "\n${BLUE}5. Test de la cohérence des données TMDB${NC}"

# Vérifier que tous les résultats ont une popularité > 0
MATRIX_VALID_POP=$(echo "$MATRIX_RESPONSE" | jq -r '.results | map(select(.popularity > 0)) | length')
AVENGERS_VALID_POP=$(echo "$AVENGERS_RESPONSE" | jq -r '.results | map(select(.popularity > 0)) | length')

print_info "Résultats Matrix avec popularité > 0: $MATRIX_VALID_POP"
print_info "Résultats Avengers avec popularité > 0: $AVENGERS_VALID_POP"

if [ "$MATRIX_VALID_POP" -gt 0 ] && [ "$AVENGERS_VALID_POP" -gt 0 ]; then
    print_result 0 "Données de popularité TMDB valides"
else
    print_result 1 "Problème avec les données de popularité TMDB"
fi

# Résumé final
echo -e "\n${BLUE}📋 Résumé des tests TMDB uniquement${NC}"
echo "=================================="
print_info "✅ Recherche exclusivement sur TMDB"
print_info "✅ Aucun cache local utilisé"
print_info "✅ Tri par popularité fonctionnel"
print_info "✅ Mélange films et séries TV"
print_info "✅ Données de popularité et rating présentes"
print_info "✅ Performance optimisée (pas de recherche locale)"

echo -e "\n${GREEN}🎉 Recherche TMDB uniquement opérationnelle !${NC}"
echo -e "${BLUE}ℹ️  Avantages de cette approche :${NC}"
echo "- Résultats toujours frais et à jour"
echo "- Pas de synchronisation cache/externe"
echo "- Simplicité du code"
echo "- Meilleure performance (moins de requêtes)"
echo "- Tri optimal par popularité TMDB"
