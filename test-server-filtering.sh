#!/bin/bash

# Script de test pour vérifier le filtrage des médias côté serveur

echo "🧪 Test du filtrage des médias côté serveur"
echo "=========================================="

# Configuration
ROOM_ID="de5861b3fcc1"
SEARCH_QUERY="spider"
SERVER_URL="http://localhost:3000"

echo "1. Recherche SANS filtrage (route générale)..."
search_response_no_filter=$(curl -s "$SERVER_URL/api/search/autocomplete/$SEARCH_QUERY")
results_count_no_filter=$(echo "$search_response_no_filter" | jq '.results | length')
echo "✅ Résultats sans filtrage: $results_count_no_filter"

echo "2. Recherche AVEC filtrage par room..."
search_response_with_filter=$(curl -s "$SERVER_URL/api/search/autocomplete/$SEARCH_QUERY/$ROOM_ID")
results_count_with_filter=$(echo "$search_response_with_filter" | jq '.results | length')
echo "✅ Résultats avec filtrage: $results_count_with_filter"

echo "3. Vérification des médias existants dans la room..."
room_items=$(curl -s "$SERVER_URL/api/rooms/$ROOM_ID/items")
existing_count=$(echo "$room_items" | jq '.items | length')
echo "📋 Médias dans la room: $existing_count"

echo "4. Comparaison des résultats..."
if [ "$results_count_with_filter" -lt "$results_count_no_filter" ]; then
    echo "✅ SUCCÈS: Le filtrage fonctionne (moins de résultats avec filtrage)"
    echo "   - Sans filtrage: $results_count_no_filter résultats"
    echo "   - Avec filtrage: $results_count_with_filter résultats"
    echo "   - Différence: $((results_count_no_filter - results_count_with_filter)) médias filtrés"
else
    echo "❌ PROBLÈME: Le filtrage ne semble pas fonctionner"
    echo "   - Sans filtrage: $results_count_no_filter résultats"
    echo "   - Avec filtrage: $results_count_with_filter résultats"
fi

echo "5. Vérification que Spider-Man No Way Home est bien filtré..."
spiderman_in_no_filter=$(echo "$search_response_no_filter" | jq -r '.results[] | select(.external_id == "tmdb_634649") | .title')
spiderman_in_with_filter=$(echo "$search_response_with_filter" | jq -r '.results[] | select(.external_id == "tmdb_634649") | .title')

if [ ! -z "$spiderman_in_no_filter" ]; then
    echo "✅ Spider-Man No Way Home trouvé SANS filtrage: $spiderman_in_no_filter"
else
    echo "⚠️  Spider-Man No Way Home non trouvé sans filtrage"
fi

if [ -z "$spiderman_in_with_filter" ]; then
    echo "✅ Spider-Man No Way Home correctement filtré AVEC filtrage"
else
    echo "❌ Spider-Man No Way Home toujours présent avec filtrage: $spiderman_in_with_filter"
fi

echo "6. Test d'ajout d'un autre média Spider-Man..."
# Chercher un autre média Spider-Man dans les résultats filtrés
other_spiderman=$(echo "$search_response_with_filter" | jq -r '.results[0]')
if [ "$other_spiderman" != "null" ]; then
    title=$(echo "$other_spiderman" | jq -r '.title')
    external_id=$(echo "$other_spiderman" | jq -r '.external_id')
    
    echo "📝 Ajout du média: $title ($external_id)"
    
    # Créer le payload pour l'ajout
    payload=$(echo "$other_spiderman" | jq '{
        title: .title,
        type: .type,
        description: .description,
        image_url: .image_url,
        rating: .rating,
        tmdbId: (.external_id | gsub("tmdb_"; "") | tonumber)
    }')
    
    add_response=$(curl -s -X POST "$SERVER_URL/api/rooms/$ROOM_ID/items" \
        -H "Content-Type: application/json" \
        -d "$payload")
    
    if echo "$add_response" | jq -e '.id' > /dev/null; then
        echo "✅ Média ajouté avec succès"
        
        # Nouvelle recherche pour vérifier le filtrage
        echo "7. Nouvelle recherche pour vérifier le filtrage..."
        new_search_response=$(curl -s "$SERVER_URL/api/search/autocomplete/$SEARCH_QUERY/$ROOM_ID")
        new_results_count=$(echo "$new_search_response" | jq '.results | length')
        
        if [ "$new_results_count" -lt "$results_count_with_filter" ]; then
            echo "✅ SUCCÈS: Le média ajouté est maintenant filtré"
            echo "   - Avant ajout: $results_count_with_filter résultats"
            echo "   - Après ajout: $new_results_count résultats"
        else
            echo "❌ PROBLÈME: Le filtrage dynamique ne fonctionne pas"
            echo "   - Avant ajout: $results_count_with_filter résultats"
            echo "   - Après ajout: $new_results_count résultats"
        fi
    else
        echo "❌ Erreur lors de l'ajout du média"
        echo "$add_response"
    fi
else
    echo "⚠️  Aucun autre média Spider-Man disponible pour le test"
fi

echo "🏁 Test terminé"
