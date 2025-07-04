import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import { COLORS, SPACING, FONT_SIZES } from '../constants';
import { apiService } from '../services/api';
import LoadingScreen from './LoadingScreen';

type RoomScreenRouteProp = RouteProp<RootStackParamList, 'Room'>;

interface RoomScreenProps {
  route: RoomScreenRouteProp;
}

const RoomScreen: React.FC<RoomScreenProps> = ({ route }) => {
  const { roomId } = route.params;
  const [roomName, setRoomName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRoomData();
  }, [roomId]);

  const loadRoomData = async () => {
    try {
      const room = await apiService.getRoom(roomId);
      setRoomName(room.name);
      setRoomCode(room.room_id);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger les données de la room');
      console.error('Error loading room:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingScreen message="Chargement de la room..." />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{roomName}</Text>
      <Text style={styles.code}>Code: {roomCode}</Text>
      <Text style={styles.message}>
        Cette room est prête ! La navigation par tabs sera ajoutée prochainement.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  code: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.secondary,
    marginBottom: SPACING.xl,
    textAlign: 'center',
  },
  message: {
    fontSize: FONT_SIZES.md,
    color: COLORS.onBackground,
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default RoomScreen;
