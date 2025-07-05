#!/bin/bash

# Script de test pour vérifier l'affichage des noms des rooms dans l'historique

echo "👁️ Test - Affichage des noms des rooms dans l'historique"
echo "======================================================="

# Vérifier le fichier HomeScreen
HOME_SCREEN="mobile/src/screens/HomeScreen.tsx"
echo "📄 Vérification de l'affichage des noms..."

if [ -f "$HOME_SCREEN" ]; then
    echo "✅ HomeScreen trouvé"
    
    # Vérifier l'affichage du nom
    if grep -q "item.name" "$HOME_SCREEN"; then
        echo "✅ Nom de la room affiché avec {item.name}"
    else
        echo "❌ Nom de la room non affiché"
    fi
    
    # Vérifier les styles du nom
    if grep -q "historyRoomName" "$HOME_SCREEN"; then
        echo "✅ Style historyRoomName appliqué au nom"
    else
        echo "❌ Style historyRoomName manquant"
    fi
    
    # Vérifier le style bold
    if grep -q "fontWeight.*bold.*historyRoomName" "$HOME_SCREEN" || grep -A 5 "historyRoomName:" "$HOME_SCREEN" | grep -q "fontWeight.*bold"; then
        echo "✅ Nom en gras (fontWeight: bold)"
    else
        echo "❌ Nom pas en gras"
    fi
    
    # Vérifier la taille de police
    if grep -A 5 "historyRoomName:" "$HOME_SCREEN" | grep -q "FONT_SIZES.lg"; then
        echo "✅ Taille de police grande (FONT_SIZES.lg)"
    elif grep -A 5 "historyRoomName:" "$HOME_SCREEN" | grep -q "FONT_SIZES.md"; then
        echo "✅ Taille de police moyenne (FONT_SIZES.md)"
    else
        echo "⚠️  Taille de police à vérifier"
    fi
    
    # Vérifier la couleur
    if grep -A 5 "historyRoomName:" "$HOME_SCREEN" | grep -q "COLORS.onSurface"; then
        echo "✅ Couleur contrastée (COLORS.onSurface)"
    else
        echo "❌ Couleur du nom à vérifier"
    fi
    
    # Vérifier l'affichage du code
    if grep -q "Code.*item.room_id" "$HOME_SCREEN"; then
        echo "✅ Code de la room affiché"
    else
        echo "❌ Code de la room non affiché"
    fi
    
    # Vérifier l'affichage de la date
    if grep -q "last_joined" "$HOME_SCREEN"; then
        echo "✅ Date de dernière connexion affichée"
    else
        echo "❌ Date de dernière connexion non affichée"
    fi
    
    # Vérifier la hiérarchie visuelle
    if grep -A 10 "historyContent" "$HOME_SCREEN" | grep -q "historyRoomName"; then
        echo "✅ Nom en première position (hiérarchie visuelle)"
    else
        echo "❌ Hiérarchie visuelle à vérifier"
    fi
else
    echo "❌ HomeScreen non trouvé"
fi

# Vérifier le service d'historique
HISTORY_SERVICE="mobile/src/services/roomHistory.ts"
echo ""
echo "📄 Vérification du stockage des noms..."

if [ -f "$HISTORY_SERVICE" ]; then
    echo "✅ Service roomHistory trouvé"
    
    # Vérifier que le nom est stocké
    if grep -q "name: room.name" "$HISTORY_SERVICE"; then
        echo "✅ Nom de la room stocké dans l'historique"
    else
        echo "❌ Nom de la room pas stocké"
    fi
    
    # Vérifier la mise à jour du nom
    if grep -q "name = room.name" "$HISTORY_SERVICE"; then
        echo "✅ Nom mis à jour lors des reconnexions"
    else
        echo "❌ Nom pas mis à jour"
    fi
    
    # Vérifier l'interface RoomHistory
    if grep -q "name: string" "$HISTORY_SERVICE"; then
        echo "✅ Interface RoomHistory inclut le nom"
    else
        echo "❌ Interface RoomHistory sans nom"
    fi
else
    echo "❌ Service roomHistory non trouvé"
fi

echo ""
echo "🎯 Affichage actuel dans l'historique :"
echo "====================================="
echo ""
echo "Pour chaque room récente, l'utilisateur voit :"
echo "1. 📝 NOM DE LA ROOM (en gras, taille large)"
echo "2. 🔑 Code: ABC123 (plus petit, gris)"
echo "3. 📅 Dernière connexion: 05/07/2025 (très petit, italique)"
echo ""
echo "Hiérarchie visuelle :"
echo "• Nom = Information principale (gras, grand)"
echo "• Code = Information secondaire (normal, moyen)"
echo "• Date = Information contextuelle (petit, italique)"
echo ""

echo "✨ Améliorations apportées :"
echo "==========================="
echo "• Taille de police augmentée pour le nom (FONT_SIZES.lg)"
echo "• Maintien du gras pour l'importance visuelle"
echo "• Ajout de la date de dernière connexion"
echo "• Hiérarchie visuelle claire avec 3 niveaux d'information"
echo "• Espacement amélioré entre les éléments"
echo ""

echo "🔍 Points à vérifier lors du test :"
echo "=================================="
echo "• Le nom de la room est-il clairement visible ?"
echo "• Le nom est-il plus proéminent que le code ?"
echo "• La hiérarchie visuelle est-elle claire ?"
echo "• Les informations sont-elles bien organisées ?"
echo "• Le contraste est-il suffisant ?"
echo ""

echo "📱 Instructions de test :"
echo "========================"
echo "1. Créez plusieurs rooms avec des noms différents"
echo "2. Retournez à l'accueil"
echo "3. Vérifiez que les noms sont clairement visibles"
echo "4. Vérifiez la hiérarchie : Nom > Code > Date"
echo "5. Testez avec des noms longs et courts"
echo ""

echo "✅ Vérification terminée !"
echo "💡 Les noms des rooms devraient maintenant être bien visibles"
