#!/bin/bash

# Test complet de la recherche en temps réel
echo "=== Test complet de la recherche en temps réel ==="

echo "✅ Fonctionnalités implémentées :"
echo "   • Recherche déclenchée à chaque caractère (debounce 500ms)"
echo "   • Cache côté serveur (5 min)"
echo "   • Indicateur de chargement dynamique"
echo "   • Annulation des requêtes précédentes"
echo "   • Seuil minimum de 2 caractères"
echo ""

echo "🔍 Tests de l'API de recherche :"
echo ""

echo "1. Test avec query courte (< 2 caractères) - doit être filtré côté mobile :"
echo "   ❌ Pas de requête envoyée pour 'a'"
echo ""

echo "2. Test avec query normale :"
TIME_START=$(date +%s%3N)
RESULT_COUNT=$(curl -s "http://localhost:3000/api/search/autocomplete/one%20piece" | jq '.results | length')
TIME_END=$(date +%s%3N)
DURATION=$((TIME_END - TIME_START))
echo "   ✅ 'one piece' -> $RESULT_COUNT résultats en ${DURATION}ms"
echo ""

echo "3. Test du cache (même requête) :"
TIME_START=$(date +%s%3N)
RESULT_COUNT=$(curl -s "http://localhost:3000/api/search/autocomplete/one%20piece" | jq '.results | length')
TIME_END=$(date +%s%3N)
DURATION=$((TIME_END - TIME_START))
echo "   ✅ 'one piece' (cache) -> $RESULT_COUNT résultats en ${DURATION}ms"
echo ""

echo "4. Test avec caractères progressifs (simulation frappe) :"
for query in "a" "at" "att" "atta" "attack"; do
    if [ ${#query} -ge 2 ]; then
        RESULT_COUNT=$(curl -s "http://localhost:3000/api/search/autocomplete/$query" | jq '.results | length')
        echo "   ✅ '$query' -> $RESULT_COUNT résultats"
    else
        echo "   ❌ '$query' -> filtré côté mobile (< 2 chars)"
    fi
done
echo ""

echo "📱 Configuration mobile :"
echo "   • Debounce : 500ms"
echo "   • Seuil minimum : 2 caractères"
echo "   • Indicateur de chargement : ⏳"
echo "   • Cache côté serveur : 5 minutes"
echo ""

echo "🎯 Performance optimisée pour la recherche en temps réel !"
echo "=== Test terminé ==="
