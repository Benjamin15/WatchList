#!/bin/bash

# Script de démarrage pour l'application WatchList Mobile

echo "🚀 Démarrage de WatchList Mobile..."

# Vérifier si Metro est déjà en cours d'exécution
if lsof -ti:8081 > /dev/null 2>&1; then
    echo "⚠️  Metro bundler déjà en cours d'exécution sur le port 8081"
else
    echo "📦 Démarrage du Metro bundler..."
    npx react-native start --reset-cache &
    sleep 5
fi

# Demander à l'utilisateur quelle plateforme lancer
echo "Quelle plateforme souhaitez-vous lancer ?"
echo "1) iOS (simulateur)"
echo "2) Android (émulateur)"
echo "3) Les deux"
read -p "Votre choix (1-3) : " choice

case $choice in
    1)
        echo "🍎 Lancement de l'application iOS..."
        npx react-native run-ios
        ;;
    2)
        echo "🤖 Lancement de l'application Android..."
        npx react-native run-android
        ;;
    3)
        echo "🍎 Lancement de l'application iOS..."
        npx react-native run-ios &
        sleep 10
        echo "🤖 Lancement de l'application Android..."
        npx react-native run-android
        ;;
    *)
        echo "❌ Choix invalide. Arrêt du script."
        exit 1
        ;;
esac

echo "✅ Application lancée avec succès !"
