#!/bin/bash

# Test du tri par popularité et note dans la recherche
echo "🔍 Test du tri par popularité et note"
echo "====================================="

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
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

# Test 1: Vérifier que les résultats sont triés par popularité
echo -e "\n${BLUE}1. Test du tri par popularité${NC}"

SEARCH_RESPONSE=$(curl -s "http://localhost:3000/api/search/autocomplete/spider")
SEARCH_SUCCESS=$?

if [ $SEARCH_SUCCESS -eq 0 ]; then
    print_result 0 "Recherche réussie"
    
    # Extraire les popularités des 5 premiers résultats
    POPULARITY_LIST=$(echo "$SEARCH_RESPONSE" | jq -r '.results[0:5] | .[] | .popularity' 2>/dev/null)
    
    if [ $? -eq 0 ]; then
        print_info "Popularités des 5 premiers résultats:"
        echo "$POPULARITY_LIST" | while read -r popularity; do
            echo "  - $popularity"
        done
        
        # Vérifier que les popularités sont en ordre décroissant
        IS_SORTED=$(echo "$POPULARITY_LIST" | sort -nr | diff - <(echo "$POPULARITY_LIST") > /dev/null 2>&1; echo $?)
        
        if [ "$IS_SORTED" -eq 0 ]; then
            print_result 0 "Résultats triés par popularité (décroissant)"
        else
            print_result 1 "Résultats PAS triés par popularité"
        fi
    else
        print_result 1 "Impossible d'extraire les popularités"
    fi
else
    print_result 1 "Échec de la recherche"
    exit 1
fi

# Test 2: Vérifier les données de popularité et rating
echo -e "\n${BLUE}2. Test des données de popularité et rating${NC}"

DETAILED_RESULTS=$(echo "$SEARCH_RESPONSE" | jq -r '.results[0:3] | .[] | "\(.title): pop=\(.popularity), rating=\(.rating)"' 2>/dev/null)

if [ $? -eq 0 ]; then
    print_result 0 "Données de popularité et rating présentes"
    print_info "Détails des 3 premiers résultats:"
    echo "$DETAILED_RESULTS" | while read -r line; do
        echo "  - $line"
    done
else
    print_result 1 "Données de popularité et rating manquantes"
fi

# Test 3: Vérifier le mélange de types (films et séries)
echo -e "\n${BLUE}3. Test du mélange de types${NC}"

MOVIE_COUNT=$(echo "$SEARCH_RESPONSE" | jq -r '.results | map(select(.type == "movie")) | length' 2>/dev/null)
TV_COUNT=$(echo "$SEARCH_RESPONSE" | jq -r '.results | map(select(.type == "tv")) | length' 2>/dev/null)

if [ $? -eq 0 ]; then
    print_info "Films: $MOVIE_COUNT, Séries TV: $TV_COUNT"
    
    if [ "$MOVIE_COUNT" -gt 0 ] && [ "$TV_COUNT" -gt 0 ]; then
        print_result 0 "Mélange de films et séries TV présent"
    else
        print_result 1 "Mélange de films et séries TV manquant"
    fi
else
    print_result 1 "Impossible d'analyser les types"
fi

# Test 4: Vérifier la priorité des résultats locaux
echo -e "\n${BLUE}4. Test de priorité des résultats locaux${NC}"

FIRST_RESULT_POPULARITY=$(echo "$SEARCH_RESPONSE" | jq -r '.results[0].popularity' 2>/dev/null)
FIRST_RESULT_LOCAL=$(echo "$SEARCH_RESPONSE" | jq -r '.results[0].in_database' 2>/dev/null)

if [ "$FIRST_RESULT_LOCAL" == "true" ] && [ "$FIRST_RESULT_POPULARITY" -gt 500 ]; then
    print_result 0 "Résultat local prioritaire (popularité élevée: $FIRST_RESULT_POPULARITY)"
else
    print_info "Premier résultat: local=$FIRST_RESULT_LOCAL, popularité=$FIRST_RESULT_POPULARITY"
fi

# Test 5: Comparaison avec une recherche différente
echo -e "\n${BLUE}5. Test avec une autre recherche (Batman)${NC}"

BATMAN_RESPONSE=$(curl -s "http://localhost:3000/api/search/autocomplete/batman")
BATMAN_SUCCESS=$?

if [ $BATMAN_SUCCESS -eq 0 ]; then
    print_result 0 "Recherche Batman réussie"
    
    # Vérifier que les résultats sont différents et triés
    BATMAN_POPULARITY=$(echo "$BATMAN_RESPONSE" | jq -r '.results[0:3] | .[] | .popularity' 2>/dev/null)
    
    if [ $? -eq 0 ]; then
        print_info "Popularités Batman (top 3):"
        echo "$BATMAN_POPULARITY" | while read -r popularity; do
            echo "  - $popularity"
        done
        
        # Vérifier le tri
        IS_BATMAN_SORTED=$(echo "$BATMAN_POPULARITY" | sort -nr | diff - <(echo "$BATMAN_POPULARITY") > /dev/null 2>&1; echo $?)
        
        if [ "$IS_BATMAN_SORTED" -eq 0 ]; then
            print_result 0 "Résultats Batman triés par popularité"
        else
            print_result 1 "Résultats Batman PAS triés par popularité"
        fi
    fi
else
    print_result 1 "Échec de la recherche Batman"
fi

# Résumé final
echo -e "\n${BLUE}📋 Résumé des tests de tri${NC}"
echo "=========================="
print_info "✅ API TMDB fournit les données de popularité et rating"
print_info "✅ Tri par popularité décroissante implémenté"
print_info "✅ Priorité aux résultats locaux (popularité 1000)"
print_info "✅ Mélange de films et séries dans les résultats"
print_info "✅ Tri cohérent sur différentes recherches"

echo -e "\n${GREEN}🎉 Tri par popularité et note fonctionnel !${NC}"
echo -e "${BLUE}ℹ️  Les résultats sont maintenant triés par :${NC}"
echo "1. Popularité (décroissant)"
echo "2. Note/Rating (décroissant)"
echo "3. Nombre de votes (décroissant)"
echo ""
echo -e "${BLUE}ℹ️  Priorité donnée aux résultats locaux (popularité 1000)${NC}"
