# Refactoring Plan: Code Quality Improvements

## Overview

This document outlines a systematic refactoring plan to improve code quality by eliminating duplication, reducing complexity, and improving maintainability. Each step is designed to be implemented and tested independently.

The plan contains **16 refactoring steps** organized into 3 phases by risk and value:
- **Phase 1**: 6 quick wins (3-5 hours, very low risk)
- **Phase 2**: 4 medium refactorings (5-8 hours, low-medium risk)
- **Phase 3**: 6 evaluate-first steps (10-20 hours, medium-high risk)

## Principles

- **DRY**: Don't Repeat Yourself - eliminate code duplication
- **YAGNI**: You Ain't Gonna Need It - remove unnecessary complexity
- **KISS**: Keep It Simple, Stupid - prefer simple solutions

## Quality Issues Addressed

| Step | Issue | Type | Files |
|------|-------|------|-------|
| 1 | Duplicate `typeof window` checks | DRY | speech.ts, soundEffects.ts, VoiceSelector.tsx |
| 2 | Duplicate Enter key handlers | DRY | WordManager.tsx, Practice.tsx |
| 3 | Duplicate session completion logic | DRY | Practice.tsx |
| 4 | Nested ternaries in className | KISS | Practice.tsx |
| 5 | Magic numbers scattered | Quality | Practice.tsx |
| 6 | Duplicate tab button blocks | DRY | App.tsx |
| 7 | Empty callback functions | Quality | Practice.tsx |
| 8 | Complex character rendering | KISS | Practice.tsx |
| 9 | Duplicate voice loading | DRY | speech.ts, VoiceSelector.tsx |
| 10 | Over-complex cancellation | YAGNI | speech.ts |
| 11 | Practice component too large | KISS | Practice.tsx |
| 12 | Complex compareAnswers algorithm | YAGNI | practiceLogic.ts |
| 13 | Inconsistent error handling | Quality | Multiple files |
| 14 | Complex confetti management | YAGNI | Practice.tsx |
| 15 | Questionable double-click handler | YAGNI | VoiceSelector.tsx |
| 16 | Triple state tracking | YAGNI | speech.ts |

## Prerequisites

- All existing tests must pass before starting
- Each step must maintain all existing tests in passing state
- Follow TDD: write/update tests first, then implement

---

## Step 1: Extract Browser Environment Check Helper ✅

**Status**: ✅ Complete
**Priority**: High
**Risk**: Low
**Files**: `src/utils/browser.ts` (new), `src/services/speech.ts`, `src/services/soundEffects.ts`

### Problem
Pattern `typeof window !== 'undefined'` appears 7+ times across multiple files.

### Implementation

1. **Write tests** in `src/utils/browser.test.ts`:
   - Test `isBrowser()` returns true in browser environment
   - Test `isBrowser()` returns false in non-browser environment

2. **Create utility** in `src/utils/browser.ts`:
   ```typescript
   export function isBrowser(): boolean {
     return typeof window !== 'undefined';
   }
   ```

3. **Replace usage** in:
   - `speech.ts`: Lines 15, 18, 38, 49, 153
   - `soundEffects.ts`: Lines 10, 53
   - `VoiceSelector.tsx`: Lines 27, 32

4. **Verify**:
   - All existing tests pass
   - No runtime errors
   - Bundle size unchanged or smaller

### Success Criteria
- ✅ All tests pass
- ✅ Helper used consistently across codebase
- ✅ No duplicate environment checks remain

---

## Step 2: Extract Enter Key Handler Utility

**Priority**: High
**Risk**: Low
**Files**: `src/utils/keyboard.ts` (new), `src/components/WordManager/WordManager.tsx`, `src/components/Practice/Practice.tsx`

### Problem
Identical Enter key handling pattern appears in 3+ locations.

### Implementation

