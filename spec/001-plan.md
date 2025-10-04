# Word Learning App - Implementation Plan

## Overview

This plan breaks down the development of the Word Learning app into discrete work items. Each item can be implemented independently by developers and includes clear acceptance criteria.

**Tech Stack**: React, Web Speech API, localStorage
**Target**: Kids aged 8-12
**Deployment**: Static website

---

## Work Items

### WI-01: Project Setup ✅

**Description**: Initialize the React application with necessary tooling and dependencies.

**Tasks**:
- Create new React app using Vite or Create React App
- Set up project structure (components/, services/, utils/ folders)
- Install any additional dependencies if needed
- Configure basic routing/navigation if using a router (optional)
- Set up .gitignore for node_modules, build artifacts

**Acceptance Criteria**:
- [x] React app runs successfully with `npm start` or equivalent
- [x] Project structure is organized and ready for development
- [x] README contains basic setup instructions

**Estimated Effort**: 1-2 hours
**Status**: ✅ Completed

---

### WI-02: localStorage Service ✅

**Description**: Create a service module to handle all localStorage operations for words and scores.

**Tasks**:
- Create `services/storage.js` (or `.ts` if using TypeScript)
- Implement `getWords()` - retrieve word array from localStorage
- Implement `saveWords(words)` - save word array to localStorage
- Implement `getScore()` - retrieve current score
- Implement `saveScore(score)` - save score to localStorage
- Implement `resetScore()` - clear score back to 0
- Add error handling for localStorage access failures

**Acceptance Criteria**:
- [x] All CRUD operations work correctly
- [x] Data persists across browser sessions
- [x] Service handles missing/corrupted data gracefully (returns empty array/0)
- [x] Service is exported and ready to import in components

**Estimated Effort**: 2-3 hours
**Status**: ✅ Completed

---

### WI-03: Word Database Model ✅

**Description**: Define data structures and validation logic for the word database.

**Tasks**:
- Define word data structure (initially just strings in an array)
- Create validation functions:
  - `isValidWord(word)` - checks if word is non-empty, alphabetic
  - `isDuplicate(word, wordList)` - checks for duplicates
- Create utility function `getRandomWord(wordList)` for random selection
- Add default starter words for initial database (optional, 10-15 words)

**Acceptance Criteria**:
- [x] Validation prevents empty or invalid words
- [x] Random selection works correctly
- [x] Functions are well-tested with edge cases (empty array, single word)
- [x] Default word list is age-appropriate

**Estimated Effort**: 1-2 hours
**Status**: ✅ Completed

---

### WI-04: Words Management UI ✅

**Description**: Build the interface for adding and managing words.

**Tasks**:
- Create `components/WordsManagement.jsx`
- Add input field for new word entry
- Add "Add Word" button
- Implement add word handler (validates + saves to localStorage)
- Display success/error messages for add operations
- Handle edge cases (empty input, duplicates, invalid characters)

**Acceptance Criteria**:
- [x] Users can add new words via input field
- [x] Duplicate words are rejected with clear message
- [x] Invalid words (empty, non-alphabetic) are rejected
- [x] Input field clears after successful addition
- [x] UI is clean and kid-friendly

**Estimated Effort**: 2-3 hours
**Status**: ✅ Completed

---

### WI-05: Words List Component ✅

**Description**: Display all words with the ability to delete them.

**Tasks**:
- Create `components/WordsList.jsx`
- Fetch and display all words from localStorage
- Add delete button next to each word
- Implement delete handler with confirmation
- Update UI when words are added/deleted
- Handle empty state (no words in database)

**Acceptance Criteria**:
- [x] All words display in a list/table format
- [x] Delete button removes word from localStorage and UI
- [x] Empty state shows helpful message ("No words yet. Add some!")
- [x] List updates in real-time when words change

**Estimated Effort**: 2-3 hours
**Status**: ✅ Completed

---

### WI-06: TTS Integration ✅

**Description**: Implement Web Speech API wrapper for text-to-speech functionality.

