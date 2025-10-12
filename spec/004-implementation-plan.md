# Detailed Technical Implementation Plan

## Phase 1: Project Initialization and Setup

### Commands to Execute

```bash
# Initialize Vite project
npm create vite@latest . -- --template react-ts

# Install dependencies
npm install

# Install Dexie
npm install dexie dexie-react-hooks

# Install dev dependencies
npm install -D @types/node
```

### Project Structure to Create

```
src/
├── components/
│   ├── Practice/
│   ├── WordManager/
│   └── shared/
├── services/
│   ├── database.ts
│   └── speech.ts
├── types/
│   └── index.ts
├── App.tsx
├── App.module.css
└── main.tsx
```

### Configuration Files

#### Update `vite.config.ts`

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
  }
})
```

#### Update `tsconfig.json` (ensure strict mode)

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### Validation

```bash
npm run build
npm run lint
```

**Success Criteria**: Build succeeds with no errors, linter shows no warnings/errors

✅ **Phase 1: COMPLETED**

---

## Phase 2: Database Layer Implementation

### File: `src/types/index.ts`

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

export interface SessionState {
  words: Word[];
  currentIndex: number;
  answers: PracticeWord[];
  isComplete: boolean;
}
```

### File: `src/services/database.ts`

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

// CRUD Operations

export async function addWord(wordText: string): Promise<number> {
  // Add word without validation
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

  // If fewer words than requested, return all
  if (allWords.length <= count) {
    return allWords;
  }

  // Shuffle and take first 'count' words
  const shuffled = [...allWords].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
```

### Testing Approach

Create `src/services/database.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { db, addWord, deleteWord, getAllWords, getRandomWords } from './database';

describe('Database Operations', () => {
  beforeEach(async () => {
    // Clear database before each test
    await db.words.clear();
  });

  it('should add a word', async () => {
    const id = await addWord('test');
    expect(id).toBeGreaterThan(0);
  });

  it('should retrieve all words', async () => {
    await addWord('word1');
    await addWord('word2');
    const words = await getAllWords();
    expect(words).toHaveLength(2);
  });

  it('should delete a word', async () => {
    const id = await addWord('test');
    await deleteWord(id);
    const words = await getAllWords();
    expect(words).toHaveLength(0);
  });

  it('should return random words', async () => {
    await addWord('word1');
    await addWord('word2');
    await addWord('word3');
    const random = await getRandomWords(2);
    expect(random).toHaveLength(2);
  });

  it('should return all words if fewer than requested', async () => {
    await addWord('word1');
    const random = await getRandomWords(10);
    expect(random).toHaveLength(1);
  });
});
```

### Install Vitest

```bash
npm install -D vitest jsdom @testing-library/react @testing-library/jest-dom
```

### Update `package.json` scripts

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui"
  }
}
```

### Validation

```bash
npm test
npm run build
npm run lint
```

**Success Criteria**: All tests pass, build succeeds, linter clean

---

## Phase 3: Text-to-Speech Service

### File: `src/services/speech.ts`

```typescript
export interface SpeechOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  lang?: string;
}

export class SpeechService {
  private synthesis: SpeechSynthesis;
  private defaultOptions: Required<SpeechOptions>;

  constructor() {
    this.synthesis = window.speechSynthesis;
    this.defaultOptions = {
      rate: 0.8,
      pitch: 1,
      volume: 1,
      lang: 'en-US'
    };
  }

  isSupported(): boolean {
    return 'speechSynthesis' in window;
  }

  speak(text: string, options?: SpeechOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.isSupported()) {
        reject(new Error('Speech synthesis not supported'));
        return;
      }

      // Cancel any ongoing speech
      this.synthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      const opts = { ...this.defaultOptions, ...options };

      utterance.rate = opts.rate;
      utterance.pitch = opts.pitch;
      utterance.volume = opts.volume;
      utterance.lang = opts.lang;

      utterance.onend = () => resolve();
      utterance.onerror = (event) => reject(event);

      this.synthesis.speak(utterance);
    });
  }

  cancel(): void {
    this.synthesis.cancel();
  }
}

export const speechService = new SpeechService();
```

### Testing Approach

Create `src/services/speech.test.ts`:

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SpeechService } from './speech';

