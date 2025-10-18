// ABOUTME: Tests for error handling utilities
// ABOUTME: Verifies consistent error logging across the application

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { logError, handleAudioError } from './errorHandling';

describe('errorHandling', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  describe('logError', () => {
    it('should log error with context', () => {
      const error = new Error('Test error');
      logError('TestContext', error);

      expect(console.error).toHaveBeenCalledWith('[TestContext]', 'Test error', error);
    });

    it('should handle non-Error objects', () => {
      const error = 'String error';
      logError('TestContext', error);

      expect(console.error).toHaveBeenCalledWith('[TestContext]', 'String error', error);
    });

    it('should handle undefined errors', () => {
      logError('TestContext', undefined);

      expect(console.error).toHaveBeenCalledWith('[TestContext]', 'undefined', undefined);
    });

    it('should handle null errors', () => {
      logError('TestContext', null);

      expect(console.error).toHaveBeenCalledWith('[TestContext]', 'null', null);
    });

    it('should format context in brackets', () => {
      logError('Speech', new Error('Failed'));

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('[Speech]'),
        expect.any(String),
        expect.any(Error)
      );
    });
  });

  describe('handleAudioError', () => {
    it('should log audio errors with context', () => {
      const error = new Error('Audio failed');
      handleAudioError('SoundEffects', error);

      expect(console.warn).toHaveBeenCalledWith('[Audio:SoundEffects]', 'Audio failed', error);
    });

    it('should use warn level for audio errors', () => {
      handleAudioError('Speech', new Error('Failed'));

      expect(console.warn).toHaveBeenCalled();
      expect(console.error).not.toHaveBeenCalled();
    });

    it('should include Audio prefix in context', () => {
      handleAudioError('TestService', new Error('Failed'));

      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('[Audio:TestService]'),
        expect.any(String),
        expect.any(Error)
      );
    });

    it('should handle non-Error objects', () => {
      handleAudioError('TestService', 'String error');

      expect(console.warn).toHaveBeenCalledWith('[Audio:TestService]', 'String error', 'String error');
    });
  });
});
