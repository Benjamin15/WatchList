#!/usr/bin/env node

/**
 * Test pour valider que l'endpoint /rooms/{roomId}/items fonctionne
 * Ce script simule exactement ce que fait l'app mobile
 */

const http = require('http');

// Configuration comme dans l'app mobile
const API_BASE_URL = 'http://192.168.0.14:3000/api';
const TEST_ROOM_ID = '716d49a6e169'; // Room créée plus tôt

// Headers similaires à ceux de l'app mobile
const headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'User-Agent': 'WatchListMobile/1.0'
};

console.log('🧪 Test de l\'endpoint watchlist items');
console.log('====================================');
console.log(`📍 URL: ${API_BASE_URL}/rooms/${TEST_ROOM_ID}/items`);
console.log(`🆔 Room ID: ${TEST_ROOM_ID}`);
console.log('');

// Fonction pour faire la requête
function testWatchlistEndpoint() {
  return new Promise((resolve) => {
    const url = `${API_BASE_URL}/rooms/${TEST_ROOM_ID}/items`;
    const urlObj = new URL(url);
    
    console.log('🚀 Envoi de la requête...');
    
    const req = http.request({
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname,
      method: 'GET',
      headers,
      timeout: 10000
    }, (res) => {
      let data = '';
      
      console.log(`📊 Status: ${res.statusCode}`);
      console.log(`📄 Headers:`, res.headers);
      
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('📝 Response Body:');
        try {
          const jsonData = JSON.parse(data);
          console.log(JSON.stringify(jsonData, null, 2));
          
          // Validation des données
          if (jsonData.room && Array.isArray(jsonData.items)) {
            console.log('');
            console.log('✅ SUCCÈS: Format de réponse valide');
            console.log(`📋 Room: ${jsonData.room.name} (ID: ${jsonData.room.room_id})`);
            console.log(`🎬 Items: ${jsonData.items.length} éléments trouvés`);
            
            if (jsonData.items.length > 0) {
              console.log('📺 Premier item:', jsonData.items[0]);
            }
          } else {
            console.log('❌ ERREUR: Format de réponse invalide');
          }
        } catch (e) {
          console.log('❌ ERREUR: Réponse JSON invalide');
          console.log('Raw response:', data);
        }
        
        resolve();
      });
    });
    
    req.on('error', (err) => {
      console.log(`❌ Erreur de requête: ${err.message}`);
      console.log(`🔧 Code: ${err.code}`);
      resolve();
    });
    
    req.on('timeout', () => {
      console.log('⏰ Timeout de la requête');
      req.destroy();
      resolve();
    });
    
    req.end();
  });
}

// Test avec ajout d'un item
async function testAddItem() {
  console.log('');
  console.log('🎬 Test d\'ajout d\'un item...');
  
  const itemData = {
    title: 'Avatar',
    year: 2009,
    type: 'movie',
    poster_url: 'https://image.tmdb.org/t/p/w500/6EiRUJpuoeQPghrs3YNktfnqOVh.jpg',
    tmdb_id: 19995
  };
  
  return new Promise((resolve) => {
    const url = `${API_BASE_URL}/rooms/${TEST_ROOM_ID}/items`;
    const urlObj = new URL(url);
    const postData = JSON.stringify(itemData);
    
    console.log('📋 Données à envoyer:', itemData);
    
    const req = http.request({
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        ...headers,
        'Content-Length': Buffer.byteLength(postData)
      },
      timeout: 10000
    }, (res) => {
      let data = '';
      
      console.log(`📊 Status: ${res.statusCode}`);
      
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          console.log('📝 Response:', JSON.stringify(jsonData, null, 2));
          
          if (res.statusCode === 201 || res.statusCode === 200) {
            console.log('✅ Item ajouté avec succès');
          } else {
            console.log('❌ Erreur lors de l\'ajout');
          }
        } catch (e) {
          console.log('❌ Réponse JSON invalide:', data);
        }
        
        resolve();
      });
    });
    
    req.on('error', (err) => {
      console.log(`❌ Erreur: ${err.message}`);
      resolve();
    });
    
    req.write(postData);
    req.end();
  });
}

// Exécution des tests
async function main() {
  // Test de lecture
  await testWatchlistEndpoint();
  
  // Test d'ajout
  await testAddItem();
  
  // Test de relecture après ajout
  console.log('');
  console.log('🔄 Test de relecture après ajout...');
  await testWatchlistEndpoint();
  
  console.log('');
  console.log('🏁 Tests terminés');
}

main().catch(console.error);
