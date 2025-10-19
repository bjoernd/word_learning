// ABOUTME: TypeScript type definitions for i18n translation keys
// ABOUTME: Provides type safety and autocomplete for translation keys across the application

import type { Resource } from 'i18next';
import en from './locales/en/translation.json';

export type TranslationKeys = typeof en;
export type TranslationResource = Resource;

// Augment i18next module for type safety
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: {
      translation: TranslationKeys;
    };
  }
}
