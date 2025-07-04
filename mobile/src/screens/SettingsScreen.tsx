import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Share,
  Clipboard,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MaterialIcons } from '@expo/vector-icons';

import { RootStackParamList, Room } from '../types';
import { COLORS, SPACING, FONT_SIZES } from '../constants';
import { apiService } from '../services/api';

type SettingsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Settings'>;

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<SettingsScreenNavigationProp>();
  const route = useRoute();
  const { roomId } = route.params as { roomId?: number };

  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (roomId) {
      loadRoomDetails();
    } else {
      setLoading(false);
    }
  }, [roomId]);

  const loadRoomDetails = async () => {
    if (!roomId) return;

    try {
      const roomData = await apiService.getRoom(roomId);
      setRoom(roomData);
    } catch (error: any) {
      Alert.alert('Erreur', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyRoomCode = async () => {
    if (!room) return;

    try {
      await Clipboard.setString(room.code);
      Alert.alert('Copié', 'Code de la room copié dans le presse-papier');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de copier le code');
    }
  };

  const handleShareRoom = async () => {
    if (!room) return;

    try {
      await Share.share({
        message: `Rejoins ma watchlist ! Code : ${room.code}`,
        title: `Rejoindre la room "${room.name}"`,
      });
    } catch (error) {
      console.error('Erreur lors du partage:', error);
    }
  };

  const handleLeaveRoom = () => {
    Alert.alert(
      'Quitter la room',
      'Êtes-vous sûr de vouloir quitter cette room ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Quitter',
          style: 'destructive',
          onPress: () => {
            navigation.navigate('Home');
          },
        },
      ]
    );
  };

  const renderRoomInfo = () => {
    if (!room) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informations de la room</Text>
        <View style={styles.infoContainer}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Nom :</Text>
            <Text style={styles.infoValue}>{room.name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Code :</Text>
            <Text style={styles.infoValue}>{room.code}</Text>
            <TouchableOpacity onPress={handleCopyRoomCode} style={styles.copyButton}>
              <MaterialIcons name="content-copy" size={16} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Créée le :</Text>
            <Text style={styles.infoValue}>
              {new Date(room.createdAt).toLocaleDateString('fr-FR')}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderRoomActions = () => {
    if (!room) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Actions</Text>
        <TouchableOpacity style={styles.actionButton} onPress={handleShareRoom}>
          <MaterialIcons name="share" size={20} color={COLORS.primary} />
          <Text style={styles.actionButtonText}>Partager la room</Text>
          <MaterialIcons name="chevron-right" size={20} color={COLORS.placeholder} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={handleLeaveRoom}>
          <MaterialIcons name="exit-to-app" size={20} color={COLORS.error} />
          <Text style={[styles.actionButtonText, { color: COLORS.error }]}>
            Quitter la room
          </Text>
          <MaterialIcons name="chevron-right" size={20} color={COLORS.placeholder} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderGeneralSettings = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Général</Text>
      <TouchableOpacity style={styles.actionButton}>
        <MaterialIcons name="info" size={20} color={COLORS.primary} />
        <Text style={styles.actionButtonText}>À propos</Text>
        <MaterialIcons name="chevron-right" size={20} color={COLORS.placeholder} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.actionButton}>
        <MaterialIcons name="help" size={20} color={COLORS.primary} />
        <Text style={styles.actionButtonText}>Aide</Text>
        <MaterialIcons name="chevron-right" size={20} color={COLORS.placeholder} />
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderRoomInfo()}
      {renderRoomActions()}
      {renderGeneralSettings()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    color: COLORS.onBackground,
    fontSize: FONT_SIZES.md,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.onBackground,
    marginBottom: SPACING.md,
    marginHorizontal: SPACING.lg,
  },
  infoContainer: {
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.lg,
    borderRadius: 8,
    padding: SPACING.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  infoLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.placeholder,
    width: 80,
  },
  infoValue: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    color: COLORS.onSurface,
    fontWeight: '500',
  },
  copyButton: {
    padding: SPACING.xs,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderRadius: 8,
    marginBottom: SPACING.xs,
  },
  actionButtonText: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    color: COLORS.onSurface,
    marginLeft: SPACING.md,
  },
});

export default SettingsScreen;
