// ABOUTME: Component for user input and feedback during practice sessions.
// ABOUTME: Handles text input, submission, replay, and displays correct/incorrect feedback with character comparison.
import { Ref } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();

  return (
    <>
      <div className={styles.scoreDisplay}>
        {t('practice.answer.score', { score, total: answersCount })}
      </div>

      <div className={styles.practiceArea}>
        <button onClick={onReplay} className={styles.replayButton}>
          {t('practice.answer.replayButton')}
        </button>

        <input
          ref={inputRef}
          type="text"
          value={userInput}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyPress={(e) => handleEnterKey(e, onSubmit)}
          placeholder={t('practice.answer.placeholder')}
          className={styles.input}
          disabled={feedback !== null}
          autoFocus
        />

        <button
          onClick={onSubmit}
          className={styles.submitButton}
          disabled={feedback !== null}
        >
          {t('practice.answer.submitButton')}
        </button>

        {feedback && (
          <div className={feedback === 'correct' ? styles.correct : styles.incorrect}>
            {feedback === 'correct' ? (
              <>
                <div className={styles.icon}>{t('practice.answer.correctIcon')}</div>
                <div className={styles.message}>{t('practice.answer.correct')}</div>
              </>
            ) : (
              <>
                <div className={styles.icon}>{t('practice.answer.incorrectIcon')}</div>
                <div className={styles.message}>{t('practice.answer.incorrect')}</div>
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
