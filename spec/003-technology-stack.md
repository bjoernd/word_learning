# Technology Stack Specification

## 1. Executive Summary

This document defines the technology stack for the Word Learning application. The selected technologies prioritize ease of local development, future extensibility (word statistics, word groups), and reliability.

## 2. Core Technologies

### 2.1 Frontend Framework: React 19

**Selected:** React with TypeScript

**Rationale:**
- **Ecosystem Maturity:** Largest frontend ecosystem with 40% developer adoption (2025)
- **Scalability:** Excellent for expanding complexity - ideal for future features like word statistics tracking and word grouping
- **Component Architecture:** Component-based model aligns well with our app structure (practice view, word management, feedback components)
- **Developer Experience:** Extensive documentation, large community, easy to find solutions
- **Longevity:** Facebook-backed, stable, long-term support guaranteed

**Alternatives Considered:**
- **Vue:** Gentler learning curve but smaller ecosystem (15.4% adoption)
- **Svelte:** Best performance and smallest bundle (1.6KB vs React's 42KB), but much smaller ecosystem and fewer developers familiar with it
- **Decision:** React's maturity and ecosystem outweigh the bundle size difference for this application

### 2.2 Build Tool: Vite

**Selected:** Vite (latest stable version)

**Rationale:**
- **Development Speed:** Near-instant dev server startup using native ES modules
- **Modern Standard:** Becoming default for React projects in 2025
- **Simplicity:** Minimal configuration, works out-of-the-box
- **Performance:** Faster builds than webpack using esbuild
- **Local Development:** Exceptional local development experience with hot module replacement

**Setup Command:**
```bash
npm create vite@latest word-learning-app -- --template react-ts
```

**Alternatives Considered:**
- **Webpack:** More mature, better for complex enterprise setups, but slower and more configuration needed
- **Decision:** Vite's developer experience and speed are ideal for this project's scope

### 2.3 Text-to-Speech: Web Speech API

**Selected:** Browser-native Web Speech API (SpeechSynthesis)

**Rationale:**
- **Zero Dependencies:** Built into modern browsers, no external libraries needed
- **Offline Capability:** Works without internet connection (critical for classroom use)
- **Ease of Implementation:** 3 lines of code to implement basic TTS
- **Browser Support:** Fully supported in Chrome 33+, Firefox 49+, Safari 7.1+, Edge 14+ (75/100 compatibility score)
- **Cost:** Free

**Implementation Example:**
```javascript
const utterance = new SpeechSynthesisUtterance("hello");
speechSynthesis.speak(utterance);
```

**Known Limitations:**
- Voice quality varies by operating system
- Android pause functionality doesn't work (not needed for our use case)
- Some browsers require online connection for certain voices
- Voice availability differs between platforms

**Mitigation Strategy:**
- Test on target platforms (Chrome, Firefox, Safari on desktop)
- Document browser requirements for users
- Consider fallback library if issues arise in production

**Fallback Option (if needed):**
- **ResponsiveVoice.js:** Commercial library with 51+ languages, consistent cross-browser behavior
- Only implement if Web Speech API proves unreliable in testing

### 2.4 Data Storage: IndexedDB with Dexie.js

**Selected:** IndexedDB accessed via Dexie.js wrapper library

**Rationale for IndexedDB:**
- **Storage Capacity:** Up to 50% of available disk space vs 5MB for localStorage
- **Complex Data Support:** Stores JavaScript objects natively
- **Future Requirements:** Essential for word statistics (attempt counts, success rates) and word groups
- **Performance:** Asynchronous operations don't block UI
- **Query Capability:** Supports indexing and complex queries needed for filtering word groups

**Rationale for Dexie.js:**
- **Ease of Use:** Simple, fluent API that makes IndexedDB approachable
- **React Integration:** Official React hooks package (`dexie-react-hooks`)
- **Versioning Support:** Built-in schema versioning for database migrations
- **Performance:** Optimized for large datasets and bulk operations
- **Active Maintenance:** Popular library (1.5M+ weekly downloads) with regular updates

**Installation:**
```bash
npm install dexie dexie-react-hooks
```

**Example Schema:**
```typescript
import Dexie from 'dexie';

class WordDatabase extends Dexie {
  words!: Dexie.Table<Word, number>;

  constructor() {
    super('WordLearningDB');
    this.version(1).stores({
      words: '++id, word'
    });
  }
}

interface Word {
  id?: number;
  word: string;
}
```

**Future Schema (v2 - with statistics):**
```typescript
this.version(2).stores({
  words: '++id, word, groupId',
  wordStats: '++id, wordId, attempts, successes',
  wordGroups: '++id, name'
});
```

**Alternatives Considered:**
- **localStorage:** Too limited (5MB, string-only) for future requirements
- **idb:** Lower-level API, more verbose than Dexie
- **localForage:** Good abstraction but less powerful querying than Dexie
- **Decision:** Dexie provides the best balance of ease-of-use and capability

### 2.5 Language: TypeScript

**Selected:** TypeScript 5.x (latest stable)

**Rationale:**
- **Type Safety:** Catches bugs at compile-time before runtime
- **IDE Support:** Excellent autocomplete and refactoring tools
- **Maintainability:** Self-documenting code with interfaces
- **Vite Default:** Included in Vite React TypeScript template
- **Scalability:** Essential for managing complexity as app grows

**Configuration:** Use Vite's default `tsconfig.json` with strict mode enabled

## 3. Supporting Technologies

### 3.1 Styling

**Recommended:** CSS Modules (built into Vite)

**Rationale:**
- **Scoped Styles:** Prevents CSS conflicts without additional tooling
- **Zero Config:** Works out-of-the-box with Vite
- **Component Co-location:** CSS files live next to components

**Alternative:** Tailwind CSS if rapid prototyping is preferred

### 3.2 Package Manager

**Recommended:** npm (default) or pnpm

**Rationale:**
- **npm:** Comes with Node.js, universally compatible
- **pnpm:** Faster, more disk-efficient if preferred

### 3.3 Development Tools

- **ESLint:** Code quality and consistency
- **Prettier:** Code formatting
- **React DevTools:** Browser extension for debugging

## 4. Project Structure

```
word-learning-app/
├── src/
│   ├── components/        # React components
│   │   ├── Practice/      # Practice session view
│   │   ├── WordManager/   # Word management view
│   │   └── shared/        # Reusable components
│   ├── services/          # Business logic
│   │   ├── database.ts    # Dexie database setup
│   │   └── speech.ts      # Text-to-speech utilities
│   ├── types/             # TypeScript type definitions
│   ├── App.tsx            # Main app component
│   └── main.tsx           # Entry point
├── package.json
├── tsconfig.json
├── vite.config.ts
└── index.html
```

## 5. Browser Requirements

### Minimum Supported Browsers

- **Chrome:** 90+
- **Firefox:** 90+
- **Safari:** 14+
- **Edge:** 90+

**Rationale:** Ensures Web Speech API and IndexedDB support

### Not Supported

- Internet Explorer (any version)
- Legacy mobile browsers
- Opera Mini

## 6. Development Workflow

### Initial Setup

```bash
# Create project
npm create vite@latest word-learning-app -- --template react-ts

# Navigate to project
cd word-learning-app

# Install dependencies
npm install

# Install additional libraries
npm install dexie dexie-react-hooks

# Start development server
npm run dev
```

### Development Commands

```bash
npm run dev          # Start dev server (http://localhost:5173)
npm run build        # Production build
npm run preview      # Preview production build locally
npm run lint         # Run ESLint
```

### Local Execution

- Application runs entirely in the browser
- No backend server required
- Data persists in browser's IndexedDB
- Works offline after initial load

## 7. Deployment Options (Future)

While deployment is not in scope for v1, this stack supports multiple deployment options:

- **Static Hosting:** Netlify, Vercel, GitHub Pages, Cloudflare Pages
- **Self-Hosted:** Any web server (Apache, Nginx)
- **Electron:** Can be packaged as desktop app if needed

## 8. Scalability Considerations

This stack is well-suited for planned future features:

### Word Statistics Tracking
- **IndexedDB:** Can efficiently store attempt counts, success rates per word
- **Dexie.js:** Supports complex queries for analytics
- **React:** Component architecture makes it easy to add statistics views

### Word Groups/Categories
- **Database Schema:** Dexie versioning allows adding word groups without data loss
- **UI Components:** React component model facilitates group selection UI
- **IndexedDB:** Supports relational-style queries between words and groups

### Multi-User Support (if needed)
- **IndexedDB:** Can store user profiles with separate word lists
- **React:** Context API or state management (Zustand/Redux) for user sessions

## 9. Risks and Mitigations

### Risk: Web Speech API Reliability
- **Mitigation:** Thorough testing on target browsers; fallback to ResponsiveVoice.js if needed
- **Impact:** Medium - core feature, but alternatives exist

### Risk: IndexedDB Browser Quota
- **Mitigation:** Monitor storage usage; implement cleanup for old data if needed
- **Impact:** Low - unlikely to hit limits with text-only word storage

### Risk: Safari IndexedDB Auto-Deletion
- **Mitigation:** Document data persistence limitations; consider export/import feature
- **Impact:** Low - primarily affects users with very low disk space

## 10. Technology Decision Summary

| Component | Technology | Primary Reason |
|-----------|-----------|----------------|
| Framework | React 19 + TypeScript | Ecosystem maturity, scalability |
| Build Tool | Vite | Development speed, modern standard |
| TTS | Web Speech API | Zero dependencies, offline support |
| Database | IndexedDB + Dexie.js | Storage capacity, future extensibility |
| Styling | CSS Modules | Simplicity, zero config |
| Package Manager | npm | Universal compatibility |

## 11. Next Steps

1. Initialize project with Vite
2. Set up Dexie.js database schema
3. Create basic component structure
4. Implement text-to-speech service
5. Build practice session flow
6. Build word management interface
