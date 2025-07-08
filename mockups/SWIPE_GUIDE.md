# Guide d'utilisation du Swipe dans WatchParty

## Fonctionnalité de Swipe

La maquette `room.html` intègre maintenant une fonctionnalité de swipe (glissement) qui permet de déplacer facilement les médias entre les différents statuts.

### Comment utiliser le swipe :

#### 📱 Sur mobile/tablette :
- **Glissez vers la droite** : Avancer le média au statut suivant
- **Glissez vers la gauche** : Reculer le média au statut précédent

#### 🖥️ Sur desktop :
- **Cliquez et faites glisser vers la droite** : Avancer le média au statut suivant
- **Cliquez et faites glisser vers la gauche** : Reculer le média au statut précédent

### Ordre des statuts :
1. **À regarder** (planned)
2. **En cours** (watching) 
3. **Terminé** (completed)

### Indications visuelles :

- **Indicateur de swipe** : Chaque média affiche des flèches (◀️▶️, ▶️, ◀️) selon les directions disponibles
- **Feedback visuel** : Pendant le swipe, le média change de couleur :
  - 🟢 Vert : Avancer vers le statut suivant
  - 🔵 Bleu : Reculer vers le statut précédent
- **Hint contextuel** : Un message apparaît en haut de l'écran pour indiquer l'action
- **Notification** : Une notification confirme le déplacement après l'action

### Seuils de déclenchement :
- **Déplacement minimum** : 50px pour l'indication visuelle
- **Déplacement de confirmation** : 100px pour effectuer le changement de statut

### Exemples d'utilisation :

1. **Déplacer "One Piece" de "À regarder" vers "En cours"** :
   - Glissez vers la droite sur l'élément "One Piece"
   - L'élément devient bleu avec l'indication "Avancer vers En cours"
   - Relâchez pour confirmer le déplacement

2. **Déplacer "Breaking Bad" de "Terminé" vers "En cours"** :
   - Glissez vers la gauche sur l'élément "Breaking Bad"
   - L'élément devient vert avec l'indication "Reculer vers En cours"
   - Relâchez pour confirmer le déplacement

### Fonctionnalités techniques :

- **Gestion tactile** : Support des événements touch pour mobile
- **Gestion souris** : Support des événements mouse pour desktop
- **Données persistantes** : Les changements sont sauvegardés en mémoire
- **Animations fluides** : Transitions CSS pour un feedback visuel optimal
- **Gestion des erreurs** : Prévention des swipes invalides (ex: pas de recul depuis "À regarder")

### Configuration :

Les données des médias sont stockées dans l'objet `mediaData` du JavaScript et peuvent être facilement modifiées pour ajouter/supprimer des médias ou changer leurs statuts par défaut.

### Intégration future :

Cette implémentation peut servir de base pour l'intégration dans l'application React Native, en adaptant :
- Les événements tactiles de React Native
- La gestion d'état (Redux/Context)
- Les animations natives
- La persistence des données via l'API
