/**
 * Text-to-Speech Service
 * Wrapper for Web Speech API to provide text-to-speech functionality
 */

/**
 * Check if the browser supports the Web Speech API
 * @returns {boolean} True if supported, false otherwise
 */
export function isTTSSupported() {
  return 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
}

/**
 * Get available voices from the browser
 * @returns {SpeechSynthesisVoice[]} Array of available voices
 */
export function getAvailableVoices() {
  if (!isTTSSupported()) {
    return [];
  }
  return window.speechSynthesis.getVoices();
}

/**
 * Select the best voice for kids (prefer clear, female voices in English)
 * @returns {SpeechSynthesisVoice|null} Selected voice or null
 */
export function selectBestVoice() {
  if (!isTTSSupported()) {
    return null;
  }

  const voices = getAvailableVoices();

  if (voices.length === 0) {
    return null;
  }

  // Prefer English voices
  const englishVoices = voices.filter(voice =>
    voice.lang.startsWith('en')
  );

  const voicesToSearch = englishVoices.length > 0 ? englishVoices : voices;

  // Look for kid-friendly voice names (Google UK English Female, Samantha, etc.)
  const preferredNames = [
    'Samantha',
    'Google UK English Female',
    'Microsoft Zira',
    'Google US English',
    'female',
  ];

  for (const preferredName of preferredNames) {
    const found = voicesToSearch.find(voice =>
      voice.name.toLowerCase().includes(preferredName.toLowerCase())
    );
    if (found) {
      return found;
    }
  }

  // If no preferred voice found, use the first English voice or any voice
  return voicesToSearch[0] || voices[0];
}

/**
 * Speak a word using text-to-speech
 * @param {string} word - The word to speak
 * @param {Object} options - Optional configuration
 * @param {number} options.rate - Speech rate (0.1 to 10, default 0.9 for kids)
 * @param {number} options.pitch - Speech pitch (0 to 2, default 1.1 for kids)
 * @param {number} options.volume - Speech volume (0 to 1, default 1)
 * @returns {Promise<void>} Resolves when speech is complete or fails
 */
export function speakWord(word, options = {}) {
  return new Promise((resolve, reject) => {
    if (!isTTSSupported()) {
      reject(new Error('Text-to-speech is not supported in this browser.'));
      return;
    }

    if (!word || typeof word !== 'string' || word.trim().length === 0) {
      reject(new Error('Invalid word provided.'));
      return;
    }

    // Stop any ongoing speech first
    stopSpeaking();

    // Create utterance
    const utterance = new SpeechSynthesisUtterance(word.trim());

    // Set voice
    const voice = selectBestVoice();
    if (voice) {
      utterance.voice = voice;
    }

    // Set speech parameters (kid-friendly: slightly slower, slightly higher pitch)
    utterance.rate = options.rate !== undefined ? options.rate : 0.9;
    utterance.pitch = options.pitch !== undefined ? options.pitch : 1.1;
    utterance.volume = options.volume !== undefined ? options.volume : 1;

    // Event handlers
    utterance.onend = () => {
      resolve();
    };

    utterance.onerror = (event) => {
      reject(new Error(`Speech synthesis error: ${event.error}`));
    };

    // Speak
    try {
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      reject(new Error(`Failed to speak: ${error.message}`));
    }
  });
}

/**
 * Stop any ongoing speech
 */
export function stopSpeaking() {
  if (isTTSSupported() && window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Check if speech is currently ongoing
 * @returns {boolean} True if speaking, false otherwise
 */
export function isSpeaking() {
  return isTTSSupported() && window.speechSynthesis.speaking;
}

/**
 * Initialize voices (needed for some browsers like Chrome)
 * Call this on app initialization to ensure voices are loaded
 * @returns {Promise<void>} Resolves when voices are loaded
 */
export function initializeVoices() {
  return new Promise((resolve) => {
    if (!isTTSSupported()) {
      resolve();
      return;
    }

    const voices = getAvailableVoices();
    if (voices.length > 0) {
      resolve();
      return;
    }

    // Some browsers load voices asynchronously
    const voicesChangedHandler = () => {
      window.speechSynthesis.removeEventListener('voiceschanged', voicesChangedHandler);
      resolve();
    };

    window.speechSynthesis.addEventListener('voiceschanged', voicesChangedHandler);

    // Fallback: resolve after a timeout even if voiceschanged doesn't fire
    setTimeout(() => {
      window.speechSynthesis.removeEventListener('voiceschanged', voicesChangedHandler);
      resolve();
    }, 1000);
  });
}
