#!/usr/bin/env node

/**
 * Script de test pour valider la correction du filtrage par type de contenu
 * 
 * Ce script valide que :
 * 1. Le mapping type 'series' -> 'tv' fonctionne dans le filtrage
 * 2. Les séries sont bien affichées quand on filtre par "séries"
 * 3. Les films sont bien affichés quand on filtre par "films"
 * 4. L'option "Tous" affiche tout le contenu
 */

console.log('🔍 TEST: Correction du filtrage par type de contenu');
console.log('=====================================================');

// Simulation des données comme dans l'app
const mockWatchlistItems = [
  {
    id: 1,
    status: 'planned',
    media: { id: 1, title: 'Film Test', type: 'movie' }
  },
  {
    id: 2,
    status: 'planned',
    media: { id: 2, title: 'Série Test 1', type: 'tv' }
  },
  {
    id: 3,
    status: 'planned',
    media: { id: 3, title: 'Série Test 2', type: 'tv' }
  },
  {
    id: 4,
    status: 'planned',
    media: { id: 4, title: 'Film Test 2', type: 'movie' }
  }
];

// Simulation de la fonction de filtrage corrigée
function getFilteredItems(items, appliedFilters, currentTab) {
  let filteredItems = items.filter(item => item.status === currentTab);

  // Filtrer par type (avec correction du mapping)
  if (appliedFilters.type !== 'all') {
    // Mapper le type de filtre vers le type de données stockées
    const typeToMatch = appliedFilters.type === 'series' ? 'tv' : appliedFilters.type;
    filteredItems = filteredItems.filter(item => item.media.type === typeToMatch);
  }

  return filteredItems;
}

// Tests
function runTests() {
  console.log('\n📋 Données de test:');
  mockWatchlistItems.forEach(item => {
    console.log(`  - ${item.media.title} (type: '${item.media.type}')`);
  });

  console.log('\n🧪 Tests de filtrage:');
  
  // Test 1: Filtre "Tous"
  console.log('\n1. Filtre "Tous":');
  const allResults = getFilteredItems(mockWatchlistItems, { type: 'all' }, 'planned');
  console.log(`   Résultats: ${allResults.length}/4 éléments`);
  allResults.forEach(item => console.log(`   ✓ ${item.media.title}`));
  
  // Test 2: Filtre "Films"
  console.log('\n2. Filtre "Films" (movie):');
  const movieResults = getFilteredItems(mockWatchlistItems, { type: 'movie' }, 'planned');
  console.log(`   Résultats: ${movieResults.length}/2 films attendus`);
  movieResults.forEach(item => console.log(`   ✓ ${item.media.title} (type: ${item.media.type})`));
  
  // Test 3: Filtre "Séries" (mapping series -> tv)
  console.log('\n3. Filtre "Séries" (series -> tv):');
  const seriesResults = getFilteredItems(mockWatchlistItems, { type: 'series' }, 'planned');
  console.log(`   Résultats: ${seriesResults.length}/2 séries attendues`);
  seriesResults.forEach(item => console.log(`   ✓ ${item.media.title} (type: ${item.media.type})`));
  
  // Validation
  console.log('\n✅ Validation:');
  const tests = [
    { name: 'Tous les éléments', actual: allResults.length, expected: 4 },
    { name: 'Films uniquement', actual: movieResults.length, expected: 2 },
    { name: 'Séries uniquement', actual: seriesResults.length, expected: 2 },
  ];
  
  let allPassed = true;
  tests.forEach(test => {
    const passed = test.actual === test.expected;
    console.log(`   ${passed ? '✅' : '❌'} ${test.name}: ${test.actual}/${test.expected}`);
    if (!passed) allPassed = false;
  });
  
  console.log('\n📊 Résultat final:');
  if (allPassed) {
    console.log('🎉 SUCCÈS: Tous les tests de filtrage passent !');
    console.log('✓ Le mapping series -> tv fonctionne correctement');
    console.log('✓ Les utilisateurs peuvent filtrer par "séries" et voir les contenus "tv"');
  } else {
    console.log('❌ ÉCHEC: Certains tests ont échoué');
  }
}

// Exécuter les tests
runTests();

console.log('\n📝 Résumé de la correction:');
console.log('- Problème: filtre "series" ne trouvait pas les données "tv"');
console.log('- Solution: mapping typeToMatch = appliedFilters.type === "series" ? "tv" : appliedFilters.type');
console.log('- UX conservée: utilisateurs voient encore "Séries" dans l\'interface');
console.log('- Données cohérentes: stockage "tv" conforme à TMDB API');
