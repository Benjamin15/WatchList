# Guide de Test - Intégration des Images

## 🎯 Objectif
Valider que l'application mobile affiche désormais des images réelles (affiches/posters) au lieu d'emojis pour les films, séries et mangas.

## 📱 Test Mobile - Instructions

### 1. Démarrage de l'application
```bash
cd mobile
npm start
```

### 2. Tests des images avec room existante
Une room de test a été créée avec un média contenant une image :

**Code de room à utiliser : `0e74a10517ae`**

#### Étapes :
1. Ouvrir l'application mobile
2. Cliquer sur "Rejoindre une room"
3. Entrer le code : `0e74a10517ae`
4. Vérifier l'affichage du média "Spider-Man: No Way Home"

#### Résultats attendus :
- ✅ **Image visible** : Affiche du film Spider-Man au lieu d'un emoji
- ✅ **Qualité** : Image nette et bien cadrée
- ✅ **Fallback** : Si l'image ne charge pas, emoji 🎬 affiché

### 3. Test de recherche avec images
1. Dans la room, cliquer sur le bouton "+" (ajout de média)
2. Rechercher "spider-man"
3. Vérifier que les résultats affichent des images

#### Résultats attendus :
- ✅ **Images dans les résultats** : Affiches visibles pour chaque film
- ✅ **Variété** : Différentes images pour différents films Spider-Man
- ✅ **Fallback** : Emojis si certaines images ne chargent pas

### 4. Test de création de room et recherche
1. Créer une nouvelle room
2. Ajouter des médias via la recherche :
   - Rechercher "inception"
   - Rechercher "breaking bad"
   - Rechercher "one piece"

#### Résultats attendus :
- ✅ **Films** : Images d'affiches avec emoji 🎬 en fallback
- ✅ **Séries** : Images d'affiches avec emoji 📺 en fallback
- ✅ **Mangas** : Images de couvertures avec emoji 📚 en fallback

### 5. Test de gestion d'erreur
Pour tester le fallback, vous pouvez :
1. Désactiver temporairement le WiFi
2. Rechercher et ajouter des médias
3. Vérifier que les emojis s'affichent correctement

## 🔧 Test Backend - Validation des URLs

### Script de test automatique
```bash
./test-images.sh
```

### Vérification manuelle
```bash
# Test de recherche avec images
curl -s "http://localhost:3000/api/search/autocomplete/movie/spider-man" | jq '.results[] | {title, image_url}'

# Test d'items avec images
curl -s "http://localhost:3000/api/rooms/0e74a10517ae/items" | jq '.items[] | {title, image_url}'
```

## 📊 Critères de succès

### ✅ Fonctionnalités validées
- [ ] **Images visibles** dans RoomScreen
- [ ] **Images visibles** dans SearchScreen
- [ ] **Fallback emoji** en cas d'erreur
- [ ] **Pas de crash** si image_url est null
- [ ] **Chargement fluide** des images
- [ ] **Qualité d'affichage** correcte

### ✅ Types de médias testés
- [ ] **Films** : Affiches TMDB
- [ ] **Séries** : Affiches TMDB
- [ ] **Mangas** : Couvertures (si disponibles)

### ✅ Scénarios d'erreur
- [ ] **URL invalide** : Fallback emoji
- [ ] **Pas d'URL** : Affichage emoji direct
- [ ] **Erreur réseau** : Basculement vers emoji
- [ ] **Timeout** : Gestion gracieuse

## 🐛 Troubleshooting

### Si les images ne s'affichent pas
1. Vérifier la connexion internet
2. Vérifier que le backend est démarré
3. Vérifier les logs mobile pour les erreurs

### Si l'application crash
1. Vérifier les imports d'expo-image
2. Vérifier que expo-image est installé
3. Redémarrer Metro bundler

### Si les emojis ne s'affichent pas
1. Vérifier la fonction `renderMediaPoster`
2. Vérifier les conditions de fallback
3. Vérifier les types de médias

## 📝 Rapport de test

Après les tests, documenter :
- ✅ Fonctionnalités qui marchent
- ❌ Problèmes identifiés
- 📋 Améliorations suggérées

## 🔄 Prochaines étapes possibles

1. **Cache d'images** : Améliorer les performances
2. **Placeholder** : Indicateur de chargement
3. **Retry logic** : Réessayer en cas d'erreur
4. **Optimisation** : Différentes tailles d'images
5. **Offline support** : Gestion mode hors ligne

---

**Room de test disponible : `0e74a10517ae`**
**Média de test : Spider-Man: No Way Home avec image**
