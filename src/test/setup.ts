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
