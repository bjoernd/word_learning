import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FeedbackDisplay from './FeedbackDisplay';
import { createSpellCheckResult } from '../test/testUtils';

describe('FeedbackDisplay', () => {
  const mockOnNextWord = vi.fn();
  let user;

  beforeEach(() => {
    vi.clearAllMocks();
    user = userEvent.setup();
  });

  describe('Rendering', () => {
    it('renders nothing when spellCheckResult is null', () => {
      const { container } = render(
        <FeedbackDisplay spellCheckResult={null} onNextWord={mockOnNextWord} />
      );
      expect(container.firstChild).toBeNull();
    });

    it('renders success message for correct spelling', () => {
      const result = createSpellCheckResult();

      render(<FeedbackDisplay spellCheckResult={result} onNextWord={mockOnNextWord} />);

      expect(screen.getByText('Great job! You spelled it correctly!')).toBeInTheDocument();
    });

    it('renders error message for incorrect spelling', () => {
      const result = createSpellCheckResult({
        isCorrect: false,
        userAnswer: 'helo',
        highlights: [false, false, true, false, false],
      });

      render(<FeedbackDisplay spellCheckResult={result} onNextWord={mockOnNextWord} />);

      expect(screen.getByText('Not quite right. Try again!')).toBeInTheDocument();
    });

    it('renders Next Word button', () => {
      const result = createSpellCheckResult();

      render(<FeedbackDisplay spellCheckResult={result} onNextWord={mockOnNextWord} />);

      expect(screen.getByText('Next Word')).toBeInTheDocument();
    });
  });

  describe('Correct Spelling Display', () => {
    it('does not show spelling comparison for correct answer', () => {
      const result = createSpellCheckResult();

      render(<FeedbackDisplay spellCheckResult={result} onNextWord={mockOnNextWord} />);

      expect(screen.queryByText('Your answer:')).not.toBeInTheDocument();
      expect(screen.queryByText('Correct spelling:')).not.toBeInTheDocument();
    });

    it('shows success styling for correct answer', () => {
      const result = createSpellCheckResult();

      render(<FeedbackDisplay spellCheckResult={result} onNextWord={mockOnNextWord} />);

      const message = screen.getByText('Great job! You spelled it correctly!');
      expect(message.closest('.feedback-message')).toHaveClass('correct');
    });
  });

  describe('Incorrect Spelling Display', () => {
    it('shows spelling comparison for incorrect answer', () => {
      const result = createSpellCheckResult({
        isCorrect: false,
        userAnswer: 'helo',
        highlights: [false, false, true, false, false],
      });

      render(<FeedbackDisplay spellCheckResult={result} onNextWord={mockOnNextWord} />);

      expect(screen.getByText('Your answer:')).toBeInTheDocument();
      expect(screen.getByText('Correct spelling:')).toBeInTheDocument();
    });

    it('shows error styling for incorrect answer', () => {
      const result = createSpellCheckResult({
        isCorrect: false,
        userAnswer: 'helo',
        highlights: [false, false, true, false, false],
      });

      render(<FeedbackDisplay spellCheckResult={result} onNextWord={mockOnNextWord} />);

      const message = screen.getByText('Not quite right. Try again!');
      expect(message.closest('.feedback-message')).toHaveClass('incorrect');
    });

    it('displays user answer with individual letters', () => {
      const result = createSpellCheckResult({
        isCorrect: false,
        userAnswer: 'helo',
        highlights: [false, false, true, false, false],
      });

      const { container } = render(
        <FeedbackDisplay spellCheckResult={result} onNextWord={mockOnNextWord} />
      );

      // Find the user's answer section
      const comparisonSections = container.querySelectorAll('.comparison-section');
      const userSection = comparisonSections[0];
      const letters = userSection.querySelectorAll('.letter');

      expect(letters).toHaveLength(5); // h, e, l, o, + 1 missing
    });

    it('displays correct answer with individual letters', () => {
      const result = createSpellCheckResult({
        isCorrect: false,
        userAnswer: 'helo',
        highlights: [false, false, true, false, false],
      });

      const { container } = render(
        <FeedbackDisplay spellCheckResult={result} onNextWord={mockOnNextWord} />
      );

      // Find the correct answer section
      const comparisonSections = container.querySelectorAll('.comparison-section');
      const correctSection = comparisonSections[1];
      const letters = correctSection.querySelectorAll('.letter');

      expect(letters).toHaveLength(5); // h, e, l, l, o
    });

    it('applies correct class to correct letters', () => {
      const result = createSpellCheckResult({
        isCorrect: false,
        userAnswer: 'hallo',
        highlights: [false, true, false, false, false],
      });

      const { container } = render(
        <FeedbackDisplay spellCheckResult={result} onNextWord={mockOnNextWord} />
      );

      const userSection = container.querySelectorAll('.comparison-section')[0];
      const letters = userSection.querySelectorAll('.letter');

      // First letter 'h' should be correct
      expect(letters[0]).toHaveClass('correct');
      // Second letter 'a' should be incorrect
      expect(letters[1]).toHaveClass('incorrect');
    });

    it('applies incorrect class to wrong letters', () => {
      const result = createSpellCheckResult({
        isCorrect: false,
        userAnswer: 'hxllo',
        highlights: [false, true, false, false, false],
      });

      const { container } = render(
        <FeedbackDisplay spellCheckResult={result} onNextWord={mockOnNextWord} />
      );

      const userSection = container.querySelectorAll('.comparison-section')[0];
      const letters = userSection.querySelectorAll('.letter');

      expect(letters[1]).toHaveClass('incorrect');
    });
  });

  describe('Different Lengths', () => {
    it('handles user answer shorter than correct word', () => {
      const result = createSpellCheckResult({
        isCorrect: false,
        userAnswer: 'hel',
        highlights: [false, false, false, true, true],
      });

      const { container } = render(
        <FeedbackDisplay spellCheckResult={result} onNextWord={mockOnNextWord} />
      );

      const userSection = container.querySelectorAll('.comparison-section')[0];
      const letters = userSection.querySelectorAll('.letter');

      // Should show 3 actual letters + 2 missing placeholders
      expect(letters).toHaveLength(5);
      expect(letters[3]).toHaveClass('missing');
      expect(letters[4]).toHaveClass('missing');
    });

    it('displays underscore for missing characters', () => {
      const result = createSpellCheckResult({
        isCorrect: false,
        userAnswer: 'hel',
        highlights: [false, false, false, true, true],
      });

      const { container } = render(
        <FeedbackDisplay spellCheckResult={result} onNextWord={mockOnNextWord} />
      );

      const userSection = container.querySelectorAll('.comparison-section')[0];
      const letters = userSection.querySelectorAll('.letter');

      expect(letters[3].textContent).toBe('_');
      expect(letters[4].textContent).toBe('_');
    });

    it('handles user answer longer than correct word', () => {
      const result = createSpellCheckResult({
        isCorrect: false,
        userAnswer: 'helloo',
        highlights: [false, false, false, false, false, true],
      });

      const { container } = render(
        <FeedbackDisplay spellCheckResult={result} onNextWord={mockOnNextWord} />
      );

      const userSection = container.querySelectorAll('.comparison-section')[0];
      const letters = userSection.querySelectorAll('.letter');

      // Should show all 6 letters
      expect(letters).toHaveLength(6);
      // Last letter should be marked incorrect
      expect(letters[5]).toHaveClass('incorrect');
    });
  });

  describe('Next Word Button', () => {
    it('calls onNextWord when clicked', async () => {
      const result = createSpellCheckResult();

      render(<FeedbackDisplay spellCheckResult={result} onNextWord={mockOnNextWord} />);

      const button = screen.getByText('Next Word');
      await user.click(button);

      expect(mockOnNextWord).toHaveBeenCalledTimes(1);
    });

    it('has proper aria label', () => {
      const result = createSpellCheckResult();

      render(<FeedbackDisplay spellCheckResult={result} onNextWord={mockOnNextWord} />);

      expect(screen.getByLabelText('Get next word')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has descriptive labels for comparison sections', () => {
      const result = createSpellCheckResult({
        isCorrect: false,
        userAnswer: 'helo',
        highlights: [false, false, true, false, false],
      });

      render(<FeedbackDisplay spellCheckResult={result} onNextWord={mockOnNextWord} />);

      expect(screen.getByText('Your answer:')).toBeInTheDocument();
      expect(screen.getByText('Correct spelling:')).toBeInTheDocument();
    });
  });
});
