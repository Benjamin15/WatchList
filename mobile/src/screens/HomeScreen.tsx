import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { RootStackParamList } from '../types';
import { COLORS, SPACING, FONT_SIZES } from '../constants';
import { apiService } from '../services/api';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [roomName, setRoomName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  const handleCreateRoom = async () => {
    if (!roomName.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer un nom pour la room');
      return;
    }

    setIsCreating(true);
    try {
      const room = await apiService.createRoom(roomName.trim());
      navigation.navigate('Room', { roomId: room.id });
    } catch (error: any) {
      Alert.alert('Erreur', error.message);
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!roomCode.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer un code de room');
      return;
    }

    setIsJoining(true);
    try {
      const room = await apiService.joinRoom(roomCode.trim().toUpperCase());
      navigation.navigate('Room', { roomId: room.id });
    } catch (error: any) {
      Alert.alert('Erreur', error.message);
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>WatchList</Text>
            <Text style={styles.subtitle}>
              Partagez vos films, séries et mangas avec vos amis
            </Text>
          </View>

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
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={handleCreateRoom}
              disabled={isCreating}
            >
              <Text style={styles.primaryButtonText}>
                {isCreating ? 'Création...' : 'Créer'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OU</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Rejoindre une room</Text>
            <TextInput
              style={styles.input}
              placeholder="Code de la room"
              placeholderTextColor={COLORS.placeholder}
              value={roomCode}
              onChangeText={setRoomCode}
              maxLength={12}
              autoCapitalize="characters"
            />
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={handleJoinRoom}
              disabled={isJoining}
            >
              <Text style={styles.secondaryButtonText}>
                {isJoining ? 'Connexion...' : 'Rejoindre'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: SPACING.lg,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  title: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.onBackground,
    textAlign: 'center',
    lineHeight: 22,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.onBackground,
    marginBottom: SPACING.md,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.onBackground,
    backgroundColor: COLORS.surface,
    marginBottom: SPACING.md,
  },
  button: {
    borderRadius: 8,
    padding: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
  },
  secondaryButton: {
    backgroundColor: COLORS.secondary,
  },
  primaryButtonText: {
    color: COLORS.onPrimary,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: COLORS.onSecondary,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    marginHorizontal: SPACING.md,
    color: COLORS.placeholder,
    fontSize: FONT_SIZES.sm,
  },
});

export default HomeScreen;
