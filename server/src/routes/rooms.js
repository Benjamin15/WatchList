const express = require('express');
const RoomController = require('../controllers/roomController');
const ItemController = require('../controllers/itemController');

const router = express.Router();
const roomController = new RoomController();
const itemController = new ItemController();

// Create a new room
router.post('/', (req, res) => roomController.createRoom(req, res));

// Get room information
router.get('/:roomId', (req, res) => roomController.getRoom(req, res));

// Get all items in a room
router.get('/:roomId/items', (req, res) => roomController.getRoomItems(req, res));

// Add an item to a room
router.post('/:roomId/items', (req, res) => itemController.addItemToRoom(req, res));

// Update item status
router.put('/:roomId/items/:itemId/status', (req, res) => itemController.updateItemStatus(req, res));

// Remove item from room
router.delete('/:roomId/items/:itemId', (req, res) => itemController.removeItemFromRoom(req, res));

module.exports = router;
