#!/usr/bin/env node

/**
 * Test de validation des constantes API_ENDPOINTS
 * Ce script vérifie que les endpoints sont bien configurés
 */

console.log('🔍 Test des constantes API_ENDPOINTS');
console.log('===================================');

// Simuler l'import comme dans l'app
const fs = require('fs');
const path = require('path');

const constantsPath = path.join(__dirname, 'mobile/src/constants/index.ts');
const constantsContent = fs.readFileSync(constantsPath, 'utf8');

console.log('📄 Contenu du fichier constants/index.ts:');
console.log('');

// Extraire la section WATCHLIST
const watchlistMatches = constantsContent.match(/WATCHLIST:.*$/gm);
if (watchlistMatches) {
  watchlistMatches.forEach(match => {
    console.log(`✅ ${match}`);
  });
} else {
  console.log('❌ Aucune définition WATCHLIST trouvée');
}

console.log('');

// Vérifier que c'est bien /items et non /watchlist
if (constantsContent.includes('/items')) {
  console.log('✅ Endpoint configure pour /items');
} else {
  console.log('❌ Endpoint /items non trouvé');
}

if (constantsContent.includes('/watchlist')) {
  console.log('⚠️  Ancien endpoint /watchlist encore présent');
} else {
  console.log('✅ Aucun ancien endpoint /watchlist trouvé');
}

console.log('');
console.log('🎯 Test de la fonction WATCHLIST:');

// Simuler l'exécution de la fonction
const roomIdTest = '23d6673e8735';
const expectedResult = `/rooms/${roomIdTest}/items`;

console.log(`📋 roomId test: ${roomIdTest}`);
console.log(`📋 Résultat attendu: ${expectedResult}`);

// Extraire et tester la fonction
const functionMatch = constantsContent.match(/WATCHLIST:\s*\(roomId:[^)]+\)\s*=>\s*`([^`]+)`/);
if (functionMatch) {
  const template = functionMatch[1];
  console.log(`📋 Template trouvé: ${template}`);
  
  // Remplacer ${roomId} par la valeur test
  const result = template.replace('${roomId}', roomIdTest);
  console.log(`📋 Résultat généré: ${result}`);
  
  if (result === expectedResult) {
    console.log('✅ La fonction génère la bonne URL');
  } else {
    console.log('❌ La fonction génère une URL incorrecte');
  }
} else {
  console.log('❌ Impossible d\'extraire la fonction WATCHLIST');
}

console.log('');
console.log('💡 Si l\'app montre encore /watchlist dans les logs:');
console.log('   1. Cache Metro non vidé correctement');  
console.log('   2. Import incorrect dans api.ts');
console.log('   3. Build/bundle non régénéré');
console.log('');
console.log('🔧 Solutions recommandées:');
console.log('   1. npx expo start --clear');
console.log('   2. Redémarrer complètement l\'app mobile');
console.log('   3. Vérifier que l\'import est correct dans api.ts');
