#!/usr/bin/env node

const fs = require('fs');
const { execSync } = require('child_process');

console.log('🌍 Test de validation des traductions dynamiques (Version 2)\n');

let allTestsPassed = true;

// Fichiers à exclure des vérifications (fichiers obsolètes, alternatives ou utilitaires)
const excludedFiles = [
  'MediaDetailScreenFixed.tsx',
  'MediaDetailScreenOld.tsx', 
  'MediaDetailScreenSimplified.tsx',
  'RoomScreenV2.tsx',
  'RoomScreenSwipe.tsx',
  'utils/translations.ts' // Contient des traductions pour l'ancien système
];

// Vérifier les imports de traduction dans les fichiers principaux
function checkTranslationImports() {
  console.log('📋 Vérification des imports et hooks:\n');
  
  const mainFiles = [
    'mobile/src/components/MediaItem.tsx',
    'mobile/src/screens/RoomScreen.tsx',
    'mobile/src/components/TabHeader.tsx',
    'mobile/src/screens/MediaDetailScreen.tsx',
    'mobile/src/screens/SearchScreen.tsx',
    'mobile/src/screens/CreateVoteScreen.tsx'
  ];
  
  let hasErrors = false;
  
  mainFiles.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      const hasTranslationImport = content.includes('useTranslation');
      const hasTranslationHook = content.includes('const { t } = useTranslation()');
      const filename = filePath.split('/').pop();
      
      if (hasTranslationImport && hasTranslationHook) {
        console.log(`✅ ${filename}: Imports et hooks de traduction présents`);
      } else {
        console.log(`❌ ${filename}: Imports ou hooks de traduction manquants`);
        hasErrors = true;
      }
    }
  });
  
  return !hasErrors;
}

// Fonction pour vérifier l'absence de textes en dur
function checkHardcodedTexts() {
  console.log('\n📝 Vérification de l\'absence de textes en dur:\n');
  
  const hardcodedTexts = [
    'Prévu', 'En cours', 'Terminé', 'Abandonné', 'À regarder',
    'Vote en cours', 'Vote terminé', 'Vote expiré',
    'EN COURS', 'TERMINÉ', 'EXPIRÉ',
    'Aucun média', 'Ajoutez des médias', 'Commencez à regarder', 'Terminez des médias'
  ];
  
  let hasErrors = false;
  
  hardcodedTexts.forEach(text => {
    try {
      const result = execSync(`grep -r "'${text}'" mobile/src --include="*.tsx" --include="*.ts"`, { encoding: 'utf8' });
      // Filtrer les résultats pour exclure les fichiers obsolètes, commentaires et logs
      const filteredLines = result.split('\n').filter(line => {
        if (!line.trim()) return false;
        if (excludedFiles.some(excluded => line.includes(excluded))) return false;
        if (line.includes('//') || line.includes('/*') || line.includes('console.log') || line.includes('console.error')) return false;
        return true;
      });
      
      if (filteredLines.length > 0) {
        console.log(`❌ Texte en dur trouvé: "${text}"`);
        // console.log('Détails:', filteredLines.join('\n'));
        hasErrors = true;
      } else {
        console.log(`✅ Texte "${text}" correctement traduit`);
      }
    } catch (error) {
      console.log(`✅ Texte "${text}" correctement traduit`);
    }
  });
  
  return !hasErrors;
}

// Vérifier l'utilisation de translateStatus
function checkTranslateStatusUsage() {
  console.log('\n🔄 Vérification de l\'utilisation de translateStatus:\n');
  
  try {
    const result = execSync('grep -r "translateStatus" mobile/src --include="*.tsx" --include="*.ts"', { encoding: 'utf8' });
    if (result.trim()) {
      console.log('✅ Fonction translateStatus utilisée');
      return true;
    } else {
      console.log('❌ Fonction translateStatus non utilisée');
      return false;
    }
  } catch (error) {
    console.log('❌ Fonction translateStatus non utilisée');
    return false;
  }
}

