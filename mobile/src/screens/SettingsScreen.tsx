import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { SPACING, FONT_SIZES } from '../constants';
import { apiService } from '../services/api';
import { useTheme } from '../contexts/ThemeContext';

type SettingsScreenRouteProp = RouteProp<RootStackParamList, 'Settings'>;
type SettingsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Settings'>;

interface Props {
  route: SettingsScreenRouteProp;
}

const SettingsScreen: React.FC<Props> = ({ route }) => {
  const navigation = useNavigation<SettingsScreenNavigationProp>();
  const { roomId } = route.params;
  
  const [roomName, setRoomName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  
  // États pour les paramètres
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoUpdateEnabled, setAutoUpdateEnabled] = useState(true);

  useEffect(() => {
    loadRoomData();
  }, []);

  const loadRoomData = async () => {
    try {
      const room = await apiService.getRoom(roomId);
      setRoomName(room.name);
    } catch (error) {
      console.error('Erreur lors du chargement de la room:', error);
      Alert.alert('Erreur', 'Impossible de charger les données de la room');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRoom = () => {
    Alert.alert(
      'Supprimer la room',
      `Êtes-vous sûr de vouloir supprimer la room "${roomName}" ?\n\nCette action est irréversible et supprimera toutes les données de la room.`,
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              // TODO: Implémenter la suppression de room côté API
              // await apiService.deleteRoom(roomId);
              Alert.alert(
                'Fonctionnalité en développement',
                'La suppression de room sera disponible dans une prochaine version.',
                [
                  {
                    text: 'OK',
                  },
                ]
              );
            } catch (error) {
              console.error('Erreur lors de la suppression:', error);
              Alert.alert('Erreur', 'Impossible de supprimer la room');
            }
          },
        },
      ]
    );
  };

  const handleExportData = () => {
    Alert.alert(
      'Exporter les données',
      'Cette fonctionnalité permet d\'exporter toutes les données de la room (films, séries, votes) dans un fichier.',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Exporter',
          onPress: () => {
            // TODO: Implémenter l'export des données
            Alert.alert('Info', 'Fonctionnalité d\'export en développement');
          },
        },
      ]
    );
  };

  const handleClearAllData = () => {
    Alert.alert(
      'Vider la room',
      `Êtes-vous sûr de vouloir vider tout le contenu de la room "${roomName}" ?\n\nCela supprimera tous les films, séries et votes, mais conservera la room.`,
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Vider',
          style: 'destructive',
          onPress: () => {
            // TODO: Implémenter le vidage de la room
            Alert.alert('Info', 'Fonctionnalité de vidage en développement');
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* En-tête */}
      <View style={styles.header}>
        <Text style={styles.title}>Paramètres de la room</Text>
        <Text style={styles.subtitle}>{roomName}</Text>
      </View>

      {/* Section Notifications */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📱 Notifications</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingName}>Notifications de vote</Text>
            <Text style={styles.settingDescription}>
              Recevoir des notifications pour les nouveaux votes
            </Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: COLORS.placeholder, true: COLORS.primary }}
            thumbColor={notificationsEnabled ? COLORS.onPrimary : COLORS.onSurface}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingName}>Mise à jour automatique</Text>
            <Text style={styles.settingDescription}>
              Actualiser automatiquement le contenu de la room
            </Text>
          </View>
          <Switch
            value={autoUpdateEnabled}
            onValueChange={setAutoUpdateEnabled}
            trackColor={{ false: COLORS.placeholder, true: COLORS.primary }}
            thumbColor={autoUpdateEnabled ? COLORS.onPrimary : COLORS.onSurface}
          />
        </View>
      </View>

      {/* Section Données */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💾 Gestion des données</Text>
        
        <TouchableOpacity style={styles.actionButton} onPress={handleExportData}>
          <View style={styles.buttonContent}>
            <Text style={styles.buttonIcon}>📤</Text>
            <View style={styles.buttonInfo}>
              <Text style={styles.buttonText}>Exporter les données</Text>
              <Text style={styles.buttonDescription}>
                Sauvegarder tous les contenus de la room
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleClearAllData}>
          <View style={styles.buttonContent}>
            <Text style={styles.buttonIcon}>🗑️</Text>
            <View style={styles.buttonInfo}>
              <Text style={styles.buttonText}>Vider la room</Text>
              <Text style={styles.buttonDescription}>
                Supprimer tout le contenu (films, séries, votes)
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* Section Danger */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚠️ Zone de danger</Text>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.dangerButton]} 
          onPress={handleDeleteRoom}
        >
          <View style={styles.buttonContent}>
            <Text style={styles.buttonIcon}>🗑️</Text>
            <View style={styles.buttonInfo}>
              <Text style={[styles.buttonText, styles.dangerText]}>
                Supprimer la room
              </Text>
              <Text style={styles.buttonDescription}>
                Suppression définitive de la room et de toutes ses données
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* Informations */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Room ID: {roomId}
        </Text>
        <Text style={styles.footerText}>
          Version: 1.0.0
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    padding: SPACING.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.onBackground,
  },
  header: {
    marginBottom: SPACING.xl,
    alignItems: 'center',
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.onBackground,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.placeholder,
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
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    marginBottom: SPACING.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  settingInfo: {
    flex: 1,
    marginRight: SPACING.md,
  },
  settingName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
    color: COLORS.onSurface,
    marginBottom: SPACING.xs,
  },
  settingDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.placeholder,
  },
  actionButton: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    marginBottom: SPACING.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  dangerButton: {
    borderColor: COLORS.error,
    borderWidth: 1,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  buttonIcon: {
    fontSize: 24,
    marginRight: SPACING.md,
  },
  buttonInfo: {
    flex: 1,
  },
  buttonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
    color: COLORS.onSurface,
    marginBottom: SPACING.xs,
  },
  dangerText: {
    color: COLORS.error,
  },
  buttonDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.placeholder,
  },
  footer: {
    marginTop: SPACING.xl,
    padding: SPACING.md,
    alignItems: 'center',
  },
  footerText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.placeholder,
    marginBottom: SPACING.xs,
  },
});

export default SettingsScreen;
