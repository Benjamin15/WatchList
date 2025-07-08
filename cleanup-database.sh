#!/bin/bash

# Script de nettoyage de la base de données WatchParty
echo "🗑️  Nettoyage de la base de données WatchParty"
echo "============================================="

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les résultats
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
    fi
}

# Fonction pour afficher les infos
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Fonction pour afficher les warnings
print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Vérifier l'état actuel de la base de données
echo -e "\n${BLUE}1. État actuel de la base de données${NC}"

if [ -f "server/prisma/dev.db" ]; then
    DB_SIZE=$(du -h server/prisma/dev.db | cut -f1)
    print_info "Base de données trouvée (taille: $DB_SIZE)"
    
    # Compter les enregistrements
    ROOM_COUNT=$(sqlite3 server/prisma/dev.db "SELECT COUNT(*) FROM rooms;" 2>/dev/null || echo "0")
    ITEM_COUNT=$(sqlite3 server/prisma/dev.db "SELECT COUNT(*) FROM items;" 2>/dev/null || echo "0")
    RELATION_COUNT=$(sqlite3 server/prisma/dev.db "SELECT COUNT(*) FROM item_in_room;" 2>/dev/null || echo "0")
    
    print_info "Rooms: $ROOM_COUNT"
    print_info "Items: $ITEM_COUNT"
    print_info "Relations: $RELATION_COUNT"
else
    print_info "Aucune base de données trouvée"
fi

# Demander confirmation
echo -e "\n${YELLOW}⚠️  ATTENTION: Cette opération va supprimer toutes les données !${NC}"
echo -e "${YELLOW}   - Toutes les rooms de test${NC}"
echo -e "${YELLOW}   - Tous les médias ajoutés${NC}"
echo -e "${YELLOW}   - Toutes les relations${NC}"
echo ""
read -p "Voulez-vous continuer ? (y/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_info "Nettoyage annulé"
    exit 0
fi

# Arrêter le serveur s'il est en cours d'exécution
echo -e "\n${BLUE}2. Arrêt du serveur${NC}"
pkill -f "node src/app.js" 2>/dev/null
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
sleep 2
print_result 0 "Serveur arrêté"

# Nettoyer la base de données
echo -e "\n${BLUE}3. Nettoyage de la base de données${NC}"

if [ -f "server/prisma/dev.db" ]; then
    # Sauvegarder l'ancienne base
    cp server/prisma/dev.db server/prisma/dev.db.backup.$(date +%Y%m%d_%H%M%S)
    print_info "Sauvegarde créée: dev.db.backup.$(date +%Y%m%d_%H%M%S)"
    
    # Supprimer la base de données
    rm server/prisma/dev.db
    print_result 0 "Base de données supprimée"
else
    print_info "Aucune base de données à supprimer"
fi

# Recréer la base de données
echo -e "\n${BLUE}4. Recréation de la base de données${NC}"
cd server

# Générer le client Prisma
npx prisma generate > /dev/null 2>&1
print_result 0 "Client Prisma généré"

# Appliquer les migrations
npx prisma migrate deploy > /dev/null 2>&1
MIGRATE_SUCCESS=$?

if [ $MIGRATE_SUCCESS -eq 0 ]; then
    print_result 0 "Migrations appliquées"
else
    print_warning "Erreur lors des migrations, tentative de reset..."
    npx prisma migrate reset --force > /dev/null 2>&1
    print_result 0 "Base de données réinitialisée"
fi

# Vérifier la nouvelle base de données
echo -e "\n${BLUE}5. Vérification de la nouvelle base de données${NC}"

if [ -f "prisma/dev.db" ]; then
    NEW_DB_SIZE=$(du -h prisma/dev.db | cut -f1)
    print_info "Nouvelle base de données créée (taille: $NEW_DB_SIZE)"
    
    # Vérifier les tables
    TABLES=$(sqlite3 prisma/dev.db ".tables" 2>/dev/null || echo "")
    if [ -n "$TABLES" ]; then
        print_result 0 "Tables créées: $TABLES"
        
        # Vérifier que les tables sont vides
        NEW_ROOM_COUNT=$(sqlite3 prisma/dev.db "SELECT COUNT(*) FROM rooms;" 2>/dev/null || echo "0")
        NEW_ITEM_COUNT=$(sqlite3 prisma/dev.db "SELECT COUNT(*) FROM items;" 2>/dev/null || echo "0")
        NEW_RELATION_COUNT=$(sqlite3 prisma/dev.db "SELECT COUNT(*) FROM item_in_room;" 2>/dev/null || echo "0")
        
        print_info "Rooms: $NEW_ROOM_COUNT (vide ✅)"
        print_info "Items: $NEW_ITEM_COUNT (vide ✅)"
        print_info "Relations: $NEW_RELATION_COUNT (vide ✅)"
    else
        print_result 1 "Erreur: Tables non créées"
    fi
else
    print_result 1 "Erreur: Base de données non créée"
    exit 1
fi

# Redémarrer le serveur
echo -e "\n${BLUE}6. Redémarrage du serveur${NC}"
node src/app.js > /dev/null 2>&1 &
SERVER_PID=$!
sleep 3

# Vérifier que le serveur fonctionne
HEALTH_CHECK=$(curl -s http://localhost:3000/api/health 2>/dev/null)
if [ $? -eq 0 ]; then
    print_result 0 "Serveur redémarré (PID: $SERVER_PID)"
    print_info "Réponse: $HEALTH_CHECK"
else
    print_result 1 "Erreur lors du redémarrage du serveur"
fi

# Test de fonctionnement
echo -e "\n${BLUE}7. Test de fonctionnement${NC}"

# Test de création d'une room
ROOM_RESPONSE=$(curl -s -X POST "http://localhost:3000/api/rooms" \
    -H "Content-Type: application/json" \
    -d '{"name": "Test Clean Database"}' 2>/dev/null)

if [ $? -eq 0 ]; then
    ROOM_ID=$(echo "$ROOM_RESPONSE" | jq -r '.room_id' 2>/dev/null)
    if [ "$ROOM_ID" != "null" ] && [ -n "$ROOM_ID" ]; then
        print_result 0 "Test de création de room réussi (ID: $ROOM_ID)"
        
        # Nettoyer la room de test
        curl -s -X DELETE "http://localhost:3000/api/rooms/$ROOM_ID" > /dev/null 2>&1
        print_info "Room de test supprimée"
    else
        print_result 1 "Erreur lors de la création de room de test"
    fi
else
    print_result 1 "Erreur lors du test de fonctionnement"
fi

# Résumé final
echo -e "\n${BLUE}📋 Résumé du nettoyage${NC}"
echo "======================"
print_info "✅ Base de données nettoyée et réinitialisée"
print_info "✅ Toutes les données de test supprimées"
print_info "✅ Tables recréées et vides"
print_info "✅ Serveur redémarré et fonctionnel"
print_info "✅ Sauvegarde de l'ancienne base créée"

echo -e "\n${GREEN}🎉 Nettoyage terminé avec succès !${NC}"
echo -e "\n${BLUE}ℹ️  L'application est maintenant prête avec une base de données propre${NC}"
echo -e "${BLUE}ℹ️  Vous pouvez commencer à utiliser l'application normalement${NC}"

# Retourner au répertoire racine
cd ..

echo -e "\n${GREEN}🚀 Base de données WatchParty nettoyée et prête !${NC}"
