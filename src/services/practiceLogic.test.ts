import { describe, it, expect } from 'vitest';
import { isAnswerCorrect, calculateScore, compareAnswers } from './practiceLogic';
import { PracticeWord } from '../types';

describe('Practice Logic', () => {
  describe('isAnswerCorrect', () => {
    it('should match case-insensitively', () => {
      expect(isAnswerCorrect('Apple', 'apple')).toBe(true);
      expect(isAnswerCorrect('HELLO', 'hello')).toBe(true);
    });

    it('should detect incorrect answers', () => {
      expect(isAnswerCorrect('apple', 'aple')).toBe(false);
      expect(isAnswerCorrect('test', 'fest')).toBe(false);
    });

    it('should handle empty strings', () => {
      expect(isAnswerCorrect('', '')).toBe(true);
      expect(isAnswerCorrect('word', '')).toBe(false);
    });
  });

  describe('calculateScore', () => {
    it('should count correct answers', () => {
      const answers: PracticeWord[] = [
        { word: { word: 'test' }, userAnswer: 'test', isCorrect: true },
        { word: { word: 'test2' }, userAnswer: 'wrong', isCorrect: false },
        { word: { word: 'test3' }, userAnswer: 'test3', isCorrect: true },
      ];
      expect(calculateScore(answers)).toBe(2);
    });

    it('should return 0 for empty answers', () => {
      expect(calculateScore([])).toBe(0);
    });

    it('should return 0 when all wrong', () => {
      const answers: PracticeWord[] = [
        { word: { word: 'test' }, userAnswer: 'wrong', isCorrect: false },
      ];
      expect(calculateScore(answers)).toBe(0);
    });
  });

  describe('compareAnswers', () => {
    it('should return matching for correct answers', () => {
      const result = compareAnswers('apple', 'apple');
      expect(result).toEqual(['match', 'match', 'match', 'match', 'match']);
    });

    it('should be case-insensitive', () => {
      const result = compareAnswers('Apple', 'APPLE');
      expect(result).toEqual(['match', 'match', 'match', 'match', 'match']);
    });

    it('should detect wrong characters', () => {
      const result = compareAnswers('apple', 'apqle');
      expect(result).toEqual(['match', 'match', 'wrong', 'match', 'match']);
    });

    it('should detect missing characters', () => {
      const result = compareAnswers('apple', 'aple');
      expect(result).toEqual(['match', 'match', 'missing', 'match', 'match']);
    });

    it('should detect extra characters', () => {
      const result = compareAnswers('apple', 'appple');
      expect(result).toEqual(['match', 'match', 'match', 'extra', 'match', 'match']);
    });

    it('should handle user answer longer than correct word', () => {
      const result = compareAnswers('cat', 'catch');
      expect(result).toEqual(['match', 'match', 'match', 'extra', 'extra']);
    });

    it('should handle user answer shorter than correct word', () => {
      const result = compareAnswers('hello', 'hel');
      expect(result).toEqual(['match', 'match', 'match', 'missing', 'missing']);
    });

    it('should handle completely wrong answer', () => {
      const result = compareAnswers('abc', 'xyz');
      expect(result).toEqual(['wrong', 'wrong', 'wrong']);
    });

    it('should handle empty user answer', () => {
      const result = compareAnswers('cat', '');
      expect(result).toEqual(['missing', 'missing', 'missing']);
    });
  });
});
