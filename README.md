# Word Learning App

A React-based spelling practice application designed to help kids aged 8-12 learn proper spelling through interactive exercises.

## Features

- **Practice Mode**: Kids can practice spelling words with text-to-speech pronunciation
- **Word Management**: Easy interface to add and remove words from the practice database
- **Score Tracking**: Track progress with a running score counter
- **Visual Feedback**: Clear feedback showing correct spelling and highlighting mistakes
- **Browser-based Storage**: All data stored locally using localStorage (no server required)

## Tech Stack

- **Framework**: React 18
- **Build Tool**: Vite
- **Text-to-Speech**: Web Speech API (built into modern browsers)
- **Storage**: localStorage
- **Deployment**: Static website (no backend required)

## Project Structure

```
src/
├── components/     # React components (Practice, WordsManagement, etc.)
├── services/       # Business logic (storage, TTS)
├── utils/          # Helper functions (spell checker, validation)
├── assets/         # Static assets
├── App.jsx         # Main app component
└── main.jsx        # Entry point
```

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd word-learning-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

### Available Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Browser Compatibility

The app requires a modern browser with support for:
- ES6+ JavaScript
- Web Speech API (for text-to-speech)
- localStorage

Tested on:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Development Roadmap

See `spec/001-plan.md` for the full implementation plan with detailed work items.

### Current Status

- [x] WI-01: Project Setup
- [x] WI-02: localStorage Service

### Upcoming Work Items

- [ ] WI-03: Word Database Model
- [ ] WI-04: Words Management UI
- [ ] WI-05: Words List Component
- And more...

## Contributing

See the implementation plan in `spec/001-plan.md` for available work items. Each work item includes:
- Clear description and tasks
- Acceptance criteria
- Estimated effort

## License

MIT
