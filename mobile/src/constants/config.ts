// Configuration de l'environnement
import { Platform } from 'react-native';

// Mode de développement - utiliser les données de test quand le backend n'est pas disponible
export const DEV_MODE = __DEV__;
export const USE_MOCK_DATA = false; // Changer à true pour utiliser les données de test

// URL du backend - à adapter selon l'environnement
export const getApiBaseUrl = () => {
  if (DEV_MODE) {
    // Pour le développement local
    const isAndroid = Platform.OS === 'android';
    const LOCAL_IP = '192.168.0.16'; // IP locale détectée
    
    // Configuration selon l'environnement
    let baseUrl;
    if (isAndroid) {
      // Android émulateur peut utiliser 10.0.2.2 ou l'IP locale
      // Si 10.0.2.2 ne fonctionne pas, utilisez LOCAL_IP
      baseUrl = 'http://10.0.2.2:3000';
    } else {
      // iOS simulateur utilise localhost
      // Si localhost ne fonctionne pas, utilisez LOCAL_IP
      baseUrl = 'http://localhost:3000';
    }
    
    // Fallback vers l'IP locale si les adresses par défaut ne fonctionnent pas
    // Activé temporairement pour résoudre les problèmes de connexion
    baseUrl = `http://${LOCAL_IP}:3000`;
    
    console.log(`[API Config] Utilisation de l'URL: ${baseUrl}/api`);
    return `${baseUrl}/api`;
  } else {
    // Pour la production
    return 'https://your-production-api.com/api';
  }
};

// Configuration de debug
export const DEBUG_CONFIG = {
  enableNetworkLogging: DEV_MODE,
  enableStateLogging: DEV_MODE,
  enablePerformanceLogging: DEV_MODE,
};

// Timeouts
export const TIMEOUTS = {
  API_REQUEST: 10000, // 10 secondes
  IMAGE_LOAD: 5000,   // 5 secondes
};

// Limites
export const LIMITS = {
  MAX_ROOM_NAME_LENGTH: 50,
  MAX_SEARCH_QUERY_LENGTH: 100,
  WatchParty_PAGE_SIZE: 20,
  SEARCH_DEBOUNCE_MS: 500,
};
