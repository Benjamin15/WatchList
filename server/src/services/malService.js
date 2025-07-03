const axios = require('axios');

class MALService {
  constructor() {
    this.clientId = process.env.MAL_CLIENT_ID;
    this.baseUrl = 'https://api.myanimelist.net/v2';
  }

  /**
   * Search for manga
   * @param {string} query - Search query
   * @returns {Promise<Array>} Array of manga results
   */
  async searchManga(query) {
    try {
      const response = await axios.get(`${this.baseUrl}/manga`, {
        params: {
          q: query,
          limit: 10,
          fields: 'title,synopsis,main_picture,start_date'
        },
        headers: {
          'X-MAL-CLIENT-ID': this.clientId
        }
      });

      return response.data.data.map(manga => ({
        external_id: `mal_${manga.node.id}`,
        title: manga.node.title,
        type: 'manga',
        description: manga.node.synopsis,
        image_url: manga.node.main_picture?.medium || null,
        release_date: manga.node.start_date,
        in_database: false
      }));
    } catch (error) {
      console.error('MAL search error:', error.message);
      return [];
    }
  }
}

module.exports = MALService;
