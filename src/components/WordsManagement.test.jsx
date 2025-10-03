import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import WordsManagement from './WordsManagement';
import * as storage from '../services/storage';

// Mock the storage module
vi.mock('../services/storage', () => ({
  getWords: vi.fn(),
  saveWords: vi.fn(),
}));

describe('WordsManagement', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
    // Default mock implementations
    storage.getWords.mockReturnValue([]);
    storage.saveWords.mockReturnValue(true);
  });

  it('renders the component with input and button', () => {
    render(<WordsManagement />);

    expect(screen.getByText('Add New Words')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Type a word...')).toBeInTheDocument();
    expect(screen.getByText('Add Word')).toBeInTheDocument();
  });

  it('allows user to type in the input field', async () => {
    const user = userEvent.setup();
    render(<WordsManagement />);

    const input = screen.getByPlaceholderText('Type a word...');
    await user.type(input, 'hello');

    expect(input.value).toBe('hello');
  });

  it('adds a valid word successfully', async () => {
    const user = userEvent.setup();
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
    const user = userEvent.setup();
    render(<WordsManagement />);

    const button = screen.getByText('Add Word');
    await user.click(button);

    expect(screen.getByText('Please enter a word!')).toBeInTheDocument();
    expect(storage.saveWords).not.toHaveBeenCalled();
  });

  it('shows error for invalid word with numbers', async () => {
    const user = userEvent.setup();
    render(<WordsManagement />);

    const input = screen.getByPlaceholderText('Type a word...');
    const button = screen.getByText('Add Word');

    await user.type(input, 'hello123');
    await user.click(button);

    expect(screen.getByText(/Words can only contain letters/)).toBeInTheDocument();
    expect(storage.saveWords).not.toHaveBeenCalled();
  });

  it('shows error for invalid word with special characters', async () => {
    const user = userEvent.setup();
    render(<WordsManagement />);

    const input = screen.getByPlaceholderText('Type a word...');
    const button = screen.getByText('Add Word');

    await user.type(input, 'hello!');
    await user.click(button);

    expect(screen.getByText(/Words can only contain letters/)).toBeInTheDocument();
    expect(storage.saveWords).not.toHaveBeenCalled();
  });

  it('shows error for duplicate words', async () => {
    const user = userEvent.setup();
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
    const user = userEvent.setup();
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
    const user = userEvent.setup();
    storage.saveWords.mockReturnValue(false); // Simulate save failure

    render(<WordsManagement />);

    const input = screen.getByPlaceholderText('Type a word...');
    const button = screen.getByText('Add Word');

    await user.type(input, 'elephant');
    await user.click(button);

    expect(screen.getByText(/Oops! Could not save the word/)).toBeInTheDocument();
  });

  it('trims whitespace from input', async () => {
    const user = userEvent.setup();
    render(<WordsManagement />);

    const input = screen.getByPlaceholderText('Type a word...');
    const button = screen.getByText('Add Word');

    await user.type(input, '  elephant  ');
    await user.click(button);

    expect(storage.saveWords).toHaveBeenCalledWith(['elephant']);
    expect(screen.getByText(/Great! "elephant" has been added!/)).toBeInTheDocument();
  });

  it('clears error message when user starts typing', async () => {
    const user = userEvent.setup();
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
    const user = userEvent.setup();
    render(<WordsManagement />);

    const input = screen.getByPlaceholderText('Type a word...');

    await user.type(input, 'elephant');
    await user.keyboard('{Enter}');

    expect(storage.saveWords).toHaveBeenCalledWith(['elephant']);
    expect(screen.getByText(/Great! "elephant" has been added!/)).toBeInTheDocument();
  });

  it('adds word to existing word list', async () => {
    const user = userEvent.setup();
    storage.getWords.mockReturnValue(['apple', 'banana']);

    render(<WordsManagement />);

    const input = screen.getByPlaceholderText('Type a word...');
    const button = screen.getByText('Add Word');

    await user.type(input, 'cherry');
    await user.click(button);

    expect(storage.saveWords).toHaveBeenCalledWith(['apple', 'banana', 'cherry']);
    expect(screen.getByText(/Great! "cherry" has been added!/)).toBeInTheDocument();
  });
});
