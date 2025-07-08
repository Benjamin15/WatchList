#!/usr/bin/env node

/**
 * Script de test pour valider les améliorations CSS des cartes de films/séries
 * Vérifie que les nouveaux styles sont correctement appliqués
 */

const fs = require('fs');
const path = require('path');

console.log('🎨 Test des améliorations CSS des cartes de médias...\n');

// Fichiers à vérifier
const filesToCheck = [
  {
    file: './mobile/src/screens/RoomScreen.tsx',
    name: 'RoomScreen.tsx'
  },
  {
    file: './mobile/src/components/MediaPoster.tsx', 
    name: 'MediaPoster.tsx'
  }
];

// Vérifications CSS à effectuer
const cssChecks = [
  {
    pattern: /borderRadius:\s*16,/,
    description: 'Bordures arrondies modernisées (16px)',
    files: ['RoomScreen.tsx']
  },
  {
    pattern: /shadowColor:\s*['"]#000['"]/,
    description: 'Ombres ajoutées pour la profondeur',
    files: ['RoomScreen.tsx', 'MediaPoster.tsx']
  },
  {
    pattern: /shadowOpacity:\s*0\.15/,
    description: 'Opacité des ombres optimisée',
    files: ['RoomScreen.tsx', 'MediaPoster.tsx']
  },
  {
    pattern: /elevation:\s*8/,
    description: 'Élévation Android pour les cartes',
    files: ['RoomScreen.tsx']
  },
  {
    pattern: /width:\s*70,\s*height:\s*105/,
    description: 'Taille des posters augmentée (70x105)',
    files: ['RoomScreen.tsx']
  },
  {
    pattern: /fontWeight:\s*['"]700['"]/,
    description: 'Poids de police modernisé (700)',
    files: ['RoomScreen.tsx']
  },
  {
    pattern: /letterSpacing:\s*0\.[0-9]/,
    description: 'Espacement des lettres amélioré',
    files: ['RoomScreen.tsx']
  },
  {
    pattern: /textTransform:\s*['"]uppercase['"]/,
    description: 'Badges en majuscules pour plus de style',
    files: ['RoomScreen.tsx']
  },
  {
    pattern: /paddingHorizontal:\s*16/,
    description: 'Padding horizontal amélioré pour les indicateurs',
    files: ['RoomScreen.tsx']
  },
  {
    pattern: /fontSize:\s*32/,
    description: 'Icônes de swipe plus grandes (32px)',
    files: ['RoomScreen.tsx']
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
  
  // Vérifier chaque pattern CSS
  const relevantChecks = cssChecks.filter(check => check.files.includes(fileInfo.name));
  
  for (const check of relevantChecks) {
    totalChecks++;
    const found = check.pattern.test(content);
    
    if (found) {
      console.log(`  ✅ ${check.description}`);
      passedChecks++;
    } else {
      console.log(`  ❌ ${check.description}`);
    }
  }
  
  console.log('');
}

// Vérifications supplémentaires spécifiques
console.log('🔍 Vérifications spécifiques:');

const roomScreenPath = path.resolve('./mobile/src/screens/RoomScreen.tsx');
if (fs.existsSync(roomScreenPath)) {
  const roomContent = fs.readFileSync(roomScreenPath, 'utf8');
  
  // Vérifier la structure améliorée des styles
  const hasImprovedMediaItem = roomContent.includes('marginHorizontal: 2') && 
                                roomContent.includes('borderColor: \'rgba(255, 255, 255, 0.08)\'');
  
  const hasImprovedPoster = roomContent.includes('width: 70') && 
                            roomContent.includes('height: 105');
  
  const hasImprovedBadges = roomContent.includes('paddingVertical: 6') && 
                            roomContent.includes('borderRadius: 16');
  
  const hasImprovedIndicators = roomContent.includes('backgroundColor: \'rgba(0, 0, 0, 0.85)\'') &&
                                roomContent.includes('borderRadius: 24');
  
  totalChecks += 4;
  
  if (hasImprovedMediaItem) {
    console.log('  ✅ Structure des cartes modernisée');
    passedChecks++;
  } else {
    console.log('  ❌ Structure des cartes modernisée');
  }
  
  if (hasImprovedPoster) {
    console.log('  ✅ Taille des posters optimisée');
    passedChecks++;
  } else {
    console.log('  ❌ Taille des posters optimisée');
  }
  
  if (hasImprovedBadges) {
    console.log('  ✅ Design des badges amélioré');
    passedChecks++;
  } else {
    console.log('  ❌ Design des badges amélioré');
  }
  
  if (hasImprovedIndicators) {
    console.log('  ✅ Indicateurs de swipe modernisés');
    passedChecks++;
  } else {
    console.log('  ❌ Indicateurs de swipe modernisés');
  }
}

console.log('\n📊 Résultat des tests CSS:');
console.log(`✅ Tests réussis: ${passedChecks}/${totalChecks}`);
console.log(`📈 Taux de réussite: ${Math.round((passedChecks / totalChecks) * 100)}%`);

if (passedChecks === totalChecks) {
  console.log('\n🎉 Toutes les améliorations CSS sont correctement appliquées !');
  console.log('🎨 Les cartes de médias ont maintenant un design moderne et propre.');
} else {
  console.log('\n⚠️  Certaines améliorations CSS manquent ou sont incorrectes.');
  console.log('🔧 Vérifiez les patterns non trouvés ci-dessus.');
}

console.log('\n📝 Améliorations appliquées:');
console.log('• Bordures arrondies plus modernes (16px)');
console.log('• Ombres et élévation pour la profondeur');
console.log('• Posters plus grands et avec ombres');
console.log('• Typographie améliorée (poids, espacement)');
console.log('• Badges stylisés avec ombres');
console.log('• Indicateurs de swipe modernisés');
console.log('• Espacements et padding optimisés');
console.log('• Effets visuels plus sophistiqués');
