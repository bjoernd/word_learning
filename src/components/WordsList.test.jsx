import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import WordsList from './WordsList';
import * as storage from '../services/storage';

// Mock the storage module
vi.mock('../services/storage', () => ({
  getWords: vi.fn(),
  saveWords: vi.fn(),
}));

describe('WordsList', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
    // Default mock implementations
    storage.getWords.mockReturnValue([]);
    storage.saveWords.mockReturnValue(true);
  });

  describe('Empty State', () => {
    it('displays empty state when no words exist', () => {
      storage.getWords.mockReturnValue([]);

      render(<WordsList />);

      expect(screen.getByText('No words yet. Add some!')).toBeInTheDocument();
      expect(screen.getByText(/Use the form above/)).toBeInTheDocument();
    });

    it('does not display word count in empty state', () => {
      storage.getWords.mockReturnValue([]);

      render(<WordsList />);

      expect(screen.queryByText(/You have/)).not.toBeInTheDocument();
    });
  });

  describe('Word Display', () => {
    it('displays all words from localStorage', () => {
      storage.getWords.mockReturnValue(['apple', 'banana', 'cherry']);

      render(<WordsList />);

      expect(screen.getByText('apple')).toBeInTheDocument();
      expect(screen.getByText('banana')).toBeInTheDocument();
      expect(screen.getByText('cherry')).toBeInTheDocument();
    });

    it('displays correct word count for single word', () => {
      storage.getWords.mockReturnValue(['apple']);

      render(<WordsList />);

      expect(screen.getByText('You have 1 word to practice!')).toBeInTheDocument();
    });

    it('displays correct word count for multiple words', () => {
      storage.getWords.mockReturnValue(['apple', 'banana', 'cherry']);

      render(<WordsList />);

      expect(screen.getByText('You have 3 words to practice!')).toBeInTheDocument();
    });

    it('renders delete button for each word', () => {
      storage.getWords.mockReturnValue(['apple', 'banana']);

      render(<WordsList />);

      const deleteButtons = screen.getAllByText('Delete');
      expect(deleteButtons).toHaveLength(2);
    });
  });

  describe('Word Deletion', () => {
    it('deletes word when confirmed', async () => {
      const user = userEvent.setup();
      storage.getWords.mockReturnValue(['apple', 'banana', 'cherry']);

      // Mock window.confirm to return true (confirmed)
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

      render(<WordsList />);

      // Find and click the delete button for 'banana'
      const deleteButtons = screen.getAllByText('Delete');
      await user.click(deleteButtons[1]); // Second word is 'banana'

      // Check that confirm was called with the right message
      expect(confirmSpy).toHaveBeenCalledWith(
        'Are you sure you want to delete "banana"?'
      );

      // Check that saveWords was called with updated list
      expect(storage.saveWords).toHaveBeenCalledWith(['apple', 'cherry']);

      // Check that the word is removed from the UI
      expect(screen.queryByText('banana')).not.toBeInTheDocument();
      expect(screen.getByText('apple')).toBeInTheDocument();
      expect(screen.getByText('cherry')).toBeInTheDocument();
    });

    it('does not delete word when cancelled', async () => {
      const user = userEvent.setup();
      storage.getWords.mockReturnValue(['apple', 'banana']);

      // Mock window.confirm to return false (cancelled)
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

      render(<WordsList />);

      const deleteButtons = screen.getAllByText('Delete');
      await user.click(deleteButtons[0]);

      // Check that confirm was called
      expect(confirmSpy).toHaveBeenCalled();

      // Check that saveWords was NOT called
      expect(storage.saveWords).not.toHaveBeenCalled();

      // Check that word is still in the UI
      expect(screen.getByText('apple')).toBeInTheDocument();
      expect(screen.getByText('banana')).toBeInTheDocument();
    });

    it('shows alert when delete fails', async () => {
      const user = userEvent.setup();
      storage.getWords.mockReturnValue(['apple']);
      storage.saveWords.mockReturnValue(false); // Simulate save failure

      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

      render(<WordsList />);

      const deleteButton = screen.getByText('Delete');
      await user.click(deleteButton);

      expect(confirmSpy).toHaveBeenCalled();
      expect(storage.saveWords).toHaveBeenCalled();
      expect(alertSpy).toHaveBeenCalledWith(
        'Oops! Could not delete the word. Please try again.'
      );

      // Word should still be in the UI since deletion failed
      expect(screen.getByText('apple')).toBeInTheDocument();
    });

    it('deletes last word and shows empty state', async () => {
      const user = userEvent.setup();
      storage.getWords.mockReturnValue(['apple']);

      vi.spyOn(window, 'confirm').mockReturnValue(true);

      render(<WordsList />);

      const deleteButton = screen.getByText('Delete');
      await user.click(deleteButton);

      expect(storage.saveWords).toHaveBeenCalledWith([]);
      expect(screen.queryByText('apple')).not.toBeInTheDocument();
      expect(screen.getByText('No words yet. Add some!')).toBeInTheDocument();
    });

    it('updates word count after deletion', async () => {
      const user = userEvent.setup();
      storage.getWords.mockReturnValue(['apple', 'banana', 'cherry']);

      vi.spyOn(window, 'confirm').mockReturnValue(true);

      render(<WordsList />);

      expect(screen.getByText('You have 3 words to practice!')).toBeInTheDocument();

      const deleteButtons = screen.getAllByText('Delete');
      await user.click(deleteButtons[0]);

      expect(screen.getByText('You have 2 words to practice!')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper aria-label for delete buttons', () => {
      storage.getWords.mockReturnValue(['apple', 'banana']);

      render(<WordsList />);

      expect(screen.getByLabelText('Delete apple')).toBeInTheDocument();
      expect(screen.getByLabelText('Delete banana')).toBeInTheDocument();
    });
  });

  describe('Component Title', () => {
    it('renders the component title', () => {
      render(<WordsList />);

      expect(screen.getByText('Your Word List')).toBeInTheDocument();
    });
  });
});
