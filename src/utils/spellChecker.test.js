import { describe, it, expect } from 'vitest';
import { checkSpelling } from './spellChecker';

describe('spellChecker', () => {
  describe('checkSpelling', () => {
    describe('Correct Spelling', () => {
      it('identifies exact match as correct', () => {
        const result = checkSpelling('hello', 'hello');
        expect(result.isCorrect).toBe(true);
        expect(result.userAnswer).toBe('hello');
        expect(result.correctAnswer).toBe('hello');
        expect(result.highlights).toEqual([false, false, false, false, false]);
      });

      it('identifies match with different case as correct', () => {
        const result = checkSpelling('Hello', 'hello');
        expect(result.isCorrect).toBe(true);
        expect(result.userAnswer).toBe('Hello');
        expect(result.correctAnswer).toBe('hello');
        expect(result.highlights).toEqual([false, false, false, false, false]);
      });

      it('identifies uppercase input as correct', () => {
        const result = checkSpelling('HELLO', 'hello');
        expect(result.isCorrect).toBe(true);
        expect(result.userAnswer).toBe('HELLO');
        expect(result.correctAnswer).toBe('hello');
        expect(result.highlights).toEqual([false, false, false, false, false]);
      });

      it('identifies mixed case input as correct', () => {
        const result = checkSpelling('HeLLo', 'hello');
        expect(result.isCorrect).toBe(true);
        expect(result.userAnswer).toBe('HeLLo');
        expect(result.correctAnswer).toBe('hello');
      });

      it('trims whitespace and identifies as correct', () => {
        const result = checkSpelling('  hello  ', 'hello');
        expect(result.isCorrect).toBe(true);
        expect(result.userAnswer).toBe('hello');
        expect(result.correctAnswer).toBe('hello');
      });
    });

    describe('Incorrect Spelling', () => {
      it('identifies completely different word as incorrect', () => {
        const result = checkSpelling('world', 'hello');
        expect(result.isCorrect).toBe(false);
        expect(result.userAnswer).toBe('world');
        expect(result.correctAnswer).toBe('hello');
        // w o r l d
        // h e l l o
        // T T T F T (position 3 has same letter 'l')
        expect(result.highlights).toEqual([true, true, true, false, true]);
      });

      it('identifies single character mistake', () => {
        const result = checkSpelling('hallo', 'hello');
        expect(result.isCorrect).toBe(false);
        expect(result.userAnswer).toBe('hallo');
        expect(result.correctAnswer).toBe('hello');
        expect(result.highlights).toEqual([false, true, false, false, false]);
      });

      it('identifies multiple character mistakes', () => {
        const result = checkSpelling('hxllx', 'hello');
        expect(result.isCorrect).toBe(false);
        expect(result.highlights).toEqual([false, true, false, false, true]);
      });

      it('identifies mistake at the beginning', () => {
        const result = checkSpelling('jello', 'hello');
        expect(result.isCorrect).toBe(false);
        expect(result.highlights).toEqual([true, false, false, false, false]);
      });

      it('identifies mistake at the end', () => {
        const result = checkSpelling('helly', 'hello');
        expect(result.isCorrect).toBe(false);
        expect(result.highlights).toEqual([false, false, false, false, true]);
      });
    });

    describe('Different Lengths', () => {
      it('handles user input shorter than correct word', () => {
        const result = checkSpelling('hel', 'hello');
        expect(result.isCorrect).toBe(false);
        expect(result.userAnswer).toBe('hel');
        expect(result.correctAnswer).toBe('hello');
        // User typed: h e l
        // Correct:    h e l l o
        // Highlights: F F F T T (last 2 are missing)
        expect(result.highlights).toEqual([false, false, false, true, true]);
      });

      it('handles user input longer than correct word', () => {
        const result = checkSpelling('helloo', 'hello');
        expect(result.isCorrect).toBe(false);
        expect(result.userAnswer).toBe('helloo');
        expect(result.correctAnswer).toBe('hello');
        // User typed: h e l l o o
        // Correct:    h e l l o
        // Highlights: F F F F F T (last char is extra)
        expect(result.highlights).toEqual([false, false, false, false, false, true]);
      });

      it('handles much shorter input', () => {
        const result = checkSpelling('h', 'hello');
        expect(result.isCorrect).toBe(false);
        expect(result.highlights).toEqual([false, true, true, true, true]);
      });

      it('handles much longer input', () => {
        const result = checkSpelling('helloworld', 'hello');
        expect(result.isCorrect).toBe(false);
        expect(result.highlights).toEqual([
          false, false, false, false, false,
          true, true, true, true, true
        ]);
      });

      it('handles empty user input', () => {
        const result = checkSpelling('', 'hello');
        expect(result.isCorrect).toBe(false);
        expect(result.userAnswer).toBe('');
        expect(result.correctAnswer).toBe('hello');
        expect(result.highlights).toEqual([true, true, true, true, true]);
      });
    });

    describe('Edge Cases', () => {
      it('handles single character words - correct', () => {
        const result = checkSpelling('a', 'a');
        expect(result.isCorrect).toBe(true);
        expect(result.highlights).toEqual([false]);
      });

      it('handles single character words - incorrect', () => {
        const result = checkSpelling('b', 'a');
        expect(result.isCorrect).toBe(false);
        expect(result.highlights).toEqual([true]);
      });

      it('handles long words correctly', () => {
        const word = 'encyclopedia';
        const result = checkSpelling(word, word);
        expect(result.isCorrect).toBe(true);
      });

      it('handles long words with error', () => {
        const result = checkSpelling('encyclapedia', 'encyclopedia');
        expect(result.isCorrect).toBe(false);
      });

      it('preserves original case in userAnswer', () => {
        const result = checkSpelling('HeLLo', 'hello');
        expect(result.userAnswer).toBe('HeLLo');
        expect(result.correctAnswer).toBe('hello');
      });

      it('preserves original case in correctAnswer', () => {
        const result = checkSpelling('hello', 'Hello');
        expect(result.userAnswer).toBe('hello');
        expect(result.correctAnswer).toBe('Hello');
      });
    });

    describe('Input Validation', () => {
      it('throws error for non-string userInput', () => {
        expect(() => checkSpelling(123, 'hello')).toThrow('Both userInput and correctWord must be strings');
      });

      it('throws error for non-string correctWord', () => {
        expect(() => checkSpelling('hello', 123)).toThrow('Both userInput and correctWord must be strings');
      });

      it('throws error for null userInput', () => {
        expect(() => checkSpelling(null, 'hello')).toThrow('Both userInput and correctWord must be strings');
      });

      it('throws error for undefined userInput', () => {
        expect(() => checkSpelling(undefined, 'hello')).toThrow('Both userInput and correctWord must be strings');
      });
    });

    describe('Return Structure', () => {
      it('returns object with all required properties', () => {
        const result = checkSpelling('test', 'test');
        expect(result).toHaveProperty('isCorrect');
        expect(result).toHaveProperty('userAnswer');
        expect(result).toHaveProperty('correctAnswer');
        expect(result).toHaveProperty('highlights');
      });

      it('returns boolean for isCorrect', () => {
        const result = checkSpelling('test', 'test');
        expect(typeof result.isCorrect).toBe('boolean');
      });

      it('returns string for userAnswer', () => {
        const result = checkSpelling('test', 'test');
        expect(typeof result.userAnswer).toBe('string');
      });

      it('returns string for correctAnswer', () => {
        const result = checkSpelling('test', 'test');
        expect(typeof result.correctAnswer).toBe('string');
      });

      it('returns array for highlights', () => {
        const result = checkSpelling('test', 'test');
        expect(Array.isArray(result.highlights)).toBe(true);
      });

      it('highlights array contains only booleans', () => {
        const result = checkSpelling('test', 'test');
        result.highlights.forEach(item => {
          expect(typeof item).toBe('boolean');
        });
      });
    });
  });
});
