// ABOUTME: Service for playing sound effects during practice sessions
// ABOUTME: Manages audio playback for start, success, failure, and summary sounds

export type SoundEffect = 'start' | 'good' | 'bad' | 'summary';

class SoundEffectsService {
  private audioElements: Map<SoundEffect, HTMLAudioElement> = new Map();

  constructor() {
    if (typeof window !== 'undefined') {
      this.preloadSounds();
    }
  }

  private preloadSounds(): void {
    const sounds: SoundEffect[] = ['start', 'good', 'bad', 'summary'];

    sounds.forEach(sound => {
      const audio = new Audio(`/sounds/${sound}.wav`);
      audio.preload = 'auto';
      this.audioElements.set(sound, audio);
    });
  }

  play(sound: SoundEffect): Promise<void> {
    return new Promise((resolve, reject) => {
      const audio = this.audioElements.get(sound);

      if (!audio) {
        reject(new Error(`Sound effect "${sound}" not found`));
        return;
      }

      audio.currentTime = 0;

      const playPromise = audio.play();

      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            audio.onended = () => resolve();
          })
          .catch((error) => {
            console.warn(`Failed to play sound effect "${sound}":`, error);
            resolve();
          });
      } else {
        resolve();
      }
    });
  }

  isSupported(): boolean {
    return typeof window !== 'undefined' && typeof Audio !== 'undefined';
  }
}

export const soundEffectsService = new SoundEffectsService();
