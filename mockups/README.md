# Maquettes HTML - WatchParty

Ce dossier contient les maquettes HTML interactives de l'application WatchParty. Ces maquettes permettent de visualiser l'interface utilisateur et de tester les interactions avant l'implémentation finale.

## Pages disponibles

### 1. [Accueil](./home.html) - `home.html`
- Écran de bienvenue de l'application
- Formulaire de création de room
- Formulaire de connexion à une room existante
- Interface simple et épurée

**Fonctionnalités :**
- Création d'une nouvelle room avec nom personnalisé
- Rejoindre une room avec un code (ex: ABC123)
- Validation des formulaires
- Navigation vers la room

### 2. [Room](./room.html) - `room.html`
- Interface principale de gestion de la WatchParty
- Navigation par onglets (WatchParty, Recherche, Paramètres)
- Liste des médias avec filtres
- Statuts de progression

**Fonctionnalités :**
- Affichage de la WatchParty avec différents statuts
- Filtres par type de média (Tous, Films, Séries, Manga)
- Navigation entre onglets
- Bouton d'ajout flottant (FAB)
- Navigation bottom tabs

### 3. [Recherche](./search.html) - `search.html`
- Interface de recherche de médias
- Filtres par type de contenu
- Résultats de recherche avec détails
- Ajout direct à la WatchParty

**Fonctionnalités :**
- Barre de recherche en temps réel
- Filtrage par type (Films, Séries, Manga)
- Affichage des résultats avec posters, descriptions et notes
- Bouton d'ajout pour chaque résultat
- États de chargement et messages d'erreur

### 4. [Paramètres](./settings.html) - `settings.html`
- Configuration de la room et de l'application
- Informations et statistiques de la room
- Préférences utilisateur
- Actions de gestion (export/import/suppression)

**Fonctionnalités :**
- Informations détaillées de la room (code, date de création, statistiques)
- Toggles pour les préférences (notifications, mode sombre, etc.)
- Actions de partage et d'export/import
- Suppression de room avec confirmation modal
- Informations de version

### 5. [Détail du média](./detail.html) - `detail.html`
- Page de détail d'un film, série ou manga
- Informations complètes du média
- Gestion du statut de visionnage
- Actions (ajout, partage)

**Fonctionnalités :**
- Affichage détaillé avec poster et métadonnées
- Sélection du statut de visionnage
- Informations étendues (réalisateur, acteurs, budget, etc.)
- Tags de genres
- Système de toast pour les notifications
- Boutons de partage natif

## Design et UX

### Thème
- **Mode sombre** par défaut
- **Couleur primaire :** #6200EE (violet Material Design)
- **Couleur secondaire :** #03DAC6 (teal)
- **Arrière-plan :** #121212 (noir profond)

### Navigation
- **Bottom Navigation** pour les sections principales
- **Tabs** pour les sous-sections dans les écrans
- **Navigation en pile** pour les détails

### Composants
- **Cards** pour les éléments de liste
- **FAB (Floating Action Button)** pour l'ajout rapide
- **Badges** pour les types et statuts
- **Modals** pour les confirmations
- **Toast** pour les notifications

### Responsive
- Optimisé pour mobile (360-420px)
- Adaptable aux différentes tailles d'écran
- Interface tactile avec zones de touch appropriées

## Technologies utilisées

- **HTML5** sémantique
- **CSS3** avec Flexbox et Grid
- **JavaScript ES6+** pour les interactions
- **API Web natives** (Share, Clipboard, File)
- **Animations CSS** pour les transitions

## Test des maquettes

1. Ouvrir les fichiers HTML dans un navigateur web
2. Tester sur différents appareils/tailles d'écran
3. Vérifier les interactions et animations
4. Valider l'UX et l'accessibilité

## Notes d'implémentation

Ces maquettes servent de référence pour :
- L'implémentation React Native
- La définition des composants UI
- Les spécifications d'animation
- L'architecture de navigation
- Les états d'interface (loading, empty, error)

## Utilisation

Pour visualiser les maquettes, ouvrir simplement les fichiers HTML dans un navigateur. La navigation entre pages fonctionne via les liens et boutons.

**Navigation recommandée :**
1. Commencer par `home.html`
2. Créer ou rejoindre une room → `room.html`
3. Explorer les onglets et fonctionnalités
4. Tester la recherche → `search.html`
5. Consulter les paramètres → `settings.html`
6. Voir les détails d'un média → `detail.html`
