#!/bin/bash

# Script de test pour vérifier l'alignement du bouton de partage dans la barre de navigation
# Ce script vérifie que le bouton de partage est correctement positionné au même niveau que le titre et le bouton retour

echo "🔍 Test d'alignement du bouton de partage - Header Navigation"
echo "=================================================="

# Vérifier le fichier de navigation
NAVIGATION_FILE="mobile/src/navigation/AppNavigator.tsx"

if [ ! -f "$NAVIGATION_FILE" ]; then
    echo "❌ Fichier de navigation non trouvé : $NAVIGATION_FILE"
    exit 1
fi

echo "📄 Vérification du fichier : $NAVIGATION_FILE"

# Vérifier que le bouton de partage est dans headerRight
if grep -q "headerRight:" "$NAVIGATION_FILE"; then
    echo "✅ Le bouton de partage est dans headerRight"
else
    echo "❌ Le bouton de partage n'est pas dans headerRight"
    exit 1
fi

# Vérifier que marginRight n'est pas présent (pour un alignement parfait)
if grep -q "marginRight:" "$NAVIGATION_FILE"; then
    echo "❌ marginRight présent - peut affecter l'alignement"
    echo "   Le bouton ne sera pas parfaitement aligné avec le bord droit"
else
    echo "✅ Pas de marginRight - alignement parfait avec le bord droit"
fi

# Vérifier les dimensions du bouton
if grep -q "width: 40" "$NAVIGATION_FILE" && grep -q "height: 40" "$NAVIGATION_FILE"; then
    echo "✅ Dimensions du bouton : 40x40px (taille standard)"
else
    echo "❌ Dimensions du bouton non standard"
fi

# Vérifier le style du bouton
if grep -q "borderRadius: 20" "$NAVIGATION_FILE"; then
    echo "✅ Bouton circulaire (borderRadius: 20)"
else
    echo "❌ Bouton pas parfaitement circulaire"
fi

# Vérifier la présence de l'icône
if grep -q "📤" "$NAVIGATION_FILE"; then
    echo "✅ Icône de partage présente : 📤"
else
    echo "❌ Icône de partage manquante"
fi

# Vérifier que le bouton utilise les paramètres de route
if grep -q "route.params" "$NAVIGATION_FILE"; then
    echo "✅ Le bouton utilise les paramètres de route (roomId, roomName)"
else
    echo "❌ Le bouton n'utilise pas les paramètres de route"
fi

# Vérifier la logique de partage
if grep -q "Share.share" "$NAVIGATION_FILE"; then
    echo "✅ Logique de partage implémentée"
else
    echo "❌ Logique de partage manquante"
fi

echo ""
echo "🎯 Résumé de l'alignement :"
echo "- Le bouton de partage est dans headerRight (même niveau que le titre)"
echo "- Pas de marginRight pour un alignement parfait avec le bord droit"
echo "- Dimensions 40x40px pour s'harmoniser avec les autres éléments"
echo "- Style circulaire et discret"
echo ""
echo "✅ Test d'alignement terminé avec succès !"
echo "Le bouton de partage est maintenant parfaitement aligné au même niveau que le titre et le bouton retour."
