#!/bin/bash

# Script de test pour valider les améliorations d'ergonomie du swipe
# Créé le 5 juillet 2025

echo "🎯 Test des améliorations d'ergonomie du swipe"
echo "============================================="

# 1. Vérifier que les seuils sont bien réduits
echo "1. Vérification des seuils de swipe..."
if grep -q "SWIPE_THRESHOLD = 40" mobile/src/screens/RoomScreen.tsx; then
    echo "✅ Seuil de distance réduit à 40px"
else
    echo "❌ Seuil de distance non trouvé"
fi

if grep -q "SWIPE_VELOCITY_THRESHOLD = 0.3" mobile/src/screens/RoomScreen.tsx; then
    echo "✅ Seuil de vélocité réduit à 0.3"
else
    echo "❌ Seuil de vélocité non trouvé"
fi

if grep -q "VISUAL_FEEDBACK_THRESHOLD = 20" mobile/src/screens/RoomScreen.tsx; then
    echo "✅ Seuil de feedback visuel réduit à 20px"
else
    echo "❌ Seuil de feedback visuel non trouvé"
fi

# 2. Vérifier les conditions d'activation plus permissives
echo -e "\n2. Vérification des conditions d'activation..."
if grep -q "horizontalMovement > 2" mobile/src/screens/RoomScreen.tsx; then
    echo "✅ Seuil d'activation horizontal réduit à 2px"
else
    echo "❌ Seuil d'activation horizontal non trouvé"
fi

if grep -q "horizontalMovement > verticalMovement \* 0.5" mobile/src/screens/RoomScreen.tsx; then
    echo "✅ Condition diagonale plus permissive (50%)"
else
    echo "❌ Condition diagonale non trouvée"
fi

# 3. Vérifier la validation avec triple condition
echo -e "\n3. Vérification de la validation triple condition..."
if grep -q "distance > 25 && velocity > 0.1" mobile/src/screens/RoomScreen.tsx; then
    echo "✅ Condition de validation pour gestes lents ajoutée"
else
    echo "❌ Condition de validation pour gestes lents non trouvée"
fi

# 4. Vérifier les améliorations d'indicateurs visuels
echo -e "\n4. Vérification des indicateurs visuels..."
if grep -q "inputRange: \[-60, -15, 0\]" mobile/src/screens/RoomScreen.tsx; then
    echo "✅ Seuils d'indicateurs visuels réduits"
else
    echo "❌ Seuils d'indicateurs visuels non trouvés"
fi

if grep -q "backgroundColor: 'rgba(0, 0, 0, 0.8)'" mobile/src/screens/RoomScreen.tsx; then
    echo "✅ Fond sombre pour indicateurs ajouté"
else
    echo "❌ Fond sombre pour indicateurs non trouvé"
fi

# 5. Vérifier les améliorations d'animation
echo -e "\n5. Vérification des améliorations d'animation..."
if grep -q "tension: 150" mobile/src/screens/RoomScreen.tsx; then
    echo "✅ Tension d'animation augmentée pour plus de réactivité"
else
    echo "❌ Tension d'animation non trouvée"
fi

if grep -q "friction: 10" mobile/src/screens/RoomScreen.tsx; then
    echo "✅ Friction d'animation ajustée"
else
    echo "❌ Friction d'animation non trouvée"
fi

# 6. Vérifier la gestion de la résistance
echo -e "\n6. Vérification de la gestion de la résistance..."
if grep -q "RESISTANCE_THRESHOLD = 60" mobile/src/screens/RoomScreen.tsx; then
    echo "✅ Seuil de résistance défini"
else
    echo "❌ Seuil de résistance non trouvé"
fi

if grep -q "Math.abs(gestureState.dx) \* 0.25" mobile/src/screens/RoomScreen.tsx; then
    echo "✅ Résistance progressive réduite à 25%"
else
    echo "❌ Résistance progressive non trouvée"
fi

# 7. Résumé des améliorations
echo -e "\n🎯 Résumé des améliorations d'ergonomie:"
echo "=======================================\n"

echo "📏 Seuils rendus ultra-accessibles:"
echo "   • Distance: 50px → 40px (-20%)"
echo "   • Vélocité: 0.5 → 0.3 (-40%)"
echo "   • Feedback visuel: 30px → 20px (-33%)"
echo "   • Activation: 3px → 2px (-33%)"

echo -e "\n🎨 Feedback visuel amélioré:"
echo "   • Indicateurs visibles dès 15px (vs 30px)"
echo "   • Fond sombre pour meilleure lisibilité"
echo "   • Animation de scale pour les indicateurs"
echo "   • Feedback de résistance progressif"

echo -e "\n⚡ Réactivité améliorée:"
echo "   • Condition diagonale plus permissive (50%)"
echo "   • Triple condition de validation"
echo "   • Gestes lents intentionnels acceptés"
echo "   • Animations plus fluides (tension 150)"

echo -e "\n🤲 Tolérance aux gestes imparfaits:"
echo "   • Résistance progressive à 25% (vs 30%)"
echo "   • Limite de résistance à 60px"
echo "   • Feedback visuel de résistance"

echo -e "\n✅ Ces améliorations devraient considérablement améliorer l'ergonomie du swipe!"
echo "   Le geste sera plus facile à déclencher et plus tolérant aux mouvements imparfaits."
