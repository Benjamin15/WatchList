// Types pour les médias
export interface Media {
  id: number;
  title: string;
  type: 'movie' | 'series' | 'manga';
  year?: number;
  genre?: string;
  description?: string;
  posterUrl?: string;
  rating?: number;
  status?: 'watching' | 'completed' | 'planned' | 'dropped';
  tmdbId?: number;
  malId?: number;
  createdAt?: string;
  updatedAt?: string;
}

// Types pour les rooms
export interface Room {
  id: number;
  room_id: string;  // Correspond à la structure de l'API
  name: string;
  created_at: string;
}

// Types pour les éléments de watchlist
export interface WatchlistItem {
  id: number;
  roomId: number;
  mediaId: number;
  status: 'watching' | 'completed' | 'planned' | 'dropped';
  addedAt: string;
  media: Media;
}

// Types pour la recherche
export interface SearchResult {
  id: number;
  title: string;
  type: 'movie' | 'series' | 'manga';
  year?: number;
  genre?: string;
  description?: string;
  posterUrl?: string;
  rating?: number;
  tmdbId?: number;
  malId?: number;
}

// Types pour les filtres
export type MediaType = 'all' | 'movie' | 'series' | 'manga';
export type StatusType = 'all' | 'watching' | 'completed' | 'planned' | 'dropped';

// Types pour la navigation
export type RootStackParamList = {
  Home: undefined;
  Room: { roomId: string };  // Changé de number à string pour utiliser room_id
  Search: { roomId: string }; // Changé de number à string pour cohérence
  Detail: { media: Media | SearchResult; roomId?: string }; // Changé de number à string pour cohérence
  Settings: { roomId: string }; // Changé de number à string pour cohérence
  Loading: undefined;
};

export type TabParamList = {
  RoomTab: { roomId: string }; // Changé de number à string pour cohérence
  SearchTab: { roomId: string }; // Changé de number à string pour cohérence
  SettingsTab: { roomId: string }; // Changé de number à string pour cohérence
};

// Types pour les réponses API
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Types pour les erreurs
export interface ApiError {
  message: string;
  status: number;
}
