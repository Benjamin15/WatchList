# Configuration Backend - Notifications Push

## 📋 Vue d'ensemble

Configuration du backend pour envoyer des notifications push aux utilisateurs lorsqu'un nouveau sondage est créé dans leur room.

## 🔧 Endpoints API Implémentés

### 1. Enregistrement Token Push
```
POST /api/notifications/register
Content-Type: application/json

{
  "roomId": "string",
  "pushToken": "string",
  "deviceId": "string"
}
```

### 2. Désenregistrement Token Push
```
POST /api/notifications/unregister
Content-Type: application/json

{
  "roomId": "string", 
  "deviceId": "string"
}
```

### 3. Mise à jour Paramètres
```
PATCH /api/notifications/settings
Content-Type: application/json

{
  "roomId": "string",
  "enabled": boolean,
  "deviceId": "string"
}
```

## 🗄️ Structure Base de Données

### Table `push_tokens`
```sql
CREATE TABLE push_tokens (
  id SERIAL PRIMARY KEY,
  room_id VARCHAR(255) NOT NULL,
  device_id VARCHAR(255) NOT NULL,
  push_token TEXT NOT NULL,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE(room_id, device_id)
);
```

## 📱 Logique Notifications

### Déclenchement
```javascript
// Exemple d'implémentation côté serveur (Node.js/Express)
app.post('/api/votes', async (req, res) => {
  try {
    // 1. Créer le vote en base
    const vote = await createVote(req.body);
    
    // 2. Récupérer tous les tokens push actifs pour cette room
    const pushTokens = await getPushTokensForRoom(req.body.roomId);
    
    // 3. Envoyer les notifications
    await sendVoteNotifications(vote, pushTokens);
    
    res.json({ success: true, data: vote });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

async function sendVoteNotifications(vote, pushTokens) {
  const notifications = pushTokens.map(tokenData => ({
    to: tokenData.push_token,
    sound: 'default',
    title: '🗳️ Nouveau sondage !',
    body: `"${vote.title}" - Votez maintenant !`,
    data: {
      voteId: vote.id,
      roomId: vote.roomId,
      roomName: vote.roomName,
      type: 'new_vote'
    },
    channelId: 'vote-notifications',
  }));

  // Envoyer via l'API Expo Push Notifications
  await expo.sendPushNotificationsAsync(notifications);
}
```

## 🔄 Flux Complet

### 1. Utilisateur Active les Notifications
```
Mobile App → POST /notifications/register → Base de données
                ↓
           Token enregistré pour (roomId, deviceId)
```

### 2. Création d'un Nouveau Vote
```
Créateur vote → POST /votes → Serveur crée vote
                               ↓
                         Récupère tokens actifs
                               ↓
                     Envoie notifications push
                               ↓
                        Expo Push Service
                               ↓
                       Devices des utilisateurs
```

### 3. Utilisateur Reçoit la Notification
```
Notification reçue → Utilisateur clique → App ouvre VoteDetail
```

## 📦 Dépendances Serveur

### Node.js/Express
```bash
npm install expo-server-sdk
```

```javascript
const { Expo } = require('expo-server-sdk');
const expo = new Expo();
```

### Python/Django
```bash
pip install exponent_server_sdk
```

```python
from exponent_server_sdk import PushClient, PushMessage

push_client = PushClient()
```

## 🔒 Sécurité

### Validation Tokens
- Vérifier que les tokens Expo sont valides
- Nettoyer les tokens expirés/invalides
- Rate limiting sur les endpoints de notification

### Privacy
- Notifications anonymes (pas de données sensibles)
- Opt-out facile pour l'utilisateur
- Nettoyage des tokens lors de la désinscription

## 🧪 Test des Notifications

### Mode Développement
```javascript
// Test notification locale (déjà implémenté)
testNotification() // Button dans SettingsSidebar
```

### Test Push Réelles
```bash
# Utiliser l'outil Expo Push Tool
curl -H "Content-Type: application/json" \
     -X POST \
     -d '{
       "to": "ExponentPushToken[xxx]",
       "title": "Test",
       "body": "Notification test"
     }' \
     https://exp.host/--/api/v2/push/send
```

## 📊 Métriques & Monitoring

### Logs Recommandés
- Tokens enregistrés/désenregistrés
- Notifications envoyées/échouées
- Erreurs de livraison
- Taux d'engagement (clics)

### Dashboard Monitoring
```javascript
{
  "total_registered_devices": 150,
  "notifications_sent_today": 45,
  "delivery_success_rate": "98.2%",
  "avg_click_through_rate": "23%"
}
```

## 🎯 Implémentation Client

### Côté Mobile (Déjà Fait)
- ✅ Service de notifications (`NotificationService`)
- ✅ Hook React (`useNotifications`)
- ✅ Interface utilisateur dans Settings
- ✅ Gestion des permissions
- ✅ Navigation sur clic notification

### Côté Serveur (À Faire)
- [ ] Endpoints API notifications
- [ ] Base de données tokens
- [ ] Intégration Expo Push Service
- [ ] Logique de déclenchement
- [ ] Nettoyage tokens expirés

---

**Note**: Le client mobile est prêt à recevoir et gérer les notifications push. L'implémentation serveur reste à faire selon cette documentation.
