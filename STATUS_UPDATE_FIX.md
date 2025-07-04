# Correction du Bug de Mise à Jour des Statuts

## Problème Résolu

**Erreur**: `Error updating item status: {"message": "Une erreur est survenue. Veuillez réessayer.", "status": 400}`

**Symptôme**: La vue se met à jour (mise à jour optimiste) mais l'API échoue.

## Cause Identifiée

### Incompatibilité des Statuts Backend vs Mobile

**Backend accepte** (dans `itemController.js`):
```javascript
const validStatuses = ['a_voir', 'en_cours', 'vu'];
```

**Mobile envoyait** (transformation incorrecte):
- `'completed'` → `'termine'` ❌ (devrait être `'vu'`)
- `'dropped'` → `'abandonne'` ❌ (statut non supporté par le backend)

## Solution Appliquée

### 1. Correction de la Transformation des Statuts

**Avant** (incorrect):
```typescript
case 'completed': return 'termine';  // ❌ 'termine' n'existe pas
case 'dropped': return 'abandonne';  // ❌ 'abandonne' n'existe pas
```

**Après** (correct):
```typescript
case 'completed': return 'vu';      // ✅ correspond au backend
case 'dropped': return 'a_voir';    // ✅ fallback car non supporté
```

### 2. Transformation Bidirectionnelle

**Mobile ↔ Backend**:
```
'planned'   ↔ 'a_voir'
'watching'  ↔ 'en_cours'  
'completed' ↔ 'vu'
'dropped'   → 'a_voir' (fallback, statut non supporté)
```

### 3. Logs de Debug Ajoutés

```typescript
console.log('API: Mobile status:', status, '→ Backend status:', backendStatus);
console.log('API: updateItemStatus payload:', { status: backendStatus });
```

## Tests de Validation

### 1. Test Direct API Backend

```bash
# Test statut 'a_voir' (planned)
curl -X PUT http://192.168.0.14:3000/api/items/rooms/ROOM_ID/items/ITEM_ID/status \
  -H "Content-Type: application/json" \
  -d '{"status": "a_voir"}'

# Test statut 'en_cours' (watching)  
curl -X PUT http://192.168.0.14:3000/api/items/rooms/ROOM_ID/items/ITEM_ID/status \
  -H "Content-Type: application/json" \
  -d '{"status": "en_cours"}'

# Test statut 'vu' (completed)
curl -X PUT http://192.168.0.14:3000/api/items/rooms/ROOM_ID/items/ITEM_ID/status \
  -H "Content-Type: application/json" \
  -d '{"status": "vu"}'
```

### 2. Test Mobile

1. **Aller dans une room** avec des médias
2. **Swiper un média** de "En cours" vers "Terminé"
3. **Vérifier** qu'il n'y a plus d'erreur dans les logs
4. **Vérifier** que le statut persiste après rafraîchissement

### 3. Vérification des Logs

Console Metro devrait afficher :
```
API: Mobile status: completed → Backend status: vu
API: updateItemStatus URL: http://192.168.0.14:3000/api/items/rooms/.../status
API: updateItemStatus payload: {"status": "vu"}
```

## Changements de Code

### API Service (`mobile/src/services/api.ts`)

1. **Correction transformation**:
   - `'completed'` → `'vu'` (au lieu de `'termine'`)
   - `'dropped'` → `'a_voir'` (fallback)

2. **Ajout logs debug**:
   - URL générée
   - Payload envoyé  
   - Transformation status

3. **Transformation bidirectionnelle**:
   - Backend → Mobile (`transformStatus`)
   - Mobile → Backend (`transformStatusToBackend`)

## Notes Importantes

### ⚠️ Limitation: Statut "Dropped" 

Le backend ne supporte que 3 statuts. Le statut `'dropped'` mobile est mappé vers `'a_voir'` comme fallback.

**Options futures**:
1. Ajouter le statut `'abandonne'` au backend
2. Désactiver l'option "dropped" dans l'interface mobile
3. Traiter `'dropped'` comme une suppression de l'item

### ✅ Statuts Fonctionnels

- ✅ **À regarder** (`planned` ↔ `a_voir`)
- ✅ **En cours** (`watching` ↔ `en_cours`)
- ✅ **Terminé** (`completed` ↔ `vu`)
- ⚠️ **Abandonné** (`dropped` → `a_voir` fallback)

## Résultat

L'application peut maintenant :
1. ✅ Changer le statut des médias par swipe sans erreur
2. ✅ Persister les changements dans la base de données
3. ✅ Afficher les statuts corrects après rafraîchissement
4. ✅ Logs de debug pour traçabilité
