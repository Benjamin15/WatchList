// Endpoints API
export const API_ENDPOINTS = {
  // Rooms
  ROOMS: '/rooms',
  JOIN_ROOM: '/rooms/join',
  
  // Watchlist (items)
  WATCHLIST: (roomId: number | string) => `/rooms/${roomId}/items`,
  WATCHLIST_ITEM: (roomId: number | string, itemId: number) => `/rooms/${roomId}/items/${itemId}/status`,
  
  // Search
  SEARCH: '/search',
  
  // Media
  MEDIA: '/media',
  MEDIA_DETAIL: (id: number) => `/media/${id}`,
} as const;

// Couleurs du thème
export const COLORS = {
  primary: '#6200EE',
  primaryVariant: '#3700B3',
  secondary: '#03DAC6',
  secondaryVariant: '#018786',
  background: '#121212',
  surface: '#1E1E1E',
  error: '#CF6679',
  onPrimary: '#FFFFFF',
  onSecondary: '#000000',
  onBackground: '#FFFFFF',
  onSurface: '#FFFFFF',
  onError: '#000000',
  placeholder: '#666666',
  border: '#333333',
} as const;

// Tailles d'espacement
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

// Tailles de police
export const FONT_SIZES = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

// Statuts de média avec leurs couleurs
export const MEDIA_STATUS = {
  watching: {
    color: '#2196F3',
  },
  completed: {
    color: '#4CAF50',
  },
  planned: {
    color: '#FF9800',
  },
  dropped: {
    color: '#F44336',
  },
} as const;

// Types de média avec leurs couleurs
export const MEDIA_TYPES = {
  movie: {
    color: '#E91E63',
  },
  series: {
    color: '#9C27B0',
  },
  manga: {
    color: '#FF5722',
  },
} as const;

// Configuration des images
export const IMAGE_CONFIG = {
  TMDB_BASE_URL: 'https://image.tmdb.org/t/p/w500',
  PLACEHOLDER_IMAGE: 'https://via.placeholder.com/500x750/333333/FFFFFF?text=Pas+d%27image',
} as const;

// Messages d'erreur
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Erreur de connexion. Vérifiez votre connexion internet.',
  ROOM_NOT_FOUND: 'Room non trouvée.',
  INVALID_ROOM_CODE: 'Code de room invalide.',
  GENERIC_ERROR: 'Une erreur est survenue. Veuillez réessayer.',
} as const;
