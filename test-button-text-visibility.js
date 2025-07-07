#!/usr/bin/env node

/**
 * Test de visibilité des textes des boutons du panel de filtrage
 * - Vérification de la taille de police augmentée
 * - Vérification du contraste des couleurs
 * - Vérification des ombres de texte pour la lisibilité
 */

const fs = require('fs');
const path = require('path');

console.log('👁️  Test de visibilité des textes des boutons...\n');

// Vérifier le fichier FilterPanel.tsx
const filterPanelPath = path.join(__dirname, 'mobile/src/components/FilterPanel.tsx');

if (!fs.existsSync(filterPanelPath)) {
  console.error('❌ FilterPanel.tsx non trouvé');
  process.exit(1);
}

const filterPanelContent = fs.readFileSync(filterPanelPath, 'utf8');

// Tests de visibilité des textes
const tests = [
  {
    name: 'Taille de police augmentée - Reset',
    condition: filterPanelContent.includes('fontSize: FONT_SIZES.lg') &&
              filterPanelContent.match(/resetButtonText:[\s\S]*?fontSize: FONT_SIZES\.lg/),
    description: 'Le bouton Reset doit utiliser une police lg (18px) au lieu de md (16px)',
    fix: 'fontSize: FONT_SIZES.lg au lieu de FONT_SIZES.md'
  },
  {
    name: 'Taille de police augmentée - Apply',
    condition: filterPanelContent.includes('fontSize: FONT_SIZES.lg') &&
              filterPanelContent.match(/applyButtonText:[\s\S]*?fontSize: FONT_SIZES\.lg/),
    description: 'Le bouton Apply doit utiliser une police lg (18px) au lieu de md (16px)',
    fix: 'fontSize: FONT_SIZES.lg au lieu de FONT_SIZES.md'
  },
  {
    name: 'Poids de police renforcé - Reset',
    condition: filterPanelContent.includes("fontWeight: '800'") &&
              filterPanelContent.match(/resetButtonText:[\s\S]*?fontWeight: '800'/),
    description: 'Le bouton Reset doit utiliser un poids de 800 pour une meilleure visibilité',
    fix: "fontWeight: '800' au lieu de '700'"
  },
  {
    name: 'Poids de police renforcé - Apply',
    condition: filterPanelContent.includes("fontWeight: '800'") &&
              filterPanelContent.match(/applyButtonText:[\s\S]*?fontWeight: '800'/),
    description: 'Le bouton Apply doit utiliser un poids de 800 pour une meilleure visibilité',
    fix: "fontWeight: '800' au lieu de '700'"
  },
  {
    name: 'Couleur explicite - Reset',
    condition: filterPanelContent.includes("color: '#FFFFFF'") &&
              filterPanelContent.match(/resetButtonText:[\s\S]*?color: '#FFFFFF'/),
    description: 'Le bouton Reset doit utiliser #FFFFFF explicite au lieu de COLORS.onSurface',
    fix: "color: '#FFFFFF' au lieu de COLORS.onSurface"
  },
  {
    name: 'Couleur explicite - Apply',
    condition: filterPanelContent.includes("color: '#FFFFFF'") &&
              filterPanelContent.match(/applyButtonText:[\s\S]*?color: '#FFFFFF'/),
    description: 'Le bouton Apply doit utiliser #FFFFFF explicite au lieu de COLORS.onPrimary',
    fix: "color: '#FFFFFF' au lieu de COLORS.onPrimary"
  },
  {
    name: 'Ombre de texte - Reset',
    condition: filterPanelContent.includes('textShadowColor') &&
              filterPanelContent.includes('textShadowOffset') &&
              filterPanelContent.includes('textShadowRadius') &&
              filterPanelContent.match(/resetButtonText:[\s\S]*?textShadowColor: 'rgba\(0, 0, 0, 0\.5\)'/),
    description: 'Le bouton Reset doit avoir une ombre de texte pour améliorer la lisibilité',
    fix: 'Ajout de textShadowColor, textShadowOffset, textShadowRadius'
  },
  {
    name: 'Ombre de texte - Apply',
    condition: filterPanelContent.includes('textShadowColor') &&
              filterPanelContent.includes('textShadowOffset') &&
              filterPanelContent.includes('textShadowRadius') &&
              filterPanelContent.match(/applyButtonText:[\s\S]*?textShadowColor: 'rgba\(0, 0, 0, 0\.5\)'/),
    description: 'Le bouton Apply doit avoir une ombre de texte pour améliorer la lisibilité',
    fix: 'Ajout de textShadowColor, textShadowOffset, textShadowRadius'
  },
  {
    name: 'Contraste background - Reset',
    condition: filterPanelContent.includes("backgroundColor: 'rgba(255, 255, 255, 0.15)'") &&
              filterPanelContent.match(/resetButton:[\s\S]*?backgroundColor: 'rgba\(255, 255, 255, 0\.15\)'/),
    description: 'Le background du bouton Reset doit être plus opaque (0.15 au lieu de 0.1)',
    fix: "backgroundColor: 'rgba(255, 255, 255, 0.15)'"
  },
  {
    name: 'Bordure renforcée - Reset',
    condition: filterPanelContent.includes('borderWidth: 2') &&
              filterPanelContent.includes("borderColor: 'rgba(255, 255, 255, 0.3)'") &&
              filterPanelContent.match(/resetButton:[\s\S]*?borderWidth: 2/) &&
              filterPanelContent.match(/resetButton:[\s\S]*?borderColor: 'rgba\(255, 255, 255, 0\.3\)'/),
    description: 'Le bouton Reset doit avoir une bordure plus épaisse et plus visible',
    fix: 'borderWidth: 2 et borderColor plus opaque (0.3)'
  },
  {
    name: 'Bordure Apply',
    condition: filterPanelContent.match(/applyButton:[\s\S]*?borderWidth: 2/) &&
              filterPanelContent.match(/applyButton:[\s\S]*?borderColor: 'rgba\(255, 255, 255, 0\.2\)'/),
    description: 'Le bouton Apply doit avoir une bordure pour la définition',
    fix: 'Ajout de borderWidth: 2 et borderColor'
  }
];

