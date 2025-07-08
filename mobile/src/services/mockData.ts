// Données de test pour le développement

import { Room, WatchlistItem, SearchResult } from '../types';

export const mockRooms: Room[] = [
  {
    id: 1,
    name: 'Ma Watchlist',
    room_id: 'ABC123',
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 2,
    name: 'Watchlist Famille',
    room_id: 'FAM456',
    created_at: '2025-01-02T00:00:00Z',
  },
];

export const mockWatchlistItems: WatchlistItem[] = [
  {
    id: 1,
    roomId: 1,
    mediaId: 1,
    status: 'watching',
    addedAt: '2025-01-01T00:00:00Z',
    media: {
      id: 1,
      title: 'Inception',
      type: 'movie',
      year: 2010,
      genre: 'Science-Fiction, Thriller',
      description: 'Un voleur qui s\'infiltre dans les rêves se voit offrir une chance de retrouver sa vie d\'avant... mais pour cela, il doit accomplir l\'impossible : l\'inception.',
      posterUrl: 'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
      rating: 8.8,
      tmdbId: 27205,
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    },
  },
  {
    id: 2,
    roomId: 1,
    mediaId: 2,
    status: 'completed',
    addedAt: '2025-01-02T00:00:00Z',
    media: {
      id: 2,
      title: 'Breaking Bad',
      type: 'series',
      year: 2008,
      genre: 'Crime, Drame, Thriller',
      description: 'Un professeur de chimie atteint d\'un cancer terminal s\'associe avec un ancien élève pour fabriquer et vendre de la méthamphétamine.',
      posterUrl: 'https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg',
      rating: 9.5,
      tmdbId: 1396,
      createdAt: '2025-01-02T00:00:00Z',
      updatedAt: '2025-01-02T00:00:00Z',
    },
  },
  {
    id: 3,
    roomId: 1,
    mediaId: 3,
    status: 'planned',
    addedAt: '2025-01-03T00:00:00Z',
    media: {
      id: 3,
      title: 'One Piece',
      type: 'manga',
      year: 1997,
      genre: 'Aventure, Comédie, Shounen',
      description: 'Les aventures de Monkey D. Luffy et de son équipage de pirates Straw Hat à la recherche du légendaire trésor connu sous le nom de "One Piece".',
      posterUrl: 'https://cdn.myanimelist.net/images/manga/2/253146.jpg',
      rating: 9.2,
      malId: 13,
      createdAt: '2025-01-03T00:00:00Z',
      updatedAt: '2025-01-03T00:00:00Z',
    },
  },
  {
    id: 4,
    roomId: 1,
    mediaId: 4,
    status: 'dropped',
    addedAt: '2025-01-04T00:00:00Z',
    media: {
      id: 4,
      title: 'The Walking Dead',
      type: 'series',
      year: 2010,
      genre: 'Horror, Drama, Thriller',
      description: 'Un groupe de survivants tente de survivre dans un monde post-apocalyptique envahi par les zombies.',
      posterUrl: 'https://image.tmdb.org/t/p/w500/rqeYMLryjcawh2JeRpCVUDXYM5b.jpg',
      rating: 8.2,
      tmdbId: 1402,
      createdAt: '2025-01-04T00:00:00Z',
      updatedAt: '2025-01-04T00:00:00Z',
    },
  },
];

