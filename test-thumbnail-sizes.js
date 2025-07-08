#!/usr/bin/env node

/**
 * Script de test pour valider les tailles des miniatures de films
 * Vérifie que les tailles sont correctement configurées dans tous les composants
 */

const fs = require('fs');
const path = require('path');

console.log('🎬 Test des tailles des miniatures de films...\n');

// Fichiers à vérifier
const filesToCheck = [
  {
    file: './mobile/src/components/MediaPoster.tsx',
    name: 'MediaPoster.tsx'
  },
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

// Vérifications des tailles à effectuer
const sizeChecks = [
  {
    pattern: /small.*width:\s*50.*height:\s*75/s,
    description: 'Taille small améliorée (50x75)',
    files: ['MediaPoster.tsx']
  },
  {
    pattern: /medium.*width:\s*70.*height:\s*105/s,
    description: 'Taille medium optimisée (70x105)',
    files: ['MediaPoster.tsx']
  },
  {
    pattern: /large.*width:\s*90.*height:\s*135/s,
    description: 'Taille large agrandie (90x135)',
    files: ['MediaPoster.tsx']
  },
  {
    pattern: /xlarge.*width:\s*110.*height:\s*165/s,
    description: 'Taille xlarge ajoutée (110x165)',
    files: ['MediaPoster.tsx']
  },
  {
    pattern: /size="medium"/,
    description: 'RoomScreen utilise la taille medium',
    files: ['RoomScreen.tsx']
  },
  {
    pattern: /size="small"/,
    description: 'Autres écrans utilisent small',
    files: ['CreateVoteScreen.tsx', 'VoteDetailScreen.tsx']
  }
];

// Vérifications de cohérence CSS
const cssChecks = [
  {
    pattern: /poster:\s*\{[^}]*width:\s*70[^}]*height:\s*105/s,
    description: 'Conteneur poster RoomScreen (70x105)',
    files: ['RoomScreen.tsx']
  },
  {
    pattern: /case 'small':\s*return 20/,
    description: 'Emoji small agrandis (20px)',
    files: ['MediaPoster.tsx']
  },
  {
    pattern: /case 'medium':\s*return 28/,
    description: 'Emoji medium agrandis (28px)',
    files: ['MediaPoster.tsx']
  }
];

let totalChecks = 0;
let passedChecks = 0;

// Fonction pour vérifier les patterns multi-lignes
function testMultilinePattern(pattern, content) {
  if (pattern.flags && pattern.flags.includes('s')) {
    // Pattern multilignes - nettoyer les espaces/retours à la ligne
    const cleanContent = content.replace(/\s+/g, ' ');
    const cleanPattern = new RegExp(pattern.source.replace(/\\s\*/g, '\\s*'), pattern.flags);
    return cleanPattern.test(cleanContent);
  }
  return pattern.test(content);
}

// Lire et vérifier chaque fichier
for (const fileInfo of filesToCheck) {
  const filePath = path.resolve(fileInfo.file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`❌ Fichier non trouvé: ${fileInfo.name}`);
    continue;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  console.log(`📄 Vérification de ${fileInfo.name}:`);
  
  // Vérifier les patterns de taille
  const relevantSizeChecks = sizeChecks.filter(check => check.files.includes(fileInfo.name));
  
  for (const check of relevantSizeChecks) {
    totalChecks++;
    const found = testMultilinePattern(check.pattern, content);
    
    if (found) {
      console.log(`  ✅ ${check.description}`);
      passedChecks++;
    } else {
      console.log(`  ❌ ${check.description}`);
    }
  }
  
  // Vérifier les patterns CSS
  const relevantCssChecks = cssChecks.filter(check => check.files.includes(fileInfo.name));
  
  for (const check of relevantCssChecks) {
    totalChecks++;
    const found = testMultilinePattern(check.pattern, content);
    
    if (found) {
      console.log(`  ✅ ${check.description}`);
      passedChecks++;
    } else {
      console.log(`  ❌ ${check.description}`);
    }
  }
  
  console.log('');
}

// Vérifications spécifiques de cohérence
console.log('🔍 Vérifications de cohérence:');

const mediaPosterPath = path.resolve('./mobile/src/components/MediaPoster.tsx');
const roomScreenPath = path.resolve('./mobile/src/screens/RoomScreen.tsx');

if (fs.existsSync(mediaPosterPath) && fs.existsSync(roomScreenPath)) {
  const mediaPosterContent = fs.readFileSync(mediaPosterPath, 'utf8');
  const roomScreenContent = fs.readFileSync(roomScreenPath, 'utf8');
  
  // Vérifier la cohérence des tailles
  const hasMediumSize = /medium.*width:\s*70.*height:\s*105/s.test(mediaPosterContent.replace(/\s+/g, ' '));
  const usesMediumSize = /size="medium"/.test(roomScreenContent);
  const hasMatchingContainer = /width:\s*70[^}]*height:\s*105/.test(roomScreenContent);
  
  totalChecks += 3;
  
  if (hasMediumSize) {
    console.log('  ✅ MediaPoster définit correctement la taille medium');
    passedChecks++;
  } else {
    console.log('  ❌ MediaPoster définit correctement la taille medium');
  }
  
  if (usesMediumSize) {
    console.log('  ✅ RoomScreen utilise la taille medium');
    passedChecks++;
  } else {
    console.log('  ❌ RoomScreen utilise la taille medium');
  }
  
  if (hasMatchingContainer) {
    console.log('  ✅ Conteneur CSS correspond à la taille medium');
    passedChecks++;
  } else {
    console.log('  ❌ Conteneur CSS correspond à la taille medium');
  }
}

console.log('\n📊 Résultat des tests de tailles:');
console.log(`✅ Tests réussis: ${passedChecks}/${totalChecks}`);
console.log(`📈 Taux de réussite: ${Math.round((passedChecks / totalChecks) * 100)}%`);

if (passedChecks === totalChecks) {
  console.log('\n🎉 Toutes les tailles de miniatures sont correctement configurées !');
  console.log('🖼️ Les miniatures sont maintenant plus grandes et mieux visibles.');
} else {
  console.log('\n⚠️  Certaines configurations de taille nécessitent des ajustements.');
  console.log('🔧 Vérifiez les patterns non trouvés ci-dessus.');
}

console.log('\n📝 Améliorations apportées:');
console.log('• Taille small: 40x60 → 50x75 pixels (+25%)');
console.log('• Taille medium: 60x90 → 70x105 pixels (+17%)');
console.log('• Taille large: 80x120 → 90x135 pixels (+13%)');
console.log('• Nouvelle taille xlarge: 110x165 pixels');
console.log('• RoomScreen utilise maintenant medium au lieu de small');
console.log('• Emoji agrandis proportionnellement');
console.log('• Cohérence entre composant et conteneurs CSS');
