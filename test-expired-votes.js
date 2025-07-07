#!/usr/bin/env node

/**
 * Test de la correction du statut des votes expirés
 */

const SERVER_BASE_URL = 'http://localhost:3000';

async function testExpiredVoteStatus() {
  console.log('🧪 Test de la correction des votes expirés\n');

  try {
    // 1. Vérifier les votes dans une room
    console.log('1. Vérification des votes existants...');
    const roomId = 1;
    const votesResponse = await fetch(`${SERVER_BASE_URL}/api/votes/room/${roomId}`);
    const votesData = await votesResponse.json();
    const votes = votesData.data || [];
    
    console.log(`✅ Votes trouvés: ${votes.length}`);
    
    // 2. Analyser chaque vote
    votes.forEach((vote, index) => {
      console.log(`\n--- Vote ${index + 1} ---`);
      console.log(`ID: ${vote.id}`);
      console.log(`Titre: ${vote.title}`);
      console.log(`Statut: ${vote.status}`);
      console.log(`Créé: ${new Date(vote.createdAt).toLocaleString()}`);
      console.log(`Fin: ${vote.endsAt ? new Date(vote.endsAt).toLocaleString() : 'Permanent'}`);
      
      if (vote.endsAt) {
        const now = new Date();
        const endsAt = new Date(vote.endsAt);
        const isExpired = endsAt <= now;
        
        console.log(`Expiré selon la date: ${isExpired ? 'OUI' : 'NON'}`);
        
        if (isExpired && vote.status === 'active') {
          console.log('⚠️  PROBLÈME: Vote expiré mais statut encore "active"');
        } else if (isExpired && vote.status === 'expired') {
          console.log('✅ OK: Vote expiré avec bon statut');
        } else if (!isExpired && vote.status === 'active') {
          console.log('✅ OK: Vote actif non expiré');
        }
      }
    });

    // 3. Tester la logique côté client
    console.log('\n3. Test de la logique côté client...');
    const hasActiveVote = testClientLogic(votes);
    console.log(`Résultat hasActiveVote(): ${hasActiveVote}`);
    
    // 4. Tester l'état du bouton
    console.log('\n4. État du bouton "Créer un vote":');
    if (hasActiveVote) {
      console.log('   ❌ DÉSACTIVÉ - Vote actif détecté');
    } else {
      console.log('   ✅ ACTIVÉ - Aucun vote actif');
    }

    console.log('\n🎉 Test terminé!');

  } catch (error) {
    console.error('❌ Erreur durant le test:', error.message);
    process.exit(1);
  }
}

// Reproduit la logique côté client
function testClientLogic(votes) {
  const now = new Date();
  return votes.some(vote => {
    // Vérifier le statut
    if (vote.status !== 'active') {
      return false;
    }
    
    // Si le vote a une date de fin, vérifier qu'elle n'est pas passée
    if (vote.endsAt) {
      const endsAt = new Date(vote.endsAt);
      return endsAt > now;
    }
    
    // Pas de date de fin = vote permanent actif
    return true;
  });
}

if (require.main === module) {
  testExpiredVoteStatus();
}

module.exports = { testExpiredVoteStatus, testClientLogic };
