#!/bin/bash

# Script de test d'usage pour la suppression automatique des médias abandonnés

echo "🗑️ Test d'usage - Suppression automatique des médias abandonnés"
echo "============================================================="

echo "🚀 Lancement de l'application pour test..."

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
echo "📋 Instructions de test détaillées :"
echo "===================================="
echo ""
echo "1️⃣ PRÉPARATION :"
echo "   • Ouvrez l'application"
echo "   • Allez dans une room avec des médias"
echo "   • Ou ajoutez quelques médias à votre liste"
echo ""
echo "2️⃣ TESTER L'ANCIENNE INTERFACE (pour comparaison) :"
echo "   • Cliquez sur un média déjà dans votre liste"
echo "   • Observez la section 'Statut dans ma liste'"
echo "   • ✅ Vérifiez : 4 boutons sont présents"
echo "   • ✅ Vérifiez : Le 4ème bouton s'appelle maintenant 'Supprimer' (pas 'Abandonné')"
echo "   • ✅ Vérifiez : Le bouton 'Supprimer' a une icône poubelle 🗑️"
echo ""
echo "3️⃣ TESTER LA SUPPRESSION :"
echo "   • Cliquez sur le bouton 'Supprimer' (rouge avec icône poubelle)"
echo "   • ✅ Vérifiez : Une modal de confirmation s'affiche"
echo "   • ✅ Vérifiez : Le message est :"
echo "     'Marquer ce média comme \"abandonné\" le retirera"
echo "     définitivement de votre liste. Continuer ?'"
echo "   • ✅ Vérifiez : Deux boutons sont présents :"
echo "     - 'Annuler' (style normal)"
echo "     - 'Supprimer' (style destructif/rouge)"
echo ""
echo "4️⃣ TESTER L'ANNULATION :"
echo "   • Cliquez sur 'Annuler'"
echo "   • ✅ Vérifiez : La modal se ferme"
echo "   • ✅ Vérifiez : Vous restez sur l'écran de détails"
echo "   • ✅ Vérifiez : Le média est toujours dans la liste"
echo ""
echo "5️⃣ TESTER LA SUPPRESSION CONFIRMÉE :"
echo "   • Cliquez à nouveau sur 'Supprimer'"
echo "   • Dans la modal, cliquez sur 'Supprimer' (bouton rouge)"
echo "   • ✅ Vérifiez : Vous êtes automatiquement redirigé vers l'écran précédent"
echo "   • ✅ Vérifiez : Le média a disparu de la liste"
echo ""
echo "6️⃣ VÉRIFIER LA SUPPRESSION DÉFINITIVE :"
echo "   • Naviguez dans les différents onglets (À regarder, En cours, Terminé)"
echo "   • ✅ Vérifiez : Le média supprimé n'apparaît dans aucun onglet"
echo "   • Rechargez la room ou redémarrez l'application"
echo "   • ✅ Vérifiez : Le média reste supprimé (persistance)"
echo ""
echo "7️⃣ TESTER AVEC DIFFÉRENTS MÉDIAS :"
echo "   • Répétez le test avec différents types de médias"
echo "   • Testez avec des médias de différents statuts"
echo "   • ✅ Vérifiez : Le comportement est cohérent"
echo ""

echo "⚠️ Points critiques à vérifier :"
echo "==============================="
echo "• Bouton 'Abandonné' → 'Supprimer' avec icône poubelle"
echo "• Modal de confirmation obligatoire"
echo "• Possibilité d'annuler la suppression"
echo "• Suppression définitive (pas de statut 'dropped')"
echo "• Retour automatique à l'écran précédent"
echo "• Disparition du média de tous les onglets"
echo "• Persistance de la suppression"
echo ""

echo "🎯 Différence avec l'ancien comportement :"
echo "========================================="
echo "• AVANT : 'Abandonné' → Statut 'dropped', média reste dans la liste"
echo "• APRÈS : 'Supprimer' → Média retiré définitivement de la liste"
echo ""

echo "🚀 Lancement de l'application mobile..."
cd mobile
npx expo start

echo ""
echo "📱 Application lancée - Suivez les instructions ci-dessus pour tester !"
echo "🐛 Si vous trouvez des problèmes, notez-les pour correction"
echo "💡 Cette fonctionnalité améliore l'UX en nettoyant automatiquement la liste"