describe('SpeechService', () => {
  let service: SpeechService;

  beforeEach(() => {
    // Mock speechSynthesis
    global.speechSynthesis = {
      speak: vi.fn(),
      cancel: vi.fn(),
    } as any;

    service = new SpeechService();
  });

  it('should check if speech synthesis is supported', () => {
    expect(service.isSupported()).toBe(true);
  });

  it('should cancel ongoing speech', () => {
    service.cancel();
    expect(global.speechSynthesis.cancel).toHaveBeenCalled();
  });
});
```

### Validation

```bash
npm test
npm run build
npm run lint
```

**Success Criteria**: All tests pass, build succeeds, linter clean

---

## Phase 4: Main App Structure and Navigation

### File: `src/App.tsx`

```typescript
import { useState } from 'react';
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
        {activeTab === 'practice' && <div>Practice View</div>}
        {activeTab === 'manage' && <div>Manage Words View</div>}
      </main>
    </div>
  );
}

export default App;
```

### File: `src/App.module.css`

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

### Validation

```bash
npm run dev  # Manually test navigation
npm run build
npm run lint
```

**Success Criteria**: Can switch between tabs, build succeeds, linter clean

---

## Phase 5: Word Management View

### File: `src/components/WordManager/WordManager.tsx`

```typescript
import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, addWord, deleteWord } from '../../services/database';
import { Word } from '../../types';
import styles from './WordManager.module.css';

