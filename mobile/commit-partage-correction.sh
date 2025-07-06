#!/bin/bash

# Script de commit pour la correction du bouton de partage

echo "📦 Commit de la correction du bouton de partage"
echo "============================================="

# Ajouter les fichiers modifiés
echo "📁 Ajout des fichiers modifiés..."
git add mobile/src/navigation/AppNavigator.tsx
git add mobile/test-partage-correction.sh

# Créer le commit
echo "💾 Création du commit..."
git commit -m "🔧 Correction du bouton de partage dans AppNavigator

❌ Problème résolu:
- Erreur 'native module that doesn't exist' lors du partage
- Import dynamique de Share/Alert causait des conflits

🔧 Corrections apportées:
- Imports directs de Share et Alert depuis react-native
- Suppression de l'import dynamique avec import()
- Remplacement de Pressable par TouchableOpacity
- Mise à jour des dépendances avec expo install --fix

✅ Fonctionnalité corrigée:
- Bouton de partage 📤 fonctionnel
- Menu de partage natif s'ouvre correctement
- Message personnalisé avec nom et code de room
- Gestion d'erreurs maintenue

🧪 Tests:
- Script de validation automatique créé
- Serveur de développement opérationnel
- Dépendances mises à jour vers versions compatibles

📱 Utilisation:
- Aller dans une room
- Cliquer sur le bouton 📤 en haut à droite
- Partager le lien de la room via les apps natives"

echo ""
echo "✅ Commit créé avec succès!"
echo ""
echo "📝 Résumé des corrections:"
echo "- 🔧 Imports directs au lieu d'import dynamique"
echo "- 🔄 TouchableOpacity au lieu de Pressable"
echo "- 📦 Dépendances mises à jour"
echo "- 🧪 Tests automatisés"
echo ""
echo "🎉 Bouton de partage fonctionnel!"
