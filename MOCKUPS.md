# Maquettes UI Mobile - WatchList

## Vue d'ensemble de l'application

L'application WatchList mobile sera organisée autour de plusieurs écrans principaux :

## 1. 🏠 Écran d'accueil (Home)

```
┌─────────────────────────────┐
│ ⬅️  WatchList        🔍 ➕   │
├─────────────────────────────┤
│                             │
│                             │
│    🎬 Créer une room        │
│    ┌─────────────────────┐   │
│    │ Nom de la room      │   │
│    └─────────────────────┘   │
│    [Créer]                  │
│                             │
│                             │
│    📱 Rejoindre une room    │
│    ┌─────────────────────┐   │
│    │ Code de la room     │   │
│    └─────────────────────┘   │
│    [Rejoindre]              │
│                             │
│                             │
│                             │
│                             │
│                             │
│                             │
│                             │
└─────────────────────────────┘
```

## 2. 📝 Écran Room (Liste des items)

```
┌─────────────────────────────┐
│ ⬅️  Mes Films         🔍 ➕   │
├─────────────────────────────┤
│ 📋 Code: ABC123             │
├─────────────────────────────┤
│                             │
│ [À voir] [En cours] [Vus]   │
│                             │
│ ┌─────────────────────────┐  │
│ │ 🎬 Avatar               │  │
│ │ 2009 • Action, SF       │  │
│ │ [▶️ À voir]             │  │
│ └─────────────────────────┘  │
│                             │
│ ┌─────────────────────────┐  │
│ │ 🎭 The Dark Knight      │  │
│ │ 2008 • Action, Drame    │  │
│ │ [⏸️ En cours]           │  │
│ └─────────────────────────┘  │
│                             │
│ ┌─────────────────────────┐  │
│ │ ✅ Inception            │  │
│ │ 2010 • SF, Thriller    │  │
│ │ [✅ Vu] ⭐⭐⭐⭐⭐        │  │
│ └─────────────────────────┘  │
│                             │
│ [🎬 Films][📺 Séries][📚 Manga] │
└─────────────────────────────┘
```

## 2.1. 📝 Écran Room - Filtrage par type

### Vue "Films uniquement"
```
┌─────────────────────────────┐
│ ⬅️  Mes Films         🔍 ➕   │
├─────────────────────────────┤
│ 📋 Code: ABC123             │
├─────────────────────────────┤
│                             │
│ [À voir] [En cours] [Vus]   │
│                             │
│ ┌─────────────────────────┐  │
│ │ ┌───┐ Avatar            │  │
│ │ │🎬 │ 2009 • Action, SF │  │
│ │ │IMG│ [▶️ À voir]       │  │
│ │ └───┘                   │  │
│ └─────────────────────────┘  │
│                             │
│ ┌─────────────────────────┐  │
│ │ ┌───┐ The Dark Knight   │  │
│ │ │🎬 │ 2008 • Action     │  │
│ │ │IMG│ [⏸️ En cours]     │  │
│ │ └───┘                   │  │
│ └─────────────────────────┘  │
│                             │
│ [🎬 Films][📺 Séries][📚 Manga] │
│ [  ACTIF  ][        ][        ] │
└─────────────────────────────┘
```

### Vue "Manga uniquement"  
```
┌─────────────────────────────┐
│ ⬅️  Mes Films         🔍 ➕   │
├─────────────────────────────┤
│ 📋 Code: ABC123             │
├─────────────────────────────┤
│                             │
│ [À voir] [En cours] [Vus]   │
│                             │
│ ┌─────────────────────────┐  │
│ │ ┌───┐ One Piece         │  │
│ │ │📚 │ Oda • Shonen      │  │
│ │ │IMG│ [▶️ À voir]       │  │
│ │ └───┘ Tome 1/108        │  │
│ └─────────────────────────┘  │
│                             │
│ ┌─────────────────────────┐  │
│ │ ┌───┐ Naruto            │  │
│ │ │📚 │ Kishimoto • Act.  │  │
│ │ │IMG│ [✅ Vu] ⭐⭐⭐⭐⭐   │  │
│ │ └───┘ Tome 72/72        │  │
│ └─────────────────────────┘  │
│                             │
│ [🎬 Films][📺 Séries][📚 Manga] │
│ [        ][        ][ ACTIF ] │
└─────────────────────────────┘
```

## 3. 🔍 Écran de recherche

