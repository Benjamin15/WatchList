#!/bin/bash

# Script de test pour valider la correction du bouton de partage

echo "🧪 Test de la correction du bouton de partage"
echo "============================================"

echo "✅ Test 1: Vérification des imports"
if grep -q "import.*Share.*Alert.*from 'react-native'" /Users/ben/workspace/WatchList/mobile/src/navigation/AppNavigator.tsx; then
    echo "   ✓ Imports Share et Alert corrects"
else
    echo "   ❌ Erreur: Imports Share/Alert manquants"
fi

echo "✅ Test 2: Vérification de TouchableOpacity"
if grep -q "TouchableOpacity" /Users/ben/workspace/WatchList/mobile/src/navigation/AppNavigator.tsx; then
    echo "   ✓ TouchableOpacity utilisé"
else
    echo "   ❌ Erreur: TouchableOpacity manquant"
fi

echo "✅ Test 3: Vérification de la fonction Share"
if grep -q "Share.share(shareContent)" /Users/ben/workspace/WatchList/mobile/src/navigation/AppNavigator.tsx; then
    echo "   ✓ Fonction Share.share appelée directement"
else
    echo "   ❌ Erreur: Fonction Share.share manquante"
fi

echo "✅ Test 4: Vérification de la gestion d'erreurs"
if grep -q "\.catch.*error.*Alert.alert" /Users/ben/workspace/WatchList/mobile/src/navigation/AppNavigator.tsx; then
    echo "   ✓ Gestion d'erreurs présente"
else
    echo "   ❌ Erreur: Gestion d'erreurs manquante"
fi

echo "✅ Test 5: Vérification des paramètres de partage"
if grep -q "title:.*Rejoignez ma WatchList" /Users/ben/workspace/WatchList/mobile/src/navigation/AppNavigator.tsx; then
    echo "   ✓ Contenu de partage configuré"
else
    echo "   ❌ Erreur: Contenu de partage manquant"
fi

echo ""
echo "🔄 Instructions de test manuel:"
echo "1. Lancer l'application"
echo "2. Créer ou rejoindre une room"
echo "3. Cliquer sur le bouton de partage (📤) en haut à droite"
echo "4. Vérifier que le menu de partage système s'ouvre"
echo "5. Vérifier que le message contient le nom et le code de la room"

echo ""
echo "📱 Comportement attendu:"
echo "- Bouton 📤 visible en haut à droite"
echo "- Clic ouvre le menu de partage natif"
echo "- Message personnalisé avec nom et code de room"
echo "- Pas d'erreur 'native module that doesn't exist'"

echo ""
echo "🛠️ En cas d'erreur:"
echo "- Vérifier que les dépendances sont à jour"
echo "- Redémarrer l'application"
echo "- Vérifier les logs dans la console"

echo ""
echo "🎯 Test terminé!"
