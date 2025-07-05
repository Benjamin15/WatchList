#!/bin/bash

# Test de l'application mobile avec la room de debug
echo "🧪 Test de l'application mobile avec la room de debug"
echo "===================================================="

ROOM_ID="00aad2a0f34a"

echo "🎯 Room de test: $ROOM_ID"
echo "📽️ Films dans la room:"
curl -s "http://localhost:3000/api/rooms/$ROOM_ID/items" | jq '.items[] | {title, external_id}' | head -10

echo -e "\n📱 Instructions pour tester l'application:"
echo "1. Ouvrir l'application mobile"
echo "2. Rejoindre la room : $ROOM_ID"
echo "3. Vérifier que les 3 films sont affichés :"
echo "   - The Matrix (TMDB: 603)"
echo "   - Inception (TMDB: 27205)"
echo "   - Interstellar (TMDB: 157336)"
echo "4. Cliquer sur chaque film et vérifier que le bon film apparaît dans les détails"
echo "5. Vérifier les logs dans la console pour tracer les IDs"

echo -e "\n🔍 Logs à surveiller:"
echo "   - [API] Transformation item: ..."
echo "   - [extractTmdbId] Media reçu: ..."
echo "   - [MediaDetailScreen] TMDB ID extrait: ..."

echo -e "\n🎯 Test spécifique:"
echo "   - Cliquer sur 'The Matrix' → doit afficher 'Matrix' (titre TMDB français)"
echo "   - Cliquer sur 'Inception' → doit afficher 'Inception'"
echo "   - Cliquer sur 'Interstellar' → doit afficher 'Interstellar'"

echo -e "\n💡 Si le problème persiste, vérifier:"
echo "   - Que tmdbId est bien extrait dans le service API"
echo "   - Que extractTmdbId dans helpers.ts ne retourne pas media.id par erreur"
echo "   - Que MediaDetailScreen utilise le bon ID pour l'API TMDB"
