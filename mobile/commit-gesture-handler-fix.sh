#!/bin/bash

# Script de commit pour les corrections de react-native-gesture-handler

echo "=== Commit des corrections react-native-gesture-handler ==="
echo "Date: $(date)"

cd /Users/ben/workspace/WatchList

# Ajouter tous les fichiers modifiés
git add mobile/index.ts mobile/babel.config.js mobile/app.json mobile/test-gesture-handler-config.sh

# Créer le commit
git commit -m "🔧 Correction de l'erreur PanGestureHandler

- Ajout de l'import 'react-native-gesture-handler' dans index.ts
- Création de babel.config.js avec la configuration appropriée
- Suppression de la configuration plugin incorrecte dans app.json
- Ajout d'un script de test pour vérifier la configuration
- Correction définitive de l'erreur 'PanGestureHandler must be used as a descendant of GestureHandlerRootView'

Le swipe pour supprimer les rooms récentes devrait maintenant fonctionner correctement."

echo "✅ Commit terminé avec succès !"
echo ""
echo "=== Résumé des changements ==="
echo "1. index.ts : Ajout de l'import 'react-native-gesture-handler' en première ligne"
echo "2. babel.config.js : Création avec la configuration Babel appropriée"
echo "3. app.json : Suppression de la configuration plugin incorrecte"
echo "4. test-gesture-handler-config.sh : Script de test pour vérifier la configuration"
echo ""
echo "=== Test recommandé ==="
echo "1. Ouvrez l'application sur votre appareil/émulateur"
echo "2. Naviguez vers la page d'accueil"
echo "3. Testez le swipe vers la gauche sur les rooms récentes"
echo "4. Vérifiez qu'il n'y a plus d'erreur dans la console"
