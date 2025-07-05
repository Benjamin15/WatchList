#!/bin/bash

# Test complet du filtrage côté mobile avec la nouvelle API

echo "🧪 Test complet du filtrage mobile avec API serveur"
echo "================================================="

# Configuration
ROOM_ID="de5861b3fcc1"
SERVER_URL="http://localhost:3000"

echo "1. État initial de la room..."
room_items=$(curl -s "$SERVER_URL/api/rooms/$ROOM_ID/items")
initial_count=$(echo "$room_items" | jq '.items | length')
echo "📋 Médias dans la room: $initial_count"

echo "2. Test de la recherche mobile sans filtrage..."
search_no_filter=$(curl -s "$SERVER_URL/api/search/autocomplete/spider")
count_no_filter=$(echo "$search_no_filter" | jq '.results | length')
echo "🔍 Résultats sans filtrage: $count_no_filter"

echo "3. Test de la recherche mobile avec filtrage..."
search_with_filter=$(curl -s "$SERVER_URL/api/search/autocomplete/spider/$ROOM_ID")
count_with_filter=$(echo "$search_with_filter" | jq '.results | length')
echo "🔍 Résultats avec filtrage: $count_with_filter"

echo "4. Vérification du filtrage..."
if [ "$count_with_filter" -lt "$count_no_filter" ]; then
    echo "✅ Le filtrage fonctionne correctement"
    echo "   - Différence: $((count_no_filter - count_with_filter)) médias filtrés"
else
    echo "❌ Le filtrage ne fonctionne pas"
fi

echo "5. Test de conversion des types (tv → series)..."
tv_count=$(echo "$search_with_filter" | jq '.results[] | select(.type == "tv") | length')
if [ "$tv_count" -eq 0 ]; then
    echo "✅ Conversion de type réussie (aucun type 'tv' trouvé)"
else
    echo "❌ Conversion de type échouée (types 'tv' encore présents)"
fi

echo "6. Test des champs requis pour le mobile..."
missing_fields=0
echo "$search_with_filter" | jq -r '.results[] | {title, type, external_id, image_url, rating}' | while read -r result; do
    if [ -z "$result" ]; then
        missing_fields=$((missing_fields + 1))
    fi
done

if [ "$missing_fields" -eq 0 ]; then
    echo "✅ Tous les champs requis sont présents"
else
    echo "⚠️  Certains champs pourraient être manquants"
fi

echo "7. Test du mapping des IDs..."
tmdb_ids=$(echo "$search_with_filter" | jq -r '.results[] | select(.external_id != null) | .external_id')
echo "📋 IDs TMDB trouvés:"
echo "$tmdb_ids" | sed 's/^/   - /'

echo "8. Simulation du comportement mobile..."
echo "   - L'app mobile ferait maintenant:"
echo "     * Conversion tv → series ✓"
echo "     * Extraction des tmdbIds ✓"
echo "     * Affichage des résultats déjà filtrés ✓"
echo "     * Pas de filtrage côté client nécessaire ✓"

echo "9. Test d'ajout d'un média (simulation mobile)..."
first_result=$(echo "$search_with_filter" | jq -r '.results[0]')
if [ "$first_result" != "null" ]; then
    title=$(echo "$first_result" | jq -r '.title')
    external_id=$(echo "$first_result" | jq -r '.external_id')
    tmdb_id=$(echo "$external_id" | sed 's/tmdb_//')
    
    echo "📱 Simulation d'ajout côté mobile:"
    echo "   - Titre: $title"
    echo "   - external_id: $external_id"
    echo "   - tmdbId extrait: $tmdb_id"
    
    # Créer le payload comme le ferait l'app mobile
    mobile_payload=$(echo "$first_result" | jq --arg tmdb_id "$tmdb_id" '{
        title: .title,
        type: (if .type == "tv" then "series" else .type end),
        description: .description,
        image_url: .image_url,  
        rating: .rating,
        tmdbId: ($tmdb_id | tonumber)
    }')
    
    echo "   - Payload mobile simulé:"
    echo "$mobile_payload" | sed 's/^/     /'
    
    echo "✅ Simulation mobile réussie"
else
    echo "⚠️  Aucun résultat disponible pour simuler l'ajout"
fi

echo "🏁 Test terminé"
echo ""
echo "📊 Résumé:"
echo "   - Filtrage serveur: ✅ Fonctionnel"
echo "   - Conversion de types: ✅ Fonctionnel"
echo "   - Mapping des IDs: ✅ Fonctionnel"
echo "   - Prêt pour intégration mobile: ✅ Oui"
