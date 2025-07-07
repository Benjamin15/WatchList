# Limitation à un seul vote actif par room

## 📋 Résumé de l'implémentation

Cette fonctionnalité garantit qu'il ne peut y avoir qu'un seul vote actif par room à tout moment, évitant ainsi la confusion et les conflits entre différents votes.

## 🔧 Implémentation côté backend

### Vérification avant création
- **Fichier**: `server/src/controllers/voteController.js`
- **Logique**: Avant de créer un nouveau vote, le serveur vérifie s'il existe déjà un vote avec le statut `'active'` dans la même room
- **Réponse**: Si un vote actif existe, retourne une erreur 409 (Conflict) avec les détails du vote existant

```javascript
// Vérifier s'il existe déjà un vote actif dans cette room
const existingActiveVote = await this.prisma.vote.findFirst({
  where: {
    roomId,
    status: 'active'
  }
});

if (existingActiveVote) {
  return res.status(409).json({
    error: 'Il y a déjà un vote actif dans cette room',
    details: {
      existingVoteId: existingActiveVote.id,
      existingVoteTitle: existingActiveVote.title,
      existingVoteCreatedBy: existingActiveVote.createdBy
    }
  });
}
```

## 🎨 Implémentation côté mobile

### Détection de vote actif
- **Fichier**: `mobile/src/screens/RoomScreen.tsx`
- **Fonction**: `hasActiveVote()` vérifie s'il y a un vote avec le statut `'active'` dans la liste des votes de la room

```javascript
const hasActiveVote = () => {
  return votes.some(vote => vote.status === 'active');
};
```

### Interface utilisateur adaptative

#### Bouton "Créer un vote" désactivé
Quand un vote actif existe :
- Le bouton devient visuellement désactivé (opacité réduite)
- Le texte change de "Proposer des films" à "Vote en cours..."
- Le bouton n'est plus cliquable (`disabled={true}`)

```javascript
<TouchableOpacity
  style={[
    styles.fabMenuItem,
    hasActiveVote() && styles.fabMenuItemDisabled
  ]}
  onPress={handleCreateVote}
  disabled={hasActiveVote()}
>
```

#### Feedback utilisateur
Si l'utilisateur essaie quand même de créer un vote :
- Une alerte s'affiche expliquant qu'un vote est déjà en cours
- La navigation vers l'écran de création est bloquée

```javascript
const handleCreateVote = () => {
  if (hasActiveVote()) {
    Alert.alert(
      'Vote actif existant',
      'Il y a déjà un vote en cours dans cette room. Attendez qu\'il se termine pour en créer un nouveau.',
      [{ text: 'OK' }]
    );
    return;
  }
  
  closeFabMenu();
  navigation.navigate('CreateVote', { roomId });
};
```

## 🎯 Styles ajoutés

```javascript
fabMenuItemDisabled: {
  opacity: 0.5,
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
},
fabMenuIconDisabled: {
  opacity: 0.5,
},
fabMenuTextDisabled: {
  opacity: 0.5,
},
fabMenuDescriptionDisabled: {
  opacity: 0.5,
},
```

## ✅ Fonctionnalités

### ✓ Prévention côté serveur
- Impossible de créer deux votes actifs simultanément
- Erreur 409 avec détails du vote existant

### ✓ Interface utilisateur intuitive
- Indication visuelle claire de l'état désactivé
- Message contextuel adapté
- Feedback explicatif pour l'utilisateur

### ✓ Gestion d'erreur côté client
- L'app mobile gère l'erreur 409 du serveur
- Message d'alerte informatif
- Navigation bloquée si nécessaire

## 🧪 Tests

### Test automatique
Utilisez le script `test-active-vote-simple.js` pour vérifier la logique :

```bash
node test-active-vote-simple.js
```

### Test manuel
1. Créer un vote dans une room
2. Vérifier que le bouton "Créer un vote" est désactivé
3. Essayer de créer un autre vote (alerte affichée)
4. Terminer le premier vote
5. Vérifier que le bouton redevient actif

## 📱 Expérience utilisateur

### État normal (aucun vote actif)
- ✅ Bouton "Créer un vote" activé
- 💬 Description: "Proposer des films"
- 🎯 Navigation directe vers CreateVoteScreen

### État avec vote actif
- ❌ Bouton "Créer un vote" désactivé visuellement
- 💬 Description: "Vote en cours..."
- ⚠️ Alerte si tentative de clic
- 🚫 Navigation bloquée

## 🔄 Cycle de vie d'un vote

1. **Création**: Un seul vote actif autorisé
2. **En cours**: Bouton désactivé, feedback visuel
3. **Terminé/Expiré**: Bouton redevient disponible
4. **Nouveau vote**: Peut être créé normalement

Cette implémentation garantit une expérience utilisateur cohérente et prévient les conflits entre votes multiples.