1. **Write tests** in `src/utils/keyboard.test.ts`:
   - Test handler called when Enter pressed
   - Test handler not called for other keys
   - Test handler receives original event

2. **Create utility** in `src/utils/keyboard.ts`:
   ```typescript
   export function handleEnterKey(
     e: React.KeyboardEvent,
     handler: () => void
   ): void {
     if (e.key === 'Enter') {
       handler();
     }
   }
   ```

3. **Replace usage** in:
   - `WordManager.tsx`: Lines 36-40
   - `Practice.tsx`: Lines 205-209

4. **Consider** extracting keyboard event listener pattern from `Practice.tsx:145-149` as well

### Success Criteria
- ✅ All tests pass
- ✅ Keyboard interaction unchanged
- ✅ No duplicate Enter key handling logic

---

## Step 3: Extract Session Completion Check

**Priority**: High
**Risk**: Low
**Files**: `src/components/Practice/Practice.tsx`

### Problem
Exact duplicate logic at lines 130-132 and 278-280.

### Implementation

1. **Write tests** in `Practice.test.tsx`:
   - Test returns true when session complete
   - Test returns false when session incomplete
   - Test returns false when no words loaded

2. **Create useMemo hook** in `Practice.tsx`:
   ```typescript
   const isSessionComplete = useMemo(() => {
     return answers.length === sessionWords.length &&
            sessionWords.length > 0 &&
            feedback === null;
   }, [answers.length, sessionWords.length, feedback]);
   ```

3. **Replace both occurrences** with the memoized value

4. **Verify** no duplicate check logic remains

### Success Criteria
- ✅ All tests pass
- ✅ Session completion detection unchanged
- ✅ Logic appears only once

---

## Step 4: Extract Character CSS Class Helper

**Priority**: Medium
**Risk**: Low
**Files**: `src/utils/characterComparison.ts` (new), `src/components/Practice/Practice.tsx`

### Problem
Nested ternaries in character rendering (lines 224-227, 241-245) are hard to read.

### Implementation

1. **Write tests** in `src/utils/characterComparison.test.ts`:
   - Test returns correct class for 'match' state
   - Test returns correct class for 'wrong' state
   - Test returns correct class for 'missing' state
   - Test returns correct class for 'extra' state

2. **Create utility** in `src/utils/characterComparison.ts`:
   ```typescript
   import { CharacterMatch } from '../services/practiceLogic';

   export function getCharacterClassName(
     match: CharacterMatch,
     isUserAnswer: boolean,
     styles: Record<string, string>
   ): string {
     const baseClass = styles.char;

     switch (match) {
       case 'match':
         return `${baseClass} ${styles.charMatch}`;
       case 'missing':
         return `${baseClass} ${styles.charMissing}`;
       case 'extra':
         return `${baseClass} ${styles.charExtra}`;
       case 'wrong':
         return `${baseClass} ${styles.charWrong}`;
     }
   }
   ```

3. **Replace usage** in `Practice.tsx` character rendering

### Success Criteria
- ✅ All tests pass
- ✅ Character comparison display unchanged
- ✅ Code more readable

---

## Step 5: Extract Magic Number Constants

**Priority**: Medium
**Risk**: Low
**Files**: `src/components/Practice/Practice.tsx`

### Problem
Magic numbers scattered throughout Practice component.

### Implementation

1. **Update tests** to verify constants used correctly

2. **Add constants** at top of `Practice.tsx`:
   ```typescript
   const WORDS_PER_SESSION = 10;
   const CORRECT_FEEDBACK_DELAY_MS = 1000;
   const INCORRECT_FEEDBACK_DELAY_MS = 3000;

   // Confetti positioning
   const CONFETTI_MIN_POSITION = 30;
   const CONFETTI_POSITION_RANGE = 40;

   // Score thresholds
   const GOOD_SCORE_THRESHOLD = 60;
   const PERFECT_SCORE_THRESHOLD = 90;
   ```

