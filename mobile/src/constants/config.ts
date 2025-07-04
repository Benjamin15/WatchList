// Configuration de l'environnement

// Mode de développement - utiliser les données de test quand le backend n'est pas disponible
export const DEV_MODE = __DEV__;
export const USE_MOCK_DATA = false; // Changer à true pour utiliser les données de test

// URL du backend - à adapter selon l'environnement
export const getApiBaseUrl = () => {
  if (DEV_MODE) {
    // Pour le développement local
    // Utiliser l'IP locale pour les appareils physiques via Expo Go
    return 'http://192.168.0.200:3000/api';
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
  WATCHLIST_PAGE_SIZE: 20,
  SEARCH_DEBOUNCE_MS: 500,
};
