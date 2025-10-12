# Detailed Technical Implementation Plan

## Test-Driven Development Approach

This plan follows strict TDD principles:
1. **Write tests first** - Define expected behavior through tests
2. **Implement minimal code** - Write only what's needed to pass tests
3. **Refactor** - Remove duplication and improve code quality
4. **Validate** - Run tests, build, and linting after each phase

Every phase follows this pattern:
- Write failing tests
- Implement code to make tests pass
- Run full validation (tests + build + lint)
- Commit when all checks pass

## Phase 1: Project Initialization and Setup ✅

**Status**: COMPLETED

Already done:
- Vite project initialized with React + TypeScript
- Dependencies installed (dexie, dexie-react-hooks, vitest, testing-library)
- Project structure created

### Remaining Setup

Create test setup file:

**File**: `src/test/setup.ts`
```typescript
import '@testing-library/jest-dom'
```

Update `vite.config.ts` to include test configuration:
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  }
})
```

**Validation**:
```bash
npm test
npm run build
npm run lint
```

---

## Phase 2: Core Types ✅

**Status**: COMPLETED

**File**: `src/types/index.ts`

```typescript
export interface Word {
  id?: number;
  word: string;
}

export interface PracticeWord {
  word: Word;
  userAnswer: string;
  isCorrect: boolean;
}
```

**TDD Note**: Types are compile-time only - no runtime tests needed.

---

## Phase 3: Database Tests (Write First!) ✅

**Status**: COMPLETED

**File**: `src/services/database.test.ts`

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { db, addWord, deleteWord, getAllWords, getWordCount, getRandomWords } from './database';

describe('Database Operations', () => {
  beforeEach(async () => {
    await db.words.clear();
  });

  afterEach(async () => {
    await db.words.clear();
  });

  describe('addWord', () => {
    it('should add a word and return its id', async () => {
      const id = await addWord('test');
      expect(id).toBeGreaterThan(0);
    });

    it('should store the word text correctly', async () => {
      const id = await addWord('hello');
      const word = await db.words.get(id);
      expect(word?.word).toBe('hello');
    });
  });

  describe('getAllWords', () => {
    it('should return empty array when no words exist', async () => {
      const words = await getAllWords();
      expect(words).toEqual([]);
    });

    it('should retrieve all words', async () => {
      await addWord('word1');
      await addWord('word2');
      const words = await getAllWords();
      expect(words).toHaveLength(2);
    });
  });

  describe('getWordCount', () => {
    it('should return 0 when database is empty', async () => {
      const count = await getWordCount();
      expect(count).toBe(0);
    });

    it('should return correct count', async () => {
      await addWord('word1');
      await addWord('word2');
      const count = await getWordCount();
      expect(count).toBe(2);
    });
  });

  describe('deleteWord', () => {
    it('should delete a word by id', async () => {
      const id = await addWord('test');
      await deleteWord(id);
      const words = await getAllWords();
      expect(words).toHaveLength(0);
    });
  });

  describe('getRandomWords', () => {
    it('should return empty array when database is empty', async () => {
      const random = await getRandomWords(5);
      expect(random).toEqual([]);
    });

    it('should return all words if fewer than requested', async () => {
      await addWord('word1');
      await addWord('word2');
      const random = await getRandomWords(10);
      expect(random).toHaveLength(2);
    });

    it('should return exactly the requested count', async () => {
      await addWord('word1');
      await addWord('word2');
      await addWord('word3');
      await addWord('word4');
      const random = await getRandomWords(2);
      expect(random).toHaveLength(2);
    });
  });
});
```

**Run tests** - they will fail (this is correct TDD!)

---

## Phase 4: Database Implementation ✅

**Status**: COMPLETED

**File**: `src/services/database.ts`

```typescript
import Dexie, { Table } from 'dexie';
import { Word } from '../types';

export class WordDatabase extends Dexie {
  words!: Table<Word, number>;

  constructor() {
    super('WordLearningDB');
    this.version(1).stores({
      words: '++id, word'
    });
  }
}

export const db = new WordDatabase();

export async function addWord(wordText: string): Promise<number> {
  return await db.words.add({ word: wordText });
}

export async function deleteWord(id: number): Promise<void> {
  await db.words.delete(id);
}

export async function getAllWords(): Promise<Word[]> {
  return await db.words.toArray();
}

export async function getWordCount(): Promise<number> {
  return await db.words.count();
}

export async function getRandomWords(count: number): Promise<Word[]> {
  const allWords = await db.words.toArray();

  if (allWords.length === 0) {
    return [];
  }

  if (allWords.length <= count) {
    return allWords;
  }

  // Fisher-Yates shuffle
  const shuffled = [...allWords];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, count);
}
```

