const request = require('supertest');
const app = require('../../src/app');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

describe('Room Controller', () => {
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

  describe('POST /api/rooms', () => {
    it('should create a new room successfully', async () => {
      const roomData = { name: 'Test Room' };

      const response = await request(app)
        .post('/api/rooms')
        .send(roomData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('room_id');
      expect(response.body.name).toBe(roomData.name);
      expect(response.body).toHaveProperty('created_at');
    });

    it('should return 400 when name is missing', async () => {
      const response = await request(app)
        .post('/api/rooms')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Room name is required');
    });

    it('should return 400 when name is empty string', async () => {
      const response = await request(app)
        .post('/api/rooms')
        .send({ name: '' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Room name is required');
    });

    it('should return 400 when name is only whitespace', async () => {
      const response = await request(app)
        .post('/api/rooms')
        .send({ name: '   ' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Room name is required');
    });

    it('should trim whitespace from room name', async () => {
      const roomData = { name: '  Test Room  ' };

      const response = await request(app)
        .post('/api/rooms')
        .send(roomData)
        .expect(201);

      expect(response.body.name).toBe('Test Room');
    });
  });

  describe('GET /api/rooms/:roomId', () => {
    it('should get room information successfully', async () => {
      // Create a room first
      const room = await prisma.room.create({
        data: {
          roomId: 'test-room-123',
          name: 'Test Room'
        }
      });

      const response = await request(app)
        .get(`/api/rooms/${room.roomId}`)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body.room_id).toBe(room.roomId);
      expect(response.body.name).toBe(room.name);
      expect(response.body).toHaveProperty('created_at');
    });

    it('should return 404 when room does not exist', async () => {
      const response = await request(app)
        .get('/api/rooms/nonexistent-room')
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Room not found');
    });
  });

  describe('GET /api/rooms/:roomId/items', () => {
    it('should get empty room items successfully', async () => {
      // Create a room first
      const room = await prisma.room.create({
        data: {
          roomId: 'test-room-123',
          name: 'Test Room'
        }
      });

      const response = await request(app)
        .get(`/api/rooms/${room.roomId}/items`)
        .expect(200);

      expect(response.body).toHaveProperty('room');
      expect(response.body).toHaveProperty('items');
      expect(response.body.room.room_id).toBe(room.roomId);
      expect(response.body.items).toHaveLength(0);
    });

    it('should get room items with items successfully', async () => {
      // Create a room and item
      const room = await prisma.room.create({
        data: {
          roomId: 'test-room-123',
          name: 'Test Room'
        }
      });

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

      await prisma.itemInRoom.create({
        data: {
          roomId: room.id,
          itemId: item.id
        }
      });

      const response = await request(app)
        .get(`/api/rooms/${room.roomId}/items`)
        .expect(200);

      expect(response.body).toHaveProperty('room');
      expect(response.body).toHaveProperty('items');
      expect(response.body.items).toHaveLength(1);
      expect(response.body.items[0].title).toBe(item.title);
      expect(response.body.items[0].type).toBe(item.type);
      expect(response.body.items[0]).toHaveProperty('added_to_room_at');
    });

    it('should return 404 when room does not exist', async () => {
      const response = await request(app)
        .get('/api/rooms/nonexistent-room/items')
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Room not found');
    });

    it('should return items ordered by creation date (newest first)', async () => {
      // Create a room
      const room = await prisma.room.create({
        data: {
          roomId: 'test-room-123',
          name: 'Test Room'
        }
      });

      // Create items
      const item1 = await prisma.item.create({
        data: {
          title: 'First Movie',
          type: 'movie'
        }
      });

      const item2 = await prisma.item.create({
        data: {
          title: 'Second Movie',
          type: 'movie'
        }
      });

      // Add items to room with delay to ensure different timestamps
      await prisma.itemInRoom.create({
        data: {
          roomId: room.id,
          itemId: item1.id
        }
      });

      await new Promise(resolve => setTimeout(resolve, 10));

      await prisma.itemInRoom.create({
        data: {
          roomId: room.id,
          itemId: item2.id
        }
      });

      const response = await request(app)
        .get(`/api/rooms/${room.roomId}/items`)
        .expect(200);

      expect(response.body.items).toHaveLength(2);
      expect(response.body.items[0].title).toBe('Second Movie');
      expect(response.body.items[1].title).toBe('First Movie');
    });
  });
});
