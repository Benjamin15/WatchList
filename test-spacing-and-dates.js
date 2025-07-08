#!/usr/bin/env node

/**
 * Script de test pour valider l'espacement amélioré et la suppression des dates
 * Vérifie l'ajout d'espace entre miniature et texte, et la suppression des dates
 */

const fs = require('fs');
const path = require('path');

console.log('📐 Test de l\'espacement et suppression des dates...\n');

// Fichiers à vérifier
const filesToCheck = [
  {
    file: './mobile/src/screens/RoomScreen.tsx',
    name: 'RoomScreen.tsx'
  },
  {
    file: './mobile/src/screens/CreateVoteScreen.tsx',
    name: 'CreateVoteScreen.tsx'
  },
  {
    file: './mobile/src/screens/VoteDetailScreen.tsx',
    name: 'VoteDetailScreen.tsx'
  }
];

// Vérifications d'espacement à effectuer
const spacingChecks = [
  {
    pattern: /marginRight:\s*SPACING\.lg,/,
    description: 'Marge droite poster augmentée (lg au lieu de md)',
    files: ['RoomScreen.tsx']
  },
  {
    pattern: /paddingLeft:\s*SPACING\.sm,/,
    description: 'Padding gauche contenu augmenté (sm au lieu de xs)',
    files: ['RoomScreen.tsx']
  }
];

// Vérifications de suppression des dates
const dateRemovalChecks = [
  {
    pattern: /\{item\.media\.genre\}/,
    description: 'Affichage du genre seul (sans année)',
    files: ['RoomScreen.tsx', 'CreateVoteScreen.tsx']
  },
  {
    pattern: /\{option\.media\.genre\}/,
    description: 'Affichage du genre seul dans les options de vote',
    files: ['VoteDetailScreen.tsx']
  },
  {
    pattern: /\{selectedOption\.media\.genre\}/,
    description: 'Affichage du genre seul dans la sélection',
    files: ['VoteDetailScreen.tsx']
  }
];

// Vérifications négatives (ne doit PAS être trouvé)
const negativeChecks = [
  {
    pattern: /\{item\.media\.year\}\s*\{item\.media\.genre\}/,
    description: 'Année supprimée des cartes de média',
    files: ['RoomScreen.tsx', 'CreateVoteScreen.tsx']
  },
  {
    pattern: /\{option\.media\.year\}\s*•\s*\{option\.media\.genre\}/,
    description: 'Année supprimée des options de vote',
    files: ['VoteDetailScreen.tsx']
  },
  {
    pattern: /\{selectedOption\.media\.year\}\s*•\s*\{selectedOption\.media\.genre\}/,
    description: 'Année supprimée de la sélection',
    files: ['VoteDetailScreen.tsx']
  }
];

let totalChecks = 0;
let passedChecks = 0;

// Lire et vérifier chaque fichier
for (const fileInfo of filesToCheck) {
  const filePath = path.resolve(fileInfo.file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`❌ Fichier non trouvé: ${fileInfo.name}`);
    continue;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  console.log(`📄 Vérification de ${fileInfo.name}:`);
  
  // Vérifier l'espacement
  const relevantSpacingChecks = spacingChecks.filter(check => check.files.includes(fileInfo.name));
  for (const check of relevantSpacingChecks) {
    totalChecks++;
    const found = check.pattern.test(content);
    
    if (found) {
      console.log(`  ✅ ${check.description}`);
      passedChecks++;
    } else {
      console.log(`  ❌ ${check.description}`);
    }
  }
  
  // Vérifier la suppression des dates (positives)
  const relevantDateChecks = dateRemovalChecks.filter(check => check.files.includes(fileInfo.name));
  for (const check of relevantDateChecks) {
    totalChecks++;
    const found = check.pattern.test(content);
    
    if (found) {
      console.log(`  ✅ ${check.description}`);
      passedChecks++;
    } else {
      console.log(`  ❌ ${check.description}`);
    }
  }
  
  // Vérifier que les dates ne sont PAS affichées (négatives)
  const relevantNegativeChecks = negativeChecks.filter(check => check.files.includes(fileInfo.name));
  for (const check of relevantNegativeChecks) {
    totalChecks++;
    const found = check.pattern.test(content);
    
    if (!found) {
      console.log(`  ✅ ${check.description}`);
      passedChecks++;
    } else {
      console.log(`  ❌ ${check.description} (trouvé mais ne devrait pas l'être)`);
    }
  }
  
  console.log('');
}

// Vérifications supplémentaires spécifiques
console.log('🔍 Vérifications spécifiques:');

const roomScreenPath = path.resolve('./mobile/src/screens/RoomScreen.tsx');
if (fs.existsSync(roomScreenPath)) {
  const roomContent = fs.readFileSync(roomScreenPath, 'utf8');
  
  // Vérifier que l'espacement global est amélioré
  const hasImprovedSpacing = roomContent.includes('marginRight: SPACING.lg') && 
                             roomContent.includes('paddingLeft: SPACING.sm');
  
  // Vérifier que les dates ne sont plus affichées
  const datesRemoved = !roomContent.includes('{item.media.year} {item.media.genre}');
  
  // Vérifier que le genre seul est affiché
  const genreOnlyDisplayed = roomContent.includes('{item.media.genre}') && 
                             roomContent.includes('<Text style={styles.meta}>{item.media.genre}</Text>');
  
  totalChecks += 3;
  
  if (hasImprovedSpacing) {
    console.log('  ✅ Espacement entre miniature et texte amélioré');
    passedChecks++;
  } else {
    console.log('  ❌ Espacement entre miniature et texte amélioré');
  }
  
  if (datesRemoved) {
    console.log('  ✅ Dates supprimées des cartes');
    passedChecks++;
  } else {
    console.log('  ❌ Dates supprimées des cartes');
  }
  
  if (genreOnlyDisplayed) {
    console.log('  ✅ Genre seul affiché dans les métadonnées');
    passedChecks++;
  } else {
    console.log('  ❌ Genre seul affiché dans les métadonnées');
  }
}

console.log('\n📊 Résultat des tests d\'espacement et dates:');
console.log(`✅ Tests réussis: ${passedChecks}/${totalChecks}`);
console.log(`📈 Taux de réussite: ${Math.round((passedChecks / totalChecks) * 100)}%`);

if (passedChecks === totalChecks) {
  console.log('\n🎉 Tous les ajustements d\'espacement et suppression des dates sont corrects !');
  console.log('📐 L\'interface est plus aérée et épurée.');
} else {
  console.log('\n⚠️  Certains ajustements manquent ou sont incorrects.');
  console.log('🔧 Vérifiez les patterns non trouvés ci-dessus.');
}

console.log('\n📝 Améliorations appliquées:');
console.log('📐 Espacement amélioré:');
console.log('  • Marge droite poster: md → lg (+50%)');
console.log('  • Padding gauche contenu: xs → sm (+100%)');
console.log('  • Plus d\'espace entre miniature et texte');
console.log('');
console.log('📅 Interface épurée:');
console.log('  • Dates supprimées des cartes RoomScreen');
console.log('  • Dates supprimées des options CreateVoteScreen');
console.log('  • Dates supprimées des options VoteDetailScreen');
console.log('  • Affichage du genre seul (plus propre)');
console.log('  • Moins d\'encombrement visuel');
