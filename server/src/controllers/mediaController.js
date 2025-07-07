const tmdbService = require('../services/tmdbService');

class MediaController {
  async getMediaDetails(req, res) {
    try {
      const { type, tmdbId } = req.params;
      const { language = 'fr-FR' } = req.query;
      
      console.log(`[MediaController] Récupération des détails pour ${type} ${tmdbId} (lang: ${language})`);
      
      if (!['movie', 'series'].includes(type)) {
        return res.status(400).json({
          success: false,
          message: 'Type de média non supporté. Utilisez "movie" ou "series".'
        });
      }

      const details = await tmdbService.getMediaDetails(tmdbId, type, language);
      
      if (!details) {
        return res.status(404).json({
          success: false,
          message: 'Média non trouvé'
        });
      }

      res.json(details);
    } catch (error) {
      console.error('[MediaController] Erreur lors de la récupération des détails:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des détails du média'
      });
    }
  }

  async getMediaTrailers(req, res) {
    try {
      const { type, tmdbId } = req.params;
      const { language = 'fr-FR' } = req.query;
      
      console.log(`[MediaController] Récupération des trailers pour ${type} ${tmdbId} (lang: ${language})`);
      
      if (!['movie', 'series'].includes(type)) {
        return res.status(400).json({
          success: false,
          message: 'Type de média non supporté. Utilisez "movie" ou "series".'
        });
      }

      const trailers = await tmdbService.getMediaTrailers(tmdbId, type, language);
      
      res.json({
        success: true,
        trailers: trailers || []
      });
    } catch (error) {
      console.error('[MediaController] Erreur lors de la récupération des trailers:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des trailers',
        trailers: []
      });
    }
  }
}

module.exports = new MediaController();
