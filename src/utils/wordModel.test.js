import { describe, it, expect } from 'vitest';
import { isValidWord, isDuplicate, getRandomWord, DEFAULT_WORDS } from './wordModel';

describe('wordModel', () => {
  describe('isValidWord', () => {
    it('should return true for valid alphabetic words', () => {
      expect(isValidWord('hello')).toBe(true);
      expect(isValidWord('World')).toBe(true);
      expect(isValidWord('UPPERCASE')).toBe(true);
      expect(isValidWord('MixedCase')).toBe(true);
    });

    it('should return false for empty or whitespace-only strings', () => {
      expect(isValidWord('')).toBe(false);
      expect(isValidWord('   ')).toBe(false);
      expect(isValidWord('\t')).toBe(false);
    });

    it('should return false for non-string inputs', () => {
      expect(isValidWord(null)).toBe(false);
      expect(isValidWord(undefined)).toBe(false);
      expect(isValidWord(123)).toBe(false);
      expect(isValidWord([])).toBe(false);
      expect(isValidWord({})).toBe(false);
    });

    it('should return false for strings with numbers', () => {
      expect(isValidWord('hello123')).toBe(false);
      expect(isValidWord('123')).toBe(false);
      expect(isValidWord('test1')).toBe(false);
    });

    it('should return false for strings with special characters', () => {
      expect(isValidWord('hello!')).toBe(false);
      expect(isValidWord('test@word')).toBe(false);
      expect(isValidWord('hello-world')).toBe(false);
      expect(isValidWord('test_word')).toBe(false);
    });

    it('should return false for strings with spaces', () => {
      expect(isValidWord('hello world')).toBe(false);
      expect(isValidWord('two words')).toBe(false);
    });

    it('should handle words with leading/trailing spaces', () => {
      expect(isValidWord('  hello  ')).toBe(true);
      expect(isValidWord('\tworld\t')).toBe(true);
    });
  });

  describe('isDuplicate', () => {
    const wordList = ['apple', 'banana', 'cherry', 'Date'];

    it('should return true for exact duplicates', () => {
      expect(isDuplicate('apple', wordList)).toBe(true);
      expect(isDuplicate('banana', wordList)).toBe(true);
    });

    it('should return true for case-insensitive duplicates', () => {
      expect(isDuplicate('APPLE', wordList)).toBe(true);
      expect(isDuplicate('Apple', wordList)).toBe(true);
      expect(isDuplicate('date', wordList)).toBe(true);
      expect(isDuplicate('DATE', wordList)).toBe(true);
    });

    it('should return false for non-duplicates', () => {
      expect(isDuplicate('grape', wordList)).toBe(false);
      expect(isDuplicate('orange', wordList)).toBe(false);
    });

    it('should return false for empty word list', () => {
      expect(isDuplicate('apple', [])).toBe(false);
    });

    it('should handle words with spaces by trimming', () => {
      expect(isDuplicate('  apple  ', wordList)).toBe(true);
      expect(isDuplicate('  grape  ', wordList)).toBe(false);
    });

    it('should handle invalid inputs gracefully', () => {
      expect(isDuplicate(null, wordList)).toBe(false);
      expect(isDuplicate(undefined, wordList)).toBe(false);
      expect(isDuplicate('apple', null)).toBe(false);
      expect(isDuplicate('apple', undefined)).toBe(false);
      expect(isDuplicate('apple', 'not-an-array')).toBe(false);
    });
  });

  describe('getRandomWord', () => {
    it('should return a word from the list', () => {
      const wordList = ['apple', 'banana', 'cherry'];
      const word = getRandomWord(wordList);
      expect(wordList).toContain(word);
    });

    it('should return null for empty array', () => {
      expect(getRandomWord([])).toBe(null);
    });

    it('should return null for invalid input', () => {
      expect(getRandomWord(null)).toBe(null);
      expect(getRandomWord(undefined)).toBe(null);
      expect(getRandomWord('not-an-array')).toBe(null);
    });

    it('should return the only word for single-word list', () => {
      const wordList = ['onlyword'];
      expect(getRandomWord(wordList)).toBe('onlyword');
    });

    it('should exclude specified word when possible', () => {
      const wordList = ['apple', 'banana', 'cherry'];
      const results = [];

      // Run multiple times to ensure excluded word is avoided
      for (let i = 0; i < 20; i++) {
        const word = getRandomWord(wordList, 'apple');
        results.push(word);
      }

      // At least some results should not be 'apple'
      // (statistically very likely with 20 iterations)
      const nonAppleResults = results.filter(w => w !== 'apple');
      expect(nonAppleResults.length).toBeGreaterThan(0);
    });

    it('should return the only word even if it matches excludeWord', () => {
      const wordList = ['onlyword'];
      expect(getRandomWord(wordList, 'onlyword')).toBe('onlyword');
    });

    it('should handle case-insensitive exclusion', () => {
      const wordList = ['apple', 'banana', 'cherry'];
      const results = [];

      for (let i = 0; i < 20; i++) {
        const word = getRandomWord(wordList, 'APPLE');
        results.push(word);
      }

      const nonAppleResults = results.filter(w => w.toLowerCase() !== 'apple');
      expect(nonAppleResults.length).toBeGreaterThan(0);
    });
  });

  describe('DEFAULT_WORDS', () => {
    it('should be an array', () => {
      expect(Array.isArray(DEFAULT_WORDS)).toBe(true);
    });

    it('should contain 10-15 words', () => {
      expect(DEFAULT_WORDS.length).toBeGreaterThanOrEqual(10);
      expect(DEFAULT_WORDS.length).toBeLessThanOrEqual(15);
    });

    it('should contain only valid words', () => {
      DEFAULT_WORDS.forEach(word => {
        expect(isValidWord(word)).toBe(true);
      });
    });

    it('should not contain duplicates', () => {
      const uniqueWords = new Set(DEFAULT_WORDS.map(w => w.toLowerCase()));
      expect(uniqueWords.size).toBe(DEFAULT_WORDS.length);
    });
  });
});
