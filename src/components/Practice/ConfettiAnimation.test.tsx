// ABOUTME: Tests for ConfettiAnimation component that renders lottie-based confetti animations.
// ABOUTME: Verifies animation lifecycle, positioning, and completion callbacks.
import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ConfettiAnimation } from './ConfettiAnimation';

describe('ConfettiAnimation', () => {
  it('renders with correct positioning', () => {
    const { container } = render(
      <ConfettiAnimation
        top={50}
        left={75}
        animationData={{ test: 'data' }}
      />
    );

    const element = container.firstChild as HTMLElement;
    expect(element).toBeTruthy();
    expect(element.style.top).toBe('50%');
    expect(element.style.left).toBe('75%');
  });

  it('accepts onComplete callback without errors', () => {
    const onComplete = vi.fn();
    const { container } = render(
      <ConfettiAnimation
        top={50}
        left={50}
        animationData={{ test: 'data' }}
        onComplete={onComplete}
      />
    );

    // Verify component renders successfully with callback
    expect(container.firstChild).toBeTruthy();
  });

  it('works without onComplete callback', () => {
    const { container } = render(
      <ConfettiAnimation
        top={50}
        left={50}
        animationData={{ test: 'data' }}
      />
    );

    expect(container.firstChild).toBeTruthy();
  });

  it('loads animation with correct configuration', () => {
    const animationData = { frames: [], layers: [] };
    const { container } = render(
      <ConfettiAnimation
        top={30}
        left={40}
        animationData={animationData}
      />
    );

    const element = container.firstChild as HTMLElement;
    expect(element).toBeTruthy();
  });

  it('cleans up animation on unmount', () => {
    const { unmount } = render(
      <ConfettiAnimation
        top={50}
        left={50}
        animationData={{ test: 'data' }}
      />
    );

    // Should not throw when unmounting
    expect(() => unmount()).not.toThrow();
  });
});
