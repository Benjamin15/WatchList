#!/bin/bash

# Script de test pour valider les améliorations du swipe dans RoomScreen

echo "🧪 Test des améliorations du swipe dans RoomScreen"
echo "==============================================="

# Test 1: Vérifier les nouveaux seuils ultra-permissifs
echo "✅ Test 1: Seuils de swipe ultra-permissifs"
if grep -q "SWIPE_THRESHOLD = 15" /Users/ben/workspace/WatchList/mobile/src/screens/RoomScreen.tsx; then
    echo "   ✓ Seuil de distance réduit à 15px"
else
    echo "   ❌ Erreur: Seuil de distance non réduit"
fi

if grep -q "SWIPE_VELOCITY_THRESHOLD = 0.08" /Users/ben/workspace/WatchList/mobile/src/screens/RoomScreen.tsx; then
    echo "   ✓ Seuil de vélocité réduit à 0.08"
else
    echo "   ❌ Erreur: Seuil de vélocité non réduit"
fi

if grep -q "ACTIVATION_THRESHOLD = 0.5" /Users/ben/workspace/WatchList/mobile/src/screens/RoomScreen.tsx; then
    echo "   ✓ Seuil d'activation réduit à 0.5px"
else
    echo "   ❌ Erreur: Seuil d'activation non réduit"
fi

# Test 2: Vérifier la détection de geste améliorée
echo "✅ Test 2: Détection de geste améliorée"
if grep -q "verticalMovement \* 0.2" /Users/ben/workspace/WatchList/mobile/src/screens/RoomScreen.tsx; then
    echo "   ✓ Ratio horizontal/vertical amélioré (20%)"
else
    echo "   ❌ Erreur: Ratio horizontal/vertical non amélioré"
fi

if grep -q "horizontalMovement > 2" /Users/ben/workspace/WatchList/mobile/src/screens/RoomScreen.tsx; then
    echo "   ✓ Seuil de mouvement horizontal ultra-bas (2px)"
else
    echo "   ❌ Erreur: Seuil de mouvement horizontal non amélioré"
fi

# Test 3: Vérifier la suppression des textes d'aide
echo "✅ Test 3: Suppression des textes d'aide"
if ! grep -q "👉 Glisser" /Users/ben/workspace/WatchList/mobile/src/screens/RoomScreen.tsx; then
    echo "   ✓ Texte '👉 Glisser' supprimé"
else
    echo "   ❌ Erreur: Texte '👉 Glisser' encore présent"
fi

if ! grep -q "👈 Glisser" /Users/ben/workspace/WatchList/mobile/src/screens/RoomScreen.tsx; then
    echo "   ✓ Texte '👈 Glisser' supprimé"
else
    echo "   ❌ Erreur: Texte '👈 Glisser' encore présent"
fi

if ! grep -q "💡 Glissez un média" /Users/ben/workspace/WatchList/mobile/src/screens/RoomScreen.tsx; then
    echo "   ✓ Texte d'aide général supprimé"
else
    echo "   ❌ Erreur: Texte d'aide général encore présent"
fi

# Test 4: Vérifier la suppression des styles inutilisés
echo "✅ Test 4: Suppression des styles inutilisés"
if ! grep -q "swipeHintContainer:" /Users/ben/workspace/WatchList/mobile/src/screens/RoomScreen.tsx; then
    echo "   ✓ Style swipeHintContainer supprimé"
else
    echo "   ❌ Erreur: Style swipeHintContainer encore présent"
fi

if ! grep -q "swipeHintPermanent:" /Users/ben/workspace/WatchList/mobile/src/screens/RoomScreen.tsx; then
    echo "   ✓ Style swipeHintPermanent supprimé"
else
    echo "   ❌ Erreur: Style swipeHintPermanent encore présent"
fi

if ! grep -q "hint:" /Users/ben/workspace/WatchList/mobile/src/screens/RoomScreen.tsx; then
    echo "   ✓ Style hint supprimé"
else
    echo "   ❌ Erreur: Style hint encore présent"
fi

if ! grep -q "hintText:" /Users/ben/workspace/WatchList/mobile/src/screens/RoomScreen.tsx; then
    echo "   ✓ Style hintText supprimé"
else
    echo "   ❌ Erreur: Style hintText encore présent"
fi

# Test 5: Vérifier les conditions de validation ultra-permissives
echo "✅ Test 5: Conditions de validation ultra-permissives"
if grep -q "distance > 10 && velocity > 0.03" /Users/ben/workspace/WatchList/mobile/src/screens/RoomScreen.tsx; then
    echo "   ✓ Condition ultra-permissive 10px + 0.03 vélocité"
else
    echo "   ❌ Erreur: Condition ultra-permissive manquante"
fi

if grep -q "distance > 12 && velocity > 0.005" /Users/ben/workspace/WatchList/mobile/src/screens/RoomScreen.tsx; then
    echo "   ✓ Condition extrêmement permissive 12px + 0.005 vélocité"
else
    echo "   ❌ Erreur: Condition extrêmement permissive manquante"
fi

# Test 6: Vérifier les indicateurs visuels discrets maintenus
echo "✅ Test 6: Indicateurs visuels discrets maintenus"
if grep -q "→" /Users/ben/workspace/WatchList/mobile/src/screens/RoomScreen.tsx; then
    echo "   ✓ Indicateur visuel → maintenu"
else
    echo "   ❌ Erreur: Indicateur visuel → manquant"
fi

if grep -q "←" /Users/ben/workspace/WatchList/mobile/src/screens/RoomScreen.tsx; then
    echo "   ✓ Indicateur visuel ← maintenu"
else
    echo "   ❌ Erreur: Indicateur visuel ← manquant"
fi

echo ""
echo "🔄 Instructions de test manuel:"
echo "1. Lancer l'application et aller dans une room"
echo "2. Tester le swipe avec des gestes très légers (5-10px)"
echo "3. Tester le swipe avec des gestes très lents"
echo "4. Vérifier que les textes d'aide ont disparu"
echo "5. Vérifier que les flèches → ← sont toujours visibles"
echo "6. Tester les changements de statut dans tous les onglets"

echo ""
echo "📱 Comportement attendu:"
echo "- Swipe ultra-sensible (gestes très légers détectés)"
echo "- Pas de texte d'aide visible"
echo "- Flèches discrètes → ← toujours présentes"
echo "- Changement de statut fluide et fiable"
echo "- Logs détaillés dans la console"

echo ""
echo "🎯 Améliorations apportées:"
echo "- Seuils réduits drastiquement (15px, 0.08 vélocité)"
echo "- Détection de geste ultra-permissive"
echo "- Interface nettoyée sans textes d'aide"
echo "- Conditions de validation multiples"
echo "- Feedback visuel maintenu mais discret"

echo ""
echo "🎉 Test terminé!"
