const express = require('express');
const ItemController = require('../controllers/itemController');

const router = express.Router();
const itemController = new ItemController();

// Add an item to a room
router.post('/rooms/:roomId/items', (req, res) => itemController.addItemToRoom(req, res));

// Update item status
router.put('/rooms/:roomId/items/:itemId/status', (req, res) => itemController.updateItemStatus(req, res));

// Remove item from room
router.delete('/rooms/:roomId/items/:itemId', (req, res) => itemController.removeItemFromRoom(req, res));

// Get item details
router.get('/:itemId', (req, res) => itemController.getItem(req, res));

module.exports = router;
