const axios = require('axios');

class TMDBService {
  constructor() {
    this.apiKey = process.env.TMDB_API_KEY;
    this.baseUrl = 'https://api.themoviedb.org/3';
  }

  /**
   * Search for movies
   * @param {string} query - Search query
   * @returns {Promise<Array>} Array of movie results
   */
  async searchMovies(query) {
    try {
      const response = await axios.get(`${this.baseUrl}/search/movie`, {
        params: {
          api_key: this.apiKey,
          query,
          language: 'fr-FR'
        }
      });

      return response.data.results.map(movie => ({
        external_id: `tmdb_${movie.id}`,
        title: movie.title,
        type: 'movie',
        description: movie.overview,
        image_url: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
        release_date: movie.release_date,
        popularity: movie.popularity || 0,
        rating: movie.vote_average || 0,
        vote_count: movie.vote_count || 0,
        in_database: false
      }));
    } catch (error) {
      console.error('TMDB Movie search error:', error.message);
      return [];
    }
  }

  /**
   * Search for TV shows
   * @param {string} query - Search query
   * @returns {Promise<Array>} Array of TV show results
   */
  async searchTVShows(query) {
    try {
      console.log('TMDBService: Searching TV shows for:', query);
      console.log('TMDBService: API Key available:', !!this.apiKey);
      
      const response = await axios.get(`${this.baseUrl}/search/tv`, {
        params: {
          api_key: this.apiKey,
          query,
          language: 'fr-FR'
        }
      });

      console.log('TMDBService: TV API response status:', response.status);
      console.log('TMDBService: TV results count:', response.data.results?.length || 0);

      return response.data.results.map(show => ({
        external_id: `tmdb_${show.id}`,
        title: show.name,
        type: 'tv',
        description: show.overview,
        image_url: show.poster_path ? `https://image.tmdb.org/t/p/w500${show.poster_path}` : null,
        release_date: show.first_air_date,
        popularity: show.popularity || 0,
        rating: show.vote_average || 0,
        vote_count: show.vote_count || 0,
        in_database: false
      }));
    } catch (error) {
      console.error('TMDB TV search error:', error.message);
      console.error('TMDB TV search error details:', error.response?.data);
      return [];
    }
  }
}

module.exports = TMDBService;