3. **Replace magic numbers**:
   - Lines 117-118: Confetti positioning
   - Lines 139, 285-286: Score thresholds

### Success Criteria
- ✅ All tests pass
- ✅ No unexplained magic numbers in code
- ✅ Constants clearly named

---

## Step 6: Refactor Tab Navigation Buttons

**Priority**: Medium
**Risk**: Low
**Files**: `src/App.tsx`

### Problem
Three nearly identical button blocks (lines 17-34).

### Implementation

1. **Write tests** in `App.test.tsx` (create if needed):
   - Test all tabs render
   - Test clicking tab changes active tab
   - Test active tab has correct styling

2. **Refactor** to data-driven approach:
   ```typescript
   const TABS = [
     { id: 'practice' as const, label: 'Practice' },
     { id: 'manage' as const, label: 'Manage Words' },
     { id: 'voice' as const, label: 'Voice Selector' }
   ] as const;

   // In render:
   {TABS.map(tab => (
     <button
       key={tab.id}
       className={activeTab === tab.id ? styles.active : ''}
       onClick={() => setActiveTab(tab.id)}
     >
       {tab.label}
     </button>
   ))}
   ```

3. **Verify** tab switching still works

### Success Criteria
- ✅ All tests pass
- ✅ Tab navigation unchanged
- ✅ Code more maintainable

---

## Step 7: Make Animation onComplete Optional

**Priority**: Low
**Risk**: Low
**Files**: `src/components/Practice/Practice.tsx`

### Problem
Empty callbacks `onComplete={() => {}}` at lines 306, 314.

### Implementation

1. **Update tests** to verify optional callback works

2. **Update ConfettiAnimation**:
   ```typescript
   interface ConfettiAnimationProps {
     top: number;
     left: number;
     onComplete?: () => void;
     animationData: unknown;
   }

   // In useEffect:
   animRef.current.addEventListener('complete', () => {
     onComplete?.();
   });
   ```

3. **Remove empty callbacks** or pass `undefined`

### Success Criteria
- ✅ All tests pass
- ✅ Animations still work
- ✅ No empty callback functions

---

## Step 8: Extract Character Rendering Logic

**Priority**: Medium
**Risk**: Medium
**Files**: `src/components/Practice/Practice.tsx`, `src/components/Practice/CharacterComparison.tsx` (new)

### Problem
Character comparison rendering logic (lines 211-261) is complex and hard to test.

### Implementation

1. **Write tests** in `CharacterComparison.test.tsx`:
   - Test renders correct characters
   - Test applies correct CSS classes
   - Test handles missing characters
   - Test handles extra characters

2. **Create component** `CharacterComparison.tsx`:
   ```typescript
   interface CharacterComparisonProps {
     correctWord: string;
     userAnswer: string;
   }

   export function CharacterComparison({
     correctWord,
     userAnswer
   }: CharacterComparisonProps) {
     // Move rendering logic here
   }
   ```

3. **Replace** in `Practice.tsx`:
   ```typescript
   {feedback === 'incorrect' && (
     <CharacterComparison
       correctWord={lastAnswer.word.word}
       userAnswer={lastAnswer.userAnswer}
     />
   )}
   ```

### Success Criteria
- ✅ All tests pass
- ✅ Character comparison display unchanged
- ✅ Logic testable in isolation

---

## Step 9: Consolidate Voice Loading Logic

**Priority**: Low
**Risk**: Medium
**Files**: `src/services/speech.ts`, `src/components/VoiceSelector/VoiceSelector.tsx`

### Problem
Similar voice loading patterns in two places with slight variations.

### Implementation

1. **Analyze** both implementations to understand differences:
   - `speech.ts`: Loads all voices, persists selection
   - `VoiceSelector.tsx`: Filters to English voices, UI-focused

2. **Write tests** for shared logic

