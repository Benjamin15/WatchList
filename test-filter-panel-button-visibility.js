/**
 * Test pour vérifier la visibilité des textes des boutons du FilterPanel
 * Ce script valide que les corrections de style ont bien été appliquées
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Test de visibilité des boutons du FilterPanel\n');

// Chemin vers le composant FilterPanel
const filterPanelPath = path.join(__dirname, 'mobile/src/components/FilterPanel.tsx');

if (!fs.existsSync(filterPanelPath)) {
  console.error('❌ Fichier FilterPanel.tsx non trouvé');
  process.exit(1);
}

const content = fs.readFileSync(filterPanelPath, 'utf8');

// Tests de validation des styles
const tests = [
  {
    name: 'Taille de police des boutons',
    test: () => content.includes('fontSize: FONT_SIZES.lg'),
    description: 'Vérifie que les boutons utilisent une grande taille de police'
  },
  {
    name: 'Poids de police renforcé',
    test: () => content.includes("fontWeight: '800'"),
    description: 'Vérifie que les boutons utilisent un poids de police extra-bold'
  },
  {
    name: 'Couleur de texte blanche',
    test: () => content.includes("color: '#FFFFFF'"),
    description: 'Vérifie que le texte des boutons est blanc'
  },
  {
    name: 'Ombre de texte pour contraste',
    test: () => content.includes('textShadowColor') && content.includes('textShadowOffset') && content.includes('textShadowRadius'),
    description: 'Vérifie que les boutons ont une ombre de texte pour améliorer le contraste'
  },
  {
    name: 'Bordures renforcées',
    test: () => content.includes('borderWidth: 2') && content.includes("borderColor: 'rgba(255, 255, 255"),
    description: 'Vérifie que les boutons ont des bordures renforcées'
  },
  {
    name: 'Background opaque pour bouton reset',
    test: () => content.includes("backgroundColor: 'rgba(255, 255, 255, 0.15)'"),
    description: 'Vérifie que le bouton reset a un arrière-plan semi-opaque'
  },
  {
    name: 'Button primary pour apply',
    test: () => content.includes('backgroundColor: COLORS.primary'),
    description: 'Vérifie que le bouton apply utilise la couleur primaire'
  },
  {
    name: 'Texte des boutons correct',
    test: () => content.includes('Réinitialiser') && content.includes('Appliquer'),
    description: 'Vérifie que les textes des boutons sont corrects'
  }
];

let passedTests = 0;
let failedTests = 0;

console.log('📋 Résultats des tests :\n');

tests.forEach((test, index) => {
  try {
    const result = test.test();
    if (result) {
      console.log(`✅ ${index + 1}. ${test.name}`);
      console.log(`   ${test.description}\n`);
      passedTests++;
    } else {
      console.log(`❌ ${index + 1}. ${test.name}`);
      console.log(`   ${test.description}\n`);
      failedTests++;
    }
  } catch (error) {
    console.log(`❌ ${index + 1}. ${test.name} (Erreur: ${error.message})`);
    console.log(`   ${test.description}\n`);
    failedTests++;
  }
});

// Tests spécifiques aux styles des boutons
console.log('🎨 Validation des styles spécifiques :\n');

const styleTests = [
  {
    name: 'Style resetButtonText',
    pattern: /resetButtonText:\s*{[^}]*fontSize:\s*FONT_SIZES\.lg[^}]*fontWeight:\s*'800'[^}]*color:\s*'#FFFFFF'[^}]*}/s,
    description: 'Vérifie la structure complète du style resetButtonText'
  },
  {
    name: 'Style applyButtonText',
    pattern: /applyButtonText:\s*{[^}]*fontSize:\s*FONT_SIZES\.lg[^}]*fontWeight:\s*'800'[^}]*color:\s*'#FFFFFF'[^}]*}/s,
    description: 'Vérifie la structure complète du style applyButtonText'
  }
];

styleTests.forEach((test, index) => {
  const result = test.pattern.test(content);
  if (result) {
    console.log(`✅ ${test.name}`);
    console.log(`   ${test.description}\n`);
    passedTests++;
  } else {
    console.log(`❌ ${test.name}`);
    console.log(`   ${test.description}\n`);
    failedTests++;
  }
});

// Résumé
console.log('📊 Résumé des tests :');
console.log(`✅ Tests réussis : ${passedTests}`);
console.log(`❌ Tests échoués : ${failedTests}`);
console.log(`📈 Taux de réussite : ${Math.round((passedTests / (passedTests + failedTests)) * 100)}%\n`);

if (failedTests === 0) {
  console.log('🎉 Tous les tests sont passés ! Les boutons du FilterPanel devraient être parfaitement visibles.');
} else if (failedTests <= 2) {
  console.log('⚠️  Quelques ajustements mineurs pourraient être nécessaires.');
} else {
  console.log('🔧 Des corrections importantes sont nécessaires pour améliorer la visibilité des boutons.');
}

// Vérification de l'intégration dans RoomScreen
const roomScreenPath = path.join(__dirname, 'mobile/src/screens/RoomScreen.tsx');
if (fs.existsSync(roomScreenPath)) {
  const roomContent = fs.readFileSync(roomScreenPath, 'utf8');
  console.log('\n🔗 Vérification de l\'intégration :');
  
  if (roomContent.includes('import FilterPanel')) {
    console.log('✅ FilterPanel est bien importé dans RoomScreen');
  } else {
    console.log('❌ FilterPanel n\'est pas importé dans RoomScreen');
  }
  
  if (roomContent.includes('<FilterPanel')) {
    console.log('✅ FilterPanel est bien utilisé dans le JSX');
  } else {
    console.log('❌ FilterPanel n\'est pas utilisé dans le JSX');
  }
  
  if (roomContent.includes('filterPanelVisible')) {
    console.log('✅ État de visibilité du FilterPanel est géré');
  } else {
    console.log('❌ État de visibilité du FilterPanel n\'est pas géré');
  }
}

console.log('\n🎯 Test terminé.');
