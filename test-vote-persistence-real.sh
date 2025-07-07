#!/bin/bash

# Script de test réel pour valider la correction de persistance des votes par room

echo "🧪 TEST RÉEL: Persistance des votes supprimés par room"
echo "====================================================="
echo ""

echo "📋 Instructions de test:"
echo "Ce test valide que les votes supprimés dans une room ne réapparaissent pas"
echo "quand vous changez de room puis revenez."
echo ""

echo "🔧 Préparation:"
echo "1. Assurez-vous d'avoir au moins 2 rooms avec des votes"
echo "2. Si pas de votes, créez quelques votes de test dans chaque room"
echo ""

echo "📱 Démarrage de l'app..."
cd mobile && npm start &
MOBILE_PID=$!

echo ""
echo "🧪 Étapes de test à effectuer:"
echo "============================================="
echo ""
echo "🏠 ÉTAPE 1: Première room"
echo "• Ouvrez une room qui contient des votes"
echo "• Notez le nom de cette room (ex: 'Room A')"
echo "• Supprimez 1-2 notifications de vote (swipe vers la gauche)"
echo "• Vérifiez qu'elles disparaissent"
echo ""

echo "🔄 ÉTAPE 2: Changement de room"
echo "• Retournez à l'accueil (bouton retour)"
echo "• Ouvrez une autre room différente"
echo "• Notez qu'elle a ses propres votes (ou n'en a pas)"
echo "• Supprimez 1 vote dans cette room si disponible"
echo ""

echo "🔄 ÉTAPE 3: Retour à la première room"
echo "• Retournez à l'accueil"
echo "• Rouvrez la première room (Room A)"
echo ""

echo "✅ ÉTAPE 4: Vérification (CRITIQUE)"
echo "• Les votes que vous aviez supprimés à l'étape 1 doivent RESTER supprimés"
echo "• Ils ne doivent PAS réapparaître"
echo "• C'est la correction principale testée !"
echo ""

echo "🔄 ÉTAPE 5: Test inverse"
echo "• Retournez à la deuxième room"
echo "• Vérifiez que ses votes supprimés restent supprimés aussi"
echo "• Confirmez l'isolation entre rooms"
echo ""

echo "⏱️  Effectuez les tests ci-dessus, puis appuyez sur Entrée..."
read -r

echo ""
echo "❓ Questions de validation:"
echo "=========================="
echo ""
read -p "Les votes supprimés dans Room A sont-ils restés supprimés après retour? (y/n): " room_a_persistent
read -p "Les votes supprimés dans Room B sont-ils restés supprimés après retour? (y/n): " room_b_persistent
read -p "Y a-t-il eu pollution croisée (votes d'une room affectant l'autre)? (y/n): " cross_pollution

echo ""
echo "📊 Résultats du test:"
echo "===================="

if [[ "$room_a_persistent" == "y" && "$room_b_persistent" == "y" && "$cross_pollution" == "n" ]]; then
    echo "🎉 SUCCÈS COMPLET!"
    echo "✅ Persistance Room A: OK"
    echo "✅ Persistance Room B: OK"
    echo "✅ Isolation entre rooms: OK"
    echo ""
    echo "✅ La correction fonctionne parfaitement!"
    echo "• Les votes supprimés restent supprimés par room"
    echo "• Pas de pollution croisée entre rooms"
    echo "• Persistance correcte lors des changements"
else
    echo "❌ PROBLÈME DÉTECTÉ:"
    [[ "$room_a_persistent" != "y" ]] && echo "❌ Room A: votes supprimés réapparus"
    [[ "$room_b_persistent" != "y" ]] && echo "❌ Room B: votes supprimés réapparus"
    [[ "$cross_pollution" == "y" ]] && echo "❌ Pollution croisée entre rooms"
    echo ""
    echo "⚠️  La correction nécessite des ajustements"
fi

echo ""
echo "🛑 Arrêt de l'app..."
kill $MOBILE_PID 2>/dev/null

echo ""
echo "📝 Détails techniques de la correction:"
echo "• Clé de stockage: dismissedVotes_[ROOM_ID] (au lieu de dismissedVotes globale)"
echo "• Chargement: loadDismissedVotes(roomId) au changement de room"
echo "• Sauvegarde: saveDismissedVotes(roomId, votes) avec isolation"
echo "• Réinitialisation: votes temporaires remis à zéro par room"
