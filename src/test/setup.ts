// ABOUTME: Test setup file for vitest configuration.
// ABOUTME: Imports jest-dom matchers, configures fake-indexeddb for database tests, and initializes i18n.
import '@testing-library/jest-dom';
import 'fake-indexeddb/auto';
import { vi } from 'vitest';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import translationEN from '../i18n/locales/en/translation.json';

// Initialize i18n for tests
i18n
  .use(initReactI18next)
  .init({
    lng: 'en',
    fallbackLng: 'en',
    resources: {
      en: { translation: translationEN }
    },
    interpolation: {
      escapeValue: false,
    },
  });

class MockAudioElement {
  public preload = 'auto';
  public currentTime = 0;
  public onended: (() => void) | null = null;

  play(): Promise<void> {
    return Promise.resolve();
  }
}

global.Audio = MockAudioElement as unknown as typeof Audio;

vi.mock('lottie-web', () => ({
  default: {
    loadAnimation: () => ({
      destroy: () => {},
      addEventListener: () => {},
      play: () => {},
    }),
  },
}));

// Mock localStorage to return English as the default language for tests
const localStorageMock: { [key: string]: string } = {
  'userLanguage': 'en'
};

global.Storage.prototype.getItem = vi.fn((key: string) => localStorageMock[key] || null);
global.Storage.prototype.setItem = vi.fn((key: string, value: string) => {
  localStorageMock[key] = value;
});
global.Storage.prototype.removeItem = vi.fn((key: string) => {
  delete localStorageMock[key];
});
global.Storage.prototype.clear = vi.fn(() => {
  for (const key in localStorageMock) {
    delete localStorageMock[key];
  }
});
