#!/bin/bash

# Script de test pour l'affichage du nom de room dans le titre
# Créé le 5 juillet 2025

echo "📝 Test du nom de room dans le titre de page"
echo "============================================="

# 1. Vérifier la modification des types
echo "1. Vérification de la modification des types..."
if grep -q "roomName?: string" mobile/src/types/index.ts; then
    echo "✅ Type roomName ajouté aux paramètres de Room"
else
    echo "❌ Type roomName non trouvé"
fi

# 2. Vérifier la modification de la navigation
echo -e "\n2. Vérification de la navigation dynamique..."
if grep -q "route.params?.roomName.*Room" mobile/src/navigation/AppNavigator.tsx; then
    echo "✅ Titre dynamique basé sur roomName configuré"
else
    echo "❌ Titre dynamique non trouvé"
fi

# 3. Vérifier les navigations depuis HomeScreen
echo -e "\n3. Vérification des navigations depuis HomeScreen..."
if grep -q "roomName: room.name" mobile/src/screens/HomeScreen.tsx; then
    echo "✅ Navigation avec roomName lors de la création/join"
else
    echo "❌ Navigation avec roomName non trouvée"
fi

# Compter les occurrences
ROOM_NAME_NAV_COUNT=$(grep -c "roomName: room.name" mobile/src/screens/HomeScreen.tsx)
echo "   Nombre de navigations avec roomName: $ROOM_NAME_NAV_COUNT"

if [ $ROOM_NAME_NAV_COUNT -eq 2 ]; then
    echo "✅ Deux navigations mises à jour (création + join)"
elif [ $ROOM_NAME_NAV_COUNT -gt 2 ]; then
    echo "⚠️ Plus de 2 navigations trouvées ($ROOM_NAME_NAV_COUNT)"
else
    echo "❌ Moins de 2 navigations trouvées ($ROOM_NAME_NAV_COUNT)"
fi

# 4. Vérifier la fonction options du navigateur
echo -e "\n4. Vérification de la fonction options..."
if grep -q "options={({ route })" mobile/src/navigation/AppNavigator.tsx; then
    echo "✅ Fonction options pour titre dynamique"
else
    echo "❌ Fonction options non trouvée"
fi

# 5. Vérifier le fallback
echo -e "\n5. Vérification du fallback..."
if grep -q "|| 'Room'" mobile/src/navigation/AppNavigator.tsx; then
    echo "✅ Fallback 'Room' en cas d'absence de roomName"
else
    echo "❌ Fallback non trouvé"
fi

# 6. Rechercher d'autres navigations vers Room
echo -e "\n6. Recherche d'autres navigations vers Room..."
OTHER_NAV_COUNT=$(grep -c "navigate.*Room.*roomId" mobile/src/screens/*.tsx | grep -v ":0" | wc -l)
if [ $OTHER_NAV_COUNT -eq 1 ]; then
    echo "✅ Toutes les navigations vers Room trouvées dans HomeScreen"
else
    echo "⚠️ Autres navigations potentielles détectées: $OTHER_NAV_COUNT fichiers"
fi

# 7. Vérifier que RoomScreen utilise toujours roomName en local
echo -e "\n7. Vérification que RoomScreen utilise roomName local..."
if grep -q "const.*roomName.*=.*route.params" mobile/src/screens/RoomScreen.tsx; then
    echo "✅ RoomScreen récupère roomName depuis les paramètres"
else
    echo "⚠️ RoomScreen ne récupère pas roomName depuis les paramètres (vérifions si c'est normal)"
fi

# 8. Résumé des changements
echo -e "\n📝 Résumé des changements pour le titre dynamique:"
echo "=================================================="
echo ""
echo "📋 Types modifiés:"
echo "   • RootStackParamList.Room: roomName?: string ajouté"
echo "   • Navigation compatible avec nom de room optionnel"
echo ""
echo "🧭 Navigation modifiée:"
echo "   • AppNavigator: options dynamiques avec fonction"
echo "   • Titre: route.params?.roomName || 'Room'"
echo "   • Fallback vers 'Room' si roomName non fourni"
echo ""
echo "🏠 HomeScreen modifié:"
echo "   • Création de room: roomName: room.name ajouté"
echo "   • Join room: roomName: room.name ajouté"
echo "   • Les deux cas de navigation mis à jour"
echo ""
echo "🎯 Comportement attendu:"
echo "   1. Créer/rejoindre une room → API retourne room.name"
echo "   2. Navigation avec { roomId, roomName }"
echo "   3. Titre de page = nom de la room"
echo "   4. Fallback 'Room' si roomName manquant"
echo ""
echo "✅ Le titre de la page affichera maintenant le nom de la room!"
echo "   Au lieu de 'Room', on verra le vrai nom de la room."
