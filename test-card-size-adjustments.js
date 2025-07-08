#!/usr/bin/env node

/**
 * Script de test pour valider les ajustements de taille des cartes de médias
 * Vérifie la réduction des cartes, badges et l'espacement amélioré
 */

const fs = require('fs');
const path = require('path');

console.log('📏 Test des ajustements de taille des cartes de médias...\n');

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
    pattern: /padding:\s*SPACING\.md,/,
    description: 'Padding des cartes réduit (md au lieu de lg)',
    files: ['RoomScreen.tsx']
  },
  {
    pattern: /borderRadius:\s*14,/,
    description: 'Bordures arrondies réduites (14px au lieu de 16px)',
    files: ['RoomScreen.tsx']
  },
  {
    pattern: /marginBottom:\s*SPACING\.sm,/,
    description: 'Marge inférieure des cartes réduite',
    files: ['RoomScreen.tsx']
  },
  {
    pattern: /width:\s*60,\s*height:\s*90/,
    description: 'Taille poster réduite (60x90 au lieu de 70x105)',
    files: ['RoomScreen.tsx']
  },
  {
    pattern: /borderRadius:\s*10,/,
    description: 'Bordures poster réduites (10px au lieu de 12px)',
    files: ['RoomScreen.tsx']
  },
  {
    pattern: /marginRight:\s*SPACING\.md,/,
    description: 'Marge droite poster réduite (md au lieu de lg)',
    files: ['RoomScreen.tsx']
  },
  {
    pattern: /paddingLeft:\s*SPACING\.xs,/,
    description: 'Espacement ajouté entre miniature et titre',
    files: ['RoomScreen.tsx']
  },
  {
    pattern: /fontSize:\s*FONT_SIZES\.md,/,
    description: 'Taille de police titre réduite (md au lieu de lg)',
    files: ['RoomScreen.tsx']
  },
  {
    pattern: /fontWeight:\s*['"]600['"]/,
    description: 'Poids de police titre réduit (600 au lieu de 700)',
    files: ['RoomScreen.tsx']
  },
  {
    pattern: /paddingHorizontal:\s*SPACING\.sm,/,
    description: 'Padding horizontal badges réduit (sm au lieu de md)',
    files: ['RoomScreen.tsx']
  },
  {
    pattern: /paddingVertical:\s*3,/,
    description: 'Padding vertical badges réduit (3 au lieu de 6)',
    files: ['RoomScreen.tsx']
  },
  {
    pattern: /borderRadius:\s*12,/,
    description: 'Bordures badges réduites (12px au lieu de 16px)',
    files: ['RoomScreen.tsx']
  },
  {
    pattern: /fontSize:\s*10,/,
    description: 'Taille de police badges réduite (10px)',
    files: ['RoomScreen.tsx']
  },
  {
    pattern: /size="small"/,
    description: 'RoomScreen utilise la taille small',
    files: ['RoomScreen.tsx']
  },
  {
    pattern: /case 'small':\s*return \{ width: 60, height: 90 \}/,
    description: 'MediaPoster small correspond au nouveau poster (60x90)',
    files: ['MediaPoster.tsx']
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
console.log('🔍 Vérifications de cohérence:');

const roomScreenPath = path.resolve('./mobile/src/screens/RoomScreen.tsx');
if (fs.existsSync(roomScreenPath)) {
  const roomContent = fs.readFileSync(roomScreenPath, 'utf8');
  
  // Vérifier la cohérence des ombres réduites
  const hasReducedShadows = roomContent.includes('shadowOpacity: 0.12') && 
                             roomContent.includes('elevation: 6');
  
  // Vérifier l'espacement du contenu média
  const hasImprovedSpacing = roomContent.includes('paddingLeft: SPACING.xs');
  
  // Vérifier la réduction des métadonnées
  const hasReducedMeta = roomContent.includes('fontSize: FONT_SIZES.xs') &&
                         roomContent.includes('marginBottom: SPACING.sm');
  
  totalChecks += 3;
  
  if (hasReducedShadows) {
    console.log('  ✅ Ombres des cartes réduites');
    passedChecks++;
  } else {
    console.log('  ❌ Ombres des cartes réduites');
  }
  
  if (hasImprovedSpacing) {
    console.log('  ✅ Espacement entre miniature et titre ajouté');
    passedChecks++;
  } else {
    console.log('  ❌ Espacement entre miniature et titre ajouté');
  }
  
  if (hasReducedMeta) {
    console.log('  ✅ Métadonnées réduites en taille');
    passedChecks++;
  } else {
    console.log('  ❌ Métadonnées réduites en taille');
  }
}

console.log('\n📊 Résultat des tests d\'ajustements:');
console.log(`✅ Tests réussis: ${passedChecks}/${totalChecks}`);
console.log(`📈 Taux de réussite: ${Math.round((passedChecks / totalChecks) * 100)}%`);

if (passedChecks === totalChecks) {
  console.log('\n🎉 Tous les ajustements de taille sont correctement appliqués !');
  console.log('📏 Les cartes sont plus compactes et mieux proportionnées.');
} else {
  console.log('\n⚠️  Certains ajustements manquent ou sont incorrects.');
  console.log('🔧 Vérifiez les patterns non trouvés ci-dessus.');
}

console.log('\n📝 Ajustements appliqués:');
console.log('🎯 Cartes plus compactes:');
console.log('  • Padding réduit: lg → md');
console.log('  • Bordures réduites: 16px → 14px');
console.log('  • Marges réduites: md → sm');
console.log('  • Ombres atténuées');
console.log('');
console.log('🖼️ Miniatures ajustées:');
console.log('  • Taille réduite: 70x105 → 60x90');
console.log('  • Bordures réduites: 12px → 10px');
console.log('  • Marge droite réduite: lg → md');
console.log('');
console.log('📝 Contenu optimisé:');
console.log('  • Espacement ajouté entre miniature et titre');
console.log('  • Taille de titre réduite: lg → md');
console.log('  • Poids de police allégé: 700 → 600');
console.log('  • Métadonnées plus petites');
console.log('');
console.log('🏷️ Badges plus discrets:');
console.log('  • Padding réduit: md/6px → sm/3px');
console.log('  • Bordures réduites: 16px → 12px');
console.log('  • Police plus petite: 12px → 10px');
console.log('  • Ombres atténuées');
