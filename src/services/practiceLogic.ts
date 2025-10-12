// ABOUTME: Provides logic for comparing user answers to correct words and calculating scores
// ABOUTME: in practice sessions with character-by-character feedback
import { PracticeWord } from '../types';

export type CharacterMatch = 'match' | 'wrong' | 'missing' | 'extra';

export function isAnswerCorrect(correctWord: string, userAnswer: string): boolean {
  return correctWord.toLowerCase() === userAnswer.toLowerCase();
}

export function calculateScore(answers: PracticeWord[]): number {
  return answers.filter(a => a.isCorrect).length;
}

export function compareAnswers(correctWord: string, userAnswer: string): CharacterMatch[] {
  const correct = correctWord.toLowerCase();
  const user = userAnswer.toLowerCase();
  const result: CharacterMatch[] = [];

  let i = 0; // index in correct
  let j = 0; // index in user

  while (i < correct.length) {
    if (j >= user.length) {
      // User ran out of characters - rest are missing
      result.push('missing');
      i++;
    } else if (correct[i] === user[j]) {
      // Characters match
      result.push('match');
      i++;
      j++;
    } else {
      // Characters don't match - need to determine if it's wrong, missing, or extra
      // Look ahead to see if we can find a match

      // Check if next correct char matches current user char (missing char in user)
      if (i + 1 < correct.length && correct[i + 1] === user[j]) {
        result.push('missing');
        i++;
      }
      // Check if current correct char matches next user char (extra char in user)
      else if (j + 1 < user.length && correct[i] === user[j + 1]) {
        result.push('extra');
        j++;
      }
      // Otherwise it's just wrong
      else {
        result.push('wrong');
        i++;
        j++;
      }
    }
  }

  // Any remaining user characters are extra
  while (j < user.length) {
    result.push('extra');
    j++;
  }

  return result;
}
