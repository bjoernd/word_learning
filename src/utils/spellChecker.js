/**
 * Spell Checker Utility
 * Compares user input with correct spelling and identifies errors
 */

/**
 * Check spelling by comparing user input with the correct word
 * @param {string} userInput - The user's spelling attempt
 * @param {string} correctWord - The correct spelling of the word
 * @returns {Object} Result object with spelling check details
 *   - isCorrect: boolean - true if spelling is correct
 *   - userAnswer: string - the user's input (trimmed)
 *   - correctAnswer: string - the correct word
 *   - highlights: array - array of booleans where true = incorrect character
 */
export function checkSpelling(userInput, correctWord) {
  // Validate inputs
  if (typeof userInput !== 'string' || typeof correctWord !== 'string') {
    throw new Error('Both userInput and correctWord must be strings');
  }

  // Normalize inputs (trim and convert to lowercase for comparison)
  const userTrimmed = userInput.trim();
  const correctTrimmed = correctWord.trim();
  const userLower = userTrimmed.toLowerCase();
  const correctLower = correctTrimmed.toLowerCase();

  // Check if spelling is correct (case-insensitive)
  const isCorrect = userLower === correctLower;

  // Build highlights array showing which characters are incorrect
  const highlights = buildHighlights(userTrimmed, correctTrimmed);

  return {
    isCorrect,
    userAnswer: userTrimmed,
    correctAnswer: correctTrimmed,
    highlights,
  };
}

/**
 * Build an array of booleans indicating which characters are incorrect
 * @param {string} userWord - The user's spelling (normalized case)
 * @param {string} correctWord - The correct spelling (normalized case)
 * @returns {boolean[]} Array where true = incorrect character, false = correct
 */
function buildHighlights(userWord, correctWord) {
  const userLower = userWord.toLowerCase();
  const correctLower = correctWord.toLowerCase();
  const maxLength = Math.max(userWord.length, correctWord.length);
  const highlights = [];

  for (let i = 0; i < maxLength; i++) {
    const userChar = i < userWord.length ? userLower[i] : undefined;
    const correctChar = i < correctWord.length ? correctLower[i] : undefined;

    // If both characters exist and match, it's correct (false)
    // Otherwise it's incorrect (true)
    if (userChar === correctChar && userChar !== undefined) {
      highlights.push(false);
    } else {
      highlights.push(true);
    }
  }

  return highlights;
}
