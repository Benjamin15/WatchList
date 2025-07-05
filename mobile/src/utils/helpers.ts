// Import des types
import { Media, SearchResult } from '../types';

// Helper pour extraire l'ID TMDB depuis différents formats
export const extractTmdbId = (media: any): number | null => {
  console.log('[extractTmdbId] Media reçu:', JSON.stringify(media, null, 2));
  
  // Si c'est déjà un nombre, on le retourne
  if (typeof media.tmdbId === 'number') {
    console.log('[extractTmdbId] TMDB ID trouvé (number):', media.tmdbId);
    return media.tmdbId;
  }
  
  // Si c'est une chaîne, on essaie de la convertir
  if (typeof media.tmdbId === 'string') {
    const id = parseInt(media.tmdbId, 10);
    console.log('[extractTmdbId] TMDB ID trouvé (string):', media.tmdbId, '→', id);
    return isNaN(id) ? null : id;
  }
  
  // Si on a un external_id aux nouveaux formats "tmdb_movie_123" ou "tmdb_tv_123" ou ancien format "tmdb_123"
  if (media.external_id && typeof media.external_id === 'string') {
    // Nouveau format avec type : tmdb_movie_123 ou tmdb_tv_123
    const newFormatMatch = media.external_id.match(/^tmdb_(movie|tv)_(\d+)$/);
    if (newFormatMatch) {
      const id = parseInt(newFormatMatch[2], 10);
      console.log('[extractTmdbId] External ID nouveau format trouvé:', media.external_id, '→', id);
      return isNaN(id) ? null : id;
    }
    
    // Ancien format : tmdb_123 (pour rétrocompatibilité)
    const oldFormatMatch = media.external_id.match(/^tmdb_(\d+)$/);
    if (oldFormatMatch) {
      const id = parseInt(oldFormatMatch[1], 10);
      console.log('[extractTmdbId] External ID ancien format trouvé:', media.external_id, '→', id);
      return isNaN(id) ? null : id;
    }
  }
  
  // ATTENTION: Ne pas utiliser media.id car c'est l'ID local de la base, pas l'ID TMDB !
  // La transformation external_id -> tmdbId doit être faite dans le service API
  
  console.log('[extractTmdbId] Aucun ID TMDB trouvé');
  console.log('[extractTmdbId] ATTENTION: media.id =', media.id, 'ignoré car ID local de la base');
  return null;
};

// Helper pour formater la durée en heures et minutes
export const formatRuntime = (minutes: number): string => {
  if (!minutes) return '';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;
};

// Helper pour formater les notes
export const formatRating = (rating: number): string => {
  if (!rating) return '';
  return rating.toFixed(1);
};

// Helper pour formater les dates
export const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.getFullYear().toString();
};

// Helper pour formater les nombres avec séparateurs
export const formatNumber = (num: number): string => {
  if (!num) return '';
  return num.toLocaleString();
};

// Helper pour obtenir l'URL complète de l'image TMDB
export const getTmdbImageUrl = (path: string, size: 'w200' | 'w300' | 'w500' | 'w780' | 'w1280' | 'original' = 'w500'): string => {
  if (!path) return '';
  return `https://image.tmdb.org/t/p/${size}${path}`;
};

// Helper pour truncater le texte
export const truncateText = (text: string, maxLength: number): string => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
};

// Helper pour valider les URLs YouTube
export const isValidYouTubeUrl = (url: string): boolean => {
  const youtubeRegex = /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/.+/;
  return youtubeRegex.test(url);
};

// Helper pour obtenir l'URL d'embed YouTube
export const getYouTubeEmbedUrl = (videoKey: string): string => {
  return `https://www.youtube.com/embed/${videoKey}`;
};

// Helper pour obtenir l'URL de la miniature YouTube
export const getYouTubeThumbnailUrl = (videoKey: string, quality: 'default' | 'medium' | 'high' | 'standard' | 'maxres' = 'medium'): string => {
  return `https://img.youtube.com/vi/${videoKey}/${quality}default.jpg`;
};

// Type guards
export const isMedia = (item: any): item is Media => {
  return item && typeof item === 'object' && 'id' in item && 'title' in item;
};

export const isSearchResult = (item: any): item is SearchResult => {
  return item && typeof item === 'object' && 'title' in item && 'type' in item;
};
