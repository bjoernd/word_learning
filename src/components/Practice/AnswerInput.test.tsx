// ABOUTME: Tests for AnswerInput component that handles user input and feedback during practice.
// ABOUTME: Verifies input handling, submission, replay functionality, and feedback display.
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AnswerInput } from './AnswerInput';

describe('AnswerInput', () => {
  it('renders input field and buttons', () => {
    const onSubmit = vi.fn();
    const onReplay = vi.fn();

    render(
      <AnswerInput
        userInput=""
        onInputChange={() => {}}
        onSubmit={onSubmit}
        onReplay={onReplay}
        feedback={null}
        score={0}
        answersCount={0}
      />
    );

    expect(screen.getByPlaceholderText('Type the word you heard')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /replay/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
  });

  it('displays current score', () => {
    render(
      <AnswerInput
        userInput=""
        onInputChange={() => {}}
        onSubmit={() => {}}
        onReplay={() => {}}
        feedback={null}
        score={3}
        answersCount={5}
      />
    );

    expect(screen.getByText('Score: 3/5')).toBeInTheDocument();
  });

  it('calls onInputChange when typing', () => {
    const onInputChange = vi.fn();

    render(
      <AnswerInput
        userInput=""
        onInputChange={onInputChange}
        onSubmit={() => {}}
        onReplay={() => {}}
        feedback={null}
        score={0}
        answersCount={0}
      />
    );

    const input = screen.getByPlaceholderText('Type the word you heard');
    fireEvent.change(input, { target: { value: 'test' } });

    expect(onInputChange).toHaveBeenCalled();
  });

  it('calls onSubmit when submit button clicked', () => {
    const onSubmit = vi.fn();

    render(
      <AnswerInput
        userInput="hello"
        onInputChange={() => {}}
        onSubmit={onSubmit}
        onReplay={() => {}}
        feedback={null}
        score={0}
        answersCount={0}
      />
    );

    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('calls onReplay when replay button clicked', () => {
    const onReplay = vi.fn();

    render(
      <AnswerInput
        userInput=""
        onInputChange={() => {}}
        onSubmit={() => {}}
        onReplay={onReplay}
        feedback={null}
        score={0}
        answersCount={0}
      />
    );

    const replayButton = screen.getByRole('button', { name: /replay/i });
    fireEvent.click(replayButton);

    expect(onReplay).toHaveBeenCalledTimes(1);
  });

  it('disables input and submit when feedback is showing', () => {
    render(
      <AnswerInput
        userInput="test"
        onInputChange={() => {}}
        onSubmit={() => {}}
        onReplay={() => {}}
        feedback="correct"
        score={1}
        answersCount={1}
      />
    );

    const input = screen.getByPlaceholderText('Type the word you heard');
    const submitButton = screen.getByRole('button', { name: /submit/i });

    expect(input).toBeDisabled();
    expect(submitButton).toBeDisabled();
  });

  it('displays correct feedback', () => {
    render(
      <AnswerInput
        userInput="test"
        onInputChange={() => {}}
        onSubmit={() => {}}
        onReplay={() => {}}
        feedback="correct"
        score={1}
        answersCount={1}
      />
    );

    expect(screen.getByText('Correct!')).toBeInTheDocument();
    expect(screen.getByText('✓')).toBeInTheDocument();
  });

  it('displays incorrect feedback with character comparison', () => {
    render(
      <AnswerInput
        userInput="tast"
        onInputChange={() => {}}
        onSubmit={() => {}}
        onReplay={() => {}}
        feedback="incorrect"
        score={0}
        answersCount={1}
        correctWord="test"
      />
    );

    expect(screen.getByText('Incorrect')).toBeInTheDocument();
    expect(screen.getByText('✗')).toBeInTheDocument();
  });
});
