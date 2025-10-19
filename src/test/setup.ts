// ABOUTME: Test setup file for vitest configuration.
// ABOUTME: Imports jest-dom matchers and configures fake-indexeddb for database tests.
import '@testing-library/jest-dom';
import 'fake-indexeddb/auto';
import { vi } from 'vitest';

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
