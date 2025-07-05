# Maquette : Vue de détail d'un film/série

## 📱 Interface Mobile - MediaDetailScreen

### Structure visuelle proposée :

```
┌─────────────────────────────────────┐
│ [←] Titre du film/série          [⋮] │ ← Header avec retour
├─────────────────────────────────────┤
│                                     │
│        [IMAGE POSTER]               │ ← Image poster centrée
│         320x480px                   │   avec fallback
│                                     │
├─────────────────────────────────────┤
│ 🎬 The Matrix                       │ ← Titre principal
│ 📅 1999 • 🎭 Science-Fiction        │ ← Année + Genre
│ ⭐ 8.7/10 (15,234 votes)            │ ← Note TMDB
├─────────────────────────────────────┤
│                                     │
│ [▶️ REGARDER LA BANDE-ANNONCE]      │ ← Bouton trailer (si disponible)
│                                     │
├─────────────────────────────────────┤
│ 📝 Synopsis                         │ ← Section description
│ Un pirate informatique apprend      │
│ que la réalité qu'il connaît est    │
│ une simulation...                   │
│                                     │
│ [Voir plus]                         │ ← Expand/collapse
├─────────────────────────────────────┤
│                                     │
│ 🎯 Actions                          │ ← Section actions
│                                     │
│ [➕ AJOUTER À LA WATCHLIST]         │ ← Bouton principal
│                                     │
│ Statut: [À regarder ▼]              │ ← Dropdown statut
│                                     │
├─────────────────────────────────────┤
│ ℹ️ Informations                     │ ← Section infos
│                                     │
│ Durée: 2h 16min                     │
│ Sortie: 31 mars 1999                │
│ Réalisateur: The Wachowskis         │
│ Acteurs: Keanu Reeves, Laurence...  │
│                                     │
└─────────────────────────────────────┘
```

## 🎨 Spécifications de design

### Couleurs
- **Background**: `#121212` (dark theme)
- **Surface**: `#1E1E1E` (cards)
- **Primary**: `#6200EE` (boutons principaux)
- **Secondary**: `#03DAC6` (accents)
- **Text primary**: `#FFFFFF`
- **Text secondary**: `#AAAAAA`

### Typographie
- **Titre**: 24px, bold
- **Sous-titre**: 16px, medium
- **Corps**: 14px, regular
- **Métadonnées**: 12px, medium

### Éléments interactifs
1. **Bouton trailer**: 
   - Couleur primary avec icône play
   - Visible uniquement si trailer disponible
   - Ouvre le trailer en fullscreen

2. **Bouton ajout watchlist**:
   - Vert si pas encore ajouté
   - Gris si déjà ajouté
   - Animation de feedback

3. **Dropdown statut**:
   - Options: À regarder, En cours, Terminé, Abandonné
   - Couleur selon le statut

## 🛠️ Fonctionnalités

### Données à récupérer
- **Depuis TMDB**:
  - Détails du film/série
  - Trailers/vidéos
  - Crédits (réalisateur, acteurs)
  - Genres
  - Note et nombre de votes

- **Depuis votre API**:
  - Statut dans la watchlist
  - Présence dans la room actuelle

### Navigation
- **Entrée**: Depuis SearchScreen ou RoomScreen
- **Paramètres**: `{ tmdbId, mediaType, title }`
- **Retour**: Header avec bouton back

### États
1. **Loading**: Skeleton des éléments
2. **Loaded**: Contenu complet
3. **Error**: Fallback avec retry

## 📋 Props du composant

```typescript
interface MediaDetailScreenProps {
  route: {
    params: {
      tmdbId: number;
      mediaType: 'movie' | 'tv';
      title: string;
      roomId?: string;
    };
  };
  navigation: NavigationProp;
}
```

## 🎬 Gestion des trailers

### Logique d'affichage
- Prioriser les trailers YouTube
- Filtrer par type: "Trailer" > "Teaser" > "Clip"
- Langue: français puis anglais
- Bouton visible uniquement si trailer disponible

### Lecture
- Ouvrir dans une WebView fullscreen
- Ou utiliser un package comme `react-native-youtube`
- Contrôles de lecture intégrés

Voulez-vous que je commence par implémenter cette vue ou souhaitez-vous des modifications sur la maquette ?
