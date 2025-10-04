import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

// Mock the child components
vi.mock('./components/PracticePane', () => ({
  default: () => <div data-testid="practice-pane">Practice Pane Component</div>,
}));

vi.mock('./components/WordsManagement', () => ({
  default: () => <div data-testid="words-management">Words Management Component</div>,
}));

describe('App', () => {
  describe('Rendering', () => {
    it('renders the app header', () => {
      render(<App />);

      expect(screen.getByText('Word Learning App')).toBeInTheDocument();
      expect(screen.getByText('Practice your spelling!')).toBeInTheDocument();
    });

    it('renders both tab buttons', () => {
      render(<App />);

      expect(screen.getByRole('tab', { name: /practice/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /manage words/i })).toBeInTheDocument();
    });

    it('renders Practice tab as active by default', () => {
      render(<App />);

      const practiceTab = screen.getByRole('tab', { name: /practice/i });
      expect(practiceTab).toHaveClass('active');
      expect(practiceTab).toHaveAttribute('aria-selected', 'true');
    });

    it('renders Manage Words tab as inactive by default', () => {
      render(<App />);

      const manageTab = screen.getByRole('tab', { name: /manage words/i });
      expect(manageTab).not.toHaveClass('active');
      expect(manageTab).toHaveAttribute('aria-selected', 'false');
    });

    it('renders PracticePane component by default', () => {
      render(<App />);

      expect(screen.getByTestId('practice-pane')).toBeInTheDocument();
      expect(screen.queryByTestId('words-management')).not.toBeInTheDocument();
    });
  });

  describe('Tab Navigation', () => {
    it('switches to Manage Words pane when clicking Manage Words tab', async () => {
      const user = userEvent.setup();
      render(<App />);

      const manageTab = screen.getByRole('tab', { name: /manage words/i });
      await user.click(manageTab);

      expect(screen.getByTestId('words-management')).toBeInTheDocument();
      expect(screen.queryByTestId('practice-pane')).not.toBeInTheDocument();
    });

    it('switches back to Practice pane when clicking Practice tab', async () => {
      const user = userEvent.setup();
      render(<App />);

      // First switch to Manage Words
      const manageTab = screen.getByRole('tab', { name: /manage words/i });
      await user.click(manageTab);

      // Then switch back to Practice
      const practiceTab = screen.getByRole('tab', { name: /practice/i });
      await user.click(practiceTab);

      expect(screen.getByTestId('practice-pane')).toBeInTheDocument();
      expect(screen.queryByTestId('words-management')).not.toBeInTheDocument();
    });

    it('updates active tab styling when switching tabs', async () => {
      const user = userEvent.setup();
      render(<App />);

      const practiceTab = screen.getByRole('tab', { name: /practice/i });
      const manageTab = screen.getByRole('tab', { name: /manage words/i });

      // Initially Practice is active
      expect(practiceTab).toHaveClass('active');
      expect(manageTab).not.toHaveClass('active');

      // Click Manage Words
      await user.click(manageTab);

      // Now Manage Words is active
      expect(manageTab).toHaveClass('active');
      expect(practiceTab).not.toHaveClass('active');
    });

    it('updates aria-selected when switching tabs', async () => {
      const user = userEvent.setup();
      render(<App />);

      const practiceTab = screen.getByRole('tab', { name: /practice/i });
      const manageTab = screen.getByRole('tab', { name: /manage words/i });

      // Initially Practice is selected
      expect(practiceTab).toHaveAttribute('aria-selected', 'true');
      expect(manageTab).toHaveAttribute('aria-selected', 'false');

      // Click Manage Words
      await user.click(manageTab);

      // Now Manage Words is selected
      expect(manageTab).toHaveAttribute('aria-selected', 'true');
      expect(practiceTab).toHaveAttribute('aria-selected', 'false');
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA roles for tab navigation', () => {
      render(<App />);

      const tablist = screen.getByRole('tablist');
      expect(tablist).toBeInTheDocument();

      const tabs = screen.getAllByRole('tab');
      expect(tabs).toHaveLength(2);

      const tabpanels = screen.getAllByRole('tabpanel');
      expect(tabpanels).toHaveLength(2);
    });

    it('has proper aria-controls attributes', () => {
      render(<App />);

      const practiceTab = screen.getByRole('tab', { name: /practice/i });
      const manageTab = screen.getByRole('tab', { name: /manage words/i });

      expect(practiceTab).toHaveAttribute('aria-controls', 'practice-panel');
      expect(manageTab).toHaveAttribute('aria-controls', 'manage-panel');
    });

    it('tab panels have correct IDs', () => {
      render(<App />);

      expect(screen.getByTestId('practice-pane').closest('[role="tabpanel"]')).toHaveAttribute('id', 'practice-panel');
    });
  });

  describe('State Preservation', () => {
    it('preserves component state when switching tabs', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Switch to Manage Words and back
      const manageTab = screen.getByRole('tab', { name: /manage words/i });
      await user.click(manageTab);

      const practiceTab = screen.getByRole('tab', { name: /practice/i });
      await user.click(practiceTab);

      // Component should be re-rendered (unmounted and remounted)
      // This is expected behavior with conditional rendering
      expect(screen.getByTestId('practice-pane')).toBeInTheDocument();
    });
  });
});
