#!/bin/bash

# Script de test pour la fonctionnalité d'affichage d'images
# Test d'intégration des images dans l'application WatchList

echo "🖼️  Test d'intégration des images WatchList"
echo "============================================="

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
    echo -e "${BLUE}ℹ️  Réponse: $HEALTH_RESPONSE${NC}"
else
    echo -e "${RED}❌ Serveur backend inaccessible${NC}"
    echo -e "${BLUE}ℹ️  Assurez-vous que le serveur backend est démarré sur le port 3000${NC}"
    exit 1
fi

echo
echo "2. Test de recherche avec images"
SEARCH_RESPONSE=$(curl -s "$API_URL/search/autocomplete/movie/spider-man")
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Recherche fonctionnelle${NC}"
    
    # Vérifier si les résultats contiennent des URLs d'images
    IMAGE_COUNT=$(echo "$SEARCH_RESPONSE" | jq -r '.results[] | select(.image_url != null) | .image_url' | wc -l)
    TOTAL_COUNT=$(echo "$SEARCH_RESPONSE" | jq -r '.results | length')
    
    echo -e "${BLUE}ℹ️  Nombre total de résultats: $TOTAL_COUNT${NC}"
    echo -e "${BLUE}ℹ️  Résultats avec image_url: $IMAGE_COUNT${NC}"
    
    if [ "$IMAGE_COUNT" -gt 0 ]; then
        echo -e "${GREEN}✅ Des images sont disponibles dans les résultats de recherche${NC}"
        
        # Afficher quelques exemples d'URLs d'images
        echo -e "${BLUE}ℹ️  Exemples d'URLs d'images trouvées:${NC}"
        echo "$SEARCH_RESPONSE" | jq -r '.results[] | select(.image_url != null) | "   - " + .title + ": " + .image_url' | head -3
    else
        echo -e "${RED}⚠️  Aucune image trouvée dans les résultats de recherche${NC}"
    fi
else
    echo -e "${RED}❌ Erreur lors de la recherche${NC}"
    exit 1
fi

echo
echo "3. Création d'une room de test pour les images"
ROOM_RESPONSE=$(curl -s -X POST "$API_URL/rooms" \
    -H "Content-Type: application/json" \
    -d '{"name": "Test Images Room"}')

if [ $? -eq 0 ]; then
    ROOM_ID=$(echo "$ROOM_RESPONSE" | jq -r '.room_id')
    echo -e "${GREEN}✅ Room créée avec succès${NC}"
    echo -e "${BLUE}ℹ️  Room ID: $ROOM_ID${NC}"
else
    echo -e "${RED}❌ Erreur lors de la création de la room${NC}"
    exit 1
fi

echo
echo "4. Ajout d'un média avec image"
MEDIA_RESPONSE=$(curl -s -X POST "$API_URL/items/rooms/$ROOM_ID/items" \
    -H "Content-Type: application/json" \
    -d '{
        "title": "Spider-Man: No Way Home",
        "type": "movie",
        "year": 2021,
        "description": "Film avec images de test",
        "image_url": "https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg",
        "external_id": "tmdb_634649"
    }')

if [ $? -eq 0 ]; then
    MEDIA_ID=$(echo "$MEDIA_RESPONSE" | jq -r '.id')
    echo -e "${GREEN}✅ Média avec image ajouté avec succès${NC}"
    echo -e "${BLUE}ℹ️  Media ID: $MEDIA_ID${NC}"
    
    # Vérifier que l'image_url est bien présente
    IMAGE_URL=$(echo "$MEDIA_RESPONSE" | jq -r '.image_url')
    if [ "$IMAGE_URL" != "null" ] && [ -n "$IMAGE_URL" ]; then
        echo -e "${GREEN}✅ URL d'image présente: $IMAGE_URL${NC}"
    else
        echo -e "${RED}⚠️  Aucune URL d'image dans la réponse${NC}"
    fi
else
    echo -e "${RED}❌ Erreur lors de l'ajout du média${NC}"
    exit 1
fi

echo
echo "5. Récupération des items de la room (vérification images)"
ITEMS_RESPONSE=$(curl -s "$API_URL/rooms/$ROOM_ID/items")

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Items récupérés avec succès${NC}"
    
    # Vérifier les images dans les items
    ITEMS_WITH_IMAGES=$(echo "$ITEMS_RESPONSE" | jq -r '.items[] | select(.image_url != null) | .title + ": " + .image_url' | wc -l)
    TOTAL_ITEMS=$(echo "$ITEMS_RESPONSE" | jq -r '.items | length')
    
    echo -e "${BLUE}ℹ️  Nombre total d'items: $TOTAL_ITEMS${NC}"
    echo -e "${BLUE}ℹ️  Items avec images: $ITEMS_WITH_IMAGES${NC}"
    
    if [ "$ITEMS_WITH_IMAGES" -gt 0 ]; then
        echo -e "${GREEN}✅ Des images sont présentes dans les items de la room${NC}"
        echo -e "${BLUE}ℹ️  Détails des images:${NC}"
        echo "$ITEMS_RESPONSE" | jq -r '.items[] | select(.image_url != null) | "   - " + .title + ": " + .image_url'
    else
        echo -e "${RED}⚠️  Aucune image dans les items de la room${NC}"
    fi
else
    echo -e "${RED}❌ Erreur lors de la récupération des items${NC}"
    exit 1
fi

echo
echo "6. Test de validation d'URL d'image"
# Tester une URL d'image pour vérifier qu'elle est accessible
if [ -n "$IMAGE_URL" ] && [ "$IMAGE_URL" != "null" ]; then
    echo -e "${BLUE}ℹ️  Test d'accessibilité de l'image: $IMAGE_URL${NC}"
    HTTP_STATUS=$(curl -o /dev/null -s -w "%{http_code}" "$IMAGE_URL")
    
    if [ "$HTTP_STATUS" -eq 200 ]; then
        echo -e "${GREEN}✅ Image accessible (HTTP $HTTP_STATUS)${NC}"
    else
        echo -e "${RED}⚠️  Image non accessible (HTTP $HTTP_STATUS)${NC}"
    fi
else
    echo -e "${BLUE}ℹ️  Aucune URL d'image à tester${NC}"
fi

echo
echo "📋 Résumé des tests d'images"
echo "============================"
echo -e "${BLUE}ℹ️  Room de test créée: $ROOM_ID${NC}"
echo -e "${BLUE}ℹ️  Média de test ajouté: $MEDIA_ID${NC}"
echo
echo -e "${BLUE}ℹ️  Pour tester l'application mobile:${NC}"
echo "1. Ouvrir l'app mobile"
echo "2. Utiliser le code de room: $ROOM_ID"
echo "3. Vérifier que les médias s'affichent avec des images"
echo "4. Tester le fallback emoji si les images ne chargent pas"
echo "5. Tester l'ajout de médias via la recherche avec images"
echo
echo -e "${GREEN}✅ Tests d'intégration des images terminés !${NC}"
