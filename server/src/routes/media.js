const express = require('express');
const router = express.Router();
const mediaController = require('../controllers/mediaController');

// Route pour récupérer les détails d'un média depuis TMDB
router.get('/:type/:tmdbId/details', mediaController.getMediaDetails);

// Route pour récupérer les trailers d'un média depuis TMDB
router.get('/:type/:tmdbId/trailers', mediaController.getMediaTrailers);

module.exports = router;
