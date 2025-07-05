#!/bin/bash

# Script de test pour la fonctionnalité de changement de statut dans MediaDetailScreen
# Vérifie que le bouton "Ajouter à ma liste" est remplacé par les options de statut

echo "🎬 Test - Changement de statut dans MediaDetailScreen"
echo "=================================================="

# Vérifier les fichiers modifiés
echo "📄 Vérification des fichiers modifiés:"

# Vérifier le service API
API_FILE="mobile/src/services/api.ts"
if [ -f "$API_FILE" ]; then
    echo "✅ Fichier API trouvé : $API_FILE"
    
    # Vérifier la méthode checkItemInRoom
    if grep -q "checkItemInRoom" "$API_FILE"; then
        echo "✅ Méthode checkItemInRoom ajoutée"
    else
        echo "❌ Méthode checkItemInRoom manquante"
    fi
    
    # Vérifier le type de retour
    if grep -q "isInWatchlist: boolean" "$API_FILE"; then
        echo "✅ Type de retour correct pour checkItemInRoom"
    else
        echo "❌ Type de retour incorrect"
    fi
else
    echo "❌ Fichier API non trouvé"
fi

# Vérifier MediaDetailScreen
DETAIL_FILE="mobile/src/screens/MediaDetailScreen.tsx"
if [ -f "$DETAIL_FILE" ]; then
    echo "✅ Fichier MediaDetailScreen trouvé : $DETAIL_FILE"
    
    # Vérifier la méthode checkIfInWatchlist
    if grep -q "checkIfInWatchlist" "$DETAIL_FILE"; then
        echo "✅ Méthode checkIfInWatchlist ajoutée"
    else
        echo "❌ Méthode checkIfInWatchlist manquante"
    fi
    
    # Vérifier l'état watchlistItem
    if grep -q "watchlistItem" "$DETAIL_FILE"; then
        echo "✅ État watchlistItem ajouté"
    else
        echo "❌ État watchlistItem manquant"
    fi
    
    # Vérifier l'interface de statut
    if grep -q "statusSection" "$DETAIL_FILE"; then
        echo "✅ Interface de statut redessinée"
    else
        echo "❌ Interface de statut manquante"
    fi
    
    # Vérifier les boutons de statut
    if grep -q "statusOption" "$DETAIL_FILE"; then
        echo "✅ Boutons de statut ajoutés"
    else
        echo "❌ Boutons de statut manquants"
    fi
    
    # Vérifier les styles
    if grep -q "statusSectionTitle" "$DETAIL_FILE"; then
        echo "✅ Styles pour l'interface de statut ajoutés"
    else
        echo "❌ Styles pour l'interface de statut manquants"
    fi
    
    # Vérifier les icônes
    if grep -q "bookmark-outline" "$DETAIL_FILE"; then
        echo "✅ Icônes pour les statuts configurées"
    else
        echo "❌ Icônes pour les statuts manquantes"
    fi
else
    echo "❌ Fichier MediaDetailScreen non trouvé"
fi

echo ""
echo "🎯 Fonctionnalité attendue :"
echo "1. Quand un média N'EST PAS dans la liste :"
echo "   → Bouton 'Ajouter à ma liste' visible"
echo ""
echo "2. Quand un média EST dans la liste :"
echo "   → Bouton 'Ajouter à ma liste' remplacé par :"
echo "   → Section 'Statut dans ma liste'"
echo "   → 4 boutons de statut avec icônes et couleurs :"
echo "     • À regarder (orange, bookmark)"
echo "     • En cours (bleu, play-circle)"
echo "     • Terminé (vert, checkmark-circle)"
echo "     • Abandonné (rouge, close-circle)"
echo "   → Le statut actuel est mis en évidence"
echo ""
echo "3. Interaction :"
echo "   → Clic sur un statut → Mise à jour immédiate"
echo "   → Pas de modal de confirmation"
echo "   → Feedback visuel direct"
echo ""

echo "🔧 Modifications apportées :"
echo "• Ajout de checkItemInRoom() dans ApiService"
echo "• Ajout de checkIfInWatchlist() dans MediaDetailScreen"
echo "• Ajout de l'état watchlistItem pour stocker le média existant"
echo "• Remplacement du bouton 'Ajouter' par une interface de statut"
echo "• Ajout de 4 boutons de statut avec icônes et couleurs"
echo "• Ajout des styles pour l'interface de statut"
echo "• Mise à jour automatique du statut sans modal"
echo ""
echo "✅ Test de configuration terminé !"
echo "💡 Testez maintenant l'application pour vérifier le comportement"
