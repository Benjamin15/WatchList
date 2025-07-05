#!/bin/bash

# Script de test final pour valider la correction de l'erreur 404 joinRoom

BASE_URL="http://192.168.0.14:3000/api"

echo "=== Test de correction de l'erreur 404 joinRoom ==="
echo "URL de base: $BASE_URL"
echo ""

# Créer une nouvelle room de test
echo "1. Création d'une nouvelle room de test"
create_response=$(curl -s -X POST "$BASE_URL/rooms" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Room Fix"}')

echo "Réponse de création:"
echo "$create_response" | jq '.'

# Extraire le room_id
room_id=$(echo "$create_response" | jq -r '.room_id')
echo "Room ID généré: $room_id"
echo ""

# Test avec le code en minuscules (original)
echo "2. Test avec le code en minuscules (original)"
lower_response=$(curl -s -X GET "$BASE_URL/rooms/$room_id" \
  -H "Content-Type: application/json")

echo "Réponse avec code en minuscules:"
echo "$lower_response" | jq '.'
echo ""

# Test avec le code en majuscules (comme transformé par le mobile)
echo "3. Test avec le code en majuscules (comme transformé par le mobile)"
upper_code=$(echo "$room_id" | tr '[:lower:]' '[:upper:]')
echo "Code en majuscules: $upper_code"

upper_response=$(curl -s -X GET "$BASE_URL/rooms/$upper_code" \
  -H "Content-Type: application/json")

echo "Réponse avec code en majuscules:"
echo "$upper_response" | jq '.'
echo ""

# Test avec un mélange de casse
echo "4. Test avec un mélange de casse"
mixed_code=$(echo "$room_id" | sed 's/\(.\)/\U\1/g; s/\(.\{2\}\)/\L\1/g')
echo "Code mixte: $mixed_code"

mixed_response=$(curl -s -X GET "$BASE_URL/rooms/$mixed_code" \
  -H "Content-Type: application/json")

echo "Réponse avec code mixte:"
echo "$mixed_response" | jq '.'
echo ""

# Vérifier les résultats
echo "=== Résultats ==="
if echo "$upper_response" | jq -e '.room_id' > /dev/null 2>&1; then
    echo "✅ SUCCESS: La recherche insensible à la casse fonctionne"
    echo "✅ Le problème d'erreur 404 joinRoom est corrigé"
else
    echo "❌ ERREUR: La recherche insensible à la casse ne fonctionne pas"
fi

# Test des items de la room
echo ""
echo "5. Test des items de la room avec code en majuscules"
items_response=$(curl -s -X GET "$BASE_URL/rooms/$upper_code/items" \
  -H "Content-Type: application/json")

echo "Réponse items avec code en majuscules:"
echo "$items_response" | jq '.'

if echo "$items_response" | jq -e '.room' > /dev/null 2>&1; then
    echo "✅ SUCCESS: Les items de la room sont accessible avec code en majuscules"
else
    echo "❌ ERREUR: Les items de la room ne sont pas accessibles avec code en majuscules"
fi
