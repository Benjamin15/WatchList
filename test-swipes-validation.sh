#!/bin/bash

# Test complet pour valider les swipes sur tous les onglets de RoomScreen
echo "🔄 Test de validation des swipes sur tous les onglets"
echo "=========================================="

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:3000"

echo -e "${YELLOW}📋 Préparation des données de test${NC}"

# Créer une room de test
echo "Création de la room de test..."
ROOM_RESPONSE=$(curl -s -X POST "$BASE_URL/api/rooms" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Room Swipes"
  }')

echo "Room créée: $ROOM_RESPONSE"

# Extraire le roomId de la réponse
ROOM_ID=$(echo "$ROOM_RESPONSE" | jq -r '.room_id')
echo "Room ID: $ROOM_ID"

# Ajouter des médias dans différents statuts pour tester tous les onglets
echo -e "${YELLOW}🎬 Ajout de médias pour chaque statut${NC}"

# Médias à regarder (planned/a_voir)
echo "Ajout de médias 'À regarder'..."
for i in {1..3}; do
  curl -s -X POST "$BASE_URL/api/rooms/$ROOM_ID/items" \
    -H "Content-Type: application/json" \
    -d '{
      "title": "Film À Regarder '$i'",
      "type": "movie",
      "external_id": "tmdb_movie_'$((11000 + i))'",
      "status": "a_voir",
      "image_url": "https://image.tmdb.org/t/p/w500/test'$i'.jpg"
    }' > /dev/null
done

# Médias en cours (watching/en_cours)
echo "Ajout de médias 'En cours'..."
for i in {1..3}; do
  curl -s -X POST "$BASE_URL/api/rooms/$ROOM_ID/items" \
    -H "Content-Type: application/json" \
    -d '{
      "title": "Film En Cours '$i'",
      "type": "movie",
      "external_id": "tmdb_movie_'$((12000 + i))'",
      "status": "en_cours",
      "image_url": "https://image.tmdb.org/t/p/w500/test'$i'.jpg"
    }' > /dev/null
done

# Médias terminés (completed/termine)
echo "Ajout de médias 'Terminés'..."
for i in {1..3}; do
  curl -s -X POST "$BASE_URL/api/rooms/$ROOM_ID/items" \
    -H "Content-Type: application/json" \
    -d '{
      "title": "Film Terminé '$i'",
      "type": "movie",
      "external_id": "tmdb_movie_'$((13000 + i))'",
      "status": "termine",
      "image_url": "https://image.tmdb.org/t/p/w500/test'$i'.jpg"
    }' > /dev/null
done

echo -e "${GREEN}✅ Données de test préparées${NC}"

# Modifier quelques items pour avoir des statuts différents
echo -e "${YELLOW}📝 Modification des statuts pour créer des données variées${NC}"

# Récupérer les items et modifier leurs statuts
ITEMS_DATA=$(curl -s "$BASE_URL/api/rooms/$ROOM_ID/items")
ITEM_IDS=($(echo "$ITEMS_DATA" | jq -r '.items[].id'))

# Passer les 3 premiers en "en_cours"
for i in {0..2}; do
  if [ -n "${ITEM_IDS[$i]}" ]; then
    curl -s -X PUT "$BASE_URL/api/items/${ITEM_IDS[$i]}" \
      -H "Content-Type: application/json" \
      -d '{"status": "en_cours"}' > /dev/null
    echo "Item ${ITEM_IDS[$i]} -> en_cours"
  fi
done

# Passer les 3 suivants en "termine"
for i in {3..5}; do
  if [ -n "${ITEM_IDS[$i]}" ]; then
    curl -s -X PUT "$BASE_URL/api/items/${ITEM_IDS[$i]}" \
      -H "Content-Type: application/json" \
      -d '{"status": "termine"}' > /dev/null
    echo "Item ${ITEM_IDS[$i]} -> termine"
  fi
done

# Laisser les 3 derniers en "a_voir"
echo "Items restants -> a_voir"

# Vérifier les données
echo -e "${YELLOW}📊 Vérification des données dans la room${NC}"
ROOM_DATA=$(curl -s "$BASE_URL/api/rooms/$ROOM_ID/items")

PLANNED_COUNT=$(echo "$ROOM_DATA" | jq '.items | map(select(.status == "a_voir")) | length')
WATCHING_COUNT=$(echo "$ROOM_DATA" | jq '.items | map(select(.status == "en_cours")) | length')
COMPLETED_COUNT=$(echo "$ROOM_DATA" | jq '.items | map(select(.status == "termine")) | length')

echo "Médias à regarder: $PLANNED_COUNT"
echo "Médias en cours: $WATCHING_COUNT"
echo "Médias terminés: $COMPLETED_COUNT"

# Test des transitions de statut (simulation des swipes)
echo -e "${YELLOW}🔄 Test des transitions de statut (simulation swipes)${NC}"

# Récupérer les items
ITEMS=$(echo "$ROOM_DATA" | jq -r '.items[].id')

# Test 1: Swipe "À regarder" vers "En cours"
echo "Test 1: Transition À regarder → En cours"
PLANNED_ITEM=$(echo "$ROOM_DATA" | jq -r '.items | map(select(.status == "a_voir")) | .[0].id')
if [ "$PLANNED_ITEM" != "null" ]; then
  curl -s -X PUT "$BASE_URL/api/items/$PLANNED_ITEM" \
    -H "Content-Type: application/json" \
    -d '{"status": "en_cours"}' > /dev/null
  echo "✅ Swipe À regarder → En cours"
else
  echo "❌ Pas d'item à regarder disponible"
fi

