import { apiService } from '../../src/services/api';
import { mockWatchlistItems } from '../../src/services/mockData';

// Mock axios
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  })),
}));

describe('API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createRoom', () => {
    it('creates a room successfully', async () => {
      const roomName = 'Test Room';
      const result = await apiService.createRoom(roomName);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('name', roomName);
      expect(result).toHaveProperty('code');
      expect(result.code).toMatch(/^[A-Z0-9]{8}$/);
    });

    it('generates unique room codes', async () => {
      const room1 = await apiService.createRoom('Room 1');
      const room2 = await apiService.createRoom('Room 2');

      expect(room1.code).not.toBe(room2.code);
    });

    it('handles empty room name', async () => {
      await expect(apiService.createRoom('')).rejects.toThrow();
    });
  });

  describe('joinRoom', () => {
    it('joins an existing room successfully', async () => {
      // Créer une room d'abord
      const createdRoom = await apiService.createRoom('Test Room');
      
      // Essayer de la rejoindre
      const result = await apiService.joinRoom(createdRoom.code);

      expect(result).toHaveProperty('id', createdRoom.id);
      expect(result).toHaveProperty('name', createdRoom.name);
      expect(result).toHaveProperty('code', createdRoom.code);
    });

    it('handles invalid room code', async () => {
      await expect(apiService.joinRoom('INVALID')).rejects.toThrow('Room not found');
    });

    it('handles empty room code', async () => {
      await expect(apiService.joinRoom('')).rejects.toThrow();
    });
  });

  describe('getWatchlist', () => {
    it('returns watchlist for existing room', async () => {
      const room = await apiService.createRoom('Test Room');
      const watchlist = await apiService.getWatchlist(room.id);

      expect(watchlist).toHaveProperty('data');
      expect(Array.isArray(watchlist.data)).toBe(true);
      expect(watchlist.data.length).toBe(0); // Nouvelle room vide
    });

    it('handles non-existent room', async () => {
      await expect(apiService.getWatchlist(999)).rejects.toThrow('Room not found');
    });
  });

  describe('searchMedia', () => {
    it('searches for movies', async () => {
      const results = await apiService.searchMedia('test', 'movie');

      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);
      expect(results[0]).toHaveProperty('title');
      expect(results[0]).toHaveProperty('type', 'movie');
    });

    it('searches for series', async () => {
      const results = await apiService.searchMedia('test', 'series');

      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);
      expect(results[0]).toHaveProperty('title');
      expect(results[0]).toHaveProperty('type', 'series');
    });

    it('searches for manga', async () => {
      const results = await apiService.searchMedia('test', 'manga');

      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);
      expect(results[0]).toHaveProperty('title');
      expect(results[0]).toHaveProperty('type', 'manga');
    });

    it('handles empty search query', async () => {
      const results = await apiService.searchMedia('', 'movie');

      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(0);
    });

    it('filters results by type', async () => {
      const movieResults = await apiService.searchMedia('test', 'movie');
      const seriesResults = await apiService.searchMedia('test', 'series');

      expect(movieResults.every(item => item.type === 'movie')).toBe(true);
      expect(seriesResults.every(item => item.type === 'series')).toBe(true);
    });

    it('returns limited results', async () => {
      const results = await apiService.searchMedia('test', 'movie');

      expect(results.length).toBeLessThanOrEqual(20); // Limite par défaut
    });
  });

  describe('addToWatchlist', () => {
    it('adds media to watchlist successfully', async () => {
      const room = await apiService.createRoom('Test Room');
      const media = {
        id: 1,
        title: 'Test Movie',
        type: 'movie' as const,
        year: 2023,
        genre: 'Action',
        description: 'Test description',
        posterUrl: 'https://example.com/poster.jpg',
        rating: 8.5,
        tmdbId: 123,
      };
      
      const result = await apiService.addToWatchlist(room.id, media);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('roomId', room.id);
      expect(result).toHaveProperty('mediaId', media.id);
      expect(result).toHaveProperty('status', 'planned');
    });

    it('handles non-existent room', async () => {
      const media = {
        id: 1,
        title: 'Test Movie',
        type: 'movie' as const,
        year: 2023,
        genre: 'Action',
        description: 'Test description',
        posterUrl: 'https://example.com/poster.jpg',
        rating: 8.5,
        tmdbId: 123,
      };
      
      await expect(apiService.addToWatchlist(999, media)).rejects.toThrow('Room not found');
    });

    it('prevents duplicate entries', async () => {
      const room = await apiService.createRoom('Test Room');
      const media = {
        id: 1,
        title: 'Test Movie',
        type: 'movie' as const,
        year: 2023,
        genre: 'Action',
        description: 'Test description',
        posterUrl: 'https://example.com/poster.jpg',
        rating: 8.5,
        tmdbId: 123,
      };
      
      await apiService.addToWatchlist(room.id, media);
      
      // Essayer d'ajouter le même média à nouveau
      await expect(apiService.addToWatchlist(room.id, media)).rejects.toThrow('Media already in watchlist');
    });
  });

  describe('removeFromWatchlist', () => {
    it('removes media from watchlist successfully', async () => {
      const room = await apiService.createRoom('Test Room');
      const media = {
        id: 1,
        title: 'Test Movie',
        type: 'movie' as const,
        year: 2023,
        genre: 'Action',
        description: 'Test description',
        posterUrl: 'https://example.com/poster.jpg',
        rating: 8.5,
        tmdbId: 123,
      };
      
      const watchlistItem = await apiService.addToWatchlist(room.id, media);
      await apiService.removeFromWatchlist(room.id, watchlistItem.id);

      // Vérifier que l'item a été supprimé
      const watchlist = await apiService.getWatchlist(room.id);
      expect(watchlist.data.find(item => item.id === watchlistItem.id)).toBeUndefined();
    });

    it('handles non-existent room', async () => {
      await expect(apiService.removeFromWatchlist(999, 1)).rejects.toThrow('Room not found');
    });

    it('handles non-existent watchlist item', async () => {
      const room = await apiService.createRoom('Test Room');
      
      await expect(apiService.removeFromWatchlist(room.id, 999)).rejects.toThrow('Watchlist item not found');
    });
  });

  describe('updateWatchlistItem', () => {
    it('updates watchlist item status successfully', async () => {
      const room = await apiService.createRoom('Test Room');
      const media = {
        id: 1,
        title: 'Test Movie',
        type: 'movie' as const,
        year: 2023,
        genre: 'Action',
        description: 'Test description',
        posterUrl: 'https://example.com/poster.jpg',
        rating: 8.5,
        tmdbId: 123,
      };
      
      const watchlistItem = await apiService.addToWatchlist(room.id, media);
      const updatedItem = await apiService.updateWatchlistItem(room.id, watchlistItem.id, { status: 'watching' });

      expect(updatedItem.status).toBe('watching');
    });

    it('handles non-existent room', async () => {
      await expect(apiService.updateWatchlistItem(999, 1, { status: 'watching' })).rejects.toThrow('Room not found');
    });

    it('handles non-existent watchlist item', async () => {
      const room = await apiService.createRoom('Test Room');
      
      await expect(apiService.updateWatchlistItem(room.id, 999, { status: 'watching' })).rejects.toThrow('Watchlist item not found');
    });
  });
});
