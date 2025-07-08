#!/usr/bin/env node

/**
 * Script de diagnostic pour identifier le problème d'affichage de la watchlist
 */

const http = require('http');

const API_BASE_URL = 'http://192.168.0.14:3000/api';
const TEST_ROOM_ID = '23d6673e8735'; // Room utilisée dans les logs

console.log('🔍 DIAGNOSTIC PROBLÈME AFFICHAGE WATCHLIST');
console.log('==========================================');
console.log(`📍 Room ID: ${TEST_ROOM_ID}`);
console.log('');

function testWatchlistStructure() {
  return new Promise((resolve) => {
    const url = `${API_BASE_URL}/rooms/${TEST_ROOM_ID}/items`;
    const urlObj = new URL(url);
    
    console.log('🚀 Test de la structure de données...');
    
    const req = http.request({
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 5000
    }, (res) => {
      let data = '';
      
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`📊 Status: ${res.statusCode}`);
        
        try {
          const jsonData = JSON.parse(data);
          
          console.log('📋 Structure des données:');
          console.log(`   - room: ${jsonData.room ? '✅' : '❌'}`);
          console.log(`   - items: ${Array.isArray(jsonData.items) ? '✅' : '❌'} (${jsonData.items?.length || 0} éléments)`);
          
          if (jsonData.items && jsonData.items.length > 0) {
            console.log('');
            console.log('📺 ANALYSE DES ITEMS:');
            console.log('');
            
            jsonData.items.forEach((item, index) => {
              console.log(`Item ${index + 1}:`);
              console.log(`   - id: ${item.id}`);
              console.log(`   - title: ${item.title}`);
              console.log(`   - type: ${item.type}`);
              console.log(`   - status: "${item.status}" ⚠️  PROBLÈME POTENTIEL!`);
              console.log(`   - external_id: ${item.external_id}`);
              console.log(`   - image_url: ${item.image_url}`);
              console.log(`   - added_to_room_at: ${item.added_to_room_at}`);
              console.log('');
            });
            
            // Analyser les statuts
            const statuses = [...new Set(jsonData.items.map(item => item.status))];
            console.log('🎯 STATUTS TROUVÉS:');
            statuses.forEach(status => {
              const count = jsonData.items.filter(item => item.status === status).length;
              console.log(`   - "${status}": ${count} items`);
            });
            
            console.log('');
            console.log('⚠️  PROBLÈME IDENTIFIÉ:');
            console.log('   Backend utilise: "a_voir"');
            console.log('   Frontend filtre pour: "planned"');
            console.log('   → AUCUN MATCH = LISTE VIDE');
            
            console.log('');
            console.log('🔧 SOLUTIONS POSSIBLES:');
            console.log('   1. Modifier le backend pour utiliser "planned"');
            console.log('   2. Modifier le frontend pour accepter "a_voir"');
            console.log('   3. Ajouter une transformation côté API mobile');
            
          } else {
            console.log('❌ Aucun item trouvé dans la réponse');
          }
          
        } catch (e) {
          console.log('❌ Erreur de parsing JSON:', e.message);
          console.log('Raw response:', data);
        }
        
        resolve();
      });
    });
    
    req.on('error', (err) => {
      console.log(`❌ Erreur: ${err.message}`);
      resolve();
    });
    
    req.on('timeout', () => {
      console.log('⏰ Timeout');
      req.destroy();
      resolve();
    });
    
    req.end();
  });
}

async function main() {
  await testWatchlistStructure();
  
  console.log('');
  console.log('💡 RECOMMANDATIONS:');
  console.log('=================');
  console.log('1. Vérifier le mapping des statuts dans l\'API mobile');
  console.log('2. Transformer "a_voir" → "planned" côté frontend');
  console.log('3. Ou modifier le backend pour utiliser les statuts frontend');
}

main().catch(console.error);
