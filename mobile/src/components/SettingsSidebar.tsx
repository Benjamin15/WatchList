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
import { useTranslation } from 'react-i18next';
import { SPACING, FONT_SIZES } from '../constants';
import { useNotifications } from '../hooks/useNotifications';
import { useLanguage } from '../hooks/useLanguage';
import { useTheme } from '../contexts/ThemeContext';

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
  const { t } = useTranslation();
  const [slideAnim] = useState(new Animated.Value(300)); // Commence hors écran à droite
  const [opacityAnim] = useState(new Animated.Value(0));
  
  // Hook pour gérer les notifications
  const { 
    voteNotificationsEnabled, 
    setVoteNotificationsEnabled, 
    isInitialized: notificationsInitialized,
    testNotification 
  } = useNotifications(roomId);
  
  // Hook pour gérer la langue
  const { 
    currentLanguage, 
    changeLanguage, 
    availableLanguages,
    isInitialized: languageInitialized 
  } = useLanguage();
  
  // Hook pour gérer le thème
  const { theme, themeMode, setThemeMode } = useTheme();
  
  // États pour les paramètres
  const [soundEnabled, setSoundEnabled] = useState(true);

  const screenWidth = Dimensions.get('window').width;
  const sidebarWidth = Math.min(320, screenWidth * 0.85);

  const themeOptions = [
    { key: 'dark', label: t('settings.dark') },
    { key: 'light', label: t('settings.light') },
    { key: 'green', label: t('settings.green') },
  ];

  // Créer les styles avec le thème actuel
  const styles = createStyles(theme);

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
            <Text style={styles.title}>⚙️ {t('settings.title')}</Text>
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
            <Text style={styles.sectionTitle}>📱 {t('settings.voteNotifications')}</Text>
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingName}>Notifications push</Text>
                <Text style={styles.settingDescription}>
                  {t('settings.voteNotificationsDescription')}
                  {!notificationsInitialized && ` (${t('common.notAvailable')})`}
                </Text>
              </View>
              <Switch
                value={voteNotificationsEnabled && notificationsInitialized}
                onValueChange={setVoteNotificationsEnabled}
                trackColor={{ false: theme.placeholder, true: theme.primary }}
                thumbColor={voteNotificationsEnabled ? theme.onPrimary : theme.onSurface}
                disabled={!notificationsInitialized}
              />
            </View>

            {/* Bouton de test en mode développement */}
            {__DEV__ && notificationsInitialized && (
              <TouchableOpacity style={styles.testButton} onPress={testNotification}>
                <Text style={styles.testButtonText}>🧪 {t('settings.testNotification')}</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Section Langage */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🌐 {t('settings.language')}</Text>
            
            {availableLanguages.map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.selectionItem,
                  currentLanguage === option.key && styles.selectedItem
                ]}
                onPress={() => changeLanguage(option.key)}
              >
                <View style={styles.selectionInfo}>
                  <Text style={[
                    styles.selectionName,
                    currentLanguage === option.key && styles.selectedText
                  ]}>
                    {option.label}
                  </Text>
                </View>
                {currentLanguage === option.key && (
                  <Text style={styles.checkIcon}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Section Thème */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎨 {t('settings.theme')}</Text>
            
            {themeOptions.map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.selectionItem,
                  themeMode === option.key && styles.selectedItem
                ]}
                onPress={() => setThemeMode(option.key as any)}
              >
                <View style={styles.selectionInfo}>
                  <Text style={[
                    styles.selectionName,
                    themeMode === option.key && styles.selectedText
                  ]}>
                    {option.label}
                  </Text>
                </View>
                {themeMode === option.key && (
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

const createStyles = (theme: any) => StyleSheet.create({
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
    backgroundColor: theme.surface,
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
    borderBottomColor: theme.border,
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: theme.onSurface,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT_SIZES.sm,
    color: theme.placeholder,
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
    color: theme.onSurface,
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
    color: theme.onSurface,
    marginBottom: SPACING.md,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    backgroundColor: theme.background,
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
    color: theme.onBackground,
    marginBottom: SPACING.xs,
  },
  settingDescription: {
    fontSize: FONT_SIZES.sm,
    color: theme.placeholder,
  },
  footer: {
    marginTop: SPACING.md,
    padding: SPACING.md,
    alignItems: 'center',
  },
  footerText: {
    fontSize: FONT_SIZES.xs,
    color: theme.placeholder,
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
    borderColor: theme.primary,
  },
  selectionInfo: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  selectionName: {
    fontSize: FONT_SIZES.md,
    color: theme.onSurface,
    fontWeight: '500',
    marginBottom: 2,
  },
  selectedText: {
    color: theme.primary,
    fontWeight: '600',
  },
  checkIcon: {
    fontSize: 18,
    color: theme.primary,
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
    color: theme.primary,
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default SettingsSidebar;
