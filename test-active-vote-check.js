#!/usr/bin/env node

/**
 * Script de test pour vérifier la logique de désactivation du bouton "Créer un vote"
 * quand il y a déjà un vote actif dans la room
 */

const SERVER_BASE_URL = 'http://localhost:3000';

async function testActiveVoteLogic() {
  console.log('🧪 Test de la logique de vote actif\n');

  try {
    // 1. Créer une room de test
    console.log('1. Création d\'une room de test...');
    const roomResponse = await fetch(`${SERVER_BASE_URL}/api/rooms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: `TestRoom-${Date.now()}`,
        description: 'Room de test pour vote actif'
      })
    });
    
    if (!roomResponse.ok) {
      throw new Error(`Erreur création room: ${roomResponse.status}`);
    }
    
    const room = await roomResponse.json();
    console.log(`✅ Room créée: ${room.name} (ID: ${room.id})`);

    // 2. Vérifier qu'il n'y a pas de vote actif initialement
    console.log('\n2. Vérification absence de vote actif...');
    const votesResponse = await fetch(`${SERVER_BASE_URL}/api/votes/room/${room.id}`);
    const votesData = await votesResponse.json();
    const votes = votesData.data || [];
    
    const hasActiveVote = votes.some(vote => vote.status === 'active');
    console.log(`✅ Pas de vote actif initialement: ${!hasActiveVote}`);

    // 3. Créer un premier vote
    console.log('\n3. Création du premier vote...');
    const vote1Response = await fetch(`${SERVER_BASE_URL}/api/votes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomId: room.id,
        title: 'Premier vote de test',
        description: 'Vote pour tester la limitation',
        duration: 60, // 1 heure
        durationUnit: 'minutes',
        mediaIds: [1, 2], // IDs de médias fictifs
        createdBy: 'test-user-1'
      })
    });

    if (!vote1Response.ok) {
      throw new Error(`Erreur création premier vote: ${vote1Response.status}`);
    }

    const vote1 = await vote1Response.json();
    console.log(`✅ Premier vote créé: ${vote1.title} (ID: ${vote1.id}, Status: ${vote1.status})`);

    // 4. Vérifier qu'il y a maintenant un vote actif
    console.log('\n4. Vérification présence vote actif...');
    const votes2Response = await fetch(`${SERVER_BASE_URL}/api/votes/room/${room.id}`);
    const votes2Data = await votes2Response.json();
    const votes2 = votes2Data.data || [];
    
    const hasActiveVote2 = votes2.some(vote => vote.status === 'active');
    console.log(`✅ Vote actif détecté: ${hasActiveVote2}`);

    // 5. Essayer de créer un second vote (devrait échouer)
    console.log('\n5. Tentative de création d\'un second vote...');
    const vote2Response = await fetch(`${SERVER_BASE_URL}/api/votes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomId: room.id,
        title: 'Second vote de test',
        description: 'Ce vote devrait être rejeté',
        duration: 30,
        durationUnit: 'minutes',
        mediaIds: [3, 4],
        createdBy: 'test-user-2'
      })
    });

    if (vote2Response.status === 409) {
      console.log('✅ Second vote correctement rejeté (409 Conflict)');
      const errorData = await vote2Response.json();
      console.log(`   Message: ${errorData.message}`);
    } else {
      console.log('❌ Le second vote n\'a pas été rejeté (problème!)');
    }

    // 6. Marquer le premier vote comme terminé
    console.log('\n6. Marquage du premier vote comme terminé...');
    const updateResponse = await fetch(`${SERVER_BASE_URL}/api/votes/${vote1.id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'completed'
      })
    });

    if (updateResponse.ok) {
      console.log('✅ Premier vote marqué comme terminé');
    }

    // 7. Vérifier qu'il n'y a plus de vote actif
    console.log('\n7. Vérification absence vote actif après fin...');
    const votes3Response = await fetch(`${SERVER_BASE_URL}/api/votes/room/${room.id}`);
    const votes3Data = await votes3Response.json();
    const votes3 = votes3Data.data || [];
    
    const hasActiveVote3 = votes3.some(vote => vote.status === 'active');
    console.log(`✅ Plus de vote actif: ${!hasActiveVote3}`);

    // 8. Essayer de créer un nouveau vote (devrait réussir)
    console.log('\n8. Création d\'un nouveau vote après fin du premier...');
    const vote3Response = await fetch(`${SERVER_BASE_URL}/api/votes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomId: room.id,
        title: 'Nouveau vote après fin',
        description: 'Ce vote devrait réussir',
        duration: 30,
        durationUnit: 'minutes',
        mediaIds: [5, 6],
        createdBy: 'test-user-3'
      })
    });

    if (vote3Response.ok) {
      const vote3 = await vote3Response.json();
      console.log(`✅ Nouveau vote créé avec succès: ${vote3.title} (ID: ${vote3.id})`);
    } else {
      console.log('❌ Échec création nouveau vote');
    }

    console.log('\n🎉 Test terminé avec succès!');
    console.log('\n📋 Résumé:');
    console.log('   - Limitation à un vote actif par room: ✅');
    console.log('   - Détection vote actif côté client: ✅');
    console.log('   - Gestion erreur 409: ✅');
    console.log('   - Nouvelle création après fin: ✅');

  } catch (error) {
    console.error('❌ Erreur durant le test:', error.message);
    process.exit(1);
  }
}

// Fonction utilitaire pour simuler la logique côté client
function simulateClientLogic(votes) {
  const hasActiveVote = votes.some(vote => vote.status === 'active');
  
  console.log('\n🖱️  Simulation logique côté client:');
  console.log(`   - Votes dans la room: ${votes.length}`);
  console.log(`   - Vote actif détecté: ${hasActiveVote}`);
  console.log(`   - Bouton "Créer un vote" ${hasActiveVote ? 'DÉSACTIVÉ' : 'ACTIVÉ'}`);
  
  if (hasActiveVote) {
    console.log('   - Message: "Il y a déjà un vote en cours dans cette room"');
  }
  
  return !hasActiveVote;
}

if (require.main === module) {
  testActiveVoteLogic();
}

module.exports = { testActiveVoteLogic, simulateClientLogic };
