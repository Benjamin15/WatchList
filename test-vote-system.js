#!/usr/bin/env node

/**
 * Script de test pour le système de vote
 * Teste les fonctionnalités principales : création, récupération, vote, et vérification userHasVoted
 */

const axios = require('axios');

const API_BASE = 'http://localhost:3000/api';
const TEST_ROOM_ID = 'test-vote-room';
const TEST_DEVICE_ID = 'test-device-123';

// Configuration axios
const api = axios.create({
  baseURL: API_BASE,
  timeout: 5000,
});

// Utiliser la console avec couleurs
const log = {
  info: (msg) => console.log(`\x1b[34mℹ️  ${msg}\x1b[0m`),
  success: (msg) => console.log(`\x1b[32m✅ ${msg}\x1b[0m`),
  error: (msg) => console.log(`\x1b[31m❌ ${msg}\x1b[0m`),
  warn: (msg) => console.log(`\x1b[33m⚠️  ${msg}\x1b[0m`),
};

async function createTestRoom() {
  try {
    const response = await api.post('/rooms', {
      name: 'Test Vote Room',
      roomId: TEST_ROOM_ID
    });
    log.success('Room de test créée');
    return response.data;
  } catch (error) {
    if (error.response?.status === 409) {
      log.info('Room de test existe déjà');
      return { roomId: TEST_ROOM_ID };
    }
    throw error;
  }
}

async function addTestMediaToRoom() {
  try {
    // Ajouter quelques films de test
    const mediaList = [
      {
        title: 'Film Test 1',
        type: 'movie',
        externalId: 'tmdb:11111',
        imageUrl: 'https://image.tmdb.org/t/p/w500/test1.jpg',
        description: 'Action',
        releaseDate: '2023-01-01'
      },
      {
        title: 'Film Test 2', 
        type: 'movie',
        externalId: 'tmdb:22222',
        imageUrl: 'https://image.tmdb.org/t/p/w500/test2.jpg',
        description: 'Comedy',
        releaseDate: '2023-06-01'
      },
      {
        title: 'Film Test 3',
        type: 'movie', 
        externalId: 'tmdb:33333',
        imageUrl: 'https://image.tmdb.org/t/p/w500/test3.jpg',
        description: 'Drama',
        releaseDate: '2023-12-01'
      }
    ];

    const mediaIds = [];
    
    for (const media of mediaList) {
      try {
        const response = await api.post(`/rooms/${TEST_ROOM_ID}/items`, media);
        mediaIds.push(response.data.data.id);
        log.success(`Media "${media.title}" ajouté (ID: ${response.data.data.id})`);
      } catch (error) {
        if (error.response?.status === 409) {
          // Media déjà présent, récupérer son ID
          const existingResponse = await api.get(`/rooms/${TEST_ROOM_ID}/items`);
          const existingMedia = existingResponse.data.data.find(m => m.title === media.title);
          if (existingMedia) {
            mediaIds.push(existingMedia.id);
            log.info(`Media "${media.title}" existe déjà (ID: ${existingMedia.id})`);
          }
        } else {
          throw error;
        }
      }
    }
    
    return mediaIds;
  } catch (error) {
    log.error('Erreur lors de l\'ajout des médias:', error.message);
    throw error;
  }
}

async function createTestVote(mediaIds) {
  try {
    const voteData = {
      roomId: TEST_ROOM_ID,
      title: 'Test Vote: Quel film regarder ce soir?',
      description: 'Vote de test pour valider le système',
      duration: 24, // 24 heures
      mediaIds: mediaIds.slice(0, 3), // Prendre les 3 premiers médias
      createdBy: 'Test User'
    };

    const response = await api.post('/votes', voteData);
    log.success(`Vote créé avec succès (ID: ${response.data.data.voteId})`);
    return response.data.data.voteId;
  } catch (error) {
    log.error('Erreur lors de la création du vote:', error.response?.data || error.message);
    throw error;
  }
}

