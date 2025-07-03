# WatchList

Application mobile collaborative de gestion de watchlist (films, séries, manga) avec backend Node.js.

## Description

WatchList est une application qui permet de créer et partager des listes de films, séries et manga à regarder/lire. Les utilisateurs peuvent créer des "rooms" accessibles par ID unique, ajouter des contenus via recherche (APIs TMDB et MyAnimeList), et suivre leur progression.

## Architecture

### Backend (API REST)
- **Localisation**: `./server/`
- **Technologie**: Node.js + Express.js
- **Base de données**: SQLite + Prisma ORM
- **APIs externes**: TMDB (films/séries), MyAnimeList (manga)
- **Tests**: Jest + Supertest (88.78% de couverture)

### Frontend (Mobile) - À venir
- **Technologie prévue**: React Native ou Flutter
- **Localisation**: `./mobile/` (à créer)

## Fonctionnalités

✅ **Implémentées (Backend)**:
- Création de rooms sans authentification
- Gestion des items (films, séries, manga)
- Recherche mixte (locale + APIs externes)
- Statuts de progression (à voir, en cours, vu)
- API REST complète

🔄 **En développement**:
- Application mobile
- Interface utilisateur

## Démarrage rapide

### Prérequis
- Node.js 18+
- npm ou yarn

### Installation et lancement du backend
```bash
cd server
npm install
npm start
```

Le serveur sera disponible sur `http://localhost:3000`

### Tests
```bash
cd server
npm test
```

## Documentation

- [Backend API Documentation](./server/API.md)
- [Backend Setup](./server/README.md)

## Structure du projet

```
WatchList/
├── server/          # Backend API REST
│   ├── src/         # Code source
│   ├── tests/       # Tests
│   ├── prisma/      # Schéma et migrations DB
│   └── README.md    # Documentation backend
└── mobile/          # Application mobile (à venir)
```

## Contribuer

1. Fork le projet
2. Créez une branche pour votre fonctionnalité
3. Commitez vos changements
4. Push vers la branche
5. Ouvrez une Pull Request

## Licence

MIT License - voir le fichier LICENSE pour plus de détails.

## Contact

Benjamin - [GitHub](https://github.com/Benjamin15)

Lien du projet: [https://github.com/Benjamin15/WatchList](https://github.com/Benjamin15/WatchList)
