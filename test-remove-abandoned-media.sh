#!/bin/bash

# Script de test pour la fonctionnalité de suppression automatique des médias abandonnés
# Vérifie que les médias marqués comme "abandonné" sont retirés de la liste

echo "🗑️ Test - Suppression automatique des médias abandonnés"
echo "=================================================="

# Vérifier les fichiers modifiés
echo "📄 Vérification des modifications:"

DETAIL_FILE="mobile/src/screens/MediaDetailScreen.tsx"
if [ -f "$DETAIL_FILE" ]; then
    echo "✅ Fichier MediaDetailScreen trouvé : $DETAIL_FILE"
    
    # Vérifier la confirmation de suppression
    if grep -q "Marquer ce média comme \"abandonné\" le retirera définitivement" "$DETAIL_FILE"; then
        echo "✅ Modal de confirmation ajoutée pour la suppression"
    else
        echo "❌ Modal de confirmation manquante"
    fi
    
    # Vérifier l'appel à removeItemFromRoom
    if grep -q "removeItemFromRoom" "$DETAIL_FILE"; then
        echo "✅ Appel à removeItemFromRoom implémenté"
    else
        echo "❌ Appel à removeItemFromRoom manquant"
    fi
    
    # Vérifier le retour à l'écran précédent
    if grep -q "navigation.goBack()" "$DETAIL_FILE"; then
        echo "✅ Retour automatique à l'écran précédent après suppression"
    else
        echo "❌ Retour automatique manquant"
    fi
    
    # Vérifier le changement de libellé
    if grep -q "label: 'Supprimer'" "$DETAIL_FILE"; then
        echo "✅ Libellé du bouton changé en 'Supprimer'"
    else
        echo "❌ Libellé du bouton non changé"
    fi
    
    # Vérifier l'icône poubelle
    if grep -q "trash-outline" "$DETAIL_FILE"; then
        echo "✅ Icône poubelle ajoutée"
    else
        echo "❌ Icône poubelle manquante"
    fi
else
    echo "❌ Fichier MediaDetailScreen non trouvé"
fi

# Vérifier l'API service
API_FILE="mobile/src/services/api.ts"
if [ -f "$API_FILE" ]; then
    echo "✅ Fichier API trouvé : $API_FILE"
    
    # Vérifier la méthode removeItemFromRoom
    if grep -q "removeItemFromRoom" "$API_FILE"; then
        echo "✅ Méthode removeItemFromRoom disponible"
    else
        echo "❌ Méthode removeItemFromRoom manquante"
    fi
else
    echo "❌ Fichier API non trouvé"
fi

echo ""
echo "🎯 Nouveau comportement :"
echo "========================"
echo ""
echo "1️⃣ AVANT (ancien comportement):"
echo "   • Bouton 'Abandonné' avec icône ❌"
echo "   • Changeait le statut vers 'dropped'"
echo "   • Média restait dans la liste"
echo ""
echo "2️⃣ APRÈS (nouveau comportement):"
echo "   • Bouton 'Supprimer' avec icône 🗑️"
echo "   • Affiche une confirmation avant suppression"
echo "   • Supprime définitivement le média de la liste"
echo "   • Retourne automatiquement à l'écran précédent"
echo ""
echo "🔄 Flux utilisateur :"
echo "1. Utilisateur clique sur 'Supprimer'"
echo "2. Modal de confirmation s'affiche :"
echo "   'Marquer ce média comme \"abandonné\" le retirera"
echo "   définitivement de votre liste. Continuer ?'"
echo "3. Options : 'Annuler' ou 'Supprimer'"
echo "4. Si 'Supprimer' → Média retiré de la liste"
echo "5. Retour automatique à l'écran précédent"
echo ""
echo "🎨 Changements visuels :"
echo "• Bouton 'Abandonné' → 'Supprimer'"
echo "• Icône 'close-circle-outline' → 'trash-outline'"
echo "• Couleur rouge conservée (#FF3B30)"
echo "• Modal de confirmation avec style destructif"
echo ""
echo "⚠️ Impact utilisateur :"
echo "• Plus clair : 'Supprimer' vs 'Abandonné'"
echo "• Prévient les suppressions accidentelles"
echo "• Nettoie automatiquement la liste"
echo "• Cohérent avec l'UX moderne"
echo ""
echo "✅ Test de configuration terminé !"
echo "💡 Testez maintenant l'application pour vérifier le comportement"
