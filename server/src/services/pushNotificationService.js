const { Expo } = require('expo-server-sdk');
const { PrismaClient } = require('@prisma/client');

class PushNotificationService {
  constructor() {
    this.expo = new Expo();
    this.prisma = new PrismaClient();
  }

  /**
   * Vérifie si un token push est valide
   */
  isValidPushToken(token) {
    return Expo.isExpoPushToken(token);
  }

  /**
   * Enregistre un token push pour un appareil et une room
   */
  async registerPushToken(token, deviceId, roomId) {
    try {
      if (!this.isValidPushToken(token)) {
        throw new Error('Token push invalide');
      }

      // Désactiver les anciens tokens pour cet appareil et cette room
      await this.prisma.pushToken.updateMany({
        where: {
          deviceId,
          roomId,
          isActive: true
        },
        data: {
          isActive: false
        }
      });

      // Créer ou mettre à jour le token
      const pushToken = await this.prisma.pushToken.upsert({
        where: {
          token
        },
        update: {
          deviceId,
          roomId,
          isActive: true,
          updatedAt: new Date()
        },
        create: {
          token,
          deviceId,
          roomId,
          isActive: true
        }
      });

      console.log(`Token push enregistré: ${token.substring(0, 20)}... pour device ${deviceId} dans room ${roomId}`);
      return pushToken;
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du token push:', error);
      throw error;
    }
  }

  /**
   * Désenregistre un token push
   */
  async unregisterPushToken(token, deviceId) {
    try {
      const result = await this.prisma.pushToken.updateMany({
        where: {
          OR: [
            { token },
            { deviceId }
          ],
          isActive: true
        },
        data: {
          isActive: false
        }
      });

      console.log(`Token push désenregistré: ${token ? token.substring(0, 20) + '...' : 'device ' + deviceId}`);
      return result;
    } catch (error) {
      console.error('Erreur lors du désenregistrement du token push:', error);
      throw error;
    }
  }

  /**
   * Met à jour les préférences de notification pour un appareil
   */
  async updateNotificationSettings(deviceId, roomId, settings) {
    try {
      const notificationSettings = await this.prisma.notificationSettings.upsert({
        where: {
          deviceId
        },
        update: {
          roomId,
          voteNotifications: settings.voteNotifications,
          updatedAt: new Date()
        },
        create: {
          deviceId,
          roomId,
          voteNotifications: settings.voteNotifications
        }
      });

      console.log(`Préférences de notification mises à jour pour device ${deviceId}: vote=${settings.voteNotifications}`);
      return notificationSettings;
    } catch (error) {
      console.error('Erreur lors de la mise à jour des préférences:', error);
      throw error;
    }
  }

  /**
   * Récupère les tokens actifs pour une room avec préférences
   */
  async getActiveTokensForRoom(roomId) {
    try {
      const tokens = await this.prisma.pushToken.findMany({
        where: {
          roomId,
          isActive: true
        },
        include: {
          _count: true
        }
      });

      // Filtrer les tokens en fonction des préférences de notification
      const filteredTokens = [];
      for (const tokenData of tokens) {
        const settings = await this.prisma.notificationSettings.findUnique({
          where: {
            deviceId: tokenData.deviceId
          }
        });

        // Si pas de préférences, on considère que les notifications sont activées par défaut
        const voteNotificationsEnabled = settings ? settings.voteNotifications : true;
        
        if (voteNotificationsEnabled) {
          filteredTokens.push(tokenData.token);
        }
      }

      return filteredTokens;
    } catch (error) {
      console.error('Erreur lors de la récupération des tokens:', error);
      throw error;
    }
  }

  /**
   * Envoie une notification push à plusieurs tokens
   */
  async sendPushNotifications(tokens, title, body, data = {}) {
    try {
      if (!tokens || tokens.length === 0) {
        console.log('Aucun token à notifier');
        return { success: true, sent: 0, errors: [] };
      }

      // Filtrer les tokens valides
      const validTokens = tokens.filter(token => this.isValidPushToken(token));
      
      if (validTokens.length === 0) {
        console.log('Aucun token valide trouvé');
        return { success: true, sent: 0, errors: ['Aucun token valide'] };
      }

      // Créer les messages
      const messages = validTokens.map(token => ({
        to: token,
        sound: 'default',
        title,
        body,
        data,
        priority: 'high',
        channelId: 'votes'
      }));

      // Envoyer les notifications par chunks
      const chunks = this.expo.chunkPushNotifications(messages);
      const tickets = [];
      const errors = [];

      for (const chunk of chunks) {
        try {
          const ticketChunk = await this.expo.sendPushNotificationsAsync(chunk);
          tickets.push(...ticketChunk);
          console.log(`Chunk de ${chunk.length} notifications envoyé`);
        } catch (error) {
          console.error('Erreur lors de l\'envoi d\'un chunk:', error);
          errors.push(error.message);
        }
      }

      // Analyser les résultats
      let successCount = 0;
      for (const ticket of tickets) {
        if (ticket.status === 'error') {
          console.error('Erreur de notification:', ticket.message);
          errors.push(ticket.message);
        } else {
          successCount++;
        }
      }

      console.log(`Notifications envoyées: ${successCount}/${validTokens.length} réussies`);
      
      return {
        success: true,
        sent: successCount,
        total: validTokens.length,
        errors
      };
    } catch (error) {
      console.error('Erreur lors de l\'envoi des notifications push:', error);
      throw error;
    }
  }

  /**
   * Envoie une notification de nouveau vote
   */
  async sendVoteNotification(roomId, voteTitle, createdBy) {
    try {
      const tokens = await this.getActiveTokensForRoom(roomId);
      
      if (tokens.length === 0) {
        console.log(`Aucun token actif pour la room ${roomId}`);
        return { success: true, sent: 0 };
      }

      const title = '🗳️ Nouveau sondage !';
      const body = `${createdBy} a créé un nouveau sondage : "${voteTitle}"`;
      const data = {
        type: 'vote',
        roomId,
        voteTitle,
        createdBy,
        timestamp: Date.now()
      };

      const result = await this.sendPushNotifications(tokens, title, body, data);
      
      console.log(`Notification de vote envoyée pour room ${roomId}: ${result.sent} envoyées`);
      return result;
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la notification de vote:', error);
      throw error;
    }
  }

  /**
   * Nettoie les tokens expirés ou invalides
   */
  async cleanupExpiredTokens() {
    try {
      // Désactiver les tokens plus anciens que 30 jours
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      
      const result = await this.prisma.pushToken.updateMany({
        where: {
          updatedAt: {
            lt: thirtyDaysAgo
          },
          isActive: true
        },
        data: {
          isActive: false
        }
      });

      console.log(`${result.count} tokens expirés désactivés`);
      return result;
    } catch (error) {
      console.error('Erreur lors du nettoyage des tokens:', error);
      throw error;
    }
  }

  /**
   * Test d'envoi de notification
   */
  async sendTestNotification(token) {
    try {
      if (!this.isValidPushToken(token)) {
        throw new Error('Token push invalide');
      }

      const title = '🧪 Test de notification';
      const body = 'Votre système de notifications fonctionne correctement !';
      const data = { type: 'test', timestamp: Date.now() };

      const result = await this.sendPushNotifications([token], title, body, data);
      console.log('Notification de test envoyée:', result);
      
      return result;
    } catch (error) {
      console.error('Erreur lors du test de notification:', error);
      throw error;
    }
  }
}

module.exports = new PushNotificationService();
