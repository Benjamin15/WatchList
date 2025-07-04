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
  Room: { roomId: number };
  Search: { roomId: number };
  Detail: { media: Media | SearchResult; roomId?: number };
  Settings: { roomId: number };
  Loading: undefined;
};

export type TabParamList = {
  RoomTab: { roomId: number };
  SearchTab: { roomId: number };
  SettingsTab: { roomId: number };
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
