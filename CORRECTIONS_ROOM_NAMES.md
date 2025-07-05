# Corrections - Affichage des noms de rooms

## Problème
Les noms de rooms n'étaient pas visibles dans la section "Rooms récentes" de la page d'accueil (affichage de barres sombres vides).

## Causes identifiées
1. **Noms vides ou null**: Certaines rooms pouvaient avoir des noms vides ou `null`
2. **Absence de fallback**: Pas de valeur par défaut quand le nom est vide
3. **Hauteur insuffisante**: Le texte pouvait être masqué par des problèmes de layout
4. **Validation insuffisante**: Le service ne validait pas suffisamment les noms

## Corrections appliquées

### 1. HomeScreen.tsx
- **Fallback pour les noms vides**: `{item.name || \`Room ${index + 1}\`}`
- **Hauteur minimale**: `minHeight: 24` dans le style `historyRoomName`
- **Index dans la map**: Ajout de l'index pour les fallbacks

### 2. roomHistory.ts
- **Validation du nom**: `const roomName = room.name?.trim() || \`Room ${room.room_id}\``
- **Logs améliorés**: Ajout de logs pour le diagnostic
- **Fallback cohérent**: Utilisation du room_id comme fallback

### 3. Scripts de diagnostic
- **diagnostic-history.sh**: Script complet pour diagnostiquer l'historique
- **test-room-names.sh**: Test rapide de l'affichage
- **fix-room-names.sh**: Test avec nettoyage de l'historique

## Résultat
✅ Les noms de rooms sont maintenant toujours visibles
✅ Fallback automatique pour les noms vides ("Room 1", "Room 2", etc.)
✅ Hauteur minimale garantie pour le texte
✅ Validation des données avant stockage

## Test
1. Ouvrir l'application
2. Créer ou rejoindre une room
3. Revenir à la page d'accueil
4. Vérifier la section "Rooms récentes"
5. Le nom de la room doit être visible et lisible

## Compatibilité
- ✅ Rétrocompatible avec l'historique existant
- ✅ Gestion des données corrompues
- ✅ Nettoyage automatique des noms vides
