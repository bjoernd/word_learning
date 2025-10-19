# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Word Learning is a browser-based spelling practice app for children. It uses text-to-speech to read words aloud, users type what they hear, and the app provides character-level feedback on their answers. All data is stored locally using IndexedDB.

## Technology Stack

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Database**: IndexedDB via Dexie.js with `dexie-react-hooks`
- **Text-to-Speech**: Browser-native Web Speech API (SpeechSynthesis)
- **Testing**: Vitest with jsdom environment
- **Styling**: CSS Modules

## Development Commands

```bash
# Development
npm run dev          # Start dev server at http://localhost:5173

# Build & Preview
npm run build        # TypeScript compile + Vite build
npm run preview      # Preview production build locally

# Quality
npm run lint         # Run ESLint
npm test            # Run tests with Vitest
```

## Architecture

### Core Services (`src/services/`)

- **database.ts**: IndexedDB operations via Dexie
  - Schema: `words` table with `++id, word` fields
  - Exports: `addWord()`, `deleteWord()`, `getAllWords()`, `getWordCount()`, `getRandomWords()`

- **speech.ts**: Text-to-speech wrapper around SpeechSynthesis API
  - Manages voice selection persistence via localStorage
  - Handles speech cancellation and queuing
  - Key methods: `speak()`, `cancel()`, `getVoices()`, `setSelectedVoice()`

- **practiceLogic.ts**: Scoring and answer comparison
  - `isAnswerCorrect()`: Case-insensitive string comparison
  - `compareAnswers()`: Character-by-character diff with 'match', 'wrong', 'missing', 'extra' states
  - `calculateScore()`: Counts correct answers

- **soundEffects.ts**: Audio feedback service
  - Preloads sound files from `/public/sounds/` (start.wav, good.wav, bad.wav, summary.wav)
  - `play(sound)`: Plays a sound effect and returns a Promise
  - Uses HTML5 Audio API with graceful fallback on errors

### Utilities (`src/utils/`)

- **browser.ts**: Environment detection
  - `isBrowser()`: Checks if running in browser vs server/Node environment

- **keyboard.ts**: Keyboard event helpers
  - `handleEnterKey()`: Reduces duplication in Enter key handlers

- **errorHandling.ts**: Standardized error logging
  - `logError()`: General error logging with context
  - `handleAudioError()`: Audio-specific error handling (uses warn level)

- **characterComparison.ts**: CSS class generation for character matching
  - `getCharacterClassName()`: Maps CharacterMatch types to CSS classes

### Hooks (`src/hooks/`)

- **useVoices.ts**: Custom hook for speech synthesis voice management
  - Loads and filters available voices
  - Handles voiceschanged events
  - Optional filter function for voice selection

### Types (`src/types/`)

- **index.ts**: Core type definitions
  - `Word`: Database entity with id and word text
  - `PracticeWord`: Practice session record with answer and correctness

### Components (`src/components/`)

- **App.tsx**: Root component with tab-based navigation
  - Three tabs: Practice, Manage Words, Voice Selector
  - Simple state management with useState for active tab

- **Practice**: Main practice session view (10-word sessions)
  - Uses lottie-web for visual feedback animations (confetti on correct/incorrect, celebration on completion)
  - Animation files from `src/assets/animations/`: `good.json`, `bad.json`, `winner-ok.json` (60-90% score), `winner-perfect.json` (90%+ score)
  - Manages session state, user input, feedback timing, and audio/visual feedback coordination
  - Subcomponents:
    - **AnswerInput.tsx**: Input field with submission, replay button, and inline feedback display
    - **CharacterComparison.tsx**: Character-by-character comparison with color-coded matching
    - **ConfettiAnimation.tsx**: Lottie animation renderer with positioning and cleanup
    - **SessionSummary.tsx**: Completion screen with score and celebration animation

- **WordManager**: Add/delete words from database

- **VoiceSelector**: Browse and select TTS voices

### Application Flow

1. User manages word list via WordManager component
2. Practice component loads 10 random words via `getRandomWords(10)`
3. Each word is spoken using `speechService.speak(word)`
4. User types answer, submitted via Enter or button
5. Answer compared using `compareAnswers()` for character-level feedback
6. Sound effect and animation play based on correctness
7. After feedback delay (1s correct, 3s incorrect), next word plays automatically
8. After 10 words, score displayed with celebration animation (if 60%+) and option to restart

### Practice Session Constants

- **WORDS_PER_SESSION**: 10 words per practice session
- **CORRECT_FEEDBACK_DELAY_MS**: 1000ms before advancing after correct answer
- **INCORRECT_FEEDBACK_DELAY_MS**: 3000ms before advancing after incorrect answer (allows time to review character comparison)
- **MAX_WORD_COUNT**: 1000 word database limit
- **MAX_WORD_LENGTH**: 100 character limit per word

## Key Implementation Details

### Database Schema (Dexie v1)

```typescript
this.version(1).stores({
  words: '++id, word'
});
```

Future versions planned to add word statistics and grouping capabilities.

### Speech Synthesis Quirks

- macOS Safari requires delay after `cancel()` before speaking (200ms timeout)
- Voice selection persisted to localStorage under key `'selectedVoiceURI'`
- Speech rate set to 0.8 for clarity
- Default voice selection: user's selected voice > system default > first available

### Testing Setup

- Test environment: jsdom with vitest
- Test database: fake-indexeddb for IndexedDB mocking
- Setup file: `src/test/setup.ts` mocks:
  - `Audio` element for sound effects testing
  - `lottie-web` for animation testing
  - Imports `@testing-library/jest-dom` for DOM matchers

## File Header Convention

All source files start with two-line ABOUTME comment:
```typescript
// ABOUTME: Brief description of what the file does
// ABOUTME: Additional context or key functionality
```

## Browser Requirements

- Chrome 90+, Firefox 90+, Safari 14+, Edge 90+
- Requires Web Speech API and IndexedDB support
- Works offline after initial load
- Must be served via HTTP server (not `file://` protocol)