**Tasks**:
- Create `services/tts.js`
- Implement `speakWord(word)` using `window.speechSynthesis`
- Add voice selection (prefer child-friendly voice if available)
- Add error handling for browsers without TTS support
- Add speech rate/pitch configuration for clarity
- Implement `stopSpeaking()` to cancel ongoing speech

**Acceptance Criteria**:
- [x] Function speaks provided word clearly
- [x] Works in Chrome, Firefox, Safari
- [x] Graceful fallback/error message if TTS unavailable
- [x] Speech can be stopped mid-word
- [x] Rate/pitch are appropriate for kids (not too fast/slow)

**Estimated Effort**: 2-3 hours
**Status**: ✅ Completed

---

### WI-07: Practice Pane Layout ✅

**Description**: Create the main practice interface structure.

**Tasks**:
- Create `components/PracticePane.jsx`
- Set up component state for:
  - Current word
  - User input
  - Score
  - Feedback message
- Add "Speak Word" button
- Add "Replay Word" button (speaks current word again)
- Create layout sections for input, feedback, score display
- Style for kid-friendly appearance (large fonts, clear spacing)

**Acceptance Criteria**:
- [x] Component renders all UI elements
- [x] Layout is clean and easy for kids to understand
- [x] Buttons are large and clearly labeled
- [x] Score displays prominently

**Estimated Effort**: 2-3 hours
**Status**: ✅ Completed

---

### WI-08: Word Selection Logic ✅

**Description**: Implement random word picker for practice sessions.

**Tasks**:
- Create `selectNextWord()` function in PracticePane
- Integrate with `getRandomWord()` from WI-03
- Handle edge case: no words in database (show message to add words)
- Automatically speak word when selected (or wait for button click)
- Prevent same word appearing twice in a row (if possible)

**Acceptance Criteria**:
- [x] Random word selected from database
- [x] Word is spoken automatically or via button
- [x] Handles empty database gracefully
- [x] Word changes when "Next Word" clicked

**Estimated Effort**: 1-2 hours
**Status**: ✅ Completed

---

### WI-09: Input & Submit Component ✅

**Description**: Build text input field and submission logic.

**Tasks**:
- Add controlled text input to PracticePane
- Add "Submit" button
- Implement submit handler (on button click and Enter key)
- Clear input after submission
- Disable submit while feedback is showing
- Focus input after feedback is dismissed

**Acceptance Criteria**:
- [x] User can type into input field
- [x] Submit works via button and Enter key
- [x] Input clears after submission
- [x] Input is disabled during feedback display
- [x] Input auto-focuses for next word

**Estimated Effort**: 1-2 hours
**Status**: ✅ Completed

---

### WI-10: Spell Checker Logic ✅

**Description**: Compare user input with correct spelling and identify errors.

**Tasks**:
- Create `utils/spellChecker.js`
- Implement `checkSpelling(userInput, correctWord)` function
- Return result object:
  - `isCorrect`: boolean
  - `userAnswer`: string
  - `correctAnswer`: string
  - `highlights`: array marking which characters are wrong
- Handle case-insensitive comparison
- Handle different lengths (extra/missing letters)

**Acceptance Criteria**:
- [x] Correctly identifies matching spellings
- [x] Identifies incorrect positions
- [x] Comparison is case-insensitive
- [x] Works with words of different lengths
- [x] Returns structured data for UI rendering

**Estimated Effort**: 2-3 hours
**Status**: ✅ Completed

---

### WI-11: Feedback Display ✅

**Description**: Show correct spelling with user's mistakes highlighted.

**Tasks**:
- Create `components/FeedbackDisplay.jsx`
- Display correct spelling prominently
- Display user's attempt with incorrect letters in red
- Show character-by-character comparison (e.g., aligned vertically)
- Add encouraging messages ("Great job!" or "Try again!")
- Add "Next Word" button to dismiss feedback

**Acceptance Criteria**:
- [x] Correct spelling clearly displayed
- [x] User's mistakes highlighted in red
- [x] Encouraging tone for both success and errors
- [x] "Next Word" button visible
- [x] Feedback is visually clear for kids

**Estimated Effort**: 2-3 hours
**Status**: ✅ Completed

---

### WI-12: Score Tracker ✅

**Description**: Implement and display running score.

