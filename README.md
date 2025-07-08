# WatchParty

Application mobile collaborative de gestion de WatchParty (films, séries, manga) avec backend Node.js.

## Description

WatchParty est une application qui permet de créer et partager des listes de films, séries et manga à regarder/lire. Les utilisateurs peuvent créer des "rooms" accessibles par ID unique, ajouter des contenus via recherche (APIs TMDB et MyAnimeList), et suivre leur progression.

## Architecture

### Backend (API REST)
- **Localisation**: `./server/`
- **Technologie**: Node.js + Express.js
- **Base de données**: SQLite + Prisma ORM
- **APIs externes**: TMDB (films/séries), MyAnimeList (manga)
- **Tests**: Jest + Supertest (88.78% de couverture)

### Frontend (Mobile)
- **Localisation**: `./mobile/`
- **Technologie**: React Native + TypeScript
- **Navigation**: React Navigation v6
- **UI**: React Native Paper + Vector Icons
- **State management**: React hooks + Context API

## Fonctionnalités

✅ **Implémentées**:
- **Backend**: API REST complète avec tests
- **Mobile**: Application React Native fonctionnelle avec images
- Création de rooms sans authentification
- Gestion des items (films, séries, manga)
- Recherche mixte (locale + APIs externes)
- Statuts de progression (à voir, en cours, vu, abandonné)
- Navigation par onglets et filtres
- Interface moderne et responsive
- **🖼️ Images réelles** : Affiches/posters au lieu d'emojis
- **Fallback robuste** : Système de fallback emoji si image indisponible
- **Intégration TMDB** : Images haute qualité pour films/séries
- **Swipe statut** : Déplacement des médias entre sections par swipe

🔄 **En développement**:
- Cache d'images pour améliorer les performances
- Optimisation de la qualité d'affichage
- Gestion offline des images

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

### Installation et lancement du mobile
```bash
cd mobile
npm install
npm start

# Ou utiliser Expo
npx expo start
```

### Tests
```bash
cd server
npm test

# Test d'intégration backend/mobile
./test-integration.sh

# Test d'intégration des images
./test-images.sh
```

## Documentation

- [Backend API Documentation](./server/API.md)
- [Backend Setup](./server/README.md)
- [🖼️ Image Integration](./IMAGE_INTEGRATION.md)
- [📱 Guide de Test Images](./GUIDE_TEST_IMAGES.md)
- [Integration Complete](./INTEGRATION_COMPLETE.md)
- [Integration Test Guide](./INTEGRATION_TEST_GUIDE.md)

## Structure du projet

```
WatchParty/
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

Lien du projet: [https://github.com/Benjamin15/WatchParty](https://github.com/Benjamin15/WatchParty)