3. **Extract common pattern** to hook or service if beneficial:
   ```typescript
   // Possible approach:
   export function useVoices(filter?: (v: SpeechSynthesisVoice) => boolean) {
     // Shared voice loading logic
   }
   ```

4. **Evaluate** if consolidation provides real value vs. added coupling

### Success Criteria
- ✅ All tests pass
- ✅ Voice selection works in both contexts
- ✅ Code duplication reduced without added complexity

---

## Step 10: Simplify Speech Cancellation Logic

**Priority**: Low
**Risk**: High
**Files**: `src/services/speech.ts`

### Problem
Complex cancellation logic (lines 74-88) may be over-defensive.

### Implementation

1. **Document current behavior** with tests:
   - Test multiple rapid speak() calls
   - Test speak() after cancel()
   - Test speak() same word twice
   - Test platform-specific edge cases

2. **Research** why current complexity exists:
   - Check git history for comments/commits
   - Test on multiple browsers
   - Document macOS Safari quirks

3. **Experiment** with simpler implementation in feature branch

4. **Only proceed** if:
   - Simpler version passes all tests
   - Works on macOS Safari (documented quirk)
   - No regressions found

### Success Criteria
- ✅ All tests pass including edge cases
- ✅ Works on all target browsers
- ✅ Documented rationale for any remaining complexity

---

## Step 11: Split Practice Component

**Priority**: Low
**Risk**: High
**Files**: Multiple new components under `src/components/Practice/`

### Problem
`Practice.tsx` is 400+ lines handling too many concerns.

### Implementation

1. **Plan component boundaries**:
   ```
   Practice/
     ├── Practice.tsx (orchestration)
     ├── PracticeSession.tsx (session state management)
     ├── AnswerInput.tsx (input + submit)
     ├── CharacterComparison.tsx (feedback display)
     ├── SessionSummary.tsx (completion screen)
     └── ConfettiAnimation.tsx (extract from Practice)
   ```

2. **Write tests** for each new component

3. **Extract components** one at a time:
   - Start with most isolated (ConfettiAnimation)
   - Then UI-only (SessionSummary, AnswerInput)
   - Finally state management (PracticeSession)

4. **Verify** after each extraction:
   - All tests pass
   - Functionality unchanged
   - Props interface clean

### Success Criteria
- ✅ All tests pass
- ✅ Each component under 150 lines
- ✅ Clear separation of concerns
- ✅ Practice flow unchanged

---

## Step 12: Evaluate compareAnswers Algorithm

**Priority**: Low
**Risk**: High
**Files**: `src/services/practiceLogic.ts`

### Problem
Look-ahead algorithm (lines 35-53) adds complexity. May not be necessary for target audience.

### Implementation

1. **Document current behavior** with comprehensive tests:
   - Test all edge cases
   - Test various error patterns (transposition, omission, insertion)

2. **Prototype simpler algorithm**:
   ```typescript
   // Simple character-by-character comparison
   function compareAnswersSimple(correct: string, user: string): CharacterMatch[] {
     const maxLen = Math.max(correct.length, user.length);
     const result: CharacterMatch[] = [];

     for (let i = 0; i < maxLen; i++) {
       if (i >= correct.length) result.push('extra');
       else if (i >= user.length) result.push('missing');
       else if (correct[i] === user[i]) result.push('match');
       else result.push('wrong');
     }

     return result;
   }
   ```

3. **User testing**: Get feedback on which provides better learning experience

4. **Decide** based on evidence, not assumption

### Success Criteria
- ✅ All tests pass
- ✅ User feedback supports chosen approach
- ✅ Documented rationale for decision

---

## Step 13: Standardize Error Handling

**Priority**: Medium
**Risk**: Low
**Files**: `src/services/speech.ts`, `src/services/soundEffects.ts`, `src/components/Practice/Practice.tsx`, `src/components/VoiceSelector/VoiceSelector.tsx`

