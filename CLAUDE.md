# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Word Learning App - A React-based spelling practice application for kids aged 8-12. Uses Web Speech API for text-to-speech and localStorage for persistence. No backend required - fully client-side.

## Development Commands

```bash
npm run dev          # Start Vite dev server (http://localhost:5173)
npm run build        # Production build
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run test         # Run all tests with Vitest (single run)
npm run test:watch   # Run tests in watch mode
```

### Running Individual Tests

```bash
npx vitest src/path/to/file.test.js        # Run specific test file
npx vitest src/utils/spellChecker.test.js  # Example: run spell checker tests
```

## Architecture

### Core Design Patterns

**Tab-Based Navigation**: App.jsx manages two main panes (Practice/Manage Words) using tab state. Each pane is conditionally rendered based on `activeTab` state.

**Service Layer Pattern**: Business logic isolated in `/services`:
- `storage.js`: All localStorage operations (words, scores)
- `tts.js`: Web Speech API wrapper with kid-friendly voice selection (slower rate: 0.9, higher pitch: 1.1)

**Utility Functions**: Pure helper logic in `/utils`:
- `wordModel.js`: Word validation, deduplication, random selection
- `spellChecker.js`: Character-by-character comparison with highlights array for visual feedback

### Key Data Flow

1. **Word Storage**: localStorage keys are `wordLearning_words` (array) and `wordLearning_score` (number)
2. **Practice Flow**: PracticePane → getRandomWord() → speakWord() → checkSpelling() → FeedbackDisplay
3. **Spell Checking**: Produces `{ isCorrect, userAnswer, correctAnswer, highlights[] }` where highlights is boolean array (true = incorrect char)
4. **Score Updates**: Only increments on correct spelling, stored immediately to localStorage via `saveScore()`

### Component Structure

- **App.jsx**: Root component, manages tab navigation state
- **PracticePane.jsx**: Main game interface - word selection, TTS control, input handling, score tracking
- **FeedbackDisplay.jsx**: Shows spell check results with character-level highlighting
- **WordsManagement.jsx**: CRUD interface for word database
- **WordsList.jsx**: Displays all words with delete functionality

### Testing Setup

- Framework: Vitest with jsdom
- Testing Library: @testing-library/react + user-event
- Setup file: `src/test/setup.js` (configures @testing-library/jest-dom)
- Mock localStorage and Web Speech API in tests as needed

### Default Word List

The app includes 15 default starter words (defined in `wordModel.js`): adventure, beautiful, celebrate, dinosaur, elephant, fantastic, guitar, happiness, island, journey, knowledge, lightning, mountain, notebook, ocean.

## Common Patterns

### Adding New Features

- Store persistent data via `storage.js` functions (getWords, saveWords, getScore, saveScore)
- For TTS features, use `tts.js` service (check `isTTSSupported()` before calling `speakWord()`)
- Word operations should validate with `isValidWord()` and `isDuplicate()` from `wordModel.js`

### Test Naming Convention

Test files are colocated: `Component.jsx` → `Component.test.jsx`. Use descriptive test names focused on behavior.

### Browser Compatibility Notes

- Requires Web Speech API (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- Voice loading is async in some browsers - use `initializeVoices()` if needed
- localStorage quota errors are caught and logged in storage service
