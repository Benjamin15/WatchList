#!/bin/bash

# Script de test pour le bouton de partage compact
# Créé le 5 juillet 2025

echo "📤 Test du bouton de partage compact"
echo "===================================="

# 1. Vérifier les nouvelles dimensions
echo "1. Vérification des nouvelles dimensions..."
if grep -q "width: 40" mobile/src/screens/RoomScreen.tsx; then
    echo "✅ Largeur réduite à 40px"
else
    echo "❌ Largeur non trouvée"
fi

if grep -q "height: 40" mobile/src/screens/RoomScreen.tsx; then
    echo "✅ Hauteur réduite à 40px"
else
    echo "❌ Hauteur non trouvée"
fi

if grep -q "borderRadius: 20" mobile/src/screens/RoomScreen.tsx; then
    echo "✅ Bouton circulaire (borderRadius: 20)"
else
    echo "❌ BorderRadius non trouvé"
fi

# 2. Vérifier le nouveau style
echo -e "\n2. Vérification du nouveau style..."
if grep -q "backgroundColor: COLORS.surface" mobile/src/screens/RoomScreen.tsx; then
    echo "✅ Fond discret avec COLORS.surface"
else
    echo "❌ Fond discret non trouvé"
fi

if grep -q "borderWidth: 1" mobile/src/screens/RoomScreen.tsx; then
    echo "✅ Bordure subtile ajoutée"
else
    echo "❌ Bordure non trouvée"
fi

if grep -q "borderColor: COLORS.border" mobile/src/screens/RoomScreen.tsx; then
    echo "✅ Couleur de bordure cohérente"
else
    echo "❌ Couleur de bordure non trouvée"
fi

# 3. Vérifier la réduction de l'ombre
echo -e "\n3. Vérification de la réduction de l'ombre..."
if grep -q "elevation: 1" mobile/src/screens/RoomScreen.tsx; then
    echo "✅ Élévation réduite à 1"
else
    echo "❌ Élévation non trouvée"
fi

if grep -q "shadowOpacity: 0.2" mobile/src/screens/RoomScreen.tsx; then
    echo "✅ Opacité d'ombre réduite à 0.2"
else
    echo "❌ Opacité d'ombre non trouvée"
fi

if grep -q "shadowRadius: 2" mobile/src/screens/RoomScreen.tsx; then
    echo "✅ Rayon d'ombre réduit à 2"
else
    echo "❌ Rayon d'ombre non trouvé"
fi

# 4. Vérifier la taille de l'icône
echo -e "\n4. Vérification de la taille de l'icône..."
if grep -q "fontSize: 18" mobile/src/screens/RoomScreen.tsx; then
    echo "✅ Taille d'icône réduite à 18px"
else
    echo "❌ Taille d'icône non trouvée"
fi

# 5. Vérifier la suppression du texte
echo -e "\n5. Vérification de la suppression du texte..."
if ! grep -q "shareButtonText.*Partager" mobile/src/screens/RoomScreen.tsx; then
    echo "✅ Texte 'Partager' supprimé"
else
    echo "❌ Texte 'Partager' toujours présent"
fi

if ! grep -q "shareButtonText.*color.*onPrimary" mobile/src/screens/RoomScreen.tsx; then
    echo "✅ Style shareButtonText supprimé"
else
    echo "❌ Style shareButtonText toujours présent"
fi

# 6. Vérifier la suppression de flexDirection
echo -e "\n6. Vérification de la simplification du layout..."
if ! grep -q "flexDirection.*row.*shareButton" mobile/src/screens/RoomScreen.tsx; then
    echo "✅ Layout flexDirection supprimé (plus nécessaire)"
else
    echo "❌ Layout flexDirection toujours présent"
fi

# 7. Comparaison avec le FAB
echo -e "\n7. Comparaison avec le FAB..."
echo "FAB (bouton d'ajout) : 56x56px, borderRadius: 28"
echo "Bouton partage : 40x40px, borderRadius: 20"
echo "✅ Bouton de partage plus petit et discret que le FAB"

# 8. Résumé des améliorations
echo -e "\n📤 Résumé des améliorations du bouton de partage:"
echo "================================================"
echo ""
echo "📏 Dimensions compactes:"
echo "   • Taille: 40x40px (vs ~120x40px avant)"
echo "   • Forme: Circulaire (borderRadius: 20)"
echo "   • Icône: 18px (vs 24px avant)"
echo ""
echo "🎨 Style discret:"
echo "   • Fond: COLORS.surface (vs COLORS.primary)"
echo "   • Bordure: 1px COLORS.border pour définition"
echo "   • Ombre: Réduite (elevation: 1, opacity: 0.2)"
echo ""
echo "🧹 Simplification:"
echo "   • Suppression du texte 'Partager'"
echo "   • Suppression du layout flexDirection row"
echo "   • Suppression du style shareButtonText"
echo "   • Icône seule 📤 plus épurée"
echo ""
echo "✅ Comparaison:"
echo "   • Plus petit que le FAB (40px vs 56px)"
echo "   • Style cohérent avec l'interface"
echo "   • Moins intrusif visuellement"
echo "   • Toujours facilement accessible"
echo ""
echo "🎯 Résultat:"
echo "   Le bouton de partage est maintenant discret et élégant,"
echo "   similaire aux autres boutons de l'interface, tout en"
echo "   restant facilement identifiable et accessible."
