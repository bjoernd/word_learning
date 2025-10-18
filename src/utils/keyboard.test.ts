// ABOUTME: Tests for keyboard utility functions
// ABOUTME: Validates Enter key handler behavior with various key events

import { describe, it, expect, vi } from 'vitest';
import { handleEnterKey } from './keyboard';

describe('handleEnterKey', () => {
  it('should call handler when Enter key is pressed', () => {
    const handler = vi.fn();
    const event = { key: 'Enter' } as React.KeyboardEvent;

    handleEnterKey(event, handler);

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('should not call handler for other keys', () => {
    const handler = vi.fn();
    const keys = ['a', 'Space', 'Tab', 'Escape', 'ArrowDown'];

    keys.forEach(key => {
      handler.mockClear();
      const event = { key } as React.KeyboardEvent;
      handleEnterKey(event, handler);
      expect(handler).not.toHaveBeenCalled();
    });
  });

  it('should work with lowercase enter', () => {
    const handler = vi.fn();
    const event = { key: 'enter' } as React.KeyboardEvent;

    handleEnterKey(event, handler);

    expect(handler).not.toHaveBeenCalled();
  });
});
