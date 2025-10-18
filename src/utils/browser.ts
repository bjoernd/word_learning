// ABOUTME: Browser environment detection utility
// ABOUTME: Provides helper to check if code is running in browser vs server/Node environment

export function isBrowser(): boolean {
  return typeof window !== 'undefined';
}
