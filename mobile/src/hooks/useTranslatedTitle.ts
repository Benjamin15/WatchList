import { useState, useEffect } from 'react';
import { useLanguage } from './useLanguage';
import { getTranslatedTitle } from '../utils/translations';

/**
 * Hook personnalisé pour récupérer le titre traduit d'un média
 * @param tmdbId - ID TMDB du média
 * @param type - Type de média
 * @param fallbackTitle - Titre de fallback
 * @returns Titre traduit et état de chargement
 */
export const useTranslatedTitle = (
  tmdbId: number | undefined,
  type: 'movie' | 'series' | 'tv',
  fallbackTitle: string
) => {
  const { currentLanguage } = useLanguage();
  const [title, setTitle] = useState(fallbackTitle);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Si pas de TMDB ID ou si la langue est française (langue par défaut), 
    // utiliser le titre de fallback
    if (!tmdbId || currentLanguage === 'fr') {
      setTitle(fallbackTitle);
      return;
    }

    let mounted = true;
    setLoading(true);

    const fetchTranslatedTitle = async () => {
      try {
        const translatedTitle = await getTranslatedTitle(
          tmdbId,
          type,
          currentLanguage,
          fallbackTitle
        );
        
        if (mounted) {
          setTitle(translatedTitle);
        }
      } catch (error) {
        console.warn('Erreur lors de la récupération du titre traduit:', error);
        if (mounted) {
          setTitle(fallbackTitle);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchTranslatedTitle();

    return () => {
      mounted = false;
    };
  }, [tmdbId, type, fallbackTitle, currentLanguage]);

  return { title, loading };
};
