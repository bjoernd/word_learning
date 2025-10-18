// ABOUTME: Tests for SessionSummary component that displays practice session results.
// ABOUTME: Verifies score display, restart functionality, and winner animations based on score thresholds.
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SessionSummary } from './SessionSummary';

describe('SessionSummary', () => {
  it('renders score correctly', () => {
    const onRestart = vi.fn();
    render(<SessionSummary score={7} total={10} onRestart={onRestart} />);

    expect(screen.getByText('Session Complete!')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('out of')).toBeInTheDocument();
  });

  it('calls onRestart when Restart button clicked', () => {
    const onRestart = vi.fn();
    render(<SessionSummary score={5} total={10} onRestart={onRestart} />);

    const restartButton = screen.getByRole('button', { name: /restart/i });
    fireEvent.click(restartButton);

    expect(onRestart).toHaveBeenCalledTimes(1);
  });

  it('does not show winner animation for low scores (<60%)', () => {
    const onRestart = vi.fn();
    const { container } = render(<SessionSummary score={5} total={10} onRestart={onRestart} />);

    // No confetti animations should be present
    const confettiElements = container.querySelectorAll('[class*="confettiOverlay"]');
    expect(confettiElements.length).toBe(0);
  });

  it('shows winner-ok animation for scores 60% to <90%', () => {
    const onRestart = vi.fn();
    const { container } = render(<SessionSummary score={6} total={10} onRestart={onRestart} />);

    // Should have exactly one confetti animation
    const confettiElements = container.querySelectorAll('[class*="confettiOverlay"]');
    expect(confettiElements.length).toBe(1);
  });

  it('shows winner-perfect animation for scores >= 90%', () => {
    const onRestart = vi.fn();
    const { container } = render(<SessionSummary score={9} total={10} onRestart={onRestart} />);

    // Should have exactly one confetti animation
    const confettiElements = container.querySelectorAll('[class*="confettiOverlay"]');
    expect(confettiElements.length).toBe(1);
  });

  it('shows winner animation exactly at 60% threshold', () => {
    const onRestart = vi.fn();
    const { container } = render(<SessionSummary score={6} total={10} onRestart={onRestart} />);

    const confettiElements = container.querySelectorAll('[class*="confettiOverlay"]');
    expect(confettiElements.length).toBe(1);
  });

  it('shows winner animation exactly at 90% threshold', () => {
    const onRestart = vi.fn();
    const { container } = render(<SessionSummary score={9} total={10} onRestart={onRestart} />);

    const confettiElements = container.querySelectorAll('[class*="confettiOverlay"]');
    expect(confettiElements.length).toBe(1);
  });
});
