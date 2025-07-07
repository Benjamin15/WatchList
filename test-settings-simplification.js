#!/usr/bin/env node

/**
 * Test de simplification du SettingsSidebar
 * 
 * Vérifie que les éléments demandés ont été supprimés :
 * - Section "Actions" (Exporter, Vider)
 * - Section "Zone de danger" (Supprimer la room)
 * - Switch "Mise à jour auto"
 * 
 * Et que les éléments suivants sont conservés :
 * - Section "Notifications de vote"
 * - Section "Langage"
 * - Section "Thème"
 * - Section "Informations"
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Test de simplification du SettingsSidebar...\n');

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

console.log('🗑️ Éléments supprimés:');
test('❌ Section "Actions" supprimée', () => 
  !content.includes('💾 Actions')
);

test('❌ Bouton "Exporter" supprimé', () => 
  !content.includes('Exporter') && !content.includes('📤')
);

test('❌ Bouton "Vider" supprimé', () => 
  !content.includes('Vider') && !content.includes('Supprimer le contenu')
);

test('❌ Section "Zone de danger" supprimée', () => 
  !content.includes('⚠️ Zone de danger')
);

test('❌ Bouton "Supprimer la room" supprimé', () => 
  !content.includes('Supprimer la room')
);

test('❌ Switch "Mise à jour auto" supprimé', () => 
  !content.includes('Mise à jour auto') && !content.includes('autoUpdateEnabled')
);

test('❌ Fonctions handle supprimées', () => 
  !content.includes('handleExportData') && 
  !content.includes('handleClearRoom') && 
  !content.includes('handleDeleteRoom')
);

test('❌ Styles actions supprimés', () => 
  !content.includes('actionButton:') && 
  !content.includes('dangerButton:') && 
  !content.includes('actionIcon:')
);

console.log('\n✅ Éléments conservés:');
test('✅ Section "Notifications de vote" conservée', () => 
  content.includes('📱 Notifications de vote')
);

test('✅ Switch notifications push conservé', () => 
  content.includes('Notifications push') && 
  content.includes('voteNotificationsEnabled')
);

test('✅ Section "Langage" conservée', () => 
  content.includes('🌐 Langage') && 
  content.includes('🇫🇷 Français')
);

test('✅ Section "Thème" conservée', () => 
  content.includes('🎨 Thème') && 
  content.includes('🌙 Sombre')
);

test('✅ Section "Informations" conservée', () => 
  content.includes('Room ID:') && 
  content.includes('Version:')
);

test('✅ États des sélecteurs conservés', () => 
  content.includes('selectedLanguage') && 
  content.includes('selectedTheme')
);

test('✅ Styles sélecteurs conservés', () => 
  content.includes('selectionItem:') && 
  content.includes('selectedItem:') && 
  content.includes('checkIcon:')
);

console.log('\n🔧 Structure simplifiée:');
test('📱 Seulement 4 sections principales', () => {
  const sections = content.match(/sectionTitle.*>.*</g);
  return sections && sections.length === 3; // Notifications, Langage, Thème
});

test('🎯 Code nettoyé (moins de lignes)', () => {
  const lines = content.split('\n').length;
  return lines < 450; // Vérifier que le fichier a été simplifié
});

// Résumé
console.log('\n' + '='.repeat(50));
console.log('📊 Résultats du test:');
console.log(`✅ ${success}/${total} tests réussis`);

if (success === total) {
  console.log('\n🎉 Parfait ! Simplification réussie !');
  console.log('\n✨ SettingsSidebar simplifié:');
  console.log('   📱 Notifications de vote (1 switch)');
  console.log('   🌐 Sélecteur de langage');
  console.log('   🎨 Sélecteur de thème');
  console.log('   ℹ️ Informations de la room');
  console.log('\n🗑️ Éléments supprimés:');
  console.log('   ❌ Actions (Exporter, Vider)');
  console.log('   ❌ Zone de danger (Supprimer room)');
  console.log('   ❌ Mise à jour automatique');
  console.log('\n🚀 Interface épurée et focalisée !');
} else {
  console.log(`\n⚠️  ${total - success} test(s) échoué(s). Vérifiez les détails ci-dessus.`);
  process.exit(1);
}
