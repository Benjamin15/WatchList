#!/bin/bash

# Test rapide pour vérifier l'affichage des noms de rooms
echo "=== TEST AFFICHAGE NOMS DE ROOMS ==="
echo "Date: $(date)"
echo ""

MOBILE_DIR="/Users/ben/workspace/WatchList/mobile"
cd "$MOBILE_DIR"

echo "1. Vérification des modifications dans HomeScreen.tsx..."
echo ""

# Vérifier que le correctif est présent
if grep -q "item.name || \`Room \${index + 1}\`" src/screens/HomeScreen.tsx; then
    echo "✅ Correctif détecté: fallback pour les noms vides"
else
    echo "❌ Correctif manquant: fallback pour les noms vides"
fi

if grep -q "minHeight: 24" src/screens/HomeScreen.tsx; then
    echo "✅ Correctif détecté: hauteur minimale pour le texte"
else
    echo "❌ Correctif manquant: hauteur minimale pour le texte"
fi

echo ""
echo "2. Recherche des patterns potentiellement problématiques..."
echo ""

# Vérifier les couleurs utilisées
echo "Couleurs utilisées pour historyRoomName:"
grep -A 3 -B 1 "historyRoomName:" src/screens/HomeScreen.tsx

echo ""
echo "3. Test de l'application..."
echo ""

# Lancer l'application
echo "Lancement de l'application pour test..."
npx expo start &
EXPO_PID=$!

sleep 5

echo ""
echo "INSTRUCTIONS DE TEST:"
echo "1. Ouvrez l'application sur votre simulateur/device"
echo "2. Créez une room ou rejoignez une room existante"
echo "3. Revenez à la page d'accueil"
echo "4. Vérifiez la section 'Rooms récentes':"
echo "   - Le nom de la room doit être visible"
echo "   - Si le nom est vide, vous devez voir 'Room 1', 'Room 2', etc."
echo "   - Le texte doit être en blanc sur fond sombre"
echo "5. Si le problème persiste, appuyez sur Ctrl+C pour arrêter"
echo ""
echo "Application PID: $EXPO_PID"
echo "Appuyez sur Ctrl+C pour arrêter le test"

# Attendre l'arrêt manuel
wait $EXPO_PID

echo ""
echo "=== FIN DU TEST ==="