export const mockSearchResults: SearchResult[] = [
  {
    id: 101,
    title: 'The Matrix',
    type: 'movie',
    year: 1999,
    genre: 'Action, Science-Fiction',
    description: 'Un programmeur informatique découvre que sa réalité est une simulation et rejoint une rébellion contre les machines.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg',
    rating: 8.7,
    tmdbId: 603,
  },
  {
    id: 102,
    title: 'Stranger Things',
    type: 'series',
    year: 2016,
    genre: 'Drama, Fantasy, Horror',
    description: 'Un groupe d\'enfants découvre des forces surnaturelles et des expériences gouvernementales secrètes dans leur petite ville.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg',
    rating: 8.7,
    tmdbId: 66732,
  },
  {
    id: 103,
    title: 'Naruto',
    type: 'manga',
    year: 1999,
    genre: 'Action, Aventure, Martial Arts',
    description: 'Les aventures de Naruto Uzumaki, un ninja adolescent qui recherche la reconnaissance et rêve de devenir le leader de son village.',
    posterUrl: 'https://cdn.myanimelist.net/images/manga/3/249658.jpg',
    rating: 8.1,
    malId: 11,
  },
  {
    id: 104,
    title: 'Interstellar',
    type: 'movie',
    year: 2014,
    genre: 'Adventure, Drama, Science Fiction',
    description: 'Une équipe d\'explorateurs voyage à travers un trou de ver dans l\'espace pour assurer la survie de l\'humanité.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    rating: 8.6,
    tmdbId: 157336,
  },
  {
    id: 105,
    title: 'Attack on Titan',
    type: 'manga',
    year: 2009,
    genre: 'Action, Drama, Fantasy',
    description: 'L\'humanité vit dans des villes entourées de murs géants pour se protéger des titans, des humanoïdes géants qui dévorent les humains.',
    posterUrl: 'https://cdn.myanimelist.net/images/manga/2/37846.jpg',
    rating: 8.5,
    malId: 23390,
  },
];

// Fonction pour simuler des délais d'API
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Storage dynamique pour les rooms créées
const dynamicRooms: Room[] = [...mockRooms];

// Service de test (sans API)
export const mockApiService = {
  createRoom: async (name: string) => {
    await delay(1000);
    const newRoom: Room = {
      id: Date.now(),
      name,
      room_id: Math.random().toString(36).substring(2, 8).toUpperCase(),
      created_at: new Date().toISOString(),
    };
    // Ajouter la room créée au storage dynamique
    dynamicRooms.push(newRoom);
    return newRoom;
  },

  joinRoom: async (code: string) => {
    await delay(1000);
    const room = dynamicRooms.find(r => r.room_id === code);
    if (!room) {
      throw new Error('Room non trouvée');
    }
    return room;
  },

  getRoom: async (roomId: number) => {
    await delay(500);
    const room = dynamicRooms.find(r => r.id === roomId);
    if (!room) {
      throw new Error('Room non trouvée');
    }
    return room;
  },

  getWatchlist: async (roomId: number | string, filters?: any) => {
    await delay(1000);
    let items = mockWatchlistItems.filter(item => item.roomId === roomId);
    
    if (filters?.type && filters.type !== 'all') {
      items = items.filter(item => item.media.type === filters.type);
    }
    
    if (filters?.status && filters.status !== 'all') {
      items = items.filter(item => item.status === filters.status);
    }
    
    return {
      data: items,
      pagination: {
        page: 1,
        limit: 20,
        total: items.length,
        totalPages: 1,
      },
    };
  },

  searchMedia: async (query: string, type?: string) => {
    await delay(1000);
    let results = mockSearchResults.filter(item =>
      item.title.toLowerCase().includes(query.toLowerCase())
    );
    
    if (type && type !== 'all') {
      results = results.filter(item => item.type === type);
    }
    
    return results;
  },

  addToWatchlist: async (roomId: number, mediaData: any): Promise<WatchlistItem> => {
    await delay(1000);
    // Simulation d'ajout
    return {
      id: Date.now(),
      roomId,
      mediaId: Date.now(),
      status: mediaData.status || 'planned',
      addedAt: new Date().toISOString(),
      media: {
        id: Date.now(),
        ...mediaData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    } as WatchlistItem;
  },

  updateWatchlistItem: async (roomId: number, itemId: number, updates: any): Promise<WatchlistItem> => {
    await delay(500);
    const item = mockWatchlistItems.find(i => i.id === itemId);
    if (!item) {
      throw new Error('Item non trouvé');
    }
    return { ...item, ...updates } as WatchlistItem;
  },

  removeFromWatchlist: async (roomId: number, itemId: number) => {
    await delay(500);
    // Simulation de suppression
    return;
  },
};
