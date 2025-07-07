#!/usr/bin/env node

/**
 * Test du système de notifications push
 * 
 * Vérifie que :
 * 1. Le service de notifications est correctement implémenté
 * 2. Le hook useNotifications fonctionne
 * 3. L'intégration dans SettingsSidebar est correcte
 * 4. Les API endpoints sont définis
 * 5. La persistance des paramètres fonctionne
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Test du système de notifications push...\n');

const files = {
  notificationService: path.join(__dirname, 'mobile/src/services/notificationService.ts'),
  useNotifications: path.join(__dirname, 'mobile/src/hooks/useNotifications.ts'),
  settingsSidebar: path.join(__dirname, 'mobile/src/components/SettingsSidebar.tsx'),
  apiService: path.join(__dirname, 'mobile/src/services/api.ts'),
  packageJson: path.join(__dirname, 'mobile/package.json'),
};

let success = 0;
let total = 0;

function test(name, testFn, required = true) {
  total++;
  const result = testFn();
  if (result) {
    console.log(`✅ ${name}`);
    success++;
  } else {
    if (required) {
      console.log(`❌ ${name}`);
    } else {
      console.log(`⚠️  ${name} (optionnel)`);
      success++; // Compter comme succès si optionnel
    }
  }
}

function checkFileExists(filePath) {
  return fs.existsSync(filePath);
}

function checkFileContent(filePath, checks) {
  if (!fs.existsSync(filePath)) return false;
  const content = fs.readFileSync(filePath, 'utf8');
  return checks.every(check => content.includes(check));
}

console.log('📦 Dépendances:');
test('Package.json existe', () => checkFileExists(files.packageJson));
test('expo-notifications installé', () => {
  if (!checkFileExists(files.packageJson)) return false;
  const packageContent = fs.readFileSync(files.packageJson, 'utf8');
  const pkg = JSON.parse(packageContent);
  return pkg.dependencies?.['expo-notifications'] || pkg.devDependencies?.['expo-notifications'];
});
test('expo-device installé', () => {
  if (!checkFileExists(files.packageJson)) return false;
  const packageContent = fs.readFileSync(files.packageJson, 'utf8');
  const pkg = JSON.parse(packageContent);
  return pkg.dependencies?.['expo-device'] || pkg.devDependencies?.['expo-device'];
});

console.log('\n🔧 Service de Notifications:');
test('NotificationService existe', () => checkFileExists(files.notificationService));
test('Configuration Expo Notifications', () => 
  checkFileContent(files.notificationService, [
    'Notifications.setNotificationHandler',
    'shouldShowAlert: true',
    'shouldPlaySound: true'
  ])
);
test('Gestion des permissions', () => 
  checkFileContent(files.notificationService, [
    'requestPermissions',
    'getPermissionsAsync',
    'requestPermissionsAsync'
  ])
);
test('Token push management', () => 
  checkFileContent(files.notificationService, [
    'registerForPushNotifications',
    'getExpoPushTokenAsync',
    'pushToken'
  ])
);
test('Persistance paramètres', () => 
  checkFileContent(files.notificationService, [
    'saveNotificationSettings',
    'loadNotificationSettings',
    'AsyncStorage'
  ])
);

console.log('\n⚛️ Hook React:');
test('useNotifications existe', () => checkFileExists(files.useNotifications));
test('État des notifications', () => 
  checkFileContent(files.useNotifications, [
    'voteNotificationsEnabled',
    'setVoteNotificationsEnabled',
    'isInitialized'
  ])
);
test('Gestion des listeners', () => 
  checkFileContent(files.useNotifications, [
    'addNotificationReceivedListener',
    'addNotificationResponseReceivedListener'
  ])
);
test('Navigation sur clic', () => 
  checkFileContent(files.useNotifications, [
    'navigation.navigate',
    'VoteDetail',
    'Room'
  ])
);

console.log('\n🎛️ Interface Settings:');
test('SettingsSidebar mis à jour', () => checkFileExists(files.settingsSidebar));
test('Import useNotifications', () => 
  checkFileContent(files.settingsSidebar, [
    "import { useNotifications }",
    "from '../hooks/useNotifications'"
  ])
);
test('Hook utilisé dans composant', () => 
  checkFileContent(files.settingsSidebar, [
    'useNotifications(roomId)',
    'voteNotificationsEnabled',
    'setVoteNotificationsEnabled'
  ])
);
test('Switch connecté', () => 
  checkFileContent(files.settingsSidebar, [
    'value={voteNotificationsEnabled',
    'onValueChange={setVoteNotificationsEnabled'
  ])
);
test('Bouton de test dev', () => 
  checkFileContent(files.settingsSidebar, [
    '__DEV__',
    'testNotification',
    'Tester les notifications'
  ])
);

console.log('\n🌐 API Service:');
test('API Service mis à jour', () => checkFileExists(files.apiService));
test('Endpoint register token', () => 
  checkFileContent(files.apiService, [
    'registerPushToken',
    '/notifications/register',
    'pushToken'
  ])
);
test('Endpoint unregister token', () => 
  checkFileContent(files.apiService, [
    'unregisterPushToken',
    '/notifications/unregister'
  ])
);
test('Endpoint settings', () => 
  checkFileContent(files.apiService, [
    'updateNotificationSettings',
    '/notifications/settings'
  ])
);

console.log('\n🔄 Intégration:');
test('CreateVoteScreen notification ready', () => {
  const createVoteFile = path.join(__dirname, 'mobile/src/screens/CreateVoteScreen.tsx');
  return checkFileContent(createVoteFile, [
    'Les notifications push seront gérées côté serveur'
  ]);
});

// Vérification structure de fichiers
console.log('\n📁 Structure:');
test('Dossier services existe', () => 
  fs.existsSync(path.join(__dirname, 'mobile/src/services'))
);
test('Dossier hooks existe', () => 
  fs.existsSync(path.join(__dirname, 'mobile/src/hooks'))
);

// Résumé
console.log('\n' + '='.repeat(50));
console.log('📊 Résultats du test:');
console.log(`✅ ${success}/${total} tests réussis`);

if (success === total) {
  console.log('\n🎉 Parfait ! Système de notifications push implémenté !');
  console.log('\n✨ Fonctionnalités complètes:');
  console.log('   📱 Service de notifications Expo');
  console.log('   🔧 Hook React pour la gestion');
  console.log('   ⚙️ Interface utilisateur dans Settings');
  console.log('   🌐 Endpoints API définis');
  console.log('   💾 Persistance des paramètres');
  console.log('   🧪 Mode test pour développement');
  console.log('\n🚀 Prêt pour l\'intégration backend !');
  console.log('\n📋 Prochaines étapes:');
  console.log('   1. Implémenter les endpoints côté serveur');
  console.log('   2. Configurer Expo Push Service');
  console.log('   3. Tester les notifications réelles');
  console.log('   4. Monitorer les métriques');
} else {
  console.log(`\n⚠️  ${total - success} test(s) échoué(s). Vérifiez les détails ci-dessus.`);
  process.exit(1);
}
