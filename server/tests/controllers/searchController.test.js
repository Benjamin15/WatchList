const request = require('supertest');
const app = require('../../src/app');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

describe('Search Controller (Simple)', () => {
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
    // Clean database before each test
    await prisma.itemInRoom.deleteMany({});
    await prisma.item.deleteMany({});
    await prisma.room.deleteMany({});
  }, 30000);

  describe('GET /api/search/autocomplete/:type/:query', () => {
    it('should return 200 with empty results for valid search', async () => {
      const response = await request(app)
        .get('/api/search/autocomplete/movie/test')
        .expect(200);

      expect(response.body).toHaveProperty('query', 'test');
      expect(response.body).toHaveProperty('type', 'movie');
      expect(response.body).toHaveProperty('results');
      expect(Array.isArray(response.body.results)).toBe(true);
    });

    it('should return local results when items exist', async () => {
      // Create local items
      await prisma.item.create({
        data: {
          title: 'Test Movie',
          type: 'movie',
          externalId: 'tmdb_123',
          description: 'A test movie'
        }
      });

      const response = await request(app)
        .get('/api/search/autocomplete/movie/test')
        .expect(200);

      expect(response.body.results.length).toBeGreaterThan(0);
      expect(response.body.results[0].title).toBe('Test Movie');
      expect(response.body.results[0].in_database).toBe(true);
    });

    it('should return 404 for empty query', async () => {
      const response = await request(app)
        .get('/api/search/autocomplete/movie/')
        .expect(404); // 404 because route doesn't match
    });

    it('should return 400 for invalid type', async () => {
      const response = await request(app)
        .get('/api/search/autocomplete/invalid/test')
        .expect(400);

      expect(response.body.error).toBe('Invalid type');
    });

    it('should search TV shows', async () => {
      const response = await request(app)
        .get('/api/search/autocomplete/tv/test')
        .expect(200);

      expect(response.body.type).toBe('tv');
    });

    it('should search manga', async () => {
      const response = await request(app)
        .get('/api/search/autocomplete/manga/test')
        .expect(200);

      expect(response.body.type).toBe('manga');
    });
  });
});
