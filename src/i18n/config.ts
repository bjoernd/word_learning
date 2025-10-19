// ABOUTME: i18next configuration for internationalization support
// ABOUTME: Manages language detection from localStorage and resource loading

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslations from './locales/en/translation.json';
import deTranslations from './locales/de/translation.json';

const STORAGE_KEY = 'userLanguage';
const DEFAULT_LANGUAGE = 'de';
const FALLBACK_LANGUAGE = 'en';

// Get stored language preference or use default
const getStoredLanguage = (): string => {
  if (typeof window === 'undefined') {
    return DEFAULT_LANGUAGE;
  }
  return localStorage.getItem(STORAGE_KEY) || DEFAULT_LANGUAGE;
};

// Save language preference to localStorage
const saveLanguage = (language: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, language);
  }
};

i18n
  .use(initReactI18next)
  .init({
    lng: getStoredLanguage(),
    fallbackLng: FALLBACK_LANGUAGE,
    debug: false,

    interpolation: {
      escapeValue: false, // React already escapes values
    },

    resources: {
      en: {
        translation: enTranslations,
      },
      de: {
        translation: deTranslations,
      },
    },
  });

// Save language to localStorage when it changes
i18n.on('languageChanged', (lng) => {
  saveLanguage(lng);
});

export default i18n;
