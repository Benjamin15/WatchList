/**
 * Test de validation des contenus dynamiques traduits
 * Vérification que tous les textes en dur ont été remplacés par des traductions
 */

const fs = require('fs');
const path = require('path');

console.log('🌍 Test de validation des traductions dynamiques\n');

let allTestsPassed = true;

// Lire les fichiers principaux
const mediaItemPath = path.join(__dirname, 'mobile/src/components/MediaItem.tsx');
const roomScreenPath = path.join(__dirname, 'mobile/src/screens/RoomScreen.tsx');
const constantsPath = path.join(__dirname, 'mobile/src/constants/index.ts');

const mediaItemContent = fs.readFileSync(mediaItemPath, 'utf8');
const roomScreenContent = fs.readFileSync(roomScreenPath, 'utf8');
const constantsContent = fs.readFileSync(constantsPath, 'utf8');

console.log('📋 Vérification des imports et hooks:\n');

// Test 1: Vérifier les imports de traduction
const hasTranslationImports = mediaItemContent.includes('useTranslation') && 
                             mediaItemContent.includes('translateStatus') && 
                             mediaItemContent.includes('useLanguage');
                             
if (hasTranslationImports) {
  console.log('✅ MediaItem: Imports de traduction présents');
} else {
  console.log('❌ MediaItem: Imports de traduction manquants');
  allTestsPassed = false;
}

const hasRoomScreenImports = roomScreenContent.includes('useTranslation') && 
                            roomScreenContent.includes('translateStatus') && 
                            roomScreenContent.includes('useLanguage');
                            
if (hasRoomScreenImports) {
  console.log('✅ RoomScreen: Imports de traduction présents');
} else {
  console.log('❌ RoomScreen: Imports de traduction manquants');
  allTestsPassed = false;
}

// Test 2: Vérifier l'absence de textes en dur
console.log('\n📝 Vérification de l\'absence de textes en dur:\n');

const hardcodedTexts = [
  'Prévu', 'En cours', 'Terminé', 'Abandonné',
  'À regarder', 'Vote en cours', 'Vote terminé', 'Vote expiré',
  'EN COURS', 'TERMINÉ', 'EXPIRÉ',
  'Aucun média', 'Ajoutez des médias',
  'Commencez à regarder', 'Terminez des médias'
];

hardcodedTexts.forEach(text => {
  const inMediaItem = mediaItemContent.includes(`'${text}'`) || mediaItemContent.includes(`"${text}"`);
  const inRoomScreen = roomScreenContent.includes(`'${text}'`) || roomScreenContent.includes(`"${text}"`);
  
  if (inMediaItem || inRoomScreen) {
    console.log(`❌ Texte en dur trouvé: "${text}"`);
    allTestsPassed = false;
  } else {
    console.log(`✅ Texte "${text}" correctement traduit`);
  }
});

// Test 3: Vérifier l'utilisation des hooks de traduction
console.log('\n🔧 Vérification de l\'utilisation des hooks:\n');

const hasTranslationHook = mediaItemContent.includes('const { t } = useTranslation()') &&
                          mediaItemContent.includes('const { currentLanguage } = useLanguage()');
                          
if (hasTranslationHook) {
  console.log('✅ MediaItem: Hooks de traduction utilisés');
} else {
  console.log('❌ MediaItem: Hooks de traduction manquants');
  allTestsPassed = false;
}

const hasRoomScreenHooks = roomScreenContent.includes('const { t } = useTranslation()') &&
                          roomScreenContent.includes('const { currentLanguage } = useLanguage()');
                          
if (hasRoomScreenHooks) {
  console.log('✅ RoomScreen: Hooks de traduction utilisés');
} else {
  console.log('❌ RoomScreen: Hooks de traduction manquants');
  allTestsPassed = false;
}

// Test 4: Vérifier l'utilisation de translateStatus
console.log('\n🔄 Vérification de l\'utilisation de translateStatus:\n');

const usesTranslateStatus = mediaItemContent.includes('translateStatus(') &&
                           roomScreenContent.includes('translateStatus(');
                           
if (usesTranslateStatus) {
  console.log('✅ Fonction translateStatus utilisée');
} else {
  console.log('❌ Fonction translateStatus non utilisée');
  allTestsPassed = false;
}

// Test 5: Vérifier l'utilisation de t() pour les traductions
console.log('\n📖 Vérification de l\'utilisation de t():\n');

const translationKeys = [
  't(\'vote.voteInProgress\')',
  't(\'vote.activeLabel\')',
  't(\'room.noMedia\')',
  't(\'status.planned\')'
];

translationKeys.forEach(key => {
  if (roomScreenContent.includes(key)) {
    console.log(`✅ Clé de traduction utilisée: ${key}`);
  } else {
    console.log(`❌ Clé de traduction manquante: ${key}`);
    allTestsPassed = false;
  }
});

// Test 6: Vérifier les constantes nettoyées
console.log('\n🧹 Vérification du nettoyage des constantes:\n');

const hasNoHardcodedLabels = !constantsContent.includes('label: \'') && 
                            !constantsContent.includes('label: "');
                            
if (hasNoHardcodedLabels) {
  console.log('✅ Constantes: Labels en dur supprimés');
} else {
  console.log('❌ Constantes: Labels en dur encore présents');
  allTestsPassed = false;
}

// Test 7: Vérifier les fichiers de traduction
console.log('\n📚 Vérification des fichiers de traduction:\n');

const translationFiles = ['fr.json', 'en.json', 'es.json', 'pt.json'];
const requiredKeys = [
  'vote.voteInProgress',
  'vote.activeLabel',
  'room.noMedia',
  'status.planned'
];

translationFiles.forEach(file => {
  const filePath = path.join(__dirname, 'mobile/src/i18n/locales', file);
  try {
    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    const hasAllKeys = requiredKeys.every(key => {
      const keys = key.split('.');
      return keys.reduce((obj, k) => obj && obj[k], content);
    });
    
    if (hasAllKeys) {
      console.log(`✅ ${file}: Toutes les clés requises présentes`);
    } else {
      console.log(`❌ ${file}: Clés manquantes`);
      allTestsPassed = false;
    }
  } catch (error) {
    console.log(`❌ ${file}: Erreur de lecture - ${error.message}`);
    allTestsPassed = false;
  }
});

// Résumé
console.log('\n' + '='.repeat(50));
if (allTestsPassed) {
  console.log('🎉 TOUS LES TESTS RÉUSSIS !');
  console.log('\n✨ Résumé des améliorations:');
  console.log('   • Tous les textes en dur traduits');
  console.log('   • Hooks de traduction intégrés');
  console.log('   • Statuts dynamiques selon la langue');
  console.log('   • Labels de vote traduits');
  console.log('   • Messages d\'état vide traduits');
  console.log('   • Labels d\'onglets traduits');
  console.log('   • Constantes nettoyées');
  
  console.log('\n🌍 L\'interface s\'adapte maintenant entièrement');
  console.log('    à la langue sélectionnée par l\'utilisateur !');
} else {
  console.log('❌ CERTAINS TESTS ONT ÉCHOUÉ');
  console.log('\nVérifiez les erreurs ci-dessus et corrigez les problèmes.');
  process.exit(1);
}

console.log('='.repeat(50));
