// ABOUTME: Component that displays practice session completion screen with score and restart option.
// ABOUTME: Shows winner animations based on score percentage (60%+ good, 90%+ perfect).
import { useTranslation } from 'react-i18next';
import { ConfettiAnimation } from './ConfettiAnimation';
import winnerOkAnimation from '../../assets/animations/winner-ok.json';
import winnerPerfectAnimation from '../../assets/animations/winner-perfect.json';
import styles from './Practice.module.css';

const CENTER_POSITION = 50;
const GOOD_SCORE_THRESHOLD = 60;
const PERFECT_SCORE_THRESHOLD = 90;

interface SessionSummaryProps {
  score: number;
  total: number;
  onRestart: () => void;
}

export function SessionSummary({ score, total, onRestart }: SessionSummaryProps) {
  const { t } = useTranslation();
  const scorePercentage = (score / total) * 100;
  const showWinnerOk = scorePercentage >= GOOD_SCORE_THRESHOLD && scorePercentage < PERFECT_SCORE_THRESHOLD;
  const showWinnerPerfect = scorePercentage >= PERFECT_SCORE_THRESHOLD;

  return (
    <div className={styles.container}>
      <div className={styles.summary}>
        <h2>{t('practice.summary.heading')}</h2>
        <div className={styles.score}>
          <span className={styles.scoreNumber}>{score}</span>
          <span>{t('practice.summary.scoreOf')}</span>
          <span className={styles.scoreNumber}>{total}</span>
        </div>
        <button onClick={onRestart} className={styles.restartButton}>
          {t('practice.summary.restartButton')}
        </button>
      </div>
      {showWinnerOk && (
        <ConfettiAnimation
          top={CENTER_POSITION}
          left={CENTER_POSITION}
          animationData={winnerOkAnimation}
        />
      )}
      {showWinnerPerfect && (
        <ConfettiAnimation
          top={CENTER_POSITION}
          left={CENTER_POSITION}
          animationData={winnerPerfectAnimation}
        />
      )}
    </div>
  );
}
