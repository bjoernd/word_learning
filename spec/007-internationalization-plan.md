# Internationalization (i18n) Implementation Plan

## Overview

This document outlines the plan to add internationalization support to the Word Learning application, initially supporting English and German UI languages.

**Current Scope**:
- UI language: German (default) or English (user-selectable)
- Practice words: English only
- TTS voices: English only
- Future: Multi-language word practice with German translations (see Future Considerations)

## Goals

1. Make all user-visible strings translatable
2. Support language switching via UI control
3. Persist user's language preference
4. Maintain type safety with TypeScript
5. Keep solution simple and maintainable (YAGNI principle)

## Technology Choice

**Library**: react-i18next

**Rationale**:
- Most popular i18n solution for React (stable and well-maintained)
- Excellent TypeScript support with type-safe translation keys
- Lightweight and works well with React hooks
- Simple JSON-based translation files
- Built-in language detection and persistence
- No additional build tools required

**Alternative Considered**: react-intl
- More complex API with components vs hooks
- Heavier dependency
- Overkill for our simple string replacement needs

## File Structure

```
src/
├── i18n/
│   ├── config.ts              # i18next configuration
│   ├── locales/
│   │   ├── en/
│   │   │   └── translation.json
│   │   └── de/
│   │       └── translation.json
│   └── types.ts               # TypeScript types for translations
├── components/
│   └── LanguageSwitcher/
│       ├── LanguageSwitcher.tsx
│       └── LanguageSwitcher.module.css
```

## Translation Key Naming Convention

Keys should follow a hierarchical structure reflecting the component and context:

```
{component}.{context}.{identifier}
```

Examples:
- `app.nav.practice` → "Practice"
- `practice.start.heading` → "Ready to Practice?"
- `wordManager.button.add` → "Add Word"
- `voiceSelector.voice.playing` → "Playing..."

For simple single-use strings, shorter keys are acceptable:
- `common.loading` → "Loading..."
- `common.delete` → "Delete"

## Translation File Structure

### English (en/translation.json)

```json
{
  "app": {
    "title": "Word Learning",
    "nav": {
      "practice": "Practice",
      "manageWords": "Manage Words",
      "voiceSelector": "Voice Selector"
    }
  },
  "practice": {
    "loading": "Loading...",
    "empty": {
      "message": "No words available for practice.",
      "guidance": "Please add some words in the Manage Words tab first."
    },
    "start": {
      "heading": "Ready to Practice?",
      "instruction": "Click Start to hear the first word.",
      "button": "Start Practice"
    },
    "answer": {
      "score": "Score: {{score}}/{{total}}",
      "placeholder": "Type the word you heard",
      "replayButton": "🔊 Replay Word",
      "submitButton": "Submit",
      "correct": "Correct!",
      "incorrect": "Incorrect",
      "correctIcon": "✓",
      "incorrectIcon": "✗"
    },
    "comparison": {
      "correctLabel": "Correct:",
      "yourAnswerLabel": "Your answer:",
      "missingChar": "_"
    },
    "summary": {
      "heading": "Session Complete!",
      "scoreOf": " out of ",
      "restartButton": "Restart"
    }
  },
  "wordManager": {
    "heading": "Manage Words",
    "wordCount": "Words: {{count}} / 1,000",
    "input": {
      "placeholder": "Enter a word",
      "ariaLabel": "New word to add"
    },
    "button": {
      "add": "Add Word",
      "delete": "Delete",
      "deleteAriaLabel": "Delete word {{word}}"
    },
    "message": {
      "empty": "No words yet. Add some words to start practicing.",
      "addFailed": "Failed to add word",
      "deleteConfirm": "Delete this word?"
    }
  },
  "voiceSelector": {
    "loading": "Loading voices...",
    "heading": "Voice Selector",
    "currentlySelected": "Currently Selected:",
    "allVoices": "All Voices ({{count}})",
    "instructions": "Use arrow keys to navigate, Enter or Space to play, or double-click a voice",
    "voice": {
      "language": "Language: {{lang}}",
      "default": "Default",
      "local": "Local",
      "practice": "Practice",
      "practiceVoice": "Practice voice: {{voiceName}}",
      "playing": "Playing...",
      "playTest": "Play \"{{phrase}}\"",
      "setButton": "Set as Practice Voice",
      "testPhrase": "Hello world"
    }
  }
}
```

