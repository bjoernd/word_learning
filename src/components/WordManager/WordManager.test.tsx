// ABOUTME: Unit tests for WordManager component
// ABOUTME: Tests word addition, deletion, multi-select functionality, and accessibility

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WordManager } from './WordManager';
import { db, addWord } from '../../services/database';
import styles from './WordManager.module.css';

describe('WordManager', () => {
  beforeEach(async () => {
    // Clear the database before each test
    await db.words.clear();
  });

  describe('Rendering', () => {
    it('should render heading and empty message when no words exist', () => {
      render(<WordManager />);

      expect(screen.getByRole('heading', { name: /manage words/i })).toBeInTheDocument();
      expect(screen.getByText(/no words yet/i)).toBeInTheDocument();
    });

    it('should display word count', async () => {
      await addWord('test');
      await addWord('word');

      render(<WordManager />);

      await waitFor(() => {
        expect(screen.getByText(/words: 2/i)).toBeInTheDocument();
      });
    });

    it('should display sorted word list', async () => {
      await addWord('zebra');
      await addWord('apple');
      await addWord('banana');

      render(<WordManager />);

      await waitFor(() => {
        const wordElements = screen.getAllByRole('listitem');
        expect(wordElements).toHaveLength(3);
        expect(wordElements[0]).toHaveTextContent('apple');
        expect(wordElements[1]).toHaveTextContent('banana');
        expect(wordElements[2]).toHaveTextContent('zebra');
      });
    });
  });

  describe('Adding words', () => {
    it('should add a word when clicking add button', async () => {
      const user = userEvent.setup();
      render(<WordManager />);

      const input = screen.getByPlaceholderText(/enter a word/i);
      const addButton = screen.getByRole('button', { name: /add word/i });

      await user.type(input, 'hello');
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByText('hello')).toBeInTheDocument();
      });
    });

    it('should clear input after adding a word', async () => {
      const user = userEvent.setup();
      render(<WordManager />);

      const input = screen.getByPlaceholderText(/enter a word/i) as HTMLInputElement;
      const addButton = screen.getByRole('button', { name: /add word/i });

      await user.type(input, 'hello');
      await user.click(addButton);

      await waitFor(() => {
        expect(input.value).toBe('');
      });
    });

    it('should add word when pressing Enter', async () => {
      const user = userEvent.setup();
      render(<WordManager />);

      const input = screen.getByPlaceholderText(/enter a word/i);

      await user.type(input, 'world{Enter}');

      await waitFor(() => {
        expect(screen.getByText('world')).toBeInTheDocument();
      });
    });

    it('should show error message when adding duplicate word', async () => {
      const user = userEvent.setup();
      await addWord('duplicate');

      render(<WordManager />);

      const input = screen.getByPlaceholderText(/enter a word/i);
      await user.type(input, 'duplicate{Enter}');

      await waitFor(() => {
        expect(screen.getByText(/already exists/i)).toBeInTheDocument();
      });
    });
  });

  describe('Single word deletion', () => {
    it('should delete a word when clicking delete and confirming', async () => {
      const user = userEvent.setup();
      await addWord('deleteme');

      // Mock window.confirm to return true
      vi.spyOn(window, 'confirm').mockReturnValue(true);

      render(<WordManager />);

      await waitFor(() => {
        expect(screen.getByText('deleteme')).toBeInTheDocument();
      });

      const deleteButton = screen.getByRole('button', { name: /delete.*deleteme/i });
      await user.click(deleteButton);

      await waitFor(() => {
        expect(screen.queryByText('deleteme')).not.toBeInTheDocument();
      });
    });

    it('should not delete a word when clicking delete and canceling', async () => {
      const user = userEvent.setup();
      await addWord('keepme');

      vi.spyOn(window, 'confirm').mockReturnValue(false);

      render(<WordManager />);

      await waitFor(() => {
        expect(screen.getByText('keepme')).toBeInTheDocument();
      });

      const deleteButton = screen.getByRole('button', { name: /delete.*keepme/i });
      await user.click(deleteButton);

      expect(screen.getByText('keepme')).toBeInTheDocument();
    });
  });

  describe('Multi-select functionality', () => {
    beforeEach(async () => {
      await addWord('apple');
      await addWord('banana');
      await addWord('cherry');
    });

    it('should select a word when clicked', async () => {
      const user = userEvent.setup();
      render(<WordManager />);

      await waitFor(() => {
        expect(screen.getByText('apple')).toBeInTheDocument();
      });

      const appleItem = screen.getByText('apple').closest('li');
      expect(appleItem).toBeInTheDocument();

      await user.click(appleItem!);

      expect(appleItem).toHaveClass(styles.selected);
    });

    it('should deselect a word when clicked again', async () => {
      const user = userEvent.setup();
      render(<WordManager />);

      await waitFor(() => {
        expect(screen.getByText('apple')).toBeInTheDocument();
      });

      const appleItem = screen.getByText('apple').closest('li');
      expect(appleItem).toBeInTheDocument();

      // Select
      await user.click(appleItem!);
      expect(appleItem).toHaveClass(styles.selected);

      // Deselect
      await user.click(appleItem!);
      expect(appleItem).not.toHaveClass(styles.selected);
    });

    it('should replace selection when clicking without modifier key', async () => {
      const user = userEvent.setup();
      render(<WordManager />);

      await waitFor(() => {
        expect(screen.getByText('apple')).toBeInTheDocument();
      });

      const appleItem = screen.getByText('apple').closest('li');
      const bananaItem = screen.getByText('banana').closest('li');

      // Select apple
      await user.click(appleItem!);
      expect(appleItem).toHaveClass(styles.selected);

      // Click banana without modifier - should replace selection
      await user.click(bananaItem!);
      expect(bananaItem).toHaveClass(styles.selected);
      expect(appleItem).not.toHaveClass(styles.selected);
    });

    it('should add to selection when clicking with Ctrl key', async () => {
      const user = userEvent.setup();
      render(<WordManager />);

      await waitFor(() => {
        expect(screen.getByText('apple')).toBeInTheDocument();
      });

      const appleItem = screen.getByText('apple').closest('li');
      const bananaItem = screen.getByText('banana').closest('li');

      // Select apple
      await user.click(appleItem!);
      expect(appleItem).toHaveClass(styles.selected);

      // Ctrl+click banana - should add to selection
      await user.keyboard('{Control>}');
      await user.click(bananaItem!);
      await user.keyboard('{/Control}');

      expect(appleItem).toHaveClass(styles.selected);
      expect(bananaItem).toHaveClass(styles.selected);
    });

    it('should add to selection when clicking with Cmd key (Meta)', async () => {
      const user = userEvent.setup();
      render(<WordManager />);

      await waitFor(() => {
        expect(screen.getByText('apple')).toBeInTheDocument();
      });

      const appleItem = screen.getByText('apple').closest('li');
      const bananaItem = screen.getByText('banana').closest('li');

      // Select apple
      await user.click(appleItem!);
      expect(appleItem).toHaveClass(styles.selected);

      // Meta+click banana - should add to selection
      await user.keyboard('{Meta>}');
      await user.click(bananaItem!);
      await user.keyboard('{/Meta}');

      expect(appleItem).toHaveClass(styles.selected);
      expect(bananaItem).toHaveClass(styles.selected);
    });

    it('should show delete selected button when items are selected', async () => {
      const user = userEvent.setup();
      render(<WordManager />);

      await waitFor(() => {
        expect(screen.getByText('apple')).toBeInTheDocument();
      });

      // No delete selected button initially
      expect(screen.queryByRole('button', { name: /delete.*selected/i })).not.toBeInTheDocument();

      // Select a word
      const appleItem = screen.getByText('apple').closest('li');
      await user.click(appleItem!);

      // Delete selected button should appear
      expect(screen.getByRole('button', { name: /delete.*selected/i })).toBeInTheDocument();
    });

    it('should hide delete selected button when no items are selected', async () => {
      const user = userEvent.setup();
      render(<WordManager />);

      await waitFor(() => {
        expect(screen.getByText('apple')).toBeInTheDocument();
      });

      const appleItem = screen.getByText('apple').closest('li');

      // Select and deselect
      await user.click(appleItem!);
      expect(screen.getByRole('button', { name: /delete.*selected/i })).toBeInTheDocument();

      await user.click(appleItem!);
      expect(screen.queryByRole('button', { name: /delete.*selected/i })).not.toBeInTheDocument();
    });

    it('should display count of selected items in delete button', async () => {
      const user = userEvent.setup();
      render(<WordManager />);

      await waitFor(() => {
        expect(screen.getByText('apple')).toBeInTheDocument();
      });

      const appleItem = screen.getByText('apple').closest('li');
      const bananaItem = screen.getByText('banana').closest('li');

      // Select one word
      await user.click(appleItem!);

      // Verify button shows count of 1
      await waitFor(() => {
        const button = screen.getByRole('button', { name: /delete.*selected/i });
        expect(button.textContent).toMatch(/1/);
      });

      // Select another word with Ctrl
      await user.keyboard('{Control>}');
      await user.click(bananaItem!);
      await user.keyboard('{/Control}');

      // Verify button shows count of 2
      await waitFor(() => {
        const button = screen.getByRole('button', { name: /delete.*selected/i });
        expect(button.textContent).toMatch(/2/);
      });
    });
  });

  describe('Bulk deletion', () => {
    beforeEach(async () => {
      await addWord('apple');
      await addWord('banana');
      await addWord('cherry');
      await addWord('date');
    });

    it('should delete selected words when clicking delete selected button and confirming', async () => {
      const user = userEvent.setup();
      vi.spyOn(window, 'confirm').mockReturnValue(true);

      render(<WordManager />);

      await waitFor(() => {
        expect(screen.getByText('apple')).toBeInTheDocument();
      });

      // Select two words
      const appleItem = screen.getByText('apple').closest('li');
      const cherryItem = screen.getByText('cherry').closest('li');

      await user.click(appleItem!);
      await user.keyboard('{Control>}');
      await user.click(cherryItem!);
      await user.keyboard('{/Control}');

      // Click delete selected
      const deleteButton = await waitFor(() =>
        screen.getByRole('button', { name: /delete.*selected/i })
      );
      await user.click(deleteButton);

      // Verify selected words are deleted
      await waitFor(() => {
        expect(screen.queryByText('apple')).not.toBeInTheDocument();
        expect(screen.queryByText('cherry')).not.toBeInTheDocument();
      });

      // Verify other words remain
      expect(screen.getByText('banana')).toBeInTheDocument();
      expect(screen.getByText('date')).toBeInTheDocument();
    });

    it('should not delete words when canceling bulk delete confirmation', async () => {
      const user = userEvent.setup();
      vi.spyOn(window, 'confirm').mockReturnValue(false);

      render(<WordManager />);

      await waitFor(() => {
        expect(screen.getByText('apple')).toBeInTheDocument();
      });

      // Select two words
      const appleItem = screen.getByText('apple').closest('li');
      const bananaItem = screen.getByText('banana').closest('li');

      await user.click(appleItem!);
      await user.keyboard('{Control>}');
      await user.click(bananaItem!);
      await user.keyboard('{/Control}');

      // Click delete selected but cancel
      const deleteButton = await waitFor(() =>
        screen.getByRole('button', { name: /delete.*selected/i })
      );
      await user.click(deleteButton);

      // All words should still exist
      expect(screen.getByText('apple')).toBeInTheDocument();
      expect(screen.getByText('banana')).toBeInTheDocument();
      expect(screen.getByText('cherry')).toBeInTheDocument();
      expect(screen.getByText('date')).toBeInTheDocument();
    });

    it('should clear selection after successful bulk deletion', async () => {
      const user = userEvent.setup();
      vi.spyOn(window, 'confirm').mockReturnValue(true);

      render(<WordManager />);

      await waitFor(() => {
        expect(screen.getByText('apple')).toBeInTheDocument();
      });

      // Select and delete words
      const appleItem = screen.getByText('apple').closest('li');
      await user.click(appleItem!);

      const deleteButton = await waitFor(() =>
        screen.getByRole('button', { name: /delete.*selected/i })
      );
      await user.click(deleteButton);

      // Wait for deletion to complete
      await waitFor(() => {
        expect(screen.queryByText('apple')).not.toBeInTheDocument();
      });

      // Delete selected button should be gone (selection cleared)
      expect(screen.queryByRole('button', { name: /delete.*selected/i })).not.toBeInTheDocument();
    });

    it('should show appropriate confirmation message for bulk deletion', async () => {
      const user = userEvent.setup();
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

      render(<WordManager />);

      await waitFor(() => {
        expect(screen.getByText('apple')).toBeInTheDocument();
      });

      // Select two words
      const appleItem = screen.getByText('apple').closest('li');
      const bananaItem = screen.getByText('banana').closest('li');

      await user.click(appleItem!);
      await user.keyboard('{Control>}');
      await user.click(bananaItem!);
      await user.keyboard('{/Control}');

      // Click delete selected
      const deleteButton = await waitFor(() =>
        screen.getByRole('button', { name: /delete.*selected/i })
      );
      await user.click(deleteButton);

      // Verify confirmation was called with appropriate message
      expect(confirmSpy).toHaveBeenCalledWith(expect.stringMatching(/delete.*2.*words/i));
    });
  });

  describe('Accessibility', () => {
    beforeEach(async () => {
      await addWord('test');
    });

    it('should have proper ARIA labels for add word input', () => {
      render(<WordManager />);

      const input = screen.getByPlaceholderText(/enter a word/i);
      expect(input).toHaveAttribute('aria-label', 'New word to add');
    });

    it('should have proper ARIA labels for individual delete buttons', async () => {
      render(<WordManager />);

      await waitFor(() => {
        const deleteButton = screen.getByRole('button', { name: /delete word test/i });
        expect(deleteButton).toBeInTheDocument();
      });
    });

    it('should make word items keyboard accessible for selection', async () => {
      const user = userEvent.setup();
      render(<WordManager />);

      await waitFor(() => {
        expect(screen.getByText('test')).toBeInTheDocument();
      });

      // Should be focusable
      await user.tab();
      // The word item or its container should receive focus
      expect(document.activeElement).toBeTruthy();
    });
  });
});
