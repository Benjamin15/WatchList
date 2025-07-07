#!/usr/bin/env node

/**
 * Test du comportement swipe-to-dismiss des notifications de vote
 * 
 * Comportement attendu :
 * - Vote NON expiré (actif/terminé) : swipe-to-dismiss = suppression temporaire (réapparaît au reload)
 * - Vote expiré : swipe-to-dismiss = suppression définitive (persistant)
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testSwipeBehavior() {
  console.log('🧪 Test du comportement swipe-to-dismiss des votes\n');

  try {
    // 1. Créer une room de test
    console.log('1. Création d\'une room de test...');
    const roomResponse = await axios.post(`${BASE_URL}/api/rooms`, {
      name: 'Test Swipe Behavior Room'
    });
    const roomId = roomResponse.data.id;
    console.log(`✅ Room créée avec l'ID: ${roomId}`);

    // 2. Créer un vote qui va expirer rapidement
    console.log('\n2. Création d\'un vote qui expire dans 10 secondes...');
    const expiredVoteResponse = await axios.post(`${BASE_URL}/api/votes`, {
      roomId,
      title: 'Vote qui va expirer',
      durationInMinutes: 0.17, // ~10 secondes
      options: [{
        tmdbId: 299536,
        title: 'Avengers: Infinity War',
        type: 'movie'
      }],
      createdBy: 'TestUser',
      deviceId: 'test-device-expired'
    });
    const expiredVoteId = expiredVoteResponse.data.id;
    console.log(`✅ Vote expirant créé avec l'ID: ${expiredVoteId}`);

    // 3. Attendre que le vote expire
    console.log('\n3. Attente que le vote expire (12 secondes)...');
    await new Promise(resolve => setTimeout(resolve, 12000));

    // 4. Vérifier que le vote est maintenant expiré
    console.log('\n4. Vérification du statut expiré...');
    const votesAfterExpiry = await axios.get(`${BASE_URL}/api/votes/room/${roomId}`);
    const expiredVote = votesAfterExpiry.data.find(v => v.id === expiredVoteId);
    
    if (expiredVote && expiredVote.status === 'expired') {
      console.log(`✅ Vote ${expiredVoteId} est maintenant expiré`);
    } else {
      console.log(`❌ Vote ${expiredVoteId} devrait être expiré mais status = ${expiredVote?.status}`);
    }

    // 5. Créer un vote actif (qui n'expire pas)
    console.log('\n5. Création d\'un vote actif (60 minutes)...');
    const activeVoteResponse = await axios.post(`${BASE_URL}/api/votes`, {
      roomId,
      title: 'Vote actif pour test',
      durationInMinutes: 60,
      options: [{
        tmdbId: 299537,
        title: 'Avengers: Endgame',
        type: 'movie'
      }],
      createdBy: 'TestUser',
      deviceId: 'test-device-active'
    });
    const activeVoteId = activeVoteResponse.data.id;
    console.log(`✅ Vote actif créé avec l'ID: ${activeVoteId}`);

    // 6. Récupérer tous les votes pour vérifier
    console.log('\n6. État actuel des votes :');
    const finalVotes = await axios.get(`${BASE_URL}/api/votes/room/${roomId}`);
    finalVotes.data.forEach(vote => {
      console.log(`   - Vote ${vote.id}: "${vote.title}" - Status: ${vote.status}`);
    });

    console.log('\n📱 Côté mobile, les comportements de swipe-to-dismiss devraient être :');
    console.log(`   - Vote ${expiredVoteId} (expiré) : suppression DÉFINITIVE après swipe`);
    console.log(`   - Vote ${activeVoteId} (actif) : suppression TEMPORAIRE après swipe (réapparaît au reload)`);

    // 7. Nettoyer
    console.log(`\n🧹 Nettoyage de la room ${roomId}...`);
    await axios.delete(`${BASE_URL}/api/rooms/${roomId}`);
    console.log('✅ Room supprimée');

    console.log('\n✅ Test terminé avec succès');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.response?.data || error.message);
  }
}

// Lancer le test
testSwipeBehavior();
