const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

// Enregistrer un token push
router.post('/register-token', notificationController.registerPushToken);

// Désenregistrer un token push
router.post('/unregister-token', notificationController.unregisterPushToken);

// Mettre à jour les préférences de notification
router.post('/settings', notificationController.updateNotificationSettings);

// Obtenir les préférences de notification
router.get('/settings/:deviceId', notificationController.getNotificationSettings);

// Envoyer une notification de test
router.post('/test', notificationController.sendTestNotification);

// Obtenir les statistiques des notifications pour une room
router.get('/stats/:roomId', notificationController.getNotificationStats);

// Nettoyer les tokens expirés (endpoint d'administration)
router.post('/cleanup', notificationController.cleanupTokens);

module.exports = router;
