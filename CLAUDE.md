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

### Components (`src/components/`)

- **Practice**: Main practice session view (10-word sessions)
- **WordManager**: Add/delete words from database
- **VoiceSelector**: Browse and select TTS voices

### Application Flow

1. User manages word list via WordManager component
2. Practice component loads 10 random words via `getRandomWords(10)`
3. Each word is spoken using `speechService.speak(word)`
4. User types answer, submitted via Enter or button
5. Answer compared using `compareAnswers()` for character-level feedback
6. After 10 words, score displayed with option to restart

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
- Setup file: `src/test/setup.ts`

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
