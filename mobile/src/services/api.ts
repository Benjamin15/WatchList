import axios, { AxiosInstance, AxiosError } from 'axios';
import { API_ENDPOINTS, ERROR_MESSAGES } from '../constants';
import { getApiBaseUrl, USE_MOCK_DATA, TIMEOUTS } from '../constants/config';
import { mockApiService } from './mockData';
import { getDeviceId } from './deviceId';
import { getLanguageForTMDB } from '../utils/translations';
import i18n from '../i18n';
import {
  Room,
  WatchPartyItem,
  Media,
  SearchResult,
  ApiResponse,
  PaginatedResponse,
  ApiError,
  MediaDetails,
  Trailer,
  Vote,
  VoteOption,
  CreateVoteRequest,
  VoteRequest,
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

    // Intercepteur pour loguer les requêtes
    this.client.interceptors.request.use(
      (config) => {
        console.log(`[API] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
        return config;
      },
      (error) => {
        console.error('[API] Request error:', error);
        return Promise.reject(error);
      }
    );

    // Intercepteur pour gérer les erreurs
    this.client.interceptors.response.use(
      (response) => {
        console.log(`[API] Response ${response.status} for ${response.config.url}`);
        return response;
      },
      (error: AxiosError) => {
        console.error(`[API] Error ${error.code} for ${error.config?.url}:`, error.message);
        return Promise.reject(this.handleError(error));
      }
    );
  }

  // Helper pour obtenir la langue courante au format TMDB
  private getCurrentLanguageForTMDB(): string {
    const currentLanguage = i18n.language || 'fr';
    return getLanguageForTMDB(currentLanguage);
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
    
    console.log(`[API] Attempting to join room with code: ${code}`);
    console.log(`[API] Base URL: ${this.client.defaults.baseURL}`);
    
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

  // === WatchParty ITEMS ===

  async getRoomItems(roomId: number | string): Promise<WatchPartyItem[]> {
    if (USE_MOCK_DATA) {
      const result = await mockApiService.getWatchParty(typeof roomId === 'string' ? parseInt(roomId) : roomId);
      return result.data;
    }
    
    const url = `/rooms/${roomId}/items`;
    console.log('API: getRoomItems URL:', this.client.defaults.baseURL + url);
    const response = await this.client.get<{room: any, items: any[]}>(url);
    
    // Transformer les données de l'API backend vers le format attendu par l'application mobile
    const transformedItems: WatchPartyItem[] = response.data.items.map(item => {
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

  // Méthode pour vérifier si un média est déjà dans la WatchParty
  async checkItemInRoom(roomId: number | string, tmdbId: number): Promise<{ isInWatchParty: boolean, item?: WatchPartyItem }> {
    try {
      const items = await this.getRoomItems(roomId);
      
      // Chercher le média par TMDB ID
      const existingItem = items.find(item => item.media.tmdbId === tmdbId);
      
      return {
        isInWatchParty: !!existingItem,
        item: existingItem
      };
    } catch (error) {
      console.error('[API] Erreur lors de la vérification du média dans la room:', error);
      return { isInWatchParty: false };
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

  async addItemToRoom(roomId: number | string, mediaData: Partial<Media>): Promise<WatchPartyItem> {
    if (USE_MOCK_DATA) {
      // Simuler l'ajout pour les mocks
      const newItem: WatchPartyItem = {
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
      status: 'a_voir', // Forcer le statut par défaut
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
  ): Promise<WatchPartyItem> {
    if (USE_MOCK_DATA) {
      // Simuler la mise à jour pour les mocks
      const mockItem: WatchPartyItem = {
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

  // === WatchParty ===

  async getWatchParty(
    roomId: number | string,
    filters?: {
      type?: string;
      status?: string;
      page?: number;
      limit?: number;
    }
  ): Promise<PaginatedResponse<WatchPartyItem>> {
    if (USE_MOCK_DATA) {
      return mockApiService.getWatchParty(roomId, filters);
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

    const url = `${API_ENDPOINTS.WatchParty(roomId)}?${params.toString()}`;
    console.log('API: DEBUG - API_ENDPOINTS.WatchParty function:', API_ENDPOINTS.WatchParty);
    console.log('API: DEBUG - API_ENDPOINTS.WatchParty(roomId) result:', API_ENDPOINTS.WatchParty(roomId));
    console.log('API: getWatchParty URL:', this.client.defaults.baseURL + url);
    console.log('API: getWatchParty roomId:', roomId, 'type:', typeof roomId);

    // L'API backend retourne { room: {...}, items: [...] }
    // Nous devons l'adapter au format PaginatedResponse attendu
    const response = await this.client.get<{ room: any; items: any[] }>(url);
    console.log('API: getWatchParty response structure:', { 
      hasRoom: !!response.data.room, 
      itemsCount: response.data.items?.length || 0 
    });

    // Fonction pour transformer les statuts backend vers frontend
    const transformStatus = (backendStatus: string): 'planned' | 'watching' | 'completed' | 'dropped' => {
      const statusMap: { [key: string]: 'planned' | 'watching' | 'completed' | 'dropped' } = {
        'a_voir': 'planned',
        'en_cours': 'watching', 
        'terminé': 'completed',
        'abandonne': 'dropped',
        // Ajout des statuts déjà corrects au cas où
        'planned': 'planned',
        'watching': 'watching',
        'completed': 'completed',
        'dropped': 'dropped'
      };
      return statusMap[backendStatus] || 'planned'; // Valeur par défaut
    };

    // Transformer les items pour avoir les bons statuts et la bonne structure
    const transformedItems: WatchPartyItem[] = (response.data.items || []).map(item => {
      console.log('API: Transforming item status:', item.status, '→', transformStatus(item.status));
      return {
        id: item.id,
        roomId: parseInt(roomId.toString()), // S'assurer que c'est un number
        mediaId: item.id,
        status: transformStatus(item.status),
        addedAt: item.added_to_room_at || item.created_at,
        media: {
          id: item.id,
          title: item.title,
          type: item.type === 'tv' ? 'series' : item.type, // Normaliser tv → series
          year: item.release_date ? new Date(item.release_date).getFullYear() : undefined,
          genre: item.genre,
          description: item.description,
          posterUrl: item.image_url,
          rating: item.note,
          tmdbId: item.external_id ? parseInt(item.external_id.replace(/^tmdb_[^_]+_/, '')) : undefined,
          createdAt: item.created_at,
          updatedAt: item.updated_at || item.created_at
        }
      };
    });

    console.log('API: Transformed items with correct statuses:', transformedItems.map(item => ({ 
      id: item.id, 
      title: item.media.title, 
      status: item.status 
    })));

    // Adapter la réponse au format attendu par l'application
    return {
      data: transformedItems,
      pagination: {
        page: filters?.page || 1,
        limit: filters?.limit || 20,
        total: transformedItems.length,
        totalPages: Math.ceil(transformedItems.length / (filters?.limit || 20))
      }
    };
  }

  async addToWatchParty(
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
  ): Promise<WatchPartyItem> {
    if (USE_MOCK_DATA) {
      return mockApiService.addToWatchParty(roomId, { ...mediaData, status });
    }
    
    const response = await this.client.post<ApiResponse<WatchPartyItem>>(
      API_ENDPOINTS.WatchParty(roomId),
      {
        ...mediaData,
        status,
      }
    );
    return response.data.data;
  }

  async updateWatchPartyItem(
    roomId: number | string,
    itemId: number,
    updates: {
      status?: 'watching' | 'completed' | 'planned' | 'dropped';
    }
  ): Promise<WatchPartyItem> {
    if (USE_MOCK_DATA) {
      const numericRoomId = typeof roomId === 'string' ? parseInt(roomId) : roomId;
      return mockApiService.updateWatchPartyItem(numericRoomId, itemId, updates);
    }
    
    // Transformer les statuts frontend vers backend
    const transformStatusToBackend = (frontendStatus: string): string => {
      const statusMap: { [key: string]: string } = {
        'planned': 'a_voir',
        'watching': 'en_cours',
        'completed': 'vu',
        'dropped': 'abandonne'
      };
      return statusMap[frontendStatus] || frontendStatus;
    };

    // Préparer les données pour l'API backend
    const backendUpdates: any = {};
    if (updates.status) {
      backendUpdates.status = transformStatusToBackend(updates.status);
    }

    console.log('API: updateWatchPartyItem - Frontend status:', updates.status, '-> Backend status:', backendUpdates.status);
    console.log('API: updateWatchPartyItem - RoomId:', roomId, 'type:', typeof roomId);
    console.log('API: updateWatchPartyItem URL:', this.client.defaults.baseURL + API_ENDPOINTS.WatchParty_ITEM(roomId, itemId));

    const response = await this.client.put<any>(
      API_ENDPOINTS.WatchParty_ITEM(roomId, itemId),
      backendUpdates
    );
    
    // Le serveur retourne juste un message de succès, on retourne l'item mis à jour
    // avec le nouveau statut (transformé en statut frontend)
    const numericRoomId = typeof roomId === 'string' ? parseInt(roomId) : roomId;
    return {
      id: itemId,
      roomId: numericRoomId,
      mediaId: itemId,
      status: updates.status!,
      addedAt: new Date().toISOString(),
      media: {
        id: itemId,
        title: 'Updated Item',
        type: 'movie' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    };
  }

  async removeFromWatchParty(roomId: number, itemId: number): Promise<void> {
    if (USE_MOCK_DATA) {
      return mockApiService.removeFromWatchParty(roomId, itemId);
    }
    
    await this.client.delete(API_ENDPOINTS.WatchParty_ITEM(roomId, itemId));
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
    const language = this.getCurrentLanguageForTMDB();
    const url = `/search/autocomplete/${encodeURIComponent(query)}`;
    console.log('API: searchMedia URL:', this.client.defaults.baseURL + url, `(lang: ${language})`);
    
    const response = await this.client.get<{query: string, type: string, results: any[]}>(url, {
      params: { language }
    });
    
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
    const language = this.getCurrentLanguageForTMDB();
    const url = `/search/autocomplete/${encodeURIComponent(query)}/${roomId}`;
    console.log('API: searchMediaWithRoomFilter URL:', this.client.defaults.baseURL + url, `(lang: ${language})`);
    
    const response = await this.client.get<{query: string, type: string, results: any[], roomId: string}>(url, {
      params: { language }
    });
    
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
      const language = this.getCurrentLanguageForTMDB();
      const response = await this.client.get<MediaDetails>(`/media/${type}/${tmdbId}/details`, {
        params: { language }
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des détails du média:', error);
      throw this.handleError(error as AxiosError);
    }
  }

  async getMediaTrailers(tmdbId: number, type: 'movie' | 'series'): Promise<Trailer[]> {
    try {
      const language = this.getCurrentLanguageForTMDB();
      const response = await this.client.get<{ trailers: Trailer[] }>(`/media/${type}/${tmdbId}/trailers`, {
        params: { language }
      });
      return response.data.trailers;
    } catch (error) {
      console.error('Erreur lors de la récupération des trailers:', error);
      throw this.handleError(error as AxiosError);
    }
  }

  // === VOTES ===

  async createVote(voteData: CreateVoteRequest): Promise<{ voteId: number }> {
    if (USE_MOCK_DATA) {
      // TODO: Implémenter le mock pour les votes
      return { voteId: Math.floor(Math.random() * 1000) };
    }

    const response = await this.client.post<ApiResponse<{ voteId: number }>>(
      '/votes',
      voteData
    );
    return response.data.data;
  }

  async getVotesByRoom(roomId: string): Promise<Vote[]> {
    if (USE_MOCK_DATA) {
      // TODO: Implémenter le mock pour les votes
      return [];
    }

    const deviceId = await getDeviceId();
    const response = await this.client.get<ApiResponse<Vote[]>>(
      `/votes/room/${roomId}?deviceId=${deviceId}`
    );
    return response.data.data;
  }

  async getVoteById(voteId: number): Promise<Vote> {
    if (USE_MOCK_DATA) {
      // TODO: Implémenter le mock pour les votes
      throw new Error('Vote not found');
    }

    const deviceId = await getDeviceId();
    const response = await this.client.get<ApiResponse<Vote>>(
      `/votes/${voteId}?deviceId=${deviceId}`
    );
    return response.data.data;
  }

  async submitVote(voteData: VoteRequest): Promise<{ resultId: number }> {
    if (USE_MOCK_DATA) {
      // TODO: Implémenter le mock pour les votes
      return { resultId: Math.floor(Math.random() * 1000) };
    }

    const deviceId = await getDeviceId();
    const response = await this.client.post<ApiResponse<{ resultId: number }>>(
      '/votes/submit',
      { ...voteData, deviceId }
    );
    return response.data.data;
  }

  async deleteVote(voteId: number): Promise<void> {
    if (USE_MOCK_DATA) {
      // TODO: Implémenter le mock pour les votes
      return;
    }

    await this.client.delete(`/votes/${voteId}`);
  }

  async updateVoteStatus(voteId: number, status: 'active' | 'completed' | 'expired'): Promise<void> {
    if (USE_MOCK_DATA) {
      // TODO: Implémenter le mock pour les votes
      return;
    }

    await this.client.patch(`/votes/${voteId}/status`, { status });
  }

  // Méthodes pour les notifications push
  async registerPushToken(roomId: string, pushToken: string, deviceId?: string): Promise<void> {
    if (USE_MOCK_DATA) {
      console.log(`[API Mock] Token push enregistré pour room ${roomId}: ${pushToken}`);
      return;
    }

    const finalDeviceId = deviceId || await getDeviceId();
    await this.client.post('/notifications/register', {
      roomId,
      pushToken,
      deviceId: finalDeviceId,
    });
  }

  async unregisterPushToken(roomId: string, deviceId?: string): Promise<void> {
    if (USE_MOCK_DATA) {
      console.log(`[API Mock] Token push désenregistré pour room ${roomId}`);
      return;
    }

    const finalDeviceId = deviceId || await getDeviceId();
    await this.client.post('/notifications/unregister', {
      roomId,
      deviceId: finalDeviceId,
    });
  }

  async updateNotificationSettings(roomId: string, enabled: boolean, deviceId?: string): Promise<void> {
    if (USE_MOCK_DATA) {
      console.log(`[API Mock] Paramètres notification mis à jour pour room ${roomId}: ${enabled}`);
      return;
    }

    const finalDeviceId = deviceId || await getDeviceId();
    await this.client.patch('/notifications/settings', {
      roomId,
      enabled,
      deviceId: finalDeviceId,
    });
  }
}

export const apiService = new ApiService();
export default apiService;
