#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Validation des clés de traduction ajoutées...\n');

const languages = ['fr', 'en', 'es', 'pt'];
const requiredKeys = [
  'room.errorLoadingRoom',
  'room.errorLoadingWatchlist'
];

let allValid = true;

languages.forEach(lang => {
  console.log(`📝 Vérification de ${lang}.json:`);
  
  const filePath = path.join(__dirname, `mobile/src/i18n/locales/${lang}.json`);
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const translations = JSON.parse(content);
    
    requiredKeys.forEach(key => {
      const keyParts = key.split('.');
      let current = translations;
      let found = true;
      
      for (const part of keyParts) {
        if (current && typeof current === 'object' && part in current) {
          current = current[part];
        } else {
          found = false;
          break;
        }
      }
      
      if (found && typeof current === 'string' && current.trim() !== '') {
        console.log(`   ✅ ${key}: "${current}"`);
      } else {
        console.log(`   ❌ ${key}: MANQUANT`);
        allValid = false;
      }
    });
    
    console.log('');
    
  } catch (error) {
    console.error(`   ❌ Erreur lors de la lecture de ${lang}.json:`, error.message);
    allValid = false;
  }
});

if (allValid) {
  console.log('🎉 SUCCÈS ! Toutes les clés de traduction sont présentes dans tous les fichiers de langue.');
} else {
  console.log('❌ ÉCHEC - Certaines clés de traduction sont manquantes.');
}

console.log('');