**Validation**:
```bash
npm test     # All tests should pass
npm run build
npm run lint
```

---

## Phase 5: Speech Service Tests

**File**: `src/services/speech.test.ts`

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SpeechService } from './speech';

describe('SpeechService', () => {
  let service: SpeechService;
  let mockSpeak: ReturnType<typeof vi.fn>;
  let mockCancel: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockSpeak = vi.fn();
    mockCancel = vi.fn();

    global.speechSynthesis = {
      speak: mockSpeak,
      cancel: mockCancel,
    } as any;

    service = new SpeechService();
  });

  it('should check if speech synthesis is supported', () => {
    expect(service.isSupported()).toBe(true);
  });

  it('should cancel ongoing speech', () => {
    service.cancel();
    expect(mockCancel).toHaveBeenCalled();
  });

  it('should call speechSynthesis.speak', async () => {
    const speakPromise = service.speak('hello');

    expect(mockSpeak).toHaveBeenCalled();
    const utterance = mockSpeak.mock.calls[0][0] as SpeechSynthesisUtterance;
    expect(utterance.text).toBe('hello');

    utterance.onend?.(new Event('end'));
    await expect(speakPromise).resolves.toBeUndefined();
  });
});
```

---

## Phase 6: Speech Service Implementation

**File**: `src/services/speech.ts`

```typescript
export class SpeechService {
  private synthesis: SpeechSynthesis | undefined;

  constructor() {
    this.synthesis = typeof window !== 'undefined' ? window.speechSynthesis : undefined;
  }

  isSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  speak(text: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.isSupported() || !this.synthesis) {
        reject(new Error('Speech synthesis not supported'));
        return;
      }

      this.synthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;

      utterance.onend = () => resolve();
      utterance.onerror = (event) => reject(event);

      this.synthesis.speak(utterance);
    });
  }

  cancel(): void {
    if (this.synthesis) {
      this.synthesis.cancel();
    }
  }
}

export const speechService = new SpeechService();
```

**Validation**:
```bash
npm test
npm run build
npm run lint
```

---

## Phase 7: Practice Logic Tests

**File**: `src/services/practiceLogic.test.ts`

```typescript
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
```

---

## Phase 8: Practice Logic Implementation

**File**: `src/services/practiceLogic.ts`

```typescript
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
  const maxLength = Math.max(correct.length, user.length);
  const result: CharacterMatch[] = [];

  for (let i = 0; i < maxLength; i++) {
    const correctChar = correct[i];
    const userChar = user[i];

    if (correctChar === undefined) {
      // User added extra character
      result.push('extra');
    } else if (userChar === undefined) {
      // User is missing a character
      result.push('missing');
    } else if (correctChar === userChar) {
      // Characters match
      result.push('match');
    } else {
      // Wrong character
      result.push('wrong');
    }
  }

  return result;
}
```

**Validation**:
```bash
npm test
npm run build
npm run lint
```

---

## Phase 9: Word Manager Component

**File**: `src/components/WordManager/WordManager.tsx`

```typescript
import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, addWord, deleteWord } from '../../services/database';
import styles from './WordManager.module.css';

