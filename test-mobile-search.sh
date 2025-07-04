#!/bin/bash

# Test de recherche mobile en temps réel
echo "🔍 Test de la recherche mobile en temps réel"

# Vérifier que le serveur fonctionne
echo "1. Vérification du serveur..."
response=$(curl -s "http://localhost:3000/api/health")
if [[ $response == *"OK"* ]]; then
    echo "✅ Serveur accessible"
else
    echo "❌ Serveur non accessible"
    exit 1
fi

# Test de la recherche autocomplete
echo "2. Test de l'API de recherche..."
response=$(curl -s "http://localhost:3000/api/search/autocomplete/marvel")
if [[ $response == *"results"* ]]; then
    echo "✅ API de recherche fonctionne"
    # Compter le nombre de résultats
    count=$(echo "$response" | grep -o '"external_id"' | wc -l)
    echo "   Nombre de résultats: $count"
else
    echo "❌ API de recherche ne fonctionne pas"
    echo "Réponse: $response"
    exit 1
fi

# Test avec différents termes de recherche
echo "3. Test avec différents termes..."
terms=("spider" "batman" "one piece" "naruto")

for term in "${terms[@]}"; do
    echo "   Recherche: $term"
    response=$(curl -s "http://localhost:3000/api/search/autocomplete/$term")
    if [[ $response == *"results"* ]]; then
        count=$(echo "$response" | grep -o '"external_id"' | wc -l)
        echo "   ✅ $count résultats trouvés"
    else
        echo "   ❌ Aucun résultat pour $term"
    fi
done

echo "4. Instructions pour tester l'application mobile:"
echo "   - Ouvrez l'application mobile (QR code scanné)"
echo "   - Naviguez vers l'écran de recherche"
echo "   - Tapez quelques caractères (ex: 'mar')"
echo "   - Vérifiez que les résultats apparaissent en temps réel"
echo "   - Testez avec différents termes: marvel, spider, batman, etc."

echo "✅ Tests serveur terminés. Testez maintenant l'application mobile!"
