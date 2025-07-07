# Documentation Backend - Système de Notifications Push

## Vue d'ensemble

Cette documentation décrit l'implémentation complète du système de notifications push côté serveur pour l'application WatchList. Le système permet d'envoyer des notifications push aux utilisateurs lorsqu'un nouveau sondage est créé dans une room.

## Architecture

### Composants principaux

1. **Service de notifications** (`pushNotificationService.js`)
2. **Contrôleur de notifications** (`notificationController.js`)
3. **Routes de notifications** (`notifications.js`)
4. **Modèles de base de données** (Prisma schema)

### Dépendances

- `expo-server-sdk` : SDK officiel pour envoyer des notifications via Expo Push Service
- `@prisma/client` : ORM pour la gestion de la base de données
- `express` : Framework web pour les routes API

## Modèles de base de données

### Table `push_tokens`

Stocke les tokens push des appareils enregistrés.

```sql
CREATE TABLE push_tokens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  token TEXT UNIQUE NOT NULL,
  device_id TEXT NOT NULL,
  room_id TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Table `notification_settings`

Stocke les préférences de notification des utilisateurs.

```sql
CREATE TABLE notification_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  device_id TEXT UNIQUE NOT NULL,
  room_id TEXT NOT NULL,
  vote_notifications BOOLEAN DEFAULT true,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## API Endpoints

### 1. Enregistrement d'un token push

**POST** `/api/notifications/register-token`

Enregistre un token push pour un appareil dans une room spécifique.

**Body:**
```json
{
  "token": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
  "deviceId": "unique-device-id",
  "roomId": "ROOM123"
}
```

**Réponse:**
```json
{
  "success": true,
  "message": "Token push enregistré avec succès",
  "data": {
    "id": 1,
    "isActive": true
  }
}
```

### 2. Désenregistrement d'un token push

**POST** `/api/notifications/unregister-token`

Désactive un token push (déconnexion ou désinstallation).

**Body:**
```json
{
  "token": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
  "deviceId": "unique-device-id"
}
```

**Réponse:**
```json
{
  "success": true,
  "message": "Token push désenregistré avec succès",
  "data": {
    "updated": 1
  }
}
```

### 3. Mise à jour des préférences

**POST** `/api/notifications/settings`

Met à jour les préférences de notification d'un utilisateur.

**Body:**
```json
{
  "deviceId": "unique-device-id",
  "roomId": "ROOM123",
  "voteNotifications": false
}
```

**Réponse:**
```json
{
  "success": true,
  "message": "Préférences de notification mises à jour",
  "data": {
    "deviceId": "unique-device-id",
    "voteNotifications": false
  }
}
```

### 4. Récupération des préférences

**GET** `/api/notifications/settings/:deviceId`

Récupère les préférences de notification d'un appareil.

**Réponse:**
```json
{
  "success": true,
  "data": {
    "deviceId": "unique-device-id",
    "voteNotifications": true,
    "createdAt": "2024-01-01T12:00:00.000Z",
    "updatedAt": "2024-01-01T12:00:00.000Z"
  }
}
```

### 5. Test de notification

**POST** `/api/notifications/test`

Envoie une notification de test à un token spécifique.

**Body:**
```json
{
  "token": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]"
}
```

**Réponse:**
```json
{
  "success": true,
  "message": "Notification de test envoyée",
  "data": {
    "success": true,
    "sent": 1,
    "total": 1,
    "errors": []
  }
}
```

### 6. Statistiques d'une room

**GET** `/api/notifications/stats/:roomId`

Récupère les statistiques des notifications pour une room.

**Réponse:**
```json
{
  "success": true,
  "data": {
    "roomId": "ROOM123",
    "activeDevices": 5,
    "notificationsEnabled": 4,
    "notificationsDisabled": 1,
    "totalDevicesWithSettings": 5
  }
}
```

### 7. Nettoyage des tokens

**POST** `/api/notifications/cleanup`

Désactive les tokens expirés (plus de 30 jours sans mise à jour).

**Réponse:**
```json
{
  "success": true,
  "message": "Nettoyage effectué",
  "data": {
    "tokensDisabled": 3
  }
}
```

## Service PushNotificationService

### Méthodes principales

#### `registerPushToken(token, deviceId, roomId)`
- Valide le token avec `Expo.isExpoPushToken()`
- Désactive les anciens tokens de l'appareil
- Enregistre le nouveau token en base

#### `sendVoteNotification(roomId, voteTitle, createdBy)`
- Récupère les tokens actifs de la room
- Filtre selon les préférences utilisateur
- Envoie les notifications par chunks
- Gère les erreurs individuellement

#### `sendPushNotifications(tokens, title, body, data)`
- Crée les messages au format Expo
- Divise en chunks pour l'envoi
- Analyse les résultats et erreurs
- Retourne un rapport détaillé

#### `cleanupExpiredTokens()`
- Désactive les tokens inactifs depuis 30 jours
- Optimise les performances de la base

