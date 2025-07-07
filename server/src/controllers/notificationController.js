const pushNotificationService = require('../services/pushNotificationService');

class NotificationController {
  /**
   * Enregistrer un token push
   */
  async registerPushToken(req, res) {
    try {
      const { token, deviceId, roomId } = req.body;

      if (!token || !deviceId || !roomId) {
        return res.status(400).json({
          error: 'token, deviceId et roomId sont requis'
        });
      }

      if (!pushNotificationService.isValidPushToken(token)) {
        return res.status(400).json({
          error: 'Token push invalide'
        });
      }

      const result = await pushNotificationService.registerPushToken(token, deviceId, roomId);
      
      res.json({
        success: true,
        message: 'Token push enregistré avec succès',
        data: {
          id: result.id,
          isActive: result.isActive
        }
      });
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du token push:', error);
      res.status(500).json({
        error: 'Erreur lors de l\'enregistrement du token push'
      });
    }
  }

  /**
   * Désenregistrer un token push
   */
  async unregisterPushToken(req, res) {
    try {
      const { token, deviceId } = req.body;

      if (!token && !deviceId) {
        return res.status(400).json({
          error: 'token ou deviceId est requis'
        });
      }

      const result = await pushNotificationService.unregisterPushToken(token, deviceId);
      
      res.json({
        success: true,
        message: 'Token push désenregistré avec succès',
        data: {
          updated: result.count
        }
      });
    } catch (error) {
      console.error('Erreur lors du désenregistrement du token push:', error);
      res.status(500).json({
        error: 'Erreur lors du désenregistrement du token push'
      });
    }
  }

  /**
   * Mettre à jour les préférences de notification
   */
  async updateNotificationSettings(req, res) {
    try {
      const { deviceId, roomId, voteNotifications } = req.body;

      if (!deviceId || !roomId || typeof voteNotifications !== 'boolean') {
        return res.status(400).json({
          error: 'deviceId, roomId et voteNotifications (boolean) sont requis'
        });
      }

      const settings = { voteNotifications };
      const result = await pushNotificationService.updateNotificationSettings(deviceId, roomId, settings);
      
      res.json({
        success: true,
        message: 'Préférences de notification mises à jour',
        data: {
          deviceId: result.deviceId,
          voteNotifications: result.voteNotifications
        }
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour des préférences:', error);
      res.status(500).json({
        error: 'Erreur lors de la mise à jour des préférences'
      });
    }
  }

  /**
   * Obtenir les préférences de notification
   */
  async getNotificationSettings(req, res) {
    try {
      const { deviceId } = req.params;

      if (!deviceId) {
        return res.status(400).json({
          error: 'deviceId est requis'
        });
      }

      const settings = await pushNotificationService.prisma.notificationSettings.findUnique({
        where: { deviceId }
      });

      // Si pas de préférences, retourner les valeurs par défaut
      const defaultSettings = {
        deviceId,
        voteNotifications: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      res.json({
        success: true,
        data: settings || defaultSettings
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des préférences:', error);
      res.status(500).json({
        error: 'Erreur lors de la récupération des préférences'
      });
    }
  }

  /**
   * Envoyer une notification de test
   */
  async sendTestNotification(req, res) {
    try {
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({
          error: 'token est requis'
        });
      }

      const result = await pushNotificationService.sendTestNotification(token);
      
      res.json({
        success: true,
        message: 'Notification de test envoyée',
        data: result
      });
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la notification de test:', error);
      res.status(500).json({
        error: 'Erreur lors de l\'envoi de la notification de test'
      });
    }
  }

  /**
   * Obtenir les statistiques des notifications pour une room
   */
  async getNotificationStats(req, res) {
    try {
      const { roomId } = req.params;

      if (!roomId) {
        return res.status(400).json({
          error: 'roomId est requis'
        });
      }

      const tokens = await pushNotificationService.prisma.pushToken.findMany({
        where: {
          roomId,
          isActive: true
        }
      });

      const settings = await pushNotificationService.prisma.notificationSettings.findMany({
        where: {
          roomId
        }
      });

      const activeDevices = tokens.length;
      const notificationsEnabled = settings.filter(s => s.voteNotifications).length;
      const notificationsDisabled = settings.filter(s => !s.voteNotifications).length;

      res.json({
        success: true,
        data: {
          roomId,
          activeDevices,
          notificationsEnabled,
          notificationsDisabled,
          totalDevicesWithSettings: settings.length
        }
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      res.status(500).json({
        error: 'Erreur lors de la récupération des statistiques'
      });
    }
  }

  /**
   * Nettoyer les tokens expirés
   */
  async cleanupTokens(req, res) {
    try {
      const result = await pushNotificationService.cleanupExpiredTokens();
      
      res.json({
        success: true,
        message: 'Nettoyage effectué',
        data: {
          tokensDisabled: result.count
        }
      });
    } catch (error) {
      console.error('Erreur lors du nettoyage:', error);
      res.status(500).json({
        error: 'Erreur lors du nettoyage'
      });
    }
  }
}

module.exports = new NotificationController();
