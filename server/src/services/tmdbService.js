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
        external_id: `tmdb_movie_${movie.id}`,
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
        external_id: `tmdb_tv_${show.id}`,
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

  /**
   * Get detailed information about a movie or TV show
   * @param {string} tmdbId - TMDB ID
   * @param {string} type - 'movie' or 'series'
   * @returns {Promise<Object>} Detailed media information
   */
  async getMediaDetails(tmdbId, type) {
    try {
      const endpoint = type === 'movie' ? 'movie' : 'tv';
      const response = await axios.get(`${this.baseUrl}/${endpoint}/${tmdbId}`, {
        params: {
          api_key: this.apiKey,
          language: 'fr-FR',
          append_to_response: 'credits,keywords,videos'
        }
      });

      const data = response.data;
      
      // Transformation des données pour uniformiser movie/series
      const details = {
        id: data.id,
        tmdbId: data.id,
        title: data.title || data.name,
        type: type,
        description: data.overview,
        posterUrl: data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : null,
        backdrop_path: data.backdrop_path ? `https://image.tmdb.org/t/p/w1280${data.backdrop_path}` : null,
        rating: data.vote_average || 0,
        vote_count: data.vote_count || 0,
        popularity: data.popularity || 0,
        
        // Détails spécifiques
        genres: data.genres ? data.genres.map(g => g.name) : [],
        runtime: data.runtime || (data.episode_run_time ? data.episode_run_time[0] : null),
        overview: data.overview,
        vote_average: data.vote_average,
        release_date: data.release_date || data.first_air_date,
        first_air_date: data.first_air_date,
        
        // Série spécifique
        number_of_seasons: data.number_of_seasons,
        number_of_episodes: data.number_of_episodes,
        episode_run_time: data.episode_run_time,
        networks: data.networks ? data.networks.map(n => n.name) : [],
        
        // Film spécifique
        budget: data.budget,
        revenue: data.revenue,
        
        // Commun
        production_companies: data.production_companies ? data.production_companies.map(pc => pc.name) : [],
        spoken_languages: data.spoken_languages ? data.spoken_languages.map(sl => sl.name) : [],
        status_text: data.status,
        tagline: data.tagline,
        homepage: data.homepage,
        imdb_id: data.imdb_id,
        adult: data.adult,
        
        // Trailers extraits des vidéos
        trailers: data.videos && data.videos.results ? 
          data.videos.results
            .filter(video => video.type === 'Trailer' && video.site === 'YouTube')
            .slice(0, 5) // Limiter à 5 trailers
            .map(video => ({
              id: video.id,
              name: video.name,
              key: video.key,
              site: video.site,
              type: video.type,
              size: video.size,
              official: video.official,
              published_at: video.published_at,
              iso_639_1: video.iso_639_1,
              iso_3166_1: video.iso_3166_1
            })) : []
      };

      return details;
    } catch (error) {
      console.error(`TMDB ${type} details error:`, error.message);
      return null;
    }
  }

  /**
   * Get trailers for a movie or TV show
   * @param {string} tmdbId - TMDB ID
   * @param {string} type - 'movie' or 'series'
   * @returns {Promise<Array>} Array of trailers
   */
  async getMediaTrailers(tmdbId, type) {
    try {
      const endpoint = type === 'movie' ? 'movie' : 'tv';
      const response = await axios.get(`${this.baseUrl}/${endpoint}/${tmdbId}/videos`, {
        params: {
          api_key: this.apiKey,
          language: 'fr-FR'
        }
      });

      return response.data.results
        .filter(video => video.type === 'Trailer' && video.site === 'YouTube')
        .slice(0, 10) // Limiter à 10 trailers
        .map(video => ({
          id: video.id,
          name: video.name,
          key: video.key,
          site: video.site,
          type: video.type,
          size: video.size,
          official: video.official,
          published_at: video.published_at,
          iso_639_1: video.iso_639_1,
          iso_3166_1: video.iso_3166_1
        }));
    } catch (error) {
      console.error(`TMDB ${type} trailers error:`, error.message);
      return [];
    }
  }
}

module.exports = new TMDBService();
