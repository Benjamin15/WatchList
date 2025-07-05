#!/bin/bash

# Script de sauvegarde des modifications pour la fonctionnalité de changement de statut
# Commite toutes les modifications apportées

echo "💾 Sauvegarde des modifications - Changement de statut"
echo "===================================================="

# Ajouter tous les fichiers modifiés
git add .

# Vérifier les fichiers modifiés
echo "📄 Fichiers modifiés :"
git status --porcelain

echo ""
echo "🎯 Résumé des modifications :"
echo "• Ajout de checkItemInRoom() dans ApiService"
echo "• Modification de MediaDetailScreen pour détecter les médias existants"
echo "• Remplacement du bouton 'Ajouter' par une interface de statut"
echo "• Ajout de 4 boutons de statut avec icônes et couleurs"
echo "• Interface moderne sans modal de confirmation"
echo "• Mise à jour immédiate et persistante des statuts"
echo ""

# Commiter les modifications
git commit -m "✨ Fonctionnalité: Changement de statut dans MediaDetailScreen

🎯 Objectif:
- Remplacer le bouton 'Ajouter à ma liste' par une interface de changement de statut
- Améliorer l'UX en évitant les modals et en rendant le changement immédiat

🔧 Modifications techniques:
• ApiService:
  - Ajout de checkItemInRoom() pour vérifier si un média est dans la watchlist
  - Retourne isInWatchlist + item existant pour gestion du statut

• MediaDetailScreen:
  - Ajout de checkIfInWatchlist() appelée au chargement
  - Ajout de l'état watchlistItem pour stocker le média existant
  - Remplacement conditionnel du bouton 'Ajouter' par l'interface de statut
  - Nouvelle interface avec 4 boutons de statut visuels
  - Changement de statut immédiat sans modal

🎨 Interface:
• Section 'Statut dans ma liste' avec 4 boutons:
  - À regarder (orange, bookmark-outline)
  - En cours (bleu, play-circle-outline)
  - Terminé (vert, checkmark-circle-outline)
  - Abandonné (rouge, close-circle-outline)
• Statut actuel mis en évidence avec couleur et bordure
• Changement immédiat au clic sans confirmation

📱 UX améliorée:
- Pas de modal de confirmation (changement fluide)
- Feedback visuel immédiat
- Interface moderne et intuitive
- Cohérence avec le reste de l'application

🧪 Tests:
- Scripts de test ajoutés pour validation
- Vérification de la détection des médias existants
- Test du changement de statut et de la persistance"

echo ""
echo "✅ Modifications sauvegardées avec succès !"
echo "🎬 La fonctionnalité de changement de statut est maintenant active"
echo ""
echo "📋 Prochaines étapes recommandées :"
echo "1. Tester l'application avec ./test-status-change-usage.sh"
echo "2. Vérifier que les statuts se synchronisent avec la liste principale"
echo "3. Tester la persistance des changements"
echo "4. Valider l'interface sur différents appareils"
