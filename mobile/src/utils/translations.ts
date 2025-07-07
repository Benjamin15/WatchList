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
