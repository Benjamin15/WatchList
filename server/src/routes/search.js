const express = require('express');
const SearchController = require('../controllers/searchController');

const router = express.Router();
const searchController = new SearchController();

// Autocomplete search (all types)
router.get('/autocomplete/:query', (req, res) => searchController.autocomplete(req, res));

// Autocomplete search with room filtering
router.get('/autocomplete/:query/:roomId', (req, res) => searchController.autocomplete(req, res));

module.exports = router;
