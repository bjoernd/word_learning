// ABOUTME: Tests for the Practice component.
// ABOUTME: Validates feedback display, scoring, and session flow behavior.
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Practice } from './Practice';
import * as database from '../../services/database';
import * as speech from '../../services/speech';

vi.mock('../../services/database');
vi.mock('../../services/speech');

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
      }, { timeout: 4000 });
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
    }, { timeout: 4000 });
  }, 35000); // Long timeout for this integration test
});
