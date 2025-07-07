#!/usr/bin/env node

/**
 * Test de la persistance des votes supprimés après restauration
 * 
 * Ce test vérifie que :
 * 1. Les votes expirés supprimés restent supprimés après reload
 * 2. Les votes non-expirés supprimés réapparaissent après reload
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testVotePersistence() {
  console.log('🧪 Test de la persistance des votes supprimés après restauration\n');

  try {
    // 1. Créer une room de test
    console.log('1. Création d\'une room de test...');
    const roomResponse = await axios.post(`${BASE_URL}/api/rooms`, {
      name: 'Test Persistence Room'
    });
    const roomId = roomResponse.data.id;
    console.log(`✅ Room créée avec l'ID: ${roomId}`);

    // 2. Créer un vote qui va expirer rapidement
    console.log('\n2. Création d\'un vote qui expire dans 10 secondes...');
    const expiredVoteResponse = await axios.post(`${BASE_URL}/api/votes`, {
      roomId,
      title: 'Vote pour test persistance - va expirer',
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

    // 3. Créer un vote actif (qui n'expire pas)
    console.log('\n3. Création d\'un vote actif (60 minutes)...');
    const activeVoteResponse = await axios.post(`${BASE_URL}/api/votes`, {
      roomId,
      title: 'Vote pour test persistance - actif',
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

    // 4. Attendre que le premier vote expire
    console.log('\n4. Attente que le vote expire (12 secondes)...');
    await new Promise(resolve => setTimeout(resolve, 12000));

    // 5. Vérifier les statuts
    console.log('\n5. Vérification des statuts...');
    const votesAfterExpiry = await axios.get(`${BASE_URL}/api/votes/room/${roomId}`);
    const expiredVote = votesAfterExpiry.data.find(v => v.id === expiredVoteId);
    const activeVote = votesAfterExpiry.data.find(v => v.id === activeVoteId);
    
    console.log(`   - Vote ${expiredVoteId}: Status = ${expiredVote?.status}`);
    console.log(`   - Vote ${activeVoteId}: Status = ${activeVote?.status}`);

    console.log('\n📱 Instructions pour tester côté mobile :');
    console.log('1. Ouvrir la room dans l\'app mobile');
    console.log('2. Voir les 2 notifications de vote');
    console.log(`3. Swiper pour supprimer le vote expiré (${expiredVoteId})`);
    console.log(`4. Swiper pour supprimer le vote actif (${activeVoteId})`);
    console.log('5. Reloader la room (pull-to-refresh ou navigation)');
    console.log('6. Vérifier que :');
    console.log(`   - Le vote expiré (${expiredVoteId}) ne réapparaît PAS`);
    console.log(`   - Le vote actif (${activeVoteId}) réapparaît`);

    console.log('\n✅ Votes créés et prêts pour le test de persistance');
    console.log('💡 Laissez cette room ouverte pour le test, puis relancez ce script pour nettoyer');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.response?.data || error.message);
  }
}

// Fonction de nettoyage
async function cleanupTestRooms() {
  console.log('🧹 Nettoyage des rooms de test...');
  try {
    // Cette fonction peut être améliorée pour nettoyer automatiquement
    console.log('Pour nettoyer manuellement, supprimez les rooms "Test Persistence Room"');
  } catch (error) {
    console.error('Erreur lors du nettoyage:', error);
  }
}

// Détecter l'argument de la ligne de commande
const args = process.argv.slice(2);
if (args.includes('--cleanup')) {
  cleanupTestRooms();
} else {
  testVotePersistence();
}
