/**
 * localStorage Service for Word Learning App
 * Handles all localStorage operations for words and scores
 */

const STORAGE_KEYS = {
  WORDS: 'wordLearning_words',
  SCORE: 'wordLearning_score',
};

/**
 * Get words from localStorage
 * @returns {string[]} Array of word strings, empty array if none found or on error
 */
export function getWords() {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.WORDS);
    if (!stored) {
      return [];
    }
    const parsed = JSON.parse(stored);
    // Validate that we got an array
    if (!Array.isArray(parsed)) {
      console.warn('Stored words data is not an array, returning empty array');
      return [];
    }
    return parsed;
  } catch (error) {
    console.error('Error reading words from localStorage:', error);
    return [];
  }
}

/**
 * Save words to localStorage
 * @param {string[]} words - Array of word strings to save
 * @returns {boolean} True if successful, false on error
 */
export function saveWords(words) {
  try {
    if (!Array.isArray(words)) {
      console.error('saveWords: Expected array, got', typeof words);
      return false;
    }
    localStorage.setItem(STORAGE_KEYS.WORDS, JSON.stringify(words));
    return true;
  } catch (error) {
    console.error('Error saving words to localStorage:', error);
    // Handle quota exceeded error
    if (error.name === 'QuotaExceededError') {
      console.error('localStorage quota exceeded');
    }
    return false;
  }
}

/**
 * Get current score from localStorage
 * @returns {number} Current score, 0 if none found or on error
 */
export function getScore() {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.SCORE);
    if (!stored) {
      return 0;
    }
    const parsed = parseInt(stored, 10);
    // Validate that we got a valid number
    if (isNaN(parsed)) {
      console.warn('Stored score is not a valid number, returning 0');
      return 0;
    }
    return parsed;
  } catch (error) {
    console.error('Error reading score from localStorage:', error);
    return 0;
  }
}

/**
 * Save score to localStorage
 * @param {number} score - Score value to save
 * @returns {boolean} True if successful, false on error
 */
export function saveScore(score) {
  try {
    if (typeof score !== 'number' || isNaN(score)) {
      console.error('saveScore: Expected number, got', typeof score);
      return false;
    }
    localStorage.setItem(STORAGE_KEYS.SCORE, score.toString());
    return true;
  } catch (error) {
    console.error('Error saving score to localStorage:', error);
    return false;
  }
}

/**
 * Reset score to 0
 * @returns {boolean} True if successful, false on error
 */
export function resetScore() {
  try {
    localStorage.setItem(STORAGE_KEYS.SCORE, '0');
    return true;
  } catch (error) {
    console.error('Error resetting score in localStorage:', error);
    return false;
  }
}

/**
 * Clear all app data from localStorage (useful for testing/debugging)
 * @returns {boolean} True if successful, false on error
 */
export function clearAllData() {
  try {
    localStorage.removeItem(STORAGE_KEYS.WORDS);
    localStorage.removeItem(STORAGE_KEYS.SCORE);
    return true;
  } catch (error) {
    console.error('Error clearing localStorage:', error);
    return false;
  }
}
