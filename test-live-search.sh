#!/bin/bash

# Test de recherche en temps réel
echo "=== Test de recherche en temps réel ==="

# Tester une recherche courte avec l'API
echo "1. Test avec query courte (< 2 caractères)..."
curl -s "http://localhost:3000/api/search?q=a" | jq '.'

echo ""
echo "2. Test avec query normale..."
curl -s "http://localhost:3000/api/search?q=naruto" | jq '.' | head -20

echo ""
echo "3. Test avec query longue..."
curl -s "http://localhost:3000/api/search?q=attack%20on%20titan" | jq '.' | head -20

echo ""
echo "=== Tests terminés ==="
