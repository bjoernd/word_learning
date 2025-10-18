// ABOUTME: Component for user input and feedback during practice sessions.
// ABOUTME: Handles text input, submission, replay, and displays correct/incorrect feedback with character comparison.
import { Ref } from 'react';
import { handleEnterKey } from '../../utils/keyboard';
import { CharacterComparison } from './CharacterComparison';
import styles from './Practice.module.css';

type FeedbackType = 'correct' | 'incorrect' | null;

interface AnswerInputProps {
  userInput: string;
  onInputChange: (value: string) => void;
  onSubmit: () => void;
  onReplay: () => void;
  feedback: FeedbackType;
  score: number;
  answersCount: number;
  correctWord?: string;
  userAnswer?: string;
  inputRef?: Ref<HTMLInputElement>;
}

export function AnswerInput({
  userInput,
  onInputChange,
  onSubmit,
  onReplay,
  feedback,
  score,
  answersCount,
  correctWord,
  userAnswer,
  inputRef,
}: AnswerInputProps) {
  return (
    <>
      <div className={styles.scoreDisplay}>
        Score: {score}/{answersCount}
      </div>

      <div className={styles.practiceArea}>
        <button onClick={onReplay} className={styles.replayButton}>
          🔊 Replay Word
        </button>

        <input
          ref={inputRef}
          type="text"
          value={userInput}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyPress={(e) => handleEnterKey(e, onSubmit)}
          placeholder="Type the word you heard"
          className={styles.input}
          disabled={feedback !== null}
          autoFocus
        />

        <button
          onClick={onSubmit}
          className={styles.submitButton}
          disabled={feedback !== null}
        >
          Submit
        </button>

        {feedback && (
          <div className={feedback === 'correct' ? styles.correct : styles.incorrect}>
            {feedback === 'correct' ? (
              <>
                <div className={styles.icon}>✓</div>
                <div className={styles.message}>Correct!</div>
              </>
            ) : (
              <>
                <div className={styles.icon}>✗</div>
                <div className={styles.message}>Incorrect</div>
                {correctWord && userAnswer && (
                  <CharacterComparison
                    correctWord={correctWord}
                    userAnswer={userAnswer}
                  />
                )}
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}
