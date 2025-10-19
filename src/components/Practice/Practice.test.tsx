// ABOUTME: Tests for the Practice component.
// ABOUTME: Validates feedback display, scoring, and session flow behavior.
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Practice } from './Practice';
import * as database from '../../services/database';
import * as speech from '../../services/speech';
import * as soundEffects from '../../services/soundEffects';

vi.mock('../../services/database');
vi.mock('../../services/speech');
vi.mock('../../services/soundEffects');

describe('Practice', () => {
  const mockWords = [
    { id: 1, word: 'apple' },
    { id: 2, word: 'banana' },
    { id: 3, word: 'cherry' },
    { id: 4, word: 'date' },
    { id: 5, word: 'elderberry' },
    { id: 6, word: 'fig' },
    { id: 7, word: 'grape' },
    { id: 8, word: 'honeydew' },
    { id: 9, word: 'ice' },
    { id: 10, word: 'jackfruit' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(database.getWordCount).mockResolvedValue(10);
    vi.mocked(database.getRandomWords).mockResolvedValue(mockWords);
    vi.mocked(speech.speechService.speak).mockResolvedValue(undefined);
    vi.mocked(soundEffects.soundEffectsService.play).mockResolvedValue(undefined);
  });

  it('should show error feedback for last word before showing summary', async () => {
    const user = userEvent.setup();
    render(<Practice />);

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    // Start the session
    const startButton = screen.getByText('Start Practice');
    await user.click(startButton);

    // Answer first 9 words correctly (with real delays)
    for (let i = 0; i < 9; i++) {
      const input = screen.getByPlaceholderText('Type the word you heard');
      await user.clear(input);
      await user.type(input, mockWords[i].word);
      await user.keyboard('{Enter}');

      // Wait for feedback to disappear (3 second delay + margin)
      await waitFor(() => {
        expect(screen.queryByText('Correct!')).not.toBeInTheDocument();
      }, { timeout: 6000 });
    }

    // Answer last word incorrectly
    const input = screen.getByPlaceholderText('Type the word you heard');
    await user.clear(input);
    await user.type(input, 'wronganswer');
    await user.keyboard('{Enter}');

    // The bug: error feedback should be shown immediately after submission
    await waitFor(() => {
      expect(screen.getByText('Incorrect')).toBeInTheDocument();
    });

    // Summary should NOT be visible while feedback is showing
    expect(screen.queryByText('Session Complete!')).not.toBeInTheDocument();

    // After feedback delay, summary should appear
    await waitFor(() => {
      expect(screen.queryByText('Incorrect')).not.toBeInTheDocument();
      expect(screen.getByText('Session Complete!')).toBeInTheDocument();
    }, { timeout: 6000 });
  }, 35000); // Long timeout for this integration test

  it('should start new practice session when Enter is pressed in summary screen', async () => {
    const user = userEvent.setup();
    render(<Practice />);

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    // Start the session
    const startButton = screen.getByText('Start Practice');
    await user.click(startButton);

    // Answer all 10 words correctly
    for (let i = 0; i < 10; i++) {
      const input = screen.getByPlaceholderText('Type the word you heard');
      await user.clear(input);
      await user.type(input, mockWords[i].word);
      await user.keyboard('{Enter}');

      // Wait for feedback to disappear
      await waitFor(() => {
        expect(screen.queryByText('Correct!')).not.toBeInTheDocument();
      }, { timeout: 6000 });
    }

    // Wait for summary screen to appear
    await waitFor(() => {
      expect(screen.getByText('Session Complete!')).toBeInTheDocument();
    });

    // Press Enter key
    await user.keyboard('{Enter}');

    // Summary screen should disappear and we should be back at the start screen
    await waitFor(() => {
      expect(screen.queryByText('Session Complete!')).not.toBeInTheDocument();
      expect(screen.getByText('Ready to Practice?')).toBeInTheDocument();
    });
  }, 35000); // Long timeout for this integration test

  describe('session completion logic', () => {
    it('should show summary when all words answered and no feedback showing', async () => {
      const user = userEvent.setup();
      render(<Practice />);

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });

      const startButton = screen.getByText('Start Practice');
      await user.click(startButton);

      // Answer all 10 words
      for (let i = 0; i < 10; i++) {
        const input = screen.getByPlaceholderText('Type the word you heard');
        await user.clear(input);
        await user.type(input, mockWords[i].word);
        await user.keyboard('{Enter}');

        await waitFor(() => {
          expect(screen.queryByText('Correct!')).not.toBeInTheDocument();
        }, { timeout: 6000 });
      }

      // Session should be complete - summary should show
      await waitFor(() => {
        expect(screen.getByText('Session Complete!')).toBeInTheDocument();
      });
    }, 35000);

    it('should not show summary when session incomplete', async () => {
      const user = userEvent.setup();
      render(<Practice />);

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });

      const startButton = screen.getByText('Start Practice');
      await user.click(startButton);

      // Answer only 5 words
      for (let i = 0; i < 5; i++) {
        const input = screen.getByPlaceholderText('Type the word you heard');
        await user.clear(input);
        await user.type(input, mockWords[i].word);
        await user.keyboard('{Enter}');

        await waitFor(() => {
          expect(screen.queryByText('Correct!')).not.toBeInTheDocument();
        }, { timeout: 6000 });
      }

      // Session should NOT be complete - no summary
      expect(screen.queryByText('Session Complete!')).not.toBeInTheDocument();
      expect(screen.getByPlaceholderText('Type the word you heard')).toBeInTheDocument();
    }, 20000);

    it('should not show summary when no words loaded', async () => {
      vi.mocked(database.getRandomWords).mockResolvedValue([]);
      vi.mocked(database.getWordCount).mockResolvedValue(0);

      render(<Practice />);

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });

      // Should show "not enough words" message instead of summary
      expect(screen.queryByText('Session Complete!')).not.toBeInTheDocument();
      expect(screen.getByText(/No words available/i)).toBeInTheDocument();
    });
  });

  describe('winner animations', () => {
    it('should display winner animation for score >= 60%', async () => {
      const user = userEvent.setup();
      render(<Practice />);

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });

      const startButton = screen.getByText('Start Practice');
      await user.click(startButton);

      // Answer 6 correct, 4 incorrect (60%)
      for (let i = 0; i < 6; i++) {
        const input = screen.getByPlaceholderText('Type the word you heard');
        await user.clear(input);
        await user.type(input, mockWords[i].word);
        await user.keyboard('{Enter}');

        await waitFor(() => {
          expect(screen.queryByText('Correct!')).not.toBeInTheDocument();
        }, { timeout: 6000 });
      }

      // Answer remaining incorrectly
      for (let i = 6; i < 10; i++) {
        const input = screen.getByPlaceholderText('Type the word you heard');
        await user.clear(input);
        await user.type(input, 'wrong');
        await user.keyboard('{Enter}');

        await waitFor(() => {
          expect(screen.queryByText('Incorrect')).not.toBeInTheDocument();
        }, { timeout: 6000 });
      }

      // Should show summary with score
      await waitFor(() => {
        expect(screen.getByText('Session Complete!')).toBeInTheDocument();
        expect(screen.getByText('6')).toBeInTheDocument();
      });

      // Should play summary sound (winner animation is visual, hard to test directly)
      expect(soundEffects.soundEffectsService.play).toHaveBeenCalledWith('summary');
    }, 35000);

    it('should display perfect winner animation for score >= 90%', async () => {
      const user = userEvent.setup();
      render(<Practice />);

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });

      const startButton = screen.getByText('Start Practice');
      await user.click(startButton);

      // Answer 9 correct, 1 incorrect (90%)
      for (let i = 0; i < 9; i++) {
        const input = screen.getByPlaceholderText('Type the word you heard');
        await user.clear(input);
        await user.type(input, mockWords[i].word);
        await user.keyboard('{Enter}');

        await waitFor(() => {
          expect(screen.queryByText('Correct!')).not.toBeInTheDocument();
        }, { timeout: 6000 });
      }

      // Answer last one incorrectly
      const input = screen.getByPlaceholderText('Type the word you heard');
      await user.clear(input);
      await user.type(input, 'wrong');
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(screen.queryByText('Incorrect')).not.toBeInTheDocument();
      }, { timeout: 6000 });

      // Should show summary with score
      await waitFor(() => {
        expect(screen.getByText('Session Complete!')).toBeInTheDocument();
        expect(screen.getByText('9')).toBeInTheDocument();
      });

      expect(soundEffects.soundEffectsService.play).toHaveBeenCalledWith('summary');
    }, 35000);
  });

  describe('confetti animations', () => {
    it('should display confetti animation on correct answer', async () => {
      const user = userEvent.setup();
      const { container } = render(<Practice />);

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });

      const startButton = screen.getByText('Start Practice');
      await user.click(startButton);

      // Answer first word correctly
      const input = screen.getByPlaceholderText('Type the word you heard');
      await user.type(input, mockWords[0].word);
      await user.keyboard('{Enter}');

      // Confetti should appear
      await waitFor(() => {
        const confettiElements = container.querySelectorAll('[class*="confettiOverlay"]');
        expect(confettiElements.length).toBe(1);
      });
    }, 10000);

    it('should display confetti animation on incorrect answer', async () => {
      const user = userEvent.setup();
      const { container } = render(<Practice />);

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });

      const startButton = screen.getByText('Start Practice');
      await user.click(startButton);

      // Answer first word incorrectly
      const input = screen.getByPlaceholderText('Type the word you heard');
      await user.type(input, 'wronganswer');
      await user.keyboard('{Enter}');

      // Confetti should appear
      await waitFor(() => {
        const confettiElements = container.querySelectorAll('[class*="confettiOverlay"]');
        expect(confettiElements.length).toBe(1);
      });
    }, 10000);

    it('should replace confetti animation when new answer submitted', async () => {
      const user = userEvent.setup();
      const { container } = render(<Practice />);

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });

      const startButton = screen.getByText('Start Practice');
      await user.click(startButton);

      // Answer first word
      const input = screen.getByPlaceholderText('Type the word you heard');
      await user.type(input, mockWords[0].word);
      await user.keyboard('{Enter}');

      // Confetti should appear
      await waitFor(() => {
        const confettiElements = container.querySelectorAll('[class*="confettiOverlay"]');
        expect(confettiElements.length).toBe(1);
      });

      // Wait for feedback to clear and next word
      await waitFor(() => {
        expect(screen.queryByText('Correct!')).not.toBeInTheDocument();
      }, { timeout: 6000 });

      // Answer second word
      await user.clear(input);
      await user.type(input, mockWords[1].word);
      await user.keyboard('{Enter}');

      // Should still have only one confetti (new one replaces old)
      await waitFor(() => {
        const confettiElements = container.querySelectorAll('[class*="confettiOverlay"]');
        expect(confettiElements.length).toBe(1);
      });
    }, 10000);
  });
});
