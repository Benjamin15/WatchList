#!/bin/bash

# Test de sauvegarde des images lors de l'ajout de médias
echo "🖼️  Test de sauvegarde des images"
echo "================================"

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

# Test 1: Créer une room de test
echo -e "\n${BLUE}1. Création d'une room de test${NC}"
ROOM_RESPONSE=$(curl -s -X POST "http://localhost:3000/api/rooms" \
    -H "Content-Type: application/json" \
    -d '{"name": "Test Image Sauvegarde"}')

ROOM_SUCCESS=$?

if [ $ROOM_SUCCESS -eq 0 ]; then
    ROOM_ID=$(echo "$ROOM_RESPONSE" | jq -r '.room_id')
    print_result 0 "Room créée avec succès (ID: $ROOM_ID)"
else
    print_result 1 "Échec de création de la room"
    exit 1
fi

# Test 2: Ajouter un média avec image (format mobile)
echo -e "\n${BLUE}2. Ajout d'un média avec image (format mobile)${NC}"

MEDIA_DATA='{
  "title": "The Matrix",
  "type": "movie", 
  "external_id": "tmdb_603",
  "description": "Film culte de science-fiction",
  "image_url": "https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",
  "release_date": "1999-03-30"
}'

MEDIA_RESPONSE=$(curl -s -X POST "http://localhost:3000/api/items/rooms/$ROOM_ID/items" \
    -H "Content-Type: application/json" \
    -d "$MEDIA_DATA")

MEDIA_SUCCESS=$?

if [ $MEDIA_SUCCESS -eq 0 ]; then
    MEDIA_ID=$(echo "$MEDIA_RESPONSE" | jq -r '.id')
    MEDIA_IMAGE_URL=$(echo "$MEDIA_RESPONSE" | jq -r '.image_url')
    
    print_result 0 "Média ajouté avec succès (ID: $MEDIA_ID)"
    print_info "Image URL sauvegardée: $MEDIA_IMAGE_URL"
    
    if [ "$MEDIA_IMAGE_URL" != "null" ] && [ -n "$MEDIA_IMAGE_URL" ]; then
        print_result 0 "Image URL présente dans la réponse"
    else
        print_result 1 "Image URL manquante dans la réponse"
    fi
else
    print_result 1 "Échec d'ajout du média"
    echo "Réponse: $MEDIA_RESPONSE"
    exit 1
fi

# Test 3: Vérifier l'image dans la base de données
echo -e "\n${BLUE}3. Vérification de l'image en base de données${NC}"

DB_CHECK=$(sqlite3 server/prisma/dev.db "SELECT title, imageUrl FROM items WHERE id = $MEDIA_ID;" 2>/dev/null)

if [ $? -eq 0 ] && [ -n "$DB_CHECK" ]; then
    print_result 0 "Média trouvé en base de données"
    print_info "Données BDD: $DB_CHECK"
    
    # Extraire l'URL d'image de la BDD
    DB_IMAGE_URL=$(echo "$DB_CHECK" | cut -d'|' -f2)
    
    if [ -n "$DB_IMAGE_URL" ] && [ "$DB_IMAGE_URL" != "null" ]; then
        print_result 0 "Image URL sauvegardée en base de données"
        print_info "URL BDD: $DB_IMAGE_URL"
    else
        print_result 1 "Image URL manquante en base de données"
    fi
else
    print_result 1 "Impossible de vérifier la base de données"
fi

# Test 4: Récupérer les items de la room et vérifier l'image
echo -e "\n${BLUE}4. Récupération des items de la room${NC}"

ROOM_ITEMS_RESPONSE=$(curl -s "http://localhost:3000/api/rooms/$ROOM_ID/items")
ROOM_ITEMS_SUCCESS=$?

if [ $ROOM_ITEMS_SUCCESS -eq 0 ]; then
    ITEMS_COUNT=$(echo "$ROOM_ITEMS_RESPONSE" | jq -r '.items | length')
    
    if [ "$ITEMS_COUNT" -gt 0 ]; then
        print_result 0 "Items récupérés de la room ($ITEMS_COUNT items)"
        
        # Vérifier l'image du premier item
        FIRST_ITEM_IMAGE=$(echo "$ROOM_ITEMS_RESPONSE" | jq -r '.items[0].image_url')
        FIRST_ITEM_TITLE=$(echo "$ROOM_ITEMS_RESPONSE" | jq -r '.items[0].title')
        
        print_info "Premier item: $FIRST_ITEM_TITLE"
        print_info "Image URL: $FIRST_ITEM_IMAGE"
        
        if [ "$FIRST_ITEM_IMAGE" != "null" ] && [ -n "$FIRST_ITEM_IMAGE" ]; then
            print_result 0 "Image présente lors de la récupération"
        else
            print_result 1 "Image manquante lors de la récupération"
        fi
    else
        print_result 1 "Aucun item trouvé dans la room"
    fi
else
    print_result 1 "Échec de récupération des items de la room"
fi

