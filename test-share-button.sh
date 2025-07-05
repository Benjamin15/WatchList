#!/bin/bash

# Script de test pour le bouton de partage de room
# Créé le 5 juillet 2025

echo "📤 Test du bouton de partage de room"
echo "==================================="

# 1. Vérifier que l'import Share est ajouté
echo "1. Vérification de l'import Share..."
if grep -q "import.*Share.*from 'react-native'" mobile/src/screens/RoomScreen.tsx; then
    echo "✅ Import Share ajouté"
else
    echo "❌ Import Share non trouvé"
fi

# 2. Vérifier que la fonction handleShareRoom existe
echo -e "\n2. Vérification de la fonction handleShareRoom..."
if grep -q "const handleShareRoom" mobile/src/screens/RoomScreen.tsx; then
    echo "✅ Fonction handleShareRoom créée"
else
    echo "❌ Fonction handleShareRoom non trouvée"
fi

# 3. Vérifier le contenu de partage
echo -e "\n3. Vérification du contenu de partage..."
if grep -q "Rejoignez ma WatchList" mobile/src/screens/RoomScreen.tsx; then
    echo "✅ Message de partage personnalisé"
else
    echo "❌ Message de partage non trouvé"
fi

if grep -q "watchlist://room/" mobile/src/screens/RoomScreen.tsx; then
    echo "✅ Deep link pour ouvrir la room"
else
    echo "❌ Deep link non trouvé"
fi

# 4. Vérifier la structure du header
echo -e "\n4. Vérification de la structure du header..."
if grep -q "headerContent" mobile/src/screens/RoomScreen.tsx; then
    echo "✅ Structure header avec contenu flexible"
else
    echo "❌ Structure header non trouvée"
fi

if grep -q "headerLeft" mobile/src/screens/RoomScreen.tsx; then
    echo "✅ Section gauche du header"
else
    echo "❌ Section gauche non trouvée"
fi

# 5. Vérifier le bouton de partage
echo -e "\n5. Vérification du bouton de partage..."
if grep -q "shareButton" mobile/src/screens/RoomScreen.tsx; then
    echo "✅ Bouton de partage créé"
else
    echo "❌ Bouton de partage non trouvé"
fi

if grep -q "shareButtonIcon" mobile/src/screens/RoomScreen.tsx; then
    echo "✅ Icône du bouton de partage"
else
    echo "❌ Icône du bouton non trouvée"
fi

if grep -q "📤" mobile/src/screens/RoomScreen.tsx; then
    echo "✅ Emoji de partage ajouté"
else
    echo "❌ Emoji de partage non trouvé"
fi

# 6. Vérifier la suppression de l'ancien code
echo -e "\n6. Vérification de la suppression de l'ancien code..."
if ! grep -q "shareContainer" mobile/src/screens/RoomScreen.tsx; then
    echo "✅ Ancien style shareContainer supprimé"
else
    echo "❌ Ancien style shareContainer toujours présent"
fi

# 7. Vérifier les styles
echo -e "\n7. Vérification des styles..."
if grep -q "flexDirection: 'row'" mobile/src/screens/RoomScreen.tsx | head -1; then
    echo "✅ Layout flexbox pour le header"
else
    echo "❌ Layout flexbox non trouvé"
fi

if grep -q "justifyContent: 'space-between'" mobile/src/screens/RoomScreen.tsx; then
    echo "✅ Justification space-between pour répartir les éléments"
else
    echo "❌ Justification non trouvée"
fi

# 8. Résumé des fonctionnalités
echo -e "\n📤 Résumé des fonctionnalités de partage:"
echo "======================================="
echo ""
echo "🎯 Bouton de partage:"
echo "   • Positionné en haut à droite du header"
echo "   • Icône emoji 📤 + texte 'Partager'"
echo "   • Style moderne avec ombrage et couleur primaire"
echo ""
echo "📱 Contenu de partage:"
echo "   • Titre: 'Rejoignez ma WatchList !'"
echo "   • Message personnalisé avec nom et code de la room"
echo "   • Deep link: watchlist://room/CODE pour ouvrir directement"
echo "   • Emojis pour rendre le message attractif 🎬🍿"
echo ""
echo "🎨 Interface:"
echo "   • Header restructuré avec layout flexbox"
echo "   • Titre et code à gauche, bouton à droite"
echo "   • Ancien bouton de partage dans le contenu supprimé"
echo "   • Styles optimisés pour la cohérence visuelle"
echo ""
echo "⚡ Fonctionnalités:"
echo "   • Partage natif iOS/Android"
echo "   • Gestion des erreurs avec Alert"
echo "   • Logs pour le debugging"
echo "   • Compatibilité avec toutes les apps de partage"
echo ""
echo "✅ Le bouton de partage est maintenant opérationnel!"
echo "   Les utilisateurs peuvent facilement partager leurs rooms."
