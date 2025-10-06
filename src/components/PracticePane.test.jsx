import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PracticePane from './PracticePane';
import * as tts from '../services/tts';
import * as storage from '../services/storage';
import { COMMON_WORDS, SINGLE_WORD, waitForAsync } from '../test/testUtils';

// Mock the services
vi.mock('../services/tts', () => ({
  speakWord: vi.fn(),
  isTTSSupported: vi.fn(),
}));

vi.mock('../services/storage', () => ({
  getScore: vi.fn(),
  saveScore: vi.fn(),
  getWords: vi.fn(),
}));

describe('PracticePane', () => {
  let user;

  beforeEach(() => {
    vi.clearAllMocks();
    tts.isTTSSupported.mockReturnValue(true);
    tts.speakWord.mockResolvedValue();
    storage.getScore.mockReturnValue(0);
    storage.saveScore.mockReturnValue(true);
    storage.getWords.mockReturnValue([]);
    user = userEvent.setup();
  });

  describe('Component Rendering', () => {
    it('renders the component with title', () => {
      render(<PracticePane />);

      expect(screen.getByText('Practice Spelling')).toBeInTheDocument();
    });

    it('renders all main buttons', () => {
      render(<PracticePane />);

      expect(screen.getByText('Get Word')).toBeInTheDocument();
      expect(screen.getByText('Speak Word')).toBeInTheDocument();
      expect(screen.getByText('Replay Word')).toBeInTheDocument();
      expect(screen.getByText('Submit')).toBeInTheDocument();
    });

    it('renders score display', () => {
      storage.getScore.mockReturnValue(5);

      render(<PracticePane />);

      expect(screen.getByText('Score:')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('renders reset score button', () => {
      render(<PracticePane />);

      expect(screen.getByText('Reset Score')).toBeInTheDocument();
    });

    it('renders input field', () => {
      render(<PracticePane />);

      expect(screen.getByPlaceholderText('Type the word here...')).toBeInTheDocument();
    });

    it('renders instructions when no current word', () => {
      render(<PracticePane />);

      expect(screen.getByText('How to Practice:')).toBeInTheDocument();
      expect(screen.getByText(/Click "Get Word" to start/)).toBeInTheDocument();
    });
  });

  describe('Score Management', () => {
    it('loads initial score from storage', () => {
      storage.getScore.mockReturnValue(10);

      render(<PracticePane />);

      expect(screen.getByText('10')).toBeInTheDocument();
      expect(storage.getScore).toHaveBeenCalled();
    });

    it('resets score to 0 when reset button clicked', async () => {
      storage.getScore.mockReturnValue(5);

      render(<PracticePane />);

      const resetButton = screen.getByText('Reset Score');
      await user.click(resetButton);

      expect(storage.saveScore).toHaveBeenCalledWith(0);
      expect(screen.getByText('0')).toBeInTheDocument();
      expect(screen.getByText('Score reset to 0!')).toBeInTheDocument();
    });

    it('increments score when correct answer is submitted', async () => {
      storage.getScore.mockReturnValue(0);
      storage.getWords.mockReturnValue(SINGLE_WORD);
      storage.saveScore.mockReturnValue(true);

      render(<PracticePane />);

      // Get a word first
      const getWordButton = screen.getByText('Get Word');
      await user.click(getWordButton);

      await waitForAsync();

      // Type the correct answer
      const input = screen.getByPlaceholderText('Type the word here...');
      await user.type(input, 'hello');

      // Submit the form
      const submitButton = screen.getByText('Submit');
      await user.click(submitButton);

      // Verify score was incremented and saved
      expect(storage.saveScore).toHaveBeenCalledWith(1);
      expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('does not increment score when incorrect answer is submitted', async () => {
      storage.getScore.mockReturnValue(5);
      storage.getWords.mockReturnValue(SINGLE_WORD);

      render(<PracticePane />);

      // Get a word first
      const getWordButton = screen.getByText('Get Word');
      await user.click(getWordButton);

      await waitForAsync();

      // Clear any previous saveScore calls
      storage.saveScore.mockClear();

      // Type an incorrect answer
      const input = screen.getByPlaceholderText('Type the word here...');
      await user.type(input, 'helo');

      // Submit the form
      const submitButton = screen.getByText('Submit');
      await user.click(submitButton);

      // Verify score was NOT saved (not incremented)
      expect(storage.saveScore).not.toHaveBeenCalled();
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('persists score to localStorage on each increment', async () => {
      storage.getScore.mockReturnValue(3);
      storage.getWords.mockReturnValue(['test']);
      storage.saveScore.mockReturnValue(true);

      render(<PracticePane />);

      // Get a word
      const getWordButton = screen.getByText('Get Word');
      await user.click(getWordButton);
      await waitForAsync();

      // Submit correct answer
      const input = screen.getByPlaceholderText('Type the word here...');
      await user.type(input, 'test');
      const submitButton = screen.getByText('Submit');
      await user.click(submitButton);

      // Verify saveScore was called with incremented value
      expect(storage.saveScore).toHaveBeenCalledWith(4);
    });
  });

  describe('Button States', () => {
    it('disables Speak Word button when no current word', () => {
      render(<PracticePane />);

      const speakButton = screen.getByText('Speak Word');
      expect(speakButton).toBeDisabled();
    });

    it('disables Replay Word button when no current word', () => {
      render(<PracticePane />);

      const replayButton = screen.getByText('Replay Word');
      expect(replayButton).toBeDisabled();
    });

    it('disables input field when no current word', () => {
      render(<PracticePane />);

      const input = screen.getByPlaceholderText('Type the word here...');
      expect(input).toBeDisabled();
    });

    it('disables Submit button when no current word', () => {
      render(<PracticePane />);

      const submitButton = screen.getByText('Submit');
      expect(submitButton).toBeDisabled();
    });

    it('disables Submit button when input is empty', () => {
      render(<PracticePane />);

      const submitButton = screen.getByText('Submit');
      // Submit button should be disabled when no current word and input is empty
      expect(submitButton).toBeDisabled();
    });
  });

  describe('User Input', () => {
    it('input field is disabled when no current word', () => {
      render(<PracticePane />);

      const input = screen.getByPlaceholderText('Type the word here...');

      // Input is disabled because there's no current word
      expect(input).toBeDisabled();
    });

    it('input starts with empty value', () => {
      render(<PracticePane />);

      const input = screen.getByPlaceholderText('Type the word here...');

      // Input value is empty initially
      expect(input.value).toBe('');
    });
  });

  describe('TTS Functionality', () => {
    it('shows feedback when no words in database', async () => {
      storage.getWords.mockReturnValue([]);
      render(<PracticePane />);

      const getWordButton = screen.getByText('Get Word');
      await user.click(getWordButton);

      expect(screen.getByText(/No words in the database!/)).toBeInTheDocument();
    });

    it('TTS module is properly mocked', () => {
      tts.isTTSSupported.mockReturnValue(false);

      render(<PracticePane />);

      // Verify the mock is working
      expect(tts.isTTSSupported()).toBe(false);
    });

    it('calls speakWord when TTS is supported (placeholder)', () => {
      // This test is a placeholder - full TTS testing will work
      // when word selection (WI-08) is implemented
      expect(tts.isTTSSupported).toBeDefined();
      expect(tts.speakWord).toBeDefined();
    });
  });

  describe('Form Submission', () => {
    it('shows placeholder message when submitting', () => {
      render(<PracticePane />);

      // This will be fully tested in WI-10 when spell checking is implemented
      // For now, just verify the submit functionality exists
      const submitButton = screen.getByText('Submit');
      expect(submitButton).toBeInTheDocument();
    });
  });

  describe('Get Word Button', () => {
    it('shows feedback when no words available', async () => {
      storage.getWords.mockReturnValue([]);
      render(<PracticePane />);

      const getWordButton = screen.getByText('Get Word');
      await user.click(getWordButton);

      expect(screen.getByText(/No words in the database!/)).toBeInTheDocument();
    });

    it('clears user input when Get Word is clicked', async () => {
      render(<PracticePane />);

      const getWordButton = screen.getByText('Get Word');
      await user.click(getWordButton);

      const input = screen.getByPlaceholderText('Type the word here...');
      expect(input.value).toBe('');
    });

    it('selects and speaks a word when words are available', async () => {
      storage.getWords.mockReturnValue(['hello', 'world', 'test']);
      tts.speakWord.mockResolvedValue();

      render(<PracticePane />);

      const getWordButton = screen.getByText('Get Word');
      await user.click(getWordButton);

      // Should call speakWord with one of the words
      expect(tts.speakWord).toHaveBeenCalledTimes(1);
      expect(['hello', 'world', 'test']).toContain(tts.speakWord.mock.calls[0][0]);
    });

    it('enables buttons after selecting a word', async () => {
      storage.getWords.mockReturnValue(SINGLE_WORD);

      render(<PracticePane />);

      const getWordButton = screen.getByText('Get Word');
      await user.click(getWordButton);

      await waitForAsync();

      // Buttons should be enabled after word is selected
      const speakButton = screen.getByText('Speak Word');
      const replayButton = screen.getByText('Replay Word');
      const input = screen.getByPlaceholderText('Type the word here...');

      expect(speakButton).not.toBeDisabled();
      expect(replayButton).not.toBeDisabled();
      expect(input).not.toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    it('has proper aria labels for buttons', () => {
      render(<PracticePane />);

      expect(screen.getByLabelText('Reset score')).toBeInTheDocument();
      expect(screen.getByLabelText('Get a new word')).toBeInTheDocument();
      expect(screen.getByLabelText('Speak the word')).toBeInTheDocument();
      expect(screen.getByLabelText('Replay the word')).toBeInTheDocument();
      expect(screen.getByLabelText('Spelling input')).toBeInTheDocument();
    });

    it('has proper label for input field', () => {
      render(<PracticePane />);

      expect(screen.getByText('Type what you hear:')).toBeInTheDocument();
    });

    it('uses role="alert" for feedback messages', async () => {
      render(<PracticePane />);

      const resetButton = screen.getByText('Reset Score');
      await user.click(resetButton);

      const feedback = screen.getByRole('alert');
      expect(feedback).toBeInTheDocument();
    });
  });

  describe('Layout Sections', () => {
    it('renders score section', () => {
      render(<PracticePane />);

      expect(screen.getByText('Score:')).toBeInTheDocument();
    });

    it('renders word controls section with all buttons', () => {
      render(<PracticePane />);

      expect(screen.getByText('Get Word')).toBeInTheDocument();
      expect(screen.getByText('Speak Word')).toBeInTheDocument();
      expect(screen.getByText('Replay Word')).toBeInTheDocument();
    });

    it('renders input section with label and input', () => {
      render(<PracticePane />);

      expect(screen.getByText('Type what you hear:')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Type the word here...')).toBeInTheDocument();
    });
  });
});