### German (de/translation.json)

Initially, create file with same structure but values set to `"[DE] {english_text}"` placeholders. Bjoern will provide actual translations.

```json
{
  "app": {
    "title": "[DE] Word Learning",
    "nav": {
      "practice": "[DE] Practice",
      ...
    }
  },
  ...
}
```

## Language Persistence

Store user's language preference in localStorage under key `'userLanguage'`.

**Flow**:
1. On app load, check localStorage for `'userLanguage'`
2. If found, use that language
3. If not found, default to German (UI language)
4. When user switches language, update localStorage and active language

**Note**: The default UI language is German. Practice words are currently English-only, spoken by English voices.

## Language Switcher UI

### Placement Options

**Option A (Recommended)**: Add to main navigation bar
- Place language switcher in top-right corner of App.tsx header
- Compact dropdown or button group (EN | DE)
- Always visible regardless of active tab
- Most conventional placement for language switchers

**Option B**: Add to VoiceSelector tab
- Place alongside voice settings
- Groups all user preferences together
- Less visible to users who only use Practice tab

**Recommendation**: Option A - conventional placement, always accessible

### Component Design

Simple button group toggle:
```
[EN] [DE]
```
- Active language highlighted with different background
- Click to switch
- Accessible keyboard navigation
- ARIA labels for screen readers

## Implementation Steps

### Phase 1: Setup (Foundation)

1. **Install dependencies** ✅
   ```bash
   npm install react-i18next i18next
   ```

2. **Create i18n configuration** (`src/i18n/config.ts`) ✅
   - Initialize i18next
   - Configure language detection from localStorage
   - Set up localStorage persistence
   - Define default language as German (fallback to English if German unavailable)
   - Load translation resources for both languages

