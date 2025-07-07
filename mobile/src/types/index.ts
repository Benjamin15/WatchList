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
  Room: { roomId: string; roomName?: string };  // Ajout du roomName optionnel
  Search: { roomId: string }; // Changé de number à string pour cohérence
  Detail: { media: Media | SearchResult; roomId?: string }; // Changé de number à string pour cohérence
  Settings: { roomId: string }; // Changé de number à string pour cohérence
  Loading: undefined;
  CreateVote: { roomId: string };
  VoteDetail: { voteId: number; roomId: string };
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

// Types pour les trailers
export interface Trailer {
  id: string;
  name: string;
  key: string;
  site: string;
  type: string;
  size: number;
  official: boolean;
  published_at: string;
  iso_639_1: string;
  iso_3166_1: string;
}

export interface MediaDetails extends Media {
  trailers?: Trailer[];
  genres?: string[];
  runtime?: number;
  overview?: string;
  backdrop_path?: string;
  vote_average?: number;
  vote_count?: number;
  release_date?: string;
  first_air_date?: string;
  number_of_seasons?: number;
  number_of_episodes?: number;
  episode_run_time?: number[];
  networks?: string[];
  production_companies?: string[];
  spoken_languages?: string[];
  status_text?: string;
  tagline?: string;
  homepage?: string;
  imdb_id?: string;
  adult?: boolean;
  budget?: number;
  revenue?: number;
  popularity?: number;
}

// Types pour les erreurs
export interface ApiError {
  message: string;
  status: number;
}

// Types pour les votes
export interface Vote {
  id: number;
  roomId: string;
  title: string;
  description?: string;
  duration?: number; // en heures
  status: 'active' | 'completed' | 'expired';
  createdBy: string; // nom du créateur
  createdAt: string;
  endsAt?: string;
  totalVotes: number;
  userHasVoted: boolean;
  options: VoteOption[];
}

export interface VoteOption {
  id: number;
  voteId: number;
  mediaId: number;
  media: Media;
  voteCount: number;
  percentage: number;
  isWinner?: boolean;
}

export interface VoteResult {
  id: number;
  voteId: number;
  optionId: number;
  voterName?: string; // null pour les votes anonymes
  votedAt: string;
}

export interface CreateVoteRequest {
  roomId: string;
  title: string;
  description?: string;
  duration?: number; // valeur numérique
  durationUnit?: 'minutes' | 'hours'; // unité de temps
  mediaIds: number[];
  createdBy: string;
}

export interface VoteRequest {
  voteId: number;
  optionId: number;
  voterName?: string; // null pour vote anonyme
  deviceId?: string; // Ajouté automatiquement par l'API
}

// Types pour le filtrage et tri
export interface FilterOptions {
  type: 'all' | 'movie' | 'series';
  genres: string[];
  sortBy: 'date_added' | 'title' | 'year' | 'rating' | 'duration';
  sortDirection: 'asc' | 'desc';
}

export interface FilterState {
  isVisible: boolean;
  options: FilterOptions;
  appliedFilters: FilterOptions;
}
