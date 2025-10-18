// ABOUTME: Tests for useVoices hook
// ABOUTME: Verifies voice loading and filtering behavior
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useVoices } from './useVoices';
import { speechService } from '../services/speech';

vi.mock('../services/speech', () => ({
  speechService: {
    getVoices: vi.fn()
  }
}));

describe('useVoices', () => {
  const mockVoices: SpeechSynthesisVoice[] = [
    {
      name: 'English Voice',
      lang: 'en-US',
      voiceURI: 'en-US-voice',
      default: true,
      localService: true
    } as SpeechSynthesisVoice,
    {
      name: 'Spanish Voice',
      lang: 'es-ES',
      voiceURI: 'es-ES-voice',
      default: false,
      localService: true
    } as SpeechSynthesisVoice,
    {
      name: 'British Voice',
      lang: 'en-GB',
      voiceURI: 'en-GB-voice',
      default: false,
      localService: false
    } as SpeechSynthesisVoice
  ];

  beforeEach(() => {
    vi.mocked(speechService.getVoices).mockReturnValue(mockVoices);
    vi.stubGlobal('speechSynthesis', {
      onvoiceschanged: null
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should return all voices when no filter provided', () => {
    const { result } = renderHook(() => useVoices());
    expect(result.current).toEqual(mockVoices);
  });

  it('should filter voices when filter function provided', () => {
    const filterFn = (voice: SpeechSynthesisVoice) => voice.lang.startsWith('en');
    const { result } = renderHook(() => useVoices(filterFn));

    expect(result.current).toHaveLength(2);
    expect(result.current[0].lang).toBe('en-US');
    expect(result.current[1].lang).toBe('en-GB');
  });

  it('should return empty array when no voices available', () => {
    vi.mocked(speechService.getVoices).mockReturnValue([]);
    const { result } = renderHook(() => useVoices());
    expect(result.current).toHaveLength(0);
  });

  it('should apply filter correctly', () => {
    const filterFn = (voice: SpeechSynthesisVoice) => voice.localService;
    const { result } = renderHook(() => useVoices(filterFn));

    expect(result.current).toHaveLength(2);
    result.current.forEach(voice => {
      expect(voice.localService).toBe(true);
    });
  });

  it('should cleanup onvoiceschanged listener on unmount', () => {
    const { unmount } = renderHook(() => useVoices());
    expect(window.speechSynthesis.onvoiceschanged).not.toBeNull();
    unmount();
    expect(window.speechSynthesis.onvoiceschanged).toBeNull();
  });
});
