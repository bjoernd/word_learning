# Word Learning

A web application for practicing spelling through listening exercises. The app speaks words aloud and asks you to type what you hear, providing immediate feedback with sound effects and animations.

## Installation

Install dependencies:
```bash
npm install
```

## Running the Application

### Development Mode

Start the development server:
```bash
npm run dev
```

Open your browser to the URL shown in the terminal (typically http://localhost:5173).

### Production Mode

Build the application:
```bash
npm run build
```

Run the production build locally:
```bash
npm run preview
```

The production files are in the `dist` directory and can be deployed to any web server.

**Note:** Do not open `dist/index.html` directly in your browser using `file://` protocol. This will cause CORS errors and the app will not load. Always use a web server (like `npm run preview`) to serve the built files.

## How to Use

### Adding Words

1. Click the "Manage Words" tab
2. Type a word in the input field
3. Press Enter or click "Add Word"
4. Repeat to build your word list

### Practicing

1. Click the "Practice" tab
2. Click "Start Practice" to begin
3. The app will speak a word aloud
4. Type the word you heard
5. Press Enter or click "Submit"
6. Review the feedback with sound effects and animations
7. Continue through 10 words to complete a practice session
8. View your score with a celebration animation and click "Restart" to practice again

### Selecting a Voice

1. Click the "Voice Selector" tab
2. Browse the list of available English voices
3. Click a voice to select it, or use arrow keys to navigate
4. Press Enter, Space, or double-click to hear "Hello world" in that voice
5. Click "Set as Practice Voice" to use this voice in practice sessions
6. Your voice selection is saved and will be used automatically

### Tips

- Use the "🔊 Replay Word" button to hear the word again
- Answers are not case-sensitive
- Incorrect answers display a character-by-character comparison showing which letters are right, wrong, or missing
- Sound effects and animations provide immediate feedback for each answer
- Different celebration animations appear based on your final score
- Words are stored in your browser and persist between sessions