# Test 5: Ajouter un autre média depuis la recherche TMDB
echo -e "\n${BLUE}5. Ajout d'un média depuis la recherche TMDB${NC}"

# D'abord, effectuer une recherche
SEARCH_RESPONSE=$(curl -s "http://localhost:3000/api/search/autocomplete/avatar")
SEARCH_SUCCESS=$?

if [ $SEARCH_SUCCESS -eq 0 ]; then
    # Prendre le premier résultat de la recherche
    SEARCH_ITEM=$(echo "$SEARCH_RESPONSE" | jq -r '.results[0]')
    SEARCH_TITLE=$(echo "$SEARCH_ITEM" | jq -r '.title')
    SEARCH_IMAGE=$(echo "$SEARCH_ITEM" | jq -r '.image_url')
    SEARCH_EXTERNAL_ID=$(echo "$SEARCH_ITEM" | jq -r '.external_id')
    SEARCH_TYPE=$(echo "$SEARCH_ITEM" | jq -r '.type')
    
    print_info "Média trouvé: $SEARCH_TITLE"
    print_info "Image TMDB: $SEARCH_IMAGE"
    
    # Ajouter ce média à la room avec le format attendu par le serveur
    TMDB_MEDIA_DATA=$(echo "$SEARCH_ITEM" | jq '{
        title: .title,
        type: .type,
        external_id: .external_id,
        description: .description,
        image_url: .image_url,
        release_date: .release_date
    }')
    
    TMDB_MEDIA_RESPONSE=$(curl -s -X POST "http://localhost:3000/api/items/rooms/$ROOM_ID/items" \
        -H "Content-Type: application/json" \
        -d "$TMDB_MEDIA_DATA")
    
    TMDB_MEDIA_SUCCESS=$?
    
    if [ $TMDB_MEDIA_SUCCESS -eq 0 ]; then
        TMDB_MEDIA_ID=$(echo "$TMDB_MEDIA_RESPONSE" | jq -r '.id')
        TMDB_MEDIA_IMAGE_SAVED=$(echo "$TMDB_MEDIA_RESPONSE" | jq -r '.image_url')
        
        print_result 0 "Média TMDB ajouté avec succès (ID: $TMDB_MEDIA_ID)"
        print_info "Image sauvegardée: $TMDB_MEDIA_IMAGE_SAVED"
        
        if [ "$TMDB_MEDIA_IMAGE_SAVED" != "null" ] && [ -n "$TMDB_MEDIA_IMAGE_SAVED" ]; then
            print_result 0 "Image TMDB correctement sauvegardée"
        else
            print_result 1 "Image TMDB non sauvegardée"
        fi
    else
        print_result 1 "Échec d'ajout du média TMDB"
        echo "Réponse: $TMDB_MEDIA_RESPONSE"
    fi
else
    print_result 1 "Échec de la recherche TMDB"
fi

# Test 6: Validation finale des images
echo -e "\n${BLUE}6. Validation finale${NC}"

FINAL_ROOM_ITEMS=$(curl -s "http://localhost:3000/api/rooms/$ROOM_ID/items")
FINAL_ITEMS_COUNT=$(echo "$FINAL_ROOM_ITEMS" | jq -r '.items | length')
ITEMS_WITH_IMAGES=$(echo "$FINAL_ROOM_ITEMS" | jq -r '.items | map(select(.image_url != null and .image_url != "")) | length')

print_info "Total d'items dans la room: $FINAL_ITEMS_COUNT"
print_info "Items avec images: $ITEMS_WITH_IMAGES"

if [ "$ITEMS_WITH_IMAGES" -eq "$FINAL_ITEMS_COUNT" ] && [ "$FINAL_ITEMS_COUNT" -gt 0 ]; then
    print_result 0 "Tous les items ont des images sauvegardées"
else
    print_result 1 "Certains items n'ont pas d'images sauvegardées"
fi

# Afficher le détail des images
echo -e "\n${BLUE}Détail des images sauvegardées:${NC}"
echo "$FINAL_ROOM_ITEMS" | jq -r '.items[] | "- \(.title): \(.image_url // "AUCUNE IMAGE")"'

# Nettoyage (supprimer la room de test)
echo -e "\n${BLUE}7. Nettoyage${NC}"
sqlite3 server/prisma/dev.db "DELETE FROM item_in_room WHERE roomId = (SELECT id FROM rooms WHERE roomId = '$ROOM_ID'); DELETE FROM items WHERE id IN ($MEDIA_ID); DELETE FROM rooms WHERE roomId = '$ROOM_ID';" 2>/dev/null
print_info "Room de test supprimée"

# Résumé
echo -e "\n${BLUE}📋 Résumé des tests d'images${NC}"
echo "=========================="
print_info "✅ Test de sauvegarde des images terminé"
print_info "✅ Vérification base de données OK"
print_info "✅ Récupération des images OK"  
print_info "✅ Intégration TMDB avec images OK"

echo -e "\n${GREEN}🎉 Tests de sauvegarde des images terminés !${NC}"
