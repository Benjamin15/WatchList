const { PrismaClient } = require('@prisma/client');

class ItemController {
  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * Add an item to a room
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async addItemToRoom(req, res) {
    try {
      const { roomId } = req.params;
      const { 
        item_id, 
        external_id, 
        title, 
        type, 
        description, 
        image_url, 
        release_date, 
        note,
        tmdbId,
        malId
      } = req.body;

      // Convert tmdbId to external_id if provided
      let finalExternalId = external_id;
      if (tmdbId && !finalExternalId) {
        finalExternalId = `tmdb_${tmdbId}`;
      } else if (malId && !finalExternalId) {
        finalExternalId = `mal_${malId}`;
      }

      console.log('ItemController: Adding item to room:', roomId);
      console.log('ItemController: Request body:', JSON.stringify(req.body, null, 2));
      console.log('ItemController: Extracted fields:', {
        item_id,
        external_id: finalExternalId,
        title,
        type,
        description,
        image_url,
        release_date,
        note,
        tmdbId,
        malId
      });

      // Check if room exists
      const normalizedRoomId = roomId.toLowerCase();
      const room = await this.prisma.room.findUnique({
        where: { roomId: normalizedRoomId }
      });

      if (!room) {
        return res.status(404).json({ error: 'Room not found' });
      }

      let itemId;

      if (item_id) {
        // Item already exists in database
        itemId = item_id;
        
        // Check if item exists
        const existingItem = await this.prisma.item.findUnique({
          where: { id: item_id }
        });

        if (!existingItem) {
          return res.status(404).json({ error: 'Item not found' });
        }
      } else {
        // New item, need to create it
        if (!title || !type) {
          return res.status(400).json({ error: 'Title and type are required for new items' });
        }

        // Check if item already exists by external_id
        if (finalExternalId) {
          const existingItem = await this.prisma.item.findFirst({
            where: { externalId: finalExternalId }
          });

          if (existingItem) {
            itemId = existingItem.id;
          }
        }

        // Create new item if it doesn't exist
        if (!itemId) {
          const newItem = await this.prisma.item.create({
            data: {
              title,
              type,
              externalId: finalExternalId,
              description,
              imageUrl: image_url,
              releaseDate: release_date,
              note
            }
          });
          itemId = newItem.id;
        }
      }

      // Check if item is already in the room
      const existingItemInRoom = await this.prisma.itemInRoom.findUnique({
        where: {
          roomId_itemId: {
            roomId: room.id,
            itemId
          }
        }
      });

      if (existingItemInRoom) {
        return res.status(409).json({ error: 'Item already in room' });
      }

      // Add item to room
      await this.prisma.itemInRoom.create({
        data: {
          roomId: room.id,
          itemId
        }
      });

      // Return the created item
      const item = await this.prisma.item.findUnique({
        where: { id: itemId }
      });

      res.status(201).json({
        id: item.id,
        title: item.title,
        type: item.type,
        external_id: item.externalId,
        status: item.status,
        image_url: item.imageUrl,
        release_date: item.releaseDate,
        description: item.description,
        note: item.note,
        created_at: item.createdAt
      });
    } catch (error) {
      console.error('Add item to room error:', error.message);
      res.status(500).json({ error: 'Failed to add item to room' });
    }
  }

  /**
   * Update item status
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateItemStatus(req, res) {
    try {
      const { roomId, itemId } = req.params;
      const { status } = req.body;

      console.log('ItemController: Updating item status');
      console.log('ItemController: roomId:', roomId, 'itemId:', itemId);
      console.log('ItemController: New status:', status);

      const validStatuses = ['a_voir', 'en_cours', 'vu'];
      if (!validStatuses.includes(status)) {
        console.log('ItemController: Invalid status:', status);
        return res.status(400).json({ error: 'Invalid status' });
      }

      // Check if room exists
      const normalizedRoomId = roomId.toLowerCase();
      const room = await this.prisma.room.findUnique({
        where: { roomId: normalizedRoomId }
      });

      if (!room) {
        console.log('ItemController: Room not found:', roomId);
        return res.status(404).json({ error: 'Room not found' });
      }

      console.log('ItemController: Room found:', room.id);

      // Check if item is in the room
      const itemInRoom = await this.prisma.itemInRoom.findUnique({
        where: {
          roomId_itemId: {
            roomId: room.id,
            itemId: parseInt(itemId)
          }
        }
      });

      if (!itemInRoom) {
        console.log('ItemController: Item not found in room. Room ID:', room.id, 'Item ID:', parseInt(itemId));
        return res.status(404).json({ error: 'Item not found in room' });
      }

      console.log('ItemController: Item found in room, updating status...');

      // Update item status
      const updatedItem = await this.prisma.item.update({
        where: { id: parseInt(itemId) },
        data: { status }
      });

      console.log('ItemController: Item status updated successfully');

      res.json({
        id: updatedItem.id,
        title: updatedItem.title,
        type: updatedItem.type,
        external_id: updatedItem.externalId,
        status: updatedItem.status,
        image_url: updatedItem.imageUrl,
        release_date: updatedItem.releaseDate,
        description: updatedItem.description,
        note: updatedItem.note,
        created_at: updatedItem.createdAt
      });
    } catch (error) {
      console.error('Update item status error:', error.message);
      res.status(500).json({ error: 'Failed to update item status' });
    }
  }

  /**
   * Remove item from room
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async removeItemFromRoom(req, res) {
    try {
      const { roomId, itemId } = req.params;

      // Check if room exists
      const normalizedRoomId = roomId.toLowerCase();
      const room = await this.prisma.room.findUnique({
        where: { roomId: normalizedRoomId }
      });

      if (!room) {
        return res.status(404).json({ error: 'Room not found' });
      }

      // Check if item is in the room
      const itemInRoom = await this.prisma.itemInRoom.findUnique({
        where: {
          roomId_itemId: {
            roomId: room.id,
            itemId: parseInt(itemId)
          }
        }
      });

      if (!itemInRoom) {
        return res.status(404).json({ error: 'Item not found in room' });
      }

      // Remove item from room
      await this.prisma.itemInRoom.delete({
        where: {
          roomId_itemId: {
            roomId: room.id,
            itemId: parseInt(itemId)
          }
        }
      });

      res.status(204).send();
    } catch (error) {
      console.error('Remove item from room error:', error.message);
      res.status(500).json({ error: 'Failed to remove item from room' });
    }
  }

  /**
   * Get item details
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getItem(req, res) {
    try {
      const { itemId } = req.params;

      const item = await this.prisma.item.findUnique({
        where: { id: parseInt(itemId) }
      });

      if (!item) {
        return res.status(404).json({ error: 'Item not found' });
      }

      res.json({
        id: item.id,
        title: item.title,
        type: item.type,
        external_id: item.externalId,
        status: item.status,
        image_url: item.imageUrl,
        release_date: item.releaseDate,
        description: item.description,
        note: item.note,
        created_at: item.createdAt
      });
    } catch (error) {
      console.error('Get item error:', error.message);
      res.status(500).json({ error: 'Failed to get item' });
    }
  }
}

module.exports = ItemController;
