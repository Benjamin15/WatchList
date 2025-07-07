import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LANGUAGE_STORAGE_KEY = '@WatchList:language';

export const useLanguage = () => {
  const { i18n } = useTranslation();
  const [isInitialized, setIsInitialized] = useState(false);

  // Charger la langue sauvegardée au démarrage
  useEffect(() => {
    loadSavedLanguage();
  }, []);

  const loadSavedLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (savedLanguage && savedLanguage !== i18n.language) {
        await i18n.changeLanguage(savedLanguage);
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la langue sauvegardée:', error);
    } finally {
      setIsInitialized(true);
    }
  };

  const changeLanguage = async (language: string) => {
    try {
      await i18n.changeLanguage(language);
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);
      console.log(`Langue changée vers: ${language}`);
    } catch (error) {
      console.error('Erreur lors du changement de langue:', error);
    }
  };

  const getCurrentLanguage = () => {
    return i18n.language;
  };

  const getAvailableLanguages = () => {
    return [
      { key: 'fr', label: '🇫🇷 Français' },
      { key: 'en', label: '🇺🇸 English' },
      { key: 'es', label: '🇪🇸 Español' },
      { key: 'pt', label: '🇧🇷 Português' },
    ];
  };

  return {
    currentLanguage: getCurrentLanguage(),
    changeLanguage,
    availableLanguages: getAvailableLanguages(),
    isInitialized,
  };
};
