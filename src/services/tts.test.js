import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  isTTSSupported,
  getAvailableVoices,
  selectBestVoice,
  speakWord,
  stopSpeaking,
  isSpeaking,
  initializeVoices,
} from './tts';
import { createMockSpeechSynthesis, cleanupMockSpeechSynthesis, createMockVoices } from '../test/testUtils';

describe('TTS Service', () => {
  let mockSpeechSynthesis;
  let mockUtterance;
  let mockVoices;

  beforeEach(() => {
    mockVoices = createMockVoices();
    const mocks = createMockSpeechSynthesis(mockVoices);
    mockSpeechSynthesis = mocks.mockSpeechSynthesis;
    mockUtterance = mocks.mockUtterance;
  });

  afterEach(() => {
    vi.clearAllMocks();
    cleanupMockSpeechSynthesis();
  });

  describe('isTTSSupported', () => {
    it('returns true when TTS is supported', () => {
      expect(isTTSSupported()).toBe(true);
    });

    it('returns false when speechSynthesis is not available', () => {
      delete global.window.speechSynthesis;
      expect(isTTSSupported()).toBe(false);
    });

    it('returns false when SpeechSynthesisUtterance is not available', () => {
      delete global.SpeechSynthesisUtterance;
      expect(isTTSSupported()).toBe(false);
    });
  });

  describe('getAvailableVoices', () => {
    it('returns array of voices when supported', () => {
      const voices = getAvailableVoices();
      expect(voices).toEqual(mockVoices);
      expect(mockSpeechSynthesis.getVoices).toHaveBeenCalled();
    });

    it('returns empty array when TTS is not supported', () => {
      delete global.window.speechSynthesis;
      const voices = getAvailableVoices();
      expect(voices).toEqual([]);
    });
  });

  describe('selectBestVoice', () => {
    it('selects Samantha voice when available', () => {
      const voice = selectBestVoice();
      expect(voice.name).toBe('Samantha');
    });

    it('selects Google UK English Female when Samantha is not available', () => {
      mockVoices = [
        { name: 'Google US English', lang: 'en-US' },
        { name: 'Google UK English Female', lang: 'en-GB' },
        { name: 'French Voice', lang: 'fr-FR' },
      ];
      mockSpeechSynthesis.getVoices.mockReturnValue(mockVoices);

      const voice = selectBestVoice();
      expect(voice.name).toBe('Google UK English Female');
    });

    it('prefers English voices over other languages', () => {
      mockVoices = [
        { name: 'French Voice', lang: 'fr-FR' },
        { name: 'Spanish Voice', lang: 'es-ES' },
        { name: 'Google US English', lang: 'en-US' },
      ];
      mockSpeechSynthesis.getVoices.mockReturnValue(mockVoices);

      const voice = selectBestVoice();
      expect(voice.lang).toContain('en');
    });

    it('returns first available voice when no preferred voices exist', () => {
      mockVoices = [
        { name: 'Random Voice', lang: 'xx-XX' },
        { name: 'Another Voice', lang: 'yy-YY' },
      ];
      mockSpeechSynthesis.getVoices.mockReturnValue(mockVoices);

      const voice = selectBestVoice();
      expect(voice).toBe(mockVoices[0]);
    });

    it('returns null when no voices are available', () => {
      mockSpeechSynthesis.getVoices.mockReturnValue([]);

      const voice = selectBestVoice();
      expect(voice).toBe(null);
    });

    it('returns null when TTS is not supported', () => {
      delete global.window.speechSynthesis;

      const voice = selectBestVoice();
      expect(voice).toBe(null);
    });
  });

  describe('speakWord', () => {
    it('speaks the provided word successfully', async () => {
      await speakWord('hello');

      expect(mockSpeechSynthesis.speak).toHaveBeenCalled();
      // The implementation adds '... ' prefix to prevent audio clipping
      expect(mockUtterance.text).toBe('... hello');
    });

    it('uses kid-friendly default settings', async () => {
      await speakWord('hello');

      expect(mockUtterance.rate).toBe(0.9);
      expect(mockUtterance.pitch).toBe(1.1);
      expect(mockUtterance.volume).toBe(1);
    });

    it('accepts custom rate, pitch, and volume', async () => {
      await speakWord('hello', { rate: 1.2, pitch: 1.5, volume: 0.8 });

      expect(mockUtterance.rate).toBe(1.2);
      expect(mockUtterance.pitch).toBe(1.5);
      expect(mockUtterance.volume).toBe(0.8);
    });

    it('selects the best voice', async () => {
      await speakWord('hello');

      expect(mockUtterance.voice).toBeTruthy();
      expect(mockUtterance.voice.name).toBe('Samantha');
    });

    it('trims whitespace from word', async () => {
      await speakWord('  hello  ');

      // The implementation adds '... ' prefix to prevent audio clipping
      expect(mockUtterance.text).toBe('... hello');
    });

    it('rejects when TTS is not supported', async () => {
      delete global.window.speechSynthesis;

      await expect(speakWord('hello')).rejects.toThrow(
        'Text-to-speech is not supported in this browser.'
      );
    });

    it('rejects when word is empty', async () => {
      await expect(speakWord('')).rejects.toThrow('Invalid word provided.');
    });

    it('rejects when word is whitespace only', async () => {
      await expect(speakWord('   ')).rejects.toThrow('Invalid word provided.');
    });

    it('rejects when word is not a string', async () => {
      await expect(speakWord(123)).rejects.toThrow('Invalid word provided.');
    });

    it('rejects when word is null', async () => {
      await expect(speakWord(null)).rejects.toThrow('Invalid word provided.');
    });

    it('stops ongoing speech before speaking new word', async () => {
      mockSpeechSynthesis.speaking = true;

      await speakWord('hello');

      expect(mockSpeechSynthesis.cancel).toHaveBeenCalled();
    });

    it('rejects when speech synthesis throws error', async () => {
      mockSpeechSynthesis.speak.mockImplementation((utterance) => {
        if (utterance.onerror) {
          utterance.onerror({ error: 'synthesis-failed' });
        }
      });

      await expect(speakWord('hello')).rejects.toThrow('Speech synthesis error');
    });

    it('rejects when speak throws exception', async () => {
      mockSpeechSynthesis.speak.mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      await expect(speakWord('hello')).rejects.toThrow('Failed to speak');
    });
  });

  describe('stopSpeaking', () => {
    it('cancels ongoing speech', () => {
      mockSpeechSynthesis.speaking = true;

      stopSpeaking();

      expect(mockSpeechSynthesis.cancel).toHaveBeenCalled();
    });

    it('does nothing when not speaking', () => {
      mockSpeechSynthesis.speaking = false;

      stopSpeaking();

      expect(mockSpeechSynthesis.cancel).not.toHaveBeenCalled();
    });

    it('does nothing when TTS is not supported', () => {
      delete global.window.speechSynthesis;

      // Should not throw
      expect(() => stopSpeaking()).not.toThrow();
    });
  });

  describe('isSpeaking', () => {
    it('returns true when speaking', () => {
      mockSpeechSynthesis.speaking = true;

      expect(isSpeaking()).toBe(true);
    });

    it('returns false when not speaking', () => {
      mockSpeechSynthesis.speaking = false;

      expect(isSpeaking()).toBe(false);
    });

    it('returns false when TTS is not supported', () => {
      delete global.window.speechSynthesis;

      expect(isSpeaking()).toBe(false);
    });
  });

  describe('initializeVoices', () => {
    it('resolves immediately when voices are already loaded', async () => {
      await initializeVoices();

      expect(mockSpeechSynthesis.getVoices).toHaveBeenCalled();
    });

    it('resolves immediately when TTS is not supported', async () => {
      delete global.window.speechSynthesis;

      await expect(initializeVoices()).resolves.toBeUndefined();
    });

    it('waits for voiceschanged event when voices not loaded initially', async () => {
      mockSpeechSynthesis.getVoices.mockReturnValueOnce([]);

      const promise = initializeVoices();

      expect(mockSpeechSynthesis.addEventListener).toHaveBeenCalledWith(
        'voiceschanged',
        expect.any(Function)
      );

      // Simulate voiceschanged event
      const handler = mockSpeechSynthesis.addEventListener.mock.calls[0][1];
      handler();

      await promise;

      expect(mockSpeechSynthesis.removeEventListener).toHaveBeenCalled();
    });

    it('resolves after timeout if voiceschanged never fires', async () => {
      vi.useFakeTimers();
      mockSpeechSynthesis.getVoices.mockReturnValue([]);

      const promise = initializeVoices();

      // Fast-forward time
      vi.advanceTimersByTime(1000);

      await promise;

      expect(mockSpeechSynthesis.removeEventListener).toHaveBeenCalled();

      vi.useRealTimers();
    });
  });
});