**Tasks**:
- Add score state to PracticePane
- Increment score by 1 for correct answers
- Score remains same for incorrect answers
- Persist score to localStorage after each update
- Display score prominently in UI
- Add "Reset Score" button (optional, for starting fresh)

**Acceptance Criteria**:
- [x] Score increments correctly
- [x] Score persists across page refreshes
- [x] Score displays clearly in UI
- [x] Reset functionality works (if implemented)

**Estimated Effort**: 1-2 hours
**Status**: ✅ Completed

---

### WI-13: Navigation Between Panes ✅

**Description**: Create tab/pane switching between Practice and Manage Words views.

**Tasks**:
- Create `components/App.jsx` as main container
- Add tab navigation UI (two tabs: "Practice" and "Manage Words")
- Implement state to track active pane
- Conditionally render PracticePane or WordsManagement
- Style tabs to show active state
- Ensure switching preserves state (score doesn't reset)

**Acceptance Criteria**:
- [x] Users can switch between Practice and Manage Words
- [x] Active tab is visually indicated
- [x] Switching doesn't reset score or word database
- [x] Navigation is intuitive for kids

**Estimated Effort**: 2 hours
**Status**: ✅ Completed

---

### WI-14: Styling & UX Polish

**Description**: Apply kid-friendly design with clear visual feedback.

**Tasks**:
- Choose large, readable fonts (18px+ for body text)
- Use bright, encouraging colors (not too overwhelming)
- Add CSS for:
  - Large, clickable buttons
  - Clear spacing between elements
  - Highlighted feedback (green for correct, red for errors)
  - Responsive layout (works on tablets/mobile)
- Add loading states for TTS
- Add animations/transitions (optional, keep subtle)
- Test with accessibility tools (keyboard navigation, screen readers)

**Acceptance Criteria**:
- [ ] App is visually appealing and age-appropriate
- [ ] Buttons are large and easy to click
- [ ] Colors provide clear feedback
- [ ] Layout works on different screen sizes
- [ ] App is accessible (basic keyboard navigation works)

**Estimated Effort**: 3-4 hours

---

### WI-15: Testing & Edge Cases

**Description**: Handle edge cases and ensure robust behavior.

**Tasks**:
- Test with empty word database
- Test TTS on different browsers (Chrome, Firefox, Safari)
- Handle localStorage quota exceeded
- Handle rapid button clicking (prevent race conditions)
- Test with very long words
- Test with special characters in input
- Add user-facing error messages for all failure states
- Write basic unit tests for critical functions (spellChecker, storage)

**Acceptance Criteria**:
- [ ] App handles empty database gracefully
- [ ] TTS failures show helpful error message
- [ ] No crashes on rapid interactions
- [ ] Special characters handled appropriately
- [ ] Error messages are kid-friendly
- [ ] Critical functions have passing tests

**Estimated Effort**: 3-4 hours

---

## Implementation Order Recommendation

**Phase 1 - Foundation** (WI-01, WI-02, WI-03)
Set up project, storage, and data models

**Phase 2 - Word Management** (WI-04, WI-05)
Build words database management interface

**Phase 3 - Core Practice Features** (WI-06, WI-07, WI-08, WI-09, WI-10)
Implement TTS and spelling practice logic

**Phase 4 - Feedback & Scoring** (WI-11, WI-12)
Add feedback display and score tracking

**Phase 5 - Integration & Polish** (WI-13, WI-14, WI-15)
Navigation, styling, testing

---

## Future Enhancements (Not in Initial Version)

- Difficulty tracking per word
- Adaptive word frequency (show harder words more often)
- Session management (structured practice sessions)
- Time limits per word
- Pause/resume session state
- Multiple user profiles
- Word categories/themes
- Progress charts/statistics

---

## Notes for Developers

- Keep code simple and readable - this is a learning app
- Comment any complex logic, especially spell checking algorithm
- Test TTS early and often across browsers
- localStorage has ~5-10MB limit - more than enough for word lists
- Prioritize UX for kids: big buttons, clear feedback, encouraging messages
- Consider adding sound effects for correct/incorrect (optional enhancement)
