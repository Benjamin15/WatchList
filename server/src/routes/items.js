const express = require('express');
const ItemController = require('../controllers/itemController');

const router = express.Router();
const itemController = new ItemController();

// Get item details
router.get('/:itemId', (req, res) => itemController.getItem(req, res));

module.exports = router;
