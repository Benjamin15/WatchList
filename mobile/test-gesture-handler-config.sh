#!/bin/bash

# Script de test pour vérifier la configuration de react-native-gesture-handler

echo "=== Test de configuration react-native-gesture-handler ==="
echo "Date: $(date)"

# Vérifier l'import dans index.ts
echo "1. Vérification de l'import dans index.ts..."
if grep -q "react-native-gesture-handler" /Users/ben/workspace/WatchParty/mobile/index.ts; then
    echo "✅ Import react-native-gesture-handler trouvé dans index.ts"
else
    echo "❌ Import react-native-gesture-handler manquant dans index.ts"
    exit 1
fi

# Vérifier la configuration Babel
echo "2. Vérification de la configuration Babel..."
if [ -f "/Users/ben/workspace/WatchParty/mobile/babel.config.js" ]; then
    echo "✅ babel.config.js existe"
    if grep -q "react-native-reanimated/plugin" /Users/ben/workspace/WatchParty/mobile/babel.config.js; then
        echo "✅ Plugin react-native-reanimated configuré"
    else
        echo "❌ Plugin react-native-reanimated manquant"
    fi
else
    echo "❌ babel.config.js manquant"
    exit 1
fi

# Vérifier la présence de GestureHandlerRootView
echo "3. Vérification de GestureHandlerRootView dans AppNavigator..."
if grep -q "GestureHandlerRootView" /Users/ben/workspace/WatchParty/mobile/src/navigation/AppNavigator.tsx; then
    echo "✅ GestureHandlerRootView trouvé dans AppNavigator"
else
    echo "❌ GestureHandlerRootView manquant dans AppNavigator"
    exit 1
fi

# Vérifier la présence de Swipeable dans HomeScreen
echo "4. Vérification de Swipeable dans HomeScreen..."
if grep -q "Swipeable" /Users/ben/workspace/WatchParty/mobile/src/screens/HomeScreen.tsx; then
    echo "✅ Swipeable trouvé dans HomeScreen"
else
    echo "❌ Swipeable manquant dans HomeScreen"
    exit 1
fi

# Vérifier la version du package
echo "5. Vérification de la version du package..."
if grep -q "react-native-gesture-handler" /Users/ben/workspace/WatchParty/mobile/package.json; then
    VERSION=$(grep "react-native-gesture-handler" /Users/ben/workspace/WatchParty/mobile/package.json | cut -d'"' -f4)
    echo "✅ Package react-native-gesture-handler version: $VERSION"
else
    echo "❌ Package react-native-gesture-handler manquant"
    exit 1
fi

echo ""
echo "=== Configuration terminée avec succès ! ==="
echo "Pour tester l'application :"
echo "1. Assurez-vous que le serveur Metro est en cours d'exécution"
echo "2. Ouvrez l'application sur votre appareil/émulateur"
echo "3. Testez le swipe vers la gauche sur les rooms récentes"
echo "4. Vérifiez qu'il n'y a plus d'erreur 'PanGestureHandler must be used as a descendant of GestureHandlerRootView'"
echo ""
echo "Si vous rencontrez encore des problèmes, essayez :"
echo "- Redémarrez complètement l'application"
echo "- Nettoyez le cache: npm start -- --clear"
echo "- Redémarrez l'émulateur/appareil"
