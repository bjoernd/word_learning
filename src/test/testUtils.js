import { vi } from 'vitest';

// Common test data
export const COMMON_WORDS = ['apple', 'banana', 'cherry'];
export const SINGLE_WORD = ['hello'];
export const EMPTY_WORDS = [];

// Helper to create spell check result objects
export function createSpellCheckResult({
  isCorrect = true,
  userAnswer = 'hello',
  correctAnswer = 'hello',
  highlights = null,
} = {}) {
  const finalHighlights = highlights || Array(correctAnswer.length).fill(false);
  return {
    isCorrect,
    userAnswer,
    correctAnswer,
    highlights: finalHighlights,
  };
}

// Helper to wait for async operations
export function waitForAsync(ms = 0) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Mock factories for storage service
export function createStorageMocks() {
  return {
    getWords: vi.fn(() => []),
    saveWords: vi.fn(() => true),
    getScore: vi.fn(() => 0),
    saveScore: vi.fn(() => true),
  };
}

// Mock factories for TTS service
export function createTTSMocks() {
  return {
    speakWord: vi.fn(() => Promise.resolve()),
    isTTSSupported: vi.fn(() => true),
    stopSpeaking: vi.fn(),
    isSpeaking: vi.fn(() => false),
    getAvailableVoices: vi.fn(() => []),
    selectBestVoice: vi.fn(() => null),
    initializeVoices: vi.fn(() => Promise.resolve()),
  };
}

// Mock factory for window.confirm
export function mockWindowConfirm(returnValue = true) {
  return vi.spyOn(window, 'confirm').mockReturnValue(returnValue);
}

// Mock factory for window.alert
export function mockWindowAlert() {
  return vi.spyOn(window, 'alert').mockImplementation(() => {});
}

// Helper to create mock voices for TTS tests
export function createMockVoices() {
  return [
    { name: 'Google US English', lang: 'en-US' },
    { name: 'Google UK English Female', lang: 'en-GB' },
    { name: 'Samantha', lang: 'en-US' },
    { name: 'French Voice', lang: 'fr-FR' },
  ];
}

// Helper to create mock SpeechSynthesis
export function createMockSpeechSynthesis(mockVoices = createMockVoices()) {
  const mockUtterance = {
    text: '',
    voice: null,
    rate: 1,
    pitch: 1,
    volume: 1,
    onend: null,
    onerror: null,
  };

  global.SpeechSynthesisUtterance = vi.fn((text) => {
    mockUtterance.text = text;
    return mockUtterance;
  });

  const mockSpeechSynthesis = {
    speaking: false,
    getVoices: vi.fn(() => mockVoices),
    speak: vi.fn((utterance) => {
      mockSpeechSynthesis.speaking = true;
      setTimeout(() => {
        mockSpeechSynthesis.speaking = false;
        if (utterance.onend) {
          utterance.onend();
        }
      }, 10);
    }),
    cancel: vi.fn(() => {
      mockSpeechSynthesis.speaking = false;
    }),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  };

  global.window.speechSynthesis = mockSpeechSynthesis;

  return { mockSpeechSynthesis, mockUtterance };
}

// Cleanup mock SpeechSynthesis
export function cleanupMockSpeechSynthesis() {
  delete global.SpeechSynthesisUtterance;
  delete global.window.speechSynthesis;
}
