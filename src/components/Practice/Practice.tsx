// ABOUTME: Practice component for vocabulary learning sessions with TTS playback and feedback.
// ABOUTME: Manages 10-word sessions, answer validation, scoring, and character-by-character comparison.
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import lottie, { AnimationItem } from 'lottie-web';
import { getRandomWords, getWordCount } from '../../services/database';
import { Word, PracticeWord } from '../../types';
import { speechService } from '../../services/speech';
import { soundEffectsService } from '../../services/soundEffects';
import { isAnswerCorrect, calculateScore } from '../../services/practiceLogic';
import { handleEnterKey } from '../../utils/keyboard';
import { CharacterComparison } from './CharacterComparison';
import goodAnimation from '../../assets/animations/good.json';
import badAnimation from '../../assets/animations/bad.json';
import winnerOkAnimation from '../../assets/animations/winner-ok.json';
import winnerPerfectAnimation from '../../assets/animations/winner-perferct.json';
import styles from './Practice.module.css';

const WORDS_PER_SESSION = 10;
const CORRECT_FEEDBACK_DELAY_MS = 1000;
const INCORRECT_FEEDBACK_DELAY_MS = 3000;
const CONFETTI_MIN_POSITION = 30;
const CONFETTI_POSITION_RANGE = 40;
const CENTER_POSITION = 50;
const GOOD_SCORE_THRESHOLD = 60;
const PERFECT_SCORE_THRESHOLD = 90;

type FeedbackType = 'correct' | 'incorrect' | null;

interface ConfettiAnimationProps {
  top: number;
  left: number;
  onComplete?: () => void;
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

      if (onComplete) {
        animRef.current.addEventListener('complete', onComplete);
      }

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

  const isSessionComplete = useMemo(() => {
    return answers.length === sessionWords.length &&
           sessionWords.length > 0 &&
           feedback === null;
  }, [answers.length, sessionWords.length, feedback]);

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
      const randomTop = CONFETTI_MIN_POSITION + Math.random() * CONFETTI_POSITION_RANGE;
      const randomLeft = CONFETTI_MIN_POSITION + Math.random() * CONFETTI_POSITION_RANGE;
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
    if (!isSessionComplete) return;

    const score = calculateScore(answers);
    const scorePercentage = (score / sessionWords.length) * 100;

    if (scorePercentage >= GOOD_SCORE_THRESHOLD) {
      soundEffectsService.play('summary').catch(err => {
        console.error('Sound effect error:', err);
      });
    }

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        startSession();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isSessionComplete, answers, sessionWords.length, startSession]);

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

  if (isSessionComplete) {
    const score = calculateScore(answers);
    const scorePercentage = (score / sessionWords.length) * 100;
    const showWinnerOk = scorePercentage >= GOOD_SCORE_THRESHOLD && scorePercentage < PERFECT_SCORE_THRESHOLD;
    const showWinnerPerfect = scorePercentage >= PERFECT_SCORE_THRESHOLD;

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
          onKeyPress={(e) => handleEnterKey(e, handleSubmit)}
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
                <CharacterComparison
                  correctWord={lastAnswer.word.word}
                  userAnswer={lastAnswer.userAnswer}
                />
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
