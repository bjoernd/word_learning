// ABOUTME: Tests for the App component.
// ABOUTME: Validates tab navigation, rendering, and active tab styling.
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import styles from './App.module.css';
import * as database from './services/database';
import * as speech from './services/speech';

vi.mock('./services/database');
vi.mock('./services/speech');
vi.mock('./services/soundEffects');

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(database.getWordCount).mockResolvedValue(10);
    vi.mocked(database.getRandomWords).mockResolvedValue([]);
    vi.mocked(speech.speechService.getVoices).mockReturnValue([]);
  });

  it('should render all three tab buttons', () => {
    render(<App />);

    expect(screen.getByRole('button', { name: 'Practice' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Manage Words' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Voice Selector' })).toBeInTheDocument();
  });

  it('should show Practice tab by default', () => {
    render(<App />);

    const practiceButton = screen.getByRole('button', { name: 'Practice' });
    expect(practiceButton).toHaveClass(styles.active);
  });

  it('should switch to Manage Words tab when clicked', async () => {
    const user = userEvent.setup();
    render(<App />);

    const manageButton = screen.getByRole('button', { name: 'Manage Words' });
    await user.click(manageButton);

    expect(manageButton).toHaveClass(styles.active);
    expect(screen.getByRole('button', { name: 'Practice' })).not.toHaveClass(styles.active);
  });

  it('should switch to Voice Selector tab when clicked', async () => {
    const user = userEvent.setup();
    render(<App />);

    const voiceButton = screen.getByRole('button', { name: 'Voice Selector' });
    await user.click(voiceButton);

    expect(voiceButton).toHaveClass(styles.active);
    expect(screen.getByRole('button', { name: 'Practice' })).not.toHaveClass(styles.active);
  });

  it('should switch back to Practice tab when clicked', async () => {
    const user = userEvent.setup();
    render(<App />);

    const manageButton = screen.getByRole('button', { name: 'Manage Words' });
    const practiceButton = screen.getByRole('button', { name: 'Practice' });

    // Switch to Manage Words
    await user.click(manageButton);
    expect(manageButton).toHaveClass(styles.active);

    // Switch back to Practice
    await user.click(practiceButton);
    expect(practiceButton).toHaveClass(styles.active);
    expect(manageButton).not.toHaveClass(styles.active);
  });

  it('should only show one active tab at a time', async () => {
    const user = userEvent.setup();
    render(<App />);

    const practiceButton = screen.getByRole('button', { name: 'Practice' });
    const manageButton = screen.getByRole('button', { name: 'Manage Words' });
    const voiceButton = screen.getByRole('button', { name: 'Voice Selector' });

    // Initially only practice is active
    expect(practiceButton).toHaveClass(styles.active);
    expect(manageButton).not.toHaveClass(styles.active);
    expect(voiceButton).not.toHaveClass(styles.active);

    // Click manage
    await user.click(manageButton);
    expect(practiceButton).not.toHaveClass(styles.active);
    expect(manageButton).toHaveClass(styles.active);
    expect(voiceButton).not.toHaveClass(styles.active);

    // Click voice
    await user.click(voiceButton);
    expect(practiceButton).not.toHaveClass(styles.active);
    expect(manageButton).not.toHaveClass(styles.active);
    expect(voiceButton).toHaveClass(styles.active);
  });
});
