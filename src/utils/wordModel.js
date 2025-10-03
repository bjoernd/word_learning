/**
 * Word Database Model
 * Defines data structures and validation logic for the word database
 */

/**
 * Default starter words for the initial database
 * Age-appropriate words for kids aged 8-12
 */
export const DEFAULT_WORDS = [
  'adventure',
  'beautiful',
  'celebrate',
  'dinosaur',
  'elephant',
  'fantastic',
  'guitar',
  'happiness',
  'island',
  'journey',
  'knowledge',
  'lightning',
  'mountain',
  'notebook',
  'ocean'
];

/**
 * Validates if a word is valid (non-empty and contains only alphabetic characters)
 * @param {string} word - The word to validate
 * @returns {boolean} - True if word is valid, false otherwise
 */
export function isValidWord(word) {
  if (!word || typeof word !== 'string') {
    return false;
  }

  const trimmedWord = word.trim();

  // Check if empty after trimming
  if (trimmedWord.length === 0) {
    return false;
  }

  // Check if contains only alphabetic characters (including spaces for multi-word phrases)
  // For simplicity, we'll only allow letters and no spaces for single words
  const alphabeticPattern = /^[a-zA-Z]+$/;
  return alphabeticPattern.test(trimmedWord);
}

/**
 * Checks if a word already exists in the word list (case-insensitive)
 * @param {string} word - The word to check
 * @param {string[]} wordList - The array of existing words
 * @returns {boolean} - True if word is a duplicate, false otherwise
 */
export function isDuplicate(word, wordList) {
  if (!word || !Array.isArray(wordList)) {
    return false;
  }

  const normalizedWord = word.trim().toLowerCase();

  return wordList.some(existingWord =>
    existingWord.toLowerCase() === normalizedWord
  );
}

/**
 * Selects a random word from the word list
 * @param {string[]} wordList - The array of words to select from
 * @param {string|null} excludeWord - Optional word to exclude from selection (to avoid repeats)
 * @returns {string|null} - A random word from the list, or null if list is empty
 */
export function getRandomWord(wordList, excludeWord = null) {
  if (!Array.isArray(wordList) || wordList.length === 0) {
    return null;
  }

  // If there's only one word, return it (even if it matches excludeWord)
  if (wordList.length === 1) {
    return wordList[0];
  }

  // Filter out the excluded word if provided
  let availableWords = wordList;
  if (excludeWord) {
    availableWords = wordList.filter(word =>
      word.toLowerCase() !== excludeWord.toLowerCase()
    );

    // If filtering removed all words, use the original list
    if (availableWords.length === 0) {
      availableWords = wordList;
    }
  }

  // Select random word
  const randomIndex = Math.floor(Math.random() * availableWords.length);
  return availableWords[randomIndex];
}
