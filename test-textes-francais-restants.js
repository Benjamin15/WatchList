#!/usr/bin/env node

const fs = require('fs');
const { execSync } = require('child_process');

console.log('🔍 Test de validation des derniers textes français\n');

let allTestsPassed = true;

// Textes français qui devraient être traduits
const remainingFrenchTexts = [
  'Recevoir des alertes pour les nouveaux votes',
  'propose.*films',
  'Fin aujourd\'hui à',
  'Paramètres',
  'Dernière connexion',
  'Rejoins ma WatchList',
  'Partager ma WatchList',
  'Proposez des films à votre groupe',
  'Votre nom'
];

// Fichiers à exclure des vérifications
const excludedFiles = [
  'MediaDetailScreenFixed.tsx',
  'MediaDetailScreenOld.tsx', 
  'MediaDetailScreenSimplified.tsx',
  'RoomScreenV2.tsx',
  'RoomScreenSwipe.tsx',
  'utils/translations.ts',
  'services/',
  'notificationService.ts',
  'roomHistory.ts'
];

console.log('📝 Vérification des textes français restants:\n');

remainingFrenchTexts.forEach(text => {
  try {
    const result = execSync(`grep -r "${text}" mobile/src --include="*.tsx" --include="*.ts"`, { encoding: 'utf8' });
    // Filtrer les résultats pour exclure les fichiers obsolètes, commentaires et logs
    const filteredLines = result.split('\n').filter(line => {
      if (!line.trim()) return false;
      if (excludedFiles.some(excluded => line.includes(excluded))) return false;
      if (line.includes('//') || line.includes('/*') || line.includes('console.log') || line.includes('console.error')) return false;
      return true;
    });
    
    if (filteredLines.length > 0) {
      console.log(`❌ Texte français trouvé: "${text}"`);
      filteredLines.forEach(line => console.log(`   ${line}`));
      allTestsPassed = false;
    } else {
      console.log(`✅ Texte "${text}" correctement traduit`);
    }
  } catch (error) {
    console.log(`✅ Texte "${text}" correctement traduit`);
  }
});

// Vérifier que les nouvelles clés sont présentes dans les fichiers de traduction
console.log('\n📚 Vérification des nouvelles clés de traduction:\n');

const newRequiredKeys = [
  'settings.voteNotificationsDescription',
  'vote.proposesMovies',
  'vote.endsToday',
  'home.lastConnection',
  'room.shareMessage',
  'common.notAvailable',
  'common.yourName'
];

const languages = ['fr', 'en', 'es', 'pt'];

languages.forEach(lang => {
  const filePath = `mobile/src/i18n/locales/${lang}.json`;
  
  if (fs.existsSync(filePath)) {
    try {
      const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      const missingKeys = newRequiredKeys.filter(key => {
        const keys = key.split('.');
        let current = content;
        
        for (const k of keys) {
          if (!current || !current[k]) {
            return true;
          }
          current = current[k];
        }
        
        return false;
      });
      
      if (missingKeys.length === 0) {
        console.log(`✅ ${lang}.json: Toutes les nouvelles clés présentes`);
      } else {
        console.log(`❌ ${lang}.json: Clés manquantes: ${missingKeys.join(', ')}`);
        allTestsPassed = false;
      }
    } catch (error) {
      console.log(`❌ ${lang}.json: Erreur de parsing JSON`);
      allTestsPassed = false;
    }
  } else {
    console.log(`❌ ${lang}.json: Fichier manquant`);
    allTestsPassed = false;
  }
});

console.log('\n' + '='.repeat(50));

if (allTestsPassed) {
  console.log('✅ TOUS LES TESTS ONT RÉUSSI !');
  console.log('\nTous les textes français restants ont été traduits.');
  process.exit(0);
} else {
  console.log('❌ CERTAINS TESTS ONT ÉCHOUÉ');
  console.log('\nVérifiez les erreurs ci-dessus et corrigez les problèmes.');
  process.exit(1);
}
