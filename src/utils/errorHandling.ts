// ABOUTME: Error handling utilities for consistent error logging
// ABOUTME: Provides standardized error formatting across the application

/**
 * Logs an error with context information.
 * Formats error messages consistently with context prefix.
 */
export function logError(context: string, error: unknown): void {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[${context}]`, message, error);
}

/**
 * Handles audio-related errors (speech and sound effects).
 * Uses warn level as audio failures are often due to user interaction
 * requirements and should not disrupt the user experience.
 */
export function handleAudioError(context: string, error: unknown): void {
  const message = error instanceof Error ? error.message : String(error);
  console.warn(`[Audio:${context}]`, message, error);
}
