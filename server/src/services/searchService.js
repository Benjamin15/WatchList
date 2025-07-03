const { PrismaClient } = require('@prisma/client');
const TMDBService = require('./tmdbService');
const MALService = require('./malService');

class SearchService {
  constructor() {
    this.prisma = new PrismaClient();
    this.tmdbService = new TMDBService();
    this.malService = new MALService();
  }

  /**
   * Search for items locally in the database
   * @param {string} type - Type of content (movie, tv, manga)
   * @param {string} query - Search query
   * @returns {Promise<Array>} Array of local results
   */
  async searchLocal(type, query) {
    try {
      const items = await this.prisma.item.findMany({
        where: {
          type: type,
          title: {
            contains: query
          }
        },
        take: 10
      });

      return items.map(item => ({
        item_id: item.id,
        title: item.title,
        type: item.type,
        external_id: item.externalId,
        description: item.description,
        image_url: item.imageUrl,
        release_date: item.releaseDate,
        note: item.note,
        in_database: true
      }));
    } catch (error) {
      console.error('Local search error:', error.message);
      return [];
    }
  }

  /**
   * Search for items externally via APIs
   * @param {string} type - Type of content (movie, tv, manga)
   * @param {string} query - Search query
   * @returns {Promise<Array>} Array of external results
   */
  async searchExternal(type, query) {
    try {
      switch (type) {
        case 'movie':
          return await this.tmdbService.searchMovies(query);
        case 'tv':
          return await this.tmdbService.searchTVShows(query);
        case 'manga':
          return await this.malService.searchManga(query);
        default:
          return [];
      }
    } catch (error) {
      console.error('External search error:', error.message);
      return [];
    }
  }

  /**
   * Combined search: local first, then external
   * @param {string} type - Type of content (movie, tv, manga)
   * @param {string} query - Search query
   * @returns {Promise<Array>} Array of combined results
   */
  async searchAutocomplete(type, query) {
    try {
      // Search locally first
      const localResults = await this.searchLocal(type, query);
      
      // If we have enough local results, return them
      if (localResults.length >= 5) {
        return localResults.slice(0, 10);
      }

      // Otherwise, supplement with external results
      const externalResults = await this.searchExternal(type, query);
      
      // Filter out external results that already exist locally
      const filteredExternalResults = (externalResults || []).filter(external => 
        !localResults.some(local => local.external_id === external.external_id)
      );

      // Combine and limit results
      const combined = [...localResults, ...filteredExternalResults];
      return combined.slice(0, 10);
    } catch (error) {
      console.error('Autocomplete search error:', error.message);
      return [];
    }
  }
}

module.exports = SearchService;