### Gestion des erreurs

Le service gère plusieurs types d'erreurs :
- Tokens invalides ou expirés
- Erreurs réseau Expo Push Service
- Erreurs de base de données
- Quotas dépassés

## Intégration avec la création de vote

Dans `voteController.js`, l'envoi de notifications est intégré :

```javascript
// Après création du vote
setTimeout(async () => {
  try {
    await pushNotificationService.sendVoteNotification(roomIdStr, title, createdBy);
  } catch (notificationError) {
    console.error('Erreur lors de l\'envoi des notifications push:', notificationError);
    // La création du vote n'échoue pas si les notifications échouent
  }
}, 100);
```

### Avantages de cette approche :
- **Non-bloquant** : Les notifications n'affectent pas la création du vote
- **Résilient** : Les erreurs de notification n'interrompent pas le flux principal
- **Asynchrone** : Améliore les performances de l'API

## Sécurité

### Validation des tokens
- Vérification avec `Expo.isExpoPushToken()`
- Désactivation automatique des tokens expirés
- Nettoyage périodique des données obsolètes

### Gestion des permissions
- Respect des préférences utilisateur
- Opt-out facile via les paramètres
- Tokens liés à des appareils et rooms spécifiques

### Protection contre le spam
- Un seul token actif par appareil/room
- Limitation par les quotas Expo
- Logs détaillés pour le monitoring

## Monitoring et logs

### Logs automatiques
```javascript
console.log(`Token push enregistré: ${token.substring(0, 20)}... pour device ${deviceId}`);
console.log(`Notifications envoyées: ${successCount}/${validTokens.length} réussies`);
console.error('Erreur lors de l\'envoi des notifications push:', error);
```

### Métriques importantes
- Nombre de tokens actifs par room
- Taux de succès des notifications
- Fréquence des erreurs
- Performance des envois par chunks

## Configuration

### Variables d'environnement

Aucune configuration spéciale requise pour Expo Push Service, mais recommandé :

```env
# Optionnel : pour le monitoring
EXPO_ACCESS_TOKEN=your_expo_access_token
NODE_ENV=production
LOG_LEVEL=info
```

### Limites Expo Push Service

- **Rate limits** : 600 notifications/minute en mode gratuit
- **Payload** : Max 4KB par notification
- **Expiration** : 30 jours max pour les tokens
- **Chunks** : Max 100 notifications par chunk

## Tests

### Tests unitaires

Le fichier `test-backend-notifications.js` couvre :
- Enregistrement/désenregistrement des tokens
- Gestion des préférences
- Envoi de notifications
- Intégration avec les votes
- Nettoyage des données

### Tests d'intégration

```bash
# Lancer les tests
cd server
npm test

# Tests avec couverture
npm run test:coverage
```

### Test manuel

```bash
# Démarrer le serveur
npm run dev

# Tester l'endpoint de test
curl -X POST http://localhost:3000/api/notifications/test \
  -H "Content-Type: application/json" \
  -d '{"token":"ExponentPushToken[your_test_token]"}'
```

## Déploiement

### Migration de base de données

```bash
npx prisma migrate deploy
```

### Installation des dépendances

```bash
npm install expo-server-sdk
```

### Configuration serveur

Assurer que le serveur supporte :
- Connexions HTTPS (requis par Expo)
- Timeouts appropriés (notifications peuvent prendre du temps)
- Gestion des erreurs réseau

## Troubleshooting

### Problèmes courants

1. **Token invalide**
   - Vérifier le format ExponentPushToken[...]
   - S'assurer que l'app utilise Expo Notifications

2. **Notifications non reçues**
   - Vérifier les préférences utilisateur
   - Contrôler les permissions de l'appareil
   - Vérifier les logs serveur

3. **Erreurs de quota**
   - Implémenter un rate limiting
   - Utiliser des chunks plus petits
   - Monitorer l'usage Expo

4. **Tokens expirés**
   - Implémenter un refresh automatique côté client
   - Nettoyer régulièrement la base avec `/cleanup`

### Debugging

```javascript
// Activer les logs détaillés
console.log('Notification envoyée:', {
  token: token.substring(0, 20) + '...',
  title,
  body,
  result
});
```

## Évolutions futures

### Améliorations possibles

1. **Analytics avancés**
   - Tracking des taux d'ouverture
   - Métriques de performance
   - Tableaux de bord

2. **Types de notifications**
   - Notifications de résultat de vote
   - Rappels avant expiration
   - Notifications de nouveaux médias

3. **Optimisations**
   - Cache des tokens actifs
   - Batching intelligent
   - Retry automatique

4. **Intégrations**
   - Support FCM direct
   - Webhooks pour événements
   - API d'administration

Cette documentation couvre l'ensemble du système de notifications push backend. Le système est maintenant prêt pour la production et l'intégration avec l'application mobile.
