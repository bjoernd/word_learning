import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SpeechService } from './speech';

describe('SpeechService', () => {
  let service: SpeechService;
  let mockSpeak: ReturnType<typeof vi.fn>;
  let mockCancel: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockSpeak = vi.fn();
    mockCancel = vi.fn();

    global.speechSynthesis = {
      speak: mockSpeak,
      cancel: mockCancel,
    } as unknown as SpeechSynthesis;

    global.SpeechSynthesisUtterance = class MockUtterance {
      text: string;
      rate: number = 1;
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
    const speakPromise = service.speak('hello');

    expect(mockSpeak).toHaveBeenCalled();
    const utterance = mockSpeak.mock.calls[0][0] as SpeechSynthesisUtterance;
    expect(utterance.text).toBe('hello');

    utterance.onend?.({} as SpeechSynthesisEvent);
    await expect(speakPromise).resolves.toBeUndefined();
  });
});
