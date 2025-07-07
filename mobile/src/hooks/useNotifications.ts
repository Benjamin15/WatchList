import { useEffect, useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Notifications from 'expo-notifications';
import NotificationService from '../services/notificationService';
import { apiService } from '../services/api';
import { RootStackParamList } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export interface UseNotificationsReturn {
  isInitialized: boolean;
  voteNotificationsEnabled: boolean;
  pushToken: string | null;
  setVoteNotificationsEnabled: (enabled: boolean) => Promise<void>;
  testNotification: () => Promise<void>;
}

export const useNotifications = (roomId?: string): UseNotificationsReturn => {
  const navigation = useNavigation<NavigationProp>();
  const [isInitialized, setIsInitialized] = useState(false);
  const [voteNotificationsEnabled, setVoteNotificationsEnabledState] = useState(true);
  const [pushToken, setPushToken] = useState<string | null>(null);

  // Initialiser le service de notifications
  useEffect(() => {
    const initializeNotifications = async () => {
      try {
        const success = await NotificationService.initialize();
        setIsInitialized(success);

        if (success) {
          // Charger les paramètres
          const enabled = await NotificationService.areVoteNotificationsEnabled();
          setVoteNotificationsEnabledState(enabled);

          // Récupérer le token
          const token = NotificationService.getPushToken();
          setPushToken(token);

          // Enregistrer le token pour cette room si fournie
          if (roomId && token && enabled) {
            await apiService.registerPushToken(roomId, token);
            console.log(`[useNotifications] Token enregistré pour room ${roomId}`);
          }
        }
      } catch (error) {
        console.error('[useNotifications] Erreur initialisation:', error);
      }
    };

    initializeNotifications();
  }, [roomId]);

  // Gérer les notifications reçues
  useEffect(() => {
    const subscription = NotificationService.addNotificationReceivedListener((notification) => {
      console.log('[useNotifications] Notification reçue:', notification);
    });

    return () => subscription.remove();
  }, []);

  // Gérer les clics sur les notifications
  useEffect(() => {
    const subscription = NotificationService.addNotificationResponseReceivedListener((response) => {
      console.log('[useNotifications] Notification cliquée:', response);

      const data = response.notification.request.content.data as any;
      
      // Naviguer vers le vote si fourni
      if (data?.voteId && data?.roomId) {
        navigation.navigate('VoteDetail', {
          voteId: parseInt(String(data.voteId)),
          roomId: String(data.roomId),
        });
      } else if (data?.roomId) {
        // Naviguer vers la room
        navigation.navigate('Room', {
          roomId: String(data.roomId),
          roomName: data.roomName ? String(data.roomName) : undefined,
        });
      }
    });

    return () => subscription.remove();
  }, [navigation]);

  // Fonction pour activer/désactiver les notifications de vote
  const setVoteNotificationsEnabled = useCallback(async (enabled: boolean) => {
    try {
      await NotificationService.setVoteNotificationsEnabled(enabled);
      setVoteNotificationsEnabledState(enabled);

      if (roomId) {
        if (enabled && pushToken) {
          // Réenregistrer le token
          await apiService.registerPushToken(roomId, pushToken);
        } else {
          // Désenregistrer le token
          await apiService.unregisterPushToken(roomId);
        }

        // Mettre à jour les paramètres sur le serveur
        await apiService.updateNotificationSettings(roomId, enabled);
      }

      console.log(`[useNotifications] Notifications ${enabled ? 'activées' : 'désactivées'}`);
    } catch (error) {
      console.error('[useNotifications] Erreur mise à jour notifications:', error);
      Alert.alert(
        'Erreur',
        'Impossible de mettre à jour les paramètres de notification'
      );
    }
  }, [roomId, pushToken]);

  // Fonction pour tester les notifications (développement)
  const testNotification = useCallback(async () => {
    try {
      await NotificationService.showLocalNotification(
        '🗳️ Nouveau sondage !',
        'Un nouveau sondage a été créé dans votre room.',
        { roomId, test: true }
      );
    } catch (error) {
      console.error('[useNotifications] Erreur test notification:', error);
    }
  }, [roomId]);

  return {
    isInitialized,
    voteNotificationsEnabled,
    pushToken,
    setVoteNotificationsEnabled,
    testNotification,
  };
};
