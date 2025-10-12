// ABOUTME: Type definitions for Word and PracticeWord entities.
// ABOUTME: Defines the core data structures used throughout the application.

export interface Word {
  id?: number;
  word: string;
}

export interface PracticeWord {
  word: Word;
  userAnswer: string;
  isCorrect: boolean;
}
