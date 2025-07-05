const { PrismaClient } = require('@prisma/client');
const tmdbService = require('./tmdbService');

class SearchService {
  constructor() {
    this.prisma = new PrismaClient();
    this.tmdbService = tmdbService;
  }

  /**
   * Search for items externally via TMDB (movies and TV shows)
   * @param {string} query - Search query
   * @returns {Promise<Array>} Array of external results sorted by popularity then rating
   */
  async searchExternal(query) {
    try {
      const [movieResults, tvResults] = await Promise.all([
        this.tmdbService.searchMovies(query),
        this.tmdbService.searchTVShows(query)
      ]);

      // Combine movies and TV shows
      const allResults = [...(movieResults || []), ...(tvResults || [])];
      
      // Sort by popularity (descending) then by rating (descending)
      const sortedResults = allResults.sort((a, b) => {
        // First sort by popularity (descending)
        if (b.popularity !== a.popularity) {
          return b.popularity - a.popularity;
        }
        
        // If popularity is the same, sort by rating (descending)
        if (b.rating !== a.rating) {
          return b.rating - a.rating;
        }
        
        // If both are the same, sort by vote count (descending)
        return (b.vote_count || 0) - (a.vote_count || 0);
      });

      // Return first 10 results, now sorted by popularity and rating
      return sortedResults.slice(0, 10);
    } catch (error) {
      console.error('External search error:', error.message);
      return [];
    }
  }

  /**
   * Search only on TMDB (no local cache)
   * @param {string} query - Search query
   * @returns {Promise<Array>} Array of TMDB results sorted by popularity and rating
   */
  async searchAutocomplete(query) {
    try {
      console.log('SearchService: Searching on TMDB only for:', query);
      
      // Get external results from TMDB (already sorted by popularity and rating)
      const externalResults = await this.searchExternal(query);
      console.log('SearchService: TMDB results:', externalResults.length);
      
      // Return TMDB results directly (already limited to 10 and sorted)
      const finalResults = externalResults;
      
      console.log('SearchService: Final results count:', finalResults.length);
      console.log('SearchService: Final results types:', finalResults.map(r => r.type));
      console.log('SearchService: Final results popularity:', finalResults.map(r => ({ title: r.title, popularity: r.popularity, rating: r.rating })));
      
      return finalResults;
    } catch (error) {
      console.error('Autocomplete search error:', error.message);
      return [];
    }
  }
}

module.exports = SearchService;
