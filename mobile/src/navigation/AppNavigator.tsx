import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { MaterialIcons } from '@expo/vector-icons';
import { View, Text, ActivityIndicator } from 'react-native';

import { COLORS } from '../constants';
import { RootStackParamList, TabParamList } from '../types';

// Screens
import HomeScreen from '../screens/HomeScreen';
import RoomScreen from '../screens/RoomScreen';
import SearchScreen from '../screens/SearchScreen';
import DetailScreen from '../screens/DetailScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

// Component de chargement
function LoadingScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      <Text style={{ color: COLORS.onSurface, marginTop: 16 }}>Chargement...</Text>
    </View>
  );
}

// Navigation principale avec tabs (dans une room)
function MainTabNavigator({ route }: { route: any }) {
  const { roomId } = route.params;

  console.log('MainTabNavigator: roomId =', roomId);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof MaterialIcons.glyphMap;

          switch (route.name) {
            case 'RoomTab':
              iconName = 'list';
              break;
            case 'SearchTab':
              iconName = 'search';
              break;
            case 'SettingsTab':
              iconName = 'settings';
              break;
            default:
              iconName = 'help';
          }

          return <MaterialIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.placeholder,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
        },
      })}
    >
      <Tab.Screen
        name="RoomTab"
        component={RoomScreen}
        initialParams={{ roomId }}
        options={{
          tabBarLabel: 'Watchlist',
        }}
      />
      <Tab.Screen
        name="SearchTab"
        component={SearchScreen}
        initialParams={{ roomId }}
        options={{
          tabBarLabel: 'Recherche',
        }}
      />
      <Tab.Screen
        name="SettingsTab"
        component={SettingsScreen}
        initialParams={{ roomId }}
        options={{
          tabBarLabel: 'Paramètres',
        }}
      />
    </Tab.Navigator>
  );
}

// Navigation principale de l'application
export function AppNavigator() {
  console.log('AppNavigator: Starting navigation...');
  
  try {
    console.log('AppNavigator: Creating NavigationContainer...');
    return (
      <NavigationContainer
        fallback={<LoadingScreen />}
        onStateChange={(state) => {
          console.log('AppNavigator: Navigation state changed', state);
        }}
      >
        <Stack.Navigator
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
              headerStyle: {
                backgroundColor: COLORS.primary,
              },
              headerTintColor: COLORS.onPrimary,
            }}
          />
          <Stack.Screen
            name="Room"
            component={MainTabNavigator}
            options={({ route }) => ({
              title: `Room ${(route.params as any)?.roomId}`,
              headerShown: false,
            })}
          />
          <Stack.Screen
            name="Detail"
            component={DetailScreen}
            options={{
              title: 'Détails',
              presentation: 'modal',
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
  } catch (error) {
    console.error('AppNavigator: Error creating navigation:', error);
    return <LoadingScreen />;
  }
}

export default AppNavigator;
