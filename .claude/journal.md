# Claude's Journal - Word Learning Project

## 2025-10-12: Phase 5 & 6 Implementation (Speech Service)

### What We Did
- Implemented Speech Service with TDD approach
- Created tests first, then implementation
- Added text-to-speech for word pronunciation during practice

### Technical Insights
- **Mock typing in tests**: When mocking browser APIs like `speechSynthesis` and `SpeechSynthesisUtterance`, use `as unknown as TargetType` instead of `as any` to satisfy ESLint
  - Example: `global.speechSynthesis = { speak: mockSpeak, cancel: mockCancel } as unknown as SpeechSynthesis`
  - This is more explicit about type conversion than `as any`

- **SpeechSynthesisEvent in tests**: When triggering `onend` callback in tests, pass `{} as SpeechSynthesisEvent` instead of `new Event('end')` to satisfy TypeScript

- **Speech rate**: Set to 0.8 (80% speed) for clearer pronunciation - good for language learners

### Project Status
- Phases 1-6 completed
- Next phase: Phase 7 (Practice Logic Tests)
- Following strict TDD: tests first, minimal implementation, validate after each phase

### Collaboration Notes
- Bjoern prefers concise commit messages focused on WHAT and WHY, not implementation details
- Avoid listing every technical change in commit messages
- Keep it simple and focused on the purpose
