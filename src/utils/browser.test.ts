// ABOUTME: Tests for browser environment detection utility
// ABOUTME: Validates isBrowser() returns correct value in different environments

import { describe, it, expect } from 'vitest';
import { isBrowser } from './browser';

describe('isBrowser', () => {
  it('should return true in browser environment', () => {
    // In jsdom environment (test setup), window should be defined
    expect(isBrowser()).toBe(true);
  });

  it('should return false when window is undefined', () => {
    // Save original window
    const originalWindow = global.window;

    // Temporarily remove window to simulate non-browser environment
    // @ts-expect-error - Intentionally deleting window for testing
    delete global.window;

    expect(isBrowser()).toBe(false);

    // Restore window
    global.window = originalWindow;
  });
});
