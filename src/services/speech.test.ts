import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SpeechService } from './speech';

describe('SpeechService', () => {
  let service: SpeechService;
  let mockSpeak: ReturnType<typeof vi.fn>;
  let mockCancel: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockSpeak = vi.fn();
    mockCancel = vi.fn();
    const mockGetVoices = vi.fn(() => []);

    global.speechSynthesis = {
      speak: mockSpeak,
      cancel: mockCancel,
      getVoices: mockGetVoices,
      onvoiceschanged: null,
    } as unknown as SpeechSynthesis;

    global.SpeechSynthesisUtterance = class MockUtterance {
      text: string;
      rate: number = 1;
      voice: SpeechSynthesisVoice | null = null;
      onend: ((event: Event) => void) | null = null;
      onerror: ((event: Event) => void) | null = null;

      constructor(text: string) {
        this.text = text;
      }
    } as unknown as typeof SpeechSynthesisUtterance;

    service = new SpeechService();
  });

  it('should check if speech synthesis is supported', () => {
    expect(service.isSupported()).toBe(true);
  });

  it('should cancel ongoing speech', () => {
    service.cancel();
    expect(mockCancel).toHaveBeenCalled();
  });

  it('should call speechSynthesis.speak', async () => {
    vi.useFakeTimers();
    const speakPromise = service.speak('hello');

    expect(mockSpeak).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(100);

    expect(mockSpeak).toHaveBeenCalled();
    const utterance = mockSpeak.mock.calls[0][0] as SpeechSynthesisUtterance;
    expect(utterance.text).toBe('hello');

    utterance.onend?.({} as SpeechSynthesisEvent);
    await expect(speakPromise).resolves.toBeUndefined();

    vi.useRealTimers();
  });

  it('should handle cancellation when speech is pending', async () => {
    Object.defineProperty(global.speechSynthesis, 'pending', {
      get: vi.fn(() => true),
      configurable: true
    });

    vi.useFakeTimers();
    const speakPromise = service.speak('test');

    expect(mockCancel).toHaveBeenCalled();
    expect(mockSpeak).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(200);

    expect(mockSpeak).toHaveBeenCalled();
    const utterance = mockSpeak.mock.calls[0][0] as SpeechSynthesisUtterance;
    expect(utterance.text).toBe('test');

    utterance.onend?.({} as SpeechSynthesisEvent);
    await expect(speakPromise).resolves.toBeUndefined();

    vi.useRealTimers();
  });

  it('should ignore duplicate calls for the same text', async () => {
    Object.defineProperty(global.speechSynthesis, 'speaking', {
      get: vi.fn(() => true),
      configurable: true
    });

    service['currentText'] = 'duplicate';

    const speakPromise = service.speak('duplicate');

    expect(mockSpeak).not.toHaveBeenCalled();
    await expect(speakPromise).resolves.toBeUndefined();
  });
});
