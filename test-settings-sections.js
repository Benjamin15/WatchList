#!/usr/bin/env node

/**
 * Test des nouvelles sections dans SettingsSidebar
 * 
 * Vérifie que les sections Notifications de vote, Langage et Thème
 * sont correctement implémentées avec leur UI.
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Test des nouvelles sections du SettingsSidebar...\n');

const settingsSidebarPath = path.join(__dirname, 'mobile/src/components/SettingsSidebar.tsx');

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

if (!fs.existsSync(settingsSidebarPath)) {
  console.log(`❌ Fichier non trouvé: ${settingsSidebarPath}`);
  process.exit(1);
}

const content = fs.readFileSync(settingsSidebarPath, 'utf8');

console.log('📱 Section Notifications de vote:');
test('État voteNotificationsEnabled défini', () => 
  content.includes('const [voteNotificationsEnabled, setVoteNotificationsEnabled] = useState(true)')
);

test('Section "Notifications de vote" avec emoji 📱', () =>
  content.includes('📱 Notifications de vote')
);

test('Switch pour notifications push', () =>
  content.includes('Notifications push') && 
  content.includes('value={voteNotificationsEnabled}') &&
  content.includes('onValueChange={setVoteNotificationsEnabled}')
);

console.log('\n🌐 Section Langage:');
test('État selectedLanguage défini', () =>
  content.includes('const [selectedLanguage, setSelectedLanguage] = useState(\'fr\')')
);

test('Options de langue définies', () =>
  content.includes('const languageOptions = [') &&
  content.includes('🇫🇷 Français') &&
  content.includes('🇺🇸 English') &&
  content.includes('🇪🇸 Español')
);

test('Section "Langage" avec emoji 🌐', () =>
  content.includes('🌐 Langage')
);

test('Sélecteur de langue interactif', () =>
  content.includes('languageOptions.map((option)') &&
  content.includes('selectedLanguage === option.key') &&
  content.includes('setSelectedLanguage(option.key)')
);

console.log('\n🎨 Section Thème:');
test('État selectedTheme défini', () =>
  content.includes('const [selectedTheme, setSelectedTheme] = useState(\'dark\')')
);

test('Options de thème définies', () =>
  content.includes('const themeOptions = [') &&
  content.includes('🌙 Sombre') &&
  content.includes('☀️ Clair') &&
  content.includes('⚡ Automatique')
);

test('Section "Thème" avec emoji 🎨', () =>
  content.includes('🎨 Thème')
);

test('Sélecteur de thème interactif', () =>
  content.includes('themeOptions.map((option)') &&
  content.includes('selectedTheme === option.key') &&
  content.includes('setSelectedTheme(option.key)')
);

console.log('\n🎨 Styles UI:');
test('Styles selectionItem définis', () =>
  content.includes('selectionItem: {') &&
  content.includes('flexDirection: \'row\'') &&
  content.includes('alignItems: \'center\'')
);

test('Styles selectedItem définis', () =>
  content.includes('selectedItem: {') &&
  content.includes('backgroundColor: \'rgba(74, 144, 226, 0.15)\'')
);

test('Styles pour le checkIcon', () =>
  content.includes('checkIcon: {') &&
  content.includes('color: COLORS.primary')
);

test('Icône de validation (✓) affichée', () =>
  content.includes('<Text style={styles.checkIcon}>✓</Text>')
);

console.log('\n🔧 Structure:');
test('Sections bien organisées', () =>
  content.includes('Section Notifications de vote') &&
  content.includes('Section Langage') &&
  content.includes('Section Thème')
);

test('Préservation des sections existantes', () =>
  content.includes('💾 Actions') &&
  content.includes('⚠️ Zone de danger')
);

// Résumé
console.log('\n' + '='.repeat(50));
console.log('📊 Résultats du test:');
console.log(`✅ ${success}/${total} tests réussis`);

if (success === total) {
  console.log('\n🎉 Parfait ! Toutes les nouvelles sections sont implémentées !');
  console.log('\n✨ Fonctionnalités UI ajoutées:');
  console.log('   📱 Notifications de vote (switch)');
  console.log('   🌐 Sélecteur de langage (FR/EN/ES)');
  console.log('   🎨 Sélecteur de thème (Sombre/Clair/Auto)');
  console.log('   🎯 Design cohérent avec styles appropriés');
  console.log('   ✓ Indicateurs de sélection visuels');
  console.log('\n🚀 Le SettingsSidebar est prêt pour les interactions !');
} else {
  console.log(`\n⚠️  ${total - success} test(s) échoué(s). Vérifiez les détails ci-dessus.`);
  process.exit(1);
}
