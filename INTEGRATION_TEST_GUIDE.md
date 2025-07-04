# Guide de Test de l'Intégration Backend/Mobile

## Prérequis

### 1. Serveur Backend
- Le serveur doit être en cours d'exécution sur le port 3000
- Vérifier avec : `curl http://localhost:3000/api/health`
- Réponse attendue : `{"status":"OK","timestamp":"..."}`

### 2. Application Mobile
- L'application Expo doit être en cours d'exécution
- Vérifier que `USE_MOCK_DATA = false` dans `mobile/src/constants/config.ts`

## Tests d'Intégration

### Test 1: Créer et Rejoindre une Room

#### Via l'API (test backend)
```bash
# Créer une room
curl -X POST http://localhost:3000/api/rooms \
  -H "Content-Type: application/json" \
  -d '{"name": "Ma Room de Test"}'

# Réponse : noter le room_id (ex: "2da44348c4f9")
```

#### Via l'Application Mobile
1. Ouvrir l'application mobile
2. Utiliser le code de room obtenu ci-dessus
3. Vérifier que la room s'affiche correctement

### Test 2: Ajouter un Média

#### Via l'API (test backend)
```bash
# Ajouter un média (remplacer ROOM_ID par le room_id obtenu)
curl -X POST http://localhost:3000/api/items/rooms/ROOM_ID/items \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Spider-Man: Into the Spider-Verse",
    "type": "movie",
    "year": 2018,
    "genre": "Animation, Action",
    "description": "Miles Morales découvre ses pouvoirs de Spider-Man."
  }'
```

#### Via l'Application Mobile
1. Dans la room, appuyer sur le bouton "+" flottant
2. Effectuer une recherche (ex: "Spider-Man")
3. Sélectionner un résultat et l'ajouter
4. Vérifier que le média apparaît dans l'onglet "À regarder"

### Test 3: Changer le Statut d'un Média

#### Via l'Application Mobile
1. Dans la room, aller dans l'onglet "À regarder"
2. Swiper un média vers la droite pour le passer en "En cours"
3. Vérifier que le média apparaît dans l'onglet "En cours"
4. Swiper à nouveau vers la droite pour le passer en "Terminé"

#### Vérification via l'API
```bash
# Vérifier les items de la room
curl http://localhost:3000/api/rooms/ROOM_ID/items
```

### Test 4: Recherche de Médias

#### Via l'Application Mobile
1. Appuyer sur le bouton "+" dans la room
2. Saisir une recherche (ex: "Matrix")
3. Vérifier que les résultats s'affichent
4. Tenter d'ajouter un média

## Statuts des Médias

### Correspondance Backend ↔ Mobile
- `a_voir` (backend) ↔ `planned` (mobile) → "À regarder"
- `en_cours` (backend) ↔ `watching` (mobile) → "En cours"
- `termine` (backend) ↔ `completed` (mobile) → "Terminé"
- `abandonne` (backend) ↔ `dropped` (mobile) → "Abandonné"

## Dépannage

### Problèmes Courants

1. **Erreur "Route not found"**
   - Vérifier que le serveur backend est en cours d'exécution
   - Vérifier les URLs dans `mobile/src/constants/config.ts`

2. **Erreur de réseau dans l'app mobile**
   - Vérifier que l'URL du backend est correcte
   - Pour les appareils physiques via Expo Go, utiliser l'IP locale au lieu de localhost

3. **Les données ne se rafraîchissent pas**
   - Vérifier que `useFocusEffect` est utilisé dans `RoomScreen`
   - Redémarrer l'application mobile

### Logs de Debug

#### Backend
```bash
# Voir les logs du serveur
cd /Users/ben/workspace/WatchList/server
npm start
```

#### Mobile
- Ouvrir la console Metro dans le terminal
- Vérifier les logs dans l'application Expo

## Prochaines Étapes

1. **Améliorer la gestion des erreurs** dans l'application mobile
2. **Ajouter des animations** pour les transitions de swipe
3. **Optimiser les performances** avec du caching
4. **Ajouter des tests unitaires** pour l'API service
5. **Améliorer l'UX** avec des indicateurs de chargement
