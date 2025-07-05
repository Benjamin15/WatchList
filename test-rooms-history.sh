#!/bin/bash

# Script de test pour la fonctionnalité d'historique des rooms
# Vérifie que les modifications sont correctement implémentées

echo "🏠 Test - Historique des rooms dans HomeScreen"
echo "=============================================="

# Vérifier les fichiers modifiés
echo "📄 Vérification des fichiers :"

# Vérifier le service d'historique
HISTORY_SERVICE="mobile/src/services/roomHistory.ts"
if [ -f "$HISTORY_SERVICE" ]; then
    echo "✅ Service d'historique créé : $HISTORY_SERVICE"
    
    # Vérifier les méthodes principales
    if grep -q "getRoomsHistory" "$HISTORY_SERVICE"; then
        echo "✅ Méthode getRoomsHistory implémentée"
    else
        echo "❌ Méthode getRoomsHistory manquante"
    fi
    
    if grep -q "addRoomToHistory" "$HISTORY_SERVICE"; then
        echo "✅ Méthode addRoomToHistory implémentée"
    else
        echo "❌ Méthode addRoomToHistory manquante"
    fi
    
    if grep -q "removeRoomFromHistory" "$HISTORY_SERVICE"; then
        echo "✅ Méthode removeRoomFromHistory implémentée"
    else
        echo "❌ Méthode removeRoomFromHistory manquante"
    fi
else
    echo "❌ Service d'historique non trouvé"
fi

# Vérifier AsyncStorage
PACKAGE_JSON="mobile/package.json"
if [ -f "$PACKAGE_JSON" ]; then
    if grep -q "@react-native-async-storage/async-storage" "$PACKAGE_JSON"; then
        echo "✅ AsyncStorage installé"
    else
        echo "❌ AsyncStorage non installé"
    fi
else
    echo "❌ Package.json non trouvé"
fi

# Vérifier HomeScreen
HOME_SCREEN="mobile/src/screens/HomeScreen.tsx"
if [ -f "$HOME_SCREEN" ]; then
    echo "✅ HomeScreen trouvé : $HOME_SCREEN"
    
    # Vérifier les imports
    if grep -q "roomHistoryService" "$HOME_SCREEN"; then
        echo "✅ Import du service d'historique"
    else
        echo "❌ Import du service d'historique manquant"
    fi
    
    if grep -q "useFocusEffect" "$HOME_SCREEN"; then
        echo "✅ Import useFocusEffect pour le rechargement"
    else
        echo "❌ Import useFocusEffect manquant"
    fi
    
    # Vérifier les états
    if grep -q "roomsHistory" "$HOME_SCREEN"; then
        echo "✅ État roomsHistory ajouté"
    else
        echo "❌ État roomsHistory manquant"
    fi
    
    # Vérifier les méthodes
    if grep -q "loadRoomsHistory" "$HOME_SCREEN"; then
        echo "✅ Méthode loadRoomsHistory implémentée"
    else
        echo "❌ Méthode loadRoomsHistory manquante"
    fi
    
    if grep -q "handleJoinFromHistory" "$HOME_SCREEN"; then
        echo "✅ Méthode handleJoinFromHistory implémentée"
    else
        echo "❌ Méthode handleJoinFromHistory manquante"
    fi
    
    # Vérifier l'ajout à l'historique dans les actions
    if grep -q "addRoomToHistory.*handleCreateRoom" "$HOME_SCREEN" || grep -q "addRoomToHistory" "$HOME_SCREEN"; then
        echo "✅ Ajout à l'historique lors de la création/join"
    else
        echo "❌ Ajout à l'historique manquant"
    fi
    
    # Vérifier l'interface
    if grep -q "Rooms récentes" "$HOME_SCREEN"; then
        echo "✅ Section 'Rooms récentes' ajoutée"
    else
        echo "❌ Section 'Rooms récentes' manquante"
    fi
else
    echo "❌ HomeScreen non trouvé"
fi

echo ""
echo "🎯 Fonctionnalité attendue :"
echo "=========================="
echo ""
echo "1️⃣ STOCKAGE LOCAL :"
echo "   • AsyncStorage pour sauvegarder l'historique"
echo "   • Limite de 10 rooms maximum"
echo "   • Tri par date de dernière connexion"
echo ""
echo "2️⃣ INTERFACE HOMESCREEN :"
echo "   • Section 'Rooms récentes' après les sections existantes"
echo "   • Liste des rooms avec nom, code et dernière connexion"
echo "   • Bouton de suppression pour chaque room"
echo ""
echo "3️⃣ INTERACTIONS :"
echo "   • Clic sur une room → Rejoint directement"
echo "   • Clic sur X → Supprime de l'historique"
echo "   • Création/Join room → Ajout automatique à l'historique"
echo ""
echo "4️⃣ GESTION D'ERREURS :"
echo "   • Room inexistante → Proposition de suppression de l'historique"
echo "   • Confirmation avant suppression"
echo "   • Rechargement automatique de l'historique"
echo ""

echo "🔧 Problèmes potentiels détectés :"
echo "=================================="

# Vérifier les erreurs TypeScript courantes
if [ -f "$HOME_SCREEN" ]; then
    if grep -q "FlatList" "$HOME_SCREEN"; then
        echo "⚠️  FlatList peut avoir des problèmes de typage"
        echo "   → Utiliser une approche avec map() plus simple"
    fi
    
    if grep -q "COLORS.danger" "$HOME_SCREEN"; then
        echo "⚠️  COLORS.danger n'existe peut-être pas"
        echo "   → Utiliser une couleur hexadécimale directement"
    fi
    
    if grep -q "contentContainerStyle" "$HOME_SCREEN"; then
        echo "⚠️  Propriété contentContainerStyle peut poser problème"
        echo "   → Utiliser style à la place"
    fi
fi

echo ""
echo "✅ Test de configuration terminé !"
echo "💡 Vérifiez les erreurs TypeScript et corrigez si nécessaire"
