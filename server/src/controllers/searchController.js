const SearchService = require('../services/searchService');

class SearchController {
  constructor() {
    this.searchService = new SearchService();
    // Cache simple pour la recherche en temps réel
    this.searchCache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Autocomplete search (local + external, all types)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async autocomplete(req, res) {
    try {
      const { query } = req.params;

      if (!query || query.trim() === '') {
        return res.status(400).json({ error: 'Query is required' });
      }

      const normalizedQuery = query.trim().toLowerCase();
      
      // Vérifier le cache
      const cacheKey = `autocomplete:${normalizedQuery}`;
      const cached = this.searchCache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
        console.log('SearchController: Using cached results for:', normalizedQuery);
        return res.json(cached.data);
      }

      const results = await this.searchService.searchAutocomplete(query.trim());
      
      const response = {
        query: query.trim(),
        type: 'all', // Indique que nous cherchons dans tous les types
        results
      };

      // Mettre en cache les résultats
      this.searchCache.set(cacheKey, {
        data: response,
        timestamp: Date.now()
      });

      // Nettoyer le cache périodiquement
      if (this.searchCache.size > 100) {
        this.cleanupCache();
      }
      
      res.json(response);
    } catch (error) {
      console.error('Autocomplete search error:', error.message);
      res.status(500).json({ error: 'Failed to perform search' });
    }
  }

  /**
   * Nettoie le cache des anciennes entrées
   */
  cleanupCache() {
    const now = Date.now();
    for (const [key, value] of this.searchCache.entries()) {
      if (now - value.timestamp > this.cacheTimeout) {
        this.searchCache.delete(key);
      }
    }
  }
}

module.exports = SearchController;
