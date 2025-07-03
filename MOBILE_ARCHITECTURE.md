# Architecture Mobile - WatchList

## Vue d'ensemble

L'application mobile WatchList est développée en React Native avec TypeScript, offrant une expérience native sur iOS et Android pour la gestion collaborative de watchlists.

## Structure du projet

```
mobile/
├── src/
│   ├── components/          # Composants réutilisables
│   │   ├── MediaCard.tsx   # Carte d'affichage des médias
│   │   ├── FilterTabs.tsx  # Système de filtres
│   │   └── index.ts        # Exports des composants
│   ├── screens/            # Écrans principaux
│   │   ├── HomeScreen.tsx  # Écran d'accueil (création/join room)
│   │   ├── RoomScreen.tsx  # Affichage de la watchlist
│   │   ├── SearchScreen.tsx # Recherche de médias
│   │   ├── DetailScreen.tsx # Détails d'un média
│   │   └── SettingsScreen.tsx # Paramètres et infos room
│   ├── navigation/         # Configuration navigation
│   │   └── AppNavigator.tsx # Navigation principale
│   ├── services/          # Services et logique métier
│   │   ├── api.ts         # Service API principal
│   │   └── mockData.ts    # Données de test
│   ├── types/             # Définitions TypeScript
│   │   └── index.ts       # Types partagés
│   ├── constants/         # Constantes et configuration
│   │   ├── index.ts       # Constantes principales
│   │   └── config.ts      # Configuration environnement
│   └── utils/             # Utilitaires
│       └── index.ts       # Fonctions helper
├── App.tsx                # Point d'entrée de l'app
├── start.sh              # Script de démarrage
└── README.md             # Documentation mobile
```

## Écrans et Navigation

### Structure de navigation

```
NavigationContainer
└── Stack Navigator (Principal)
    ├── Home (Écran d'accueil)
    ├── Room (Navigation par onglets)
    │   ├── Tab: Watchlist (RoomScreen)
    │   ├── Tab: Recherche (SearchScreen)
    │   └── Tab: Paramètres (SettingsScreen)
    └── Detail (Modal)
```

### Écrans détaillés

#### 1. HomeScreen
- **Fonction**: Point d'entrée de l'application
- **Fonctionnalités**:
  - Création de nouvelles rooms
  - Rejoindre une room existante via code
  - Validation des entrées utilisateur
  - Gestion des erreurs

#### 2. RoomScreen (Watchlist)
- **Fonction**: Affichage et gestion de la watchlist
- **Fonctionnalités**:
  - Liste des médias avec affiches
  - Filtres par type (films/séries/manga) et statut
  - Actions rapides (changer statut, supprimer)
  - Pull-to-refresh
  - Navigation vers détails

#### 3. SearchScreen
- **Fonction**: Recherche et ajout de nouveaux médias
- **Fonctionnalités**:
  - Recherche en temps réel avec debounce
  - Filtres par type de média
  - Affichage des résultats avec affiches
  - Ajout direct à la watchlist
  - Navigation vers détails

#### 4. DetailScreen
- **Fonction**: Affichage détaillé d'un média
- **Fonctionnalités**:
  - Informations complètes (titre, année, genre, note, description)
  - Affichage du statut actuel (si dans la watchlist)
  - Action d'ajout à la watchlist (si pas encore ajouté)
  - Interface en modal

#### 5. SettingsScreen
- **Fonction**: Paramètres et informations de la room
- **Fonctionnalités**:
  - Informations de la room (nom, code, date de création)
  - Partage de la room
  - Copie du code de la room
  - Quitter la room
  - Actions générales (à propos, aide)

## Architecture technique

### Services

#### ApiService
- **Localisation**: `src/services/api.ts`
- **Responsabilité**: Communication avec le backend
- **Fonctionnalités**:
  - Gestion des requêtes HTTP avec Axios
  - Gestion des erreurs et timeouts
  - Intercepteurs pour logging/debug
  - Support des données de test (développement)

#### MockService
- **Localisation**: `src/services/mockData.ts`
- **Responsabilité**: Données de test pour développement
- **Utilité**: Développement sans backend disponible

### Gestion d'état

- **Approche**: React hooks + Context API (pas de Redux)
- **État local**: useState pour l'état des composants
- **État partagé**: Context API si nécessaire (actuellement non utilisé)
- **Cache**: Pas de cache persistant (données rechargées à chaque navigation)

### Types TypeScript

#### Types principaux
```typescript
// Média (film, série, manga)
interface Media {
  id: number;
  title: string;
  type: 'movie' | 'series' | 'manga';
  year?: number;
  genre?: string;
  description?: string;
  posterUrl?: string;
  rating?: number;
  // ...
}

// Room collaborative
interface Room {
  id: number;
  name: string;
  code: string;
  createdAt: string;
  updatedAt: string;
}

// Item de watchlist
interface WatchlistItem {
  id: number;
  roomId: number;
  mediaId: number;
  status: 'watching' | 'completed' | 'planned' | 'dropped';
  addedAt: string;
  media: Media;
}
```

### Styling

#### Approche
- **StyleSheet API**: Styles natifs React Native
- **Thème centralisé**: Couleurs et espacements dans `constants/`
- **Design System**: Constantes pour cohérence visuelle
- **Responsive**: Adaptation aux différentes tailles d'écran

#### Couleurs (Dark theme)
```typescript
const COLORS = {
  primary: '#6200EE',
  secondary: '#03DAC6',
  background: '#121212',
  surface: '#1E1E1E',
  error: '#CF6679',
  // ...
}
```

## Dépendances principales

### Navigation
- `@react-navigation/native`: Navigation de base
- `@react-navigation/stack`: Navigation en pile
- `@react-navigation/bottom-tabs`: Navigation par onglets

### UI/UX
- `react-native-paper`: Composants Material Design
- `react-native-vector-icons`: Icônes
- `react-native-gesture-handler`: Gestes et interactions

### HTTP/API
- `axios`: Requêtes HTTP
- Gestion automatique des erreurs et timeouts

### Autres
- `react-native-screens`: Optimisation des écrans
- `react-native-safe-area-context`: Gestion des zones sûres

## Configuration et déploiement

### Développement
1. **Serveur de développement**: Metro bundler
2. **Hot reload**: Rechargement automatique du code
3. **Debugging**: React Native Debugger + Chrome DevTools

### Configuration environnement
- **Backend URL**: Configurable via `constants/config.ts`
- **Mode debug**: Variables d'environnement pour logs
- **Données de test**: Basculement facile via flag

### Build et déploiement

#### iOS
1. Ouvrir dans Xcode
2. Configuration des certificats
3. Archive et distribution

#### Android
1. `cd android && ./gradlew assembleRelease`
2. APK générée dans `android/app/build/outputs/apk/release/`

## Améliorations futures

### Court terme
- [ ] Intégration complète avec le backend
- [ ] Configuration des icônes natives
- [ ] Tests unitaires et d'intégration
- [ ] Gestion de l'état hors ligne

### Moyen terme
- [ ] Notifications push
- [ ] Synchronisation en temps réel
- [ ] Cache persistant (AsyncStorage)
- [ ] Thèmes multiples (clair/sombre)

### Long terme
- [ ] Mode hors ligne complet
- [ ] Partage social
- [ ] Statistiques de visionnage
- [ ] Recommandations personnalisées
