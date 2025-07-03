# WatchList Mobile

Application mobile React Native pour la gestion collaborative de watchlists de films, séries et mangas.

## Installation

1. Installer les dépendances :
```bash
npm install
```

2. Pour iOS, installer les CocoaPods :
```bash
cd ios && pod install
```

3. Configurer les icônes (optionnel) :
```bash
npx react-native link react-native-vector-icons
```

## Démarrage

### iOS
```bash
npx react-native run-ios
```

### Android
```bash
npx react-native run-android
```

## Architecture

### Structure des dossiers

```
src/
├── components/       # Composants réutilisables
├── screens/         # Écrans de l'application
├── navigation/      # Configuration de la navigation
├── services/        # Services API et logique métier
├── types/          # Définitions TypeScript
├── constants/      # Constantes et configuration
└── utils/          # Fonctions utilitaires
```

### Technologies utilisées

- **React Native** : Framework mobile
- **TypeScript** : Typage statique
- **React Navigation** : Navigation entre écrans
- **React Native Paper** : Composants UI Material Design
- **React Native Vector Icons** : Icônes
- **Axios** : Requêtes HTTP
- **React Native Gesture Handler** : Gestion des gestes

## Fonctionnalités

### Écrans principaux

1. **Home** : Création et accès aux rooms
2. **Room** : Affichage de la watchlist avec filtres
3. **Search** : Recherche de médias avec filtres
4. **Detail** : Détails d'un média
5. **Settings** : Paramètres et informations de la room

### Fonctionnalités clés

- Création et rejoindre des rooms sans authentification
- Gestion collaborative de watchlists
- Recherche de films, séries et mangas
- Filtres par type et statut
- Gestion des statuts (en cours, terminé, prévu, abandonné)
- Interface responsive et moderne

## Configuration

### Backend API

L'application se connecte au backend Express.js sur `http://localhost:3000/api`.

Pour modifier l'URL du backend, éditer le fichier `src/constants/index.ts` :

```typescript
export const API_BASE_URL = 'http://your-backend-url/api';
```

### Thème

Les couleurs et styles sont définis dans `src/constants/index.ts` et peuvent être personnalisés.

## Développement

### Scripts disponibles

- `npm start` : Démarrer Metro bundler
- `npm run android` : Lancer sur Android
- `npm run ios` : Lancer sur iOS
- `npm run lint` : Vérifier le code avec ESLint
- `npm run tsc` : Vérifier les types TypeScript

### Débogage

- Ouvrir le menu développeur : `Cmd+D` (iOS) ou `Cmd+M` (Android)
- Utiliser React Native Debugger ou Chrome DevTools
- Logs disponibles dans Metro bundler

## Déploiement

### iOS

1. Ouvrir le projet dans Xcode
2. Configurer les certificats de développement
3. Archiver et distribuer via App Store Connect

### Android

1. Générer une APK de release :
```bash
cd android && ./gradlew assembleRelease
```

2. L'APK sera disponible dans `android/app/build/outputs/apk/release/`

## Contribuer

1. Fork le projet
2. Créer une branche pour votre fonctionnalité
3. Commiter vos modifications
4. Pousser vers la branche
5. Créer une Pull Request

## Licence

Ce projet est sous licence MIT.

## Step 1: Start Metro

First, you will need to run **Metro**, the JavaScript build tool for React Native.

To start the Metro dev server, run the following command from the root of your React Native project:

```sh
# Using npm
npm start

# OR using Yarn
yarn start
```

## Step 2: Build and run your app

With Metro running, open a new terminal window/pane from the root of your React Native project, and use one of the following commands to build and run your Android or iOS app:

### Android

```sh
# Using npm
npm run android

# OR using Yarn
yarn android
```

### iOS

For iOS, remember to install CocoaPods dependencies (this only needs to be run on first clone or after updating native deps).

The first time you create a new project, run the Ruby bundler to install CocoaPods itself:

```sh
bundle install
```

Then, and every time you update your native dependencies, run:

```sh
bundle exec pod install
```

For more information, please visit [CocoaPods Getting Started guide](https://guides.cocoapods.org/using/getting-started.html).

```sh
# Using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up correctly, you should see your new app running in the Android Emulator, iOS Simulator, or your connected device.

This is one way to run your app — you can also build it directly from Android Studio or Xcode.

## Step 3: Modify your app

Now that you have successfully run the app, let's make changes!

Open `App.tsx` in your text editor of choice and make some changes. When you save, your app will automatically update and reflect these changes — this is powered by [Fast Refresh](https://reactnative.dev/docs/fast-refresh).

When you want to forcefully reload, for example to reset the state of your app, you can perform a full reload:

- **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Dev Menu**, accessed via <kbd>Ctrl</kbd> + <kbd>M</kbd> (Windows/Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (macOS).
- **iOS**: Press <kbd>R</kbd> in iOS Simulator.

## Congratulations! :tada:

You've successfully run and modified your React Native App. :partying_face:

### Now what?

- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).
- If you're curious to learn more about React Native, check out the [docs](https://reactnative.dev/docs/getting-started).

# Troubleshooting

If you're having issues getting the above steps to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

# Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.