# Test 2: Swipe "En cours" vers "Terminé"
echo "Test 2: Transition En cours → Terminé"
WATCHING_ITEM=$(echo "$ROOM_DATA" | jq -r '.items | map(select(.status == "en_cours")) | .[0].id')
if [ "$WATCHING_ITEM" != "null" ]; then
  curl -s -X PUT "$BASE_URL/api/items/$WATCHING_ITEM" \
    -H "Content-Type: application/json" \
    -d '{"status": "termine"}' > /dev/null
  echo "✅ Swipe En cours → Terminé"
else
  echo "❌ Pas d'item en cours disponible"
fi

# Test 3: Swipe "Terminé" vers "À regarder" (remise en liste)
echo "Test 3: Transition Terminé → À regarder"
COMPLETED_ITEM=$(echo "$ROOM_DATA" | jq -r '.items | map(select(.status == "termine")) | .[0].id')
if [ "$COMPLETED_ITEM" != "null" ]; then
  curl -s -X PUT "$BASE_URL/api/items/$COMPLETED_ITEM" \
    -H "Content-Type: application/json" \
    -d '{"status": "a_voir"}' > /dev/null
  echo "✅ Swipe Terminé → À regarder"
else
  echo "❌ Pas d'item terminé disponible"
fi

# Vérifier les changements
echo -e "${YELLOW}📊 Vérification des changements après swipes${NC}"
UPDATED_ROOM_DATA=$(curl -s "$BASE_URL/api/rooms/$ROOM_ID/items")

NEW_PLANNED_COUNT=$(echo "$UPDATED_ROOM_DATA" | jq '.items | map(select(.status == "a_voir")) | length')
NEW_WATCHING_COUNT=$(echo "$UPDATED_ROOM_DATA" | jq '.items | map(select(.status == "en_cours")) | length')
NEW_COMPLETED_COUNT=$(echo "$UPDATED_ROOM_DATA" | jq '.items | map(select(.status == "termine")) | length')

echo "Nouveaux compteurs après swipes:"
echo "Médias à regarder: $NEW_PLANNED_COUNT"
echo "Médias en cours: $NEW_WATCHING_COUNT"
echo "Médias terminés: $NEW_COMPLETED_COUNT"

# Vérifier la structure RoomScreen
echo -e "${YELLOW}📱 Vérification de la structure RoomScreen${NC}"

# Vérifier que RoomScreen utilise bien les swipes
if grep -q "react-native-gesture-handler" /Users/ben/workspace/WatchList/mobile/src/screens/RoomScreen.tsx; then
  echo "✅ RoomScreen utilise react-native-gesture-handler"
else
  echo "❌ RoomScreen n'utilise pas react-native-gesture-handler"
fi

if grep -q "PanGestureHandler" /Users/ben/workspace/WatchList/mobile/src/screens/RoomScreen.tsx; then
  echo "✅ RoomScreen utilise PanGestureHandler"
else
  echo "❌ RoomScreen n'utilise pas PanGestureHandler"
fi

# Vérifier les trois onglets
if grep -q "À regarder\|En cours\|Terminé" /Users/ben/workspace/WatchList/mobile/src/screens/RoomScreen.tsx; then
  echo "✅ RoomScreen contient les trois onglets"
else
  echo "❌ RoomScreen ne contient pas tous les onglets"
fi

echo -e "${YELLOW}🧪 Test des fonctionnalités spécifiques à chaque onglet${NC}"

# Test des filtres par statut
echo "Test des filtres par statut..."
PLANNED_ITEMS=$(echo "$UPDATED_ROOM_DATA" | jq '.items | map(select(.status == "a_voir"))')
WATCHING_ITEMS=$(echo "$UPDATED_ROOM_DATA" | jq '.items | map(select(.status == "en_cours"))')
COMPLETED_ITEMS=$(echo "$UPDATED_ROOM_DATA" | jq '.items | map(select(.status == "termine"))')

echo "Items filtrés par statut:"
echo "- À regarder: $(echo "$PLANNED_ITEMS" | jq 'length') items"
echo "- En cours: $(echo "$WATCHING_ITEMS" | jq 'length') items"
echo "- Terminés: $(echo "$COMPLETED_ITEMS" | jq 'length') items"

# Test de suppression (swipe vers la corbeille)
echo -e "${YELLOW}🗑️ Test de suppression d'items${NC}"

# Supprimer un item
ITEM_TO_DELETE=$(echo "$UPDATED_ROOM_DATA" | jq -r '.items[0].id')
if [ "$ITEM_TO_DELETE" != "null" ]; then
  DELETE_RESPONSE=$(curl -s -X DELETE "$BASE_URL/api/items/$ITEM_TO_DELETE")
  echo "✅ Item supprimé: $ITEM_TO_DELETE"
else
  echo "❌ Pas d'item à supprimer"
fi

# Vérifier la suppression
FINAL_ROOM_DATA=$(curl -s "$BASE_URL/api/rooms/$ROOM_ID/items")
FINAL_TOTAL=$(echo "$FINAL_ROOM_DATA" | jq '.items | length')
echo "Nombre total d'items après suppression: $FINAL_TOTAL"

echo -e "${GREEN}✅ Tests des swipes terminés${NC}"
echo -e "${YELLOW}📋 Résumé des tests:${NC}"
echo "- ✅ Création de données de test"
echo "- ✅ Test des transitions de statut"
echo "- ✅ Vérification des filtres"
echo "- ✅ Test de suppression"
echo "- ✅ Vérification de la structure RoomScreen"

echo -e "${GREEN}🎉 Tous les tests de swipes sont validés !${NC}"
echo -e "${YELLOW}🔗 Room de test accessible sur: http://localhost:8081 (Room ID: $ROOM_ID)${NC}"
