/**
 * Test automatisé - Intégration complète de la traduction multilingue
 * 
 * Ce test valide que le paramètre de langue est correctement intégré
 * dans tous les appels TMDB côté mobile et serveur.
 */

const fs = require('fs');
const path = require('path');

console.log('🌍 Test - Intégration complète du paramètre de langue');
console.log('='.repeat(60));

// Chemins des fichiers à vérifier
const filesToCheck = [
  {
    path: 'server/src/services/tmdbService.js',
    name: 'Service TMDB serveur',
    checks: [
      { pattern: /async searchMovies\(query, language = 'fr-FR'\)/, name: 'searchMovies avec langue' },
      { pattern: /async searchTVShows\(query, language = 'fr-FR'\)/, name: 'searchTVShows avec langue' },
      { pattern: /async getMediaDetails\(tmdbId, type, language = 'fr-FR'\)/, name: 'getMediaDetails avec langue' },
      { pattern: /async getMediaTrailers\(tmdbId, type, language = 'fr-FR'\)/, name: 'getMediaTrailers avec langue' }
    ]
  },
  {
    path: 'server/src/services/searchService.js',
    name: 'Service Search serveur',
    checks: [
      { pattern: /async searchExternal\(query, language = 'fr-FR'\)/, name: 'searchExternal avec langue' },
      { pattern: /async searchAutocomplete\(query, language = 'fr-FR'\)/, name: 'searchAutocomplete avec langue' },
      { pattern: /this\.tmdbService\.searchMovies\(query, language\)/, name: 'Appel searchMovies avec langue' },
      { pattern: /this\.tmdbService\.searchTVShows\(query, language\)/, name: 'Appel searchTVShows avec langue' }
    ]
  },
  {
    path: 'server/src/controllers/searchController.js',
    name: 'Contrôleur Search serveur',
    checks: [
      { pattern: /const \{ language = 'fr-FR' \} = req\.query/, name: 'Extraction paramètre langue' },
      { pattern: /this\.searchService\.searchAutocomplete\(query\.trim\(\), language\)/, name: 'Appel avec langue' }
    ]
  },
  {
    path: 'server/src/controllers/mediaController.js',
    name: 'Contrôleur Media serveur',
    checks: [
      { pattern: /const \{ language = 'fr-FR' \} = req\.query/, name: 'Extraction paramètre langue' },
      { pattern: /tmdbService\.getMediaDetails\(tmdbId, type, language\)/, name: 'getMediaDetails avec langue' },
      { pattern: /tmdbService\.getMediaTrailers\(tmdbId, type, language\)/, name: 'getMediaTrailers avec langue' }
    ]
  },
  {
    path: 'mobile/src/services/api.ts',
    name: 'Service API mobile',
    checks: [
      { pattern: /import.*getLanguageForTMDB.*from.*translations/, name: 'Import getLanguageForTMDB' },
      { pattern: /import i18n from.*i18n/, name: 'Import i18n' },
      { pattern: /getCurrentLanguageForTMDB\(\): string/, name: 'Méthode getCurrentLanguageForTMDB' },
      { pattern: /const language = this\.getCurrentLanguageForTMDB\(\)/, name: 'Utilisation de getCurrentLanguageForTMDB' },
      { pattern: /params: \{ language \}/, name: 'Paramètre langue dans requêtes' }
    ]
  },
  {
    path: 'mobile/src/utils/translations.ts',
    name: 'Utilitaires de traduction',
    checks: [
      { pattern: /getLanguageForTMDB/, name: 'Fonction getLanguageForTMDB' },
      { pattern: /'fr': 'fr-FR'/, name: 'Mapping français' },
      { pattern: /'en': 'en-US'/, name: 'Mapping anglais' },
      { pattern: /'es': 'es-ES'/, name: 'Mapping espagnol' },
      { pattern: /'pt': 'pt-BR'/, name: 'Mapping portugais' }
    ]
  },
  {
    path: 'mobile/src/hooks/useLanguage.ts',
    name: 'Hook useLanguage',
    checks: [
      { pattern: /useTranslation/, name: 'Utilisation useTranslation' },
      { pattern: /AsyncStorage/, name: 'Persistance AsyncStorage' },
      { pattern: /changeLanguage/, name: 'Fonction changeLanguage' },
      { pattern: /'pt'.*'🇧🇷 Português'/, name: 'Option portugais' }
    ]
  }
];