```
┌─────────────────────────────┐
│ ⬅️  Ajouter un item          │
├─────────────────────────────┤
│ ┌─────────────────────────┐  │
│ │ 🔍 Rechercher...        │  │
│ └─────────────────────────┘  │
│                             │
│ [Films] [Séries] [Manga]    │
│                             │
│ Résultats pour "avatar":    │
│                             │
│ ┌─────────────────────────┐  │
│ │ ┌───┐ Avatar            │  │
│ │ │🎬 │ 2009 • James C.   │  │
│ │ │IMG│ ⭐ 7.8/10         │  │
│ │ └───┘ [+ Ajouter]       │  │
│ └─────────────────────────┘  │
│                             │
│ ┌─────────────────────────┐  │
│ │ ┌───┐ Avatar: La Voie.. │  │
│ │ │🎬 │ 2022 • James C.   │  │
│ │ │IMG│ ⭐ 7.6/10         │  │
│ │ └───┘ [+ Ajouter]       │  │
│ └─────────────────────────┘  │
│                             │
│ ┌─────────────────────────┐  │
│ │ ┌───┐ Avatar: The Last..│  │
│ │ │📺 │ 2005 • Série ani. │  │
│ │ │IMG│ ⭐ 9.3/10         │  │
│ │ └───┘ [+ Ajouter]       │  │
│ └─────────────────────────┘  │
│                             │
└─────────────────────────────┘
```

## 4. 📱 Détails d'un item

```
┌─────────────────────────────┐
│ ⬅️  Avatar              ⚙️   │
├─────────────────────────────┤
│                             │
│    ┌─────────────────┐       │
│    │                 │       │
│    │   [Poster du    │       │
│    │    film/série]  │       │
│    │                 │       │
│    └─────────────────┘       │
│                             │
│ 🎬 Avatar                   │
│ ⭐ 7.8/10 • 2h 42min        │
│ 🏷️ Action, SF, Aventure     │
│                             │
│ Statut: [▶️ À voir ▼]        │
│                             │
│ 📝 Synopsis:                │
│ Un marine paraplégique,     │
│ envoyé sur la lune Pandora  │
│ pour une mission unique...  │
│                             │
│ 🎭 Réalisateur:             │
│ James Cameron               │
│                             │
│ 📅 Sortie: 18 déc. 2009     │
│                             │
│ [🗑️ Supprimer] [💬 Commenter] │
│                             │
└─────────────────────────────┘
```

## 5. ⚙️ Paramètres de la room

```
┌─────────────────────────────┐
│ ⬅️  Paramètres              │
├─────────────────────────────┤
│                             │
│ 📋 Informations             │
│ ┌─────────────────────────┐  │
│ │ Nom: Mes Films          │  │
│ └─────────────────────────┘  │
│ ┌─────────────────────────┐  │
│ │ Code: ABC123            │  │
│ │ [📋 Copier le code]     │  │
│ └─────────────────────────┘  │
│                             │
│ � Statistiques             │
│ • 12 items au total         │
│ • 5 à voir                  │
│ • 3 en cours                │
│ • 4 vus                     │
│                             │
│ 🎬 Films: 8 items           │
│ 📺 Séries: 3 items          │
│ 📚 Manga: 1 item            │
│                             │
│ 🔧 Actions                  │
│ [📤 Partager le code]       │
│ [📋 Exporter la liste]      │
│ [�️ Supprimer la room]      │
│                             │
└─────────────────────────────┘
```

## Palette de couleurs suggérée

```css
/* Couleurs principales */
--primary: #6366f1      /* Indigo pour les actions principales */
--secondary: #8b5cf6    /* Violet pour les accents */
--success: #10b981      /* Vert pour "Vu" */
--warning: #f59e0b      /* Orange pour "En cours" */
--info: #3b82f6         /* Bleu pour "À voir" */

/* Couleurs neutres */
--background: #ffffff   /* Fond principal */
--surface: #f8fafc      /* Cartes et surfaces */
--text-primary: #1e293b /* Texte principal */
--text-secondary: #64748b /* Texte secondaire */
--border: #e2e8f0       /* Bordures */

/* Couleurs sombres (mode sombre) */
--dark-bg: #0f172a      /* Fond sombre */
--dark-surface: #1e293b  /* Surfaces sombres */
--dark-text: #f1f5f9    /* Texte sur fond sombre */
```

## Navigation et interactions

### Navigation principale:
- **Tab Bar** en bas: Home, Recherche, Mes Rooms, Profil
- **Stack Navigation** pour les détails et sous-écrans

### Interactions clés:
- **Swipe** sur les items pour actions rapides (marquer vu, supprimer)
- **Pull to refresh** sur les listes
- **Long press** pour options contextuelles
- **Partage** via le code de room
- **Notifications** pour les ajouts d'autres utilisateurs

### États des items:
- 🔵 **À voir** - Bleu
- 🟡 **En cours** - Orange  
- 🟢 **Vu** - Vert

Que pensez-vous de ces maquettes ? Souhaitez-vous que je détaille certains écrans ou que j'explore d'autres aspects de l'UI ?
