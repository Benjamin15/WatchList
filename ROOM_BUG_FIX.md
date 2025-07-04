# Guide de Test - Correction du Bug de Création de Room

## Problème Résolu

**Problème**: Quand on créait une room, l'application affichait "Impossible de charger les données de la room"

**Cause**: Incohérence entre les types de `roomId` utilisés pour la navigation
- `HomeScreen` naviguait avec `room.id` (number) au lieu de `room.room_id` (string)
- Les types de navigation attendaient `number` mais l'API utilise des strings comme `"17cd44927c83"`

**Solution**: 
1. Modifié `HomeScreen` pour utiliser `room.room_id` au lieu de `room.id`
2. Mis à jour les types de navigation pour accepter `string` au lieu de `number`
3. Ajouté des logs de debug pour traquer les problèmes

## Tests de Validation

### 1. Test Backend (Préalable)
```bash
# S'assurer que le serveur fonctionne
curl http://192.168.0.14:3000/api/health

# Créer une room de test
curl -X POST http://192.168.0.14:3000/api/rooms \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Room Fix"}'

# Noter le room_id retourné (ex: "abc123def456")
```

### 2. Test Mobile - Création de Room

1. **Ouvrir l'application mobile**
2. **Créer une nouvelle room**:
   - Saisir un nom (ex: "Ma Room Test")
   - Appuyer sur "Créer"
   - **Résultat attendu**: Navigation vers l'écran Room sans erreur

3. **Vérifier les logs** dans la console Metro:
   ```
   Creating room with name: Ma Room Test
   Room created successfully: {id: 130, room_id: "xyz789abc", name: "Ma Room Test", ...}
   Navigating to Room with roomId: xyz789abc
   Loading room data for roomId: xyz789abc
   API: getRoom URL: http://192.168.0.14:3000/api/rooms/xyz789abc
   Room loaded successfully: {id: 130, room_id: "xyz789abc", name: "Ma Room Test", ...}
   ```

### 3. Test Mobile - Rejoindre une Room

1. **Retourner à l'écran d'accueil**
2. **Rejoindre une room existante**:
   - Saisir un code de room valide (ex: "17cd44927c83")
   - Appuyer sur "Rejoindre"
   - **Résultat attendu**: Navigation vers l'écran Room avec les données

3. **Vérifier que les médias s'affichent** (il devrait y avoir le "Test Movie Integration")

### 4. Test Complet - Ajout de Média

1. **Dans la room**, appuyer sur le bouton "+" flottant
2. **Effectuer une recherche** (ex: "Matrix")
3. **Ajouter un média**
4. **Retourner à la room** et vérifier que le média apparaît

## Changements Apportés

### Types (`mobile/src/types/index.ts`)
```typescript
// AVANT
Room: { roomId: number };

// APRÈS  
Room: { roomId: string };
```

### HomeScreen (`mobile/src/screens/HomeScreen.tsx`)
```typescript
// AVANT
navigation.navigate('Room', { roomId: room.id });

// APRÈS
navigation.navigate('Room', { roomId: room.room_id });
```

### Logs Ajoutés
- API service: URLs générées et réponses transformées
- HomeScreen: Création/jonction de room avec détails
- RoomScreen: Chargement des données avec diagnostics

## Validation

✅ **Types cohérents**: Tous les `roomId` sont maintenant des `string`  
✅ **Navigation corrigée**: Utilisation du bon identifiant (`room_id`)  
✅ **API fonctionnelle**: Backend testé et opérationnel  
✅ **Logs ajoutés**: Debug facilité pour futurs problèmes  

## Résultat Final

L'application doit maintenant permettre de :
1. Créer une room sans erreur
2. Rejoindre une room existante
3. Voir les médias dans la room
4. Ajouter de nouveaux médias
5. Swiper pour changer les statuts

**Room de test disponible**: `17cd44927c83` (contient des médias de test)