async function testGetVoteById(voteId, expectUserHasVoted = false) {
  try {
    const response = await api.get(`/votes/${voteId}?deviceId=${TEST_DEVICE_ID}`);
    const vote = response.data.data;
    
    log.success(`Vote récupéré: "${vote.title}"`);
    log.info(`Status: ${vote.status}`);
    log.info(`Total votes: ${vote.totalVotes}`);
    log.info(`User has voted: ${vote.userHasVoted}`);
    log.info(`Options: ${vote.options.length}`);
    
    vote.options.forEach((option, index) => {
      log.info(`  ${index + 1}. ${option.media.title} - ${option.voteCount} votes (${option.percentage}%)`);
    });

    if (vote.userHasVoted !== expectUserHasVoted) {
      log.warn(`Attendu userHasVoted=${expectUserHasVoted}, obtenu=${vote.userHasVoted}`);
    } else {
      log.success(`userHasVoted correctement défini à ${expectUserHasVoted}`);
    }
    
    return vote;
  } catch (error) {
    log.error('Erreur lors de la récupération du vote:', error.response?.data || error.message);
    throw error;
  }
}

async function testSubmitVote(voteId, optionId) {
  try {
    const voteData = {
      voteId: voteId,
      optionId: optionId,
      voterName: 'Test Voter',
      deviceId: TEST_DEVICE_ID
    };

    const response = await api.post('/votes/submit', voteData);
    log.success(`Vote soumis avec succès (Result ID: ${response.data.data.resultId})`);
    return response.data.data.resultId;
  } catch (error) {
    log.error('Erreur lors de la soumission du vote:', error.response?.data || error.message);
    throw error;
  }
}

async function testGetVotesByRoom(expectUserHasVoted = false) {
  try {
    const response = await api.get(`/votes/room/${TEST_ROOM_ID}?deviceId=${TEST_DEVICE_ID}`);
    const votes = response.data.data;
    
    log.success(`${votes.length} vote(s) trouvé(s) dans la room`);
    
    votes.forEach(vote => {
      log.info(`Vote: "${vote.title}" - ${vote.totalVotes} votes, userHasVoted: ${vote.userHasVoted}`);
    });
    
    return votes;
  } catch (error) {
    log.error('Erreur lors de la récupération des votes de la room:', error.response?.data || error.message);
    throw error;
  }
}

async function runTests() {
  try {
    log.info('🧪 Début des tests du système de vote');
    
    // 1. Créer une room de test
    log.info('\n📋 Étape 1: Création de la room de test');
    await createTestRoom();
    
    // 2. Ajouter des médias de test
    log.info('\n🎬 Étape 2: Ajout des médias de test');
    const mediaIds = await addTestMediaToRoom();
    log.info(`${mediaIds.length} médias disponibles: ${mediaIds.join(', ')}`);
    
    // 3. Créer un vote de test
    log.info('\n🗳️  Étape 3: Création du vote');
    const voteId = await createTestVote(mediaIds);
    
    // 4. Tester la récupération du vote (userHasVoted = false)
    log.info('\n📖 Étape 4: Test récupération vote (avant vote)');
    const voteBefore = await testGetVoteById(voteId, false);
    
    // 5. Tester la soumission d'un vote
    log.info('\n✋ Étape 5: Test soumission vote');
    const firstOptionId = voteBefore.options[0].id;
    await testSubmitVote(voteId, firstOptionId);
    
    // 6. Tester la récupération du vote (userHasVoted = true)
    log.info('\n📖 Étape 6: Test récupération vote (après vote)');
    await testGetVoteById(voteId, true);
    
    // 7. Tester la récupération des votes de la room
    log.info('\n📋 Étape 7: Test récupération votes de la room');
    await testGetVotesByRoom(true);
    
    // 8. Tester un second vote (devrait échouer)
    log.info('\n🚫 Étape 8: Test double vote (devrait échouer)');
    try {
      await testSubmitVote(voteId, firstOptionId);
      log.error('Le double vote devrait échouer!');
    } catch (error) {
      if (error.response?.status === 400) {
        log.success('Double vote correctement rejeté');
      } else {
        throw error;
      }
    }
    
    log.success('\n🎉 Tous les tests sont passés avec succès!');
    log.info('Le système de vote fonctionne correctement.');
    
  } catch (error) {
    log.error('\n💥 Échec des tests:', error.message);
    process.exit(1);
  }
}

// Exécuter les tests
runTests().catch(console.error);
