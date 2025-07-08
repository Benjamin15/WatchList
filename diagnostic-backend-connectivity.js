#!/usr/bin/env node

/**
 * Script de diagnostic pour tester la connectivité backend et identifier la cause des erreurs
 * Usage: node diagnostic-backend-connectivity.js
 */

const http = require('http');
const https = require('https');

// Configuration à tester
const configs = [
  { name: 'Backend Principal', url: 'http://192.168.0.14:3000' },
  { name: 'API Health Check', url: 'http://192.168.0.14:3000/api' },
  { name: 'Endpoint Rooms', url: 'http://192.168.0.14:3000/api/rooms' },
  { name: 'Test Watchlist Example', url: 'http://192.168.0.14:3000/api/rooms/123/watchlist' }
];

// Fonction pour tester une URL
function testUrl(config) {
  return new Promise((resolve) => {
    const url = new URL(config.url);
    const client = url.protocol === 'https:' ? https : http;
    
    console.log(`\n🔍 Test: ${config.name}`);
    console.log(`📍 URL: ${config.url}`);
    
    const req = client.request({
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + url.search,
      method: 'GET',
      timeout: 5000
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`✅ Status: ${res.statusCode}`);
        console.log(`📄 Headers:`, res.headers);
        if (data.length < 500) {
          console.log(`📝 Response:`, data);
        } else {
          console.log(`📝 Response: ${data.substring(0, 200)}... (truncated)`);
        }
        resolve({ success: true, status: res.statusCode, data });
      });
    });
    
    req.on('error', (err) => {
      console.log(`❌ Error: ${err.message}`);
      console.log(`🔧 Code: ${err.code}`);
      resolve({ success: false, error: err.message, code: err.code });
    });
    
    req.on('timeout', () => {
      console.log(`⏰ Timeout after 5 seconds`);
      req.destroy();
      resolve({ success: false, error: 'Timeout' });
    });
    
    req.end();
  });
}

// Fonction pour diagnostiquer les processus en cours
function checkProcesses() {
  return new Promise((resolve) => {
    const { exec } = require('child_process');
    
    console.log('\n🔍 Vérification des processus backend...');
    
    // Chercher les processus Node.js sur le port 3000
    exec('lsof -i :3000', (error, stdout, stderr) => {
      if (error) {
        console.log('❌ Aucun processus trouvé sur le port 3000');
        console.log('💡 Le serveur backend n\'est probablement pas démarré');
      } else {
        console.log('✅ Processus trouvés sur le port 3000:');
        console.log(stdout);
      }
      
      // Chercher les processus Node.js
      exec('ps aux | grep node', (error2, stdout2, stderr2) => {
        if (!error2 && stdout2) {
          console.log('\n📋 Processus Node.js actifs:');
          const nodeProcesses = stdout2.split('\n')
            .filter(line => line.includes('node') && !line.includes('grep'))
            .slice(0, 5); // Limiter à 5 processus
          nodeProcesses.forEach(process => console.log(process));
        }
        resolve();
      });
    });
  });
}

// Fonction pour tester la résolution DNS
function testDnsResolution() {
  return new Promise((resolve) => {
    const dns = require('dns');
    
    console.log('\n🔍 Test de résolution DNS...');
    
    dns.lookup('192.168.0.14', (err, address, family) => {
      if (err) {
        console.log('❌ Erreur de résolution DNS:', err.message);
      } else {
        console.log(`✅ Résolution DNS OK: ${address} (IPv${family})`);
      }
      resolve();
    });
  });
}

// Fonction principale
async function main() {
  console.log('🚀 DIAGNOSTIC BACKEND CONNECTIVITY');
  console.log('=====================================');
  
  // Test de résolution DNS
  await testDnsResolution();
  
  // Vérification des processus
  await checkProcesses();
  
  // Test des URLs
  console.log('\n🌐 Test des endpoints...');
  const results = [];
  
  for (const config of configs) {
    const result = await testUrl(config);
    results.push({ config, result });
    await new Promise(resolve => setTimeout(resolve, 1000)); // Pause entre les tests
  }
  
  // Résumé
  console.log('\n📊 RÉSUMÉ DES TESTS');
  console.log('===================');
  
  results.forEach(({ config, result }) => {
    const status = result.success ? '✅' : '❌';
    const details = result.success 
      ? `Status: ${result.status}`
      : `Error: ${result.error}`;
    console.log(`${status} ${config.name}: ${details}`);
  });
  
  // Recommandations
  console.log('\n💡 RECOMMANDATIONS');
  console.log('==================');
  
  const hasAnySuccess = results.some(r => r.result.success);
  
  if (!hasAnySuccess) {
    console.log('❌ Aucun endpoint n\'est accessible');
    console.log('🔧 Actions recommandées:');
    console.log('   1. Vérifier que le serveur backend est démarré');
    console.log('   2. Vérifier l\'adresse IP (192.168.0.14)');
    console.log('   3. Vérifier que le port 3000 est ouvert');
    console.log('   4. Tester manuellement: curl http://192.168.0.14:3000');
  } else {
    const backendOk = results[0].result.success;
    const apiOk = results[1].result.success;
    
    if (backendOk && !apiOk) {
      console.log('⚠️  Backend accessible mais API non disponible');
      console.log('🔧 Vérifier la configuration des routes /api');
    } else if (apiOk) {
      console.log('✅ Backend et API accessibles');
      console.log('🔧 Le problème pourrait être dans la logique applicative');
    }
  }
  
  console.log('\n🏁 Diagnostic terminé');
}

// Exécution
main().catch(console.error);