3. **Create translation files** ✅
   - `src/i18n/locales/en/translation.json` (complete English translations)
   - `src/i18n/locales/de/translation.json` (placeholder structure for Bjoern's translations)

4. **Create TypeScript types** (`src/i18n/types.ts`) ✅
   - Type-safe translation keys
   - Prevent typos in translation key usage

5. **Update App.tsx** ✅
   - Import and initialize i18n
   - Wrap app with I18nextProvider (if needed)

### Phase 2: Language Switcher Component

6. **Create LanguageSwitcher component** ✅
   - Button group UI (EN/DE toggle)
   - Language change handler
   - localStorage update on change
   - Active state styling
   - Keyboard accessibility

7. **Add LanguageSwitcher to App.tsx header** ✅
   - Position in top-right corner
   - Ensure visibility on all tabs

### Phase 3: Component Updates (Convert Strings)

Convert each component to use `useTranslation` hook and translation keys:

8. **App.tsx**
   - Application title
   - Navigation tab labels

9. **Practice.tsx**
   - Loading state
   - Empty state messages
   - Start screen text

10. **AnswerInput.tsx**
    - Score display (with interpolation)
    - Button labels
    - Placeholder text
    - Feedback messages

11. **CharacterComparison.tsx**
    - Comparison labels

12. **SessionSummary.tsx**
    - Completion heading
    - Score display (with interpolation)
    - Restart button

13. **WordManager.tsx**
    - Heading
    - Word count (with interpolation)
    - Input placeholder and labels
    - Button labels
    - Messages
    - Confirmation dialog
    - ARIA labels (with interpolation)

14. **VoiceSelector.tsx**
    - Loading state
    - Headings (with interpolation for count)
    - Instructions
    - Voice information (with interpolation)
    - Button labels
    - Test phrase (translates based on UI language: "Hello world" / "Hallo Welt")

### Phase 4: Testing

15. **Manual Testing**
    - Verify all strings render correctly in English
    - Switch to German, verify placeholder translations appear
    - Verify language preference persists across page reloads
    - Test all dynamic string interpolations (scores, counts, etc.)
    - Test on different browsers

16. **Unit Tests**
    - Test LanguageSwitcher component
    - Test language persistence
    - Add i18n test utilities to `src/test/setup.ts`
    - Update existing component tests to handle translations

### Phase 5: German Translation

17. **Translation Handoff**
    - Provide Bjoern with `de/translation.json` template
    - Include context notes for ambiguous strings
    - Document interpolation variables ({{score}}, {{count}}, etc.)

18. **Translation Integration**
    - Replace placeholder translations with Bjoern's German translations
    - Verify all translations render correctly
    - Test for layout issues (German text often longer than English)

19. **Final Review**
    - Complete end-to-end testing in both languages
    - Verify no hardcoded strings remain
    - Check for text overflow/layout issues
    - Update CLAUDE.md documentation

## String Inventory

### Complete List of Translatable Strings (47 total)

**App.tsx (4 strings)**
- `"Word Learning"` - Application title
- `"Practice"` - Tab label
- `"Manage Words"` - Tab label
- `"Voice Selector"` - Tab label

**Practice.tsx (6 strings)**
- `"Loading..."` - Loading state
- `"No words available for practice."` - Empty state message
- `"Please add some words in the Manage Words tab first."` - Guidance
- `"Ready to Practice?"` - Start heading
- `"Click Start to hear the first word."` - Start instruction
- `"Start Practice"` - Start button

**AnswerInput.tsx (7 strings)**
- `"Score: {score}/{answersCount}"` - Score display (interpolated)
- `"🔊 Replay Word"` - Replay button
- `"Submit"` - Submit button
- `"Type the word you heard"` - Input placeholder
- `"✓"` - Correct icon
- `"Correct!"` - Correct feedback
- `"✗"` - Incorrect icon
- `"Incorrect"` - Incorrect feedback

**CharacterComparison.tsx (3 strings)**
- `"Correct:"` - Correct word label
- `"Your answer:"` - User answer label
- `"_"` - Missing character placeholder

**SessionSummary.tsx (3 strings)**
- `"Session Complete!"` - Completion heading
- `" out of "` - Score separator (e.g., "8 out of 10")
- `"Restart"` - Restart button

**WordManager.tsx (10 strings)**
- `"Manage Words"` - Component heading
- `"Words: {count} / 1,000"` - Word count (interpolated)
- `"Enter a word"` - Input placeholder
- `"Add Word"` - Add button
- `"New word to add"` - Input ARIA label
- `"Delete this word?"` - Delete confirmation
- `"No words yet. Add some words to start practicing."` - Empty state
- `"Failed to add word"` - Generic error message
- `"Delete"` - Delete button
- `"Delete word {word}"` - Delete button ARIA label (interpolated)

**VoiceSelector.tsx (14 strings)**
- `"Loading voices..."` - Loading state
- `"Voice Selector"` - Component heading
- `"Currently Selected:"` - Subheading
- `"All Voices ({count})"` - Subheading (interpolated)
- `"Use arrow keys to navigate, Enter or Space to play, or double-click a voice"` - Instructions
- `"Language: {lang}"` - Language label (interpolated)
- `"Default"` - Default badge
- `"Local"` - Local badge
- `"Practice voice: {voiceName}"` - Selected voice display (interpolated)
- `"Playing..."` - Playing state button text
- `"Play \"Hello world\""` - Play button text
- `"Set as Practice Voice"` - Set button
- `"Hello world"` - Test phrase
- `"Practice"` - Practice badge

## Type Safety Approach

Use TypeScript to ensure type-safe translation keys:

```typescript
// src/i18n/types.ts
import type { Resource } from 'i18next';
import en from './locales/en/translation.json';

export type TranslationKeys = typeof en;
export type TranslationResource = Resource;

// Augment i18next module for type safety
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: {
      translation: TranslationKeys;
    };
  }
}
```

This provides autocomplete and type checking when using translation keys in components.

## Testing Strategy

### Test Setup

Update `src/test/setup.ts` to include i18n test utilities:

```typescript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Initialize i18n for tests
i18n
  .use(initReactI18next)
  .init({
    lng: 'en',
    fallbackLng: 'en',
    resources: {
      en: { translation: require('../i18n/locales/en/translation.json') }
    },
    interpolation: {
      escapeValue: false,
    },
  });
```

### Component Tests

- Update existing tests to use translation keys instead of hardcoded strings
- Test language switching in LanguageSwitcher component
- Verify interpolation works correctly (scores, counts, etc.)
- Test localStorage persistence

## Edge Cases & Considerations

1. **Text Length Differences**
   - German text is typically 30-40% longer than English
   - Review component layouts for text overflow issues
   - May need flexible button widths or multi-line support

2. **Special Characters**
   - German uses umlauts (ä, ö, ü, ß)
   - Ensure proper UTF-8 encoding in all files
   - Test input handling with German words containing umlauts

3. **Dynamic Content**
   - Voice names and language codes from browser API remain untranslated
   - System error messages from browser APIs and services remain in English
   - This is acceptable and no custom error message wrappers needed

4. **Pluralization**
   - Not needed in current strings
   - If needed in future, i18next supports plural forms natively

5. **Date/Number Formatting**
   - Not applicable for current app (no dates or formatted numbers)
   - Score display is simple ratio (8/10) - language agnostic

## Future Considerations

1. **Additional Languages**
   - File structure supports easy addition of new languages
   - Add new folder under `src/i18n/locales/{language-code}/`
   - Update LanguageSwitcher options array

2. **Translation Management**
   - For more languages, consider translation management tool
   - JSON files work well for 2-3 languages
   - Could migrate to cloud-based translation platform if needed

3. **Multi-Language Word Practice** (Future Major Feature)
   - When German word translations are added to the database:
     - Add `language` field to word schema (database v2 migration)
     - Implement separate voice selection for German and English practice
     - Store `selectedVoiceURI_de` and `selectedVoiceURI_en` in localStorage
     - Voice selection based on word's language during practice
     - VoiceSelector UI shows which voice is configured for each language
   - This allows practicing both English and German words with appropriate voices
   - UI language remains independent from practice word language

## Success Criteria

Implementation is complete when:

- [ ] All 47 user-visible strings use translation keys
- [ ] Language switcher is functional and accessible
- [ ] Language preference persists across sessions
- [ ] English translations are complete and correct
- [ ] German translation file structure is ready for Bjoern's translations
- [ ] No hardcoded user-visible strings remain in components
- [ ] All tests pass in both languages
- [ ] No layout issues with longer German text
- [ ] TypeScript types provide autocomplete for translation keys
- [ ] Documentation (CLAUDE.md, README.md) updated

## Decisions Made

The following design decisions have been confirmed:

1. **Test Phrase Translation**: The VoiceSelector test phrase ("Hello world") will be translated based on the current UI language. German UI displays "Hallo Welt", English UI displays "Hello world".

2. **Error Messages**: System error messages from browser APIs or services may remain in English. No need to wrap them with custom translations.

3. **Default Language**: The application defaults to German as the UI language. Users can switch to English via the language switcher.

4. **Voice Selection**: Voice selection is language-agnostic for now. Users practice English words with English voices, regardless of UI language. Multi-language voice selection will be implemented later when German word translations are added to the database (see Future Considerations).
