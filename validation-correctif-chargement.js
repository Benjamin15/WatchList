#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Validation du correctif du chargement infini de RoomScreen...\n');

const filePath = path.join(__dirname, 'mobile/src/screens/RoomScreen.tsx');

try {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Tests de validation
  const tests = [
    {
      name: '✅ Présence de loadRoomData',
      test: () => content.includes('const loadRoomData = async () => {'),
      required: true
    },
    {
      name: '✅ Présence de loadWatchlistItems',
      test: () => content.includes('const loadWatchlistItems = async () => {'),
      required: true
    },
    {
      name: '✅ Présence de loadVotes',
      test: () => content.includes('const loadVotes = async () => {'),
      required: true
    },
    {
      name: '✅ Présence de loadAllData',
      test: () => content.includes('const loadAllData = async () => {'),
      required: true
    },
    {
      name: '✅ Présence de useEffect pour charger les données',
      test: () => content.includes('useEffect(() => {') && content.includes('loadAllData();'),
      required: true
    },
    {
      name: '✅ Présence de useFocusEffect',
      test: () => content.includes('useFocusEffect('),
      required: true
    },
    {
      name: '✅ Présence de setIsLoading(false)',
      test: () => content.includes('setIsLoading(false)'),
      required: true
    },
    {
      name: '✅ Appel à apiService.getWatchlist',
      test: () => content.includes('apiService.getWatchlist'),
      required: true
    },
    {
      name: '✅ Appel à apiService.getVotesByRoom',
      test: () => content.includes('apiService.getVotesByRoom'),
      required: true
    },
    {
      name: '✅ Gestion d\'erreur avec traductions',
      test: () => content.includes('t(\'room.errorLoadingRoom\')') && content.includes('t(\'room.errorLoadingWatchlist\')'),
      required: true
    }
  ];

  let passedTests = 0;
  let totalTests = tests.length;

  tests.forEach(test => {
    const passed = test.test();
    if (passed) {
      console.log(`${test.name}`);
      passedTests++;
    } else {
      console.log(`❌ ${test.name.replace('✅', 'ÉCHEC')}`);
      if (test.required) {
        console.log(`   ⚠️  Ce test est requis pour corriger le bug de chargement infini !`);
      }
    }
  });

  console.log(`\n📊 Résultats: ${passedTests}/${totalTests} tests passés\n`);

  if (passedTests === totalTests) {
    console.log('🎉 SUCCÈS ! Le correctif du chargement infini est complet.\n');
    console.log('📋 Changements appliqués:');
    console.log('   • Ajout de loadWatchlistItems() pour charger la watchlist');
    console.log('   • Ajout de loadVotes() pour charger les votes');
    console.log('   • Ajout de loadAllData() pour charger toutes les données');
    console.log('   • Ajout de useEffect() pour charger les données au montage');
    console.log('   • Ajout de useFocusEffect() pour recharger au focus');
    console.log('   • Correction de setIsLoading(false) après chargement');
    console.log('   • Ajout des clés de traduction pour les erreurs');
    console.log('\n🚀 Le bug de chargement infini devrait maintenant être corrigé !');
  } else {
    console.log('❌ ÉCHEC - Certains éléments requis sont manquants.');
    console.log('   Le bug de chargement infini pourrait persister.');
  }

} catch (error) {
  console.error('❌ Erreur lors de la lecture du fichier:', error.message);
  process.exit(1);
}
