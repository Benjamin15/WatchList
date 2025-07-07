import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configuration des notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface NotificationSettings {
  voteNotificationsEnabled: boolean;
  pushToken?: string;
}

class NotificationService {
  private static instance: NotificationService;
  private pushToken: string | null = null;
  private isInitialized = false;

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Initialise le service de notifications
   */
  async initialize(): Promise<boolean> {
    try {
      if (this.isInitialized) {
        return true;
      }

      // Vérifier si on est sur un device physique
      if (!Device.isDevice) {
        console.log('[NotificationService] Notifications non supportées sur simulateur');
        return false;
      }

      // Demander les permissions
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        console.log('[NotificationService] Permissions refusées');
        return false;
      }

      // Obtenir le token push
      await this.registerForPushNotifications();

      this.isInitialized = true;
      console.log('[NotificationService] Service initialisé avec succès');
      return true;
    } catch (error) {
      console.error('[NotificationService] Erreur lors de l\'initialisation:', error);
      return false;
    }
  }

  /**
   * Demande les permissions pour les notifications
   */
  private async requestPermissions(): Promise<boolean> {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('[NotificationService] Permission refusée pour les notifications');
        return false;
      }

      // Configuration supplémentaire pour Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('vote-notifications', {
          name: 'Nouveaux sondages',
          description: 'Notifications pour les nouveaux sondages dans vos rooms',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#4A90E2',
          sound: 'default',
        });
      }

      return true;
    } catch (error) {
      console.error('[NotificationService] Erreur lors de la demande de permissions:', error);
      return false;
    }
  }

  /**
   * S'enregistre pour recevoir les notifications push
   */
  private async registerForPushNotifications(): Promise<string | null> {
    try {
      const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
      
      if (!projectId) {
        console.error('[NotificationService] Project ID Expo manquant');
        return null;
      }

      const token = await Notifications.getExpoPushTokenAsync({
        projectId,
      });

      this.pushToken = token.data;
      console.log('[NotificationService] Token push obtenu:', this.pushToken);

      // Sauvegarder le token
      await this.saveNotificationSettings({
        voteNotificationsEnabled: true,
        pushToken: this.pushToken,
      });

      return this.pushToken;
    } catch (error) {
      console.error('[NotificationService] Erreur lors de l\'obtention du token push:', error);
      return null;
    }
  }

  /**
   * Sauvegarde les paramètres de notification
   */
  async saveNotificationSettings(settings: NotificationSettings): Promise<void> {
    try {
      await AsyncStorage.setItem('notificationSettings', JSON.stringify(settings));
      console.log('[NotificationService] Paramètres sauvegardés:', settings);
    } catch (error) {
      console.error('[NotificationService] Erreur sauvegarde paramètres:', error);
    }
  }

  /**
   * Charge les paramètres de notification
   */
  async loadNotificationSettings(): Promise<NotificationSettings> {
    try {
      const stored = await AsyncStorage.getItem('notificationSettings');
      if (stored) {
        const settings = JSON.parse(stored) as NotificationSettings;
        console.log('[NotificationService] Paramètres chargés:', settings);
        return settings;
      }
    } catch (error) {
      console.error('[NotificationService] Erreur chargement paramètres:', error);
    }

    // Paramètres par défaut
    return {
      voteNotificationsEnabled: true,
    };
  }

  /**
   * Active ou désactive les notifications de vote
   */
  async setVoteNotificationsEnabled(enabled: boolean): Promise<void> {
    try {
      const settings = await this.loadNotificationSettings();
      settings.voteNotificationsEnabled = enabled;
      await this.saveNotificationSettings(settings);
      
      console.log(`[NotificationService] Notifications de vote ${enabled ? 'activées' : 'désactivées'}`);
    } catch (error) {
      console.error('[NotificationService] Erreur mise à jour paramètres:', error);
    }
  }

  /**
   * Vérifie si les notifications de vote sont activées
   */
  async areVoteNotificationsEnabled(): Promise<boolean> {
    try {
      const settings = await this.loadNotificationSettings();
      return settings.voteNotificationsEnabled;
    } catch (error) {
      console.error('[NotificationService] Erreur vérification paramètres:', error);
      return false;
    }
  }

  /**
   * Obtient le token push actuel
   */
  getPushToken(): string | null {
    return this.pushToken;
  }

  /**
   * Affiche une notification locale (pour test)
   */
  async showLocalNotification(title: string, body: string, data?: any): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: 'default',
        },
        trigger: null, // Afficher immédiatement
      });
    } catch (error) {
      console.error('[NotificationService] Erreur notification locale:', error);
    }
  }

  /**
   * Ajoute un listener pour les notifications reçues
   */
  addNotificationReceivedListener(listener: (notification: Notifications.Notification) => void) {
    return Notifications.addNotificationReceivedListener(listener);
  }

  /**
   * Ajoute un listener pour les notifications cliquées
   */
  addNotificationResponseReceivedListener(listener: (response: Notifications.NotificationResponse) => void) {
    return Notifications.addNotificationResponseReceivedListener(listener);
  }

  /**
   * Efface toutes les notifications
   */
  async clearAllNotifications(): Promise<void> {
    try {
      await Notifications.dismissAllNotificationsAsync();
      console.log('[NotificationService] Toutes les notifications effacées');
    } catch (error) {
      console.error('[NotificationService] Erreur effacement notifications:', error);
    }
  }
}

export default NotificationService.getInstance();