export function WordManager() {
  const [inputValue, setInputValue] = useState('');
  const words = useLiveQuery(() => db.words.toArray()) ?? [];

  const handleAddWord = async () => {
    const trimmed = inputValue.trim();
    if (trimmed) {
      await addWord(trimmed);
      setInputValue('');
    }
  };

  const handleDeleteWord = async (id: number) => {
    if (window.confirm('Delete this word?')) {
      await deleteWord(id);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddWord();
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.addSection}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Enter a word"
          className={styles.input}
          aria-label="New word to add"
        />
        <button onClick={handleAddWord} className={styles.addButton}>
          Add Word
        </button>
      </div>

      {words.length === 0 ? (
        <p className={styles.emptyMessage}>
          No words yet. Add some words to start practicing.
        </p>
      ) : (
        <ul className={styles.wordList}>
          {words.sort((a, b) => a.word.localeCompare(b.word)).map((word) => (
            <li key={word.id} className={styles.wordItem}>
              <span className={styles.wordText}>{word.word}</span>
              <button
                onClick={() => handleDeleteWord(word.id!)}
                className={styles.deleteButton}
                aria-label={`Delete word ${word.word}`}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

**File**: `src/components/WordManager/WordManager.module.css`

```css
.container {
  max-width: 600px;
  margin: 0 auto;
}

.addSection {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
}

.addButton {
  padding: 0.75rem 1.5rem;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.addButton:hover {
  background-color: #2980b9;
}

.emptyMessage {
  text-align: center;
  color: #7f8c8d;
}

.wordList {
  list-style: none;
  padding: 0;
}

.wordItem {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border: 1px solid #ecf0f1;
  border-radius: 4px;
  margin-bottom: 0.5rem;
}

.wordText {
  font-size: 1.1rem;
}

.deleteButton {
  padding: 0.5rem 1rem;
  background-color: #e74c3c;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.deleteButton:hover {
  background-color: #c0392b;
}
```

**Validation**:
```bash
npm run dev  # Manual test: add/delete words
npm run build
npm run lint
```

---

## Phase 10: Practice Component

**File**: `src/components/Practice/Practice.tsx`

```typescript
import { useState, useEffect } from 'react';
import { getRandomWords, getWordCount } from '../../services/database';
import { Word, PracticeWord } from '../../types';
import { speechService } from '../../services/speech';
import { isAnswerCorrect, calculateScore, compareAnswers, CharacterMatch } from '../../services/practiceLogic';
import styles from './Practice.module.css';

const WORDS_PER_SESSION = 10;
const FEEDBACK_DELAY_MS = 3000;

type FeedbackType = 'correct' | 'incorrect' | null;

export function Practice() {
  const [sessionWords, setSessionWords] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<PracticeWord[]>([]);
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState<FeedbackType>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    startSession();
  }, []);

  const startSession = async () => {
    setIsLoading(true);

    const wordCount = await getWordCount();
    if (wordCount === 0) {
      setIsLoading(false);
      return;
    }

    const words = await getRandomWords(WORDS_PER_SESSION);
    setSessionWords(words);
    setCurrentIndex(0);
    setAnswers([]);
    setUserInput('');
    setFeedback(null);
    setIsLoading(false);

    if (words.length > 0) {
      playWord(words[0].word);
    }
  };

  const playWord = async (word: string) => {
    try {
      await speechService.speak(word);
    } catch (err) {
      console.error('Speech error:', err);
    }
  };

  const handleReplay = () => {
    if (sessionWords[currentIndex]) {
      playWord(sessionWords[currentIndex].word);
    }
  };

  const handleSubmit = () => {
    if (!userInput.trim() || feedback) return;

    const currentWord = sessionWords[currentIndex];
    const correct = isAnswerCorrect(currentWord.word, userInput);

    const practiceWord: PracticeWord = {
      word: currentWord,
      userAnswer: userInput,
      isCorrect: correct
    };

    const newAnswers = [...answers, practiceWord];
    setAnswers(newAnswers);
    setFeedback(correct ? 'correct' : 'incorrect');

    setTimeout(() => {
      setFeedback(null);
      setUserInput('');

      if (currentIndex + 1 < sessionWords.length) {
        setCurrentIndex(currentIndex + 1);
        playWord(sessionWords[currentIndex + 1].word);
      }
    }, FEEDBACK_DELAY_MS);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const renderCharacterComparison = (correctWord: string, userAnswer: string) => {
    const comparison = compareAnswers(correctWord, userAnswer);
    const correct = correctWord.toLowerCase();
    const user = userAnswer.toLowerCase();

    return (
      <div className={styles.characterComparison}>
        <div className={styles.comparisonRow}>
          <span className={styles.label}>Correct:</span>
          <div className={styles.characters}>
            {correct.split('').map((char, idx) => (
              <span
                key={idx}
                className={`${styles.char} ${
                  comparison[idx] === 'match' ? styles.charMatch :
                  comparison[idx] === 'missing' ? styles.charMissing :
                  styles.charWrong
                }`}
              >
                {char}
              </span>
            ))}
          </div>
        </div>
        <div className={styles.comparisonRow}>
          <span className={styles.label}>Your answer:</span>
          <div className={styles.characters}>
            {user.split('').map((char, idx) => (
              <span
                key={idx}
                className={`${styles.char} ${
                  comparison[idx] === 'match' ? styles.charMatch :
                  comparison[idx] === 'extra' ? styles.charExtra :
                  styles.charWrong
                }`}
              >
                {char}
              </span>
            ))}
            {comparison.slice(user.length).map((match, idx) => (
              match === 'missing' && (
                <span key={user.length + idx} className={`${styles.char} ${styles.charMissing}`}>
                  _
                </span>
              )
            ))}
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return <div className={styles.container}>Loading...</div>;
  }

  if (sessionWords.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <p>No words available for practice.</p>
          <p>Please add some words in the Manage Words tab first.</p>
        </div>
      </div>
    );
  }

  const isSessionComplete = answers.length === sessionWords.length;

  if (isSessionComplete) {
    const score = calculateScore(answers);
    return (
      <div className={styles.container}>
        <div className={styles.summary}>
          <h2>Session Complete!</h2>
          <div className={styles.score}>
            <span className={styles.scoreNumber}>{score}</span>
            <span> out of </span>
            <span className={styles.scoreNumber}>{sessionWords.length}</span>
          </div>
          <button onClick={startSession} className={styles.restartButton}>
            Restart
          </button>
        </div>
      </div>
    );
  }

  const score = calculateScore(answers);
  const lastAnswer = answers[answers.length - 1];

  return (
    <div className={styles.container}>
      <div className={styles.scoreDisplay}>
        Score: {score}/{answers.length}
      </div>

      <div className={styles.practiceArea}>
        <button onClick={handleReplay} className={styles.replayButton}>
          🔊 Replay Word
        </button>

        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type the word you heard"
          className={styles.input}
          disabled={feedback !== null}
          autoFocus
        />

        <button
          onClick={handleSubmit}
          className={styles.submitButton}
          disabled={feedback !== null}
        >
          Submit
        </button>

        {feedback && (
          <div className={feedback === 'correct' ? styles.correct : styles.incorrect}>
            {feedback === 'correct' ? (
              <>
                <div className={styles.icon}>✓</div>
                <div className={styles.message}>Correct!</div>
              </>
            ) : (
              <>
                <div className={styles.icon}>✗</div>
                <div className={styles.message}>Incorrect</div>
                {renderCharacterComparison(lastAnswer.word.word, lastAnswer.userAnswer)}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
```

**File**: `src/components/Practice/Practice.module.css`

```css
.container {
  max-width: 700px;
  margin: 0 auto;
}

.scoreDisplay {
  text-align: center;
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 2rem;
  color: #2c3e50;
}

.practiceArea {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  align-items: center;
}

.replayButton {
  padding: 1rem 2rem;
  font-size: 1.2rem;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.replayButton:hover {
  background-color: #2980b9;
}

.input {
  width: 100%;
  padding: 1rem;
  font-size: 1.2rem;
  border: 2px solid #bdc3c7;
  border-radius: 8px;
  text-align: center;
}

.input:focus {
  outline: none;
  border-color: #3498db;
}

.input:disabled {
  background-color: #ecf0f1;
}

.submitButton {
  padding: 0.75rem 2rem;
  font-size: 1.1rem;
  background-color: #2ecc71;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.submitButton:hover:not(:disabled) {
  background-color: #27ae60;
}

.submitButton:disabled {
  background-color: #95a5a6;
  cursor: not-allowed;
}

.emptyState {
  text-align: center;
  padding: 2rem;
}

.emptyState p {
  font-size: 1.1rem;
  color: #7f8c8d;
  margin-bottom: 1rem;
}

.correct, .incorrect {
  text-align: center;
  padding: 2rem;
  border-radius: 8px;
  width: 100%;
}

.correct {
  color: #27ae60;
  background-color: #d5f4e6;
}

.incorrect {
  color: #e74c3c;
  background-color: #fadbd8;
}

.icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.message {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
}

.characterComparison {
  margin-top: 1rem;
}

.comparisonRow {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.label {
  font-weight: bold;
  color: #2c3e50;
  min-width: 100px;
  text-align: right;
}

.characters {
  display: flex;
  gap: 0.25rem;
  font-family: monospace;
  font-size: 1.5rem;
}

.char {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  min-width: 1.5rem;
  text-align: center;
  font-weight: bold;
}

.charMatch {
  background-color: #d5f4e6;
  color: #27ae60;
  border: 2px solid #27ae60;
}

.charWrong {
  background-color: #fadbd8;
  color: #e74c3c;
  border: 2px solid #e74c3c;
}

.charMissing {
  background-color: #fff3cd;
  color: #856404;
  border: 2px dashed #856404;
}

.charExtra {
  background-color: #f8d7da;
  color: #721c24;
  border: 2px solid #721c24;
  text-decoration: line-through;
}

.summary {
  text-align: center;
  padding: 3rem;
  background-color: #f8f9fa;
  border-radius: 12px;
}

.summary h2 {
  font-size: 2rem;
  color: #2c3e50;
  margin-bottom: 2rem;
}

.score {
  font-size: 1.5rem;
  margin-bottom: 2rem;
}

.scoreNumber {
  font-size: 2.5rem;
  font-weight: bold;
  color: #3498db;
}

.restartButton {
  padding: 1rem 2.5rem;
  font-size: 1.2rem;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.restartButton:hover {
  background-color: #2980b9;
}
```

---

## Phase 11: Main App

**File**: `src/App.tsx`

```typescript
import { useState } from 'react';
import { Practice } from './components/Practice/Practice';
import { WordManager } from './components/WordManager/WordManager';
import styles from './App.module.css';

type TabType = 'practice' | 'manage';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('practice');

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1>Word Learning</h1>
        <nav className={styles.nav}>
          <button
            className={activeTab === 'practice' ? styles.active : ''}
            onClick={() => setActiveTab('practice')}
          >
            Practice
          </button>
          <button
            className={activeTab === 'manage' ? styles.active : ''}
            onClick={() => setActiveTab('manage')}
          >
            Manage Words
          </button>
        </nav>
      </header>
      <main className={styles.main}>
        {activeTab === 'practice' && <Practice />}
        {activeTab === 'manage' && <WordManager />}
      </main>
    </div>
  );
}

export default App;
```

**File**: `src/App.module.css`

```css
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  background-color: #2c3e50;
  color: white;
  padding: 1rem 2rem;
}

.header h1 {
  margin: 0 0 1rem 0;
  font-size: 1.5rem;
}

.nav {
  display: flex;
  gap: 1rem;
}

.nav button {
  padding: 0.5rem 1rem;
  border: none;
  background-color: #34495e;
  color: white;
  cursor: pointer;
  border-radius: 4px;
}

.nav button:hover {
  background-color: #4a6278;
}

.nav button.active {
  background-color: #3498db;
}

.main {
  flex: 1;
  padding: 2rem;
}
```

**Validation**:
```bash
npm test
npm run build
npm run lint
npm run dev  # Manual testing
```

---

## Phase 12: Final Validation

### Complete Manual Testing

1. **Empty database flow**: Clear all words, verify practice shows message
2. **Add words**: Add 15 words via Manage Words tab
3. **Practice session**: Complete full 10-word session
4. **Scoring**: Verify score calculation is correct
5. **Feedback**: Test both correct and incorrect answers
6. **Restart**: Verify restart works
7. **Data persistence**: Refresh browser, verify words persist
8. **Delete words**: Remove words, verify they're gone

### Run All Checks

```bash
npm test     # All tests must pass
npm run build
npm run lint
```

### Requirements Checklist

- [ ] Word management (add/delete) works
- [ ] 10-word practice sessions work
- [ ] Words sorted alphabetically in Manage Words tab
- [ ] TTS plays automatically and on replay
- [ ] Answer submission via Enter key and button
- [ ] Case-insensitive answer checking
- [ ] Feedback for correct/incorrect answers
- [ ] Running score display during session
- [ ] Session summary shows "N out of M"
- [ ] Restart button works
- [ ] Data persists in IndexedDB across sessions
- [ ] Edge case: empty database handled
- [ ] Edge case: fewer than 10 words handled
- [ ] All tests pass
- [ ] Build succeeds with no errors
- [ ] Linter shows no errors/warnings

---

## Key TDD Principles Applied

1. **Tests First**: Every service function has tests written before implementation
2. **Minimal Implementation**: Only code required to pass tests and meet spec
3. **No Over-Engineering**:
   - No speech options (rate, pitch, volume, lang) - not in spec
   - No complex character comparison UI - simple correct/incorrect is sufficient
   - No session history - not in spec
4. **Code Reuse**: Shared utility functions in services layer
5. **Validation After Each Phase**: Tests + build + lint before moving forward
