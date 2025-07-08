#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Diagnostic des problèmes potentiels dans RoomScreen...\n');

const filePath = path.join(__dirname, 'mobile/src/screens/RoomScreen.tsx');

try {
  const content = fs.readFileSync(filePath, 'utf8');
  
  console.log('📋 Vérifications de diagnostic:');
  
  // Vérifier les imports
  const imports = [
    'useTranslation',
    'useLanguage', 
    'apiService',
    'LoadingScreen',
    'useFocusEffect'
  ];
  
  imports.forEach(imp => {
    if (content.includes(imp)) {
      console.log(`✅ Import ${imp} présent`);
    } else {
      console.log(`❌ Import ${imp} manquant`);
    }
  });
  
  console.log('');
  
  // Vérifier les fonctions de chargement
  const loadingFunctions = [
    'loadRoomData',
    'loadWatchlistItems', 
    'loadVotes',
    'loadAllData'
  ];
  
  loadingFunctions.forEach(func => {
    if (content.includes(`const ${func} = async`)) {
      console.log(`✅ Fonction ${func} présente`);
    } else {
      console.log(`❌ Fonction ${func} manquante`);
    }
  });
  
  console.log('');
  
  // Vérifier les hooks d'effet
  const hasUseEffect = content.includes('useEffect(() => {') && content.includes('loadAllData();');
  const hasUseFocusEffect = content.includes('useFocusEffect(');
  
  console.log(`${hasUseEffect ? '✅' : '❌'} useEffect avec loadAllData présent`);
  console.log(`${hasUseFocusEffect ? '✅' : '❌'} useFocusEffect présent`);
  
  console.log('');
  
  // Vérifier les appels API
  const apiCalls = [
    'apiService.getRoom',
    'apiService.getWatchlist', 
    'apiService.getVotesByRoom'
  ];
  
  apiCalls.forEach(call => {
    if (content.includes(call)) {
      console.log(`✅ Appel API ${call} présent`);
    } else {
      console.log(`❌ Appel API ${call} manquant`);
    }
  });
  
  console.log('');
  
  // Vérifier la gestion du loading
  const hasSetLoadingFalse = content.includes('setIsLoading(false)');
  const hasLoadingState = content.includes('const [isLoading, setIsLoading] = useState(true)');
  
  console.log(`${hasLoadingState ? '✅' : '❌'} État isLoading initialisé`);
  console.log(`${hasSetLoadingFalse ? '✅' : '❌'} setIsLoading(false) présent`);
  
  console.log('');
  
  // Vérifier les paramètres de route
  const hasRouteParams = content.includes('const { roomId } = route.params;');
  console.log(`${hasRouteParams ? '✅' : '❌'} Extraction des paramètres de route`);
  
  console.log('');
  
  // Problèmes potentiels
  console.log('⚠️  Problèmes potentiels à vérifier:');
  
  if (!hasSetLoadingFalse) {
    console.log('   • L\'état de chargement n\'est jamais mis à false - chargement infini');
  }
  
  if (!hasUseEffect) {
    console.log('   • Aucun useEffect pour charger les données - écran vide');
  }
  
  if (!content.includes('apiService.getRoom')) {
    console.log('   • API getRoom manquante - pas de données de room');
  }
  
  if (!content.includes('apiService.getWatchlist')) {
    console.log('   • API getWatchlist manquante - pas de watchlist');
  }
  
  if (content.includes('console.error')) {
    console.log('   • Des console.error présents - vérifier les logs de l\'app');
  }
  
  if (content.includes('Alert.alert')) {
    console.log('   • Des Alert.alert présents - vérifier les alertes d\'erreur');
  }
  
  console.log('\n💡 Pour diagnostiquer plus précisément, partagez les logs d\'erreur spécifiques.');
  
} catch (error) {
  console.error('❌ Erreur lors de la lecture du fichier:', error.message);
}

console.log('');
