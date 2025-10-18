// ABOUTME: Character-by-character comparison display component for practice feedback
// ABOUTME: Shows correct word and user answer with color-coded character matching
import { compareAnswers } from '../../services/practiceLogic';
import { getCharacterClassName } from '../../utils/characterComparison';
import styles from './Practice.module.css';

interface CharacterComparisonProps {
  correctWord: string;
  userAnswer: string;
}

export function CharacterComparison({
  correctWord,
  userAnswer
}: CharacterComparisonProps) {
  const comparison = compareAnswers(correctWord, userAnswer);
  const correct = correctWord.toLowerCase();
  const user = userAnswer.toLowerCase();

  return (
    <div className={styles.characterComparison}>
      <div className={styles.comparisonRow}>
        <span className={styles.label}>Correct:</span>
        <div className={styles.characters}>
          {correct.split('').map((char, idx) => (
            <span
              key={idx}
              className={getCharacterClassName(comparison[idx], styles)}
            >
              {char}
            </span>
          ))}
        </div>
      </div>
      <div className={styles.comparisonRow}>
        <span className={styles.label}>Your answer:</span>
        <div className={styles.characters}>
          {user.split('').map((char, idx) => (
            <span
              key={idx}
              className={getCharacterClassName(comparison[idx], styles)}
            >
              {char}
            </span>
          ))}
          {comparison.slice(user.length).map((match, idx) => (
            match === 'missing' && (
              <span key={user.length + idx} className={getCharacterClassName('missing', styles)}>
                _
              </span>
            )
          ))}
        </div>
      </div>
    </div>
  );
}
