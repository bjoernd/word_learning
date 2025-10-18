// ABOUTME: Keyboard utility functions for common key event handling
// ABOUTME: Provides helpers to reduce duplication in keyboard event handlers

export function handleEnterKey(
  e: React.KeyboardEvent,
  handler: () => void
): void {
  if (e.key === 'Enter') {
    handler();
  }
}
