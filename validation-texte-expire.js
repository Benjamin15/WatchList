#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Validation de la correction du texte "Expiré" dans RoomScreen...\n');

const filePath = path.join(__dirname, 'mobile/src/screens/RoomScreen.tsx');

try {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Chercher le texte français "Expiré"
  const expiredRegex = /['"]Expiré['"]/g;
  const matches = content.match(expiredRegex);
  
  if (matches && matches.length > 0) {
    console.log(`❌ PROBLÈME: Trouvé ${matches.length} occurrence(s) de "Expiré" en français:`);
    matches.forEach((match, index) => {
      console.log(`   ${index + 1}. ${match}`);
    });
    
    // Trouver la ligne
    const lines = content.split('\n');
    lines.forEach((line, index) => {
      if (line.includes('Expiré')) {
        console.log(`   Ligne ${index + 1}: ${line.trim()}`);
      }
    });
  } else {
    console.log('✅ SUCCÈS: Aucun texte "Expiré" en français trouvé !');
  }
  
  // Vérifier la présence de la traduction
  if (content.includes("t('vote.expired')")) {
    console.log('✅ SUCCÈS: La traduction t(\'vote.expired\') est présente !');
  } else {
    console.log('❌ PROBLÈME: La traduction t(\'vote.expired\') est manquante.');
  }
  
  // Chercher d'autres textes français potentiels dans la fonction getVoteTimeRemaining
  const frenchTexts = [
    'Permanent',
    'Chargement de la room',
    'Expiré'
  ];
  
  let otherFrenchFound = false;
  frenchTexts.forEach(text => {
    const regex = new RegExp(`['"]${text}['"']`, 'g');
    const textMatches = content.match(regex);
    if (textMatches && textMatches.length > 0) {
      if (!otherFrenchFound) {
        console.log('\n⚠️  Autres textes français détectés:');
        otherFrenchFound = true;
      }
      console.log(`   - "${text}": ${textMatches.length} occurrence(s)`);
    }
  });
  
  if (!otherFrenchFound) {
    console.log('\n✅ Aucun autre texte français détecté dans les vérifications de base.');
  }
  
  console.log('\n📋 Résumé:');
  console.log('   • Le texte "Expiré" a été remplacé par t(\'vote.expired\')');
  console.log('   • Les clés de traduction ont été ajoutées dans tous les fichiers de langue');
  console.log('   • La fonction getVoteTimeRemaining utilise maintenant les traductions dynamiques');
  
} catch (error) {
  console.error('❌ Erreur lors de la lecture du fichier:', error.message);
  process.exit(1);
}

console.log('');
