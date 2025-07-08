#!/bin/bash

# Script de test pour vérifier les améliorations du swipe de suppression

echo "=== Test des améliorations du swipe de suppression ==="
echo "Date: $(date)"

cd /Users/ben/workspace/WatchParty/mobile

# Vérifier que onSwipeableRightOpen est présent
echo "1. Vérification de la suppression automatique au swipe..."
if grep -q "onSwipeableRightOpen" src/screens/HomeScreen.tsx; then
    echo "✅ Suppression automatique au swipe configurée"
else
    echo "❌ Suppression automatique au swipe manquante"
    exit 1
fi

# Vérifier que minHeight est utilisé au lieu de height: '100%'
echo "2. Vérification du dimensionnement du bouton..."
if grep -q "minHeight: 80" src/screens/HomeScreen.tsx; then
    echo "✅ Hauteur fixe du bouton configurée"
else
    echo "❌ Hauteur fixe du bouton manquante"
    exit 1
fi

# Vérifier que height: '100%' n'est plus utilisé
if grep -q "height: '100%'" src/screens/HomeScreen.tsx; then
    echo "❌ Ancien style height: '100%' encore présent"
    exit 1
else
    echo "✅ Ancien style height: '100%' supprimé"
fi

# Vérifier que marginBottom est ajouté pour l'alignement
echo "3. Vérification de l'alignement..."
if grep -q "marginBottom: SPACING.md" src/screens/HomeScreen.tsx; then
    echo "✅ Alignement vertical configuré"
else
    echo "❌ Alignement vertical manquant"
    exit 1
fi

# Vérifier que activeOpacity est présent
echo "4. Vérification du feedback tactile..."
if grep -q "activeOpacity={0.8}" src/screens/HomeScreen.tsx; then
    echo "✅ Feedback tactile configuré"
else
    echo "❌ Feedback tactile manquant"
    exit 1
fi

echo ""
echo "=== Tests terminés avec succès ! ==="
echo ""
echo "=== Améliorations apportées ==="
echo "1. 🎯 Suppression automatique : La room est supprimée dès que le swipe est terminé"
echo "2. 📏 Taille du bouton : Le bouton a maintenant une taille similaire à la carte"
echo "3. ✨ Feedback tactile : Le bouton réagit au toucher avec activeOpacity"
echo "4. 🔄 Double possibilité : Suppression au swipe OU au clic sur le bouton"
echo ""
echo "=== Instructions de test ==="
echo "1. Ouvrez l'application sur votre appareil/émulateur"
echo "2. Assurez-vous d'avoir des rooms récentes dans l'historique"
echo "3. Testez ces deux méthodes de suppression :"
echo "   - Swipe vers la gauche complètement → Suppression automatique"
echo "   - Swipe vers la gauche partiellement → Clic sur 'Supprimer'"
echo "4. Vérifiez que le bouton a la même taille que la carte"
echo "5. Vérifiez que la suppression fonctionne dans les deux cas"
