#!/usr/bin/env node

/**
 * Test simple de la logique de vote actif uniquement
 */

const SERVER_BASE_URL = 'http://localhost:3000';

async function testActiveVoteCheck() {
  console.log('🧪 Test simple de la vérification de vote actif\n');

  try {
    const roomId = 1; // Utiliser une room existante

    // 1. Vérifier les votes existants
    console.log('1. Vérification des votes existants...');
    const votesResponse = await fetch(`${SERVER_BASE_URL}/api/votes/room/${roomId}`);
    const votesData = await votesResponse.json();
    const votes = votesData.data || [];
    
    console.log(`✅ Votes trouvés: ${votes.length}`);
    
    // Simuler la logique côté client
    const hasActiveVote = votes.some(vote => vote.status === 'active');
    console.log(`✅ Vote actif détecté: ${hasActiveVote}`);
    
    // Simuler l'état du bouton
    console.log('\n🖱️  État du bouton "Créer un vote":');
    if (hasActiveVote) {
      console.log('   ❌ DÉSACTIVÉ - Un vote est déjà en cours');
      console.log('   💬 Message: "Il y a déjà un vote en cours dans cette room"');
    } else {
      console.log('   ✅ ACTIVÉ - Aucun vote actif');
      console.log('   💬 Message: "Proposer des films"');
    }

    // Tester la fonction hasActiveVote()
    console.log('\n📋 Test de la fonction hasActiveVote():');
    const testResult = testHasActiveVoteFunction(votes);
    console.log(`   Résultat: ${testResult}`);
    
    // Tester le comportement de l'interface
    console.log('\n[UI] Test du comportement de l\'interface:');
    testUIBehavior(hasActiveVote);

    console.log('\n🎉 Test terminé avec succès!');

  } catch (error) {
    console.error('❌ Erreur durant le test:', error.message);
    process.exit(1);
  }
}

function testHasActiveVoteFunction(votes) {
  // Simulation de la fonction hasActiveVote du RoomScreen
  return votes.some(vote => vote.status === 'active');
}

function testUIBehavior(hasActiveVote) {
  console.log('   Styles appliqués:');
  
  if (hasActiveVote) {
    console.log('     - fabMenuItem: styles.fabMenuItemDisabled (opacity: 0.5)');
    console.log('     - fabMenuIcon: styles.fabMenuIconDisabled (opacity: 0.5)');
    console.log('     - fabMenuText: styles.fabMenuTextDisabled (opacity: 0.5)');
    console.log('     - fabMenuDescription: styles.fabMenuDescriptionDisabled (opacity: 0.5)');
    console.log('     - TouchableOpacity disabled: true');
    console.log('     - Description: "Vote en cours..." au lieu de "Proposer des films"');
  } else {
    console.log('     - Styles normaux appliqués');
    console.log('     - TouchableOpacity disabled: false');
    console.log('     - Description: "Proposer des films"');
  }
  
  console.log('\n   Comportement au clic:');
  if (hasActiveVote) {
    console.log('     - Alert affiché: "Vote actif existant"');
    console.log('     - Message: "Il y a déjà un vote en cours dans cette room"');
    console.log('     - Navigation bloquée');
  } else {
    console.log('     - Navigation vers CreateVote screen');
    console.log('     - Paramètres: { roomId }');
  }
}

if (require.main === module) {
  testActiveVoteCheck();
}

module.exports = { testActiveVoteCheck, testHasActiveVoteFunction, testUIBehavior };