### Problem
Inconsistent error handling across codebase:
- Mix of try-catch blocks with `console.error()`
- `.catch()` callbacks with various formats
- Different error message styles
- Some errors logged, some swallowed silently

### Implementation

1. **Design error handling strategy**:
   ```typescript
   // src/utils/errorHandling.ts
   export function logError(context: string, error: unknown): void {
     const message = error instanceof Error ? error.message : String(error);
     console.error(`[${context}]`, message, error);
   }

   export function handleAudioError(context: string, error: unknown): void {
     // Audio errors are often due to user interaction requirements
     // Log at lower severity and continue gracefully
     logError(`Audio:${context}`, error);
   }
   ```

2. **Write tests** to verify error logging:
   - Test error messages formatted consistently
   - Test error context included
   - Test errors don't break application flow

3. **Apply consistently** across all services:
   - `Practice.tsx:80-82, 160-161, 189-191`: Use `handleAudioError()`
   - `VoiceSelector.tsx:47`: Use `logError()`
   - `soundEffects.ts:44-45`: Already handles gracefully, standardize format

4. **Document** error handling approach in code comments

### Success Criteria
- ✅ All tests pass
- ✅ Consistent error message format
- ✅ All errors include context information
- ✅ Audio errors handled gracefully without disrupting user experience

---

## Step 14: Simplify Confetti Instance Management

**Priority**: Low
**Risk**: Medium
**Files**: `src/components/Practice/Practice.tsx`

### Problem
Complex confetti instance management system:
- Array of instances with unique IDs (lines 73, 75, 119-125, 387-397)
- Manual ID generation (`confettiNextId`)
- Filtering on completion
- Overhead for showing simple animations

### Implementation

1. **Analyze requirements**:
   - How many confetti animations need to show simultaneously?
   - Current code allows unlimited concurrent animations
   - Is this complexity needed, or would single animation suffice?

2. **Write tests** for simpler implementation:
   - Test animation shows on correct answer
   - Test animation shows on incorrect answer
   - Test multiple rapid answers (if relevant)

3. **Option A - Single Animation** (if multiple concurrent not needed):
   ```typescript
   // Replace state:
   const [confettiAnimation, setConfettiAnimation] = useState<{
     type: 'good' | 'bad';
     position: { top: number; left: number };
   } | null>(null);

   // On feedback:
   setConfettiAnimation({
     type: feedback,
     position: { top: randomTop, left: randomLeft }
   });

   // Render:
   {confettiAnimation && (
     <ConfettiAnimation
       {...confettiAnimation.position}
       animationData={confettiAnimation.type === 'correct' ? goodAnimation : badAnimation}
       onComplete={() => setConfettiAnimation(null)}
     />
   )}
   ```

4. **Option B - Fixed Pool** (if limited concurrent needed):
   - Use fixed-size array (e.g., max 3 concurrent)
   - Replace oldest when limit reached
   - Simpler than unbounded array

5. **Decide** based on actual user experience needs

### Success Criteria
- ✅ All tests pass
- ✅ Confetti animations work as expected
- ✅ Code simpler and easier to understand
- ✅ No performance issues with approach

---

## Step 15: Remove or Justify Double-Click Handler

**Priority**: Low
**Risk**: Low
**Files**: `src/components/VoiceSelector/VoiceSelector.tsx`

### Problem
Voice list items have `onDoubleClick` handler (line 134) that duplicates Play button functionality. Unclear if this adds value or just adds complexity.

### Implementation

1. **Evaluate user value**:
   - Does double-click match user expectations?
   - Is it documented or discoverable?
   - Does it conflict with selection behavior?

2. **Option A - Remove** if not valuable:
   ```typescript
   // Simply remove onDoubleClick handler
   <div
     key={index}
     className={...}
     onClick={() => setSelectedIndex(index)}
   >
   ```

