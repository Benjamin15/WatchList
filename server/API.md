# API Documentation - WatchParty Server

## Base URL
```
http://localhost:3000/api
```

## Health Check

### GET /health
Vérification du statut du serveur

**Réponse :**
```json
{
  "status": "OK",
  "timestamp": "2025-07-03T14:23:30.229Z"
}
```

## Rooms

### POST /rooms
Créer une nouvelle room

**Body :**
```json
{
  "name": "Ma WatchParty"
}
```

**Réponse :**
```json
{
  "id": 1,
  "room_id": "5d920572049e",
  "name": "Ma WatchParty",
  "created_at": "2025-07-03T14:23:43.971Z"
}
```

### GET /rooms/:roomId
Obtenir les informations d'une room

**Réponse :**
```json
{
  "id": 1,
  "room_id": "5d920572049e",
  "name": "Ma WatchParty",
  "created_at": "2025-07-03T14:23:43.971Z"
}
```

### GET /rooms/:roomId/items
Obtenir les items d'une room

**Réponse :**
```json
{
  "room_id": "5d920572049e",
  "name": "Ma WatchParty",
  "items": [
    {
      "id": 1,
      "title": "Avatar",
      "type": "movie",
      "status": "a_voir",
      "external_id": "tmdb_19995",
      "image_url": "https://image.tmdb.org/t/p/w500/7mzJl74fmqvyFPET7tj53NoBbyd.jpg",
      "release_date": "2009-12-15",
      "description": "Un marine paraplégique...",
      "note": null,
      "created_at": "2025-07-03T14:23:43.971Z"
    }
  ]
}
```

## Items

### POST /items/rooms/:roomId/items
Ajouter un item à une room

**Body (item existant) :**
```json
{
  "item_id": 1
}
```

**Body (nouvel item) :**
```json
{
  "title": "Avatar",
  "type": "movie",
  "external_id": "tmdb_19995",
  "description": "Un marine paraplégique...",
  "image_url": "https://image.tmdb.org/t/p/w500/7mzJl74fmqvyFPET7tj53NoBbyd.jpg",
  "release_date": "2009-12-15",
  "note": "Film recommandé"
}
```

### PUT /items/rooms/:roomId/items/:itemId/status
Mettre à jour le statut d'un item

**Body :**
```json
{
  "status": "vu"
}
```

**Statuts possibles :** `a_voir`, `en_cours`, `vu`

### DELETE /items/rooms/:roomId/items/:itemId
Supprimer un item d'une room

### GET /items/:itemId
Obtenir les détails d'un item

## Search

### GET /search/autocomplete/:type/:query
Recherche autocomplete

**Paramètres :**
- `type`: `movie`, `tv`, `manga`
- `query`: terme de recherche

**Réponse :**
```json
{
  "query": "avatar",
  "type": "movie",
  "results": [
    {
      "external_id": "tmdb_19995",
      "title": "Avatar",
      "type": "movie",
      "description": "Un marine paraplégique...",
      "image_url": "https://image.tmdb.org/t/p/w500/7mzJl74fmqvyFPET7tj53NoBbyd.jpg",
      "release_date": "2009-12-15",
      "in_database": false
    }
  ]
}
```

## Codes d'erreur

- `400`: Requête invalide
- `404`: Ressource non trouvée
- `409`: Conflit (ex: item déjà dans la room)
- `500`: Erreur serveur

## Exemples d'utilisation

### Créer une room et ajouter un film
```bash
# Créer une room
curl -X POST http://localhost:3000/api/rooms \
  -H "Content-Type: application/json" \
  -d '{"name": "Mes Films"}'

# Rechercher un film
curl "http://localhost:3000/api/search/autocomplete/movie/avatar"

# Ajouter un film à la room
curl -X POST http://localhost:3000/api/items/rooms/5d920572049e/items \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Avatar",
    "type": "movie",
    "external_id": "tmdb_19995",
    "description": "Un marine paraplégique...",
    "image_url": "https://image.tmdb.org/t/p/w500/7mzJl74fmqvyFPET7tj53NoBbyd.jpg",
    "release_date": "2009-12-15"
  }'

# Marquer comme vu
curl -X PUT http://localhost:3000/api/items/rooms/5d920572049e/items/1/status \
  -H "Content-Type: application/json" \
  -d '{"status": "vu"}'
```
