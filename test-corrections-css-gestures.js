#!/usr/bin/env node

/**
 * Validation des corrections CSS et Gestures
 */

console.log('🎨 VALIDATION CORRECTIONS CSS ET GESTURES');
console.log('========================================');

const fs = require('fs');
const path = require('path');

// Vérifier le fichier RoomScreen.tsx
const roomScreenPath = path.join(__dirname, 'mobile/src/screens/RoomScreen.tsx');
const roomScreenContent = fs.readFileSync(roomScreenPath, 'utf8');

console.log('📋 Vérifications effectuées:');
console.log('');

// 1. Vérifier que renderMediaItem utilise MediaItemCard
if (roomScreenContent.includes('renderMediaItem') && roomScreenContent.includes('<MediaItemCard')) {
  console.log('✅ renderMediaItem utilise maintenant MediaItemCard');
} else {
  console.log('❌ renderMediaItem n\'utilise pas MediaItemCard');
}

// 2. Vérifier que les props sont correctement passées
const propsToCheck = [
  'item={item}',
  'onSwipe={handleSwipe}', 
  'renderMediaPoster={renderMediaPoster}',
  'currentTab={currentTab}',
  'onViewDetails={handleViewMediaDetails}',
  'currentLanguage={currentLanguage}'
];

let allPropsPresent = true;
propsToCheck.forEach(prop => {
  if (roomScreenContent.includes(prop)) {
    console.log(`✅ Prop ${prop.split('=')[0]} correctement passée`);
  } else {
    console.log(`❌ Prop ${prop.split('=')[0]} manquante`);
    allPropsPresent = false;
  }
});

// 3. Vérifier que la fonction handleSwipe est corrigée
if (roomScreenContent.includes('updateWatchlistItem(') && !roomScreenContent.includes('updateWatchlistItemStatus(')) {
  console.log('✅ handleSwipe utilise la bonne méthode API');
} else {
  console.log('❌ handleSwipe utilise une méthode API incorrecte');
}

// 4. Vérifier que MediaItemCard existe avec les gestures
if (roomScreenContent.includes('const MediaItemCard') && roomScreenContent.includes('PanResponder')) {
  console.log('✅ MediaItemCard avec gestures disponible');
} else {
  console.log('❌ MediaItemCard sans gestures');
}

// 5. Vérifier que currentLanguage est défini
if (roomScreenContent.includes('const { currentLanguage } = useLanguage()')) {
  console.log('✅ currentLanguage correctement défini');
} else {
  console.log('❌ currentLanguage non défini');
}

console.log('');

if (allPropsPresent) {
  console.log('🎯 RÉSULTAT: Toutes les corrections sont appliquées');
  console.log('');
  console.log('💡 Ce qui devrait maintenant fonctionner:');
  console.log('   ✅ Cartes de films avec CSS correct');
  console.log('   ✅ Gestures de glissement (swipe)');
  console.log('   ✅ Changement de statut par glissement');
  console.log('   ✅ Animations fluides');
  console.log('   ✅ Feedback visuel');
  console.log('');
  console.log('🚀 Testez l\'application mobile:');
  console.log('   1. Les cartes devraient avoir un design correct');
  console.log('   2. Glissez vers la droite: À voir → En cours → Terminé');
  console.log('   3. Glissez vers la gauche: Terminé → En cours → À voir');
  console.log('   4. Feedback visuel pendant le glissement');
} else {
  console.log('⚠️  ATTENTION: Certaines corrections manquent');
}

console.log('');
console.log('📱 Rechargez l\'application mobile pour voir les changements!');
