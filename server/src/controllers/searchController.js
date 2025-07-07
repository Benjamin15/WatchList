const SearchService = require('../services/searchService');
const { PrismaClient } = require('@prisma/client');

class SearchController {
  constructor() {
    this.searchService = new SearchService();
    this.prisma = new PrismaClient();
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
      const { query, roomId } = req.params;
      const { language = 'fr-FR' } = req.query;

      if (!query || query.trim() === '') {
        return res.status(400).json({ error: 'Query is required' });
      }

      const normalizedQuery = query.trim().toLowerCase();
      
      // Créer une clé de cache qui inclut roomId et language si fournis
      const cacheKey = roomId ? `autocomplete:${normalizedQuery}:${roomId}:${language}` : `autocomplete:${normalizedQuery}:${language}`;
      const cached = this.searchCache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
        console.log('SearchController: Using cached results for:', normalizedQuery, roomId ? `(room: ${roomId})` : '', `(lang: ${language})`);
        return res.json(cached.data);
      }

      let results = await this.searchService.searchAutocomplete(query.trim(), language);
      
      // Filtrer les résultats si roomId est fourni
      if (roomId) {
        results = await this.filterExistingMediaInRoom(results, roomId);
      }

      const response = {
        query: query.trim(),
        type: 'all', // Indique que nous cherchons dans tous les types
        results,
        roomId: roomId || null
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
   * Filtre les médias déjà présents dans une room
   * @param {Array} searchResults - Résultats de recherche
   * @param {string} roomId - ID de la room
   * @returns {Array} - Résultats filtrés
   */
  async filterExistingMediaInRoom(searchResults, roomId) {
    try {
      // Récupérer la room
      const room = await this.prisma.room.findUnique({
        where: { roomId },
        include: {
          items: {
            include: {
              item: true
            }
          }
        }
      });

      if (!room) {
        // Si la room n'existe pas, retourner tous les résultats
        return searchResults;
      }

      // Créer un Set des external_ids et titres des médias déjà présents
      const existingExternalIds = new Set();
      const existingTitles = new Set();

      room.items.forEach(itemInRoom => {
        const item = itemInRoom.item;
        if (item.externalId) {
          existingExternalIds.add(item.externalId);
        }
        existingTitles.add(item.title.toLowerCase());
      });

      console.log('SearchController: Existing external_ids in room:', Array.from(existingExternalIds));
      console.log('SearchController: Existing titles in room:', Array.from(existingTitles));

      // Filtrer les résultats de recherche
      const filteredResults = searchResults.filter(result => {
        // Vérifier par external_id
        if (result.external_id && existingExternalIds.has(result.external_id)) {
          console.log('SearchController: Filtering out by external_id:', result.external_id, result.title);
          return false;
        }

        // Vérifier par titre (fallback)
        if (existingTitles.has(result.title.toLowerCase())) {
          console.log('SearchController: Filtering out by title:', result.title);
          return false;
        }

        return true;
      });

      console.log('SearchController: Filtered results:', filteredResults.length, 'of', searchResults.length);
      return filteredResults;
    } catch (error) {
      console.error('Error filtering existing media:', error);
      // En cas d'erreur, retourner tous les résultats
      return searchResults;
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
