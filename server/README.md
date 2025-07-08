# WatchParty Server

Serveur pour l'application WatchParty - Gestionnaire de listes de films, séries et manga collaboratif.

## Fonctionnalités

- 🏠 **Système de Room** - Créer et partager des listes via un ID unique
- 🎬 **Gestion des contenus** - Ajouter films, séries et manga
- 📱 **Statuts** - À voir, En cours, Vu
- 🔍 **Recherche intelligente** - Recherche locale + APIs externes (TMDB, MyAnimeList)
- 🤝 **Collaboration** - Partage et édition collaborative
- 🗄️ **Base de données** - SQLite avec Prisma ORM

## Installation

```bash
# Installer les dépendances
npm install

# Générer le client Prisma
npm run prisma:generate

# Migrer la base de données
npm run prisma:migrate

# Démarrer le serveur
npm run dev
```

## Variables d'environnement

Créer un fichier `.env` avec :

```env
NODE_ENV=development
PORT=3000
DATABASE_URL="file:./dev.db"
TMDB_API_KEY=your_tmdb_api_key_here
MAL_CLIENT_ID=your_mal_client_id_here
```

## Scripts

- `npm start` - Démarrer le serveur
- `npm run dev` - Démarrer en mode développement
- `npm test` - Lancer les tests
- `npm run test:coverage` - Tests avec couverture
- `npm run prisma:studio` - Interface graphique de la base de données

## API Endpoints

### Rooms
- `POST /api/rooms` - Créer une room
- `GET /api/rooms/:roomId` - Infos de la room
- `GET /api/rooms/:roomId/items` - Liste des items

### Items
- `POST /api/items/rooms/:roomId/items` - Ajouter un item
- `PUT /api/items/rooms/:roomId/items/:itemId/status` - Modifier le statut
- `DELETE /api/items/rooms/:roomId/items/:itemId` - Supprimer de la room
- `GET /api/items/:itemId` - Détails d'un item

### Recherche
- `GET /api/search/autocomplete/:type/:query` - Recherche autocomplete

### Santé
- `GET /api/health` - Status du serveur

## Tests

Le projet inclut une suite de tests complète avec :

- Tests unitaires pour tous les services
- Tests d'intégration pour tous les endpoints
- Tests des cas limites (edge cases)
- Couverture de code > 95%

```bash
# Lancer tous les tests
npm test

# Tests avec couverture
npm run test:coverage

# Tests en mode watch
npm run test:watch
```

## Structure du projet

```
server/
├── src/
│   ├── controllers/     # Logique métier
│   ├── services/        # Services externes
│   ├── routes/         # Définition des routes
│   ├── utils/          # Utilitaires
│   └── app.js          # Application Express
├── tests/
│   ├── controllers/    # Tests des contrôleurs
│   ├── services/       # Tests des services
│   ├── utils/          # Tests des utilitaires
│   └── integration/    # Tests d'intégration
├── prisma/
│   └── schema.prisma   # Schéma de base de données
└── package.json
```

## Base de données

Le projet utilise SQLite avec Prisma ORM pour la simplicité. La migration vers PostgreSQL est possible facilement.

### Modèles

- **Room** - Salles de collaboration
- **Item** - Films, séries, manga
- **ItemInRoom** - Relation many-to-many

## APIs externes

- **TMDB** - The Movie Database pour films et séries
- **MyAnimeList** - Pour les manga

## Développement

Le serveur est conçu pour être simple à développer et maintenir :

- Architecture modulaire
- Gestion d'erreurs robuste
- Logging détaillé
- Validation des données
- Sécurité (CORS, Helmet)

## Déploiement

Le serveur peut être déployé sur n'importe quelle plateforme Node.js :

- Heroku
- Railway
- Vercel
- DigitalOcean
- AWS

Pour la production, il est recommandé de passer à PostgreSQL.
