import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Platform,
  SafeAreaView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import { COLORS, SPACING, FONT_SIZES } from '../constants';
import { apiService } from '../services/api';
import { roomHistoryService, RoomHistory } from '../services/roomHistory';
import LoadingScreen from './LoadingScreen';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [roomName, setRoomName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [roomsHistory, setRoomsHistory] = useState<RoomHistory[]>([]);
  const scrollViewRef = React.useRef<ScrollView>(null);

  // Charger l'historique des rooms
  const loadRoomsHistory = async () => {
    try {
      const history = await roomHistoryService.getRoomsHistory();
      setRoomsHistory(history);
    } catch (error) {
      console.error('[HomeScreen] Erreur chargement historique:', error);
    }
  };

  // Charger l'historique au focus de l'écran
  useFocusEffect(
    React.useCallback(() => {
      loadRoomsHistory();
      // Remonter en haut de la liste des rooms récentes
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    }, [])
  );

  const handleCreateRoom = async () => {
    if (!roomName.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer un nom de room');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Creating room with name:', roomName.trim());
      const room = await apiService.createRoom(roomName.trim());
      console.log('Room created successfully:', room);
      
      // Ajouter la room à l'historique
      await roomHistoryService.addRoomToHistory(room);
      
      console.log('Navigating to Room with roomId:', room.room_id);
      navigation.navigate('Room', { roomId: room.room_id, roomName: room.name });
    } catch (error) {
      console.error('Error creating room:', error);
      Alert.alert('Erreur', 'Impossible de créer la room');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!roomCode.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer un code de room');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Joining room with code:', roomCode.trim().toUpperCase());
      const room = await apiService.joinRoom(roomCode.trim().toUpperCase());
      console.log('Room joined successfully:', room);
      
      // Ajouter la room à l'historique
      await roomHistoryService.addRoomToHistory(room);
      
      console.log('Navigating to Room with roomId:', room.room_id);
      navigation.navigate('Room', { roomId: room.room_id, roomName: room.name });
    } catch (error) {
      console.error('Error joining room:', error);
      Alert.alert('Erreur', 'Room non trouvée');
    } finally {
      setIsLoading(false);
    }
  };

  // Rejoindre une room depuis l'historique
  const handleJoinFromHistory = async (roomHistory: RoomHistory) => {
    setIsLoading(true);
    try {
      console.log('Joining room from history:', roomHistory.room_id);
      const room = await apiService.joinRoom(roomHistory.room_id);
      
      // Mettre à jour l'historique avec la nouvelle connexion
      await roomHistoryService.addRoomToHistory(room);
      
      navigation.navigate('Room', { roomId: room.room_id, roomName: room.name });
    } catch (error) {
      console.error('Error joining room from history:', error);
      Alert.alert(
        'Room introuvable',
        'Cette room n\'existe plus. Voulez-vous la supprimer de votre historique ?',
        [
          { text: 'Non', style: 'cancel' },
          { 
            text: 'Supprimer', 
            style: 'destructive',
            onPress: async () => {
              await roomHistoryService.removeRoomFromHistory(roomHistory.room_id);
              loadRoomsHistory();
            }
          }
        ]
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingScreen message="Connexion en cours..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>WatchList</Text>
        <Text style={styles.subtitle}>Partagez vos listes de films, séries et mangas</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Créer une nouvelle room</Text>
          <TextInput
            style={styles.input}
            placeholder="Nom de la room"
            placeholderTextColor={COLORS.placeholder}
            value={roomName}
            onChangeText={setRoomName}
            maxLength={50}
          />
          <TouchableOpacity style={styles.button} onPress={handleCreateRoom}>
            <Text style={styles.buttonText}>Créer</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rejoindre une room</Text>
          <TextInput
            style={styles.input}
            placeholder="Code de la room (ex: ABC123)"
            placeholderTextColor={COLORS.placeholder}
            value={roomCode}
            onChangeText={setRoomCode}
            maxLength={12}
            autoCapitalize="characters"
          />
          <TouchableOpacity style={styles.button} onPress={handleJoinRoom}>
            <Text style={styles.buttonText}>Rejoindre</Text>
          </TouchableOpacity>
        </View>

        {/* Historique des rooms */}
        {roomsHistory.length > 0 && (
          <>
            <View style={styles.divider} />
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Rooms récentes</Text>
                <Text style={styles.sectionCount}>({roomsHistory.length})</Text>
              </View>
              <ScrollView
                ref={scrollViewRef}
                style={styles.historyScrollView}
                contentContainerStyle={styles.historyScrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                nestedScrollEnabled={true}
              >
                {roomsHistory.map((item, index) => (
                  <TouchableOpacity
                    key={item.room_id}
                    style={styles.historyItem}
                    onPress={() => handleJoinFromHistory(item)}
                    activeOpacity={0.7}
                    android_ripple={{ color: COLORS.primary + '20' }}
                  >
                    <View style={styles.historyContent}>
                      <View style={styles.historyHeader}>
                        <Text style={styles.historyRoomName}>
                          {item.name || `Room ${index + 1}`}
                        </Text>
                        <View style={styles.historyRoomBadge}>
                          <Text style={styles.historyRoomCode}>{item.room_id}</Text>
                        </View>
                      </View>
                      <Text style={styles.historyLastJoined}>
                        Dernière connexion: {new Date(item.last_joined).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </Text>
                    </View>
                    <View style={styles.historyArrow}>
                      <Text style={styles.historyArrowText}>›</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    padding: SPACING.lg,
  },
  historyScrollView: {
    maxHeight: 350, // Augmenter légèrement la hauteur maximale
    marginBottom: SPACING.md, // Ajouter une marge en bas du ScrollView
  },
  historyScrollContent: {
    paddingBottom: SPACING.xl, // Plus d'espace en bas pour la dernière room
  },
  title: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.onBackground,
    textAlign: 'center',
    marginBottom: SPACING.xxl,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.onBackground,
    marginBottom: SPACING.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  sectionCount: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.placeholder,
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.onSurface,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    padding: SPACING.md,
    alignItems: 'center',
  },
  buttonText: {
    color: COLORS.onPrimary,
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.xl,
  },
  historyItem: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  historyContent: {
    flex: 1,
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  historyRoomName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.onSurface,
    minHeight: 24,
    flex: 1,
  },
  historyRoomBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs / 2,
    marginLeft: SPACING.sm,
  },
  historyRoomCode: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.onPrimary,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  historyLastJoined: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.placeholder,
    fontStyle: 'italic',
  },
  historyArrow: {
    marginLeft: SPACING.sm,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyArrowText: {
    fontSize: FONT_SIZES.xl,
    color: COLORS.placeholder,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
