import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TouchableOpacity, Text, Share, Alert } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { RootStackParamList } from '../types';
import HomeScreen from '../screens/HomeScreen';
import RoomScreen from '../screens/RoomScreen';
import SearchScreen from '../screens/SearchScreen';
import LoadingScreen from '../screens/LoadingScreen';
import MediaDetailScreen from '../screens/MediaDetailScreen';
import CreateVoteScreen from '../screens/CreateVoteScreen';
import VoteDetailScreen from '../screens/VoteDetailScreen';
import { COLORS } from '../constants';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
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
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Room"
          component={RoomScreen}
          options={({ route, navigation }) => ({
            title: route.params?.roomName || 'Room',
            headerRight: () => (
              <TouchableOpacity
                style={{
                  width: 40,
                  height: 40,
                  backgroundColor: 'rgba(0, 0, 0, 0.05)',
                  borderRadius: 20,
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: 'rgba(0, 0, 0, 0.1)',
                }}
                onPress={() => {
                  // Fonction de partage depuis les paramètres de route
                  const { roomId, roomName } = route.params || {};
                  if (roomId && roomName) {
                    const shareContent = {
                      title: 'Rejoignez ma WatchList !',
                      message: `🎬 Rejoignez ma room "${roomName}" !\n\nCode d'accès : ${roomId}\n\nPartagez et découvrez des films et séries ensemble ! 🍿`,
                      url: `watchlist://room/${roomId}`,
                    };
                    
                    Share.share(shareContent).catch((error) => {
                      console.error('Erreur lors du partage:', error);
                      Alert.alert('Erreur', 'Impossible de partager la room');
                    });
                  }
                }}
              >
                <Text style={{ fontSize: 18 }}>📤</Text>
              </TouchableOpacity>
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
            title: 'Détails du vote',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
    </GestureHandlerRootView>
  );
};

export default AppNavigator;
