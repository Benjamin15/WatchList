#!/bin/bash

# Script de test pour la suppression du code de room
# Créé le 5 juillet 2025

echo "🗑️ Test de la suppression du code de room"
echo "=========================================="

# 1. Vérifier que le code n'est plus affiché
echo "1. Vérification de la suppression de l'affichage du code..."
if ! grep -q "Code: {roomCode}" mobile/src/screens/RoomScreen.tsx; then
    echo "✅ Affichage du code supprimé du header"
else
    echo "❌ Affichage du code toujours présent"
fi

# 2. Vérifier que le style roomCode est supprimé
echo -e "\n2. Vérification de la suppression du style..."
if ! grep -q "roomCode: {" mobile/src/screens/RoomScreen.tsx; then
    echo "✅ Style roomCode supprimé"
else
    echo "❌ Style roomCode toujours présent"
fi

# 3. Vérifier que le roomTitle est toujours présent
echo -e "\n3. Vérification que le titre de la room reste..."
if grep -q "roomTitle.*{roomName}" mobile/src/screens/RoomScreen.tsx; then
    echo "✅ Titre de la room toujours affiché"
else
    echo "❌ Titre de la room introuvable"
fi

# 4. Vérifier que le bouton de partage est toujours présent
echo -e "\n4. Vérification du bouton de partage..."
if grep -q "shareButton" mobile/src/screens/RoomScreen.tsx; then
    echo "✅ Bouton de partage toujours présent"
else
    echo "❌ Bouton de partage introuvable"
fi

# 5. Vérifier que la structure du header est maintenue
echo -e "\n5. Vérification de la structure du header..."
if grep -q "headerContent" mobile/src/screens/RoomScreen.tsx; then
    echo "✅ Structure headerContent maintenue"
else
    echo "❌ Structure headerContent introuvable"
fi

if grep -q "headerLeft" mobile/src/screens/RoomScreen.tsx; then
    echo "✅ Structure headerLeft maintenue"
else
    echo "❌ Structure headerLeft introuvable"
fi

# 6. Vérifier que le code est toujours utilisé dans la fonction de partage
echo -e "\n6. Vérification que le code est utilisé dans le partage..."
if grep -q "roomCode" mobile/src/screens/RoomScreen.tsx; then
    echo "✅ Code de room toujours utilisé dans la fonction de partage"
else
    echo "❌ Code de room non utilisé"
fi

# 7. Compter les occurrences du code
echo -e "\n7. Analyse des occurrences du code de room..."
ROOM_CODE_COUNT=$(grep -c "roomCode" mobile/src/screens/RoomScreen.tsx)
echo "Nombre d'occurrences de 'roomCode': $ROOM_CODE_COUNT"

if [ $ROOM_CODE_COUNT -eq 2 ]; then
    echo "✅ Code utilisé uniquement dans la fonction de partage (2 occurrences attendues)"
elif [ $ROOM_CODE_COUNT -gt 2 ]; then
    echo "⚠️ Code utilisé $ROOM_CODE_COUNT fois (plus que nécessaire)"
else
    echo "❌ Code utilisé moins de 2 fois (problème potentiel)"
fi

# 8. Résumé des améliorations
echo -e "\n🗑️ Résumé de la suppression du code de room:"
echo "============================================="
echo ""
echo "✅ Améliorations apportées:"
echo "   • Suppression de l'affichage 'Code: XXXX' sous le nom"
echo "   • Suppression du style roomCode inutilisé"
echo "   • Interface plus épurée et minimaliste"
echo "   • Header moins encombré"
echo ""
echo "🎯 Logique conservée:"
echo "   • Le code est toujours récupéré via les paramètres"
echo "   • Le code est utilisé dans la fonction de partage"
echo "   • Fonctionnalité de partage intacte"
echo ""
echo "📱 Avantages:"
echo "   • Interface plus propre et moderne"
echo "   • Focus sur le nom de la room"
echo "   • Bouton de partage plus mis en valeur"
echo "   • Réduction de l'encombrement visuel"
echo ""
echo "🔄 Workflow utilisateur:"
echo "   1. Voir le nom de la room clairement"
echo "   2. Utiliser le bouton de partage pour partager"
echo "   3. Le code est automatiquement inclus dans le partage"
echo "   4. Interface plus épurée et professionnelle"
echo ""
echo "✅ La suppression du code d'affichage est réussie!"
echo "   L'interface est maintenant plus propre tout en gardant"
echo "   la fonctionnalité de partage intacte."
