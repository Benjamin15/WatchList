/**
 * Mapping des codes de langue de l'app vers les codes TMDB
 */
const languageMapping: Record<string, string> = {
  'fr': 'fr-FR',
  'en': 'en-US',
  'es': 'es-ES',
  'pt': 'pt-BR'
};

/**
 * Convertit un code de langue de l'app vers le format TMDB
 * @param {string} appLanguage - Code de langue de l'app (fr, en, es, pt)
 * @returns {string} Code de langue TMDB (fr-FR, en-US, etc.)
 */
export const getLanguageForTMDB = (appLanguage: string): string => {
  return languageMapping[appLanguage] || 'fr-FR';
};

/**
 * Traduit les données de statut selon la langue
 */
export const translateStatus = (status: string, language: string): string => {
  const statusTranslations: Record<string, Record<string, string>> = {
    'fr': {
      'a_voir': 'À voir',
      'en_cours': 'En cours',
      'vu': 'Vu',
      'abandonne': 'Abandonné',
      'en_attente': 'En attente'
    },
    'en': {
      'a_voir': 'To watch',
      'en_cours': 'Watching',
      'vu': 'Watched',
      'abandonne': 'Dropped',
      'en_attente': 'On hold'
    },
    'es': {
      'a_voir': 'Por ver',
      'en_cours': 'Viendo',
      'vu': 'Visto',
      'abandonne': 'Abandonado',
      'en_attente': 'En espera'
    },
    'pt': {
      'a_voir': 'Para assistir',
      'en_cours': 'Assistindo',
      'vu': 'Assistido',
      'abandonne': 'Abandonado',
      'en_attente': 'Em espera'
    }
  };

  return statusTranslations[language]?.[status] || statusTranslations['fr']?.[status] || status;
};

/**
 * Traduit les types de média selon la langue
 */
export const translateMediaType = (type: string, language: string): string => {
  const typeTranslations: Record<string, Record<string, string>> = {
    'fr': {
      'movie': 'Film',
      'tv': 'Série',
      'manga': 'Manga'
    },
    'en': {
      'movie': 'Movie',
      'tv': 'TV Show',
      'manga': 'Manga'
    },
    'es': {
      'movie': 'Película',
      'tv': 'Serie',
      'manga': 'Manga'
    },
    'pt': {
      'movie': 'Filme',
      'tv': 'Série',
      'manga': 'Mangá'
    }
  };

  return typeTranslations[language]?.[type] || typeTranslations['fr']?.[type] || type;
};

/**
 * Cache pour les titres traduits afin d'éviter les appels API répétés
 */
const translatedTitlesCache = new Map<string, { title: string; timestamp: number }>();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

/**
 * Récupère le titre traduit d'un média via son TMDB ID
 * @param {number | string | undefined} tmdbId - ID TMDB du média (peut être un numéro ou une chaîne avec préfixe)
 * @param {'movie' | 'series' | 'tv'} type - Type de média
 * @param {string} language - Code de langue (fr, en, es, pt)
 * @param {string} fallbackTitle - Titre de fallback si la traduction échoue
 * @returns {Promise<string>} Titre traduit ou titre de fallback
 */
export const getTranslatedTitle = async (
  tmdbId: number | string | undefined,
  type: 'movie' | 'series' | 'tv',
  language: string,
  fallbackTitle: string
): Promise<string> => {
  // Si pas de TMDB ID, retourner le titre de fallback
  if (!tmdbId) {
    return fallbackTitle;
  }

  // Extraire le numéro du TMDB ID si c'est une chaîne avec préfixe
  let cleanTmdbId: number;
  if (typeof tmdbId === 'string') {
    // Extraire le numéro de formats comme "tmdb_tv_69629" ou "tmdb_movie_12345"
    const match = tmdbId.match(/(\d+)$/);
    if (match) {
      cleanTmdbId = parseInt(match[1], 10);
    } else {
      console.warn(`Format TMDB ID invalide: ${tmdbId}`);
      return fallbackTitle;
    }
  } else {
    cleanTmdbId = tmdbId;
  }

  // Normaliser le type pour TMDB
  const tmdbType = type === 'tv' ? 'series' : type;
  
  // Créer une clé unique pour le cache
  const cacheKey = `${cleanTmdbId}-${tmdbType}-${language}`;
  
  // Vérifier le cache
  const cached = translatedTitlesCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.title;
  }

  try {
    // Importer dynamiquement l'API service pour éviter les dépendances circulaires
    const { apiService } = await import('../services/api');
    
    // Récupérer les détails traduits depuis TMDB
    const details = await apiService.getMediaDetailsFromTMDB(cleanTmdbId, tmdbType);
    const translatedTitle = details.title || fallbackTitle;
    
    // Mettre en cache le résultat
    translatedTitlesCache.set(cacheKey, {
      title: translatedTitle,
      timestamp: Date.now()
    });
    
    return translatedTitle;
  } catch (error) {
    console.warn(`Erreur lors de la récupération du titre traduit pour TMDB ID ${cleanTmdbId}:`, error);
    return fallbackTitle;
  }
};

/**
 * Nettoie le cache des titres traduits (utile pour libérer la mémoire)
 */
export const clearTranslatedTitlesCache = (): void => {
  translatedTitlesCache.clear();
};
