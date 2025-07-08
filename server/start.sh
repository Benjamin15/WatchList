#!/bin/bash

# Script de démarrage pour le serveur WatchParty

echo "🚀 Démarrage du serveur WatchParty..."

# Vérification que les dépendances sont installées
if [ ! -d "node_modules" ]; then
    echo "📦 Installation des dépendances..."
    npm install
fi

# Vérification que la base de données existe
if [ ! -f "prisma/dev.db" ]; then
    echo "🗄️  Création de la base de données..."
    npx prisma migrate deploy
fi

# Génération du client Prisma
echo "🔧 Génération du client Prisma..."
npx prisma generate

# Démarrage du serveur
echo "🌟 Serveur démarré sur http://localhost:3000"
echo "📚 API Documentation disponible dans le README.md"
echo "🧪 Testez l'API avec: curl http://localhost:3000/api/health"
echo ""
echo "Pour arrêter le serveur, utilisez Ctrl+C"
echo ""

npm start
