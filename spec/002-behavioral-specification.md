# Behavioral Specification: Word Learning App

## 1. Overview

A browser-based spelling practice application for children. The app uses text-to-speech to present words, captures user input, and provides immediate feedback on spelling accuracy with character-level comparison.

## 2. Word Management

### 2.1 Word Database
- The app maintains a simple list of words
- Words are stored as plain text strings only (no metadata, categories, or difficulty levels)
- The initial word database is empty

### 2.2 Adding Words
- Users can add words through a separate panel within the app
- Any word can be added (no validation, length restrictions, or filtering)
- Words are available for practice immediately after being added

### 2.3 Removing Words
- Users can delete words from the database
- Deletion is permanent

## 3. Practice Session Flow

### 3.1 Session Start
- Practice session begins when the user loads the app in the browser
- Each session consists of exactly 10 words
- Words are randomly selected from the database
- No filtering or selection criteria (all words have equal probability)

### 3.2 Word Presentation
- When a new word is selected, the text-to-speech audio plays automatically
- A replay button is available for the user to hear the word again
- The user can replay the audio as many times as needed

### 3.3 Answer Submission
- User types their answer into a text field
- Answer can be submitted by:
  - Clicking a submit button, OR
  - Pressing the Enter key

### 3.4 Answer Evaluation
- Spelling is **case-insensitive** (e.g., "Apple" and "apple" are both correct)
- Exact character match required (ignoring case)

### 3.5 Feedback Display

#### 3.5.1 Correct Answer
- Show visual indication that the answer is correct
- Automatically advance to the next word after a few seconds

#### 3.5.2 Incorrect Answer
- Show character-by-character comparison between:
  - The correct spelling
  - The user's answer
- Highlight which characters are:
  - Missing
  - Extra
  - Wrong
- Automatically advance to the next word after a few seconds
- **No retry attempts** - user moves on after seeing the comparison

### 3.6 During Session
- Display a running score showing current progress (e.g., "3/5 correct")
- Update score after each word evaluation

### 3.7 Session End
- After all 10 words are completed, display a summary screen
- Summary shows: "N out of 10" (where N is the number of correct answers)
- Include a "Restart" button to begin a new session

## 4. User Management

- No user accounts, profiles, or login system
- Single-user application per browser instance
- Anyone using the app has full access to:
  - Practice sessions
  - Word management (add/delete)

## 5. Data Persistence

### 5.1 What is Stored
- Word list (persists across sessions)

### 5.2 What is NOT Stored
- Session history
- Past scores
- Per-word statistics (attempt count, success rate)
- User progress data

Each practice session is independent with no historical tracking.

## 6. UI Requirements

The application should have at minimum two distinct views/panels:

1. **Practice View**: Where the spelling practice session occurs
2. **Word Management View**: Where users can add and delete words

Navigation between these views should be straightforward and accessible.

## 7. Out of Scope (Version 1)

The following features are explicitly excluded from the initial version:

- Word categories or difficulty levels
- Filtered word selection
- Multiple user accounts
- Historical session data
- Word-level statistics
- Adaptive difficulty
- Timed sessions
- Score persistence
- Percentage calculations in summary
- Detailed results (list of missed words)
- Multiple attempts per word
