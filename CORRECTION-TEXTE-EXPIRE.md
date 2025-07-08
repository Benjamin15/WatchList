# 🔧 CORRECTION DU TEXTE "EXPIRÉ" - RoomScreen ligne 1705

## 📋 Problème signalé
**Localisation :** RoomScreen.tsx ligne 1705  
**Texte français :** "Expiré"  
**Problème :** Texte français en dur au lieu d'utiliser la traduction dynamique

## 🔧 Solution appliquée

### 1. Correction du texte français
**Avant :**
```typescript
if (diffMs <= 0) {
  return 'Expiré';
}
```

**Après :**
```typescript
if (diffMs <= 0) {
  return t('vote.expired');
}
```

### 2. Améliorations supplémentaires
La fonction `getVoteTimeRemaining` a été entièrement modernisée pour utiliser les traductions dynamiques :

```typescript
const getVoteTimeRemaining = (vote: Vote) => {
  if (!vote.endsAt) {
    return t('vote.permanent');  // au lieu de 'Permanent'
  }

  const now = new Date();
  const endsAt = new Date(vote.endsAt);
  const diffMs = endsAt.getTime() - now.getTime();

  if (diffMs <= 0) {
    return t('vote.expired');  // au lieu de 'Expiré'
  }

  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (diffHours > 24) {
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}${t('common.days')} ${diffHours % 24}${t('common.hours')}`;
  } else if (diffHours > 0) {
    return `${diffHours}${t('common.hours')} ${diffMinutes}${t('common.minutes')}`;
  } else {
    return `${diffMinutes}${t('common.minutes')}`;
  }
};
```

### 3. Clés de traduction ajoutées

**Clés ajoutées dans tous les fichiers de langue (fr, en, es, pt) :**

#### vote.permanent
- 🇫🇷 `"permanent": "Permanent"`
- 🇬🇧 `"permanent": "Permanent"`
- 🇪🇸 `"permanent": "Permanente"`
- 🇵🇹 `"permanent": "Permanente"`

#### Unités de temps (common.days, common.hours, common.minutes)
- 🇫🇷 `"days": "j", "hours": "h", "minutes": "m"`
- 🇬🇧 `"days": "d", "hours": "h", "minutes": "m"`
- 🇪🇸 `"days": "d", "hours": "h", "minutes": "m"`
- 🇵🇹 `"days": "d", "hours": "h", "minutes": "m"`

## ✅ Validation

### Tests automatiques
- ✅ **Aucun texte "Expiré" en français trouvé**
- ✅ **La traduction t('vote.expired') est présente**
- ✅ **Aucun autre texte français détecté dans les vérifications**

### Clés de traduction
- ✅ **vote.expired** - Déjà présente dans tous les fichiers
- ✅ **vote.permanent** - Ajoutée dans tous les fichiers
- ✅ **common.days/hours/minutes** - Ajoutées dans tous les fichiers

## 🎯 Résultat

Le texte français "Expiré" à la ligne 1705 de RoomScreen.tsx a été **complètement corrigé** et remplacé par le système de traduction dynamique. 

La fonction `getVoteTimeRemaining` utilise maintenant :
- `t('vote.expired')` au lieu de "Expiré"
- `t('vote.permanent')` au lieu de "Permanent"  
- `t('common.days')`, `t('common.hours')`, `t('common.minutes')` pour les unités

**Statut :** ✅ **CORRIGÉ**
