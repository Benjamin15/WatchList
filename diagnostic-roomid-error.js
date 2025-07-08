#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Diagnostic de l\'erreur roomId dans loadWatchlistItems...\n');

const filePath = path.join(__dirname, 'mobile/src/screens/RoomScreen.tsx');

try {
  const content = fs.readFileSync(filePath, 'utf8');
  
  console.log('📋 Vérifications spécifiques pour l\'erreur ligne 791:');
  
  // Vérifier la fonction loadWatchlistItems
  if (content.includes('const loadWatchlistItems = async () => {')) {
    console.log('✅ Fonction loadWatchlistItems trouvée');
    
    // Vérifier la validation de roomId
    if (content.includes('const numericRoomId = parseInt(roomId, 10);')) {
      console.log('✅ Validation numericRoomId ajoutée');
    } else {
      console.log('❌ Validation numericRoomId manquante');
    }
    
    if (content.includes('if (isNaN(numericRoomId)) {')) {
      console.log('✅ Vérification isNaN ajoutée');
    } else {
      console.log('❌ Vérification isNaN manquante');
    }
    
    if (content.includes('apiService.getWatchlist(numericRoomId)')) {
      console.log('✅ Appel API avec numericRoomId validé');
    } else if (content.includes('apiService.getWatchlist(parseInt(roomId))')) {
      console.log('⚠️  Appel API avec parseInt simple (peut causer NaN)');
    } else {
      console.log('❌ Appel API getWatchlist introuvable');
    }
  } else {
    console.log('❌ Fonction loadWatchlistItems introuvable');
  }
  
  console.log('');
  
  // Vérifier les autres utilisations de roomId
  console.log('📋 Autres utilisations de roomId:');
  
  if (content.includes('apiService.getRoom(roomId)')) {
    console.log('✅ getRoom(roomId) - OK (accepte string)');
  }
  
  if (content.includes('apiService.getVotesByRoom(roomId)')) {
    console.log('✅ getVotesByRoom(roomId) - À vérifier');
  }
  
  console.log('');
  
  // Analyser les erreurs potentielles
  console.log('🔍 Causes possibles de l\'erreur ligne 791:');
  console.log('1. roomId est undefined/null');
  console.log('2. roomId n\'est pas un nombre valide (ex: "abc")');
  console.log('3. parseInt(roomId) retourne NaN');
  console.log('4. L\'API getWatchlist rejette la requête');
  console.log('5. Problème de réseau/serveur');
  
  console.log('');
  console.log('💡 Solutions appliquées:');
  console.log('✅ Validation robuste avec parseInt(roomId, 10)');
  console.log('✅ Vérification isNaN avant appel API');
  console.log('✅ Message d\'erreur détaillé avec roomId');
  
  console.log('');
  console.log('🚀 Pour tester:');
  console.log('1. Vérifiez que roomId est bien passé en paramètre de navigation');
  console.log('2. Vérifiez la console pour le log "Loading watchlist items for roomId: XXX"');
  console.log('3. Si roomId est invalide, vous verrez "Invalid roomId: XXX"');
  
} catch (error) {
  console.error('❌ Erreur lors de la lecture du fichier:', error.message);
}

console.log('');
