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
    const transformedItems: WatchlistItem[] = response.data.items.map(item => ({
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
        tmdbId: item.external_id,
        createdAt: item.created_at,
        updatedAt: item.created_at,
      },
    }));
    
    console.log('API: Transformed items:', transformedItems);
    return transformedItems;
  }

  // Méthode pour transformer les statuts de l'API backend vers l'application mobile
  private transformStatus(backendStatus: string): 'planned' | 'watching' | 'completed' | 'dropped' {
    switch (backendStatus) {
      case 'a_voir':
        return 'planned';
      case 'en_cours':
        return 'watching';
      case 'termine':
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
        return 'termine';
      case 'dropped':
        return 'abandonne';
      default:
        return 'a_voir';
    }
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
    
    const response = await this.client.post<any>(`/items/rooms/${roomId}/items`, mediaData);
    
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
        tmdbId: response.data.external_id,
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
    const response = await this.client.put<any>(
      `/items/rooms/${roomId}/items/${itemId}/status`, 
      { status: backendStatus }
    );
    
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
    
    await this.client.delete(`/items/rooms/${roomId}/items/${itemId}`);
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
    
    // Transformer les types de l'application mobile vers l'API backend
    let searchType = 'movie'; // valeur par défaut
    if (type) {
      switch (type) {
        case 'movie':
          searchType = 'movie';
          break;
        case 'series':
          searchType = 'tv'; // Backend utilise 'tv' au lieu de 'series'
          break;
        case 'manga':
          searchType = 'manga';
          break;
        default:
          searchType = 'movie';
      }
    }
    
    const url = `/search/autocomplete/${searchType}/${encodeURIComponent(query)}`;
    console.log('API: searchMedia URL:', this.client.defaults.baseURL + url);
    
    const response = await this.client.get<{query: string, type: string, results: any[]}>(url);
    
    // Transformer les résultats vers le format attendu par l'application mobile
    const transformedResults: SearchResult[] = response.data.results.map(item => ({
      id: parseInt(item.external_id.replace('tmdb_', '')) || 0,
      title: item.title,
      type: item.type === 'tv' ? 'series' : item.type, // Transformer 'tv' en 'series'
      year: item.release_date ? new Date(item.release_date).getFullYear() : undefined,
      genre: undefined, // L'API ne retourne pas le genre dans cette réponse
      description: item.description,
      posterUrl: item.image_url,
      rating: undefined, // L'API ne retourne pas le rating dans cette réponse
      tmdbId: parseInt(item.external_id.replace('tmdb_', '')) || undefined,
    }));
    
    console.log('API: Transformed search results:', transformedResults);
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
}

export const apiService = new ApiService();
export default apiService;
