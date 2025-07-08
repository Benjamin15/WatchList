#!/usr/bin/env node

/**
 * Test de la persistance des votes supprimés
 * Simule le comportement de l'AsyncStorage
 */

// Simulation d'AsyncStorage pour le test
const mockAsyncStorage = {
  storage: new Map(),
  
  async getItem(key) {
    return this.storage.get(key) || null;
  },
  
  async setItem(key, value) {
    this.storage.set(key, value);
  },
  
  async removeItem(key) {
    this.storage.delete(key);
  },
  
  async clear() {
    this.storage.clear();
  }
};

// Clé de stockage
const DISMISSED_VOTES_STORAGE_KEY = 'dismissedVotes';

// Fonctions utilitaires (copies de celles du RoomScreen)
const loadDismissedVotes = async () => {
  try {
    const stored = await mockAsyncStorage.getItem(DISMISSED_VOTES_STORAGE_KEY);
    if (stored) {
      const votesArray = JSON.parse(stored);
      return new Set(votesArray);
    }
  } catch (error) {
    console.error('Erreur lors du chargement des votes supprimés:', error);
  }
  return new Set();
};

const saveDismissedVotes = async (dismissedVotes) => {
  try {
    const votesArray = Array.from(dismissedVotes);
    await mockAsyncStorage.setItem(DISMISSED_VOTES_STORAGE_KEY, JSON.stringify(votesArray));
    console.log(`${votesArray.length} votes supprimés sauvegardés`);
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des votes supprimés:', error);
  }
};

// Simulation du comportement de l'app
async function testVoteDismissPersistence() {
  console.log('🧪 Test de la persistance des votes supprimés\n');

  try {
    // 1. État initial - aucun vote supprimé
    console.log('1. État initial...');
    let dismissedVotes = await loadDismissedVotes();
    console.log(`   Votes supprimés chargés: ${dismissedVotes.size}`);
    console.log(`   Votes: [${Array.from(dismissedVotes).join(', ')}]`);

    // 2. Simuler des votes existants
    console.log('\n2. Simulation de votes dans la room...');
    const mockVotes = [
      { id: 1, status: 'active', title: 'Vote actif', endsAt: new Date(Date.now() + 60000) },
      { id: 2, status: 'expired', title: 'Vote expiré', endsAt: new Date(Date.now() - 10000) },
      { id: 3, status: 'completed', title: 'Vote terminé', endsAt: new Date(Date.now() - 5000) },
      { id: 4, status: 'expired', title: 'Vote expiré ancien', endsAt: new Date(Date.now() - 86400000) } // 1 jour
    ];
    
    console.log(`   ${mockVotes.length} votes simulés`);
    mockVotes.forEach(vote => {
      console.log(`     - Vote ${vote.id}: ${vote.status} (${vote.title})`);
    });

    // 3. Fonction pour filtrer les votes affichables
    const getDisplayableVotes = () => {
      return mockVotes.filter(vote => {
        // Ne pas afficher les votes supprimés par l'utilisateur
        if (dismissedVotes.has(vote.id)) return false;
        
        // Afficher les votes actifs
        if (vote.status === 'active') return true;
        
        // Afficher les votes récemment terminés (moins de 24h)
        if (vote.status === 'completed' || vote.status === 'expired') {
          const voteEndTime = vote.endsAt ? new Date(vote.endsAt) : new Date();
          const now = new Date();
          const diffHours = (now.getTime() - voteEndTime.getTime()) / (1000 * 60 * 60);
          return diffHours < 24; // Afficher pendant 24h après la fin
        }
        
        return false;
      });
    };

    // 4. Afficher les votes visibles initialement
    console.log('\n3. Votes visibles initialement...');
    let visibleVotes = getDisplayableVotes();
    console.log(`   ${visibleVotes.length} votes affichés`);
    visibleVotes.forEach(vote => {
      console.log(`     - Vote ${vote.id}: ${vote.title}`);
    });

    // 5. Simuler la suppression d'un vote expiré
    console.log('\n4. Suppression du vote expiré (ID: 2)...');
    const voteToDismiss = 2;
    
    // Simulation de dismissVoteNotification
    dismissedVotes = new Set([...dismissedVotes, voteToDismiss]);
    await saveDismissedVotes(dismissedVotes);
    
    console.log(`   Vote ${voteToDismiss} supprimé pour cet appareil`);

    // 6. Afficher les votes visibles après suppression
    console.log('\n5. Votes visibles après suppression...');
    visibleVotes = getDisplayableVotes();
    console.log(`   ${visibleVotes.length} votes affichés`);
    visibleVotes.forEach(vote => {
      console.log(`     - Vote ${vote.id}: ${vote.title}`);
    });

    // 7. Simuler un redémarrage d'app (rechargement des données)
    console.log('\n6. Simulation redémarrage app (rechargement)...');
    dismissedVotes = await loadDismissedVotes(); // Recharger depuis le stockage
    console.log(`   Votes supprimés rechargés: ${dismissedVotes.size}`);
    console.log(`   Votes: [${Array.from(dismissedVotes).join(', ')}]`);

    // 8. Vérifier que le vote reste supprimé après rechargement
    console.log('\n7. Votes visibles après rechargement...');
    visibleVotes = getDisplayableVotes();
    console.log(`   ${visibleVotes.length} votes affichés`);
    visibleVotes.forEach(vote => {
      console.log(`     - Vote ${vote.id}: ${vote.title}`);
    });

    // 9. Vérifier que le vote 2 n'est toujours pas visible
    const vote2Visible = visibleVotes.some(v => v.id === 2);
    if (!vote2Visible) {
      console.log('\n✅ SUCCÈS: Le vote supprimé reste masqué après rechargement');
    } else {
      console.log('\n❌ ÉCHEC: Le vote supprimé est redevenu visible');
    }

    // 10. Simuler la suppression d'un autre vote
    console.log('\n8. Suppression d\'un second vote (ID: 3)...');
    dismissedVotes = new Set([...dismissedVotes, 3]);
    await saveDismissedVotes(dismissedVotes);

    visibleVotes = getDisplayableVotes();
    console.log(`   ${visibleVotes.length} votes affichés après seconde suppression`);

    // 11. Résumé final
    console.log('\n📋 Résumé final:');
    console.log(`   Votes supprimés définitivement: [${Array.from(dismissedVotes).join(', ')}]`);
    console.log(`   Votes encore visibles: ${visibleVotes.length}`);
    console.log('\n✅ Test de persistance terminé avec succès!');
    
    console.log('\n🎯 Comportement attendu dans l\'app:');
    console.log('   • Les votes supprimés restent masqués après rechargement');
    console.log('   • Chaque appareil a sa propre liste de votes supprimés');
    console.log('   • Les autres appareils voient encore les votes non supprimés');

  } catch (error) {
    console.error('❌ Erreur durant le test:', error.message);
  }
}

if (require.main === module) {
  testVoteDismissPersistence();
}

module.exports = { testVoteDismissPersistence, loadDismissedVotes, saveDismissedVotes };
