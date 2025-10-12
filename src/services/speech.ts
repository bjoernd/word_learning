// ABOUTME: Service for text-to-speech synthesis
// ABOUTME: Wraps browser SpeechSynthesis API for speaking words aloud
export class SpeechService {
  private synthesis: SpeechSynthesis | undefined;

  constructor() {
    this.synthesis = typeof window !== 'undefined' ? window.speechSynthesis : undefined;
  }

  isSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  speak(text: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.isSupported() || !this.synthesis) {
        reject(new Error('Speech synthesis not supported'));
        return;
      }

      this.synthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;

      utterance.onend = () => resolve();
      utterance.onerror = (event) => reject(event);

      this.synthesis.speak(utterance);
    });
  }

  cancel(): void {
    if (this.synthesis) {
      this.synthesis.cancel();
    }
  }
}

export const speechService = new SpeechService();
