const SearchService = require('../services/searchService');

class SearchController {
  constructor() {
    this.searchService = new SearchService();
  }

  /**
   * Autocomplete search (local + external)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async autocomplete(req, res) {
    try {
      const { type, query } = req.params;

      if (!query || query.trim() === '') {
        return res.status(400).json({ error: 'Query is required' });
      }

      const validTypes = ['movie', 'tv', 'manga'];
      if (!validTypes.includes(type)) {
        return res.status(400).json({ error: 'Invalid type' });
      }

      const results = await this.searchService.searchAutocomplete(type, query.trim());
      
      res.json({
        query: query.trim(),
        type,
        results
      });
    } catch (error) {
      console.error('Autocomplete search error:', error.message);
      res.status(500).json({ error: 'Failed to perform search' });
    }
  }
}

module.exports = SearchController;
