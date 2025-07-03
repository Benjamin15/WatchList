const request = require('supertest');
const app = require('../../src/app');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

describe('Item Controller', () => {
  let testRoom;

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
    // Create a test room
    testRoom = await prisma.room.create({
      data: {
        roomId: 'test-room-123',
        name: 'Test Room'
      }
    });
  }, 30000);

  afterEach(async () => {
    // Clean up after each test
    await prisma.itemInRoom.deleteMany({});
    await prisma.item.deleteMany({});
    await prisma.room.deleteMany({});
  }, 30000);

  describe('POST /api/items/rooms/:roomId/items', () => {
    it('should add existing item to room successfully', async () => {
      // Create an item first
      const item = await prisma.item.create({
        data: {
          title: 'Test Movie',
          type: 'movie',
          externalId: 'tmdb_123',
          description: 'A test movie'
        }
      });

      const response = await request(app)
        .post(`/api/items/rooms/${testRoom.roomId}/items`)
        .send({ item_id: item.id })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe(item.title);
      expect(response.body.type).toBe(item.type);
    });

    it('should create and add new item to room successfully', async () => {
      const itemData = {
        title: 'New Movie',
        type: 'movie',
        external_id: 'tmdb_456',
        description: 'A new movie',
        image_url: 'https://example.com/image.jpg',
        release_date: '2023-01-01'
      };

      const response = await request(app)
        .post(`/api/items/rooms/${testRoom.roomId}/items`)
        .send(itemData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe(itemData.title);
      expect(response.body.type).toBe(itemData.type);
      expect(response.body.external_id).toBe(itemData.external_id);
    });

    it('should use existing item when external_id matches', async () => {
      // Create an item with external_id
      const existingItem = await prisma.item.create({
        data: {
          title: 'Existing Movie',
          type: 'movie',
          externalId: 'tmdb_789'
        }
      });

      const itemData = {
        title: 'Different Title',
        type: 'movie',
        external_id: 'tmdb_789',
        description: 'Different description'
      };

      const response = await request(app)
        .post(`/api/items/rooms/${testRoom.roomId}/items`)
        .send(itemData)
        .expect(201);

      expect(response.body.id).toBe(existingItem.id);
      expect(response.body.title).toBe(existingItem.title);
    });

    it('should return 404 when room does not exist', async () => {
      const response = await request(app)
        .post('/api/items/rooms/nonexistent-room/items')
        .send({ title: 'Test Movie', type: 'movie' })
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Room not found');
    });

    it('should return 404 when item_id does not exist', async () => {
      const response = await request(app)
        .post(`/api/items/rooms/${testRoom.roomId}/items`)
        .send({ item_id: 999 })
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Item not found');
    });

    it('should return 400 when title is missing for new item', async () => {
      const response = await request(app)
        .post(`/api/items/rooms/${testRoom.roomId}/items`)
        .send({ type: 'movie' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Title and type are required for new items');
    });

    it('should return 400 when type is missing for new item', async () => {
      const response = await request(app)
        .post(`/api/items/rooms/${testRoom.roomId}/items`)
        .send({ title: 'Test Movie' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Title and type are required for new items');
    });

    it('should return 409 when item already exists in room', async () => {
      // Create an item and add it to the room
      const item = await prisma.item.create({
        data: {
          title: 'Test Movie',
          type: 'movie'
        }
      });

      await prisma.itemInRoom.create({
        data: {
          roomId: testRoom.id,
          itemId: item.id
        }
      });

      const response = await request(app)
        .post(`/api/items/rooms/${testRoom.roomId}/items`)
        .send({ item_id: item.id })
        .expect(409);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Item already in room');
    });
  });

  describe('PUT /api/items/rooms/:roomId/items/:itemId/status', () => {
    it('should update item status successfully', async () => {
      // Create and add item to room
      const item = await prisma.item.create({
        data: {
          title: 'Test Movie',
          type: 'movie',
          status: 'a_voir'
        }
      });

      await prisma.itemInRoom.create({
        data: {
          roomId: testRoom.id,
          itemId: item.id
        }
      });

      const response = await request(app)
        .put(`/api/items/rooms/${testRoom.roomId}/items/${item.id}/status`)
        .send({ status: 'vu' })
        .expect(200);

      expect(response.body.status).toBe('vu');
    });

    it('should return 400 for invalid status', async () => {
      const item = await prisma.item.create({
        data: {
          title: 'Test Movie',
          type: 'movie'
        }
      });

      await prisma.itemInRoom.create({
        data: {
          roomId: testRoom.id,
          itemId: item.id
        }
      });

      const response = await request(app)
        .put(`/api/items/rooms/${testRoom.roomId}/items/${item.id}/status`)
        .send({ status: 'invalid_status' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Invalid status');
    });

    it('should return 404 when room does not exist', async () => {
      const response = await request(app)
        .put('/api/items/rooms/nonexistent-room/items/1/status')
        .send({ status: 'vu' })
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Room not found');
    });

    it('should return 404 when item is not in room', async () => {
      const item = await prisma.item.create({
        data: {
          title: 'Test Movie',
          type: 'movie'
        }
      });

      const response = await request(app)
        .put(`/api/items/rooms/${testRoom.roomId}/items/${item.id}/status`)
        .send({ status: 'vu' })
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Item not found in room');
    });
  });

  describe('DELETE /api/items/rooms/:roomId/items/:itemId', () => {
    it('should remove item from room successfully', async () => {
      // Create and add item to room
      const item = await prisma.item.create({
        data: {
          title: 'Test Movie',
          type: 'movie'
        }
      });

      await prisma.itemInRoom.create({
        data: {
          roomId: testRoom.id,
          itemId: item.id
        }
      });

      await request(app)
        .delete(`/api/items/rooms/${testRoom.roomId}/items/${item.id}`)
        .expect(204);

      // Verify item is removed from room
      const itemInRoom = await prisma.itemInRoom.findUnique({
        where: {
          roomId_itemId: {
            roomId: testRoom.id,
            itemId: item.id
          }
        }
      });

      expect(itemInRoom).toBeNull();
    });

    it('should return 404 when room does not exist', async () => {
      const response = await request(app)
        .delete('/api/items/rooms/nonexistent-room/items/1')
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Room not found');
    });

    it('should return 404 when item is not in room', async () => {
      const item = await prisma.item.create({
        data: {
          title: 'Test Movie',
          type: 'movie'
        }
      });

      const response = await request(app)
        .delete(`/api/items/rooms/${testRoom.roomId}/items/${item.id}`)
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Item not found in room');
    });
  });

  describe('GET /api/items/:itemId', () => {
    it('should get item details successfully', async () => {
      const item = await prisma.item.create({
        data: {
          title: 'Test Movie',
          type: 'movie',
          externalId: 'tmdb_123',
          description: 'A test movie',
          imageUrl: 'https://example.com/image.jpg',
          releaseDate: '2023-01-01'
        }
      });

      const response = await request(app)
        .get(`/api/items/${item.id}`)
        .expect(200);

      expect(response.body.id).toBe(item.id);
      expect(response.body.title).toBe(item.title);
      expect(response.body.type).toBe(item.type);
      expect(response.body.external_id).toBe(item.externalId);
    });

    it('should return 404 when item does not exist', async () => {
      const response = await request(app)
        .get('/api/items/999')
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Item not found');
    });
  });
});
