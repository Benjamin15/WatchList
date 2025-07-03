const MALService = require('../../src/services/malService');
const axios = require('axios');

// Mock axios
jest.mock('axios');
const mockedAxios = axios;

describe('MAL Service', () => {
  let malService;

  beforeEach(() => {
    malService = new MALService();
    jest.clearAllMocks();
  });

  describe('searchManga', () => {
    it('should return formatted manga results', async () => {
      const mockResponse = {
        data: {
          data: [
            {
              node: {
                id: 123,
                title: 'Test Manga',
                synopsis: 'A test manga',
                main_picture: {
                  medium: 'https://example.com/manga.jpg'
                },
                start_date: '2023-01-01'
              }
            }
          ]
        }
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const results = await malService.searchManga('test');

      expect(results).toHaveLength(1);
      expect(results[0]).toEqual({
        external_id: 'mal_123',
        title: 'Test Manga',
        type: 'manga',
        description: 'A test manga',
        image_url: 'https://example.com/manga.jpg',
        release_date: '2023-01-01',
        in_database: false
      });
    });

    it('should handle missing main picture', async () => {
      const mockResponse = {
        data: {
          data: [
            {
              node: {
                id: 123,
                title: 'Test Manga',
                synopsis: 'A test manga',
                main_picture: null,
                start_date: '2023-01-01'
              }
            }
          ]
        }
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const results = await malService.searchManga('test');

      expect(results[0].image_url).toBeNull();
    });

    it('should handle missing main picture medium', async () => {
      const mockResponse = {
        data: {
          data: [
            {
              node: {
                id: 123,
                title: 'Test Manga',
                synopsis: 'A test manga',
                main_picture: {},
                start_date: '2023-01-01'
              }
            }
          ]
        }
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const results = await malService.searchManga('test');

      expect(results[0].image_url).toBeNull();
    });

    it('should handle API errors', async () => {
      mockedAxios.get.mockRejectedValue(new Error('API Error'));

      const results = await malService.searchManga('test');

      expect(results).toEqual([]);
    });

    it('should call API with correct parameters', async () => {
      const mockResponse = { data: { data: [] } };
      mockedAxios.get.mockResolvedValue(mockResponse);

      await malService.searchManga('test query');

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://api.myanimelist.net/v2/manga',
        {
          params: {
            q: 'test query',
            limit: 10,
            fields: 'title,synopsis,main_picture,start_date'
          },
          headers: {
            'X-MAL-CLIENT-ID': process.env.MAL_CLIENT_ID
          }
        }
      );
    });
  });
});
