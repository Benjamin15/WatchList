import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  PanResponder,
  Dimensions,
  Switch,
  Alert,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { COLORS, SPACING, FONT_SIZES } from '../constants';
import { useNotifications } from '../hooks/useNotifications';

interface SettingsSidebarProps {
  visible: boolean;
  onClose: () => void;
  roomId: string;
  roomName: string;
}

const SettingsSidebar: React.FC<SettingsSidebarProps> = ({
  visible,
  onClose,
  roomId,
  roomName,
}) => {
  const [slideAnim] = useState(new Animated.Value(300)); // Commence hors écran à droite
  const [opacityAnim] = useState(new Animated.Value(0));
  
  // Hook pour gérer les notifications
  const { 
    voteNotificationsEnabled, 
    setVoteNotificationsEnabled, 
    isInitialized: notificationsInitialized,
    testNotification 
  } = useNotifications(roomId);
  
  // États pour les paramètres
  const [selectedLanguage, setSelectedLanguage] = useState('fr');
  const [selectedTheme, setSelectedTheme] = useState('dark');

  const screenWidth = Dimensions.get('window').width;
  const sidebarWidth = Math.min(320, screenWidth * 0.85);

  // Options pour les sélecteurs
  const languageOptions = [
    { key: 'fr', label: '🇫🇷 Français' },
    { key: 'en', label: '🇺🇸 English' },
    { key: 'es', label: '🇪🇸 Español' },
    { key: 'pt', label: '🇧🇷 Português' },
  ];

  const themeOptions = [
    { key: 'dark', label: '🌙 Sombre' },
    { key: 'light', label: '☀️ Clair' },
    { key: 'auto', label: '⚡ Automatique' },
  ];

  // Animation d'entrée/sortie
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: sidebarWidth,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, slideAnim, opacityAnim, sidebarWidth]);

  // Gestionnaire de gestes pour fermer en glissant vers la droite
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gestureState) => {
      return Math.abs(gestureState.dx) > 20 && Math.abs(gestureState.dy) < 100;
    },
    onPanResponderMove: (_, gestureState) => {
      if (gestureState.dx > 0) {
        slideAnim.setValue(gestureState.dx);
      }
    },
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dx > 50) {
        onClose();
      } else {
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }
    },
  });

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      {/* Overlay cliquable pour fermer */}
      <TouchableOpacity 
        style={styles.overlayTouch}
        activeOpacity={1}
        onPress={onClose}
      >
        <Animated.View style={[styles.overlayBackground, { opacity: opacityAnim }]} />
      </TouchableOpacity>

      {/* Sidebar */}
      <Animated.View
        style={[
          styles.sidebar,
          {
            width: sidebarWidth,
            transform: [{ translateX: slideAnim }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>⚙️ Paramètres</Text>
            <Text style={styles.subtitle}>{roomName}</Text>
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeIcon}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Contenu */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          
          {/* Section Notifications de vote */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📱 Notifications de vote</Text>
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingName}>Notifications push</Text>
                <Text style={styles.settingDescription}>
                  Recevoir des alertes pour les nouveaux votes
                  {!notificationsInitialized && ' (Non disponible)'}
                </Text>
              </View>
              <Switch
                value={voteNotificationsEnabled && notificationsInitialized}
                onValueChange={setVoteNotificationsEnabled}
                trackColor={{ false: COLORS.placeholder, true: COLORS.primary }}
                thumbColor={voteNotificationsEnabled ? COLORS.onPrimary : COLORS.onSurface}
                disabled={!notificationsInitialized}
              />
            </View>

            {/* Bouton de test en mode développement */}
            {__DEV__ && notificationsInitialized && (
              <TouchableOpacity style={styles.testButton} onPress={testNotification}>
                <Text style={styles.testButtonText}>🧪 Tester les notifications</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Section Langage */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🌐 Langage</Text>
            
            {languageOptions.map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.selectionItem,
                  selectedLanguage === option.key && styles.selectedItem
                ]}
                onPress={() => setSelectedLanguage(option.key)}
              >
                <View style={styles.selectionInfo}>
                  <Text style={[
                    styles.selectionName,
                    selectedLanguage === option.key && styles.selectedText
                  ]}>
                    {option.label}
                  </Text>
                </View>
                {selectedLanguage === option.key && (
                  <Text style={styles.checkIcon}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Section Thème */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎨 Thème</Text>
            
            {themeOptions.map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.selectionItem,
                  selectedTheme === option.key && styles.selectedItem
                ]}
                onPress={() => setSelectedTheme(option.key)}
              >
                <View style={styles.selectionInfo}>
                  <Text style={[
                    styles.selectionName,
                    selectedTheme === option.key && styles.selectedText
                  ]}>
                    {option.label}
                  </Text>
                </View>
                {selectedTheme === option.key && (
                  <Text style={styles.checkIcon}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Informations */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Room ID: {roomId}</Text>
            <Text style={styles.footerText}>Version: 1.0.0</Text>
          </View>
        </ScrollView>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  overlayTouch: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  overlayBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.surface,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.onSurface,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.placeholder,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    fontSize: 16,
    color: COLORS.onSurface,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: SPACING.md,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.onSurface,
    marginBottom: SPACING.md,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.background,
    borderRadius: 12,
    marginBottom: SPACING.sm,
  },
  settingInfo: {
    flex: 1,
    marginRight: SPACING.md,
  },
  settingName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
    color: COLORS.onBackground,
    marginBottom: SPACING.xs,
  },
  settingDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.placeholder,
  },
  footer: {
    marginTop: SPACING.md,
    padding: SPACING.md,
    alignItems: 'center',
  },
  footerText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.placeholder,
    marginBottom: SPACING.xs,
  },
  // Styles pour les sélecteurs (Langage et Thème)
  selectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 12,
    marginBottom: SPACING.xs,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  selectedItem: {
    backgroundColor: 'rgba(74, 144, 226, 0.15)',
    borderColor: COLORS.primary,
  },
  selectionInfo: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  selectionName: {
    fontSize: FONT_SIZES.md,
    color: COLORS.onSurface,
    fontWeight: '500',
    marginBottom: 2,
  },
  selectedText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  checkIcon: {
    fontSize: 18,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  testButton: {
    marginTop: SPACING.sm,
    padding: SPACING.sm,
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(74, 144, 226, 0.3)',
  },
  testButtonText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default SettingsSidebar;
