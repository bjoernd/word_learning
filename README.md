# Word Learning

A web application for practicing spelling through listening exercises. The app speaks words aloud and asks you to type what you hear, providing immediate feedback on your answers.

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

## How to Use

### Adding Words

1. Click the "Manage Words" tab
2. Type a word in the input field
3. Press Enter or click "Add Word"
4. Repeat to build your word list

### Practicing

1. Click the "Practice" tab
2. The app will speak a word aloud
3. Type the word you heard
4. Press Enter or click "Submit"
5. Review the feedback showing whether your answer was correct
6. Continue through 10 words to complete a practice session
7. View your score and click "Restart" to practice again

### Tips

- Use the "🔊 Replay Word" button to hear the word again
- Answers are not case-sensitive
- For incorrect answers, the app shows which letters are right, wrong, or missing
- Words are stored in your browser and persist between sessions
