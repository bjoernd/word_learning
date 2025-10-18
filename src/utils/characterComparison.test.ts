// ABOUTME: Tests for character comparison CSS class utility function
// ABOUTME: Verifies correct class names are applied for different character match states
import { describe, it, expect } from 'vitest';
import { getCharacterClassName } from './characterComparison';

describe('getCharacterClassName', () => {
  const mockStyles = {
    char: 'char',
    charMatch: 'charMatch',
    charWrong: 'charWrong',
    charMissing: 'charMissing',
    charExtra: 'charExtra',
  };

  it('returns correct class for match state', () => {
    const result = getCharacterClassName('match', mockStyles);
    expect(result).toBe('char charMatch');
  });

  it('returns correct class for wrong state', () => {
    const result = getCharacterClassName('wrong', mockStyles);
    expect(result).toBe('char charWrong');
  });

  it('returns correct class for missing state', () => {
    const result = getCharacterClassName('missing', mockStyles);
    expect(result).toBe('char charMissing');
  });

  it('returns correct class for extra state', () => {
    const result = getCharacterClassName('extra', mockStyles);
    expect(result).toBe('char charExtra');
  });
});
