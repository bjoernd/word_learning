// ABOUTME: Service for text-to-speech synthesis
// ABOUTME: Wraps browser SpeechSynthesis API for speaking words aloud
export class SpeechService {
  private synthesis: SpeechSynthesis | undefined;
  private voices: SpeechSynthesisVoice[] = [];
  private voicesLoaded = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private currentText: string = '';
  private pendingTimeout: NodeJS.Timeout | null = null;

  constructor() {
    this.synthesis = typeof window !== 'undefined' ? window.speechSynthesis : undefined;
    if (this.synthesis) {
      this.loadVoices();
      if (typeof window !== 'undefined' && 'onvoiceschanged' in window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = () => {
          this.loadVoices();
        };
      }
    }
  }

  private loadVoices(): void {
    if (this.synthesis) {
      this.voices = this.synthesis.getVoices();
      this.voicesLoaded = this.voices.length > 0;
    }
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

      if (!this.voicesLoaded) {
        this.loadVoices();
      }

      if (this.currentText === text && (this.synthesis.speaking || this.synthesis.pending || this.pendingTimeout)) {
        resolve();
        return;
      }

      if (this.pendingTimeout) {
        clearTimeout(this.pendingTimeout);
        this.pendingTimeout = null;
      }

      if (this.synthesis.speaking) {
        this.synthesis.cancel();
        this.synthesis.pause();
        this.synthesis.resume();
        this.synthesis.cancel();
      }

      const needsCancel = this.synthesis.pending;
      if (needsCancel) {
        this.synthesis.cancel();
      }

      if (this.synthesis.paused) {
        this.synthesis.resume();
      }

      this.currentText = text;

      const speakUtterance = () => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.8;

        if (this.voices.length > 0) {
          const defaultVoice = this.voices.find(voice => voice.default) || this.voices[0];
          utterance.voice = defaultVoice;
        }

        utterance.onend = () => {
          if (this.currentUtterance === utterance) {
            this.currentUtterance = null;
            this.currentText = '';
          }
          this.pendingTimeout = null;
          resolve();
        };

        utterance.onerror = (event) => {
          if (this.currentUtterance === utterance) {
            this.currentUtterance = null;
            this.currentText = '';
          }
          this.pendingTimeout = null;
          if (event.error === 'canceled') {
            resolve();
          } else {
            reject(event);
          }
        };

        this.currentUtterance = utterance;
        this.pendingTimeout = null;
        this.synthesis!.speak(utterance);
      };

      const delay = needsCancel ? 200 : 0;
      this.pendingTimeout = setTimeout(speakUtterance, delay) as unknown as NodeJS.Timeout;
    });
  }

  cancel(): void {
    if (this.synthesis) {
      this.synthesis.cancel();
      this.currentUtterance = null;
    }
  }
}

export const speechService = new SpeechService();