export function WordManager() {
  const [inputValue, setInputValue] = useState('');
  const words = useLiveQuery(() => db.words.toArray()) ?? [];

  const handleAddWord = async () => {
    if (inputValue.trim()) {
      await addWord(inputValue.trim());
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
        />
        <button onClick={handleAddWord} className={styles.addButton}>
          Add Word
        </button>
      </div>

      {words.length === 0 ? (
        <p className={styles.emptyMessage}>
          No words yet. Add some words to start practicing!
        </p>
      ) : (
        <ul className={styles.wordList}>
          {words.map((word) => (
            <li key={word.id} className={styles.wordItem}>
              <span className={styles.wordText}>{word.word}</span>
              <button
                onClick={() => handleDeleteWord(word.id!)}
                className={styles.deleteButton}
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

### File: `src/components/WordManager/WordManager.module.css`

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
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
}

.addButton {
  padding: 0.5rem 1rem;
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
  font-style: italic;
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
  padding: 0.25rem 0.75rem;
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

### Update `src/App.tsx`

```typescript
import { WordManager } from './components/WordManager/WordManager';

// In the main section:
{activeTab === 'manage' && <WordManager />}
```

### Validation

```bash
npm test
npm run build
npm run lint
```

**Success Criteria**: Can add/delete words, words persist, tests pass, linter clean

---

## Phase 6: Practice Session Core Logic

### File: `src/services/practiceLogic.ts`

```typescript
import { Word, PracticeWord } from '../types';

export interface CharacterComparison {
  correct: string;
  user: string;
  differences: CharacterDifference[];
}

export interface CharacterDifference {
  index: number;
  type: 'missing' | 'extra' | 'wrong';
  correctChar?: string;
  userChar?: string;
}

export function compareAnswers(
  correctWord: string,
  userAnswer: string
): CharacterComparison {
  const correct = correctWord.toLowerCase();
  const user = userAnswer.toLowerCase();
  const differences: CharacterDifference[] = [];

  const maxLength = Math.max(correct.length, user.length);

  for (let i = 0; i < maxLength; i++) {
    const correctChar = correct[i];
    const userChar = user[i];

    if (correctChar === undefined) {
      // User added extra characters
      differences.push({
        index: i,
        type: 'extra',
        userChar: userChar
      });
    } else if (userChar === undefined) {
      // User is missing characters
      differences.push({
        index: i,
        type: 'missing',
        correctChar: correctChar
      });
    } else if (correctChar !== userChar) {
      // Wrong character
      differences.push({
        index: i,
        type: 'wrong',
        correctChar: correctChar,
        userChar: userChar
      });
    }
  }

  return {
    correct: correctWord,
    user: userAnswer,
    differences
  };
}

export function isAnswerCorrect(correctWord: string, userAnswer: string): boolean {
  return correctWord.toLowerCase() === userAnswer.toLowerCase();
}

export function calculateScore(answers: PracticeWord[]): number {
  return answers.filter(a => a.isCorrect).length;
}
```

### File: `src/services/practiceLogic.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { compareAnswers, isAnswerCorrect, calculateScore } from './practiceLogic';
import { PracticeWord } from '../types';

describe('Practice Logic', () => {
  describe('isAnswerCorrect', () => {
    it('should match case-insensitively', () => {
      expect(isAnswerCorrect('Apple', 'apple')).toBe(true);
      expect(isAnswerCorrect('HELLO', 'hello')).toBe(true);
    });

    it('should detect incorrect answers', () => {
      expect(isAnswerCorrect('apple', 'aple')).toBe(false);
    });
  });

  describe('compareAnswers', () => {
    it('should detect missing characters', () => {
      const result = compareAnswers('apple', 'aple');
      expect(result.differences).toHaveLength(1);
      expect(result.differences[0].type).toBe('missing');
    });

    it('should detect extra characters', () => {
      const result = compareAnswers('apple', 'appple');
      expect(result.differences).toHaveLength(1);
      expect(result.differences[0].type).toBe('extra');
    });

    it('should detect wrong characters', () => {
      const result = compareAnswers('apple', 'apqle');
      expect(result.differences).toHaveLength(1);
      expect(result.differences[0].type).toBe('wrong');
    });

    it('should be case insensitive', () => {
      const result = compareAnswers('Apple', 'APPLE');
      expect(result.differences).toHaveLength(0);
    });
  });

  describe('calculateScore', () => {
    it('should count correct answers', () => {
      const answers: PracticeWord[] = [
        { word: { word: 'test' }, userAnswer: 'test', isCorrect: true },
        { word: { word: 'test2' }, userAnswer: 'wrong', isCorrect: false }
      ];
      expect(calculateScore(answers)).toBe(1);
    });
  });
});
```

### Validation

```bash
npm test
npm run build
npm run lint
```

**Success Criteria**: All tests pass, build succeeds, linter clean

---

## Phase 7: Practice View UI - Part 1 (Word Presentation)

### File: `src/components/Practice/Practice.tsx`

```typescript
import { useState, useEffect } from 'react';
import { getRandomWords, getWordCount } from '../../services/database';
import { Word, PracticeWord } from '../../types';
import { speechService } from '../../services/speech';
import { isAnswerCorrect } from '../../services/practiceLogic';
import styles from './Practice.module.css';

const WORDS_PER_SESSION = 10;

export function Practice() {
  const [sessionWords, setSessionWords] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<PracticeWord[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasEnoughWords, setHasEnoughWords] = useState(true);

  useEffect(() => {
    startSession();
  }, []);

  const startSession = async () => {
    setIsLoading(true);
    setError(null);

    const wordCount = await getWordCount();

    if (wordCount === 0) {
      setHasEnoughWords(false);
      setIsLoading(false);
      return;
    }

    const words = await getRandomWords(WORDS_PER_SESSION);
    setSessionWords(words);
    setCurrentIndex(0);
    setAnswers([]);
    setUserInput('');
    setHasEnoughWords(true);
    setIsLoading(false);

    // Auto-play first word
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
    if (!userInput.trim()) return;

    const currentWord = sessionWords[currentIndex];
    const correct = isAnswerCorrect(currentWord.word, userInput);

    const practiceWord: PracticeWord = {
      word: currentWord,
      userAnswer: userInput,
      isCorrect: correct
    };

    setAnswers([...answers, practiceWord]);
    // Will handle feedback and advancement in next phase
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  if (isLoading) {
    return <div className={styles.container}>Loading...</div>;
  }

  if (!hasEnoughWords) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <p>No words available for practice.</p>
          <p>Please add some words in the Manage Words tab first.</p>
        </div>
      </div>
    );
  }

  const currentWord = sessionWords[currentIndex];
  const score = answers.filter(a => a.isCorrect).length;

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
          autoFocus
        />

        <button onClick={handleSubmit} className={styles.submitButton}>
          Submit
        </button>
      </div>
    </div>
  );
}
```

### File: `src/components/Practice/Practice.module.css`

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

.submitButton {
  padding: 0.75rem 2rem;
  font-size: 1.1rem;
  background-color: #2ecc71;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.submitButton:hover {
  background-color: #27ae60;
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
```

### Update `src/App.tsx`

```typescript
import { Practice } from './components/Practice/Practice';

// In the main section:
{activeTab === 'practice' && <Practice />}
```

### Validation

```bash
npm run dev  # Manual test: hear words, enter answers
npm run build
npm run lint
```

**Success Criteria**: Can hear words, replay works, input works, build succeeds, linter clean

---

## Phase 8: Practice View UI - Part 2 (Feedback)

### File: `src/components/Practice/Feedback.tsx`

```typescript
import { CharacterComparison } from '../../services/practiceLogic';
import styles from './Feedback.module.css';

interface FeedbackProps {
  isCorrect: boolean;
  comparison?: CharacterComparison;
}

export function Feedback({ isCorrect, comparison }: FeedbackProps) {
  if (isCorrect) {
    return (
      <div className={styles.feedback}>
        <div className={styles.correct}>
          <div className={styles.icon}>✓</div>
          <div className={styles.message}>Correct!</div>
        </div>
      </div>
    );
  }

  if (!comparison) return null;

  return (
    <div className={styles.feedback}>
      <div className={styles.incorrect}>
        <div className={styles.icon}>✗</div>
        <div className={styles.message}>Incorrect</div>

        <div className={styles.comparison}>
          <div className={styles.comparisonRow}>
            <span className={styles.label}>Correct:</span>
            <span className={styles.word}>{comparison.correct}</span>
          </div>
          <div className={styles.comparisonRow}>
            <span className={styles.label}>Your answer:</span>
            <span className={styles.word}>{comparison.user}</span>
          </div>

          {comparison.differences.length > 0 && (
            <div className={styles.differences}>
              <div className={styles.differencesTitle}>Differences:</div>
              <ul className={styles.differencesList}>
                {comparison.differences.map((diff, idx) => (
                  <li key={idx} className={styles.differenceItem}>
                    {diff.type === 'missing' && (
                      <span>Position {diff.index + 1}: Missing '{diff.correctChar}'</span>
                    )}
                    {diff.type === 'extra' && (
                      <span>Position {diff.index + 1}: Extra '{diff.userChar}'</span>
                    )}
                    {diff.type === 'wrong' && (
                      <span>Position {diff.index + 1}: Wrong character (expected '{diff.correctChar}', got '{diff.userChar}')</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

### File: `src/components/Practice/Feedback.module.css`

```css
.feedback {
  margin-top: 2rem;
  padding: 2rem;
  border-radius: 8px;
}

.correct {
  text-align: center;
  color: #27ae60;
}

.incorrect {
  color: #e74c3c;
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

.comparison {
  background-color: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  margin-top: 1rem;
}

.comparisonRow {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.75rem;
  font-size: 1.1rem;
}

.label {
  font-weight: bold;
  color: #2c3e50;
}

.word {
  font-family: monospace;
  font-size: 1.2rem;
}

.differences {
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #dee2e6;
}

.differencesTitle {
  font-weight: bold;
  margin-bottom: 0.75rem;
  color: #2c3e50;
}

.differencesList {
  list-style: none;
  padding: 0;
}

.differenceItem {
  padding: 0.5rem;
  background-color: #fff;
  border-left: 3px solid #e74c3c;
  margin-bottom: 0.5rem;
  border-radius: 4px;
}
```

### Update `src/components/Practice/Practice.tsx`

Add state for feedback:

```typescript
import { Feedback } from './Feedback';
import { compareAnswers } from '../../services/practiceLogic';

// Add state
const [showFeedback, setShowFeedback] = useState(false);
const [currentComparison, setCurrentComparison] = useState<CharacterComparison | null>(null);

// Update handleSubmit
const handleSubmit = () => {
  if (!userInput.trim()) return;

  const currentWord = sessionWords[currentIndex];
  const correct = isAnswerCorrect(currentWord.word, userInput);

  const practiceWord: PracticeWord = {
    word: currentWord,
    userAnswer: userInput,
    isCorrect: correct
  };

  const newAnswers = [...answers, practiceWord];
  setAnswers(newAnswers);

  if (!correct) {
    const comparison = compareAnswers(currentWord.word, userInput);
    setCurrentComparison(comparison);
  }

  setShowFeedback(true);

  // Auto-advance after 3 seconds
  setTimeout(() => {
    setShowFeedback(false);
    setCurrentComparison(null);
    setUserInput('');

    if (currentIndex + 1 < sessionWords.length) {
      setCurrentIndex(currentIndex + 1);
      playWord(sessionWords[currentIndex + 1].word);
    }
  }, 3000);
};

// Add to render:
{showFeedback && (
  <Feedback
    isCorrect={answers[answers.length - 1]?.isCorrect ?? false}
    comparison={currentComparison ?? undefined}
  />
)}
```

### Validation

```bash
npm run dev  # Manual test: submit answers, see feedback
npm run build
npm run lint
```

**Success Criteria**: Feedback displays correctly, auto-advances, build succeeds, linter clean

---

## Phase 9: Session Summary and Restart

### File: `src/components/Practice/Summary.tsx`

```typescript
import styles from './Summary.module.css';

interface SummaryProps {
  score: number;
  total: number;
  onRestart: () => void;
}

export function Summary({ score, total, onRestart }: SummaryProps) {
  return (
    <div className={styles.container}>
      <div className={styles.summary}>
        <h2 className={styles.title}>Session Complete!</h2>
        <div className={styles.score}>
          <span className={styles.scoreNumber}>{score}</span>
          <span className={styles.scoreDivider}> out of </span>
          <span className={styles.scoreNumber}>{total}</span>
        </div>
        <button onClick={onRestart} className={styles.restartButton}>
          Restart
        </button>
      </div>
    </div>
  );
}
```

### File: `src/components/Practice/Summary.module.css`

```css
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.summary {
  text-align: center;
  padding: 3rem;
  background-color: #f8f9fa;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.title {
  font-size: 2rem;
  color: #2c3e50;
  margin-bottom: 2rem;
}

.score {
  font-size: 1.5rem;
  margin-bottom: 2rem;
  color: #34495e;
}

.scoreNumber {
  font-size: 2.5rem;
  font-weight: bold;
  color: #3498db;
}

.scoreDivider {
  font-size: 1.5rem;
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

### Update `src/components/Practice/Practice.tsx`

Add session completion logic:

```typescript
import { Summary } from './Summary';

// Check if session is complete
const isSessionComplete = answers.length === sessionWords.length;

// In render, show summary if complete:
if (isSessionComplete) {
  const finalScore = answers.filter(a => a.isCorrect).length;
  return (
    <div className={styles.container}>
      <Summary
        score={finalScore}
        total={sessionWords.length}
        onRestart={startSession}
      />
    </div>
  );
}
```

### Validation

```bash
npm run dev  # Complete a session, verify summary and restart
npm run build
npm run lint
```

**Success Criteria**: Summary displays after 10 words, restart works, build succeeds, linter clean

---

## Phase 10: Integration Testing and Edge Cases

### Manual Test Cases

1. **Empty database flow**:
   - Clear all words
   - Navigate to Practice tab
   - Verify message about adding words appears

2. **Fewer than 10 words**:
   - Add 5 words
   - Start practice session
   - Verify all 5 words are used
   - Verify summary shows "X out of 5"

3. **Full session flow**:
   - Add 15+ words
   - Complete full 10-word session
   - Verify random selection
   - Verify score calculation
   - Verify restart works

4. **Data persistence**:
   - Add words
   - Refresh browser
   - Verify words still exist

5. **Case insensitivity**:
   - Practice with word "Apple"
   - Type "apple"
   - Verify marked as correct

6. **Character comparison**:
   - Practice with word "apple"
   - Type "aple" (missing p)
   - Verify feedback shows missing character
   - Type "appple" (extra p)
   - Verify feedback shows extra character
   - Type "apqle" (wrong character)
   - Verify feedback shows wrong character

### Browser Testing

Test in:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)

Verify TTS works in all browsers.

### Validation

```bash
npm test
npm run build
npm run lint
```

**Success Criteria**: All edge cases handled, all tests pass, build succeeds, linter clean

---

## Phase 11: Polish and Accessibility

### Accessibility Improvements

Update components with ARIA labels:

#### `src/components/Practice/Practice.tsx`

```typescript
<button
  onClick={handleReplay}
  className={styles.replayButton}
  aria-label="Replay word pronunciation"
>
  🔊 Replay Word
</button>

<input
  type="text"
  value={userInput}
  onChange={(e) => setUserInput(e.target.value)}
  onKeyPress={handleKeyPress}
  placeholder="Type the word you heard"
  className={styles.input}
  aria-label="Your answer"
  autoFocus
/>
```

#### `src/components/WordManager/WordManager.tsx`

```typescript
<input
  type="text"
  value={inputValue}
  onChange={(e) => setInputValue(e.target.value)}
  onKeyPress={handleKeyPress}
  placeholder="Enter a word"
  className={styles.input}
  aria-label="New word to add"
/>

<button
  onClick={() => handleDeleteWord(word.id!)}
  className={styles.deleteButton}
  aria-label={`Delete word ${word.word}`}
>
  Delete
</button>
```

### Responsive Design

Add responsive breakpoints to CSS:

```css
@media (max-width: 768px) {
  .container {
    padding: 1rem;
  }

  .input {
    font-size: 1rem;
  }
}
```

### Validation

```bash
npm run build
npm run lint
```

**Success Criteria**: Keyboard navigation works, screen readers work, responsive, linter clean

---

## Phase 12: Documentation

### File: `README.md`

```markdown
# Word Learning App

A browser-based spelling practice application for children that uses text-to-speech to present words and provides immediate feedback on spelling accuracy.

## Features

- Practice spelling with text-to-speech word pronunciation
- Character-by-character feedback showing exactly where mistakes occurred
- Simple word database management (add/remove words)
- 10-word practice sessions with scoring
- All data stored locally in browser (no server required)

## Browser Requirements

- Chrome 90+
- Firefox 90+
- Safari 14+
- Edge 90+

Text-to-speech functionality requires one of these modern browsers.

## Running Locally

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open browser to http://localhost:5173
```

## Building for Production

```bash
npm run build
npm run preview
```

## Using the App

### Adding Words

1. Click "Manage Words" tab
2. Type a word in the input field
3. Click "Add Word" or press Enter
4. Word is immediately available for practice

### Practicing

1. Click "Practice" tab
2. Listen to the word pronounced by text-to-speech
3. Type the word you heard
4. Press Enter or click Submit
5. See feedback (correct/incorrect with character comparison)
6. Automatically advances to next word
7. After 10 words, see your score and restart

## Technology Stack

- React 19 with TypeScript
- Vite (build tool)
- IndexedDB via Dexie.js (local storage)
- Web Speech API (text-to-speech)
- CSS Modules (styling)
- Vitest (testing)

## Project Structure

```
src/
├── components/       # React components
│   ├── Practice/    # Practice session interface
│   └── WordManager/ # Word management interface
├── services/        # Business logic
│   ├── database.ts  # Database operations
│   ├── speech.ts    # Text-to-speech service
│   └── practiceLogic.ts  # Answer comparison logic
└── types/           # TypeScript type definitions
```

## Data Storage

All data is stored locally in your browser using IndexedDB. No data is sent to any server. Words persist between sessions unless you clear your browser data.
```

### File: Update `.cj/claude/CLAUDE.md`

```markdown
- When committing, always include a verbatim copy of the starting prompt used for this conversation.

# Word Learning App - Project Context

## Architecture

This is a single-page React application with local-only data storage. No backend server is required.

### Key Components

- **Practice**: Main practice session interface with TTS, input, feedback, and scoring
- **WordManager**: CRUD interface for managing word database
- **App**: Top-level component with tab navigation

### Services Layer

- **database.ts**: Dexie.js wrapper for IndexedDB operations
- **speech.ts**: Web Speech API wrapper for text-to-speech
- **practiceLogic.ts**: Business logic for answer comparison and scoring

### Data Flow

1. Words stored in IndexedDB via Dexie
2. Practice component loads random words on session start
3. Speech service reads words aloud
4. User input compared with practiceLogic service
5. Results displayed and score tracked
6. Session completes after 10 words (or fewer if database has fewer)

## Testing Strategy

- Unit tests for services (database, speech, practiceLogic)
- Component tests for UI interactions
- Manual integration testing for full user flows
- All tests must pass before committing

## Future Extensions

The architecture supports planned features:

- **Word Statistics**: Add `wordStats` table in Dexie schema
- **Word Groups**: Add `wordGroups` table with relational queries
- **User Profiles**: Add `users` table with per-user word lists

These would require Dexie schema version upgrades but no major architectural changes.
```

### Validation

Review documentation for:
- Clarity
- Accuracy
- No boastful language
- User-focused (not overly technical in README)

---

## Phase 13: Final Validation

### Complete Test Suite

```bash
# Run all tests
npm test

# Verify all pass
```

### Build Verification

```bash
# Clean build
rm -rf dist
npm run build

# Check for build errors
```

### Linting

```bash
# Run linter
npm run lint

# Should show 0 errors, 0 warnings
```

### Requirements Checklist

- [ ] Word management (add/delete) works
- [ ] 10-word practice sessions work
- [ ] TTS plays automatically and on replay
- [ ] Answer submission via Enter key and button
- [ ] Case-insensitive answer checking
- [ ] Character-by-character feedback for incorrect answers
- [ ] Running score display during session
- [ ] Session summary shows "N out of 10"
- [ ] Restart button works
- [ ] Data persists in IndexedDB across sessions
- [ ] No session history stored
- [ ] Edge case: empty database handled
- [ ] Edge case: fewer than 10 words handled
- [ ] Build succeeds with no errors
- [ ] All tests pass
- [ ] Linter shows no errors/warnings
- [ ] Documentation is complete and accurate

### Git Status

```bash
git status
```

Verify:
- README.md and CLAUDE.md are updated
- No unintended files staged
- No log files or secrets in repository

### Final Manual Test

1. Start fresh: Clear browser data
2. Add 15 words
3. Complete full practice session
4. Verify score
5. Restart session
6. Delete some words
7. Start new session
8. Close and reopen browser
9. Verify data persisted

**Success Criteria**: All requirements met, all tests pass, build clean, lint clean, documentation complete
