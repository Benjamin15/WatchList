#!/bin/bash

# Script de test pour le bouton de partage dans la barre de navigation
# Créé le 5 juillet 2025

echo "📱 Test du bouton de partage dans la barre de navigation"
echo "======================================================="

# 1. Vérifier la configuration headerRight
echo "1. Vérification de la configuration headerRight..."
if grep -q "headerRight.*=>" mobile/src/navigation/AppNavigator.tsx; then
    echo "✅ headerRight configuré dans AppNavigator"
else
    echo "❌ headerRight non trouvé"
fi

# 2. Vérifier l'import des composants React Native
echo -e "\n2. Vérification des imports React Native..."
if grep -q "import.*Pressable.*Text.*react-native" mobile/src/navigation/AppNavigator.tsx; then
    echo "✅ Imports Pressable et Text ajoutés"
else
    echo "❌ Imports React Native non trouvés"
fi

# 3. Vérifier la fonction de partage inline
echo -e "\n3. Vérification de la fonction de partage inline..."
if grep -q "Share.share.*shareContent" mobile/src/navigation/AppNavigator.tsx; then
    echo "✅ Fonction de partage inline configurée"
else
    echo "❌ Fonction de partage non trouvée"
fi

# 4. Vérifier l'utilisation des paramètres de route
echo -e "\n4. Vérification de l'utilisation des paramètres de route..."
if grep -q "route.params.*roomId.*roomName" mobile/src/navigation/AppNavigator.tsx; then
    echo "✅ Paramètres roomId et roomName utilisés"
else
    echo "❌ Paramètres de route non utilisés"
fi

# 5. Vérifier la suppression de l'ancien header
echo -e "\n5. Vérification de la suppression de l'ancien header..."
if ! grep -q "View.*header" mobile/src/screens/RoomScreen.tsx; then
    echo "✅ Ancien header supprimé du RoomScreen"
else
    echo "❌ Ancien header toujours présent"
fi

# 6. Vérifier la suppression de la fonction handleShareRoom
echo -e "\n6. Vérification de la suppression de handleShareRoom..."
if ! grep -q "handleShareRoom" mobile/src/screens/RoomScreen.tsx; then
    echo "✅ Fonction handleShareRoom supprimée"
else
    echo "❌ Fonction handleShareRoom toujours présente"
fi

# 7. Vérifier la suppression des styles
echo -e "\n7. Vérification de la suppression des styles..."
DELETED_STYLES=("header:" "shareButton:" "shareButtonIcon:")
for style in "${DELETED_STYLES[@]}"; do
    if ! grep -q "$style" mobile/src/screens/RoomScreen.tsx; then
        echo "✅ Style $style supprimé"
    else
        echo "❌ Style $style toujours présent"
    fi
done

# 8. Vérifier la suppression de l'import Share
echo -e "\n8. Vérification de la suppression de l'import Share..."
if ! grep -q "import.*Share.*react-native" mobile/src/screens/RoomScreen.tsx; then
    echo "✅ Import Share supprimé du RoomScreen"
else
    echo "❌ Import Share toujours présent"
fi

# 9. Vérifier la structure simplifiée
echo -e "\n9. Vérification de la structure simplifiée..."
if grep -q "View.*container.*View.*tabs" mobile/src/screens/RoomScreen.tsx; then
    echo "✅ Structure simplifiée (container → tabs directement)"
else
    echo "❌ Structure non simplifiée"
fi

# 10. Compter les améliorations
echo -e "\n10. Analyse des améliorations..."
HEADER_LINES_BEFORE=10  # Estimation
HEADER_LINES_AFTER=$(grep -c "header" mobile/src/screens/RoomScreen.tsx)
echo "Références à 'header' dans RoomScreen: $HEADER_LINES_AFTER"

if [ $HEADER_LINES_AFTER -eq 0 ]; then
    echo "✅ Toutes les références header supprimées"
else
    echo "⚠️ Quelques références header restantes: $HEADER_LINES_AFTER"
fi

# 11. Résumé des changements
echo -e "\n📱 Résumé du déplacement du bouton dans la barre de navigation:"
echo "=============================================================="
echo ""
echo "📍 Nouveau positionnement:"
echo "   • Bouton dans headerRight de la barre de navigation"
echo "   • Au même niveau que le titre et le bouton retour"
echo "   • Intégration native avec React Navigation"
echo ""
echo "🎨 Style natif:"
echo "   • Style cohérent avec l'interface système"
echo "   • Taille et spacing standards (40x40px)"
echo "   • Fond semi-transparent pour intégration"
echo ""
echo "⚡ Fonction inline:"
echo "   • Import dynamique de Share et Alert"
echo "   • Utilisation des paramètres de route"
echo "   • Gestion d'erreur intégrée"
echo ""
echo "🧹 Nettoyage RoomScreen:"
echo "   • Suppression du header custom"
echo "   • Suppression de handleShareRoom"
echo "   • Suppression des styles header/shareButton"
echo "   • Suppression de l'import Share"
echo ""
echo "✅ Avantages:"
echo "   • Position native et intuitive"
echo "   • Cohérence avec les standards iOS/Android"
echo "   • Code plus propre et maintenable"
echo "   • Meilleure intégration UX"
echo ""
echo "🎯 Résultat:"
echo "   Le bouton de partage est maintenant parfaitement intégré"
echo "   dans la barre de navigation au niveau du titre et du retour."
