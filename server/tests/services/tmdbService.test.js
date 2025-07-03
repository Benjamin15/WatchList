const TMDBService = require('../../src/services/tmdbService');
const axios = require('axios');

// Mock axios
jest.mock('axios');
const mockedAxios = axios;

describe('TMDB Service', () => {
  let tmdbService;

  beforeEach(() => {
    tmdbService = new TMDBService();
    jest.clearAllMocks();
  });

  describe('searchMovies', () => {
    it('should return formatted movie results', async () => {
      const mockResponse = {
        data: {
          results: [
            {
              id: 123,
              title: 'Test Movie',
              overview: 'A test movie',
              poster_path: '/test.jpg',
              release_date: '2023-01-01'
            }
          ]
        }
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const results = await tmdbService.searchMovies('test');

      expect(results).toHaveLength(1);
      expect(results[0]).toEqual({
        external_id: 'tmdb_123',
        title: 'Test Movie',
        type: 'movie',
        description: 'A test movie',
        image_url: 'https://image.tmdb.org/t/p/w500/test.jpg',
        release_date: '2023-01-01',
        in_database: false
      });
    });

    it('should handle missing poster path', async () => {
      const mockResponse = {
        data: {
          results: [
            {
              id: 123,
              title: 'Test Movie',
              overview: 'A test movie',
              poster_path: null,
              release_date: '2023-01-01'
            }
          ]
        }
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const results = await tmdbService.searchMovies('test');

      expect(results[0].image_url).toBeNull();
    });

    it('should handle API errors', async () => {
      mockedAxios.get.mockRejectedValue(new Error('API Error'));

      const results = await tmdbService.searchMovies('test');

      expect(results).toEqual([]);
    });

    it('should call API with correct parameters', async () => {
      const mockResponse = { data: { results: [] } };
      mockedAxios.get.mockResolvedValue(mockResponse);

      await tmdbService.searchMovies('test query');

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://api.themoviedb.org/3/search/movie',
        {
          params: {
            api_key: process.env.TMDB_API_KEY,
            query: 'test query',
            language: 'fr-FR'
          }
        }
      );
    });
  });

  describe('searchTVShows', () => {
    it('should return formatted TV show results', async () => {
      const mockResponse = {
        data: {
          results: [
            {
              id: 456,
              name: 'Test Show',
              overview: 'A test show',
              poster_path: '/show.jpg',
              first_air_date: '2023-01-01'
            }
          ]
        }
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const results = await tmdbService.searchTVShows('test');

      expect(results).toHaveLength(1);
      expect(results[0]).toEqual({
        external_id: 'tmdb_456',
        title: 'Test Show',
        type: 'tv',
        description: 'A test show',
        image_url: 'https://image.tmdb.org/t/p/w500/show.jpg',
        release_date: '2023-01-01',
        in_database: false
      });
    });

    it('should handle missing poster path', async () => {
      const mockResponse = {
        data: {
          results: [
            {
              id: 456,
              name: 'Test Show',
              overview: 'A test show',
              poster_path: null,
              first_air_date: '2023-01-01'
            }
          ]
        }
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const results = await tmdbService.searchTVShows('test');

      expect(results[0].image_url).toBeNull();
    });

    it('should handle API errors', async () => {
      mockedAxios.get.mockRejectedValue(new Error('API Error'));

      const results = await tmdbService.searchTVShows('test');

      expect(results).toEqual([]);
    });

    it('should call API with correct parameters', async () => {
      const mockResponse = { data: { results: [] } };
      mockedAxios.get.mockResolvedValue(mockResponse);

      await tmdbService.searchTVShows('test query');

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://api.themoviedb.org/3/search/tv',
        {
          params: {
            api_key: process.env.TMDB_API_KEY,
            query: 'test query',
            language: 'fr-FR'
          }
        }
      );
    });
  });
});
