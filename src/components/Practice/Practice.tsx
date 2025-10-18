// ABOUTME: Practice component for vocabulary learning sessions with TTS playback and feedback.
// ABOUTME: Manages 10-word sessions, answer validation, scoring, and character-by-character comparison.
import { useState, useEffect, useCallback, useRef } from 'react';
import lottie, { AnimationItem } from 'lottie-web';
import { getRandomWords, getWordCount } from '../../services/database';
import { Word, PracticeWord } from '../../types';
import { speechService } from '../../services/speech';
import { soundEffectsService } from '../../services/soundEffects';
import { isAnswerCorrect, calculateScore, compareAnswers } from '../../services/practiceLogic';
import goodAnimation from '../../assets/animations/good.json';
import badAnimation from '../../assets/animations/bad.json';
import winnerOkAnimation from '../../assets/animations/winner-ok.json';
import winnerPerfectAnimation from '../../assets/animations/winner-perferct.json';
import styles from './Practice.module.css';

const WORDS_PER_SESSION = 10;
const CORRECT_FEEDBACK_DELAY_MS = 1000;
const INCORRECT_FEEDBACK_DELAY_MS = 3000;

type FeedbackType = 'correct' | 'incorrect' | null;

interface ConfettiAnimationProps {
  top: number;
  left: number;
  onComplete: () => void;
  animationData: unknown;
}

