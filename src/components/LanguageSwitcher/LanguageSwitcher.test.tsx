// ABOUTME: Unit tests for LanguageSwitcher component
// ABOUTME: Tests language switching, persistence, rendering, and accessibility

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LanguageSwitcher } from './LanguageSwitcher';
import i18n from '../../i18n/config';

describe('LanguageSwitcher', () => {
  beforeEach(() => {
    // Reset language to English before each test
    i18n.changeLanguage('en');
    // Clear localStorage mock
    localStorage.clear();
  });

  describe('Rendering', () => {
    it('should render both language buttons', () => {
      render(<LanguageSwitcher />);

      expect(screen.getByRole('button', { name: /switch to en/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /switch to de/i })).toBeInTheDocument();
    });

    it('should mark current language as active', () => {
      render(<LanguageSwitcher />);

      const enButton = screen.getByRole('button', { name: /switch to en/i });
      const deButton = screen.getByRole('button', { name: /switch to de/i });

      expect(enButton).toHaveAttribute('aria-pressed', 'true');
      expect(deButton).toHaveAttribute('aria-pressed', 'false');
    });

    it('should have proper ARIA attributes', () => {
      render(<LanguageSwitcher />);

      const container = screen.getByRole('group', { name: /language selection/i });
      expect(container).toBeInTheDocument();

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveAttribute('aria-pressed');
        expect(button).toHaveAttribute('aria-label');
      });
    });
  });

  describe('Language switching', () => {
    it('should switch to German when DE button is clicked', async () => {
      const user = userEvent.setup();
      render(<LanguageSwitcher />);

      const deButton = screen.getByRole('button', { name: /switch to de/i });
      await user.click(deButton);

      expect(i18n.language).toBe('de');
    });

    it('should switch to English when EN button is clicked', async () => {
      const user = userEvent.setup();
      // Start with German
      i18n.changeLanguage('de');

      render(<LanguageSwitcher />);

      const enButton = screen.getByRole('button', { name: /switch to en/i });
      await user.click(enButton);

      expect(i18n.language).toBe('en');
    });

    it('should update active state after language change', async () => {
      const user = userEvent.setup();
      render(<LanguageSwitcher />);

      const deButton = screen.getByRole('button', { name: /switch to de/i });
      await user.click(deButton);

      expect(deButton).toHaveAttribute('aria-pressed', 'true');
      expect(screen.getByRole('button', { name: /switch to en/i })).toHaveAttribute('aria-pressed', 'false');
    });
  });

  describe('Language persistence', () => {
    it('should save language preference to localStorage when switching to German', async () => {
      const user = userEvent.setup();
      render(<LanguageSwitcher />);

      const deButton = screen.getByRole('button', { name: /switch to de/i });
      await user.click(deButton);

      expect(localStorage.setItem).toHaveBeenCalledWith('userLanguage', 'de');
    });

    it('should save language preference to localStorage when switching to English', async () => {
      const user = userEvent.setup();
      i18n.changeLanguage('de');

      render(<LanguageSwitcher />);

      const enButton = screen.getByRole('button', { name: /switch to en/i });
      await user.click(enButton);

      expect(localStorage.setItem).toHaveBeenCalledWith('userLanguage', 'en');
    });

    it('should persist language across multiple switches', async () => {
      const user = userEvent.setup();
      render(<LanguageSwitcher />);

      // Switch to German
      await user.click(screen.getByRole('button', { name: /switch to de/i }));
      expect(localStorage.setItem).toHaveBeenCalledWith('userLanguage', 'de');

      // Switch back to English
      await user.click(screen.getByRole('button', { name: /switch to en/i }));
      expect(localStorage.setItem).toHaveBeenCalledWith('userLanguage', 'en');
    });
  });

  describe('Keyboard accessibility', () => {
    it('should be keyboard navigable', async () => {
      const user = userEvent.setup();
      render(<LanguageSwitcher />);

      const enButton = screen.getByRole('button', { name: /switch to en/i });
      const deButton = screen.getByRole('button', { name: /switch to de/i });

      // Tab to first button
      await user.tab();
      expect(enButton).toHaveFocus();

      // Tab to second button
      await user.tab();
      expect(deButton).toHaveFocus();
    });

    it('should switch language when activated with Enter key', async () => {
      const user = userEvent.setup();
      render(<LanguageSwitcher />);

      // Tab to first button, then to second
      await user.tab();
      await user.tab();

      // Press Enter to activate German button
      await user.keyboard('{Enter}');

      expect(i18n.language).toBe('de');
      expect(localStorage.setItem).toHaveBeenCalledWith('userLanguage', 'de');
    });

    it('should switch language when activated with Space key', async () => {
      const user = userEvent.setup();
      render(<LanguageSwitcher />);

      // Tab to first button, then to second
      await user.tab();
      await user.tab();

      // Press Space to activate German button
      await user.keyboard(' ');

      expect(i18n.language).toBe('de');
      expect(localStorage.setItem).toHaveBeenCalledWith('userLanguage', 'de');
    });
  });
});
