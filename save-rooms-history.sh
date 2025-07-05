#!/bin/bash

# Script de sauvegarde pour la fonctionnalité d'historique des rooms

echo "💾 Sauvegarde - Historique des rooms sur la page d'accueil"
echo "========================================================"

# Ajouter tous les fichiers modifiés
git add .

# Vérifier les fichiers modifiés
echo "📄 Fichiers modifiés :"
git status --porcelain

echo ""
echo "🎯 Résumé des modifications :"
echo "• Création du service roomHistory.ts avec AsyncStorage"
echo "• Modification du HomeScreen pour afficher l'historique"
echo "• Section 'Rooms récentes' avec join direct"
echo "• Gestion des rooms obsolètes"
echo "• Persistance et tri automatique"
echo ""

# Commiter les modifications
git commit -m "🏠 Fonctionnalité: Historique des rooms sur la page d'accueil

🎯 Objectif:
- Afficher la liste des rooms précédemment rejointes sur la page d'accueil
- Permettre de rejoindre directement une room en cliquant dessus
- Améliorer l'UX en évitant de retaper les codes de room

🔧 Modifications techniques:
• Service roomHistory.ts:
  - Utilisation d'AsyncStorage pour la persistance locale
  - Méthodes getRoomsHistory(), addRoomToHistory(), removeRoomFromHistory()
  - Limite de 10 rooms maximum dans l'historique
  - Tri automatique par date de dernière connexion (plus récent en premier)
  - Gestion des erreurs et nettoyage automatique

• HomeScreen.tsx:
  - Ajout de l'état roomsHistory pour stocker l'historique
  - Méthode loadRoomsHistory() appelée avec useFocusEffect
  - Modification handleCreateRoom() et handleJoinRoom() pour ajouter à l'historique
  - Méthode handleJoinFromHistory() pour rejoindre depuis l'historique
  - Section 'Rooms récentes' affichée conditionnellement
  - Gestion des rooms inexistantes avec proposition de suppression

🎨 Interface utilisateur:
• Section 'Rooms récentes' après les sections existantes
• Affichage conditionnel (visible seulement si historique non vide)
• Liste des rooms avec nom et code
• Style cohérent avec le reste de l'application
• Interaction tactile pour join direct

📱 Fonctionnalités:
• Stockage local persistant avec AsyncStorage
• Ajout automatique à l'historique lors de création/join
• Tri par date de dernière connexion
• Limite de 10 rooms pour éviter l'encombrement
• Mise à jour automatique de la date de dernière connexion
• Gestion des rooms supprimées/inexistantes
• Proposition de nettoyage de l'historique

🔄 Flux utilisateur:
1. Utilisateur crée ou rejoint une room → Ajout automatique à l'historique
2. Retour à la page d'accueil → Section 'Rooms récentes' visible
3. Clic sur une room de l'historique → Join automatique
4. Si room inexistante → Proposition de suppression de l'historique
5. Historique trié automatiquement par date de dernière utilisation

⚠️ Gestion d'erreurs:
• Room inexistante → Alert avec option de suppression
• Erreurs AsyncStorage → Fallback gracieux
• Limite d'historique → Suppression automatique des plus anciennes
• Rechargement automatique après modifications

🧪 Tests:
- Scripts de test pour validation de la fonctionnalité
- Vérification de la persistance et du tri
- Test de la gestion d'erreurs

Dependencies:
- @react-native-async-storage/async-storage (installé)"

echo ""
echo "✅ Modifications sauvegardées avec succès !"
echo "🏠 L'historique des rooms est maintenant disponible sur la page d'accueil"
echo ""
echo "📋 Prochaines étapes recommandées :"
echo "1. Tester l'application pour vérifier le comportement"
echo "2. Créer plusieurs rooms pour peupler l'historique"
echo "3. Vérifier la persistance après fermeture/réouverture de l'app"
echo "4. Tester la gestion des rooms inexistantes"
echo "5. Valider le tri par date de dernière connexion"
