// ABOUTME: Evaluation test comparing current look-ahead algorithm vs simple comparison
// ABOUTME: Used to determine if the complexity of the look-ahead algorithm is justified

import { describe, it, expect } from 'vitest';
import { compareAnswers, CharacterMatch } from './practiceLogic';

/**
 * Simple character-by-character comparison without look-ahead logic
 * This is the potential simplified replacement algorithm
 */
function compareAnswersSimple(correct: string, user: string): CharacterMatch[] {
  const correctLower = correct.toLowerCase();
  const userLower = user.toLowerCase();
  const maxLen = Math.max(correctLower.length, userLower.length);
  const result: CharacterMatch[] = [];

  for (let i = 0; i < maxLen; i++) {
    if (i >= correctLower.length) {
      result.push('extra');
    } else if (i >= userLower.length) {
      result.push('missing');
    } else if (correctLower[i] === userLower[i]) {
      result.push('match');
    } else {
      result.push('wrong');
    }
  }

  return result;
}

describe('compareAnswers Algorithm Evaluation', () => {
  describe('Cases where both algorithms agree', () => {
    const testCases = [
      { correct: 'apple', user: 'apple', desc: 'perfect match' },
      { correct: 'hello', user: 'hel', desc: 'user too short (simple truncation)' },
      { correct: 'cat', user: 'catch', desc: 'user too long (extra at end)' },
      { correct: 'abc', user: 'xyz', desc: 'completely wrong' },
      { correct: 'test', user: '', desc: 'empty user answer' },
      { correct: 'word', user: 'ward', desc: 'single character substitution' },
    ];

    testCases.forEach(({ correct, user, desc }) => {
      it(`should agree on: ${desc} (${correct} vs ${user})`, () => {
        const current = compareAnswers(correct, user);
        const simple = compareAnswersSimple(correct, user);
        expect(current).toEqual(simple);
      });
    });
  });

  describe('Cases where algorithms DIFFER - Look-ahead advantage', () => {
    it('should detect missing character in middle: "apple" vs "aple"', () => {
      const current = compareAnswers('apple', 'aple');
      const simple = compareAnswersSimple('apple', 'aple');

      // Current: ['match', 'match', 'missing', 'match', 'match']
      // Simple:  ['match', 'match', 'wrong', 'wrong', 'match']

      console.log('Missing char - Current:', current);
      console.log('Missing char - Simple: ', simple);

      // Verify the difference: current detects missing, simple cascades into wrong
      expect(current).toEqual(['match', 'match', 'missing', 'match', 'match']);
      expect(simple).toEqual(['match', 'match', 'wrong', 'wrong', 'missing']);
    });

    it('should detect extra character in middle: "apple" vs "appple"', () => {
      const current = compareAnswers('apple', 'appple');
      const simple = compareAnswersSimple('apple', 'appple');

      // Current: ['match', 'match', 'match', 'extra', 'match', 'match']
      // Simple:  ['match', 'match', 'match', 'wrong', 'wrong', 'match']

      console.log('Extra char - Current:', current);
      console.log('Extra char - Simple: ', simple);

      // Verify the difference: current detects extra, simple cascades into wrong
      expect(current).toEqual(['match', 'match', 'match', 'extra', 'match', 'match']);
      expect(simple).toEqual(['match', 'match', 'match', 'wrong', 'wrong', 'extra']);
    });
  });

  describe('Complex error patterns - Real world scenarios', () => {
    const scenarios = [
      {
        correct: 'beautiful',
        user: 'beatiful',
        desc: 'common mistake - missing "u"',
      },
      {
        correct: 'necessary',
        user: 'neccessary',
        desc: 'common mistake - extra "c"',
      },
      {
        correct: 'received',
        user: 'recieved',
        desc: 'common mistake - "ie" vs "ei"',
      },
      {
        correct: 'separate',
        user: 'seperate',
        desc: 'common mistake - "a" vs "e"',
      },
      {
        correct: 'definitely',
        user: 'definately',
        desc: 'common mistake - "i" vs "a"',
      },
      {
        correct: 'accommodate',
        user: 'acommodate',
        desc: 'common mistake - missing double "c"',
      },
    ];

    scenarios.forEach(({ correct, user, desc }) => {
      it(`should compare: ${desc} (${correct} vs ${user})`, () => {
        const current = compareAnswers(correct, user);
        const simple = compareAnswersSimple(correct, user);

        console.log(`\n${desc}:`);
        console.log('  Correct word:', correct);
        console.log('  User answer: ', user);
        console.log('  Current algo:', current.join(', '));
        console.log('  Simple algo: ', simple.join(', '));

        // Count differences
        const currentWrong = current.filter(c => c !== 'match').length;
        const simpleWrong = simple.filter(c => c !== 'match').length;

        console.log(`  Current errors: ${currentWrong}, Simple errors: ${simpleWrong}`);

        // Store both results for analysis (no assertion here, just observation)
        expect(current).toBeDefined();
        expect(simple).toBeDefined();
      });
    });
  });

  describe('Edge cases - One-off look-ahead only', () => {
    it('should handle limited look-ahead scope correctly', () => {
      // Current algorithm only looks ahead by 1 character
      // If there are multiple missing/extra chars in a row, it may not handle optimally

      const correct = 'abcdef';
      const user = 'abxxef';

      const current = compareAnswers(correct, user);
      const simple = compareAnswersSimple(correct, user);

      console.log('\nMultiple wrong in sequence:');
      console.log('  Current:', current);
      console.log('  Simple: ', simple);

      // Both should show wrong for positions that don't match
      expect(current).toBeDefined();
      expect(simple).toBeDefined();
    });

    it('should handle transposition errors', () => {
      // Transposition: two characters swapped
      const correct = 'friend';
      const user = 'freind'; // "ie" swapped to "ei"

      const current = compareAnswers(correct, user);
      const simple = compareAnswersSimple(correct, user);

      console.log('\nTransposition (friend vs freind):');
      console.log('  Current:', current);
      console.log('  Simple: ', simple);

      expect(current).toBeDefined();
      expect(simple).toBeDefined();
    });
  });

  describe('Educational value comparison', () => {
    it('should consider learning value of "missing" vs "wrong" feedback', () => {
      // For a child learning to spell, is it more helpful to see:
      // A) "You missed the 'p'" (current algorithm)
      // B) "The 3rd and 4th characters are wrong" (simple algorithm)

      const correct = 'apple';
      const user = 'aple';

      const current = compareAnswers(correct, user);
      const simple = compareAnswersSimple(correct, user);

      console.log('\nEducational value test:');
      console.log('  Correct word: apple');
      console.log('  User typed:   aple');
      console.log('  Current feedback:', current);
      console.log('  Simple feedback: ', simple);

      // Question: Does distinguishing 'missing' help learning more than just 'wrong'?
      // For children: Probably YES - knowing a letter is missing is clearer than "wrong"

      expect(current).toBeDefined();
      expect(simple).toBeDefined();
    });
  });
});
