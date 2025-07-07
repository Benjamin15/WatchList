import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Importation des traductions
import fr from './locales/fr.json';
import en from './locales/en.json';
import es from './locales/es.json';
import pt from './locales/pt.json';

const resources = {
  fr: { translation: fr },
  en: { translation: en },
  es: { translation: es },
  pt: { translation: pt },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'fr', // langue par défaut
    fallbackLng: 'fr',
    interpolation: {
      escapeValue: false, // React échappe déjà par défaut
    },
    react: {
      useSuspense: false, // Important pour React Native
    },
  });

export default i18n;
