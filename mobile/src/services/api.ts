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

  async getRoom(roomId: number): Promise<Room> {
    if (USE_MOCK_DATA) {
      return mockApiService.getRoom(roomId);
    }
    
    const response = await this.client.get<ApiResponse<Room>>(
      `${API_ENDPOINTS.ROOMS}/${roomId}`
    );
    return response.data.data;
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
    
    const params = new URLSearchParams();
    params.append('q', query);
    if (type) {
      params.append('type', type);
    }

    const response = await this.client.get<ApiResponse<SearchResult[]>>(
      `${API_ENDPOINTS.SEARCH}?${params.toString()}`
    );
    return response.data.data;
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
