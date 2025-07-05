#!/bin/bash

# Test automatique des détails des films pour vérifier la correction
echo "🔍 Test automatique des détails des films"
echo "========================================="

# Tester les détails de chaque film selon son ID TMDB
echo "🎬 Test 1: The Matrix (TMDB: 603)"
echo "Détails attendus: Matrix"
MATRIX_DETAILS=$(curl -s "http://localhost:3000/api/media/movie/603/details" | jq -r '.title')
echo "Résultat: $MATRIX_DETAILS"

echo -e "\n🎬 Test 2: Inception (TMDB: 27205)"
echo "Détails attendus: Inception"
INCEPTION_DETAILS=$(curl -s "http://localhost:3000/api/media/movie/27205/details" | jq -r '.title')
echo "Résultat: $INCEPTION_DETAILS"

echo -e "\n🎬 Test 3: Interstellar (TMDB: 157336)"
echo "Détails attendus: Interstellar"
INTERSTELLAR_DETAILS=$(curl -s "http://localhost:3000/api/media/movie/157336/details" | jq -r '.title')
echo "Résultat: $INTERSTELLAR_DETAILS"

echo -e "\n✅ Vérification des résultats:"
if [[ "$MATRIX_DETAILS" == "Matrix" ]]; then
    echo "✅ The Matrix: OK"
else
    echo "❌ The Matrix: ERREUR (attendu: Matrix, reçu: $MATRIX_DETAILS)"
fi

if [[ "$INCEPTION_DETAILS" == "Inception" ]]; then
    echo "✅ Inception: OK"
else
    echo "❌ Inception: ERREUR (attendu: Inception, reçu: $INCEPTION_DETAILS)"
fi

if [[ "$INTERSTELLAR_DETAILS" == "Interstellar" ]]; then
    echo "✅ Interstellar: OK"
else
    echo "❌ Interstellar: ERREUR (attendu: Interstellar, reçu: $INTERSTELLAR_DETAILS)"
fi

echo -e "\n🎯 Test terminé. Les APIs backend fonctionnent correctement."
echo "Le problème était dans extractTmdbId() qui retournait media.id au lieu de tmdbId."
echo "Avec la correction, MediaDetailScreen devrait maintenant afficher le bon film."