function ConfettiAnimation({ top, left, onComplete, animationData }: ConfettiAnimationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<AnimationItem | null>(null);

  useEffect(() => {
    if (containerRef.current) {
      animRef.current = lottie.loadAnimation({
        container: containerRef.current,
        renderer: 'canvas',
        loop: false,
        autoplay: true,
        animationData: animationData,
      });

      animRef.current.addEventListener('complete', onComplete);

      return () => {
        animRef.current?.destroy();
      };
    }
    // onComplete intentionally omitted from deps to prevent animation restart on re-renders
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={containerRef}
      className={styles.confettiOverlay}
      style={{
        top: `${top}%`,
        left: `${left}%`,
      }}
    />
  );
}

export function Practice() {
  const [sessionWords, setSessionWords] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<PracticeWord[]>([]);
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState<FeedbackType>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [confettiInstances, setConfettiInstances] = useState<Array<{ id: number; top: number; left: number; animationData: unknown }>>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const confettiNextId = useRef(0);

  const playWord = useCallback(async (word: string) => {
    try {
      await speechService.speak(word);
    } catch (err) {
      console.error('Speech error:', err);
    }
  }, []);

  const startSession = useCallback(async () => {
    setIsLoading(true);

    const wordCount = await getWordCount();
    if (wordCount === 0) {
      setIsLoading(false);
      return;
    }

    const words = await getRandomWords(WORDS_PER_SESSION);
    setSessionWords(words);
    setCurrentIndex(0);
    setAnswers([]);
    setUserInput('');
    setFeedback(null);
    setSessionStarted(false);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    startSession();
  }, [startSession]);

  useEffect(() => {
    if (sessionStarted && feedback === null && inputRef.current) {
      inputRef.current.focus();
    }
  }, [sessionStarted, feedback]);

  useEffect(() => {
    if (feedback === 'correct' || feedback === 'incorrect') {
      // Randomize position: 30-70% from top, 30-70% from left
      const randomTop = 30 + Math.random() * 40;
      const randomLeft = 30 + Math.random() * 40;
      const newConfetti = {
        id: confettiNextId.current++,
        top: randomTop,
        left: randomLeft,
        animationData: feedback === 'correct' ? goodAnimation : badAnimation,
      };
      setConfettiInstances(prev => [...prev, newConfetti]);
    }
  }, [feedback]);

  useEffect(() => {
    const isSessionComplete = answers.length === sessionWords.length &&
                               sessionWords.length > 0 &&
                               feedback === null;

    if (!isSessionComplete) return;

    soundEffectsService.play('summary').catch(err => {
      console.error('Sound effect error:', err);
    });

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        startSession();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [answers.length, sessionWords.length, feedback, startSession]);

  const handleStart = async () => {
    setSessionStarted(true);
    try {
      await soundEffectsService.play('start');
    } catch (err) {
      console.error('Sound effect error:', err);
    }
    if (sessionWords[currentIndex]) {
      playWord(sessionWords[currentIndex].word);
    }
  };

  const handleReplay = () => {
    if (sessionWords[currentIndex]) {
      playWord(sessionWords[currentIndex].word);
    }
  };

  const handleSubmit = () => {
    if (!userInput.trim() || feedback) return;

    const currentWord = sessionWords[currentIndex];
    const correct = isAnswerCorrect(currentWord.word, userInput);

    const practiceWord: PracticeWord = {
      word: currentWord,
      userAnswer: userInput,
      isCorrect: correct
    };

    const newAnswers = [...answers, practiceWord];
    setAnswers(newAnswers);
    setFeedback(correct ? 'correct' : 'incorrect');

    soundEffectsService.play(correct ? 'good' : 'bad').catch(err => {
      console.error('Sound effect error:', err);
    });

    const delayMs = correct ? CORRECT_FEEDBACK_DELAY_MS : INCORRECT_FEEDBACK_DELAY_MS;
    setTimeout(() => {
      setFeedback(null);
      setUserInput('');

      if (currentIndex + 1 < sessionWords.length) {
        setCurrentIndex(currentIndex + 1);
        playWord(sessionWords[currentIndex + 1].word);
      }
    }, delayMs);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const renderCharacterComparison = (correctWord: string, userAnswer: string) => {
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
                className={`${styles.char} ${
                  comparison[idx] === 'match' ? styles.charMatch :
                  comparison[idx] === 'missing' ? styles.charMissing :
                  styles.charWrong
                }`}
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
                className={`${styles.char} ${
                  comparison[idx] === 'match' ? styles.charMatch :
                  comparison[idx] === 'extra' ? styles.charExtra :
                  styles.charWrong
                }`}
              >
                {char}
              </span>
            ))}
            {comparison.slice(user.length).map((match, idx) => (
              match === 'missing' && (
                <span key={user.length + idx} className={`${styles.char} ${styles.charMissing}`}>
                  _
                </span>
              )
            ))}
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return <div className={styles.container}>Loading...</div>;
  }

  if (sessionWords.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <p>No words available for practice.</p>
          <p>Please add some words in the Manage Words tab first.</p>
        </div>
      </div>
    );
  }

  const isSessionComplete = answers.length === sessionWords.length &&
                            sessionWords.length > 0 &&
                            feedback === null;

  if (isSessionComplete) {
    const score = calculateScore(answers);
    const scorePercentage = (score / sessionWords.length) * 100;
    const showWinnerOk = scorePercentage >= 60 && scorePercentage < 90;
    const showWinnerPerfect = scorePercentage >= 90;

    return (
      <div className={styles.container}>
        <div className={styles.summary}>
          <h2>Session Complete!</h2>
          <div className={styles.score}>
            <span className={styles.scoreNumber}>{score}</span>
            <span> out of </span>
            <span className={styles.scoreNumber}>{sessionWords.length}</span>
          </div>
          <button onClick={startSession} className={styles.restartButton}>
            Restart
          </button>
        </div>
        {showWinnerOk && (
          <ConfettiAnimation
            top={50}
            left={50}
            animationData={winnerOkAnimation}
            onComplete={() => {}}
          />
        )}
        {showWinnerPerfect && (
          <ConfettiAnimation
            top={50}
            left={50}
            animationData={winnerPerfectAnimation}
            onComplete={() => {}}
          />
        )}
      </div>
    );
  }

  const score = calculateScore(answers);
  const lastAnswer = answers[answers.length - 1];

  if (!sessionStarted) {
    return (
      <div className={styles.container}>
        <div className={styles.startPrompt}>
          <h2>Ready to Practice?</h2>
          <p>Click Start to hear the first word.</p>
          <button onClick={handleStart} className={styles.startButton}>
            Start Practice
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.scoreDisplay}>
        Score: {score}/{answers.length}
      </div>

      <div className={styles.practiceArea}>
        <button onClick={handleReplay} className={styles.replayButton}>
          🔊 Replay Word
        </button>

        <input
          ref={inputRef}
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type the word you heard"
          className={styles.input}
          disabled={feedback !== null}
          autoFocus
        />

        <button
          onClick={handleSubmit}
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
                {renderCharacterComparison(lastAnswer.word.word, lastAnswer.userAnswer)}
              </>
            )}
          </div>
        )}
      </div>

      {confettiInstances.map(instance => (
        <ConfettiAnimation
          key={instance.id}
          top={instance.top}
          left={instance.left}
          animationData={instance.animationData}
          onComplete={() => {
            setConfettiInstances(prev => prev.filter(c => c.id !== instance.id));
          }}
        />
      ))}
    </div>
  );
}
