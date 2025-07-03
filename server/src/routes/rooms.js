const express = require('express');
const RoomController = require('../controllers/roomController');

const router = express.Router();
const roomController = new RoomController();

// Create a new room
router.post('/', (req, res) => roomController.createRoom(req, res));

// Get room information
router.get('/:roomId', (req, res) => roomController.getRoom(req, res));

// Get all items in a room
router.get('/:roomId/items', (req, res) => roomController.getRoomItems(req, res));

module.exports = router;