3. **Option B - Keep and document** if valuable:
   - Add to component help text: "Use arrow keys to navigate, Enter or Space to play, or double-click a voice"
   - Ensure it doesn't interfere with other interactions

4. **Option C - Enhance** if keeping:
   - Add visual feedback (cursor change)
   - Prevent double-click text selection
   - Add to accessibility label

### Success Criteria
- ✅ All tests pass
- ✅ Voice selection behavior clear and intuitive
- ✅ No unexpected interaction conflicts
- ✅ Feature documented if kept, removed if not valuable

---

## Step 16: Reduce State Tracking in SpeechService

**Priority**: Low
**Risk**: High
**Files**: `src/services/speech.ts`

### Problem
SpeechService tracks three related states:
- `currentUtterance: SpeechSynthesisUtterance | null`
- `currentText: string`
- `pendingTimeout: NodeJS.Timeout | null`

This may be more than necessary and adds complexity to state management.

### Implementation

1. **Document current state usage** with tests:
   - Why is each state variable needed?
   - What would break if we removed one?
   - Are there edge cases that require all three?

2. **Analyze dependencies**:
   - `currentText` used for deduplication (line 64)
   - `currentUtterance` used for cleanup (lines 106, 115)
   - `pendingTimeout` used for cancellation (lines 69-72, 110, 119, 128)

3. **Experiment** with simpler state:
   ```typescript
   // Possible simplification:
   private speechState: {
     utterance: SpeechSynthesisUtterance;
     text: string;
     timeout?: NodeJS.Timeout;
   } | null = null;
   ```

4. **Only proceed** if:
   - Simpler version handles all edge cases
   - Tests pass including rapid-fire speak() calls
   - Works on macOS Safari (known quirky behavior)

5. **Note**: This step relates to Step 10 and may be done together

### Success Criteria
- ✅ All tests pass
- ✅ Speech synthesis works reliably
- ✅ State management simpler and clearer
- ✅ No regressions on any platform

---

## Implementation Order Recommendation

### Phase 1: Quick Wins (Low Risk, High Value)
1. Step 1: Browser environment check
2. Step 2: Enter key handler
3. Step 3: Session completion check
4. Step 5: Magic number constants
5. Step 7: Optional onComplete
6. Step 15: Remove or justify double-click handler

**Total effort**: ~3-5 hours
**Risk**: Very low
**Value**: Immediate code quality improvement

### Phase 2: Medium Refactoring (Medium Risk, Medium Value)
7. Step 4: Character CSS class helper
8. Step 6: Tab navigation buttons
9. Step 13: Standardize error handling
10. Step 8: Extract character rendering

**Total effort**: ~5-8 hours
**Risk**: Low to medium
**Value**: Better component structure and consistency

### Phase 3: Evaluate & Decide (High Risk, Uncertain Value)
11. Step 9: Consolidate voice loading (evaluate first)
12. Step 14: Simplify confetti instance management (analyze requirements first)
13. Step 10: Simplify speech cancellation (investigate first)
14. Step 16: Reduce state tracking in SpeechService (may combine with Step 10)
15. Step 11: Split Practice component (plan carefully)
16. Step 12: Evaluate compareAnswers (user test first)

**Total effort**: ~10-20 hours
**Risk**: Medium to high
**Value**: Depends on findings

## Notes

- **Don't rush**: Each step should be completed properly before moving to next
- **Test thoroughly**: Especially on macOS Safari (known speech synthesis quirks)
- **Measure twice, cut once**: For high-risk steps, investigate before implementing
- **User value**: Some refactorings may not provide user-facing value - evaluate carefully
- **Reversibility**: Keep commits atomic so any step can be reverted if needed

## Completion Criteria

A step is complete when:
1. ✅ All tests pass (including new tests for the refactored code)
2. ✅ Code is formatted and linted
3. ✅ Changes reviewed (self-review or peer review)
4. ✅ Committed with clear message explaining what and why
5. ✅ Documentation updated if needed
