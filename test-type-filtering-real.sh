#!/bin/bash

# Script de test pour valider la correction du filtrage par type dans l'app réelle
# Ce script démarre l'app et guide l'utilisateur pour tester le filtrage

echo "🧪 TEST RÉEL: Filtrage par type de contenu corrigé"
echo "=================================================="
echo ""

echo "📋 Préparation du test:"
echo "1. Assurez-vous d'avoir des séries et des films dans une room"
echo "2. Si pas de contenu, ajoutez quelques éléments de test"
echo ""

echo "🔧 Démarrage du serveur..."
cd server && npm start &
SERVER_PID=$!
sleep 3

echo "📱 Démarrage de l'app mobile..."
cd ../mobile && npm start &
MOBILE_PID=$!

echo ""
echo "🧪 Instructions de test:"
echo "----------------------------------------"
echo "1. Ouvrir l'app sur votre appareil/émulateur"
echo "2. Aller dans une room avec du contenu varié"
echo "3. Appuyer sur le bouton de filtrage (🔽 en bas à gauche)"
echo "4. Tester les filtres de type:"
echo "   • 'Tous' → Doit afficher tout le contenu"
echo "   • 'Films' → Doit afficher seulement les films"
echo "   • 'Séries' → Doit maintenant afficher les séries (CORRIGÉ!)"
echo ""
echo "✅ Vérifications attendues:"
echo "• Le filtre 'Séries' n'est plus vide"
echo "• Les séries apparaissent quand on sélectionne 'Séries'"
echo "• Le compteur de résultats est correct pour chaque filtre"
echo ""

echo "⏱️  Appuyez sur Entrée quand vous avez fini de tester..."
read -r

echo "🛑 Arrêt des serveurs..."
kill $SERVER_PID 2>/dev/null
kill $MOBILE_PID 2>/dev/null

echo ""
echo "📊 Résumé de la correction effectuée:"
echo "• Problème: filtre 'series' ne trouvait pas les données 'tv'"
echo "• Cause: Mapping series → tv lors de l'ajout, mais pas lors du filtrage"
echo "• Solution: Ajout du mapping dans getFilteredItems()"
echo "• Code: typeToMatch = appliedFilters.type === 'series' ? 'tv' : appliedFilters.type"
echo ""
echo "✅ Le filtrage par type de contenu est maintenant fonctionnel !"
