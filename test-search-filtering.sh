#!/bin/bash

# Script de test pour vérifier le filtrage des médias déjà ajoutés dans la recherche

echo "🧪 Test du filtrage des médias déjà ajoutés dans la recherche"
echo "============================================================"

# Configuration
ROOM_ID="1"
SEARCH_QUERY="spider"
SERVER_URL="http://localhost:3000"

echo "1. Récupération des médias existants dans la room $ROOM_ID..."
existing_response=$(curl -s "$SERVER_URL/api/rooms/$ROOM_ID/items")
echo "✅ Médias existants récupérés"

# Extraire les tmdbIds des médias existants
echo "2. Extraction des tmdbIds des médias existants..."
existing_tmdb_ids=$(echo "$existing_response" | jq -r '.data[].media.external_id // empty' | grep "tmdb_" | sed 's/tmdb_//' | sort -u)
echo "📋 tmdbIds existants:"
echo "$existing_tmdb_ids"

echo "3. Recherche de médias avec le terme '$SEARCH_QUERY'..."
search_response=$(curl -s "$SERVER_URL/api/search?q=$SEARCH_QUERY")
echo "✅ Résultats de recherche récupérés"

# Extraire les tmdbIds des résultats de recherche
echo "4. Extraction des tmdbIds des résultats de recherche..."
search_tmdb_ids=$(echo "$search_response" | jq -r '.data[].tmdbId // empty' | sort -u)
echo "📋 tmdbIds des résultats de recherche:"
echo "$search_tmdb_ids"

echo "5. Vérification du filtrage..."
overlap_found=false
for search_id in $search_tmdb_ids; do
    for existing_id in $existing_tmdb_ids; do
        if [ "$search_id" = "$existing_id" ]; then
            echo "❌ PROBLÈME: Le média avec tmdbId $search_id est présent dans la room ET dans les résultats de recherche"
            overlap_found=true
        fi
    done
done

if [ "$overlap_found" = false ]; then
    echo "✅ SUCCÈS: Aucun média déjà ajouté n'apparaît dans les résultats de recherche"
else
    echo "❌ ÉCHEC: Des médias déjà ajoutés apparaissent dans les résultats de recherche"
fi

echo "6. Test d'ajout d'un média et vérification du filtrage..."
# Ajouter un média des résultats de recherche
first_search_result=$(echo "$search_response" | jq -r '.data[0]')
if [ "$first_search_result" != "null" ]; then
    title=$(echo "$first_search_result" | jq -r '.title')
    tmdb_id=$(echo "$first_search_result" | jq -r '.tmdbId')
    
    echo "📝 Ajout du média: $title (tmdbId: $tmdb_id)"
    
    # Créer le payload pour l'ajout
    payload=$(echo "$first_search_result" | jq '{
        title: .title,
        type: .type,
        year: .year,
        genre: .genre,
        description: .description,
        image_url: .posterUrl,
        rating: .rating,
        tmdbId: .tmdbId,
        malId: .malId
    }')
    
    add_response=$(curl -s -X POST "$SERVER_URL/api/rooms/$ROOM_ID/items" \
        -H "Content-Type: application/json" \
        -d "$payload")
    
    echo "✅ Média ajouté à la room"
    
    # Nouvelle recherche pour vérifier le filtrage
    echo "7. Nouvelle recherche pour vérifier le filtrage..."
    new_search_response=$(curl -s "$SERVER_URL/api/search?q=$SEARCH_QUERY")
    
    # Vérifier si le média ajouté apparaît encore dans les résultats
    new_search_tmdb_ids=$(echo "$new_search_response" | jq -r '.data[].tmdbId // empty')
    
    if echo "$new_search_tmdb_ids" | grep -q "^$tmdb_id$"; then
        echo "❌ PROBLÈME: Le média ajouté (tmdbId: $tmdb_id) apparaît encore dans les résultats de recherche"
    else
        echo "✅ SUCCÈS: Le média ajouté n'apparaît plus dans les résultats de recherche"
    fi
else
    echo "⚠️  Aucun résultat de recherche disponible pour le test d'ajout"
fi

echo "🏁 Test terminé"
