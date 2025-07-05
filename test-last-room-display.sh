#!/bin/bash

# Test rapide pour vérifier l'affichage de la dernière room
echo "=== TEST AFFICHAGE DERNIÈRE ROOM ==="
echo "Date: $(date)"
echo ""

cd /Users/ben/workspace/WatchList/mobile

echo "1. Vérifications des corrections appliquées..."
echo ""

# Vérifier les corrections
echo "✅ Vérification des corrections ScrollView:"

if grep -q "paddingBottom: SPACING.xl" src/screens/HomeScreen.tsx; then
    echo "   ✅ Padding bottom augmenté: OK"
else
    echo "   ❌ Padding bottom augmenté: MANQUANT"
fi

if grep -q "maxHeight: 350" src/screens/HomeScreen.tsx; then
    echo "   ✅ Hauteur maximale augmentée: OK"
else
    echo "   ❌ Hauteur maximale augmentée: MANQUANT"
fi

if grep -q "marginBottom: SPACING.md" src/screens/HomeScreen.tsx; then
    echo "   ✅ Marge bottom ScrollView: OK"
else
    echo "   ❌ Marge bottom ScrollView: MANQUANT"
fi

if grep -q "nestedScrollEnabled={true}" src/screens/HomeScreen.tsx; then
    echo "   ✅ Nested scroll activé: OK"
else
    echo "   ❌ Nested scroll activé: MANQUANT"
fi

echo ""
echo "2. Corrections appliquées pour la dernière room:"
echo "   📏 Hauteur maximale: 300px → 350px"
echo "   📦 Padding bottom: SPACING.md → SPACING.xl"
echo "   🔄 Marge bottom ajoutée au ScrollView"
echo "   📱 Nested scroll enabled pour compatibilité"
echo ""

echo "3. Lancement de l'application pour test..."
echo ""

# Lancer l'application
npx expo start &
EXPO_PID=$!

sleep 3

echo "APPLICATION LANCÉE (PID: $EXPO_PID)"
echo ""
echo "🎯 TEST SPÉCIFIQUE DERNIÈRE ROOM:"
echo ""
echo "1. **Créer plusieurs rooms** (au moins 4-5):"
echo "   - Créer 'Room Test 1'"
echo "   - Créer 'Room Test 2'"
echo "   - Créer 'Room Test 3'"
echo "   - Créer 'Room Test 4'"
echo "   - Créer 'Room Test 5'"
echo ""
echo "2. **Revenir à la page d'accueil** et observer:"
echo "   - Toutes les rooms doivent être visibles"
echo "   - La dernière room ne doit pas être coupée"
echo "   - Badge et flèche de la dernière room visibles"
echo ""
echo "3. **Tester le scroll** dans les rooms récentes:"
echo "   - Scroll vers le bas pour voir la dernière room"
echo "   - Vérifier que tout le contenu est visible"
echo "   - Pas de coupure en bas"
echo ""
echo "4. **Vérifier l'affichage complet**:"
echo "   - Nom de la dernière room visible"
echo "   - Badge avec code visible"
echo "   - Flèche '›' visible"
echo "   - Date de connexion visible"
echo "   - Ombres et styles appliqués"
echo ""
echo "5. **Tester l'interaction**:"
echo "   - Cliquer sur la dernière room"
echo "   - Vérifier que la navigation fonctionne"
echo "   - Revenir et vérifier l'affichage"
echo ""
echo "🔍 POINTS À VÉRIFIER:"
echo "   ✅ Dernière room complètement visible"
echo "   ✅ Tous les éléments (nom, badge, flèche) affichés"
echo "   ✅ Pas de coupure en bas"
echo "   ✅ Scroll fluide jusqu'à la fin"
echo "   ✅ Espace suffisant en bas"
echo "   ✅ Design moderne préservé"
echo ""
echo "Si la dernière room s'affiche parfaitement, le problème est résolu!"
echo ""
echo "Appuyez sur Ctrl+C pour arrêter le test"

# Attendre l'arrêt manuel
wait $EXPO_PID

echo ""
echo "=== TEST TERMINÉ ==="
echo ""
echo "Si la dernière room s'affiche correctement, les corrections suivantes ont été appliquées:"
echo "1. ✅ Hauteur maximale augmentée (300px → 350px)"
echo "2. ✅ Padding bottom augmenté (SPACING.md → SPACING.xl)"
echo "3. ✅ Marge bottom ajoutée au ScrollView"
echo "4. ✅ Nested scroll enabled pour compatibilité"
echo ""
echo "La dernière room devrait maintenant s'afficher parfaitement! 🎯"
