#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Diagnostic de l\'erreur persistante ligne 792...\n');

console.log('📋 Vérifications de l\'erreur:');

// Vérifier la configuration API
console.log('1. Configuration API:');
const configPath = path.join(__dirname, 'mobile/src/constants/config.ts');
try {
  const configContent = fs.readFileSync(configPath, 'utf8');
  
  // Extraire l'IP locale
  const ipMatch = configContent.match(/LOCAL_IP = '([^']+)'/);
  if (ipMatch) {
    console.log(`   ✅ IP locale configurée: ${ipMatch[1]}`);
    console.log(`   📡 URL API: http://${ipMatch[1]}:3000/api`);
  }
  
  // Vérifier USE_MOCK_DATA
  const mockMatch = configContent.match(/USE_MOCK_DATA = (true|false)/);
  if (mockMatch) {
    console.log(`   ${mockMatch[1] === 'false' ? '✅' : '⚠️'} USE_MOCK_DATA: ${mockMatch[1]} ${mockMatch[1] === 'false' ? '(utilise vraie API)' : '(utilise mock)'}`);
  }
} catch (error) {
  console.log('   ❌ Impossible de lire config.ts');
}

console.log('');

// Vérifier les endpoints
console.log('2. Configuration des endpoints:');
const endpointsPath = path.join(__dirname, 'mobile/src/constants/index.ts');
try {
  const endpointsContent = fs.readFileSync(endpointsPath, 'utf8');
  
  if (endpointsContent.includes('WATCHLIST: (roomId: number | string)')) {
    console.log('   ✅ WATCHLIST endpoint accepte number | string');
  } else if (endpointsContent.includes('WATCHLIST: (roomId: number)')) {
    console.log('   ❌ WATCHLIST endpoint accepte seulement number');
  } else {
    console.log('   ⚠️  WATCHLIST endpoint non trouvé');
  }
} catch (error) {
  console.log('   ❌ Impossible de lire index.ts');
}

console.log('');

// Vérifier la fonction loadWatchlistItems
console.log('3. Fonction loadWatchlistItems:');
const roomScreenPath = path.join(__dirname, 'mobile/src/screens/RoomScreen.tsx');
try {
  const roomScreenContent = fs.readFileSync(roomScreenPath, 'utf8');
  
  if (roomScreenContent.includes('console.log(\'RoomId type:\', typeof roomId);')) {
    console.log('   ✅ Logs de diagnostic ajoutés');
  } else {
    console.log('   ❌ Logs de diagnostic manquants');
  }
  
  if (roomScreenContent.includes('console.error(\'Error details:\',')) {
    console.log('   ✅ Logs d\'erreur détaillés ajoutés');
  } else {
    console.log('   ❌ Logs d\'erreur détaillés manquants');
  }
} catch (error) {
  console.log('   ❌ Impossible de lire RoomScreen.tsx');
}

console.log('');

console.log('🔍 Causes possibles de l\'erreur persistante:');
console.log('');
console.log('1. 🌐 SERVEUR BACKEND NON DISPONIBLE');
console.log('   - Le serveur sur http://192.168.0.14:3000 n\'est pas démarré');
console.log('   - Vérifiez: cd server && npm start');
console.log('');
console.log('2. 🚪 ENDPOINT INEXISTANT');
console.log('   - L\'endpoint /rooms/{roomId}/watchlist n\'existe pas côté serveur');
console.log('   - Vérifiez les routes du serveur backend');
console.log('');
console.log('3. 📡 PROBLÈME DE RÉSEAU');
console.log('   - Firewall bloque la connexion');
console.log('   - IP locale incorrecte (192.168.0.14)');
console.log('');
console.log('4. 🔑 AUTHENTIFICATION/AUTORISATION');
console.log('   - Headers manquants (device ID, etc.)');
console.log('   - Room ID invalide côté serveur');
console.log('');
console.log('💡 PROCHAINES ÉTAPES:');
console.log('1. Testez l\'ouverture de la room à nouveau');
console.log('2. Regardez les logs détaillés dans Metro/console');
console.log('3. Vérifiez si le serveur backend est démarré');
console.log('4. Partagez les nouveaux logs d\'erreur détaillés');

console.log('');
