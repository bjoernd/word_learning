# Word Learning

## Idea

We are going to build an app that is helping kids learn proper spelling. The
app will manage a database of words. It will use text-to-speech technology to
read individual words. Then underage users will type the respective word into a
text field. They will achieve scores for correct spelling and be able to see
where they made mistakes.

## Target Audience

Kids aged 8-12 years old.

## Technical Stack

- **Framework**: React
- **TTS**: Web Speech API (built into modern browsers)
- **Storage**: localStorage (for word database and scores)
- **Deployment**: Static website, no server component

## Features

### Core Features (Initial Version)

1. **Game Pane**
   - Random word selection from database
   - TTS reads the word aloud (using Web Speech API)
   - Text input field for kid to type the word
   - Submit button to check spelling
   - Feedback display:
     - Show correct spelling
     - Display user's attempt with incorrect letters marked in red
   - Score tracking: +1 point for correct spelling, 0 points for mistakes
   - "Next Word" button to continue practicing

2. **Words Management Pane**
   - Simple interface to add/remove words to/from database
   - List view of all words in database
   - No restrictions on who can manage words
   - No metadata tracking (just word strings)

3. **Word Database**
   - Stored in localStorage
   - Simple array of word strings
   - Random selection algorithm for practice

### Future Features (Not in Initial Version)

- Difficulty tracking: monitor which words are harder for the kid
- Adaptive word frequency: show difficult words more often
- Session management: structured practice sessions
- Time limits per word
- Persistent session state (pause/resume)

## User Flow

1. User opens app
2. Can switch between "Practice" and "Manage Words" panes
3. **Practice Flow**:
   - Click "Speak Word" or auto-play word
   - Type spelling in text field
   - Click "Submit"
   - See feedback (correct answer + highlighted mistakes)
   - See updated score
   - Click "Next Word" to continue
4. **Manage Words Flow**:
   - View list of words
   - Add new words via input field
   - Delete words from list
