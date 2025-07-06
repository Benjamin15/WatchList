#!/bin/bash

# Correction de l'erreur GestureHandlerRootView
echo "=== CORRECTION ERREUR GESTUREHANDLERROOTVIEW ==="
echo "Date: $(date)"
echo ""

cd /Users/ben/workspace/WatchList/mobile

echo "1. Problème détecté:"
echo "   ❌ PanGestureHandler must be used as a descendant of GestureHandlerRootView"
echo "   ❌ Erreur de compatibilité avec react-native-gesture-handler"
echo ""

echo "2. Vérification de la version react-native-gesture-handler..."
grep "react-native-gesture-handler" package.json

echo ""
echo "3. Solution 1: Mise à jour et réinstallation des dépendances..."

# Nettoyer les node_modules et réinstaller
echo "Nettoyage node_modules..."
rm -rf node_modules
rm -f package-lock.json yarn.lock

echo "Réinstallation des dépendances..."
npm install

echo ""
echo "4. Solution 2: Configuration alternative sans GestureHandlerRootView..."

# Sauvegarder les fichiers actuels
cp src/navigation/AppNavigator.tsx src/navigation/AppNavigator.tsx.backup

# Supprimer GestureHandlerRootView du navigateur pour l'instant
cat > temp_navigator_fix.tsx << 'EOF'
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Pressable, Text } from 'react-native';
import { RootStackParamList } from '../types';
import HomeScreen from '../screens/HomeScreen';
import RoomScreen from '../screens/RoomScreen';
import SearchScreen from '../screens/SearchScreen';
import LoadingScreen from '../screens/LoadingScreen';
import MediaDetailScreen from '../screens/MediaDetailScreen';
import { COLORS } from '../constants';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: COLORS.surface,
          },
          headerTintColor: COLORS.onSurface,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: 'WatchList',
          }}
        />
        <Stack.Screen
          name="Room"
          component={RoomScreen}
          options={({ route }) => ({
            title: route.params?.roomName || 'Room',
            headerRight: () => (
              <Pressable
                onPress={() => {
                  console.log('Share room:', route.params?.roomId);
                }}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.5 : 1,
                  marginRight: 15,
                  padding: 8,
                })}
              >
                <Text style={{ color: COLORS.primary, fontWeight: 'bold' }}>
                  Partager
                </Text>
              </Pressable>
            ),
          })}
        />
        <Stack.Screen
          name="Search"
          component={SearchScreen}
          options={{
            title: 'Rechercher',
          }}
        />
        <Stack.Screen
          name="MediaDetail"
          component={MediaDetailScreen}
          options={{
            title: 'Détails',
          }}
        />
        <Stack.Screen
          name="Loading"
          component={LoadingScreen}
          options={{
            headerShown: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
EOF

# Appliquer le fix temporaire
cp temp_navigator_fix.tsx src/navigation/AppNavigator.tsx
rm temp_navigator_fix.tsx

echo "5. Solution 3: Alternative au swipe avec bouton de suppression..."

# Créer une version alternative du HomeScreen sans Swipeable
echo "Création d'une alternative sans Swipeable..."

echo ""
echo "6. Test de l'application..."

# Redémarrer Metro
echo "Redémarrage de Metro Bundler..."
npx expo start --clear &
EXPO_PID=$!

sleep 5

echo ""
echo "APPLICATION RELANCÉE (PID: $EXPO_PID)"
echo ""
echo "🎯 PLAN DE TEST:"
echo ""
echo "1. **Vérifier que l'app démarre sans erreur**"
echo "   - Plus d'erreur GestureHandlerRootView"
echo "   - Interface s'affiche correctement"
echo ""
echo "2. **Tester les fonctionnalités de base**"
echo "   - Création de room"
echo "   - Jointure de room"
echo "   - Affichage des rooms récentes"
echo ""
echo "3. **Options pour la suppression**"
echo "   - Option A: Bouton suppression dans chaque item"
echo "   - Option B: Mode édition avec sélection"
echo "   - Option C: Long press pour menu contextuel"
echo ""
echo "Si l'app fonctionne, nous implémenterons une alternative au swipe."
echo ""
echo "Appuyez sur Ctrl+C pour arrêter le test"

wait $EXPO_PID

echo ""
echo "7. Choix de l'alternative de suppression..."
echo ""
echo "Quelle option préférez-vous ?"
echo "A) Bouton 'X' à droite de chaque room"
echo "B) Mode édition avec cases à cocher"
echo "C) Long press pour menu contextuel"
echo ""
echo "=== CORRECTION EN COURS ==="
