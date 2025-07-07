#!/usr/bin/env node

/**
 * Script de validation finale - Migration Settings vers Sidebar
 * 
 * Vérifie que la migration de l'écran Settings vers SettingsSidebar
 * a été effectuée correctement et complètement.
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Validation finale de la migration Settings → Sidebar\n');

// Chemins des fichiers
const basePath = path.join(__dirname, 'mobile/src');
const files = {
  roomScreen: path.join(basePath, 'screens/RoomScreen.tsx'),
  appNavigator: path.join(basePath, 'navigation/AppNavigator.tsx'),
  types: path.join(basePath, 'types/index.ts'),
  settingsSidebar: path.join(basePath, 'components/SettingsSidebar.tsx'),
  settingsScreen: path.join(basePath, 'screens/SettingsScreen.tsx'), // Devrait être supprimé
};

let allGood = true;

function checkFile(filePath, shouldExist, description) {
  const exists = fs.existsSync(filePath);
  const status = exists === shouldExist;
  
  if (status) {
    console.log(`✅ ${description}: ${shouldExist ? 'Existe' : 'Supprimé'}`);
  } else {
    console.log(`❌ ${description}: ${shouldExist ? 'MANQUANT' : 'DEVRAIT ÊTRE SUPPRIMÉ'}`);
    allGood = false;
  }
  
  return { exists, status };
}

function checkContent(filePath, checks, description) {
  console.log(`\n📁 Vérification: ${description}`);
  
  if (!fs.existsSync(filePath)) {
    console.log(`❌ Fichier non trouvé: ${filePath}`);
    allGood = false;
    return;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  
  checks.forEach(({ name, test, required = true }) => {
    const result = test(content);
    if (result) {
      console.log(`   ✅ ${name}`);
    } else {
      if (required) {
        console.log(`   ❌ ${name}`);
        allGood = false;
      } else {
        console.log(`   ⚠️  ${name} (optionnel)`);
      }
    }
  });
}

console.log('📋 Vérification de l\'existence des fichiers:');
checkFile(files.roomScreen, true, 'RoomScreen.tsx');
checkFile(files.appNavigator, true, 'AppNavigator.tsx');
checkFile(files.types, true, 'types/index.ts');
checkFile(files.settingsSidebar, true, 'SettingsSidebar.tsx');
checkFile(files.settingsScreen, false, 'SettingsScreen.tsx (ancien)');

// Vérifications détaillées du contenu
checkContent(files.roomScreen, [
  {
    name: 'Import SettingsSidebar',
    test: (content) => content.includes('import SettingsSidebar from \'../components/SettingsSidebar\'')
  },
  {
    name: 'État settingsSidebarVisible',
    test: (content) => content.includes('settingsSidebarVisible')
  },
  {
    name: 'useLayoutEffect pour header',
    test: (content) => content.includes('useLayoutEffect') && content.includes('headerRight')
  },
  {
    name: 'Bouton Settings ouvre sidebar',
    test: (content) => content.includes('setSettingsSidebarVisible(true)')
  },
  {
    name: 'SettingsSidebar dans JSX',
    test: (content) => content.includes('<SettingsSidebar') && content.includes('visible={settingsSidebarVisible}')
  }
], 'RoomScreen.tsx');

checkContent(files.appNavigator, [
  {
    name: 'SettingsScreen non importé',
    test: (content) => !content.includes('import SettingsScreen')
  },
  {
    name: 'Pas de Screen Settings',
    test: (content) => !content.includes('name="Settings"')
  },
  {
    name: 'Imports nettoyés',
    test: (content) => !content.includes('TouchableOpacity') || !content.includes('Share')
  },
  {
    name: 'Room Screen simplifié',
    test: (content) => {
      const roomMatch = content.match(/<Stack\.Screen\s+name="Room"[\s\S]*?\/>/);
      return roomMatch && !roomMatch[0].includes('headerRight');
    }
  }
], 'AppNavigator.tsx');

checkContent(files.types, [
  {
    name: 'Settings supprimé de RootStackParamList',
    test: (content) => {
      const match = content.match(/export type RootStackParamList = {[\s\S]*?};/);
      return match && !match[0].includes('Settings:');
    }
  },
  {
    name: 'SettingsTab supprimé de TabParamList',
    test: (content) => {
      const match = content.match(/export type TabParamList = {[\s\S]*?};/);
      return match && !match[0].includes('SettingsTab:');
    }
  }
], 'types/index.ts');

checkContent(files.settingsSidebar, [
  {
    name: 'Composant SettingsSidebar exporté',
    test: (content) => content.includes('const SettingsSidebar: React.FC') && content.includes('export default SettingsSidebar')
  },
  {
    name: 'Props interface complète',
    test: (content) => {
      const propsMatch = content.match(/interface SettingsSidebarProps {[\s\S]*?}/);
      return propsMatch && 
             propsMatch[0].includes('visible: boolean') &&
             propsMatch[0].includes('onClose: () => void') &&
             propsMatch[0].includes('roomId: string') &&
             propsMatch[0].includes('roomName: string');
    }
  },
  {
    name: 'Animations implémentées',
    test: (content) => content.includes('slideAnim') && content.includes('Animated.timing')
  }
], 'SettingsSidebar.tsx');

// Vérifications spéciales
console.log('\n🔧 Vérifications spéciales:');

// Recherche globale de références à SettingsScreen
const searchForSettingsScreen = (dir) => {
  const files = fs.readdirSync(dir);
  let found = false;
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      if (searchForSettingsScreen(filePath)) {
        found = true;
      }
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      const content = fs.readFileSync(filePath, 'utf8');
      if (content.includes('SettingsScreen')) {
        console.log(`   ⚠️  Référence à SettingsScreen trouvée dans: ${filePath}`);
        found = true;
      }
    }
  });
  
  return found;
};

const hasSettingsScreenRefs = searchForSettingsScreen(basePath);
if (!hasSettingsScreenRefs) {
  console.log('   ✅ Aucune référence à SettingsScreen trouvée');
} else {
  console.log('   ❌ Des références à SettingsScreen existent encore');
  allGood = false;
}

// Résumé final
console.log('\n' + '='.repeat(60));
console.log('📊 RÉSUMÉ DE LA MIGRATION');
console.log('='.repeat(60));

if (allGood) {
  console.log('🎉 SUCCÈS ! Migration complète et validée');
  console.log('');
  console.log('✨ Changements réalisés:');
  console.log('   • ✅ SettingsScreen supprimé');
  console.log('   • ✅ SettingsSidebar intégré dans RoomScreen');
  console.log('   • ✅ Navigation simplifiée dans AppNavigator');
  console.log('   • ✅ Types TypeScript mis à jour');
  console.log('   • ✅ Boutons header configurés dans RoomScreen');
  console.log('   • ✅ UX améliorée (sidebar au lieu de page)');
  console.log('');
  console.log('🚀 L\'application utilise maintenant un sidebar moderne');
  console.log('   pour les paramètres au lieu d\'un écran séparé !');
} else {
  console.log('❌ ÉCHEC ! Migration incomplète');
  console.log('');
  console.log('🔧 Actions requises:');
  console.log('   • Vérifiez les erreurs ci-dessus');
  console.log('   • Corrigez les fichiers manquants ou incorrects');
  console.log('   • Relancez ce script pour valider');
  process.exit(1);
}
