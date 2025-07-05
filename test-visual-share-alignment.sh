#!/bin/bash

# Script de test visuel pour vérifier le bon alignement du bouton de partage
# Ce script lance l'application et fournit des instructions pour tester visuellement

echo "🎬 Test visuel - Alignement du bouton de partage"
echo "=============================================="

echo "📱 Lancement de l'application pour test visuel..."
echo ""

# Vérifier que le serveur backend fonctionne
echo "🔍 Vérification du serveur backend..."
if lsof -i :3000 > /dev/null 2>&1; then
    echo "✅ Serveur backend actif sur le port 3000"
else
    echo "⚠️  Serveur backend non actif - démarrage..."
    cd backend && npm start &
    echo "🔄 Attente de 3 secondes pour le démarrage du serveur..."
    sleep 3
    cd ..
fi

echo ""
echo "📲 Instructions pour le test visuel :"
echo "1. Ouvrez l'application sur votre appareil/simulateur"
echo "2. Créez ou rejoignez une room"
echo "3. Observez la barre de navigation dans la room :"
echo ""
echo "   🎯 Points à vérifier :"
echo "   ✓ Le bouton de partage (📤) est-il au même niveau que le titre ?"
echo "   ✓ Le bouton de partage est-il aligné avec le bord droit de l'écran ?"
echo "   ✓ Le bouton de partage est-il au même niveau que le bouton retour (←) ?"
echo "   ✓ L'ensemble forme-t-il une ligne droite harmonieuse ?"
echo ""
echo "   📐 Alignement attendu :"
echo "   [←] Nom de la Room                    [📤]"
echo "   |                                      |"
echo "   └─ Bouton retour                       └─ Bouton partage"
echo "   (même niveau horizontal)"
echo ""
echo "4. Testez le bouton de partage :"
echo "   ✓ Tapez sur le bouton 📤"
echo "   ✓ Vérifiez que la feuille de partage s'ouvre"
echo "   ✓ Vérifiez que le contenu partagé est correct"
echo ""

# Lancer l'application mobile
echo "🚀 Lancement de l'application mobile..."
cd mobile

if [ -f "package.json" ]; then
    echo "📦 Démarrage d'Expo..."
    npx expo start
else
    echo "❌ Fichier package.json non trouvé dans le dossier mobile"
    exit 1
fi

echo ""
echo "✅ Test visuel en cours - Vérifiez l'alignement du bouton de partage !"
echo "💡 Conseil : Le bouton doit être parfaitement aligné sans marge à droite"