let passedTests = 0;
let failedTests = 0;

tests.forEach((test, index) => {
  const passed = test.condition;
  const status = passed ? '✅' : '❌';
  
  console.log(`${index + 1}. ${status} ${test.name}`);
  if (!passed) {
    console.log(`   📝 ${test.description}`);
    console.log(`   🔧 Solution: ${test.fix}`);
    failedTests++;
  } else {
    passedTests++;
  }
});

console.log(`\n📊 Résumé des tests de visibilité:`);
console.log(`✅ Tests réussis: ${passedTests}/${tests.length}`);
console.log(`❌ Tests échoués: ${failedTests}/${tests.length}`);

if (failedTests === 0) {
  console.log('\n🎉 Tous les améliorations de visibilité sont en place !');
  console.log('\n👁️  Améliorations de visibilité des textes:');
  console.log('• Taille de police augmentée: md (16px) → lg (18px)');
  console.log('• Poids de police renforcé: 700 → 800');
  console.log('• Couleurs explicites: #FFFFFF au lieu des constantes');
  console.log('• Ombres de texte: Meilleur contraste avec arrière-plan');
  console.log('• Backgrounds plus opaques: Meilleur contraste');
  console.log('• Bordures renforcées: Définition claire des boutons');
  
  console.log('\n🎨 Détails techniques:');
  console.log('• textShadowColor: rgba(0, 0, 0, 0.5)');
  console.log('• textShadowOffset: { width: 0, height: 1 }');
  console.log('• textShadowRadius: 2');
  console.log('• backgroundColor Reset: rgba(255, 255, 255, 0.15)');
  console.log('• borderWidth: 2 (plus épais)');
  console.log('• borderColor: rgba(255, 255, 255, 0.3)');
} else {
  console.log('\n⚠️  Certaines améliorations de visibilité ne sont pas complètes.');
  process.exit(1);
}

console.log('\n🚀 Instructions de test de la visibilité:');
console.log('\n1. 📱 Test dans différentes conditions:');
console.log('   - Luminosité faible/forte');
console.log('   - Mode sombre/clair du système');
console.log('   - Différents appareils/écrans');

console.log('\n2. 👆 Test d\'accessibilité:');
console.log('   - Texte lisible même avec vision réduite');
console.log('   - Contraste suffisant selon WCAG guidelines');
console.log('   - Taille de police confortable');

console.log('\n3. 🎯 Éléments à vérifier:');
console.log('   - Bouton "Réinitialiser" → Texte blanc, visible, net');
console.log('   - Bouton "Appliquer" → Texte blanc, visible, net');
console.log('   - Ombres portées → Pas de flou, contours nets');
console.log('   - Bordures → Délimitation claire des boutons');

console.log('\n✨ Les textes des boutons sont maintenant parfaitement visibles !');
