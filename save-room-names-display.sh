#!/bin/bash

# Script de sauvegarde pour l'amélioration de l'affichage des noms des rooms

echo "💾 Sauvegarde - Amélioration de l'affichage des noms des rooms"
echo "============================================================="

# Ajouter tous les fichiers modifiés
git add .

# Vérifier les fichiers modifiés
echo "📄 Fichiers modifiés :"
git status --porcelain

echo ""
echo "🎯 Résumé des améliorations :"
echo "• Taille de police augmentée pour les noms (FONT_SIZES.lg)"
echo "• Ajout de la date de dernière connexion"
echo "• Hiérarchie visuelle améliorée"
echo "• Espacement optimisé entre les éléments"
echo ""

# Commiter les modifications
git commit -m "👁️ Amélioration: Affichage des noms des rooms dans l'historique

🎯 Objectif:
- Rendre les noms des rooms plus visibles et proéminents dans l'historique
- Améliorer la hiérarchie visuelle des informations
- Ajouter des informations contextuelles utiles

🔧 Améliorations apportées:
• Affichage des noms:
  - Taille de police augmentée (FONT_SIZES.md → FONT_SIZES.lg)
  - Maintien du style gras pour l'importance visuelle
  - Couleur contrastée (COLORS.onSurface)
  - Position en première dans la hiérarchie

• Informations contextuelles:
  - Ajout de la date de dernière connexion
  - Format français (toLocaleDateString('fr-FR'))
  - Style italique pour différencier

• Hiérarchie visuelle optimisée:
  1. Nom de la room (grand, gras) = Information principale
  2. Code de la room (moyen, normal) = Information secondaire  
  3. Date de connexion (petit, italique) = Information contextuelle

• Espacement amélioré:
  - marginBottom ajouté entre chaque élément
  - Meilleure lisibilité et organisation

🎨 Structure d'affichage:
Pour chaque room dans l'historique:
┌─────────────────────────────────┐
│ 📝 NOM DE LA ROOM (gras, lg)    │
│ 🔑 Code: ABC123 (normal, sm)    │
│ 📅 Dernière connexion: 05/07/25 │
└─────────────────────────────────┘

📱 Impact utilisateur:
• Identification rapide des rooms par leur nom
• Hiérarchie claire des informations importantes
• Contexte temporel avec la date de dernière connexion
• Interface plus professionnelle et organisée
• Meilleure accessibilité visuelle

🔍 Validation:
- Script de test pour vérifier l'affichage correct
- Validation de la hiérarchie visuelle
- Vérification du contraste et de la lisibilité"

echo ""
echo "✅ Améliorations sauvegardées avec succès !"
echo "👁️ Les noms des rooms sont maintenant plus visibles dans l'historique"
echo ""
echo "📋 Résultat attendu :"
echo "• Noms des rooms clairement visibles en première position"
echo "• Taille de police plus grande pour meilleure lisibilité"
echo "• Date de dernière connexion pour contexte temporel"
echo "• Hiérarchie visuelle claire et professionnelle"
echo ""
echo "💡 Testez maintenant l'application pour voir les améliorations !"
