#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Validation de la correction de l\'erreur getFilteredItems...\n');

const filePath = path.join(__dirname, 'mobile/src/screens/RoomScreen.tsx');

try {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Vérifier la présence des fonctions manquantes
  const requiredFunctions = [
    'hasActiveVote',
    'getDisplayableVotes', 
    'dismissVoteNotification',
    'getVoteStatusText',
    'getVoteBadgeInfo',
    'getFilteredItems',
    'renderMediaItem',
    'renderEmptyState',
    'getActiveFiltersCount',
    'handleOpenFilterSidebar',
    'handleCloseFilterSidebar',
    'handleApplyFilters'
  ];
  
  let foundFunctions = 0;
  const missingFunctions = [];
  
  requiredFunctions.forEach(funcName => {
    if (content.includes(`const ${funcName} = `)) {
      console.log(`✅ ${funcName}`);
      foundFunctions++;
    } else {
      console.log(`❌ ${funcName} - MANQUANT`);
      missingFunctions.push(funcName);
    }
  });
  
  console.log(`\n📊 Résultats: ${foundFunctions}/${requiredFunctions.length} fonctions présentes\n`);
  
  if (foundFunctions === requiredFunctions.length) {
    console.log('🎉 SUCCÈS ! Toutes les fonctions manquantes ont été ajoutées.');
    console.log('\n📋 Fonctions corrigées:');
    console.log('   • getFilteredItems() - Filtre et trie les éléments de la watchlist');
    console.log('   • hasActiveVote() - Vérifie s\'il y a un vote actif');
    console.log('   • getDisplayableVotes() - Obtient les votes non supprimés');
    console.log('   • dismissVoteNotification() - Supprime une notification de vote');
    console.log('   • getVoteStatusText() - Obtient le texte de statut d\'un vote');
    console.log('   • getVoteBadgeInfo() - Obtient les infos de badge d\'un vote');
    console.log('   • renderMediaItem() - Rend un élément de média');
    console.log('   • renderEmptyState() - Rend l\'état vide');
    console.log('   • Fonctions de gestion des filtres');
  } else {
    console.log('❌ ÉCHEC - Certaines fonctions sont encore manquantes:');
    missingFunctions.forEach(func => {
      console.log(`   • ${func}`);
    });
  }
  
  // Vérifier l'utilisation des traductions
  const hasTranslations = content.includes("t('vote.expired')") && 
                         content.includes("t('vote.permanent')") &&
                         content.includes("t('room.loading')");
  
  if (hasTranslations) {
    console.log('\n✅ Les traductions dynamiques sont bien utilisées');
  }
  
} catch (error) {
  console.error('❌ Erreur lors de la lecture du fichier:', error.message);
  process.exit(1);
}

console.log('');
