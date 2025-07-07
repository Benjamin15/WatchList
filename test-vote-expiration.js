#!/usr/bin/env node

/**
 * Créer un vote de test avec une durée très courte pour tester l'expiration
 */

const SERVER_BASE_URL = 'http://localhost:3000';

async function createTestVote() {
  console.log('🧪 Création d\'un vote de test avec durée courte\n');

  try {
    // 1. Créer un vote qui expire dans 5 secondes
    console.log('1. Création d\'un vote expirant dans 5 secondes...');
    const voteResponse = await fetch(`${SERVER_BASE_URL}/api/votes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomId: 1,
        title: 'Vote de test - Expiration rapide',
        description: 'Ce vote expire dans 5 secondes pour tester la logique',
        duration: 5, // 5 secondes
        durationUnit: 'seconds', // On va modifier le serveur pour accepter les secondes
        mediaIds: [1, 2], // IDs fictifs
        createdBy: 'test-user'
      })
    });

    if (voteResponse.ok) {
      const vote = await voteResponse.json();
      console.log('✅ Vote créé avec succès');
      console.log(`   ID: ${vote.data.voteId}`);
    } else {
      const error = await voteResponse.json();
      console.log(`❌ Erreur lors de la création: ${voteResponse.status}`);
      console.log(`   Message: ${error.error}`);
      
      if (voteResponse.status === 409) {
        console.log('ℹ️  Un vote actif existe déjà - c\'est normal si on teste la limitation');
      }
    }

    // 2. Vérifier l'état initial
    console.log('\n2. Vérification de l\'état initial...');
    await checkVoteStatus(1);

    // 3. Attendre l'expiration si on a créé un vote
    if (voteResponse.ok) {
      console.log('\n3. Attente de l\'expiration (7 secondes)...');
      await new Promise(resolve => setTimeout(resolve, 7000));

      console.log('\n4. Vérification après expiration...');
      await checkVoteStatus(1);
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

async function checkVoteStatus(roomId) {
  try {
    const response = await fetch(`${SERVER_BASE_URL}/api/votes/room/${roomId}`);
    const data = await response.json();
    const votes = data.data || [];
    
    console.log(`   Votes trouvés: ${votes.length}`);
    
    votes.forEach((vote, index) => {
      const now = new Date();
      const endsAt = vote.endsAt ? new Date(vote.endsAt) : null;
      const isExpiredByDate = endsAt && endsAt <= now;
      
      console.log(`   Vote ${index + 1}:`);
      console.log(`     - Titre: ${vote.title}`);
      console.log(`     - Statut BD: ${vote.status}`);
      console.log(`     - Fin: ${endsAt ? endsAt.toLocaleString() : 'Permanent'}`);
      console.log(`     - Expiré par date: ${isExpiredByDate ? 'OUI' : 'NON'}`);
      
      if (isExpiredByDate && vote.status === 'active') {
        console.log('     ⚠️  PROBLÈME: Vote expiré mais statut "active"');
      } else if (isExpiredByDate && vote.status === 'expired') {
        console.log('     ✅ OK: Vote expiré avec bon statut');
      } else if (!isExpiredByDate && vote.status === 'active') {
        console.log('     ✅ OK: Vote actif valide');
      }
    });

    // Test logique client
    const hasActiveVote = testClientHasActiveVote(votes);
    console.log(`   Logique client hasActiveVote(): ${hasActiveVote}`);
    
  } catch (error) {
    console.error('   Erreur lors de la vérification:', error.message);
  }
}

function testClientHasActiveVote(votes) {
  const now = new Date();
  return votes.some(vote => {
    if (vote.status !== 'active') {
      return false;
    }
    
    if (vote.endsAt) {
      const endsAt = new Date(vote.endsAt);
      return endsAt > now;
    }
    
    return true;
  });
}

if (require.main === module) {
  createTestVote();
}

module.exports = { createTestVote, checkVoteStatus, testClientHasActiveVote };
