import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import WordsManagement from './WordsManagement';
import * as storage from '../services/storage';
import { COMMON_WORDS, SINGLE_WORD } from '../test/testUtils';

// Mock the storage module
vi.mock('../services/storage', () => ({
  getWords: vi.fn(),
  saveWords: vi.fn(),
}));

describe('WordsManagement', () => {
  let user;

  beforeEach(() => {
    vi.clearAllMocks();
    storage.getWords.mockReturnValue([]);
    storage.saveWords.mockReturnValue(true);
    user = userEvent.setup();
  });

  it('renders the component with input and button', () => {
    render(<WordsManagement />);

    expect(screen.getByText('Add New Words')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Type a word...')).toBeInTheDocument();
    expect(screen.getByText('Add Word')).toBeInTheDocument();
  });

  it('allows user to type in the input field', async () => {
    render(<WordsManagement />);

    const input = screen.getByPlaceholderText('Type a word...');
    await user.type(input, 'hello');

    expect(input.value).toBe('hello');
  });

  it('adds a valid word successfully', async () => {
    render(<WordsManagement />);

    const input = screen.getByPlaceholderText('Type a word...');
    const button = screen.getByText('Add Word');

    await user.type(input, 'elephant');
    await user.click(button);

    expect(storage.saveWords).toHaveBeenCalledWith(['elephant']);
    expect(screen.getByText(/Great! "elephant" has been added!/)).toBeInTheDocument();
    expect(input.value).toBe(''); // Input should be cleared
  });

  it('shows error for empty input', async () => {
    render(<WordsManagement />);

    const button = screen.getByText('Add Word');
    await user.click(button);

    expect(screen.getByText('Please enter a word!')).toBeInTheDocument();
    expect(storage.saveWords).not.toHaveBeenCalled();
  });

  it('shows error for invalid word with numbers', async () => {
    render(<WordsManagement />);

    const input = screen.getByPlaceholderText('Type a word...');
    const button = screen.getByText('Add Word');

    await user.type(input, 'hello123');
    await user.click(button);

    expect(screen.getByText(/Words can only contain letters/)).toBeInTheDocument();
    expect(storage.saveWords).not.toHaveBeenCalled();
  });

  it('shows error for invalid word with special characters', async () => {
    render(<WordsManagement />);

    const input = screen.getByPlaceholderText('Type a word...');
    const button = screen.getByText('Add Word');

    await user.type(input, 'hello!');
    await user.click(button);

    expect(screen.getByText(/Words can only contain letters/)).toBeInTheDocument();
    expect(storage.saveWords).not.toHaveBeenCalled();
  });

  it('shows error for duplicate words', async () => {
    storage.getWords.mockReturnValue(['elephant', 'giraffe']);

    render(<WordsManagement />);

    const input = screen.getByPlaceholderText('Type a word...');
    const button = screen.getByText('Add Word');

    await user.type(input, 'elephant');
    await user.click(button);

    expect(screen.getByText(/"elephant" is already in your word list!/)).toBeInTheDocument();
    expect(storage.saveWords).not.toHaveBeenCalled();
  });

  it('detects duplicates case-insensitively', async () => {
    storage.getWords.mockReturnValue(['elephant']);

    render(<WordsManagement />);

    const input = screen.getByPlaceholderText('Type a word...');
    const button = screen.getByText('Add Word');

    await user.type(input, 'ELEPHANT');
    await user.click(button);

    expect(screen.getByText(/"ELEPHANT" is already in your word list!/)).toBeInTheDocument();
    expect(storage.saveWords).not.toHaveBeenCalled();
  });

  it('handles storage save failure gracefully', async () => {
    storage.saveWords.mockReturnValue(false);

    render(<WordsManagement />);

    const input = screen.getByPlaceholderText('Type a word...');
    const button = screen.getByText('Add Word');

    await user.type(input, 'elephant');
    await user.click(button);

    expect(screen.getByText(/Oops! Could not save the word/)).toBeInTheDocument();
  });

  it('trims whitespace from input', async () => {
    render(<WordsManagement />);

    const input = screen.getByPlaceholderText('Type a word...');
    const button = screen.getByText('Add Word');

    await user.type(input, '  elephant  ');
    await user.click(button);

    expect(storage.saveWords).toHaveBeenCalledWith(['elephant']);
    expect(screen.getByText(/Great! "elephant" has been added!/)).toBeInTheDocument();
  });

  it('clears error message when user starts typing', async () => {
    render(<WordsManagement />);

    const input = screen.getByPlaceholderText('Type a word...');
    const button = screen.getByText('Add Word');

    // First, trigger an error
    await user.click(button);
    expect(screen.getByText('Please enter a word!')).toBeInTheDocument();

    // Then start typing
    await user.type(input, 'h');

    // Error message should be cleared
    expect(screen.queryByText('Please enter a word!')).not.toBeInTheDocument();
  });

  it('submits form with Enter key', async () => {
    render(<WordsManagement />);

    const input = screen.getByPlaceholderText('Type a word...');

    await user.type(input, 'elephant');
    await user.keyboard('{Enter}');

    expect(storage.saveWords).toHaveBeenCalledWith(['elephant']);
    expect(screen.getByText(/Great! "elephant" has been added!/)).toBeInTheDocument();
  });

  it('adds word to existing word list', async () => {
    storage.getWords.mockReturnValue(COMMON_WORDS.slice(0, 2));

    render(<WordsManagement />);

    const input = screen.getByPlaceholderText('Type a word...');
    const button = screen.getByText('Add Word');

    await user.type(input, 'cherry');
    await user.click(button);

    expect(storage.saveWords).toHaveBeenCalledWith(COMMON_WORDS);
    expect(screen.getByText(/Great! "cherry" has been added!/)).toBeInTheDocument();
  });
});
