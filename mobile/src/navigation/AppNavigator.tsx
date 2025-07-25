import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useTranslation } from 'react-i18next';
import { RootStackParamList } from '../types';
import HomeScreen from '../screens/HomeScreen';
import RoomScreen from '../screens/RoomScreen';
import SearchScreen from '../screens/SearchScreen';
import LoadingScreen from '../screens/LoadingScreen';
import MediaDetailScreen from '../screens/MediaDetailScreen';
import CreateVoteScreen from '../screens/CreateVoteScreen';
import VoteDetailScreen from '../screens/VoteDetailScreen';
import { COLORS } from '../constants';
import { useTheme } from '../contexts/ThemeContext';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.surface,
          },
          headerTintColor: theme.onSurface,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: 'WatchParty',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Room"
          component={RoomScreen}
          options={({ route }) => ({
            title: route.params?.roomName || 'Room',
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
          name="Detail"
          component={MediaDetailScreen}
          options={{
            title: 'Détails',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Loading"
          component={LoadingScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="CreateVote"
          component={CreateVoteScreen}
          options={{
            title: 'Créer un vote',
          }}
        />
        <Stack.Screen
          name="VoteDetail"
          component={VoteDetailScreen}
          options={{
            title: t('vote.voteDetails'),
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
    </GestureHandlerRootView>
  );
};

export default AppNavigator;