// Vérifier l'utilisation de t()
function checkTFunctionUsage() {
  console.log('\n📖 Vérification de l\'utilisation de t():\n');
  
  const requiredKeys = [
    't(\'vote.voteInProgress\')',
    't(\'vote.activeLabel\')',
    't(\'room.noMedia\')',
    't(\'status.planned\')'
  ];
  
  let hasErrors = false;
  
  requiredKeys.forEach(key => {
    try {
      const result = execSync(`grep -r "${key}" mobile/src --include="*.tsx" --include="*.ts"`, { encoding: 'utf8' });
      if (result.trim()) {
        console.log(`✅ Clé de traduction utilisée: ${key}`);
      } else {
        console.log(`❌ Clé de traduction manquante: ${key}`);
        hasErrors = true;
      }
    } catch (error) {
      console.log(`❌ Clé de traduction manquante: ${key}`);
      hasErrors = true;
    }
  });
  
  return !hasErrors;
}

// Vérifier le nettoyage des constantes
function checkConstantsCleanup() {
  console.log('\n🧹 Vérification du nettoyage des constantes:\n');
  
  const constantsPath = 'mobile/src/constants/index.ts';
  
  if (fs.existsSync(constantsPath)) {
    const constantsContent = fs.readFileSync(constantsPath, 'utf8');
    
    // Vérifier l'absence de labels en dur dans les constantes
    const hasHardcodedLabels = constantsContent.includes('label:') && 
                               (constantsContent.includes('À regarder') || 
                                constantsContent.includes('En cours') ||
                                constantsContent.includes('Terminé'));
    
    if (!hasHardcodedLabels) {
      console.log('✅ Constantes: Labels en dur supprimés');
      return true;
    } else {
      console.log('❌ Constantes: Labels en dur toujours présents');
      return false;
    }
  } else {
    console.log('❌ Fichier de constantes introuvable');
    return false;
  }
}

// Vérifier les fichiers de traduction
function checkTranslationFiles() {
  console.log('\n📚 Vérification des fichiers de traduction:\n');
  
  const languages = ['fr', 'en', 'es', 'pt'];
  const requiredKeys = [
    'status.planned',
    'status.watching', 
    'status.completed',
    'vote.voteInProgress',
    'vote.activeLabel',
    'vote.createVote',
    'room.noMedia',
    'common.delete',
    'common.addToList',
    'common.proposeMovies',
    'common.addMoviesForVote'
  ];
  
  let hasErrors = false;
  
  languages.forEach(lang => {
    const filePath = `mobile/src/i18n/locales/${lang}.json`;
    
    if (fs.existsSync(filePath)) {
      try {
        const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        const allKeysPresent = requiredKeys.every(key => {
          const keys = key.split('.');
          let current = content;
          
          for (const k of keys) {
            if (!current || !current[k]) {
              return false;
            }
            current = current[k];
          }
          
          return true;
        });
        
        if (allKeysPresent) {
          console.log(`✅ ${lang}.json: Toutes les clés requises présentes`);
        } else {
          console.log(`❌ ${lang}.json: Clés manquantes`);
          hasErrors = true;
        }
      } catch (error) {
        console.log(`❌ ${lang}.json: Erreur de parsing JSON`);
        hasErrors = true;
      }
    } else {
      console.log(`❌ ${lang}.json: Fichier manquant`);
      hasErrors = true;
    }
  });
  
  return !hasErrors;
}

// Exécution des tests
allTestsPassed = checkTranslationImports() && allTestsPassed;
allTestsPassed = checkHardcodedTexts() && allTestsPassed;
allTestsPassed = checkTranslateStatusUsage() && allTestsPassed;
allTestsPassed = checkTFunctionUsage() && allTestsPassed;
allTestsPassed = checkConstantsCleanup() && allTestsPassed;
allTestsPassed = checkTranslationFiles() && allTestsPassed;

console.log('\n' + '='.repeat(50));

if (allTestsPassed) {
  console.log('✅ TOUS LES TESTS ONT RÉUSSI !');
  console.log('\nTous les contenus dynamiques utilisent maintenant la langue sélectionnée.');
  process.exit(0);
} else {
  console.log('❌ CERTAINS TESTS ONT ÉCHOUÉ');
  console.log('\nVérifiez les erreurs ci-dessus et corrigez les problèmes.');
  process.exit(1);
}
