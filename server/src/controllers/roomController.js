const { PrismaClient } = require('@prisma/client');
const { generateRoomId } = require('../utils/roomGenerator');

class RoomController {
  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * Create a new room
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async createRoom(req, res) {
    try {
      const { name } = req.body;

      if (!name || name.trim() === '') {
        return res.status(400).json({ error: 'Room name is required' });
      }

      const roomId = generateRoomId();
      const room = await this.prisma.room.create({
        data: {
          roomId,
          name: name.trim()
        }
      });

      res.status(201).json({
        id: room.id,
        room_id: room.roomId,
        name: room.name,
        created_at: room.createdAt
      });
    } catch (error) {
      console.error('Create room error:', error.message);
      res.status(500).json({ error: 'Failed to create room' });
    }
  }

  /**
   * Get room information
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getRoom(req, res) {
    try {
      const { roomId } = req.params;

      // Normaliser le roomId en minuscules pour la recherche
      const normalizedRoomId = roomId.toLowerCase();
      
      const room = await this.prisma.room.findUnique({
        where: { roomId: normalizedRoomId }
      });

      if (!room) {
        return res.status(404).json({ error: 'Room not found' });
      }

      res.json({
        id: room.id,
        room_id: room.roomId,
        name: room.name,
        created_at: room.createdAt
      });
    } catch (error) {
      console.error('Get room error:', error.message);
      res.status(500).json({ error: 'Failed to get room' });
    }
  }

  /**
   * Get all items in a room
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getRoomItems(req, res) {
    try {
      const { roomId } = req.params;

      // Normaliser le roomId en minuscules pour la recherche
      const normalizedRoomId = roomId.toLowerCase();
      
      const room = await this.prisma.room.findUnique({
        where: { roomId: normalizedRoomId },
        include: {
          items: {
            include: {
              item: true
            },
            orderBy: {
              createdAt: 'desc'
            }
          }
        }
      });

      if (!room) {
        return res.status(404).json({ error: 'Room not found' });
      }

      const items = room.items.map(itemInRoom => ({
        id: itemInRoom.item.id,
        title: itemInRoom.item.title,
        type: itemInRoom.item.type,
        external_id: itemInRoom.item.externalId,
        status: itemInRoom.item.status,
        image_url: itemInRoom.item.imageUrl,
        release_date: itemInRoom.item.releaseDate,
        description: itemInRoom.item.description,
        note: itemInRoom.item.note,
        created_at: itemInRoom.item.createdAt,
        added_to_room_at: itemInRoom.createdAt
      }));

      res.json({
        room: {
          id: room.id,
          room_id: room.roomId,
          name: room.name,
          created_at: room.createdAt
        },
        items
      });
    } catch (error) {
      console.error('Get room items error:', error.message);
      res.status(500).json({ error: 'Failed to get room items' });
    }
  }
}

module.exports = RoomController;
