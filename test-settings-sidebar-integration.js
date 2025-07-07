#!/usr/bin/env node

/**
 * Test d'intégration du SettingsSidebar dans RoomScreen
 * 
 * Ce script vérifie que :
 * 1. SettingsSidebar est correctement importé dans RoomScreen
 * 2. L'état settingsSidebarVisible est défini
 * 3. Le SettingsSidebar est intégré dans le JSX
 * 4. Le bouton Settings dans le header ouvre le sidebar
 * 5. L'écran Settings n'est plus dans AppNavigator
 * 6. Les types RootStackParamList sont à jour
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Test d\'intégration du SettingsSidebar...\n');

// Chemins des fichiers
const roomScreenPath = path.join(__dirname, 'mobile/src/screens/RoomScreen.tsx');
const appNavigatorPath = path.join(__dirname, 'mobile/src/navigation/AppNavigator.tsx');
const typesPath = path.join(__dirname, 'mobile/src/types/index.ts');
const settingsSidebarPath = path.join(__dirname, 'mobile/src/components/SettingsSidebar.tsx');

let success = 0;
let total = 0;

function testFile(filePath, description, tests) {
  console.log(`📁 ${description}`);
  
  if (!fs.existsSync(filePath)) {
    console.log(`❌ Fichier non trouvé: ${filePath}`);
    return;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  
  tests.forEach(({ name, test, optional = false }) => {
    total++;
    const result = test(content);
    if (result) {
      console.log(`✅ ${name}`);
      success++;
    } else {
      if (optional) {
        console.log(`⚠️  ${name} (optionnel)`);
        success++; // Compter comme succès si optionnel
      } else {
        console.log(`❌ ${name}`);
      }
    }
  });
  
  console.log('');
}

// Tests pour RoomScreen.tsx
testFile(roomScreenPath, 'RoomScreen.tsx', [
  {
    name: 'SettingsSidebar est importé',
    test: (content) => content.includes('import SettingsSidebar from \'../components/SettingsSidebar\'')
  },
  {
    name: 'useLayoutEffect est importé',
    test: (content) => content.includes('useLayoutEffect') && content.includes('import React, { useState, useEffect, useCallback, useRef, useLayoutEffect }')
  },
  {
    name: 'Share est importé pour les boutons du header',
    test: (content) => content.includes('Share') && content.includes('import { View, Text, StyleSheet, Alert, ScrollView, TouchableOpacity, PanResponder, Animated, Share }')
  },
  {
    name: 'État settingsSidebarVisible est défini',
    test: (content) => content.includes('const [settingsSidebarVisible, setSettingsSidebarVisible] = useState(false)')
  },
  {
    name: 'useLayoutEffect configure les boutons du header',
    test: (content) => content.includes('useLayoutEffect(() => {') && content.includes('navigation.setOptions({') && content.includes('headerRight: () => (')
  },
  {
    name: 'Bouton Settings ouvre le sidebar au lieu de naviguer',
    test: (content) => content.includes('onPress={() => setSettingsSidebarVisible(true)}')
  },
  {
    name: 'SettingsSidebar est intégré dans le JSX',
    test: (content) => content.includes('<SettingsSidebar') && content.includes('visible={settingsSidebarVisible}') && content.includes('onClose={() => setSettingsSidebarVisible(false)}')
  },
  {
    name: 'Props roomId et roomName sont passées au SettingsSidebar',
    test: (content) => content.includes('roomId={roomId}') && content.includes('roomName={roomName}')
  }
]);

// Tests pour AppNavigator.tsx
testFile(appNavigatorPath, 'AppNavigator.tsx', [
  {
    name: 'SettingsScreen n\'est plus importé',
    test: (content) => !content.includes('import SettingsScreen')
  },
  {
    name: 'Imports inutiles supprimés (TouchableOpacity, Text, Share, Alert, View)',
    test: (content) => !content.includes('TouchableOpacity, Text, Share, Alert, View')
  },
  {
    name: 'Configuration du Screen Room simplifiée (plus de headerRight)',
    test: (content) => {
      const roomScreenConfig = content.match(/<Stack\.Screen\s+name="Room"[\s\S]*?\/>/);
      return roomScreenConfig && !roomScreenConfig[0].includes('headerRight');
    }
  },
  {
    name: 'Écran Settings n\'est plus dans le Stack',
    test: (content) => !content.includes('name="Settings"') && !content.includes('component={SettingsScreen}')
  }
]);

// Tests pour types/index.ts
testFile(typesPath, 'types/index.ts', [
  {
    name: 'Settings supprimé de RootStackParamList',
    test: (content) => {
      const paramListMatch = content.match(/export type RootStackParamList = {[\s\S]*?};/);
      return paramListMatch && !paramListMatch[0].includes('Settings:');
    }
  },
  {
    name: 'SettingsTab supprimé de TabParamList',
    test: (content) => {
      const tabParamListMatch = content.match(/export type TabParamList = {[\s\S]*?};/);
      return tabParamListMatch && !tabParamListMatch[0].includes('SettingsTab:');
    }
  }
]);

// Tests pour SettingsSidebar.tsx
testFile(settingsSidebarPath, 'SettingsSidebar.tsx', [
  {
    name: 'SettingsSidebar existe et est exporté',
    test: (content) => content.includes('const SettingsSidebar: React.FC<SettingsSidebarProps>') && content.includes('export default SettingsSidebar')
  },
  {
    name: 'Props visible, onClose, roomId, roomName sont définies',
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
    name: 'Animation slide et overlay sont implémentées',
    test: (content) => content.includes('slideAnim') && content.includes('opacityAnim') && content.includes('Animated.parallel')
  }
]);

// Résumé
console.log('📊 Résultats du test:');
console.log(`✅ ${success}/${total} tests réussis`);

if (success === total) {
  console.log('\n🎉 Parfait ! L\'intégration du SettingsSidebar est complète !');
  console.log('\n✨ Fonctionnalités vérifiées:');
  console.log('   • SettingsSidebar remplace l\'écran Settings');
  console.log('   • Boutons du header gérés dans RoomScreen');
  console.log('   • Navigation simplifiée');
  console.log('   • Types TypeScript à jour');
  console.log('   • Sidebar avec animation depuis la droite');
} else {
  console.log(`\n⚠️  ${total - success} test(s) échoué(s). Vérifiez les détails ci-dessus.`);
  process.exit(1);
}
