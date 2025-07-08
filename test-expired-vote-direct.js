#!/usr/bin/env node

/**
 * Test direct de la logique de mise à jour des votes expirés
 * en utilisant directement Prisma pour créer un vote expiré
 */

const { PrismaClient } = require('@prisma/client');

const SERVER_BASE_URL = 'http://localhost:3000';

async function testExpiredVoteUpdateLogic() {
  console.log('🧪 Test direct de la logique des votes expirés\n');
  
  const prisma = new PrismaClient();

  try {
    // 1. Créer un vote directement en base avec une date passée
    console.log('1. Création d\'un vote expiré directement en base...');
    
    const pastDate = new Date(Date.now() - 10000); // 10 secondes dans le passé
    
    const vote = await prisma.vote.create({
      data: {
        roomId: 1,
        title: 'Vote de test expiré',
        description: 'Ce vote devrait être automatiquement marqué comme expiré',
        status: 'active', // On le crée comme actif même s'il est expiré
        endsAt: pastDate,
        createdBy: 'test-system',
        duration: 10
      }
    });
    
    console.log('✅ Vote créé avec succès');
    console.log(`   ID: ${vote.id}`);
    console.log(`   Statut initial: ${vote.status}`);
    console.log(`   Date de fin: ${vote.endsAt.toLocaleString()}`);
    console.log(`   Date actuelle: ${new Date().toLocaleString()}`);

    // 2. Vérifier l'état avant l'appel API
    console.log('\n2. État avant appel API...');
    const voteBeforeUpdate = await prisma.vote.findUnique({
      where: { id: vote.id }
    });
    console.log(`   Statut en base: ${voteBeforeUpdate.status}`);

    // 3. Appeler l'API pour déclencher la mise à jour automatique
    console.log('\n3. Appel API pour déclencher la mise à jour...');
    const response = await fetch(`${SERVER_BASE_URL}/api/votes/room/1`);
    const data = await response.json();
    
    console.log('✅ API appelée avec succès');

    // 4. Vérifier l'état après l'appel API
    console.log('\n4. État après appel API...');
    const voteAfterUpdate = await prisma.vote.findUnique({
      where: { id: vote.id }
    });
    console.log(`   Statut en base: ${voteAfterUpdate.status}`);
    
    // 5. Analyser les résultats
    console.log('\n5. Analyse des résultats...');
    if (voteAfterUpdate.status === 'expired') {
      console.log('✅ SUCCÈS: Le vote a été automatiquement marqué comme expiré');
    } else {
      console.log('❌ ÉCHEC: Le vote n\'a pas été mis à jour automatiquement');
    }

    // 6. Tester la logique côté client
    console.log('\n6. Test logique côté client...');
    const votesFromAPI = data.data || [];
    const hasActiveVote = testClientLogic(votesFromAPI);
    console.log(`   hasActiveVote() retourne: ${hasActiveVote}`);
    
    if (!hasActiveVote) {
      console.log('✅ SUCCÈS: La logique côté client détecte correctement l\'absence de vote actif');
    } else {
      console.log('❌ ÉCHEC: La logique côté client détecte encore un vote actif');
    }

    // 7. Nettoyer - supprimer le vote de test
    console.log('\n7. Nettoyage...');
    await prisma.vote.delete({
      where: { id: vote.id }
    });
    console.log('✅ Vote de test supprimé');

    console.log('\n🎉 Test terminé!');

  } catch (error) {
    console.error('❌ Erreur durant le test:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

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
  testExpiredVoteUpdateLogic();
}

module.exports = { testExpiredVoteUpdateLogic, testClientLogic };
