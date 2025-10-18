// ABOUTME: Tests for CharacterComparison component
// ABOUTME: Verifies character-by-character comparison rendering with correct CSS classes
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CharacterComparison } from './CharacterComparison';

describe('CharacterComparison', () => {
  it('renders correct characters', () => {
    render(<CharacterComparison correctWord="cat" userAnswer="cat" />);

    // Should show both correct and user answer rows
    expect(screen.getByText('Correct:')).toBeInTheDocument();
    expect(screen.getByText('Your answer:')).toBeInTheDocument();

    // Should show the characters
    const chars = screen.getAllByText('c');
    expect(chars.length).toBeGreaterThanOrEqual(2); // at least one in each row
  });

  it('applies correct CSS classes for matching characters', () => {
    const { container } = render(<CharacterComparison correctWord="cat" userAnswer="cat" />);

    // All characters should have match styling
    const characterDivs = container.querySelectorAll('[class*="char"]');
    expect(characterDivs.length).toBeGreaterThan(0);
  });

  it('handles missing characters', () => {
    render(<CharacterComparison correctWord="cat" userAnswer="ca" />);

    // Should show underscore for missing character
    expect(screen.getByText('_')).toBeInTheDocument();
  });

  it('handles extra characters', () => {
    render(<CharacterComparison correctWord="cat" userAnswer="cats" />);

    // Should render the extra character
    const chars = screen.getAllByText('s');
    expect(chars.length).toBeGreaterThanOrEqual(1);
  });

  it('handles wrong characters', () => {
    render(<CharacterComparison correctWord="cat" userAnswer="cot" />);

    // Should show both 'a' (correct) and 'o' (user's wrong answer)
    expect(screen.getByText('a')).toBeInTheDocument();
    expect(screen.getByText('o')).toBeInTheDocument();
  });

  it('is case insensitive', () => {
    render(<CharacterComparison correctWord="Cat" userAnswer="CAT" />);

    // Should convert to lowercase for comparison
    const correctRow = screen.getByText('Correct:').parentElement;
    const userRow = screen.getByText('Your answer:').parentElement;

    expect(correctRow).toBeInTheDocument();
    expect(userRow).toBeInTheDocument();
  });

  it('handles empty user answer', () => {
    render(<CharacterComparison correctWord="cat" userAnswer="" />);

    // Should show correct word and underscores for all missing characters
    expect(screen.getByText('Correct:')).toBeInTheDocument();
    expect(screen.getByText('Your answer:')).toBeInTheDocument();

    const underscores = screen.getAllByText('_');
    expect(underscores.length).toBe(3); // one for each missing character
  });

  it('renders comparison structure correctly', () => {
    const { container } = render(<CharacterComparison correctWord="test" userAnswer="text" />);

    // Should have the characterComparison wrapper
    const wrapper = container.querySelector('[class*="characterComparison"]');
    expect(wrapper).toBeInTheDocument();

    // Should have two comparison rows
    const rows = container.querySelectorAll('[class*="comparisonRow"]');
    expect(rows.length).toBe(2);
  });
});