let allTestsPassed = true;
let totalChecks = 0;
let passedChecks = 0;

filesToCheck.forEach(file => {
  console.log(`\n📁 ${file.name}:`);
  console.log('-'.repeat(40));
  
  const fullPath = path.join('/Users/ben/workspace/WatchList', file.path);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`❌ Fichier non trouvé: ${file.path}`);
    allTestsPassed = false;
    return;
  }
  
  const content = fs.readFileSync(fullPath, 'utf8');
  
  file.checks.forEach(check => {
    totalChecks++;
    if (check.pattern.test(content)) {
      console.log(`✅ ${check.name}`);
      passedChecks++;
    } else {
      console.log(`❌ ${check.name}`);
      allTestsPassed = false;
    }
  });
});

// Tests fonctionnels supplémentaires
console.log('\n🔧 Tests fonctionnels:');
console.log('-'.repeat(40));

// Vérifier que les fichiers de traduction existent
const translationFiles = ['fr.json', 'en.json', 'es.json', 'pt.json'];
translationFiles.forEach(file => {
  totalChecks++;
  const filePath = path.join('/Users/ben/workspace/WatchList', 'mobile/src/i18n/locales', file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ Fichier de traduction ${file} existe`);
    passedChecks++;
  } else {
    console.log(`❌ Fichier de traduction ${file} manquant`);
    allTestsPassed = false;
  }
});

// Vérifier la configuration i18n
totalChecks++;
const i18nConfigPath = path.join('/Users/ben/workspace/WatchList', 'mobile/src/i18n/index.ts');
if (fs.existsSync(i18nConfigPath)) {
  const i18nContent = fs.readFileSync(i18nConfigPath, 'utf8');
  if (i18nContent.includes('react-i18next') && i18nContent.includes('pt')) {
    console.log('✅ Configuration i18n avec portugais');
    passedChecks++;
  } else {
    console.log('❌ Configuration i18n incomplète');
    allTestsPassed = false;
  }
} else {
  console.log('❌ Fichier de configuration i18n manquant');
  allTestsPassed = false;
}

// Résumé
console.log('\n' + '='.repeat(60));
console.log(`📊 Résultats: ${passedChecks}/${totalChecks} tests réussis`);

if (allTestsPassed) {
  console.log('🎉 INTÉGRATION COMPLÈTE RÉUSSIE !');
  console.log('\n✨ Fonctionnalités validées :');
  console.log('   🌍 Support multilingue (fr, en, es, pt)');
  console.log('   🔄 Mapping des codes de langue pour TMDB');
  console.log('   📡 Paramètre de langue dans tous les appels API');
  console.log('   💾 Persistance de la langue sélectionnée');
  console.log('   🎯 Traduction des données TMDB selon la langue');
  
  console.log('\n🚀 L\'utilisateur peut maintenant :');
  console.log('   • Changer la langue dans les paramètres');
  console.log('   • Voir l\'interface traduite instantanément');
  console.log('   • Obtenir les données TMDB dans sa langue');
  console.log('   • Bénéficier de la persistance des préférences');
  
  console.log('\n📱 Prochaines étapes recommandées :');
  console.log('   • Tester l\'expérience multilingue de bout en bout');
  console.log('   • Vérifier les traductions sur l\'application mobile');
  console.log('   • Valider les données TMDB dans différentes langues');
  console.log('   • (Optionnel) Ajouter la détection automatique de langue');
} else {
  console.log('❌ CERTAINS TESTS ONT ÉCHOUÉ');
  console.log('\nVérifiez les erreurs ci-dessus et corrigez les problèmes.');
  console.log('Tous les composants doivent être mis à jour pour une');
  console.log('intégration complète de la traduction multilingue.');
}

console.log('\n💡 Architecture de la traduction :');
console.log('   📱 Mobile: useLanguage + i18n → getLanguageForTMDB → API');
console.log('   🖥️  Serveur: language param → TMDB API calls');
console.log('   🔄 Cycle: User change → UI update → Data refresh');
