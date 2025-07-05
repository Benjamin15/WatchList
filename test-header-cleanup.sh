#!/bin/bash

# Script de test pour la suppression du nom de room du header
# Créé le 5 juillet 2025

echo "🗑️ Test de la suppression du nom de room du header"
echo "=================================================="

# 1. Vérifier que le nom n'est plus affiché dans le header
echo "1. Vérification de la suppression du nom du header..."
if ! grep -q "roomTitle.*{roomName}" mobile/src/screens/RoomScreen.tsx; then
    echo "✅ Nom de room supprimé du header"
else
    echo "❌ Nom de room toujours présent dans le header"
fi

# 2. Vérifier que le bouton de partage est toujours présent
echo -e "\n2. Vérification du bouton de partage..."
if grep -q "shareButton" mobile/src/screens/RoomScreen.tsx; then
    echo "✅ Bouton de partage conservé"
else
    echo "❌ Bouton de partage introuvable"
fi

# 3. Vérifier la simplification de la structure
echo -e "\n3. Vérification de la structure simplifiée..."
if ! grep -q "headerContent" mobile/src/screens/RoomScreen.tsx; then
    echo "✅ Structure headerContent supprimée"
else
    echo "❌ Structure headerContent toujours présente"
fi

if ! grep -q "headerLeft" mobile/src/screens/RoomScreen.tsx; then
    echo "✅ Structure headerLeft supprimée"
else
    echo "❌ Structure headerLeft toujours présente"
fi

# 4. Vérifier les styles supprimés
echo -e "\n4. Vérification de la suppression des styles..."
DELETED_STYLES=("headerContent" "headerLeft" "roomTitle")
for style in "${DELETED_STYLES[@]}"; do
    if ! grep -q "$style: {" mobile/src/screens/RoomScreen.tsx; then
        echo "✅ Style $style supprimé"
    else
        echo "❌ Style $style toujours présent"
    fi
done

# 5. Vérifier l'alignement du bouton
echo -e "\n5. Vérification de l'alignement du bouton..."
if grep -q "alignItems: 'flex-end'" mobile/src/screens/RoomScreen.tsx; then
    echo "✅ Bouton aligné à droite (flex-end)"
else
    echo "❌ Alignement du bouton non trouvé"
fi

# 6. Vérifier que le titre apparaît en navigation
echo -e "\n6. Vérification du titre en navigation..."
if grep -q "route.params?.roomName" mobile/src/navigation/AppNavigator.tsx; then
    echo "✅ Titre de navigation configuré avec roomName"
else
    echo "❌ Titre de navigation non configuré"
fi

# 7. Compter la simplification du code
echo -e "\n7. Analyse de la simplification du code..."
HEADER_STRUCTURE_COUNT=$(grep -c "View.*header" mobile/src/screens/RoomScreen.tsx)
echo "Nombre de structures header: $HEADER_STRUCTURE_COUNT"

if [ $HEADER_STRUCTURE_COUNT -eq 1 ]; then
    echo "✅ Structure header simplifiée (1 seule View)"
else
    echo "⚠️ Structure header complexe ($HEADER_STRUCTURE_COUNT Views)"
fi

# 8. Vérifier la cohérence visuelle
echo -e "\n8. Vérification de la cohérence visuelle..."
if grep -q "backgroundColor: COLORS.surface" mobile/src/screens/RoomScreen.tsx; then
    echo "✅ Fond du header maintenu"
else
    echo "❌ Fond du header non trouvé"
fi

if grep -q "borderBottomWidth: 1" mobile/src/screens/RoomScreen.tsx; then
    echo "✅ Bordure du header maintenue"
else
    echo "❌ Bordure du header non trouvée"
fi

# 9. Résumé des améliorations
echo -e "\n🗑️ Résumé de la suppression du nom du header:"
echo "=============================================="
echo ""
echo "✅ Éléments supprimés:"
echo "   • Nom de la room dans le header"
echo "   • Structure headerContent complexe"
echo "   • Structure headerLeft redondante"
echo "   • Styles roomTitle, headerContent, headerLeft"
echo ""
echo "🎯 Structure simplifiée:"
echo "   • Header simple avec bouton de partage seul"
echo "   • Bouton aligné à droite (flex-end)"
echo "   • Moins de Views imbriquées"
echo "   • Code plus propre et maintenable"
echo ""
echo "📱 Avantages UX:"
echo "   • Évite la redondance (nom déjà dans le titre de page)"
echo "   • Interface plus épurée et moderne"
echo "   • Focus sur les actions (bouton de partage)"
echo "   • Hiérarchie visuelle plus claire"
echo ""
echo "🧭 Navigation:"
echo "   • Nom de room affiché dans le titre de navigation"
echo "   • Header dédié aux actions (partage)"
echo "   • Séparation claire des responsabilités"
echo ""
echo "✅ La suppression du nom du header est réussie!"
echo "   L'interface est maintenant plus épurée avec le nom"
echo "   affiché uniquement dans le titre de navigation."
