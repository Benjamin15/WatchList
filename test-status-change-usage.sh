#!/bin/bash

# Script pour tester le changement de statut dans l'application WatchList
# Ce script guide l'utilisateur à travers un test complet

echo "🎬 Test d'usage - Changement de statut dans MediaDetailScreen"
echo "=========================================================="

echo "🚀 Démarrage de l'application pour test..."

# Vérifier si le serveur backend est en cours d'exécution
if lsof -i :3000 > /dev/null 2>&1; then
    echo "✅ Serveur backend actif sur le port 3000"
else
    echo "⚠️  Serveur backend non actif - démarrage..."
    cd backend
    npm start &
    BACKEND_PID=$!
    echo "🔄 Attente de 5 secondes pour le démarrage du serveur..."
    sleep 5
    cd ..
fi

echo ""
echo "📋 Instructions de test :"
echo "========================"
echo ""
echo "1️⃣ ÉTAPE 1 : Tester avec un média NON dans la liste"
echo "   • Ouvrez l'application"
echo "   • Allez dans une room"
echo "   • Utilisez la recherche pour trouver un nouveau média"
echo "   • Cliquez sur le média pour voir ses détails"
echo "   • ✅ Vérifiez : Le bouton 'Ajouter à ma liste' est visible"
echo ""
echo "2️⃣ ÉTAPE 2 : Ajouter le média à la liste"
echo "   • Cliquez sur 'Ajouter à ma liste'"
echo "   • ✅ Vérifiez : Le média est ajouté et vous revenez à l'écran précédent"
echo ""
echo "3️⃣ ÉTAPE 3 : Tester avec un média DANS la liste"
echo "   • Retournez dans la room"
echo "   • Cliquez sur le média que vous venez d'ajouter"
echo "   • ✅ Vérifiez : Le bouton 'Ajouter à ma liste' a disparu"
echo "   • ✅ Vérifiez : Une section 'Statut dans ma liste' est visible"
echo "   • ✅ Vérifiez : 4 boutons de statut sont présents :"
echo "     🔖 À regarder (orange, bookmark)"
echo "     ▶️ En cours (bleu, play-circle)"
echo "     ✅ Terminé (vert, checkmark-circle)"
echo "     ❌ Abandonné (rouge, close-circle)"
echo "   • ✅ Vérifiez : 'À regarder' est sélectionné (média nouvellement ajouté)"
echo ""
echo "4️⃣ ÉTAPE 4 : Tester le changement de statut"
echo "   • Cliquez sur 'En cours'"
echo "   • ✅ Vérifiez : Le statut change immédiatement sans modal"
echo "   • ✅ Vérifiez : 'En cours' est maintenant sélectionné"
echo "   • Cliquez sur 'Terminé'"
echo "   • ✅ Vérifiez : Le statut change vers 'Terminé'"
echo "   • Cliquez sur 'Abandonné'"
echo "   • ✅ Vérifiez : Le statut change vers 'Abandonné'"
echo "   • Cliquez sur 'À regarder'"
echo "   • ✅ Vérifiez : Le statut revient à 'À regarder'"
echo ""
echo "5️⃣ ÉTAPE 5 : Vérifier la persistance"
echo "   • Fermez l'écran de détails"
echo "   • Rouvrez le même média"
echo "   • ✅ Vérifiez : Le statut sélectionné est conservé"
echo "   • ✅ Vérifiez : La section 'Statut dans ma liste' est toujours visible"
echo ""
echo "6️⃣ ÉTAPE 6 : Vérifier dans la liste principale"
echo "   • Retournez dans la room"
echo "   • Changez d'onglet selon le statut que vous avez sélectionné"
echo "   • ✅ Vérifiez : Le média apparaît dans l'onglet correspondant"
echo ""

echo "🎯 Points critiques à vérifier :"
echo "• Média non dans la liste → Bouton 'Ajouter à ma liste'"
echo "• Média dans la liste → Section 'Statut dans ma liste'"
echo "• Changement de statut immédiat sans modal"
echo "• Feedback visuel correct (couleurs, icônes)"
echo "• Persistance des changements"
echo "• Cohérence avec la liste principale"
echo ""

echo "🚀 Lancement de l'application mobile..."
cd mobile
npx expo start

echo ""
echo "📱 Application lancée - Suivez les instructions ci-dessus pour tester !"
echo "🐛 Si vous trouvez des problèmes, notez-les pour correction"
