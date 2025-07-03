const express = require('express');
const SearchController = require('../controllers/searchController');

const router = express.Router();
const searchController = new SearchController();

// Autocomplete search
router.get('/autocomplete/:type/:query', (req, res) => searchController.autocomplete(req, res));

module.exports = router;
