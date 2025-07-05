#!/bin/bash

# Script de test pratique pour valider les améliorations d'ergonomie du swipe
# Créé le 5 juillet 2025

echo "🚀 Test pratique des améliorations d'ergonomie du swipe"
echo "======================================================"

# 1. Démarrer le serveur backend
echo "1. Démarrage du serveur backend..."
cd server
npm start &
SERVER_PID=$!
echo "✅ Serveur démarré (PID: $SERVER_PID)"

# Attendre que le serveur démarre
sleep 3

# 2. Tester la connectivité du serveur
echo -e "\n2. Test de connectivité du serveur..."
if curl -s http://localhost:3000/health > /dev/null; then
    echo "✅ Serveur backend accessible"
else
    echo "❌ Serveur backend non accessible"
fi

# 3. Afficher les instructions de test
echo -e "\n3. Instructions de test de l'ergonomie du swipe:"
echo "==============================================="
echo ""
echo "🎯 Nouvelles améliorations à tester:"
echo ""
echo "📏 Seuils ultra-accessibles:"
echo "   • Distance réduite: 40px (vs 50px)"
echo "   • Vélocité réduite: 0.3 (vs 0.5)"
echo "   • Activation: 2px (vs 3px)"
echo ""
echo "🎨 Feedback visuel précoce:"
echo "   • Indicateurs visibles dès 15px"
echo "   • Fond sombre pour meilleure visibilité"
echo "   • Animation de scale des indicateurs"
echo ""
echo "⚡ Réactivité améliorée:"
echo "   • Condition diagonale plus permissive"
echo "   • Triple validation des gestes"
echo "   • Gestes lents acceptés (25px + 0.1 vélocité)"
echo ""
echo "🤲 Tolérance aux gestes imparfaits:"
echo "   • Résistance réduite à 25%"
echo "   • Feedback visuel de résistance"
echo ""
echo "💡 Comment tester:"
echo "   1. Ouvrir l'app mobile avec 'npx expo start'"
echo "   2. Aller dans une room avec des médias"
echo "   3. Tester des swipes courts et lents"
echo "   4. Tester des swipes diagonaux"
echo "   5. Tester des swipes dans directions non autorisées"
echo "   6. Observer les indicateurs visuels"
echo ""
echo "✅ Résultats attendus:"
echo "   • Swipes plus faciles à déclencher"
echo "   • Moins d'échecs de swipe"
echo "   • Feedback visuel plus précoce"
echo "   • Gestes plus tolérants"
echo ""

# 4. Ouvrir l'app mobile dans un nouveau terminal
echo "4. Ouverture de l'app mobile..."
cd ../mobile
echo "Pour démarrer l'app mobile, exécutez: npx expo start"
echo ""
echo "📱 Une fois l'app ouverte, testez les améliorations de swipe!"

# 5. Monitorer les logs
echo -e "\n5. Monitoring des logs de swipe..."
echo "Les logs détaillés apparaîtront dans la console Expo."
echo "Cherchez les logs '[PanResponder]' pour voir les détails des gestes."

# 6. Instructions d'arrêt
echo -e "\n6. Pour arrêter le serveur:"
echo "Appuyez sur Ctrl+C ou exécutez: kill $SERVER_PID"

echo -e "\n🎉 Testez maintenant l'ergonomie améliorée du swipe!"
echo "   Les changements devraient rendre le geste beaucoup plus fluide et tolérant."

# Garder le script en vie
wait $SERVER_PID
