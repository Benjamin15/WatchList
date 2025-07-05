import axios, { AxiosInstance, AxiosError } from 'axios';
import { API_ENDPOINTS, ERROR_MESSAGES } from '../constants';
import { getApiBaseUrl, USE_MOCK_DATA, TIMEOUTS } from '../constants/config';
import { mockApiService } from './mockData';
import {
  Room,
  WatchlistItem,
  Media,
  SearchResult,
  ApiResponse,
  PaginatedResponse,
  ApiError,
  MediaDetails,
  Trailer,
} from '../types';

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: getApiBaseUrl(),
      timeout: TIMEOUTS.API_REQUEST,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Intercepteur pour gérer les erreurs
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        return Promise.reject(this.handleError(error));
      }
    );
  }

  private handleError(error: AxiosError): ApiError {
    if (error.response) {
      // Erreur de réponse du serveur
      return {
        message: (error.response.data as any)?.message || ERROR_MESSAGES.GENERIC_ERROR,
        status: error.response.status,
      };
    } else if (error.request) {
      // Erreur de réseau
      return {
        message: ERROR_MESSAGES.NETWORK_ERROR,
        status: 0,
      };
    } else {
      // Autre erreur
      return {
        message: ERROR_MESSAGES.GENERIC_ERROR,
        status: 0,
      };
    }
  }

  // === ROOMS ===

  async createRoom(name: string): Promise<Room> {
    if (USE_MOCK_DATA) {
      return mockApiService.createRoom(name);
    }
    
    const response = await this.client.post<Room>(API_ENDPOINTS.ROOMS, {
      name,
    });
    return response.data;
  }

  async joinRoom(code: string): Promise<Room> {
    if (USE_MOCK_DATA) {
      return mockApiService.joinRoom(code);
    }
    
    // Temporaire: utiliser l'endpoint GET avec le room_id
    const response = await this.client.get<Room>(`${API_ENDPOINTS.ROOMS}/${code}`);
    return response.data;
  }

  async getRoom(roomId: number | string): Promise<Room> {
    if (USE_MOCK_DATA) {
      return mockApiService.getRoom(typeof roomId === 'string' ? parseInt(roomId) : roomId);
    }
    
    const url = `/rooms/${roomId}`;
    console.log('API: getRoom URL:', this.client.defaults.baseURL + url);
    const response = await this.client.get<Room>(url);
    return response.data;
  }

  // === WATCHLIST ITEMS ===

  async getRoomItems(roomId: number | string): Promise<WatchlistItem[]> {
    if (USE_MOCK_DATA) {
      const result = await mockApiService.getWatchlist(typeof roomId === 'string' ? parseInt(roomId) : roomId);
      return result.data;
    }
    
    const url = `/rooms/${roomId}/items`;
    console.log('API: getRoomItems URL:', this.client.defaults.baseURL + url);
    const response = await this.client.get<{room: any, items: any[]}>(url);
    
    // Transformer les données de l'API backend vers le format attendu par l'application mobile
    const transformedItems: WatchlistItem[] = response.data.items.map(item => {
      const tmdbId = this.extractTmdbId(item.external_id);
      console.log(`[API] Transformation item: ${item.title} (${item.id}) -> external_id: ${item.external_id} -> tmdbId: ${tmdbId}`);
      
      return {
        id: item.id,
        roomId: response.data.room.id,
        mediaId: item.id,
        status: this.transformStatus(item.status),
        addedAt: item.added_to_room_at || item.created_at,
        media: {
          id: item.id,
          title: item.title,
          type: item.type,
          year: item.release_date ? new Date(item.release_date).getFullYear() : undefined,
          genre: undefined, // L'API backend ne semble pas retourner le genre
          description: item.description,
          posterUrl: item.image_url,
          rating: item.note,
          tmdbId: tmdbId, // Utiliser extractTmdbId pour convertir "tmdb_XXXXX" en nombre
          createdAt: item.created_at,
          updatedAt: item.created_at,
        },
      };
    });
    
    console.log('API: Transformed items:', transformedItems);
    return transformedItems;
  }

  // Méthode pour vérifier si un média est déjà dans la watchlist
  async checkItemInRoom(roomId: number | string, tmdbId: number): Promise<{ isInWatchlist: boolean, item?: WatchlistItem }> {
    try {
      const items = await this.getRoomItems(roomId);
      
      // Chercher le média par TMDB ID
      const existingItem = items.find(item => item.media.tmdbId === tmdbId);
      
      return {
        isInWatchlist: !!existingItem,
        item: existingItem
      };
    } catch (error) {
      console.error('[API] Erreur lors de la vérification du média dans la room:', error);
      return { isInWatchlist: false };
    }
  }

  // Méthode pour transformer les statuts de l'API backend vers l'application mobile
  private transformStatus(backendStatus: string): 'planned' | 'watching' | 'completed' | 'dropped' {
    switch (backendStatus) {
      case 'a_voir':
        return 'planned';
      case 'en_cours':
        return 'watching';
      case 'vu':  // Backend utilise 'vu' et non 'termine'
        return 'completed';
      case 'abandonne':
        return 'dropped';
      default:
        return 'planned';
    }
  }

  // Méthode pour transformer les statuts de l'application mobile vers l'API backend
  private transformStatusToBackend(mobileStatus: 'planned' | 'watching' | 'completed' | 'dropped'): string {
    switch (mobileStatus) {
      case 'planned':
        return 'a_voir';
      case 'watching':
        return 'en_cours';
      case 'completed':
        return 'vu';  // Backend utilise 'vu' et non 'termine'
      case 'dropped':
        // Note: Le backend ne supporte pas 'dropped', on utilise 'a_voir' comme fallback
        // TODO: Ajouter le statut 'abandonne' au backend ou désactiver cette option mobile
        return 'a_voir';
      default:
        return 'a_voir';
    }
  }

  // Méthode helper pour extraire l'ID TMDB depuis external_id
  private extractTmdbId(externalId: string | null): number | undefined {
    if (!externalId || typeof externalId !== 'string') {
      return undefined;
    }
    
    // Nouveau format avec type : tmdb_movie_123 ou tmdb_tv_123
    const newFormatMatch = externalId.match(/^tmdb_(movie|tv)_(\d+)$/);
    if (newFormatMatch) {
      const id = parseInt(newFormatMatch[2], 10);
      return isNaN(id) ? undefined : id;
    }
    
    // Ancien format : tmdb_123 (pour rétrocompatibilité)
    if (externalId.startsWith('tmdb_')) {
      const id = parseInt(externalId.replace('tmdb_', ''));
      return isNaN(id) ? undefined : id;
    }
    
    return undefined;
  }

  async addItemToRoom(roomId: number | string, mediaData: Partial<Media>): Promise<WatchlistItem> {
    if (USE_MOCK_DATA) {
      // Simuler l'ajout pour les mocks
      const newItem: WatchlistItem = {
        id: Date.now(),
        roomId: typeof roomId === 'string' ? parseInt(roomId) : roomId,
        mediaId: Date.now(),
        status: 'planned',
        addedAt: new Date().toISOString(),
        media: {
          id: Date.now(),
          title: mediaData.title || 'Nouveau média',
          type: mediaData.type || 'movie',
          year: mediaData.year,
          genre: mediaData.genre,
          description: mediaData.description,
          posterUrl: mediaData.posterUrl,
          rating: mediaData.rating,
          tmdbId: mediaData.tmdbId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      };
      return Promise.resolve(newItem);
    }
    
    // Mapper les champs du mobile vers le format serveur
    const serverData = {
      title: mediaData.title,
      type: mediaData.type === 'series' ? 'tv' : mediaData.type, // Transformer 'series' en 'tv'
      external_id: mediaData.tmdbId ? `tmdb_${mediaData.type === 'series' ? 'tv' : mediaData.type}_${mediaData.tmdbId}` : undefined,
      description: mediaData.description,
      image_url: mediaData.posterUrl, // Mapper posterUrl vers image_url
      release_date: mediaData.year ? `${mediaData.year}-01-01` : undefined,
      note: mediaData.rating,
    };
    
    console.log('API: Adding item to room with data:', serverData);
    
    const response = await this.client.post<any>(`/rooms/${roomId}/items`, serverData);
    
    // Transformer la réponse vers le format attendu
    return {
      id: response.data.id,
      roomId: typeof roomId === 'string' ? parseInt(roomId) : roomId,
      mediaId: response.data.id,
      status: this.transformStatus(response.data.status),
      addedAt: response.data.created_at,
      media: {
        id: response.data.id,
        title: response.data.title,
        type: response.data.type,
        year: response.data.release_date ? new Date(response.data.release_date).getFullYear() : mediaData.year,
        genre: mediaData.genre, // Utiliser les données envoyées car l'API ne les retourne pas
        description: response.data.description,
        posterUrl: response.data.image_url,
        rating: response.data.note,
        tmdbId: this.extractTmdbId(response.data.external_id), // Utiliser extractTmdbId pour convertir le format
        createdAt: response.data.created_at,
        updatedAt: response.data.created_at,
      },
    };
  }

  async updateItemStatus(
    roomId: number | string, 
    itemId: number, 
    status: 'planned' | 'watching' | 'completed' | 'dropped'
  ): Promise<WatchlistItem> {
    if (USE_MOCK_DATA) {
      // Simuler la mise à jour pour les mocks
      const mockItem: WatchlistItem = {
        id: itemId,
        roomId: typeof roomId === 'string' ? parseInt(roomId) : roomId,
        mediaId: itemId,
        status,
        addedAt: new Date().toISOString(),
        media: {
          id: itemId,
          title: 'Média mis à jour',
          type: 'movie',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      };
      return Promise.resolve(mockItem);
    }
    
    const backendStatus = this.transformStatusToBackend(status);
    const url = `/rooms/${roomId}/items/${itemId}/status`;
    console.log('API: updateItemStatus URL:', this.client.defaults.baseURL + url);
    console.log('API: updateItemStatus payload:', { status: backendStatus });
    console.log('API: Mobile status:', status, '→ Backend status:', backendStatus);
    
    const response = await this.client.put<any>(url, { status: backendStatus });
    
    // Transformer la réponse vers le format attendu
    return {
      id: response.data.id,
      roomId: typeof roomId === 'string' ? parseInt(roomId) : roomId,
      mediaId: response.data.id,
      status: this.transformStatus(response.data.status),
      addedAt: response.data.created_at,
      media: {
        id: response.data.id,
        title: response.data.title,
        type: response.data.type,
        description: response.data.description,
        posterUrl: response.data.image_url,
        rating: response.data.note,
        tmdbId: response.data.external_id,
        createdAt: response.data.created_at,
        updatedAt: response.data.created_at,
      },
    };
  }

  async removeItemFromRoom(roomId: number | string, itemId: number): Promise<void> {
    if (USE_MOCK_DATA) {
      return Promise.resolve();
    }
    
    await this.client.delete(`/rooms/${roomId}/items/${itemId}`);
  }

  // === WATCHLIST ===

  async getWatchlist(
    roomId: number,
    filters?: {
      type?: string;
      status?: string;
      page?: number;
      limit?: number;
    }
  ): Promise<PaginatedResponse<WatchlistItem>> {
    if (USE_MOCK_DATA) {
      return mockApiService.getWatchlist(roomId, filters);
    }
    
    const params = new URLSearchParams();
    if (filters?.type && filters.type !== 'all') {
      params.append('type', filters.type);
    }
    if (filters?.status && filters.status !== 'all') {
      params.append('status', filters.status);
    }
    if (filters?.page) {
      params.append('page', filters.page.toString());
    }
    if (filters?.limit) {
      params.append('limit', filters.limit.toString());
    }

    const response = await this.client.get<PaginatedResponse<WatchlistItem>>(
      `${API_ENDPOINTS.WATCHLIST(roomId)}?${params.toString()}`
    );
    return response.data;
  }

  async addToWatchlist(
    roomId: number,
    mediaData: {
      title: string;
      type: 'movie' | 'series' | 'manga';
      year?: number;
      genre?: string;
      description?: string;
      posterUrl?: string;
      rating?: number;
      tmdbId?: number;
      malId?: number;
    },
    status: 'watching' | 'completed' | 'planned' | 'dropped' = 'planned'
  ): Promise<WatchlistItem> {
    if (USE_MOCK_DATA) {
      return mockApiService.addToWatchlist(roomId, { ...mediaData, status });
    }
    
    const response = await this.client.post<ApiResponse<WatchlistItem>>(
      API_ENDPOINTS.WATCHLIST(roomId),
      {
        ...mediaData,
        status,
      }
    );
    return response.data.data;
  }

  async updateWatchlistItem(
    roomId: number,
    itemId: number,
    updates: {
      status?: 'watching' | 'completed' | 'planned' | 'dropped';
    }
  ): Promise<WatchlistItem> {
    if (USE_MOCK_DATA) {
      return mockApiService.updateWatchlistItem(roomId, itemId, updates);
    }
    
    const response = await this.client.put<ApiResponse<WatchlistItem>>(
      API_ENDPOINTS.WATCHLIST_ITEM(roomId, itemId),
      updates
    );
    return response.data.data;
  }

  async removeFromWatchlist(roomId: number, itemId: number): Promise<void> {
    if (USE_MOCK_DATA) {
      return mockApiService.removeFromWatchlist(roomId, itemId);
    }
    
    await this.client.delete(API_ENDPOINTS.WATCHLIST_ITEM(roomId, itemId));
  }

  // === SEARCH ===

  async searchMedia(
    query: string,
    type?: 'movie' | 'series' | 'manga'
  ): Promise<SearchResult[]> {
    if (USE_MOCK_DATA) {
      return mockApiService.searchMedia(query, type);
    }
    
    // Nouvelle API unifiée - cherche dans tous les types
    const url = `/search/autocomplete/${encodeURIComponent(query)}`;
    console.log('API: searchMedia URL:', this.client.defaults.baseURL + url);
    
    const response = await this.client.get<{query: string, type: string, results: any[]}>(url);
    
    // Transformer les résultats vers le format attendu par l'application mobile
    const transformedResults: SearchResult[] = response.data.results.map(item => {
      const tmdbId = this.extractTmdbId(item.external_id);
      // Générer un ID unique pour l'affichage, même si tmdbId est undefined
      const displayId = tmdbId || Math.floor(Math.random() * 1000000);
      
      return {
        id: displayId,
        title: item.title,
        type: item.type === 'tv' ? 'series' : item.type, // Transformer 'tv' en 'series'
        year: item.release_date ? new Date(item.release_date).getFullYear() : undefined,
        genre: undefined, // L'API ne retourne pas le genre dans cette réponse
        description: item.description,
        posterUrl: item.image_url,
        rating: item.rating || undefined,
        tmdbId: tmdbId,
      };
    });
    
    console.log('API: Transformed search results:', transformedResults);
    return transformedResults;
  }

  async searchMediaWithRoomFilter(
    query: string,
    roomId: string | number,
    type?: 'movie' | 'series' | 'manga'
  ): Promise<SearchResult[]> {
    if (USE_MOCK_DATA) {
      return mockApiService.searchMedia(query, type);
    }
    
    // Nouvelle API unifiée avec filtrage par room
    const url = `/search/autocomplete/${encodeURIComponent(query)}/${roomId}`;
    console.log('API: searchMediaWithRoomFilter URL:', this.client.defaults.baseURL + url);
    
    const response = await this.client.get<{query: string, type: string, results: any[], roomId: string}>(url);
    
    // Transformer les résultats vers le format attendu par l'application mobile
    const transformedResults: SearchResult[] = response.data.results.map(item => {
      const tmdbId = this.extractTmdbId(item.external_id);
      // Générer un ID unique pour l'affichage, même si tmdbId est undefined
      const displayId = tmdbId || Math.floor(Math.random() * 1000000);
      
      return {
        id: displayId,
        title: item.title,
        type: item.type === 'tv' ? 'series' : item.type, // Transformer 'tv' en 'series'
        year: item.release_date ? new Date(item.release_date).getFullYear() : undefined,
        genre: undefined, // L'API ne retourne pas le genre dans cette réponse
        description: item.description,
        posterUrl: item.image_url,
        rating: item.rating || undefined,
        tmdbId: tmdbId,
      };
    });
    
    console.log('API: Transformed search results with room filter:', transformedResults);
    return transformedResults;
  }

  async autocompleteSearch(
    type: 'movie' | 'series' | 'manga',
    query: string
  ): Promise<SearchResult[]> {
    if (USE_MOCK_DATA) {
      return mockApiService.searchMedia(query, type);
    }
    
    // Utiliser la méthode searchMedia qui gère déjà la transformation des types
    return this.searchMedia(query, type);
  }

  // === MEDIA ===

  async getMediaDetails(mediaId: number): Promise<Media> {
    const response = await this.client.get<ApiResponse<Media>>(
      API_ENDPOINTS.MEDIA_DETAIL(mediaId)
    );
    return response.data.data;
  }

  // Méthodes pour les détails des médias TMDB
  async getMediaDetailsFromTMDB(tmdbId: number, type: 'movie' | 'series'): Promise<MediaDetails> {
    try {
      const response = await this.client.get<MediaDetails>(`/media/${type}/${tmdbId}/details`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des détails du média:', error);
      throw this.handleError(error as AxiosError);
    }
  }

  async getMediaTrailers(tmdbId: number, type: 'movie' | 'series'): Promise<Trailer[]> {
    try {
      const response = await this.client.get<{ trailers: Trailer[] }>(`/media/${type}/${tmdbId}/trailers`);
      return response.data.trailers;
    } catch (error) {
      console.error('Erreur lors de la récupération des trailers:', error);
      throw this.handleError(error as AxiosError);
    }
  }
}

export const apiService = new ApiService();
export default apiService;
