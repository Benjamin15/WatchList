#!/bin/bash

# Test final des corrections pour les noms de rooms
echo "=== TEST FINAL DES CORRECTIONS ==="
echo "Date: $(date)"
echo ""

cd /Users/ben/workspace/WatchList/mobile

echo "1. Vérification des corrections appliquées..."
echo ""

# Vérifier les corrections dans HomeScreen.tsx
echo "✅ Vérification HomeScreen.tsx:"
if grep -q "item.name || \`Room \${index + 1}\`" src/screens/HomeScreen.tsx; then
    echo "   ✅ Fallback pour les noms vides: OK"
else
    echo "   ❌ Fallback pour les noms vides: MANQUANT"
fi

if grep -q "minHeight: 24" src/screens/HomeScreen.tsx; then
    echo "   ✅ Hauteur minimale pour le texte: OK"
else
    echo "   ❌ Hauteur minimale pour le texte: MANQUANT"
fi

if grep -q "roomsHistory.map((item, index)" src/screens/HomeScreen.tsx; then
    echo "   ✅ Index dans la map: OK"
else
    echo "   ❌ Index dans la map: MANQUANT"
fi

echo ""
echo "✅ Vérification roomHistory.ts:"
if grep -q "const roomName = room.name?.trim() || \`Room \${room.room_id}\`" src/services/roomHistory.ts; then
    echo "   ✅ Validation du nom avec fallback: OK"
else
    echo "   ❌ Validation du nom avec fallback: MANQUANT"
fi

if grep -q "console.log('\[RoomHistoryService\] Room mise à jour:', roomName);" src/services/roomHistory.ts; then
    echo "   ✅ Logs améliorés: OK"
else
    echo "   ❌ Logs améliorés: MANQUANT"
fi

echo ""
echo "2. Lancement de l'application pour test..."
echo ""

# Lancer l'application
npx expo start &
EXPO_PID=$!

sleep 3

echo "APPLICATION LANCÉE (PID: $EXPO_PID)"
echo ""
echo "🎯 PLAN DE TEST COMPLET:"
echo ""
echo "1. **Ouvrir l'application** sur votre simulateur/device"
echo ""
echo "2. **Nettoyer l'historique existant** (si nécessaire):"
echo "   - Si vous voyez encore des barres vides, l'historique est corrompu"
echo "   - Désinstaller et réinstaller l'app pour nettoyer AsyncStorage"
echo "   - Ou utiliser un script de nettoyage"
echo ""
echo "3. **Tester la création de room**:"
echo "   - Créer une room avec un nom: 'Ma Room Test'"
echo "   - Revenir à l'accueil"
echo "   - Vérifier que 'Ma Room Test' apparaît dans 'Rooms récentes'"
echo ""
echo "4. **Tester la jointure de room**:"
echo "   - Rejoindre une room existante"
echo "   - Revenir à l'accueil"
echo "   - Vérifier que le nom apparaît dans 'Rooms récentes'"
echo ""
echo "5. **Tester le fallback**:"
echo "   - Si une room n'a pas de nom, vous devez voir 'Room 1', 'Room 2', etc."
echo ""
echo "6. **Vérifier l'affichage**:"
echo "   - Les noms doivent être visibles en blanc sur fond sombre"
echo "   - Pas de barres vides ou de texte invisible"
echo "   - Hauteur suffisante pour le texte"
echo ""
echo "7. **Vérifier les logs**:"
echo "   - Dans la console, chercher les logs '[RoomHistoryService]'"
echo "   - Ils doivent montrer les noms des rooms sauvegardées"
echo ""
echo "🔍 RÉSULTATS ATTENDUS:"
echo "   ✅ Noms de rooms visibles dans 'Rooms récentes'"
echo "   ✅ Fallback automatique pour les noms vides"
echo "   ✅ Texte blanc sur fond sombre"
echo "   ✅ Pas de barres vides"
echo "   ✅ Logs de confirmation dans la console"
echo ""
echo "Si tous les tests passent, le problème est résolu!"
echo ""
echo "Appuyez sur Ctrl+C pour arrêter le test"

# Attendre l'arrêt manuel
wait $EXPO_PID

echo ""
echo "=== TEST TERMINÉ ==="
echo ""
echo "Si les noms de rooms sont maintenant visibles, les corrections suivantes ont été appliquées avec succès:"
echo "1. ✅ Fallback pour les noms vides"
echo "2. ✅ Hauteur minimale pour le texte"
echo "3. ✅ Validation des noms dans le service"
echo "4. ✅ Logs améliorés pour le diagnostic"
echo ""
echo "Le problème des barres sombres sans texte devrait être résolu."
