const SearchService = require('../../src/services/searchService');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

describe('Search Service (Simple)', () => {
  let searchService;

  beforeAll(async () => {
    // Clean database before tests
    await prisma.itemInRoom.deleteMany({});
    await prisma.item.deleteMany({});
    await prisma.room.deleteMany({});
  }, 30000);

  afterAll(async () => {
    // Clean database after tests
    await prisma.itemInRoom.deleteMany({});
    await prisma.item.deleteMany({});
    await prisma.room.deleteMany({});
    await prisma.$disconnect();
  }, 30000);

  beforeEach(async () => {
    searchService = new SearchService();
    
    // Clean database before each test
    await prisma.itemInRoom.deleteMany({});
    await prisma.item.deleteMany({});
    await prisma.room.deleteMany({});
  }, 30000);

  describe('searchLocal', () => {
    it('should return local items matching query', async () => {
      // Create test items
      await prisma.item.create({
        data: {
          title: 'Inception',
          type: 'movie',
          externalId: 'tmdb_123',
          description: 'A mind-bending thriller'
        }
      });

      await prisma.item.create({
        data: {
          title: 'The Dark Knight',
          type: 'movie',
          externalId: 'tmdb_456',
          description: 'Batman film'
        }
      });

      const results = await searchService.searchLocal('movie', 'incep');

      expect(results.length).toBe(1);
      expect(results[0].title).toBe('Inception');
      expect(results[0].in_database).toBe(true);
    });

    it('should filter by type', async () => {
      // Create test items
      await prisma.item.create({
        data: {
          title: 'Test Movie',
          type: 'movie',
          externalId: 'tmdb_123'
        }
      });

      await prisma.item.create({
        data: {
          title: 'Test TV Show',
          type: 'tv',
          externalId: 'tmdb_456'
        }
      });

      const movieResults = await searchService.searchLocal('movie', 'test');
      const tvResults = await searchService.searchLocal('tv', 'test');

      expect(movieResults.length).toBe(1);
      expect(movieResults[0].title).toBe('Test Movie');
      expect(tvResults.length).toBe(1);
      expect(tvResults[0].title).toBe('Test TV Show');
    });

    it('should limit results to 10', async () => {
      // Create 15 test items
      for (let i = 1; i <= 15; i++) {
        await prisma.item.create({
          data: {
            title: `Test Movie ${i}`,
            type: 'movie',
            externalId: `tmdb_${i}`
          }
        });
      }

      const results = await searchService.searchLocal('movie', 'test');

      expect(results.length).toBe(10);
    });
  });

  describe('searchExternal', () => {
    it('should return empty array for invalid type', async () => {
      const results = await searchService.searchExternal('invalid', 'test');
      expect(results).toEqual([]);
    });

    it('should handle API errors gracefully', async () => {
      // The external services will return empty arrays on errors
      const results = await searchService.searchExternal('movie', 'test');
      expect(Array.isArray(results)).toBe(true);
    });
  });

  describe('searchAutocomplete', () => {
    it('should return only local results when enough are available', async () => {
      // Create 6 local items
      for (let i = 1; i <= 6; i++) {
        await prisma.item.create({
          data: {
            title: `Local Movie ${i}`,
            type: 'movie',
            externalId: `tmdb_${i}`
          }
        });
      }

      const results = await searchService.searchAutocomplete('movie', 'local');

      expect(results.length).toBe(6);
      expect(results.every(r => r.in_database)).toBe(true);
    });

    it('should handle empty results gracefully', async () => {
      const results = await searchService.searchAutocomplete('movie', 'nonexistent');
      expect(Array.isArray(results)).toBe(true);
    });

    it('should limit results to 10', async () => {
      // Create 15 local items
      for (let i = 1; i <= 15; i++) {
        await prisma.item.create({
          data: {
            title: `Local Movie ${i}`,
            type: 'movie',
            externalId: `tmdb_${i}`
          }
        });
      }

      const results = await searchService.searchAutocomplete('movie', 'local');

      expect(results.length).toBeLessThanOrEqual(10);
    });
  });
});
