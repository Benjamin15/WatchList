import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { render, RenderOptions } from '@testing-library/react-native';
import { Alert, View, Text } from 'react-native';

import HomeScreen from '../src/screens/HomeScreen';
import RoomScreen from '../src/screens/RoomScreen';
import { RootStackParamList } from '../src/types';

// Mock Alert
jest.spyOn(Alert, 'alert').mockImplementation(() => {});

// Mock des écrans manquants
const MockSearchScreen = () => <View><Text>Rechercher</Text></View>;
const MockDetailScreen = () => <View><Text>Détails</Text></View>;
const MockSettingsScreen = () => <View><Text>Paramètres</Text></View>;

const Stack = createStackNavigator<RootStackParamList>();

// Composant de test avec navigation complète
export const TestNavigator: React.FC<{ initialRouteName?: keyof RootStackParamList }> = ({ 
  initialRouteName = 'Home' 
}) => {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName={initialRouteName}
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Room" component={RoomScreen} />
        <Stack.Screen name="Search" component={MockSearchScreen} />
        <Stack.Screen name="Detail" component={MockDetailScreen} />
        <Stack.Screen name="Settings" component={MockSettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// Wrapper avec tous les providers nécessaires
export const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <SafeAreaProvider>
      {children}
    </SafeAreaProvider>
  );
};

// Fonction de rendu avec providers
export const renderWithProviders = (
  component: React.ReactElement,
  options?: RenderOptions
) => {
  return render(
    <TestWrapper>
      {component}
    </TestWrapper>,
    options
  );
};

// Fonction de rendu avec navigation complète
export const renderWithNavigation = (
  initialRouteName: keyof RootStackParamList = 'Home',
  options?: RenderOptions
) => {
  // Créer un composant simple pour tester directement l'écran
  const TestScreen = () => {
    switch (initialRouteName) {
      case 'Room':
        return <RoomScreen />;
      case 'Search':
        return <MockSearchScreen />;
      case 'Detail':
        return <MockDetailScreen />;
      case 'Settings':
        return <MockSettingsScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return render(
    <TestWrapper>
      <TestScreen />
    </TestWrapper>,
    options
  );
};

// Fonction de rendu simple sans PaperProvider pour les tests unitaires
export const renderWithSimpleProvider = (
  component: React.ReactElement,
  options?: RenderOptions
) => {
  return render(
    <SafeAreaProvider>
      {component}
    </SafeAreaProvider>,
    options
  );
};

// Données de test mock
export const mockData = {
  room: {
    id: 1,
    name: 'Test Room',
    room_id: 'ABCD1234',
    created_at: new Date().toISOString(),
  },
  
  media: {
    id: 1,
    title: 'Test Movie',
    type: 'movie' as const,
    year: 2023,
    genre: 'Action',
    description: 'Test description',
    posterUrl: '/test-poster.jpg',
    rating: 8.5,
    status: 'planned' as const,
  },
  
  watchlistItem: {
    id: 1,
    roomId: 1,
    mediaId: 1,
    media: {
      id: 1,
      title: 'Test Movie',
      type: 'movie' as const,
      year: 2023,
      genre: 'Action',
      description: 'Test description',
      posterUrl: '/test-poster.jpg',
      rating: 8.5,
      status: 'planned' as const,
    },
    status: 'planned' as const,
    addedAt: new Date().toISOString(),
  },
};

// Utilitaires pour les tests
export const testUtils = {
  // Attendre un délai
  wait: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),
  
  // Nettoyer les mocks
  clearMocks: () => {
    jest.clearAllMocks();
  },
  
  // Mock des fonctions de navigation
  mockNavigation: {
    navigate: jest.fn(),
    goBack: jest.fn(),
    reset: jest.fn(),
    dispatch: jest.fn(),
    setOptions: jest.fn(),
    isFocused: jest.fn(() => true),
  },
  
  // Mock des paramètres de route
  mockRoute: {
    params: {},
    name: 'Home',
    key: 'Home-key',
  },
};
