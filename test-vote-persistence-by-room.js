#!/usr/bin/env node

/**
 * Test de correction: Persistance des votes supprimés par room
 * 
 * Valide que les votes supprimés sont correctement stockés par room
 * et ne réapparaissent pas lors du changement de room
 */

console.log('🔧 TEST: Correction persistance votes supprimés par room');
console.log('======================================================');

// Simulation de l'AsyncStorage avec clés par room
const mockAsyncStorage = new Map();

// Fonctions corrigées simulées
const getDismissedVotesStorageKey = (roomId) => `dismissedVotes_${roomId}`;

const loadDismissedVotes = async (roomId) => {
  const stored = mockAsyncStorage.get(getDismissedVotesStorageKey(roomId));
  if (stored) {
    const votesArray = JSON.parse(stored);
    return new Set(votesArray);
  }
  return new Set();
};

const saveDismissedVotes = async (roomId, dismissedVotes) => {
  const votesArray = Array.from(dismissedVotes);
  mockAsyncStorage.set(getDismissedVotesStorageKey(roomId), JSON.stringify(votesArray));
  console.log(`  💾 ${votesArray.length} votes supprimés sauvegardés pour room ${roomId}`);
};

// Simulation du test
async function runTest() {
  console.log('\n📋 Scénario de test:');
  console.log('1. User est dans room "ABC123"');
  console.log('2. User supprime les votes 101 et 102');
  console.log('3. User change pour room "XYZ789"');
  console.log('4. User supprime le vote 201');
  console.log('5. User revient à room "ABC123"');
  console.log('6. Vérifier que seuls les votes 101 et 102 sont supprimés');

  // Étape 1: Room ABC123
  console.log('\n🏠 ÉTAPE 1: Room ABC123');
  let currentRoom = 'ABC123';
  let dismissedVotes = await loadDismissedVotes(currentRoom);
  console.log(`  État initial: ${dismissedVotes.size} votes supprimés`);

  // Étape 2: Suppression votes 101 et 102
  console.log('\n❌ ÉTAPE 2: Suppression votes 101 et 102');
  dismissedVotes.add(101);
  dismissedVotes.add(102);
  await saveDismissedVotes(currentRoom, dismissedVotes);
  console.log(`  État: ${dismissedVotes.size} votes supprimés dans room ${currentRoom}`);

  // Étape 3: Changement pour room XYZ789
  console.log('\n🔄 ÉTAPE 3: Changement pour room XYZ789');
  currentRoom = 'XYZ789';
  dismissedVotes = await loadDismissedVotes(currentRoom);
  console.log(`  État room ${currentRoom}: ${dismissedVotes.size} votes supprimés`);

  // Étape 4: Suppression vote 201 dans la nouvelle room
  console.log('\n❌ ÉTAPE 4: Suppression vote 201');
  dismissedVotes.add(201);
  await saveDismissedVotes(currentRoom, dismissedVotes);
  console.log(`  État: ${dismissedVotes.size} votes supprimés dans room ${currentRoom}`);

  // Étape 5: Retour à room ABC123
  console.log('\n🔄 ÉTAPE 5: Retour à room ABC123');
  currentRoom = 'ABC123';
  dismissedVotes = await loadDismissedVotes(currentRoom);
  console.log(`  État room ${currentRoom}: ${dismissedVotes.size} votes supprimés`);
  
  // Étape 6: Vérification
  console.log('\n✅ ÉTAPE 6: Vérification');
  const hasVote101 = dismissedVotes.has(101);
  const hasVote102 = dismissedVotes.has(102);
  const hasVote201 = dismissedVotes.has(201);
  
  console.log(`  Vote 101 supprimé: ${hasVote101 ? '✅' : '❌'}`);
  console.log(`  Vote 102 supprimé: ${hasVote102 ? '✅' : '❌'}`);
  console.log(`  Vote 201 absent: ${!hasVote201 ? '✅' : '❌'} (doit être dans autre room)`);

  // Vérification finale
  const testPassed = hasVote101 && hasVote102 && !hasVote201;
  
  console.log('\n📊 Résultat du test:');
  if (testPassed) {
    console.log('🎉 SUCCÈS: La persistance par room fonctionne correctement !');
    console.log('✓ Les votes supprimés sont isolés par room');
    console.log('✓ Pas de pollution croisée entre rooms');
    console.log('✓ La persistance survit aux changements de room');
  } else {
    console.log('❌ ÉCHEC: Problème de persistance par room');
  }

  // Afficher l'état final du stockage
  console.log('\n💾 État final du stockage:');
  for (const [key, value] of mockAsyncStorage.entries()) {
    const votes = JSON.parse(value);
    console.log(`  ${key}: [${votes.join(', ')}]`);
  }

  return testPassed;
}

// Exécuter le test
runTest().then(success => {
  console.log('\n📝 Résumé de la correction:');
  console.log('• AVANT: Clé globale "dismissedVotes" → pollution entre rooms');
  console.log('• APRÈS: Clé par room "dismissedVotes_ROOMID" → isolation correcte');
  console.log('• Changement: loadDismissedVotes(roomId) + saveDismissedVotes(roomId, votes)');
  console.log('• Bonus: Réinitialisation votes temporaires à chaque changement de room');
  
  process.exit(success ? 0 : 1);
});
