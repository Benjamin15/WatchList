/**
 * Test automatisé - Backend Notifications Push
 * 
 * Ce test valide l'implémentation complète du système de notifications push côté serveur :
 * - Enregistrement et désenregistrement des tokens
 * - Gestion des préférences de notification
 * - Envoi de notifications lors de la création d'un vote
 * - Nettoyage des tokens expirés
 */

const request = require('supertest');
const { PrismaClient } = require('@prisma/client');

// Mock pour expo-server-sdk
const mockExpo = {
  isExpoPushToken: jest.fn(),
  sendPushNotificationsAsync: jest.fn(),
  chunkPushNotifications: jest.fn()
};

jest.mock('expo-server-sdk', () => ({
  Expo: jest.fn().mockImplementation(() => mockExpo)
}));

describe('Backend Notifications Push', () => {
  let app;
  let prisma;
  const testToken = 'ExponentPushToken[test123456789]';
  const testDeviceId = 'test-device-123';
  const testRoomId = 'TEST123';

  beforeAll(() => {
    // Configuration des mocks
    mockExpo.isExpoPushToken.mockReturnValue(true);
    mockExpo.sendPushNotificationsAsync.mockResolvedValue([{ status: 'ok' }]);
    mockExpo.chunkPushNotifications.mockImplementation(messages => [messages]);

    // Import de l'app après les mocks
    app = require('../src/app');
    prisma = new PrismaClient();
  });

  beforeEach(async () => {
    // Nettoyer les données de test
    await prisma.pushToken.deleteMany({ where: { deviceId: testDeviceId } });
    await prisma.notificationSettings.deleteMany({ where: { deviceId: testDeviceId } });
    await prisma.vote.deleteMany({ where: { roomId: testRoomId } });
  });

  afterAll(async () => {
    // Nettoyage final
    await prisma.pushToken.deleteMany({ where: { deviceId: testDeviceId } });
    await prisma.notificationSettings.deleteMany({ where: { deviceId: testDeviceId } });
    await prisma.vote.deleteMany({ where: { roomId: testRoomId } });
    await prisma.$disconnect();
  });

  describe('POST /api/notifications/register-token', () => {
    it('devrait enregistrer un token push valide', async () => {
      const response = await request(app)
        .post('/api/notifications/register-token')
        .send({
          token: testToken,
          deviceId: testDeviceId,
          roomId: testRoomId
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Token push enregistré avec succès');

      // Vérifier en base
      const savedToken = await prisma.pushToken.findUnique({
        where: { token: testToken }
      });
      expect(savedToken).toBeTruthy();
      expect(savedToken.deviceId).toBe(testDeviceId);
      expect(savedToken.roomId).toBe(testRoomId);
      expect(savedToken.isActive).toBe(true);
    });

    it('devrait rejeter un token invalide', async () => {
      mockExpo.isExpoPushToken.mockReturnValueOnce(false);

      const response = await request(app)
        .post('/api/notifications/register-token')
        .send({
          token: 'invalid-token',
          deviceId: testDeviceId,
          roomId: testRoomId
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Token push invalide');
    });

    it('devrait gérer les champs manquants', async () => {
      const response = await request(app)
        .post('/api/notifications/register-token')
        .send({
          token: testToken
          // deviceId et roomId manquants
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('token, deviceId et roomId sont requis');
    });
  });

  describe('POST /api/notifications/unregister-token', () => {
    beforeEach(async () => {
      // Enregistrer un token pour les tests
      await prisma.pushToken.create({
        data: {
          token: testToken,
          deviceId: testDeviceId,
          roomId: testRoomId,
          isActive: true
        }
      });
    });

    it('devrait désenregistrer un token', async () => {
      const response = await request(app)
        .post('/api/notifications/unregister-token')
        .send({
          token: testToken,
          deviceId: testDeviceId
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Token push désenregistré avec succès');

      // Vérifier en base
      const updatedToken = await prisma.pushToken.findUnique({
        where: { token: testToken }
      });
      expect(updatedToken.isActive).toBe(false);
    });
  });

  describe('POST /api/notifications/settings', () => {
    it('devrait mettre à jour les préférences de notification', async () => {
      const response = await request(app)
        .post('/api/notifications/settings')
        .send({
          deviceId: testDeviceId,
          roomId: testRoomId,
          voteNotifications: false
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.voteNotifications).toBe(false);

      // Vérifier en base
      const settings = await prisma.notificationSettings.findUnique({
        where: { deviceId: testDeviceId }
      });
      expect(settings.voteNotifications).toBe(false);
    });
  });

  describe('GET /api/notifications/settings/:deviceId', () => {
    it('devrait retourner les préférences par défaut si aucune configuration', async () => {
      const response = await request(app)
        .get(`/api/notifications/settings/${testDeviceId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.voteNotifications).toBe(true); // valeur par défaut
    });

    it('devrait retourner les préférences existantes', async () => {
      // Créer des préférences
      await prisma.notificationSettings.create({
        data: {
          deviceId: testDeviceId,
          roomId: testRoomId,
          voteNotifications: false
        }
      });

      const response = await request(app)
        .get(`/api/notifications/settings/${testDeviceId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.voteNotifications).toBe(false);
    });
  });

  describe('POST /api/notifications/test', () => {
    it('devrait envoyer une notification de test', async () => {
      const response = await request(app)
        .post('/api/notifications/test')
        .send({
          token: testToken
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Notification de test envoyée');

      // Vérifier que le service d'envoi a été appelé
      expect(mockExpo.sendPushNotificationsAsync).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            to: testToken,
            title: '🧪 Test de notification'
          })
        ])
      );
    });
  });

  describe('GET /api/notifications/stats/:roomId', () => {
    beforeEach(async () => {
      // Créer des données de test
      await prisma.pushToken.create({
        data: {
          token: testToken,
          deviceId: testDeviceId,
          roomId: testRoomId,
          isActive: true
        }
      });

      await prisma.notificationSettings.create({
        data: {
          deviceId: testDeviceId,
          roomId: testRoomId,
          voteNotifications: true
        }
      });
    });

    it('devrait retourner les statistiques d\'une room', async () => {
      const response = await request(app)
        .get(`/api/notifications/stats/${testRoomId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.activeDevices).toBe(1);
      expect(response.body.data.notificationsEnabled).toBe(1);
      expect(response.body.data.notificationsDisabled).toBe(0);
    });
  });

  describe('Intégration avec création de vote', () => {
    beforeEach(async () => {
      // Créer une room et un item de test
      await prisma.room.create({
        data: {
          roomId: testRoomId,
          name: 'Test Room'
        }
      });

      await prisma.item.create({
        data: {
          id: 1,
          title: 'Test Movie',
          type: 'movie'
        }
      });

      // Enregistrer un token
      await prisma.pushToken.create({
        data: {
          token: testToken,
          deviceId: testDeviceId,
          roomId: testRoomId,
          isActive: true
        }
      });

      await prisma.notificationSettings.create({
        data: {
          deviceId: testDeviceId,
          roomId: testRoomId,
          voteNotifications: true
        }
      });
    });

    it('devrait envoyer une notification lors de la création d\'un vote', async () => {
      const response = await request(app)
        .post('/api/votes')
        .send({
          roomId: testRoomId,
          title: 'Test Vote',
          description: 'Vote de test',
          mediaIds: [1],
          createdBy: 'TestUser'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);

      // Attendre un peu pour l'envoi asynchrone des notifications
      await new Promise(resolve => setTimeout(resolve, 200));

      // Vérifier que le service d'envoi a été appelé
      expect(mockExpo.sendPushNotificationsAsync).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            to: testToken,
            title: '🗳️ Nouveau sondage !',
            body: expect.stringContaining('TestUser a créé un nouveau sondage : "Test Vote"')
          })
        ])
      );
    });
  });

  describe('POST /api/notifications/cleanup', () => {
    beforeEach(async () => {
      // Créer un token expiré (plus de 30 jours)
      const thirtyOneDaysAgo = new Date(Date.now() - 31 * 24 * 60 * 60 * 1000);
      await prisma.pushToken.create({
        data: {
          token: testToken,
          deviceId: testDeviceId,
          roomId: testRoomId,
          isActive: true,
          updatedAt: thirtyOneDaysAgo
        }
      });
    });

    it('devrait nettoyer les tokens expirés', async () => {
      const response = await request(app)
        .post('/api/notifications/cleanup');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.tokensDisabled).toBe(1);

      // Vérifier en base
      const updatedToken = await prisma.pushToken.findUnique({
        where: { token: testToken }
      });
      expect(updatedToken.isActive).toBe(false);
    });
  });
});

console.log('✅ Test Backend Notifications Push - Configuration validée');
console.log('🔧 Endpoints disponibles :');
console.log('   POST /api/notifications/register-token');
console.log('   POST /api/notifications/unregister-token');
console.log('   POST /api/notifications/settings');
console.log('   GET  /api/notifications/settings/:deviceId');
console.log('   POST /api/notifications/test');
console.log('   GET  /api/notifications/stats/:roomId');
console.log('   POST /api/notifications/cleanup');
console.log('🚀 Intégration avec création de vote activée');
