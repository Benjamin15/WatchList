#!/bin/bash

# Script de test pour valider les améliorations finales du swipe de suppression
# dans la section "Rooms récentes" de HomeScreen

echo "🧪 Test des améliorations finales du swipe de suppression"
echo "============================================="

# Test 1: Vérifier que la suppression automatique utilise la bonne fonction
echo "✅ Test 1: Fonction de suppression automatique"
if grep -q "onSwipeableRightOpen={() => removeRoomFromHistory" /Users/ben/workspace/WatchParty/mobile/src/screens/HomeScreen.tsx; then
    echo "   ✓ Suppression automatique sans confirmation configurée"
else
    echo "   ❌ Erreur: Suppression automatique non configurée"
fi

# Test 2: Vérifier que le bouton garde la confirmation
echo "✅ Test 2: Bouton de suppression avec confirmation"
if grep -q "onPress={() => handleDeleteFromHistory" /Users/ben/workspace/WatchParty/mobile/src/screens/HomeScreen.tsx; then
    echo "   ✓ Bouton de suppression avec confirmation maintenu"
else
    echo "   ❌ Erreur: Bouton de suppression sans confirmation"
fi

# Test 3: Vérifier les deux fonctions distinctes
echo "✅ Test 3: Fonctions de suppression distinctes"
if grep -q "const handleDeleteFromHistory" /Users/ben/workspace/WatchParty/mobile/src/screens/HomeScreen.tsx && grep -q "const removeRoomFromHistory" /Users/ben/workspace/WatchParty/mobile/src/screens/HomeScreen.tsx; then
    echo "   ✓ Deux fonctions distinctes présentes"
else
    echo "   ❌ Erreur: Fonctions de suppression manquantes"
fi

# Test 4: Vérifier les styles du bouton de suppression
echo "✅ Test 4: Styles du bouton de suppression"
if grep -q "flex: 1" /Users/ben/workspace/WatchParty/mobile/src/screens/HomeScreen.tsx; then
    echo "   ✓ Bouton avec flex: 1 pour s'adapter à la hauteur"
else
    echo "   ❌ Erreur: Bouton sans flex: 1"
fi

# Test 5: Vérifier la structure du Swipeable
echo "✅ Test 5: Configuration du Swipeable"
if grep -q "rightThreshold={40}" /Users/ben/workspace/WatchParty/mobile/src/screens/HomeScreen.tsx; then
    echo "   ✓ Seuil de swipe optimal configuré"
else
    echo "   ❌ Erreur: Seuil de swipe non configuré"
fi

# Test 6: Vérifier la gestion des erreurs
echo "✅ Test 6: Gestion des erreurs"
if grep -q "catch (error)" /Users/ben/workspace/WatchParty/mobile/src/screens/HomeScreen.tsx; then
    echo "   ✓ Gestion des erreurs présente"
else
    echo "   ❌ Erreur: Gestion des erreurs manquante"
fi

# Test 7: Vérifier les logs de debug
echo "✅ Test 7: Logs de debug"
if grep -q "console.log.*Room supprimée" /Users/ben/workspace/WatchParty/mobile/src/screens/HomeScreen.tsx; then
    echo "   ✓ Logs de suppression présents"
else
    echo "   ❌ Erreur: Logs de suppression manquants"
fi

echo ""
echo "🔄 Instructions de test manuel:"
echo "1. Lancer l'application: npm start"
echo "2. Accéder à l'écran d'accueil"
echo "3. Vérifier qu'il y a des rooms dans l'historique"
echo "4. Tester le swipe complet vers la gauche -> suppression automatique"
echo "5. Tester le clic sur le bouton rouge -> confirmation demandée"
echo "6. Vérifier que le bouton rouge a exactement la même hauteur que la carte"
echo "7. Vérifier que les logs apparaissent dans la console"

echo ""
echo "📝 Comportement attendu:"
echo "- Swipe complet: suppression immédiate sans confirmation"
echo "- Clic sur bouton: alerte de confirmation"
echo "- Bouton rouge: même hauteur que la carte"
echo "- Animations fluides"
echo "- Logs dans la console"

echo ""
echo "🎯 Test terminé!"
