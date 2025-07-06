# Correction de l'erreur PanGestureHandler

## Problème
L'erreur suivante apparaissait au démarrage de l'application :
```
ERROR Warning: Error: PanGestureHandler must be used as a descendant of GestureHandlerRootView. Otherwise the gestures will not be recognized.
```

## Cause
Cette erreur se produit lorsque le package `react-native-gesture-handler` n'est pas correctement initialisé dans une application Expo/React Native. Le composant `Swipeable` utilisé pour la suppression des rooms récentes dépend de `PanGestureHandler` qui nécessite une configuration spécifique.

## Solution implémentée

### 1. Import initial dans index.ts
```typescript
import 'react-native-gesture-handler';
import { registerRootComponent } from 'expo';
import App from './App';
```

L'import de `react-native-gesture-handler` **doit être la première ligne** du fichier d'entrée pour initialiser correctement le système de gestes.

### 2. Configuration Babel (babel.config.js)
```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin',
    ],
  };
};
```

Cette configuration garantit que les plugins sont correctement transpilés.

### 3. Wrapper GestureHandlerRootView
Le composant `GestureHandlerRootView` est déjà présent dans `AppNavigator.tsx` :
```typescript
<GestureHandlerRootView style={{ flex: 1 }}>
  <NavigationContainer>
    {/* Navigation Stack */}
  </NavigationContainer>
</GestureHandlerRootView>
```

### 4. Configuration app.json
Aucune configuration de plugin n'est nécessaire dans `app.json` pour Expo SDK 53.

## Validation
Utilisez le script de test pour vérifier la configuration :
```bash
./test-gesture-handler-config.sh
```

## Test fonctionnel
1. Redémarrez le serveur Metro avec cache nettoyé :
   ```bash
   npm start -- --clear
   ```

2. Rechargez l'application sur votre appareil/émulateur

3. Testez le swipe vers la gauche sur les rooms récentes dans la page d'accueil

4. Vérifiez qu'il n'y a plus d'erreur dans la console

## Dépannage
Si le problème persiste :
- Redémarrez complètement l'application
- Nettoyez le cache Metro : `npm start -- --clear`
- Redémarrez l'émulateur/appareil
- Vérifiez que l'import est bien la première ligne de `index.ts`

## Fichiers modifiés
- `mobile/index.ts` : Ajout de l'import react-native-gesture-handler
- `mobile/babel.config.js` : Configuration Babel (créé)
- `mobile/app.json` : Suppression de la configuration plugin incorrecte
- `mobile/test-gesture-handler-config.sh` : Script de test (créé)

## Documentation technique
- [React Native Gesture Handler - Installation](https://docs.swmansion.com/react-native-gesture-handler/docs/installation)
- [Expo - React Native Gesture Handler](https://docs.expo.dev/versions/latest/sdk/gesture-handler/)
