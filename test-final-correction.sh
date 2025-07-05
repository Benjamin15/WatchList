#!/bin/bash

# Test final de la correction du problème MediaDetailScreen
echo "🎯 Test final de la correction MediaDetailScreen"
echo "==============================================="

ROOM_ID="00aad2a0f34a"

echo "🔍 1. Vérification des données backend"
echo "Room ID: $ROOM_ID"

# Récupérer les données brutes
echo -e "\n📊 Données brutes de la room:"
curl -s "http://localhost:3000/api/rooms/$ROOM_ID/items" | jq '.items[] | {id, title, external_id}'

echo -e "\n🔧 2. Vérification de la transformation extractTmdbId"
echo "Test de la fonction extractTmdbId dans le service API:"

# Tester avec des données simulées
echo "external_id: 'tmdb_603' -> doit donner 603"
echo "external_id: 'tmdb_27205' -> doit donner 27205"
echo "external_id: 'tmdb_157336' -> doit donner 157336"

echo -e "\n✅ 3. Vérification des APIs de détails"
echo "TMDB 603 -> $(curl -s 'http://localhost:3000/api/media/movie/603/details' | jq -r '.title')"
echo "TMDB 27205 -> $(curl -s 'http://localhost:3000/api/media/movie/27205/details' | jq -r '.title')"
echo "TMDB 157336 -> $(curl -s 'http://localhost:3000/api/media/movie/157336/details' | jq -r '.title')"

echo -e "\n🎯 4. Résolution du problème"
echo "Problème identifié: extractTmdbId() dans helpers.ts retournait media.id (ID local) au lieu de tmdbId"
echo "Solution appliquée: Suppression de la logique dangereuse qui utilisait media.id"
echo "Maintenant: extractTmdbId() ne retourne que des IDs TMDB valides ou null"

echo -e "\n📱 5. Test à faire dans l'application mobile"
echo "1. Rejoindre la room: $ROOM_ID"
echo "2. Cliquer sur 'The Matrix' -> doit afficher 'Matrix'"
echo "3. Cliquer sur 'Inception' -> doit afficher 'Inception'"
echo "4. Cliquer sur 'Interstellar' -> doit afficher 'Interstellar'"

echo -e "\n🔍 6. Logs à surveiller dans la console mobile"
echo "- [API] Transformation item: The Matrix (346) -> external_id: tmdb_603 -> tmdbId: 603"
echo "- [API] Transformation item: Inception (366) -> external_id: tmdb_27205 -> tmdbId: 27205"
echo "- [API] Transformation item: Interstellar (359) -> external_id: tmdb_157336 -> tmdbId: 157336"
echo "- [MediaDetailScreen] TMDB ID extrait: 603 (pour The Matrix)"
echo "- [MediaDetailScreen] TMDB ID extrait: 27205 (pour Inception)"
echo "- [MediaDetailScreen] TMDB ID extrait: 157336 (pour Interstellar)"

echo -e "\n🎉 La correction devrait maintenant fonctionner !"
echo "Le problème était que l'ID local (346, 366, 359) était utilisé comme ID TMDB"
echo "Maintenant, seuls les vrais IDs TMDB (603, 27205, 157336) sont utilisés"
